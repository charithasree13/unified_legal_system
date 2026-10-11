import jwt from 'jsonwebtoken';
import { PrincipleOfLaw, AuditLog } from '../models/Schemas';
import * as principleOfLawCtrl from '../controllers/principleOfLawController';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

console.log('⚖️ === PRINCIPLES OF LAW MODULE INTEGRATION & ROLE ACCESS TEST SUITE ===\n');

// 1. JWT Tokens for simulated roles
const adminToken = jwt.sign({ id: 'admin_test_1', role: 'Admin', name: 'Chief Legal Admin' }, JWT_SECRET);
const advocateToken = jwt.sign({ id: 'adv_test_1', role: 'Advocate', name: 'Adv. Rajesh Sharma', isVerified: true }, JWT_SECRET);
const clientToken = jwt.sign({ id: 'cli_test_1', role: 'Client', name: 'Ramesh Patel' }, JWT_SECRET);
const userToken = jwt.sign({ id: 'usr_test_1', role: 'User', name: 'General Public' }, JWT_SECRET);

// Mock response simulator
function createMockRes() {
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

async function runTests() {
  let createdPrincipleId: string = '';

  // -------------------------------------------------------------
  // TEST 1: Unauthenticated GET /api/principles-of-law
  // -------------------------------------------------------------
  console.log('[Test 1/12] Unauthenticated request to GET /api/principles-of-law');
  const req1: any = { user: undefined };
  const res1 = createMockRes();
  await principleOfLawCtrl.getPrinciples(req1, res1);
  if (res1.statusCode !== 401) {
    throw new Error(`Expected status 401 for unauthenticated request, got ${res1.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 401 (${res1.body.message})`);

  // -------------------------------------------------------------
  // TEST 2: Client/User GET /api/principles-of-law (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 2/12] Client role request to GET /api/principles-of-law');
  const req2: any = { user: { id: 'cli_test_1', role: 'Client', name: 'Ramesh' } };
  const res2 = createMockRes();
  await principleOfLawCtrl.getPrinciples(req2, res2);
  if (res2.statusCode !== 403) {
    throw new Error(`Expected status 403 for Client role, got ${res2.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res2.body.message})`);

  // -------------------------------------------------------------
  // TEST 3: Advocate attempt to POST /api/principles-of-law (Write forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 3/12] Advocate attempt to POST (Create) principle of law');
  const req3: any = { 
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    body: { title: 'Test Principle', description: 'Test description' }
  };
  const res3 = createMockRes();
  await principleOfLawCtrl.createPrinciple(req3, res3);
  if (res3.statusCode !== 403) {
    throw new Error(`Expected status 403 for Advocate POST attempt, got ${res3.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res3.body.message})`);

  // -------------------------------------------------------------
  // TEST 4: Admin POST validation - Empty title
  // -------------------------------------------------------------
  console.log('\n[Test 4/12] Admin POST validation with empty title');
  const req4: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'Chief Admin' },
    body: { title: '   ', description: 'Valid description content here.' }
  };
  const res4 = createMockRes();
  await principleOfLawCtrl.createPrinciple(req4, res4);
  if (res4.statusCode !== 400) {
    throw new Error(`Expected status 400 for empty title, got ${res4.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 400 (${res4.body.message})`);

  // -------------------------------------------------------------
  // TEST 5: Admin POST validation - Empty description
  // -------------------------------------------------------------
  console.log('\n[Test 5/12] Admin POST validation with empty description');
  const req5: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'Chief Admin' },
    body: { title: 'Natural Justice', description: '    \n\t   ' }
  };
  const res5 = createMockRes();
  await principleOfLawCtrl.createPrinciple(req5, res5);
  if (res5.statusCode !== 400) {
    throw new Error(`Expected status 400 for empty description, got ${res5.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 400 (${res5.body.message})`);

  // -------------------------------------------------------------
  // TEST 6: Admin successful POST with multiline paragraphs
  // -------------------------------------------------------------
  console.log('\n[Test 6/12] Admin creates principle with multiline paragraphs & formatting');
  const multilineText = `The doctrine of Natural Justice contains two fundamental maxims:
1. Nemo judex in causa sua (No one should be a judge in their own cause).
2. Audi alteram partem (Hear the other side).

Paragraph 2: This constitutional doctrine ensures procedural fairness, equity, and good conscience across all judicial and quasi-judicial proceedings. As held in A.K. Kraipak v. Union of India (1969), the rules of natural justice operate in areas not covered by any law validly made.

Paragraph 3: Any administrative or adjudicatory decision rendered in violation of natural justice is void ab initio.`;

  const req6: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'Chief Admin' },
    body: {
      title: '  Natural Justice  ',
      description: multilineText
    }
  };
  const res6 = createMockRes();
  await principleOfLawCtrl.createPrinciple(req6, res6);
  if (res6.statusCode !== 201 || !res6.body.success || !res6.body.principle) {
    throw new Error(`Expected status 201 and created principle, got ${res6.statusCode}: ${JSON.stringify(res6.body)}`);
  }
  createdPrincipleId = res6.body.principle._id;
  if (res6.body.principle.title !== 'Natural Justice') {
    throw new Error(`Title trimming failed: "${res6.body.principle.title}"`);
  }
  if (!res6.body.principle.description.includes('Nemo judex') || !res6.body.principle.description.includes('Paragraph 3:')) {
    throw new Error('Description formatting/multiline text was truncated!');
  }
  console.log(`  ✅ Passed: Created principle ID: ${createdPrincipleId} with trimmed title "${res6.body.principle.title}" and full multiline description`);

  // -------------------------------------------------------------
  // TEST 7: Advocate GET /api/principles-of-law (Listing view)
  // -------------------------------------------------------------
  console.log('\n[Test 7/12] Advocate retrieves principles listing');
  const req7: any = { user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' } };
  const res7 = createMockRes();
  await principleOfLawCtrl.getPrinciples(req7, res7);
  if (res7.statusCode !== 200 || !res7.body.success) {
    throw new Error(`Expected status 200 for Advocate GET, got ${res7.statusCode}`);
  }
  const found = res7.body.principles.find((p: any) => String(p._id) === String(createdPrincipleId));
  if (!found) {
    throw new Error('Created principle was not found in Advocate listing!');
  }
  console.log(`  ✅ Passed: Advocate retrieved ${res7.body.principles.length} principle(s), including "${found.title}"`);

  // -------------------------------------------------------------
  // TEST 8: Advocate GET /api/principles-of-law/:id (Read Full Principle)
  // -------------------------------------------------------------
  console.log('\n[Test 8/12] Advocate reads full detail of principle by ID');
  const req8: any = {
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    params: { id: createdPrincipleId }
  };
  const res8 = createMockRes();
  await principleOfLawCtrl.getPrincipleById(req8, res8);
  if (res8.statusCode !== 200 || !res8.body.success || !res8.body.principle) {
    throw new Error(`Expected status 200 for Advocate reading detail, got ${res8.statusCode}`);
  }
  if (res8.body.principle.description !== multilineText.trim()) {
    throw new Error('Description returned does not match full admin-entered text!');
  }
  console.log(`  ✅ Passed: Advocate read full detail without truncation (${res8.body.principle.description.length} characters)`);

  // -------------------------------------------------------------
  // TEST 9: Advocate attempt to PUT /api/principles-of-law/:id (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 9/12] Advocate attempt to PUT (Update) principle');
  const req9: any = {
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    params: { id: createdPrincipleId },
    body: { title: 'Hacked Title', description: 'Hacked description' }
  };
  const res9 = createMockRes();
  await principleOfLawCtrl.updatePrinciple(req9, res9);
  if (res9.statusCode !== 403) {
    throw new Error(`Expected status 403 for Advocate PUT, got ${res9.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 403 Forbidden (${res9.body.message})`);

  // -------------------------------------------------------------
  // TEST 10: Admin PUT /api/principles-of-law/:id (Update principle)
  // -------------------------------------------------------------
  console.log('\n[Test 10/12] Admin updates principle title & description');
  const updatedDesc = multilineText + '\n\nUpdated by Admin with Maneka Gandhi v. Union of India (1978) citation.';
  const req10: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'Chief Admin' },
    params: { id: createdPrincipleId },
    body: {
      title: 'Rule of Law & Natural Justice',
      description: updatedDesc
    }
  };
  const res10 = createMockRes();
  await principleOfLawCtrl.updatePrinciple(req10, res10);
  if (res10.statusCode !== 200 || !res10.body.success) {
    throw new Error(`Expected status 200 for Admin update, got ${res10.statusCode}`);
  }
  console.log(`  ✅ Passed: Updated title to "${res10.body.principle.title}"`);

  // -------------------------------------------------------------
  // TEST 11: Advocate attempt to DELETE /api/principles-of-law/:id (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 11/12] Advocate attempt to DELETE principle');
  const req11: any = {
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    params: { id: createdPrincipleId }
  };
  const res11 = createMockRes();
  await principleOfLawCtrl.deletePrinciple(req11, res11);
  if (res11.statusCode !== 403) {
    throw new Error(`Expected status 403 for Advocate DELETE, got ${res11.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 403 Forbidden (${res11.body.message})`);

  // -------------------------------------------------------------
  // TEST 12: Admin DELETE /api/principles-of-law/:id (Delete principle)
  // -------------------------------------------------------------
  console.log('\n[Test 12/12] Admin deletes principle');
  const req12: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'Chief Admin' },
    params: { id: createdPrincipleId }
  };
  const res12 = createMockRes();
  await principleOfLawCtrl.deletePrinciple(req12, res12);
  if (res12.statusCode !== 200 || !res12.body.success) {
    throw new Error(`Expected status 200 for Admin DELETE, got ${res12.statusCode}`);
  }
  console.log(`  ✅ Passed: Successfully deleted principle`);

  // Verify it is gone (404)
  const reqCheck: any = {
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    params: { id: createdPrincipleId }
  };
  const resCheck = createMockRes();
  await principleOfLawCtrl.getPrincipleById(reqCheck, resCheck);
  if (resCheck.statusCode !== 404) {
    throw new Error(`Expected 404 for deleted principle, got ${resCheck.statusCode}`);
  }
  console.log(`  ✅ Verified: Subsequent lookup returned HTTP 404 Not Found`);

  console.log('\n🎉 ALL 12 INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
