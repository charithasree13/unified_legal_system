import jwt from 'jsonwebtoken';
import { JudiciaryNote, AuditLog } from '../models/Schemas';
import * as judiciaryNoteCtrl from '../controllers/judiciaryNoteController';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

console.log('🏛️ === JUDICIARY NOTES MODULE INTEGRATION & ROLE-BASED ACCESS TEST SUITE ===\n');

// 1. JWT Tokens for simulated roles
const adminUser = { id: 'admin_test_1', role: 'Admin' as const, name: 'Chief Legal Administrator' };
const advocateUser = { id: 'adv_test_1', role: 'Advocate' as const, name: 'Adv. Ananya Rao', isVerified: true };
const clientUser = { id: 'cli_test_1', role: 'Client' as const, name: 'Suresh Kumar' };
const regularUser = { id: 'usr_test_1', role: 'User' as const, name: 'Public User' };

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
  let createdNoteId: string = '';

  // -------------------------------------------------------------
  // TEST 1: URL Validation Helper Unit Tests
  // -------------------------------------------------------------
  console.log('[Test 1/15] URL Safety and Protocol Validation Helper');
  const validUrls = [
    'https://main.sci.gov.in',
    'https://delhihighcourt.nic.in/case-status',
    'http://bombayhighcourt.nic.in',
    'https://judgments.ecourts.gov.in/pdfsearch/index.php'
  ];
  for (const url of validUrls) {
    if (!judiciaryNoteCtrl.isValidHttpUrl(url)) {
      throw new Error(`Expected valid URL to pass: ${url}`);
    }
  }

  const invalidUrls = [
    'javascript:alert("XSS")',
    'data:text/html,<script>alert(1)</script>',
    'file:///C:/passwords.txt',
    'vbscript:msgbox("test")',
    'blob:https://example.com/uuid',
    'not-a-valid-url',
    '',
    '   '
  ];
  for (const url of invalidUrls) {
    if (judiciaryNoteCtrl.isValidHttpUrl(url)) {
      throw new Error(`Expected dangerous/invalid URL to fail: ${url}`);
    }
  }
  console.log('  ✅ Passed: All valid HTTP/HTTPS URLs accepted; dangerous and malformed URLs rejected.');

  // -------------------------------------------------------------
  // TEST 2: Unauthenticated GET /api/judiciary-notes
  // -------------------------------------------------------------
  console.log('\n[Test 2/15] Unauthenticated request to GET /api/judiciary-notes');
  const req2: any = { user: undefined };
  const res2 = createMockRes();
  await judiciaryNoteCtrl.getJudiciaryNotes(req2, res2);
  if (res2.statusCode !== 401) {
    throw new Error(`Expected status 401 for unauthenticated request, got ${res2.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 401 (${res2.body.message})`);

  // -------------------------------------------------------------
  // TEST 3: Client GET /api/judiciary-notes (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 3/15] Client role request to GET /api/judiciary-notes');
  const req3: any = { user: clientUser };
  const res3 = createMockRes();
  await judiciaryNoteCtrl.getJudiciaryNotes(req3, res3);
  if (res3.statusCode !== 403) {
    throw new Error(`Expected status 403 for Client role, got ${res3.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res3.body.message})`);

  // -------------------------------------------------------------
  // TEST 4: User role GET /api/judiciary-notes (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 4/15] User role request to GET /api/judiciary-notes');
  const req4: any = { user: regularUser };
  const res4 = createMockRes();
  await judiciaryNoteCtrl.getJudiciaryNotes(req4, res4);
  if (res4.statusCode !== 403) {
    throw new Error(`Expected status 403 for User role, got ${res4.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res4.body.message})`);

  // -------------------------------------------------------------
  // TEST 5: Advocate attempt to POST (Create note - Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 5/15] Advocate attempt to POST (Create) judiciary note');
  const req5: any = { 
    user: advocateUser,
    body: { title: 'Unauthorized Note', link: 'https://example.com' }
  };
  const res5 = createMockRes();
  await judiciaryNoteCtrl.createJudiciaryNote(req5, res5);
  if (res5.statusCode !== 403) {
    throw new Error(`Expected status 403 for Advocate POST attempt, got ${res5.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res5.body.message})`);

  // -------------------------------------------------------------
  // TEST 6: Advocate attempt to DELETE note (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 6/15] Advocate attempt to DELETE judiciary note');
  const req6: any = { 
    user: advocateUser,
    params: { id: 'some_dummy_id' }
  };
  const res6 = createMockRes();
  await judiciaryNoteCtrl.deleteJudiciaryNote(req6, res6);
  if (res6.statusCode !== 403) {
    throw new Error(`Expected status 403 for Advocate DELETE attempt, got ${res6.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res6.body.message})`);

  // -------------------------------------------------------------
  // TEST 7: Admin POST validation - Missing/Empty Title
  // -------------------------------------------------------------
  console.log('\n[Test 7/15] Admin POST validation with empty or whitespace title');
  const req7: any = {
    user: adminUser,
    body: { title: '   ', link: 'https://main.sci.gov.in' }
  };
  const res7 = createMockRes();
  await judiciaryNoteCtrl.createJudiciaryNote(req7, res7);
  if (res7.statusCode !== 400) {
    throw new Error(`Expected status 400 for empty title, got ${res7.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 400 (${res7.body.message})`);

  // -------------------------------------------------------------
  // TEST 8: Admin POST validation - Missing/Empty Link
  // -------------------------------------------------------------
  console.log('\n[Test 8/15] Admin POST validation with missing/empty link');
  const req8: any = {
    user: adminUser,
    body: { title: 'Supreme Court Portal', link: '   ' }
  };
  const res8 = createMockRes();
  await judiciaryNoteCtrl.createJudiciaryNote(req8, res8);
  if (res8.statusCode !== 400) {
    throw new Error(`Expected status 400 for empty link, got ${res8.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 400 (${res8.body.message})`);

  // -------------------------------------------------------------
  // TEST 9: Admin POST validation - Unsafe JavaScript Protocol
  // -------------------------------------------------------------
  console.log('\n[Test 9/15] Admin POST validation with unsafe javascript: URL');
  const req9: any = {
    user: adminUser,
    body: { title: 'Malicious Link', link: 'javascript:alert(document.cookie)' }
  };
  const res9 = createMockRes();
  await judiciaryNoteCtrl.createJudiciaryNote(req9, res9);
  if (res9.statusCode !== 400) {
    throw new Error(`Expected status 400 for unsafe URL, got ${res9.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 400 (${res9.body.message})`);

  // -------------------------------------------------------------
  // TEST 10: Admin POST Success - Create valid Judiciary Note
  // -------------------------------------------------------------
  console.log('\n[Test 10/15] Admin POST valid Judiciary Note creation');
  const sampleTitle = 'Supreme Court Judgments Portal';
  const sampleLink = 'https://main.sci.gov.in/judgments';
  const req10: any = {
    user: adminUser,
    body: { title: `  ${sampleTitle}  `, link: `  ${sampleLink}  ` }
  };
  const res10 = createMockRes();
  await judiciaryNoteCtrl.createJudiciaryNote(req10, res10);
  if (res10.statusCode !== 201 || !res10.body.success) {
    throw new Error(`Expected status 201 for valid note creation, got ${res10.statusCode}: ${JSON.stringify(res10.body)}`);
  }
  createdNoteId = res10.body.note._id;
  if (!createdNoteId) {
    throw new Error('Created note has no valid database _id');
  }
  if (res10.body.note.title !== sampleTitle) {
    throw new Error(`Title trimming failed. Expected "${sampleTitle}", got "${res10.body.note.title}"`);
  }
  if (res10.body.note.link !== sampleLink) {
    throw new Error(`Link trimming failed. Expected "${sampleLink}", got "${res10.body.note.link}"`);
  }
  console.log(`  ✅ Passed: Successfully created note ID: ${createdNoteId} with trimmed title and link.`);

  // -------------------------------------------------------------
  // TEST 11: Advocate GET /api/judiciary-notes (Read access)
  // -------------------------------------------------------------
  console.log('\n[Test 11/15] Advocate GET /api/judiciary-notes');
  const req11: any = { user: advocateUser };
  const res11 = createMockRes();
  await judiciaryNoteCtrl.getJudiciaryNotes(req11, res11);
  if (res11.statusCode !== 200 || !res11.body.success) {
    throw new Error(`Expected status 200 for Advocate read, got ${res11.statusCode}`);
  }
  const foundNoteAdv = res11.body.notes.find((n: any) => String(n._id) === String(createdNoteId));
  if (!foundNoteAdv) {
    throw new Error('Newly created judiciary note not found in Advocate notes listing');
  }
  console.log(`  ✅ Passed: Advocate retrieved ${res11.body.notes.length} note(s), verified created note is visible.`);

  // -------------------------------------------------------------
  // TEST 12: Admin GET /api/judiciary-notes (Read access)
  // -------------------------------------------------------------
  console.log('\n[Test 12/15] Admin GET /api/judiciary-notes');
  const req12: any = { user: adminUser };
  const res12 = createMockRes();
  await judiciaryNoteCtrl.getJudiciaryNotes(req12, res12);
  if (res12.statusCode !== 200 || !res12.body.success) {
    throw new Error(`Expected status 200 for Admin read, got ${res12.statusCode}`);
  }
  const foundNoteAdmin = res12.body.notes.find((n: any) => String(n._id) === String(createdNoteId));
  if (!foundNoteAdmin) {
    throw new Error('Newly created judiciary note not found in Admin notes listing');
  }
  console.log(`  ✅ Passed: Admin retrieved ${res12.body.notes.length} note(s), verified notes match.`);

  // -------------------------------------------------------------
  // TEST 13: Admin DELETE note
  // -------------------------------------------------------------
  console.log('\n[Test 13/15] Admin DELETE judiciary note by ID');
  const req13: any = {
    user: adminUser,
    params: { id: createdNoteId }
  };
  const res13 = createMockRes();
  await judiciaryNoteCtrl.deleteJudiciaryNote(req13, res13);
  if (res13.statusCode !== 200 || !res13.body.success) {
    throw new Error(`Expected status 200 for Admin delete, got ${res13.statusCode}: ${JSON.stringify(res13.body)}`);
  }
  console.log(`  ✅ Passed: Deleted note ${createdNoteId} (${res13.body.message})`);

  // -------------------------------------------------------------
  // TEST 14: Verification that deleted note no longer exists
  // -------------------------------------------------------------
  console.log('\n[Test 14/15] Verify note is removed from database listing');
  const req14: any = { user: advocateUser };
  const res14 = createMockRes();
  await judiciaryNoteCtrl.getJudiciaryNotes(req14, res14);
  const deletedStillPresent = res14.body.notes.some((n: any) => String(n._id) === String(createdNoteId));
  if (deletedStillPresent) {
    throw new Error('Deleted note is still present in listing!');
  }
  console.log('  ✅ Passed: Note successfully purged from database records.');

  // -------------------------------------------------------------
  // TEST 15: Repeated DELETE / Non-existent note returns 404
  // -------------------------------------------------------------
  console.log('\n[Test 15/15] Repeated DELETE on already deleted note');
  const req15: any = {
    user: adminUser,
    params: { id: createdNoteId }
  };
  const res15 = createMockRes();
  await judiciaryNoteCtrl.deleteJudiciaryNote(req15, res15);
  if (res15.statusCode !== 404) {
    throw new Error(`Expected status 404 for missing note, got ${res15.statusCode}`);
  }
  console.log(`  ✅ Passed: Safely returned HTTP 404 (${res15.body.message})`);

  console.log('\n🎉 ALL 15/15 JUDICIARY NOTES INTEGRATION & RBAC TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
