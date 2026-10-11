import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';
const BASE_URL = 'http://localhost:5000';

console.log('🌐 === PRINCIPLES OF LAW REAL HTTP ENDPOINT TEST SUITE ===\n');

// Valid signed JWT tokens
const adminToken = jwt.sign({ id: '6hzvukt0', role: 'Admin', name: 'System Admin', email: 'elitelegaldeskmpl@gmail.com' }, JWT_SECRET);
const advocateToken = jwt.sign({ id: '3p2hs73b', role: 'Advocate', name: 'Advocate Sharma', email: 'advocateB@court.org', isVerified: true }, JWT_SECRET);
const clientToken = jwt.sign({ id: 'cli_live_1', role: 'Client', name: 'Client Ramesh', email: 'client@live.test' }, JWT_SECRET);

async function runHttpTests() {
  let createdId = '';

  // 1. Unauthenticated GET
  console.log('[HTTP 1/13] GET /api/principles-of-law without Authorization header');
  const res1 = await fetch(`${BASE_URL}/api/principles-of-law`);
  const data1 = await res1.json();
  if (res1.status !== 401) throw new Error(`Expected 401, got ${res1.status}: ${JSON.stringify(data1)}`);
  console.log(`  ✅ Passed: HTTP 401 (${data1.message})`);

  // 2. Client GET (Forbidden)
  console.log('\n[HTTP 2/13] GET /api/principles-of-law as Client');
  const res2 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  const data2 = await res2.json();
  if (res2.status !== 403) throw new Error(`Expected 403, got ${res2.status}: ${JSON.stringify(data2)}`);
  console.log(`  ✅ Passed: HTTP 403 Forbidden (${data2.message})`);

  // 3. Client POST (Forbidden)
  console.log('\n[HTTP 3/13] POST /api/principles-of-law as Client');
  const res3 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clientToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Illegal Principle', description: 'Some text' })
  });
  const data3 = await res3.json();
  if (res3.status !== 403) throw new Error(`Expected 403, got ${res3.status}: ${JSON.stringify(data3)}`);
  console.log(`  ✅ Passed: HTTP 403 Forbidden (${data3.message})`);

  // 4. Advocate GET (Allowed - Read Only)
  console.log('\n[HTTP 4/13] GET /api/principles-of-law as Advocate');
  const res4 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  const data4 = await res4.json();
  if (res4.status !== 200 || !data4.success) throw new Error(`Expected 200, got ${res4.status}: ${JSON.stringify(data4)}`);
  console.log(`  ✅ Passed: HTTP 200 OK (${data4.principles.length} principles retrieved)`);

  // 5. Advocate POST (Forbidden - Advocate cannot add)
  console.log('\n[HTTP 5/13] POST /api/principles-of-law as Advocate');
  const res5 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${advocateToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Advocate Principle', description: 'Advocate cannot add' })
  });
  const data5 = await res5.json();
  if (res5.status !== 403) throw new Error(`Expected 403, got ${res5.status}: ${JSON.stringify(data5)}`);
  console.log(`  ✅ Passed: HTTP 403 Forbidden (${data5.message})`);

  // 6. Admin POST with Empty Title (Bad Request)
  console.log('\n[HTTP 6/13] POST /api/principles-of-law as Admin with empty title');
  const res6 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: '   ', description: 'Valid text' })
  });
  const data6 = await res6.json();
  if (res6.status !== 400) throw new Error(`Expected 400, got ${res6.status}: ${JSON.stringify(data6)}`);
  console.log(`  ✅ Passed: HTTP 400 Bad Request (${data6.message})`);

  // 7. Admin POST with Empty Description (Bad Request)
  console.log('\n[HTTP 7/13] POST /api/principles-of-law as Admin with empty description');
  const res7 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Valid Title', description: '   ' })
  });
  const data7 = await res7.json();
  if (res7.status !== 400) throw new Error(`Expected 400, got ${res7.status}: ${JSON.stringify(data7)}`);
  console.log(`  ✅ Passed: HTTP 400 Bad Request (${data7.message})`);

  // 8. Admin POST Valid Principle with Multiline Paragraphs (Success)
  console.log('\n[HTTP 8/13] POST /api/principles-of-law as Admin with valid title and multiline paragraphs');
  const sampleDesc = `Under Article 141 of the Constitution of India, the law declared by the Supreme Court shall be binding on all courts within the territory of India.\n\nStare decisis et non quieta movere: Stand by decisions and do not disturb settled matters.\n\nHigh Court judgments are binding on subordinate courts within the territorial jurisdiction.`;
  const res8 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: '  Doctrine of Precedent  ',
      description: sampleDesc
    })
  });
  const data8 = await res8.json();
  if (res8.status !== 201 || !data8.success || !data8.principle) throw new Error(`Expected 201, got ${res8.status}: ${JSON.stringify(data8)}`);
  createdId = data8.principle._id;
  console.log(`  ✅ Passed: HTTP 201 Created. ID: ${createdId}, Title: "${data8.principle.title}"`);

  // 9. Advocate reads listing (Contains newly created principle)
  console.log('\n[HTTP 9/13] GET /api/principles-of-law as Advocate to verify listing');
  const res9 = await fetch(`${BASE_URL}/api/principles-of-law`, {
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  const data9 = await res9.json();
  const found = data9.principles.find((p: any) => String(p._id) === String(createdId));
  if (!found) throw new Error(`Principle ${createdId} not found in Advocate listing!`);
  console.log(`  ✅ Passed: HTTP 200 OK. Principle "${found.title}" present in listing.`);

  // 10. Advocate reads full principle by ID (Preserves multiline description)
  console.log('\n[HTTP 10/13] GET /api/principles-of-law/:id as Advocate to read full principle');
  const res10 = await fetch(`${BASE_URL}/api/principles-of-law/${createdId}`, {
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  const data10 = await res10.json();
  if (res10.status !== 200 || !data10.principle) throw new Error(`Expected 200, got ${res10.status}: ${JSON.stringify(data10)}`);
  if (!data10.principle.description.includes('Stare decisis et non quieta movere')) throw new Error('Description content missing paragraphs!');
  console.log(`  ✅ Passed: HTTP 200 OK. Description fully preserved (${data10.principle.description.length} chars).`);

  // 11. Advocate attempt to PUT (Forbidden - Advocate cannot edit)
  console.log('\n[HTTP 11/13] PUT /api/principles-of-law/:id as Advocate');
  const res11 = await fetch(`${BASE_URL}/api/principles-of-law/${createdId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${advocateToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Hacked', description: 'Hacked' })
  });
  const data11 = await res11.json();
  if (res11.status !== 403) throw new Error(`Expected 403, got ${res11.status}: ${JSON.stringify(data11)}`);
  console.log(`  ✅ Passed: HTTP 403 Forbidden (${data11.message})`);

  // 12. Admin PUT (Allowed - Admin can edit)
  console.log('\n[HTTP 12/13] PUT /api/principles-of-law/:id as Admin');
  const res12 = await fetch(`${BASE_URL}/api/principles-of-law/${createdId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Doctrine of Precedent & Stare Decisis',
      description: sampleDesc + '\n\nAdditional jurisprudence note added.'
    })
  });
  const data12 = await res12.json();
  if (res12.status !== 200 || !data12.success) throw new Error(`Expected 200, got ${res12.status}: ${JSON.stringify(data12)}`);
  console.log(`  ✅ Passed: HTTP 200 OK. Updated title to "${data12.principle.title}"`);

  // 13. Admin DELETE (Allowed - Admin can delete)
  console.log('\n[HTTP 13/13] DELETE /api/principles-of-law/:id as Admin');
  const res13 = await fetch(`${BASE_URL}/api/principles-of-law/${createdId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data13 = await res13.json();
  if (res13.status !== 200 || !data13.success) throw new Error(`Expected 200, got ${res13.status}: ${JSON.stringify(data13)}`);
  console.log(`  ✅ Passed: HTTP 200 OK. (${data13.message})`);

  // Subsequent check: 404 Not Found
  const resCheck = await fetch(`${BASE_URL}/api/principles-of-law/${createdId}`, {
    headers: { 'Authorization': `Bearer ${advocateToken}` }
  });
  if (resCheck.status !== 404) throw new Error(`Expected 404, got ${resCheck.status}`);
  console.log(`  ✅ Verified: Subsequent fetch returned HTTP 404 Not Found as expected.`);

  console.log('\n🎉 ALL 13 REAL HTTP LIVE SERVER ENDPOINT TESTS PASSED WITH 100% SUCCESS!\n');
}

runHttpTests().catch(err => {
  console.error('\n❌ HTTP TEST SUITE FAILED:', err);
  process.exit(1);
});
