import { calculateHinduSuccession } from '../services/hinduSuccessionEngine';

console.log('=====================================================');
console.log('⚖️ HINDU SUCCESSION ENGINE — AUTOMATED SUITE TESTS ⚖️');
console.log('=====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
    if (detail) console.log(`   └─ ${detail}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (detail) console.error(`   └─ ${detail}`);
  }
}

// -------------------------------------------------------------
// TEST 1: Male deceased + widow + 1 son + 1 daughter
// -------------------------------------------------------------
const res1 = calculateHinduSuccession({
  deceasedGender: 'male',
  successionType: 'intestate',
  propertyType: 'self_acquired',
  widowsCount: 1,
  survivingSonsCount: 1,
  survivingDaughtersCount: 1,
  motherAlive: false
});

assert(
  res1.reconciled && res1.heirs.length === 3 && res1.heirs.every(h => Math.abs(h.fractionValue - 1/3) < 0.001),
  'Test 1: Male deceased + widow + 1 son + 1 daughter',
  `Shares: ${res1.heirs.map(h => `${h.heirName}=${h.fractionStr}`).join(', ')} (Sum: ${res1.totalFractionSum})`
);

// -------------------------------------------------------------
// TEST 2: Male deceased + widow + multiple sons/daughters + mother
// -------------------------------------------------------------
const res2 = calculateHinduSuccession({
  deceasedGender: 'male',
  successionType: 'intestate',
  propertyType: 'self_acquired',
  widowsCount: 1,
  motherAlive: true,
  survivingSonsCount: 2,
  survivingDaughtersCount: 1
});

assert(
  res2.reconciled && res2.heirs.length === 5 && res2.heirs.every(h => Math.abs(h.fractionValue - 1/5) < 0.001),
  'Test 2: Male deceased + widow + 2 sons + 1 daughter + mother',
  `5 Class I heads = 1/5 (20%) each. Total fraction sum: ${res2.totalFractionSum}`
);

// -------------------------------------------------------------
// TEST 3: Male deceased + pre-deceased son branch
// -------------------------------------------------------------
const res3 = calculateHinduSuccession({
  deceasedGender: 'male',
  successionType: 'intestate',
  propertyType: 'self_acquired',
  widowsCount: 1,
  survivingSonsCount: 1,
  survivingDaughtersCount: 0,
  motherAlive: false,
  preDeceasedSonsCount: 1,
  preDeceasedSonsBranches: [
    { id: 'b1', widowAlive: true, survivingSonsCount: 1, survivingDaughtersCount: 1 }
  ]
});

// Main heads = Widow(1/3), Son(1/3), Pre-deceased Son Branch(1/3). Branch split 3 ways = 1/9 each.
const pdSonWidowShare = res3.heirs.find(h => h.id === 'pd_son_1_widow')?.fractionValue;
assert(
  res3.reconciled && res3.heirs.length === 5 && Math.abs((pdSonWidowShare || 0) - 1/9) < 0.001,
  'Test 3: Male deceased + pre-deceased son branch (Widow + Grandson + Granddaughter)',
  `Main branches=1/3, Pre-deceased branch sub-shares=1/9 each. Total sum: ${res3.totalFractionSum}`
);

// -------------------------------------------------------------
// TEST 4: Male deceased + pre-deceased daughter branch
// -------------------------------------------------------------
const res4 = calculateHinduSuccession({
  deceasedGender: 'male',
  successionType: 'intestate',
  propertyType: 'self_acquired',
  widowsCount: 1,
  survivingSonsCount: 1,
  survivingDaughtersCount: 0,
  motherAlive: false,
  preDeceasedDaughtersCount: 1,
  preDeceasedDaughtersBranches: [
    { id: 'b1', survivingSonsCount: 1, survivingDaughtersCount: 1 }
  ]
});

// Main heads = Widow(1/3), Son(1/3), Pre-deceased daughter branch(1/3). Branch split 2 ways = 1/6 each.
const pdDaughterSonShare = res4.heirs.find(h => h.id === 'pd_daughter_1_son_1')?.fractionValue;
assert(
  res4.reconciled && Math.abs((pdDaughterSonShare || 0) - 1/6) < 0.001,
  'Test 4: Male deceased + pre-deceased daughter branch (2 Grandchildren)',
  `Pre-deceased daughter's children get 1/6 each. Total sum: ${res4.totalFractionSum}`
);

// -------------------------------------------------------------
// TEST 5: Female deceased + husband + son + daughter
// -------------------------------------------------------------
const res5 = calculateHinduSuccession({
  deceasedGender: 'female',
  successionType: 'intestate',
  propertyType: 'self_acquired',
  husbandAlive: true,
  femaleSonsCount: 1,
  femaleDaughtersCount: 1
});

assert(
  res5.reconciled && res5.heirs.length === 3 && res5.heirs.every(h => Math.abs(h.fractionValue - 1/3) < 0.001),
  'Test 5: Female deceased + husband + 1 son + 1 daughter',
  `Section 15(1)(a) equal distribution 1/3 each. Total sum: ${res5.totalFractionSum}`
);

// -------------------------------------------------------------
// TEST 6: Female deceased without husband/children (Section 15(2)(a) Father property)
// -------------------------------------------------------------
const res6 = calculateHinduSuccession({
  deceasedGender: 'female',
  successionType: 'intestate',
  propertyType: 'inherited_father',
  femalePropertySource: 'inherited_father',
  husbandAlive: false,
  femaleSonsCount: 0,
  femaleDaughtersCount: 0
});

assert(
  res6.reconciled && res6.heirs.some(h => h.category === 'Section 15(2)(a)'),
  'Test 6: Female deceased without issue, property inherited from father',
  `Applies Section 15(2)(a) devolving property upon Heirs of Father. Reconciled: ${res6.reconciled}`
);

// -------------------------------------------------------------
// TEST 7: Coparcenary property including daughter coparcener
// -------------------------------------------------------------
const res7 = calculateHinduSuccession({
  deceasedGender: 'male',
  successionType: 'coparcenary',
  propertyType: 'ancestral_coparcenary',
  dateOfDeath: '2021-05-15',
  coparcenarySonsCount: 1,
  coparcenaryDaughtersCount: 1,
  survivingSonsCount: 1,
  survivingDaughtersCount: 1,
  widowsCount: 1,
  motherAlive: false
});

// Total coparceners = Deceased(1) + Son(1) + Daughter(1) = 3 coparceners -> 1/3 each.
// Deceased's 1/3 is divided among Class I heirs (Widow, Son, Daughter = 3 heads) -> 1/9 each.
// Total Son = 1/3 (coparcenary) + 1/9 (inherited) = 4/9 (~44.44%).
// Total Daughter = 1/3 + 1/9 = 4/9 (~44.44%).
// Total Widow = 1/9 (~11.11%). Sum = 4/9 + 4/9 + 1/9 = 9/9 = 1.
assert(
  res7.reconciled && res7.heirs.length === 3 && Math.abs(res7.totalFractionSum - 1.0) < 0.001,
  'Test 7: Coparcenary property post-2005 (Vineeta Sharma rule)',
  `Notional partition executed. Son: ${res7.heirs[0].percentageStr}, Daughter: ${res7.heirs[1].percentageStr}, Widow: ${res7.heirs[2].percentageStr}`
);

// -------------------------------------------------------------
// TEST 8: Property value supplied
// -------------------------------------------------------------
const res8 = calculateHinduSuccession({
  deceasedGender: 'male',
  successionType: 'intestate',
  propertyType: 'self_acquired',
  estimatedPropertyValue: 6000000,
  widowsCount: 1,
  survivingSonsCount: 1,
  survivingDaughtersCount: 1
});

const totalRupeeSum = res8.heirs.reduce((acc, h) => acc + (h.estimatedRupeeValue || 0), 0);
assert(
  res8.reconciled && res8.heirs.every(h => h.estimatedRupeeValue === 2000000),
  'Test 8: Property value of ₹ 60,00,000 supplied',
  `Each heir receives ₹ 20,00,000 (Total Rupee Sum: ₹ ${totalRupeeSum.toLocaleString()})`
);

console.log('\n=====================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED CLEANLY.`);
console.log('=====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
