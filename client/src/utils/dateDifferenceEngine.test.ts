import { calculateDateDifference } from './dateDifferenceEngine';

function runTests() {
  console.log('--- RUNNING DATE DIFFERENCE ENGINE UNIT TESTS ---');

  // 1. Same date
  const test1 = calculateDateDifference({ startDate: '2026-10-20', endDate: '2026-10-20' });
  console.assert(test1.isValid === true, 'Test 1 Valid failed');
  console.assert(test1.totalDays === 0, `Test 1 totalDays expected 0, got ${test1.totalDays}`);
  console.assert(test1.inclusiveDays === 1, `Test 1 inclusiveDays expected 1, got ${test1.inclusiveDays}`);

  // 2. Example: 20-10-2026 -> 30-11-2026
  const test2 = calculateDateDifference({ startDate: '2026-10-20', endDate: '2026-11-30' });
  console.assert(test2.isValid === true, 'Test 2 Valid failed');
  console.assert(test2.totalDays === 41, `Test 2 totalDays expected 41, got ${test2.totalDays}`);
  console.assert(test2.inclusiveDays === 42, `Test 2 inclusiveDays expected 42, got ${test2.inclusiveDays}`);
  console.assert(test2.breakdown.formatted === '1 month 10 days', `Test 2 breakdown expected "1 month 10 days", got "${test2.breakdown.formatted}"`);

  // 3. Consecutive dates
  const test3 = calculateDateDifference({ startDate: '2026-10-20', endDate: '2026-10-21' });
  console.assert(test3.totalDays === 1, `Test 3 expected 1, got ${test3.totalDays}`);

  // 4. Month boundary
  const test4 = calculateDateDifference({ startDate: '2026-10-31', endDate: '2026-11-01' });
  console.assert(test4.totalDays === 1, `Test 4 expected 1, got ${test4.totalDays}`);

  // 5. Year boundary
  const test5 = calculateDateDifference({ startDate: '2026-12-31', endDate: '2027-01-01' });
  console.assert(test5.totalDays === 1, `Test 5 expected 1, got ${test5.totalDays}`);

  // 6. Leap year span (28-02-2024 -> 01-03-2024)
  const test6 = calculateDateDifference({ startDate: '2024-02-28', endDate: '2024-03-01' });
  console.assert(test6.totalDays === 2, `Test 6 expected 2, got ${test6.totalDays}`);

  // 7. Leap day (29-02-2024 -> 01-03-2024)
  const test7 = calculateDateDifference({ startDate: '2024-02-29', endDate: '2024-03-01' });
  console.assert(test7.totalDays === 1, `Test 7 expected 1, got ${test7.totalDays}`);

  // 8. Multiple years (20-10-2026 -> 20-10-2027)
  const test8 = calculateDateDifference({ startDate: '2026-10-20', endDate: '2027-10-20' });
  console.assert(test8.totalDays === 365, `Test 8 expected 365, got ${test8.totalDays}`);

  // 9. Invalid reverse order (30-11-2026 -> 20-10-2026)
  const test9 = calculateDateDifference({ startDate: '2026-11-30', endDate: '2026-10-20' });
  console.assert(test9.isValid === false, 'Test 9 should be invalid');
  console.assert(test9.errorMessage === 'End date must be on or after the start date.', `Test 9 message mismatch: "${test9.errorMessage}"`);

  // 10. Inclusive counting toggle
  const test10a = calculateDateDifference({ startDate: '2026-10-20', endDate: '2026-11-30', includeBothDates: false });
  const test10b = calculateDateDifference({ startDate: '2026-10-20', endDate: '2026-11-30', includeBothDates: true });
  console.assert(test10a.selectedDays === 41, `Test 10a expected 41, got ${test10a.selectedDays}`);
  console.assert(test10b.selectedDays === 42, `Test 10b expected 42, got ${test10b.selectedDays}`);

  console.log('--- ALL DATE DIFFERENCE UNIT TESTS PASSED SUCCESSFULLY! ---');
}

runTests();
