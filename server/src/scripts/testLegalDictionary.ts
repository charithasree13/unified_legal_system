import jwt from 'jsonwebtoken';
import http from 'http';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

function createTestToken(payload: { id: string; role: string; name: string; email?: string; isVerified?: boolean }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function makeRequest(path: string, method: string, token?: string, body?: any): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = rawData ? JSON.parse(rawData) : {};
          resolve({ statusCode: res.statusCode || 500, data: parsed });
        } catch {
          resolve({ statusCode: res.statusCode || 500, data: rawData });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 RUNNING COMPREHENSIVE LEGAL DICTIONARY TEST SUITE...\n');

  const clientToken = createTestToken({ id: 'user_client_1', role: 'Client', name: 'Client User' });
  const pendingAdvToken = createTestToken({ id: 'user_adv_pending_1', role: 'Advocate', name: 'Pending Advocate', isVerified: false });
  const approvedAdvToken = createTestToken({ id: 'user_adv_approved_1', role: 'Advocate', name: 'Approved Advocate', isVerified: true });
  const adminToken = createTestToken({ id: 'user_admin_1', role: 'Admin', name: 'System Admin' });

  // TEST 1: Guest Read Attempt
  console.log('--- TEST 1: Guest Read Attempt ---');
  const resGuest = await makeRequest('/api/dictionary', 'GET');
  console.log(`Status: ${resGuest.statusCode} (Expected: 401)`);

  // TEST 2: Client/Normal User Read Attempt
  console.log('\n--- TEST 2: Client/Normal User Read Attempt ---');
  const resClient = await makeRequest('/api/dictionary', 'GET', clientToken);
  console.log(`Status: ${resClient.statusCode} (Expected: 403)`);

  // TEST 3: Pending Advocate Read Attempt
  console.log('\n--- TEST 3: Pending Advocate Read Attempt ---');
  const resPendingAdv = await makeRequest('/api/dictionary', 'GET', pendingAdvToken);
  console.log(`Status: ${resPendingAdv.statusCode} (Expected: 200), Entries count: ${Array.isArray(resPendingAdv.data) ? resPendingAdv.data.length : 'N/A'}`);

  // TEST 4: Approved Advocate Read Attempt
  console.log('\n--- TEST 4: Approved Advocate Read Attempt ---');
  const resApprovedAdv = await makeRequest('/api/dictionary', 'GET', approvedAdvToken);
  console.log(`Status: ${resApprovedAdv.statusCode} (Expected: 200), Entries count: ${Array.isArray(resApprovedAdv.data) ? resApprovedAdv.data.length : 'N/A'}`);

  // TEST 5: Admin Read Attempt
  console.log('\n--- TEST 5: Admin Read Attempt ---');
  const resAdmin = await makeRequest('/api/dictionary', 'GET', adminToken);
  console.log(`Status: ${resAdmin.statusCode} (Expected: 200), Entries count: ${Array.isArray(resAdmin.data) ? resAdmin.data.length : 'N/A'}`);

  // TEST 6: Advocate Add Word Attempt (Write Protection)
  console.log('\n--- TEST 6: Advocate Add Word Attempt ---');
  const resAdvAdd = await makeRequest('/api/dictionary', 'POST', approvedAdvToken, {
    term: 'Advocate Unauthorized Term',
    definition: 'Should be rejected',
    category: 'General'
  });
  console.log(`Status: ${resAdvAdd.statusCode} (Expected: 403)`);

  // TEST 7: Client Add Word Attempt (Write Protection)
  console.log('\n--- TEST 7: Client Add Word Attempt ---');
  const resClientAdd = await makeRequest('/api/dictionary', 'POST', clientToken, {
    term: 'Client Unauthorized Term',
    definition: 'Should be rejected',
    category: 'General'
  });
  console.log(`Status: ${resClientAdd.statusCode} (Expected: 403)`);

  // TEST 8: Admin Adds New Term
  console.log('\n--- TEST 8: Admin Adds New Term ---');
  const testTermName = `Test Term ${Date.now()}`;
  const resAdminAdd = await makeRequest('/api/dictionary', 'POST', adminToken, {
    term: testTermName,
    definition: 'A test definition created by System Admin.',
    category: 'Test Category',
    additionalInformation: 'Explanations and context',
    examples: ['Test Example 1', 'Test Example 2'],
    relatedTerms: ['Res Judicata', 'Locus Standi']
  });
  console.log(`Status: ${resAdminAdd.statusCode} (Expected: 201), Success: ${resAdminAdd.data?.success}`);

  // TEST 9: Admin Adds Duplicate Term in Same Category
  console.log('\n--- TEST 9: Admin Duplicate Term Handling ---');
  const resDup = await makeRequest('/api/dictionary', 'POST', adminToken, {
    term: testTermName,
    definition: 'Duplicate entry attempt.',
    category: 'Test Category'
  });
  console.log(`Status: ${resDup.statusCode} (Expected: 400), Message: ${resDup.data?.message}`);

  // TEST 10: Verify Advocate can see Admin-created Term
  console.log('\n--- TEST 10: Advocate Sees Admin-Added Term ---');
  const resAdvCheck = await makeRequest('/api/dictionary', 'GET', approvedAdvToken);
  const foundInAdvRead = Array.isArray(resAdvCheck.data) && resAdvCheck.data.some((e: any) => e.term === testTermName);
  console.log(`Advocate Read Status: ${resAdvCheck.statusCode}, Found Newly Added Term: ${foundInAdvRead}`);

  console.log('\n✅ ALL LEGAL DICTIONARY VERIFICATION TESTS COMPLETED.');
}

runTests().catch(err => console.error('Test execution error:', err));
