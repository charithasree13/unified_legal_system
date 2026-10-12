import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, RefreshToken, AuditLog } from '../models/Schemas';
import { register, login } from '../controllers/authController';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

// Mock Express Request & Response helpers
function createMockReqRes(body: any = {}, headers: any = {}) {
  let statusCode = 200;
  let responseData: any = null;

  const req: any = {
    body,
    headers,
    ip: '127.0.0.1'
  };

  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    }
  };

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getResponseData: () => responseData
  };
}

async function runTests() {
  console.log('🚀 Running Comprehensive User/Client Authentication & Role Access Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  };

  const timestamp = Date.now();
  const testClientPhone = `98765${String(timestamp).slice(-5)}`;
  const testClientEmail = `client_${timestamp}@testlegal.org`;
  const testPassword = 'SecurePassword123!';

  // =========================================================================
  // TEST 1: User/Client Registration Validations (Missing Fields)
  // =========================================================================
  console.log('[Test 1] User/Client Registration Validation - Missing Fields');
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      name: '',
      phone: testClientPhone,
      password: testPassword,
      confirmPassword: testPassword,
      role: 'Client'
    });
    await register(req, res);
    assert(getStatusCode() === 400, 'Rejects registration with empty name (400)');
    assert(getResponseData()?.success === false, 'Returns success: false');
  }

  // =========================================================================
  // TEST 2: User/Client Registration Password Mismatch
  // =========================================================================
  console.log('\n[Test 2] User/Client Registration - Password Mismatch');
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      name: 'Ravi Verma',
      phone: testClientPhone,
      password: testPassword,
      confirmPassword: 'WrongPassword!',
      role: 'Client'
    });
    await register(req, res);
    assert(getStatusCode() === 400, 'Rejects registration when passwords do not match (400)');
    assert(getResponseData()?.message === 'Passwords do not match.', 'Clear password mismatch message');
  }

  // =========================================================================
  // TEST 3: User/Client Registration Invalid Phone Number
  // =========================================================================
  console.log('\n[Test 3] User/Client Registration - Invalid Phone Number');
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      name: 'Ravi Verma',
      phone: '12345',
      password: testPassword,
      confirmPassword: testPassword,
      role: 'Client'
    });
    await register(req, res);
    assert(getStatusCode() === 400, 'Rejects invalid phone number (400)');
  }

  // =========================================================================
  // TEST 4: Successful User/Client Registration -> Immediate Token Session
  // =========================================================================
  console.log('\n[Test 4] Successful User/Client Registration -> Immediate Token Session');
  let registeredUserId = '';
  let registeredAccessToken = '';
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      name: 'Ravi Verma',
      phone: testClientPhone,
      email: testClientEmail,
      password: testPassword,
      confirmPassword: testPassword,
      role: 'Client'
    });
    await register(req, res);
    const data = getResponseData();

    assert(getStatusCode() === 201, 'Returns HTTP 201 Created');
    assert(data?.success === true, 'Registration succeeded');
    assert(typeof data?.accessToken === 'string' && data.accessToken.length > 20, 'Issues valid JWT accessToken');
    assert(typeof data?.refreshToken === 'string' && data.refreshToken.length > 20, 'Issues valid JWT refreshToken');
    assert(data?.user?.role === 'Client', 'Assigned role is Client in response');
    assert(data?.user?.name === 'Ravi Verma', 'Correct user name returned');
    assert(data?.user?.isVerified === true, 'User account is verified upon creation');
    assert(data?.user?.verificationStatus === 'APPROVED', 'Verification status is APPROVED');

    registeredUserId = data?.user?.id;
    registeredAccessToken = data?.accessToken;

    // Verify user in Database
    const dbUser = await User.findById(registeredUserId);
    assert(!!dbUser, 'User record created in database');
    assert(dbUser?.role === 'Client', 'Database user role is Client');
    assert(dbUser?.password !== testPassword, 'Password is salt-hashed in DB, never plaintext');
    const isPassValid = await bcrypt.compare(testPassword, dbUser?.password);
    assert(isPassValid, 'Bcrypt hash correctly verifies against password');
  }

  // =========================================================================
  // TEST 5: Duplicate User/Client Account Rejection
  // =========================================================================
  console.log('\n[Test 5] Duplicate User/Client Account Rejection');
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      name: 'Duplicate Ravi',
      phone: testClientPhone,
      email: testClientEmail,
      password: testPassword,
      confirmPassword: testPassword,
      role: 'Client'
    });
    await register(req, res);
    assert(getStatusCode() === 400, 'Rejects duplicate phone/email registration (400)');
    assert(getResponseData()?.message?.includes('already exists'), 'Clear duplicate account error message');
  }

  // =========================================================================
  // TEST 6: Advocate Registration Keeps PENDING Approval Workflow
  // =========================================================================
  console.log('\n[Test 6] Advocate Registration Preserves PENDING Approval Workflow');
  const advPhone = `98765${String(timestamp + 1).slice(-5)}`;
  const advEmail = `adv_${timestamp}@court.org`;
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      name: 'Advocate Suresh Rao',
      phone: advPhone,
      email: advEmail,
      password: testPassword,
      confirmPassword: testPassword,
      role: 'Advocate',
      enrollmentNumber: `AP/${timestamp}/2024`
    });
    await register(req, res);
    const data = getResponseData();

    assert(getStatusCode() === 201, 'Advocate registered with HTTP 201');
    assert(!data?.accessToken, 'Does NOT issue auto-login accessToken for pending advocate');
    assert(data?.message?.includes('pending verification'), 'Clear pending admin verification message');

    const dbAdvUser = await User.findOne({ email: advEmail });
    assert(dbAdvUser?.role === 'Advocate', 'User role is Advocate in DB');
    assert(dbAdvUser?.isVerified === false, 'Advocate isVerified is false pending Admin approval');
    assert(dbAdvUser?.verificationStatus === 'PENDING', 'Advocate verificationStatus is PENDING');
  }

  // =========================================================================
  // TEST 7: User/Client Login with Valid Credentials
  // =========================================================================
  console.log('\n[Test 7] User/Client Login with Valid Credentials');
  let loginAccessToken = '';
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      email: testClientEmail,
      password: testPassword
    });
    await login(req, res);
    const data = getResponseData();

    assert(getStatusCode() === 200, 'Login returns HTTP 200');
    assert(data?.success === true, 'Login marked successful');
    assert(typeof data?.accessToken === 'string', 'Login returns valid accessToken');
    assert(data?.user?.role === 'Client', 'Role fetched directly from database is Client');
    assert(data?.user?.email === testClientEmail, 'Matches authenticated user email');
    loginAccessToken = data?.accessToken;
  }

  // =========================================================================
  // TEST 8: User/Client Login with Phone Number
  // =========================================================================
  console.log('\n[Test 8] User/Client Login with Phone Number');
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      email: testClientPhone,
      password: testPassword
    });
    await login(req, res);
    const data = getResponseData();

    assert(getStatusCode() === 200, 'Phone login returns HTTP 200');
    assert(data?.user?.phone === testClientPhone, 'Logged in via phone number');
  }

  // =========================================================================
  // TEST 9: Login with Invalid Password
  // =========================================================================
  console.log('\n[Test 9] Login with Invalid Password');
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      email: testClientEmail,
      password: 'IncorrectPassword999!'
    });
    await login(req, res);
    assert(getStatusCode() === 400, 'Invalid password returns HTTP 400');
    assert(getResponseData()?.message === 'Invalid email or password.', 'Returns clear error: "Invalid email or password."');
  }

  // =========================================================================
  // TEST 10: Login with Nonexistent Account
  // =========================================================================
  console.log('\n[Test 10] Login with Nonexistent Account');
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      email: 'nonexistent_account_xyz@test.org',
      password: 'SomePassword123!'
    });
    await login(req, res);
    assert(getStatusCode() === 400, 'Nonexistent account returns HTTP 400');
    assert(getResponseData()?.message === 'Invalid email or password.', 'Returns standard generic error message');
  }

  // =========================================================================
  // TEST 11: Role Access Control - Client Restricted from Advocate Endpoints
  // =========================================================================
  console.log('\n[Test 11] Role Access Control - Client Denied from Advocate/Admin Endpoints');
  {
    const { requireAdminOrAdvocate, requireAdminOrAdvocateRole } = await import('../middleware/auth');
    
    // Create mock request with client token
    const clientUser = { id: registeredUserId, role: 'Client', name: 'Ravi Verma' };
    const mockClientReq: any = { user: clientUser };
    let clientDeniedStatus = 0;
    let clientDeniedMessage = '';
    const mockClientRes: any = {
      status: (code: number) => { clientDeniedStatus = code; return mockClientRes; },
      json: (d: any) => { clientDeniedMessage = d?.message || ''; return mockClientRes; }
    };
    let nextCalled = false;
    const mockNext = () => { nextCalled = true; };

    // Test requireAdminOrAdvocate
    await requireAdminOrAdvocate(mockClientReq, mockClientRes, mockNext);
    assert(clientDeniedStatus === 403, 'Client denied with HTTP 403 by requireAdminOrAdvocate');
    assert(!nextCalled, 'Next handler not called for Client');

    // Test requireAdminOrAdvocateRole
    clientDeniedStatus = 0;
    nextCalled = false;
    requireAdminOrAdvocateRole(mockClientReq, mockClientRes, mockNext);
    assert(clientDeniedStatus === 403, 'Client denied with HTTP 403 by requireAdminOrAdvocateRole');
    assert(!nextCalled, 'Next handler not called for Client on requireAdminOrAdvocateRole');

    // Test Advocate is ALLOWED by requireAdminOrAdvocateRole
    const advUser = { id: 'adv123', role: 'Advocate', name: 'Adv. Suresh' };
    const mockAdvReq: any = { user: advUser };
    let advNextCalled = false;
    requireAdminOrAdvocateRole(mockAdvReq, mockClientRes, () => { advNextCalled = true; });
    assert(advNextCalled, 'Advocate ALLOWED by requireAdminOrAdvocateRole');

    // Test Admin is ALLOWED
    const adminUser = { id: 'admin123', role: 'Admin', name: 'Chief Admin' };
    const mockAdminReq: any = { user: adminUser };
    let adminNextCalled = false;
    requireAdminOrAdvocateRole(mockAdminReq, mockClientRes, () => { adminNextCalled = true; });
    assert(adminNextCalled, 'Admin ALLOWED by requireAdminOrAdvocateRole');
  }

  console.log('\n=============================================================');
  console.log(`📊 Suite Results: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL USER/CLIENT AUTHENTICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
