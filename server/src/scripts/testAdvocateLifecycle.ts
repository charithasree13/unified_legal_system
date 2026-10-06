process.env.USE_MOCK_DB = 'true';

import dotenv from 'dotenv';
dotenv.config();

import { User, Advocate, AuditLog } from '../models/Schemas';
import { googleAuth, register, login } from '../controllers/authController';
import { getAdvocates, getPendingAdvocates, updateAdvocate, deleteAdvocate, verifyAdvocate, selfOnboardAdvocateProfile } from '../controllers/advocateController';

function createMockRes() {
  const res: any = {};
  res.statusCode = 200;
  res.data = null;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: any) => {
    res.data = payload;
    return res;
  };
  return res;
}

const validHeaderB64 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';

async function runTestSuite() {
  console.log('🚀 Running Complete Security & Advocate Lifecycle Verification Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: User Google Signup (Client Role)
    // -------------------------------------------------------------
    const userSub = 'google_sub_client_test_101';
    const userPayload = Buffer.from(JSON.stringify({
      sub: userSub,
      email: 'client.user@example.com',
      email_verified: true,
      name: 'Test Client User'
    })).toString('base64');
    const userToken = `${validHeaderB64}.${userPayload}.sig`;

    const reqClient: any = { body: { credential: userToken, accountType: 'Client' }, ip: '127.0.0.1' };
    const resClient = createMockRes();
    await googleAuth(reqClient, resClient);

    assert(
      resClient.statusCode === 200 && resClient.data?.user?.role === 'Client' && resClient.data?.user?.isVerified === true,
      'TEST 1: User Google Signup creates Client account immediately authenticated'
    );

    const clientUserId = resClient.data?.user?.id;

    // -------------------------------------------------------------
    // TEST 2: Advocate Google Signup (Must NOT immediately verify Advocate access)
    // -------------------------------------------------------------
    const advSub = 'google_sub_advocate_test_202';
    const advPayload = Buffer.from(JSON.stringify({
      sub: advSub,
      email: 'advocate.pending@court.org',
      email_verified: true,
      name: 'Advocate Pending Google'
    })).toString('base64');
    const advToken = `${validHeaderB64}.${advPayload}.sig`;

    const reqAdvGoogle: any = { body: { credential: advToken, accountType: 'Advocate' }, ip: '127.0.0.1' };
    const resAdvGoogle = createMockRes();
    await googleAuth(reqAdvGoogle, resAdvGoogle);

    assert(
      resAdvGoogle.statusCode === 200 && 
      resAdvGoogle.data?.requiresAdvocateDetails === true && 
      resAdvGoogle.data?.user?.isVerified === false &&
      resAdvGoogle.data?.user?.verificationStatus === 'PENDING',
      'TEST 2: Advocate Google Signup requires Advocate details and sets status to PENDING (unverified)'
    );

    const pendingAdvUserId = resAdvGoogle.data?.user?.id;

    // -------------------------------------------------------------
    // TEST 3: Submit Advocate Registration Details (Pending Verification Status)
    // -------------------------------------------------------------
    const reqOnboard: any = {
      user: { id: pendingAdvUserId, email: 'advocate.pending@court.org', role: 'Advocate', name: 'Advocate Pending Google', googleSub: advSub },
      body: {
        name: 'Advocate Pending Google',
        phone: '9876500001',
        email: 'advocate.pending@court.org',
        enrollmentNumber: 'AP/999/2024',
        enrollmentDate: '2024-01-15',
        specialization: ['Civil Litigation'],
        court: ['High Court'],
        city: 'Madanapalle',
        state: 'Andhra Pradesh',
        experience: 5
      },
      ip: '127.0.0.1'
    };
    const resOnboard = createMockRes();
    await selfOnboardAdvocateProfile(reqOnboard, resOnboard);

    assert(
      resOnboard.statusCode === 200 && 
      resOnboard.data?.advocate?.isVerified === false && 
      resOnboard.data?.advocate?.verificationStatus === 'PENDING',
      'TEST 3: Submitted Advocate details remain PENDING (isVerified: false) until Admin approval'
    );

    const createdAdvId = resOnboard.data?.advocate?._id;

    // -------------------------------------------------------------
    // TEST 3B: PENDING Advocate Login IS ALLOWED
    // -------------------------------------------------------------
    const reqPendingLogin: any = { body: { credential: advToken, accountType: 'Advocate' }, ip: '127.0.0.1' };
    const resPendingLogin = createMockRes();
    await googleAuth(reqPendingLogin, resPendingLogin);

    assert(
      resPendingLogin.statusCode === 200 && 
      resPendingLogin.data?.success === true && 
      resPendingLogin.data?.user?.verificationStatus === 'PENDING',
      'TEST 3B: PENDING Advocate CAN log in successfully (Login = YES, Account = YES, Directory = NO)'
    );

    // -------------------------------------------------------------
    // TEST 4: Public Advocate Directory excludes Pending Advocates
    // -------------------------------------------------------------
    const reqDir: any = { query: { search: 'Advocate Pending Google' } };
    const resDir = createMockRes();
    await getAdvocates(reqDir, resDir);

    const isPendingInDirectory = resDir.data?.advocates?.some((a: any) => a.email === 'advocate.pending@court.org');
    assert(
      !isPendingInDirectory,
      'TEST 4: Public Advocate Directory excludes unverified/pending Advocate applications'
    );

    // -------------------------------------------------------------
    // TEST 5: Normal User attempts Admin verification endpoint -> DENIED (403)
    // -------------------------------------------------------------
    const reqUnauthVerify: any = {
      user: { id: clientUserId, role: 'Client', name: 'Client User' },
      params: { id: createdAdvId },
      body: { status: 'APPROVED' }
    };
    const resUnauthVerify = createMockRes();
    await verifyAdvocate(reqUnauthVerify, resUnauthVerify);

    assert(
      resUnauthVerify.statusCode === 403,
      'TEST 5: Normal User attempting Admin verification endpoint is DENIED (403)'
    );

    // -------------------------------------------------------------
    // TEST 6: Normal User attempts to DELETE Advocate profile -> DENIED (403)
    // -------------------------------------------------------------
    const reqUserDelete: any = {
      user: { id: clientUserId, role: 'Client', name: 'Client User' },
      params: { id: createdAdvId }
    };
    const resUserDelete = createMockRes();
    await deleteAdvocate(reqUserDelete, resUserDelete);

    assert(
      resUserDelete.statusCode === 403,
      'TEST 6: Normal User attempting to DELETE Advocate profile is DENIED (403)'
    );

    // -------------------------------------------------------------
    // TEST 7: Advocate A attempts to edit Advocate B -> DENIED (403)
    // -------------------------------------------------------------
    const advocateB = await Advocate.create({
      name: 'Advocate B',
      email: 'advocateB@court.org',
      phone: '9876599999',
      enrollmentNumber: 'AP/888/2020',
      isVerified: true,
      verificationStatus: 'APPROVED'
    });

    const reqAdvEditOther: any = {
      user: { id: pendingAdvUserId, email: 'advocate.pending@court.org', role: 'Advocate', name: 'Advocate A' },
      params: { id: advocateB._id },
      body: { name: 'Hacked Name' }
    };
    const resAdvEditOther = createMockRes();
    await updateAdvocate(reqAdvEditOther, resAdvEditOther);

    assert(
      resAdvEditOther.statusCode === 403,
      'TEST 7: Advocate A attempting to edit Advocate B is DENIED (403)'
    );

    // -------------------------------------------------------------
    // TEST 8: Advocate A attempts to delete own profile -> DENIED (403)
    // -------------------------------------------------------------
    const reqAdvSelfDelete: any = {
      user: { id: pendingAdvUserId, email: 'advocate.pending@court.org', role: 'Advocate', name: 'Advocate A' },
      params: { id: createdAdvId }
    };
    const resAdvSelfDelete = createMockRes();
    await deleteAdvocate(reqAdvSelfDelete, resAdvSelfDelete);

    assert(
      resAdvSelfDelete.statusCode === 403,
      'TEST 8: Advocate attempting to delete own profile is DENIED (403 - Only Admin can delete)'
    );

    // -------------------------------------------------------------
    // TEST 9: Admin reviews pending Advocate applications
    // -------------------------------------------------------------
    const reqPendingList: any = { user: { id: 'admin1', role: 'Admin', name: 'Admin' } };
    const resPendingList = createMockRes();
    await getPendingAdvocates(reqPendingList, resPendingList);

    const foundInPending = resPendingList.data?.advocates?.some((a: any) => a.email === 'advocate.pending@court.org');
    assert(
      resPendingList.statusCode === 200 && foundInPending,
      'TEST 9: Admin can fetch and review pending Advocate applications'
    );

    // -------------------------------------------------------------
    // TEST 10: Admin approves pending Advocate
    // -------------------------------------------------------------
    const reqApprove: any = {
      user: { id: 'admin1', role: 'Admin', name: 'Admin' },
      params: { id: createdAdvId },
      body: { status: 'APPROVED' }
    };
    const resApprove = createMockRes();
    await verifyAdvocate(reqApprove, resApprove);

    assert(
      resApprove.statusCode === 200 && resApprove.data?.advocate?.isVerified === true,
      'TEST 10: Admin approval sets Advocate status to APPROVED (isVerified: true)'
    );

    // -------------------------------------------------------------
    // TEST 11: Approved Advocate appears in Advocate Directory
    // -------------------------------------------------------------
    const reqDir2: any = { query: { search: 'Advocate Pending Google' } };
    const resDir2 = createMockRes();
    await getAdvocates(reqDir2, resDir2);

    const isApprovedInDirectory = resDir2.data?.advocates?.some((a: any) => a.email === 'advocate.pending@court.org');
    assert(
      isApprovedInDirectory,
      'TEST 11: Approved Advocate appears in the public Advocate Directory'
    );

    // -------------------------------------------------------------
    // TEST 11B: Admin Rejects Advocate -> Login blocked (403), Directory excluded
    // -------------------------------------------------------------
    const reqReject: any = {
      user: { id: 'admin1', role: 'Admin', name: 'Admin' },
      params: { id: createdAdvId },
      body: { status: 'REJECTED', rejectionReason: 'Credentials mismatch' }
    };
    const resReject = createMockRes();
    await verifyAdvocate(reqReject, resReject);

    assert(
      resReject.statusCode === 200 && resReject.data?.advocate?.verificationStatus === 'REJECTED',
      'TEST 11B: Admin rejection sets Advocate status to REJECTED'
    );

    const reqRejectedLogin: any = { body: { credential: advToken, accountType: 'Advocate' }, ip: '127.0.0.1' };
    const resRejectedLogin = createMockRes();
    await googleAuth(reqRejectedLogin, resRejectedLogin);

    assert(
      resRejectedLogin.statusCode === 403 && resRejectedLogin.data?.verificationStatus === 'REJECTED',
      'TEST 11C: REJECTED Advocate login is BLOCKED (403 Forbidden)'
    );

    const reqDir3: any = { query: { search: 'Advocate Pending Google' } };
    const resDir3 = createMockRes();
    await getAdvocates(reqDir3, resDir3);

    const isRejectedInDirectory = resDir3.data?.advocates?.some((a: any) => a.email === 'advocate.pending@court.org');
    assert(
      !isRejectedInDirectory,
      'TEST 11D: REJECTED Advocate does NOT appear in Advocate Directory'
    );

    // -------------------------------------------------------------
    // TEST 12: Admin deletes Advocate profile -> ALLOWED
    // -------------------------------------------------------------
    const reqAdminDelete: any = {
      user: { id: 'admin1', role: 'Admin', name: 'Admin' },
      params: { id: createdAdvId }
    };
    const resAdminDelete = createMockRes();
    await deleteAdvocate(reqAdminDelete, resAdminDelete);

    assert(
      resAdminDelete.statusCode === 200,
      'TEST 12: Admin deleting Advocate profile is ALLOWED'
    );

    // Cleanup
    await User.findByIdAndDelete(clientUserId);
    await User.findByIdAndDelete(pendingAdvUserId);

    console.log(`\n📊 Final Test Summary: ${passed} Passed, ${failed} Failed`);
    if (failed === 0) {
      console.log('🎉 ALL SECURITY & ADVOCATE LIFECYCLE TESTS PASSED!\n');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test Suite Execution Error:', error);
    process.exit(1);
  }
}

runTestSuite();
