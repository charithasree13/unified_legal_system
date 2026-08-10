process.env.USE_MOCK_DB = 'true';

import dotenv from 'dotenv';
dotenv.config();

import { User, Advocate, AuditLog, RefreshToken } from '../models/Schemas';
import { googleAuth, register } from '../controllers/authController';

// Helper mock response object
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

// Valid base64 header {"alg":"RS256","typ":"JWT"}
const validHeaderB64 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';

async function testSuite() {
  console.log('🚀 Running Google Authentication Backend Test Suite...\n');

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
    // Test 1: Missing credential validation
    // -------------------------------------------------------------
    const req1: any = { body: { accountType: 'Client' } };
    const res1 = createMockRes();
    await googleAuth(req1, res1);
    assert(res1.statusCode === 400 && res1.data?.success === false, 'Test 1: Reject missing Google credential');

    // -------------------------------------------------------------
    // Test 2: Invalid / malformed credential validation
    // -------------------------------------------------------------
    const req2: any = { body: { credential: 'invalid_token_string', accountType: 'Client' } };
    const res2 = createMockRes();
    await googleAuth(req2, res2);
    assert(res2.statusCode === 401 && res2.data?.success === false, 'Test 2: Reject malformed Google token');

    // -------------------------------------------------------------
    // Test 3: New User Google Signup (Client)
    // -------------------------------------------------------------
    const mockUserSub = 'google_sub_user_test_99999';
    const mockUserPayload = Buffer.from(JSON.stringify({
      sub: mockUserSub,
      email: 'john.google.user@example.com',
      email_verified: true,
      name: 'John Google User',
      picture: 'https://example.com/photo.jpg'
    })).toString('base64');
    const mockUserToken = `${validHeaderB64}.${mockUserPayload}.mock_signature`;

    const req3: any = { body: { credential: mockUserToken, accountType: 'Client' }, ip: '127.0.0.1' };
    const res3 = createMockRes();
    await googleAuth(req3, res3);

    assert(
      res3.statusCode === 200 && res3.data?.success === true && res3.data?.user?.role === 'Client',
      'Test 3: User Google Signup creates Client account',
      `User ID: ${res3.data?.user?.id}`
    );

    // Verify record in database
    const dbUser = await User.findOne({ googleSub: mockUserSub });
    assert(dbUser && dbUser.email === 'john.google.user@example.com', 'Test 3b: User persisted in DB with googleSub');

    // -------------------------------------------------------------
    // Test 4: Returning User Google Login
    // -------------------------------------------------------------
    const req4: any = { body: { credential: mockUserToken, accountType: 'Client' }, ip: '127.0.0.1' };
    const res4 = createMockRes();
    await googleAuth(req4, res4);

    assert(
      res4.statusCode === 200 && res4.data?.user?.id === dbUser._id,
      'Test 4: Returning Google Login finds existing database account without duplicates'
    );

    // -------------------------------------------------------------
    // Test 5: Role Security - User Google account attempting Advocate Login
    // -------------------------------------------------------------
    const req5: any = { body: { credential: mockUserToken, accountType: 'Advocate' }, ip: '127.0.0.1' };
    const res5 = createMockRes();
    await googleAuth(req5, res5);

    assert(
      res5.statusCode === 400 && res5.data?.message?.includes('registered as a Client'),
      'Test 5: Cross-Role Security blocks Client Google account from Advocate login'
    );

    // -------------------------------------------------------------
    // Test 6: New Advocate Google Signup
    // -------------------------------------------------------------
    const mockAdvSub = 'google_sub_advocate_test_88888';
    const mockAdvPayload = Buffer.from(JSON.stringify({
      sub: mockAdvSub,
      email: 'jane.advocate@court.org',
      email_verified: true,
      name: 'Advocate Jane Doe',
      picture: 'https://example.com/adv_photo.jpg'
    })).toString('base64');
    const mockAdvToken = `${validHeaderB64}.${mockAdvPayload}.mock_signature`;

    const req6: any = { body: { credential: mockAdvToken, accountType: 'Advocate' }, ip: '127.0.0.1' };
    const res6 = createMockRes();
    await googleAuth(req6, res6);

    assert(
      res6.statusCode === 200 && res6.data?.user?.role === 'Advocate',
      'Test 6: Advocate Google Signup creates Advocate account'
    );

    const dbAdvUser = await User.findOne({ googleSub: mockAdvSub });
    assert(dbAdvUser && dbAdvUser.isVerified === false, 'Test 6b: Advocate isVerified remains false (awaiting admin approval)');

    // -------------------------------------------------------------
    // Test 7: Advocate Google account attempting User Login
    // -------------------------------------------------------------
    const req7: any = { body: { credential: mockAdvToken, accountType: 'Client' }, ip: '127.0.0.1' };
    const res7 = createMockRes();
    await googleAuth(req7, res7);

    assert(
      res7.statusCode === 400 && res7.data?.message?.includes('registered as a Advocate'),
      'Test 7: Cross-Role Security blocks Advocate Google account from User login'
    );

    // -------------------------------------------------------------
    // Test 8: Password account conflict prevention
    // -------------------------------------------------------------
    // Create standard password account
    const regReq: any = {
      body: {
        name: 'Local Password User',
        phone: '9876543210',
        email: 'local.user@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'Client'
      },
      ip: '127.0.0.1'
    };
    const regRes = createMockRes();
    await register(regReq, regRes);

    // Attempt Google login with same email
    const conflictSub = 'google_sub_conflict_77777';
    const conflictPayload = Buffer.from(JSON.stringify({
      sub: conflictSub,
      email: 'local.user@example.com',
      email_verified: true,
      name: 'Conflict User'
    })).toString('base64');
    const conflictToken = `${validHeaderB64}.${conflictPayload}.mock_signature`;

    const req8: any = { body: { credential: conflictToken, accountType: 'Client' }, ip: '127.0.0.1' };
    const res8 = createMockRes();
    await googleAuth(req8, res8);

    assert(
      res8.statusCode === 400 && res8.data?.message?.includes('already exists'),
      'Test 8: Google login rejects collision with existing local password account'
    );

    // Cleanup mock data created in test
    await User.findByIdAndDelete(dbUser._id);
    await User.findByIdAndDelete(dbAdvUser._id);
    const localUser = await User.findOne({ email: 'local.user@example.com' });
    if (localUser) await User.findByIdAndDelete(localUser._id);

    console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed`);
    if (failed === 0) {
      console.log('🎉 ALL GOOGLE AUTHENTICATION TESTS PASSED SUCCESSFULLY!\n');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution error:', error);
    process.exit(1);
  }
}

testSuite();
