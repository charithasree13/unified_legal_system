import http from 'http';
import app from '../index';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

function createTestToken(payload: { id: string; role: string; name: string; isVerified?: boolean }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function runComprehensiveTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;

  console.log(`\n=====================================================================`);
  console.log(`🚀 VERIFYING COMPREHENSIVE BARE ACTS & JUDGMENTS FEDERATED DISCOVERY`);
  console.log(`📡 In-Process Test Server Port: ${address.port}`);
  console.log(`=====================================================================\n`);

  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failCount++;
    }
  }

  const token = createTestToken({ id: 'user_adv_approved_1', role: 'Advocate', name: 'Approved Advocate', isVerified: true });
  const headers = { 'Authorization': `Bearer ${token}` };

  async function apiGet(path: string) {
    const res = await fetch(`${baseUrl}${path}`, { headers });
    const data = await res.json();
    return { status: res.status, data };
  }

  try {
    // 1. Central Acts Discovery
    console.log('--- 1. CENTRAL ACTS DISCOVERY (INDIA CODE & STATUTORY REPOSITORY) ---');
    const rti = await apiGet('/api/documents/laws?search=Right+to+Information');
    assert(rti.status === 200 && rti.data.success, 'Search "Right to Information" returned status 200');
    assert(rti.data.laws?.length > 0, `Discovered ${rti.data.laws?.length} records for RTI`);
    assert(rti.data.laws?.some((l: any) => l.title.toLowerCase().includes('information')), 'RTI Act found in results');
    assert(rti.data.pagination?.total > 10, `RTI total coverage verified: ${rti.data.pagination?.total} records`);
    assert(rti.data.sourceStatus?.indiaCode === 'ONLINE_CONNECTED', 'India Code source connected and attributed');

    const sra = await apiGet('/api/documents/laws?search=Specific+Relief');
    assert(sra.data.laws?.some((l: any) => l.title.toLowerCase().includes('specific relief')), 'Specific Relief Act discovered');

    const cpa = await apiGet('/api/documents/laws?search=Consumer+Protection');
    assert(cpa.data.laws?.some((l: any) => l.title.toLowerCase().includes('consumer')), 'Consumer Protection Act discovered');

    const fact = await apiGet('/api/documents/laws?search=Factories+Act');
    assert(fact.data.laws?.some((l: any) => l.title.toLowerCase().includes('factories')), 'Factories Act discovered');

    // 2. State Acts Discovery
    console.log('\n--- 2. STATE ACTS DISCOVERY ---');
    const drc = await apiGet('/api/documents/laws?search=Delhi+Rent+Control');
    assert(drc.data.laws?.some((l: any) => l.title.toLowerCase().includes('rent control')), 'Delhi Rent Control Act discovered');

    const tn = await apiGet('/api/documents/laws?search=Tamil+Nadu+Land');
    assert(tn.data.laws?.some((l: any) => l.title.toLowerCase().includes('tamil nadu')), 'Tamil Nadu State Act discovered');

    // 3. Judgments from different courts
    console.log('\n--- 3. JUDGMENTS DISCOVERY ACROSS COURTS ---');
    const sc = await apiGet('/api/documents/judgements?search=Maneka+Gandhi');
    assert(sc.data.judgements?.length > 0, `Maneka Gandhi search returned ${sc.data.judgements?.length} results`);
    assert(sc.data.judgements?.some((j: any) => j.title.toLowerCase().includes('maneka')), 'Maneka Gandhi landmark ruling found');
    assert(sc.data.pagination?.total > 100, `Maneka Gandhi total precedent count: ${sc.data.pagination?.total}`);

    const putta = await apiGet('/api/documents/judgements?search=Puttaswamy');
    assert(putta.data.judgements?.some((j: any) => j.title.toLowerCase().includes('puttaswamy')), 'K.S. Puttaswamy (Right to Privacy) judgment found');

    const hc = await apiGet('/api/documents/judgements?search=bail&court=Delhi+High+Court');
    assert(hc.data.judgements?.length > 0, `Delhi High Court bail search returned ${hc.data.judgements?.length} results`);

    // 4. Pagination Distinctness Test
    console.log('\n--- 4. PAGINATION DISTINCTNESS TEST ---');
    const p1 = await apiGet('/api/documents/judgements?search=Constitution&page=1&limit=5');
    const p2 = await apiGet('/api/documents/judgements?search=Constitution&page=2&limit=5');
    const p1Ids = (p1.data.judgements || []).map((j: any) => j._id || j.title);
    const p2Ids = (p2.data.judgements || []).map((j: any) => j._id || j.title);
    const hasOverlap = p1Ids.some((id: string) => p2Ids.includes(id));
    assert(!hasOverlap, 'Page 2 retrieves distinct records from Page 1 (no repetition)');

    // 5. Dynamic On-Demand Content Retrieval
    console.log('\n--- 5. DYNAMIC FULL CONTENT ON-DEMAND RETRIEVAL ---');
    const sampleDocId = sc.data.judgements[0]?._id;
    if (sampleDocId) {
      const dyn = await apiGet(`/api/documents/dynamic-content?type=judgement&docId=${sampleDocId}`);
      assert(dyn.status === 200 && dyn.data.success, 'Dynamic on-demand content retrieved with status 200');
      assert(dyn.data.content?.content?.length > 100, `Retrieved text body: ${dyn.data.content?.content?.length} characters`);
      assert(dyn.data.content?.officialSourceUrl?.length > 0, 'Official authoritative source URL linked');
    }

    console.log(`\n=====================================================================`);
    console.log(`📊 FINAL RESULTS: ${passCount} Passed, ${failCount} Failed`);
    console.log(`=====================================================================\n`);
    
    server.close();
    process.exit(failCount === 0 ? 0 : 1);
  } catch (err: any) {
    console.error('Fatal test error:', err);
    server.close();
    process.exit(1);
  }
}

runComprehensiveTests();
