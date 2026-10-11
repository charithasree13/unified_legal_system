import jwt from 'jsonwebtoken';
import { UsefulLinkCategory, AuditLog } from '../models/Schemas';
import * as usefulLinksCtrl from '../controllers/usefulLinksController';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

console.log('🔗 === USEFUL LINKS MODULE INTEGRATION & ROLE ACCESS TEST SUITE ===\n');

// Mock response helper
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
  let createdCategoryId: string = '';
  let createdLinkId: string = '';

  // -------------------------------------------------------------
  // TEST 1: Unauthenticated GET /api/useful-links
  // -------------------------------------------------------------
  console.log('[Test 1/14] Unauthenticated request to GET /api/useful-links');
  const req1: any = { user: undefined };
  const res1 = createMockRes();
  await usefulLinksCtrl.getCategories(req1, res1);
  if (res1.statusCode !== 401) {
    throw new Error(`Expected status 401 for unauthenticated request, got ${res1.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 401 (${res1.body.message})`);

  // -------------------------------------------------------------
  // TEST 2: Client / Normal User role GET /api/useful-links (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 2/14] Client role request to GET /api/useful-links');
  const req2: any = { user: { id: 'cli_test_1', role: 'Client', name: 'Ramesh Patel' } };
  const res2 = createMockRes();
  await usefulLinksCtrl.getCategories(req2, res2);
  if (res2.statusCode !== 403) {
    throw new Error(`Expected status 403 for Client role, got ${res2.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res2.body.message})`);

  // -------------------------------------------------------------
  // TEST 3: Advocate attempt to POST /api/useful-links (Write forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 3/14] Advocate attempt to POST (Create Category)');
  const req3: any = { 
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    body: { title: 'Legal Research', links: [] }
  };
  const res3 = createMockRes();
  await usefulLinksCtrl.createCategory(req3, res3);
  if (res3.statusCode !== 403) {
    throw new Error(`Expected status 403 for Advocate POST attempt, got ${res3.statusCode}`);
  }
  console.log(`  ✅ Passed: Returned HTTP 403 Forbidden (${res3.body.message})`);

  // -------------------------------------------------------------
  // TEST 4: Admin POST validation - Empty title
  // -------------------------------------------------------------
  console.log('\n[Test 4/14] Admin POST validation with empty or whitespace title');
  const req4: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'Chief Admin' },
    body: { title: '    \n\t   ', links: [] }
  };
  const res4 = createMockRes();
  await usefulLinksCtrl.createCategory(req4, res4);
  if (res4.statusCode !== 400) {
    throw new Error(`Expected status 400 for empty title, got ${res4.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 400 (${res4.body.message})`);

  // -------------------------------------------------------------
  // TEST 5: Admin POST validation - Malformed / Dangerous URL
  // -------------------------------------------------------------
  console.log('\n[Test 5/14] Admin POST validation with unsafe "javascript:" scheme & malformed URL');
  const req5: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'Chief Admin' },
    body: { 
      title: 'Security Research',
      links: [
        { title: 'Malicious Link', url: 'javascript:alert(document.cookie)' }
      ]
    }
  };
  const res5 = createMockRes();
  await usefulLinksCtrl.createCategory(req5, res5);
  if (res5.statusCode !== 400) {
    throw new Error(`Expected status 400 for unsafe javascript URL, got ${res5.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected with HTTP 400 (${res5.body.message})`);

  // -------------------------------------------------------------
  // TEST 6: Admin POST - Create Category with multiple valid links
  // -------------------------------------------------------------
  console.log('\n[Test 6/14] Admin POST create Category with multiple valid HTTP/HTTPS links');
  const req6: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'System Administrator' },
    body: {
      title: 'Official Judicial & Court Portals',
      links: [
        { title: 'Supreme Court of India', url: 'https://main.sci.gov.in' },
        { title: 'Delhi High Court Registry', url: 'https://delhihighcourt.nic.in' },
        { title: 'e-Courts Services Portal', url: 'https://services.ecourts.gov.in' }
      ]
    }
  };
  const res6 = createMockRes();
  await usefulLinksCtrl.createCategory(req6, res6);
  if (res6.statusCode !== 201 || !res6.body.category?._id) {
    throw new Error(`Expected status 201 and created category object, got ${res6.statusCode}: ${JSON.stringify(res6.body)}`);
  }
  createdCategoryId = res6.body.category._id;
  const initialLinks = res6.body.category.links;
  if (!initialLinks || initialLinks.length !== 3) {
    throw new Error(`Expected 3 initial links, found ${initialLinks?.length}`);
  }
  console.log(`  ✅ Passed: Created category "${res6.body.category.title}" (ID: ${createdCategoryId}) with ${initialLinks.length} child links.`);

  // -------------------------------------------------------------
  // TEST 7: Advocate GET /api/useful-links (Read-only success)
  // -------------------------------------------------------------
  console.log('\n[Test 7/14] Advocate GET all categories (Read-only visibility)');
  const req7: any = { user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' } };
  const res7 = createMockRes();
  await usefulLinksCtrl.getCategories(req7, res7);
  if (res7.statusCode !== 200 || !Array.isArray(res7.body.categories)) {
    throw new Error(`Expected status 200 and categories array for Advocate, got ${res7.statusCode}`);
  }
  const found = res7.body.categories.find((c: any) => c._id === createdCategoryId);
  if (!found) {
    throw new Error(`Newly created category not found in Advocate category list`);
  }
  console.log(`  ✅ Passed: Advocate retrieved ${res7.body.categories.length} categories; verified category visibility.`);

  // -------------------------------------------------------------
  // TEST 8: GET single Category by ID (Admin & Advocate)
  // -------------------------------------------------------------
  console.log('\n[Test 8/14] GET single category by ID');
  const req8: any = { 
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    params: { id: createdCategoryId }
  };
  const res8 = createMockRes();
  await usefulLinksCtrl.getCategoryById(req8, res8);
  if (res8.statusCode !== 200 || res8.body.category?._id !== createdCategoryId) {
    throw new Error(`Expected status 200 and category details, got ${res8.statusCode}`);
  }
  console.log(`  ✅ Passed: Fetched category details and ${res8.body.category.links.length} associated links.`);

  // -------------------------------------------------------------
  // TEST 9: Admin Add Individual Link to Category
  // -------------------------------------------------------------
  console.log('\n[Test 9/14] Admin Add individual link to category');
  const req9: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'System Administrator' },
    params: { categoryId: createdCategoryId },
    body: {
      title: 'National Judicial Data Grid (NJDG)',
      url: 'https://njdg.ecourts.gov.in'
    }
  };
  const res9 = createMockRes();
  await usefulLinksCtrl.addLinkToCategory(req9, res9);
  if (res9.statusCode !== 201 || !res9.body.link?._id) {
    throw new Error(`Expected status 201 for adding individual link, got ${res9.statusCode}`);
  }
  createdLinkId = res9.body.link._id;
  console.log(`  ✅ Passed: Added individual link "${res9.body.link.title}" (ID: ${createdLinkId}). Total links now: ${res9.body.category.links.length}.`);

  // -------------------------------------------------------------
  // TEST 10: Admin Update Individual Link
  // -------------------------------------------------------------
  console.log('\n[Test 10/14] Admin Update individual link title & URL');
  const req10: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'System Administrator' },
    params: { categoryId: createdCategoryId, linkId: createdLinkId },
    body: {
      title: 'National Judicial Data Grid - Public Portal',
      url: 'https://njdg.ecourts.gov.in/njdgnew/index.php'
    }
  };
  const res10 = createMockRes();
  await usefulLinksCtrl.updateLinkInCategory(req10, res10);
  if (res10.statusCode !== 200 || res10.body.link?.title !== 'National Judicial Data Grid - Public Portal') {
    throw new Error(`Expected status 200 and updated link details, got ${res10.statusCode}`);
  }
  console.log(`  ✅ Passed: Updated individual link to "${res10.body.link.title}".`);

  // -------------------------------------------------------------
  // TEST 11: Admin Delete Individual Link
  // -------------------------------------------------------------
  console.log('\n[Test 11/14] Admin Delete individual link from category');
  const req11: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'System Administrator' },
    params: { categoryId: createdCategoryId, linkId: createdLinkId }
  };
  const res11 = createMockRes();
  await usefulLinksCtrl.deleteLinkFromCategory(req11, res11);
  if (res11.statusCode !== 200) {
    throw new Error(`Expected status 200 for deleting link, got ${res11.statusCode}`);
  }
  const linkStillPresent = res11.body.category.links.some((l: any) => String(l._id) === String(createdLinkId));
  if (linkStillPresent) {
    throw new Error(`Link was not deleted from category links array`);
  }
  console.log(`  ✅ Passed: Removed selected link. Remaining links: ${res11.body.category.links.length}. Category still intact.`);

  // -------------------------------------------------------------
  // TEST 12: Admin Update Category Title
  // -------------------------------------------------------------
  console.log('\n[Test 12/14] Admin Update category title');
  const req12: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'System Administrator' },
    params: { id: createdCategoryId },
    body: {
      title: 'Official Judicial & Constitutional Portals'
    }
  };
  const res12 = createMockRes();
  await usefulLinksCtrl.updateCategory(req12, res12);
  if (res12.statusCode !== 200 || res12.body.category.title !== 'Official Judicial & Constitutional Portals') {
    throw new Error(`Expected status 200 and updated category title, got ${res12.statusCode}`);
  }
  console.log(`  ✅ Passed: Category title updated to "${res12.body.category.title}".`);

  // -------------------------------------------------------------
  // TEST 13: Advocate attempt to DELETE Category (Forbidden)
  // -------------------------------------------------------------
  console.log('\n[Test 13/14] Advocate attempt to DELETE category (Denied)');
  const req13: any = {
    user: { id: 'adv_test_1', role: 'Advocate', name: 'Adv. Sharma' },
    params: { id: createdCategoryId }
  };
  const res13 = createMockRes();
  await usefulLinksCtrl.deleteCategory(req13, res13);
  if (res13.statusCode !== 403) {
    throw new Error(`Expected status 403 for Advocate DELETE attempt, got ${res13.statusCode}`);
  }
  console.log(`  ✅ Passed: Rejected Advocate deletion with HTTP 403 Forbidden.`);

  // -------------------------------------------------------------
  // TEST 14: Admin Delete Category with cascading link cleanup
  // -------------------------------------------------------------
  console.log('\n[Test 14/14] Admin Delete category with cascading links removal');
  const req14: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'System Administrator' },
    params: { id: createdCategoryId }
  };
  const res14 = createMockRes();
  await usefulLinksCtrl.deleteCategory(req14, res14);
  if (res14.statusCode !== 200) {
    throw new Error(`Expected status 200 for deleting category, got ${res14.statusCode}`);
  }
  console.log(`  ✅ Passed: ${res14.body.message}`);

  // Confirm category is gone
  const reqCheck: any = {
    user: { id: 'admin_test_1', role: 'Admin', name: 'System Administrator' },
    params: { id: createdCategoryId }
  };
  const resCheck = createMockRes();
  await usefulLinksCtrl.getCategoryById(reqCheck, resCheck);
  if (resCheck.statusCode !== 404) {
    throw new Error(`Expected status 404 after category deletion, got ${resCheck.statusCode}`);
  }
  console.log(`  ✅ Passed: Confirmed category is no longer accessible (HTTP 404).`);

  console.log('\n🎉 ALL 14 USEFUL LINKS INTEGRATION & ROLE PERMISSION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
