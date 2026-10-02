import http from 'http';
import app from '../index';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

function createTestToken(payload: { id: string; role: string; name: string; email?: string; isVerified?: boolean }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  console.log('🧪 Starting Judgments & Bare Acts Suite Verification...\n');

  let passed = 0;
  let failed = 0;

  async function testReq(name: string, path: string, method: string = 'GET', token?: string, body?: any, expectedStatus: number = 200) {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const status = res.status;
      const data = await res.json().catch(() => ({}));

      if (status === expectedStatus) {
        console.log(`✅ PASS: [${name}] (Status: ${status})`);
        passed++;
        return { data, status };
      } else {
        console.error(`❌ FAIL: [${name}] Expected: ${expectedStatus}, Got: ${status}. Data:`, data);
        failed++;
        return { data, status };
      }
    } catch (err: any) {
      console.error(`❌ FAIL: [${name}] Exception:`, err?.message || err);
      failed++;
      return { data: null, status: 500 };
    }
  }

  const unauthToken = undefined;
  const clientToken = createTestToken({ id: 'user_client_1', role: 'Client', name: 'Normal Citizen' });
  const pendingAdvToken = createTestToken({ id: 'user_adv_pending_1', role: 'Advocate', name: 'Pending Adv', isVerified: false });
  const approvedAdvToken = createTestToken({ id: 'user_adv_approved_1', role: 'Advocate', name: 'Approved Adv', isVerified: true });
  const adminToken = createTestToken({ id: 'user_admin_1', role: 'Admin', name: 'System Admin' });

  console.log('🔒 1. SECURITY & ROLE AUTHORIZATION TESTS:');
  await testReq('Unauthenticated Judgments Access', '/api/documents/judgements', 'GET', unauthToken, undefined, 401);
  await testReq('Normal User / Client Judgments Access', '/api/documents/judgements', 'GET', clientToken, undefined, 403);
  await testReq('Pending Advocate Judgments Access', '/api/documents/judgements', 'GET', pendingAdvToken, undefined, 403);
  await testReq('Approved Advocate Judgments Access', '/api/documents/judgements', 'GET', approvedAdvToken, undefined, 200);
  await testReq('Admin Judgments Access', '/api/documents/judgements', 'GET', adminToken, undefined, 200);

  await testReq('Unauthenticated Bare Acts Access', '/api/documents/laws', 'GET', unauthToken, undefined, 401);
  await testReq('Normal User / Client Bare Acts Access', '/api/documents/laws', 'GET', clientToken, undefined, 403);
  await testReq('Pending Advocate Bare Acts Access', '/api/documents/laws', 'GET', pendingAdvToken, undefined, 403);
  await testReq('Approved Advocate Bare Acts Access', '/api/documents/laws', 'GET', approvedAdvToken, undefined, 200);

  console.log('\n🔍 2. SEARCH, FILTERS & PAGINATION TESTS:');
  const searchRes = await testReq('Search Judgments by Section / Keyword', '/api/documents/judgements?search=NDPS', 'GET', approvedAdvToken, undefined, 200);
  if (searchRes.data?.judgements) {
    console.log(`   ℹ️ Search returned ${searchRes.data.judgements.length} record(s).`);
  }

  const paginatedRes = await testReq('Judgments Server-Side Pagination', '/api/documents/judgements?page=1&limit=2', 'GET', approvedAdvToken, undefined, 200);
  if (paginatedRes.data?.pagination) {
    console.log(`   ℹ️ Pagination Meta: Total: ${paginatedRes.data.pagination.total}, Page: ${paginatedRes.data.pagination.page}, TotalPages: ${paginatedRes.data.pagination.totalPages}`);
  }

  const bareActSearchRes = await testReq('Search Bare Acts by Keyword', '/api/documents/laws?search=Limitation', 'GET', approvedAdvToken, undefined, 200);
  if (bareActSearchRes.data?.laws) {
    console.log(`   ℹ️ Bare Acts Search returned ${bareActSearchRes.data.laws.length} record(s).`);
  }

  console.log('\n🛑 3. DUPLICATE PREVENTION & CANONICAL NORMALIZATION TESTS:');
  const dupJudPayload = {
    title: "Composite Appeal Maintainable Where Common Judgment Decides Two Connected Suits By Same Plaintiff: Supreme Court",
    court: "Supreme Court of India",
    judge: "Justice Vikram Nath",
    year: 2026,
    subject: "Civil Law",
    caseNumber: "Civil Appeal No. 1420 of 2026",
    neutralCitation: "2026 INSC 412",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_composite_appeal.pdf"
  };
  await testReq('Prevent Duplicate Judgment Cataloging', '/api/documents/judgements', 'POST', adminToken, dupJudPayload, 409);

  const dupActPayload = {
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    actName: "The Bharatiya Nyaya Sanhita, 2023",
    year: 2023,
    category: "Criminal Law",
    jurisdiction: "Central / All India",
    actNumber: "Act No. 45 of 2023"
  };
  await testReq('Prevent Duplicate Bare Act Cataloging', '/api/documents/laws', 'POST', adminToken, dupActPayload, 409);

  console.log('\n========================================');
  console.log(`📊 SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
