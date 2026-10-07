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

export async function runCourtFeeAccessControlTests() {
  console.log('🧪 RUNNING COURT FEE CALCULATOR ACCESS CONTROL SUITE...\n');

  const clientToken = createTestToken({ id: 'user_client_1', role: 'Client', name: 'Normal Citizen User' });
  const userToken = createTestToken({ id: 'user_regular_1', role: 'User', name: 'Regular Litigant' });
  const advocateToken = createTestToken({ id: 'user_adv_1', role: 'Advocate', name: 'Verified Advocate', isVerified: true });
  const adminToken = createTestToken({ id: 'user_admin_1', role: 'Admin', name: 'Platform Admin' });

  let passed = 0;
  let failed = 0;

  const assertTest = (description: string, condition: boolean, details?: any) => {
    if (condition) {
      console.log(`✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${description}`, details || '');
      failed++;
    }
  };

  // 1. UNAUTHENTICATED / GUEST ACCESS
  console.log('--- SECTION 1: Unauthenticated Guest Attempts ---');
  const resGuestCalc = await makeRequest('/api/court-fee/calculate', 'POST', undefined, { suitValue: 100000, state: 'Andhra Pradesh' });
  assertTest('Guest POST /api/court-fee/calculate returns 401 Unauthorized', resGuestCalc.statusCode === 401, resGuestCalc);

  const resGuestMeta = await makeRequest('/api/calculators/court-fee/metadata', 'GET');
  assertTest('Guest GET /api/calculators/court-fee/metadata returns 401 Unauthorized', resGuestMeta.statusCode === 401, resGuestMeta);

  // 2. USER / CLIENT ACCESS (DENIED ROLE)
  console.log('\n--- SECTION 2: User/Client Role Attempts (Role = Client or User) ---');
  const resClientCalc = await makeRequest('/api/court-fee/calculate', 'POST', clientToken, { suitValue: 100000, state: 'Andhra Pradesh' });
  assertTest('Client POST /api/court-fee/calculate returns 403 Forbidden', resClientCalc.statusCode === 403 && resClientCalc.data?.success === false, resClientCalc);

  const resUserCalc = await makeRequest('/api/calculators/court-fee/calculate', 'POST', userToken, { suitValue: 500000, state: 'Delhi' });
  assertTest('User POST /api/calculators/court-fee/calculate returns 403 Forbidden', resUserCalc.statusCode === 403 && resUserCalc.data?.success === false, resUserCalc);

  const resClientMeta = await makeRequest('/api/court-fee/metadata', 'GET', clientToken);
  assertTest('Client GET /api/court-fee/metadata returns 403 Forbidden', resClientMeta.statusCode === 403, resClientMeta);

  const resClientHist = await makeRequest('/api/calculators/court-fee/history', 'GET', clientToken);
  assertTest('Client GET /api/calculators/court-fee/history returns 403 Forbidden', resClientHist.statusCode === 403, resClientHist);

  // 3. ADVOCATE ACCESS (ALLOWED ROLE)
  console.log('\n--- SECTION 3: Advocate Role Attempts (Role = Advocate) ---');
  const resAdvCalc = await makeRequest('/api/court-fee/calculate', 'POST', advocateToken, {
    state: 'Andhra Pradesh',
    courtForum: 'District Court',
    suitValue: 200000,
    caseTypeName: 'Money Recovery Suit',
    reliefTypeName: 'Money Claim Recovery'
  });
  assertTest('Advocate POST /api/court-fee/calculate returns 200 OK & Fee Result', resAdvCalc.statusCode === 200 && resAdvCalc.data?.success === true && resAdvCalc.data?.courtFee !== undefined, resAdvCalc);

  const resAdvMeta = await makeRequest('/api/court-fee/metadata', 'GET', advocateToken);
  assertTest('Advocate GET /api/court-fee/metadata returns 200 OK', resAdvMeta.statusCode === 200 && resAdvMeta.data?.success === true, resAdvMeta);

  // 4. ADMIN ACCESS (ALLOWED ROLE)
  console.log('\n--- SECTION 4: Admin Role Attempts (Role = Admin) ---');
  const resAdminCalc = await makeRequest('/api/calculators/court-fee/calculate', 'POST', adminToken, {
    state: 'Telangana',
    courtForum: 'High Court',
    suitValue: 1000000,
    caseTypeName: 'Commercial Suit',
    reliefTypeName: 'Commercial Suit Ad Valorem'
  });
  assertTest('Admin POST /api/calculators/court-fee/calculate returns 200 OK & Fee Result', resAdminCalc.statusCode === 200 && resAdminCalc.data?.success === true && resAdminCalc.data?.courtFee !== undefined, resAdminCalc);

  const resAdminMeta = await makeRequest('/api/calculators/court-fee/metadata', 'GET', adminToken);
  assertTest('Admin GET /api/calculators/court-fee/metadata returns 200 OK', resAdminMeta.statusCode === 200 && resAdminMeta.data?.success === true, resAdminMeta);

  console.log(`\n==================================================`);
  console.log(`📊 COURT FEE ACCESS CONTROL SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runCourtFeeAccessControlTests().catch(err => {
    console.error('Error running access control tests:', err);
    process.exit(1);
  });
}
