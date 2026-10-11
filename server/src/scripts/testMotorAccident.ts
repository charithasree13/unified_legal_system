import { calculateMotorAccidentCompensation, MotorAccidentClaimInput } from '../services/motorAccidentEngine';
import {
  getSarlaVermaMultiplier,
  getFutureProspectsPercentage,
  getPersonalExpenseDeduction,
  getConventionalHeadsRates
} from '../data/motorAccidentRules';

console.log('⚖️  === MOTOR ACCIDENT COMPENSATION CALCULATOR (MACT) REGRESSION SUITE ===\n');

let failedCount = 0;

function assertEqual(actual: any, expected: any, label: string) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${label} -> Received: ${actual}`);
  } else {
    console.error(`  ❌ FAIL: ${label} -> Expected: ${expected}, but got: ${actual}`);
    failedCount++;
  }
}

// -----------------------------------------------------------------------------
// 1. Multiplier Table Verification (Sarla Verma 2009 Para 42 & Pranay Sethi 2017)
// -----------------------------------------------------------------------------
console.log('[1/7] Validating Sarla Verma Multiplier Schedule (including Age 32):');
assertEqual(getSarlaVermaMultiplier(12).multiplier, 15, 'Child under 15 multiplier');
assertEqual(getSarlaVermaMultiplier(20).multiplier, 18, 'Age 20 multiplier');
assertEqual(getSarlaVermaMultiplier(25).multiplier, 18, 'Age 25 multiplier');
assertEqual(getSarlaVermaMultiplier(30).multiplier, 17, 'Age 30 multiplier');
assertEqual(getSarlaVermaMultiplier(32).multiplier, 16, 'Age 32 multiplier (Sarla Verma Para 42 Table)');
assertEqual(getSarlaVermaMultiplier(35).multiplier, 16, 'Age 35 multiplier');
assertEqual(getSarlaVermaMultiplier(40).multiplier, 15, 'Age 40 multiplier');
assertEqual(getSarlaVermaMultiplier(45).multiplier, 14, 'Age 45 multiplier');
assertEqual(getSarlaVermaMultiplier(50).multiplier, 13, 'Age 50 multiplier');
assertEqual(getSarlaVermaMultiplier(55).multiplier, 11, 'Age 55 multiplier');
assertEqual(getSarlaVermaMultiplier(60).multiplier, 9, 'Age 60 multiplier');
assertEqual(getSarlaVermaMultiplier(65).multiplier, 7, 'Age 65 multiplier');
assertEqual(getSarlaVermaMultiplier(68).multiplier, 5, 'Above 65 multiplier');

// -----------------------------------------------------------------------------
// 2. Future Prospects Verification (Pranay Sethi 2017 Constitution Bench)
// -----------------------------------------------------------------------------
console.log('\n[2/7] Validating Future Prospects Scale:');
assertEqual(getFutureProspectsPercentage(32, 'salaried_permanent').percentage, 50, 'Age 32 Permanent Salaried (+50%)');
assertEqual(getFutureProspectsPercentage(45, 'salaried_permanent').percentage, 30, 'Age 45 Permanent Salaried (+30%)');
assertEqual(getFutureProspectsPercentage(55, 'salaried_permanent').percentage, 15, 'Age 55 Permanent Salaried (+15%)');
assertEqual(getFutureProspectsPercentage(62, 'salaried_permanent').percentage, 0, 'Age >60 Permanent Salaried (0%)');
assertEqual(getFutureProspectsPercentage(32, 'self_employed_fixed').percentage, 40, 'Age 32 Self-employed (+40%)');
assertEqual(getFutureProspectsPercentage(47, 'self_employed_fixed').percentage, 25, 'Age 47 Self-employed (+25%)');
assertEqual(getFutureProspectsPercentage(54, 'self_employed_fixed').percentage, 10, 'Age 54 Self-employed (+10%)');

// -----------------------------------------------------------------------------
// 3. Personal Expense Deductions (Sarla Verma Paras 30-32 & Pranay Sethi)
// -----------------------------------------------------------------------------
console.log('\n[3/7] Validating Personal Expense Deductions for 3, 4, 6, 7 Dependants & Marital Scenarios:');

// Married Deceased Scenarios (Para 30)
assertEqual(Number(getPersonalExpenseDeduction('married', 1).deductionRatio.toFixed(4)), 0.5000, 'Married 1 dependant -> 1/2 (50%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 2).deductionRatio.toFixed(4)), 0.3333, 'Married 2 dependants -> 1/3 (33.33%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 3).deductionRatio.toFixed(4)), 0.3333, 'Married 3 dependants -> 1/3 (33.33%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 4).deductionRatio.toFixed(4)), 0.2500, 'Married 4 dependants -> 1/4 (25.00%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 5).deductionRatio.toFixed(4)), 0.2500, 'Married 5 dependants -> 1/4 (25.00%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 6).deductionRatio.toFixed(4)), 0.2500, 'Married 6 dependants -> 1/4 (25.00%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 7).deductionRatio.toFixed(4)), 0.2000, 'Married 7 dependants -> 1/5 (20.00%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 8).deductionRatio.toFixed(4)), 0.2000, 'Married 8 dependants -> 1/5 (20.00%)');

// Bachelor Deceased Scenarios (Paras 31-32) - Note: Married deduction scales (1/4th, 1/5th) do NOT apply indiscriminately
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 1).deductionRatio.toFixed(4)), 0.5000, 'Bachelor 1 dependant -> 1/2 (50%)');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 2).deductionRatio.toFixed(4)), 0.5000, 'Bachelor 2 dependants (standard) -> 1/2 (50%)');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 3).deductionRatio.toFixed(4)), 0.3333, 'Bachelor 3 dependants (large family) -> 1/3 (33.33%)');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 4).deductionRatio.toFixed(4)), 0.3333, 'Bachelor 4 dependants -> 1/3 (33.33% - NOT 1/4th)');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 6).deductionRatio.toFixed(4)), 0.3333, 'Bachelor 6 dependants -> 1/3 (33.33% - NOT 1/4th)');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 7).deductionRatio.toFixed(4)), 0.3333, 'Bachelor 7 dependants -> 1/3 (33.33% - NOT 1/5th)');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 2, true).deductionRatio.toFixed(4)), 0.3333, 'Bachelor with explicit large family flag -> 1/3 (33.33%)');

// -----------------------------------------------------------------------------
// 4. Conventional Heads Triennial Indexation (Pranay Sethi Para 52, 59.8)
// -----------------------------------------------------------------------------
console.log('\n[4/7] Validating Conventional Heads Triennial Indexation:');
const pre2020Rates = getConventionalHeadsRates('2019-05-10');
assertEqual(pre2020Rates.lossOfEstate, 15000, 'Pre-2020 Estate base ₹15,000');
assertEqual(pre2020Rates.funeralExpenses, 15000, 'Pre-2020 Funeral base ₹15,000');
assertEqual(pre2020Rates.consortiumPerPerson, 40000, 'Pre-2020 Consortium base ₹40,000');

const triennial1Rates = getConventionalHeadsRates('2021-08-15');
assertEqual(triennial1Rates.lossOfEstate, 16500, '2020-2023 Estate +10% ₹16,500');
assertEqual(triennial1Rates.funeralExpenses, 16500, '2020-2023 Funeral +10% ₹16,500');
assertEqual(triennial1Rates.consortiumPerPerson, 44000, '2020-2023 Consortium +10% ₹44,000');

const triennial2Rates = getConventionalHeadsRates('2024-01-10');
assertEqual(triennial2Rates.lossOfEstate, 18150, '2023+ Estate +21% ₹18,150');
assertEqual(triennial2Rates.funeralExpenses, 18150, '2023+ Funeral +21% ₹18,150');
assertEqual(triennial2Rates.consortiumPerPerson, 48400, '2023+ Consortium +21% ₹48,400');

// -----------------------------------------------------------------------------
// 5. TEST CASE: USER SPECIFIED BENCHMARK TEST (Age 32, Salaried, ₹50k/mo, Tax ₹0, Married, 4 Dependants)
// -----------------------------------------------------------------------------
console.log('\n[5/7] Validating User Stated Benchmark Test Case:');
console.log('  Facts: Age 32, Permanent salaried, ₹50,000/mo, ₹0 Tax, Married, 4 Dependants.');
console.log('  Expected: Annual ₹6,00,000, Prospects ₹3,00,000, Adjusted ₹9,00,000, Deduction 25% (₹2,25,000), Annual Loss ₹6,75,000, Loss of Dependency = ₹1,08,00,000');

const benchmarkInput: MotorAccidentClaimInput = {
  claimType: 'death',
  accidentDate: '2024-01-15',
  caseReferenceNumber: 'BENCHMARK-TEST-4-DEPENDANTS',
  deathDetails: {
    ageAtAccident: 32,
    employmentCategory: 'salaried_permanent',
    incomePeriod: 'monthly',
    incomeAmount: 50000,
    annualIncomeTax: 0,
    maritalStatus: 'married',
    dependantsCount: 4,
    consortiumClaimants: {
      spouses: 1,
      children: 2,
      parents: 1
    },
    useEnhancedConventionalHeads: true
  }
};

const benchmarkResult = calculateMotorAccidentCompensation(benchmarkInput);
const dependencyHead = benchmarkResult.itemisedHeads.find(h => h.head === 'Loss of Dependency');

assertEqual(benchmarkResult.claimantSummary.establishedAnnualIncome, 600000, 'Annual established income ₹6,00,000');
assertEqual(dependencyHead?.amount, 10800000, 'Loss of dependency exactly ₹1,08,00,000 (NOT ₹96,00,000)');

// Verify intermediate breakdown steps
const stepAdjusted = benchmarkResult.intermediateSteps.find(s => s.stepNumber === 5);
assertEqual(stepAdjusted?.value, '₹9,00,000', 'Intermediate Step 5 Adjusted Annual Income ₹9,00,000');

const stepDeduction = benchmarkResult.intermediateSteps.find(s => s.stepNumber === 6);
assertEqual(stepDeduction?.value, '-₹2,25,000', 'Intermediate Step 6 Personal Deduction 25% = -₹2,25,000');

const stepAnnualLoss = benchmarkResult.intermediateSteps.find(s => s.stepNumber === 7);
assertEqual(stepAnnualLoss?.value, '₹6,75,000', 'Intermediate Step 7 Annual Loss of Dependency ₹6,75,000');

const stepMultiplier = benchmarkResult.intermediateSteps.find(s => s.stepNumber === 8);
assertEqual(stepMultiplier?.value, 'Multiplier: 16', 'Intermediate Step 8 Multiplier 16');

const stepTotalDep = benchmarkResult.intermediateSteps.find(s => s.stepNumber === 9);
assertEqual(stepTotalDep?.value, '₹1,08,00,000', 'Intermediate Step 9 Loss of Dependency ₹1,08,00,000');

// Total compensation: ₹1,08,00,000 + Estate (18,150) + Funeral (18,150) + Spousal (48,400) + 2 Children (96,800) + 1 Parent (48,400) = ₹1,10,29,900
assertEqual(benchmarkResult.totalEstimatedCompensation, 11029900, 'Grand Total Compensation ₹1,10,29,900');

// -----------------------------------------------------------------------------
// 6. Regression Across Dependant Counts: 3, 4, 6, and 7 Dependants
// -----------------------------------------------------------------------------
console.log('\n[6/7] Validating Regression Across 3, 4, 6, and 7 Dependants (Married vs Bachelor):');

// 3 Dependants (Married): 33.33% deduction -> Annual Loss: ₹6,00,000 -> Loss of Dependency: ₹96,00,000
const input3Dep: MotorAccidentClaimInput = {
  ...benchmarkInput,
  deathDetails: { ...benchmarkInput.deathDetails!, dependantsCount: 3 }
};
const res3Dep = calculateMotorAccidentCompensation(input3Dep);
const depHead3 = res3Dep.itemisedHeads.find(h => h.head === 'Loss of Dependency');
assertEqual(depHead3?.amount, 9600000, 'Married 3 Dependants -> Loss of Dependency ₹96,00,000 (33.33% deduction)');

// 4 Dependants (Married): 25.00% deduction -> Annual Loss: ₹6,75,000 -> Loss of Dependency: ₹1,08,00,000
const input4Dep: MotorAccidentClaimInput = {
  ...benchmarkInput,
  deathDetails: { ...benchmarkInput.deathDetails!, dependantsCount: 4 }
};
const res4Dep = calculateMotorAccidentCompensation(input4Dep);
const depHead4 = res4Dep.itemisedHeads.find(h => h.head === 'Loss of Dependency');
assertEqual(depHead4?.amount, 10800000, 'Married 4 Dependants -> Loss of Dependency ₹1,08,00,000 (25.00% deduction)');

// 6 Dependants (Married): 25.00% deduction -> Annual Loss: ₹6,75,000 -> Loss of Dependency: ₹1,08,00,000
const input6Dep: MotorAccidentClaimInput = {
  ...benchmarkInput,
  deathDetails: { ...benchmarkInput.deathDetails!, dependantsCount: 6 }
};
const res6Dep = calculateMotorAccidentCompensation(input6Dep);
const depHead6 = res6Dep.itemisedHeads.find(h => h.head === 'Loss of Dependency');
assertEqual(depHead6?.amount, 10800000, 'Married 6 Dependants -> Loss of Dependency ₹1,08,00,000 (25.00% deduction)');

// 7 Dependants (Married): 20.00% deduction -> Annual Loss: ₹7,20,000 -> Loss of Dependency: ₹1,15,20,000
const input7Dep: MotorAccidentClaimInput = {
  ...benchmarkInput,
  deathDetails: { ...benchmarkInput.deathDetails!, dependantsCount: 7 }
};
const res7Dep = calculateMotorAccidentCompensation(input7Dep);
const depHead7 = res7Dep.itemisedHeads.find(h => h.head === 'Loss of Dependency');
assertEqual(depHead7?.amount, 11520000, 'Married 7 Dependants -> Loss of Dependency ₹1,15,20,000 (20.00% deduction)');

// Bachelor with 4 Dependants: Must deduct 33.33% (NOT 25%): Annual Loss: ₹6,00,000 -> Loss of Dependency: ₹96,00,000
const inputBach4Dep: MotorAccidentClaimInput = {
  ...benchmarkInput,
  deathDetails: {
    ...benchmarkInput.deathDetails!,
    maritalStatus: 'bachelor',
    dependantsCount: 4,
    consortiumClaimants: { spouses: 1, children: 0, parents: 2 } // Note: Spouses should be ignored for bachelor!
  }
};
const resBach4Dep = calculateMotorAccidentCompensation(inputBach4Dep);
const depHeadBach4 = resBach4Dep.itemisedHeads.find(h => h.head === 'Loss of Dependency');
assertEqual(depHeadBach4?.amount, 9600000, 'Bachelor with 4 Dependants -> Loss of Dependency ₹96,00,000 (33.33% deduction, not 25%)');

// Ensure Bachelor has 0 spousal consortium even if erroneous spouse input was provided
const spousalHeadBach = resBach4Dep.itemisedHeads.find(h => h.head.includes('Spousal Consortium'));
assertEqual(spousalHeadBach, undefined, 'Bachelor has 0 Spousal Consortium claimants');

// -----------------------------------------------------------------------------
// 7. Non-Fatal Modules: Permanent Disability & Loss of Income in Treatment
// -----------------------------------------------------------------------------
console.log('\n[7/7] Validating Permanent Disability & Loss of Income Modules:');
const testDisability: MotorAccidentClaimInput = {
  claimType: 'permanent_disability',
  accidentDate: '2024-02-15',
  disabilityDetails: {
    ageAtAccident: 28,
    employmentCategory: 'salaried_permanent',
    incomePeriod: 'monthly',
    incomeAmount: 40000,
    medicalDisabilityPercent: 60,
    functionalDisabilityPercent: 40,
    occupationDetails: 'Civil Site Engineer',
    medicalExpensesIncurred: 250000,
    futureMedicalExpenses: 100000,
    rehabilitationAndAttendant: 50000,
    specialDietAndConveyance: 30000,
    painAndSuffering: 150000,
    lossOfAmenities: 100000
  }
};
const resDisability = calculateMotorAccidentCompensation(testDisability);
assertEqual(resDisability.totalEstimatedCompensation, 5576000, 'Disability total compensation ₹55,76,000');

const testLoss: MotorAccidentClaimInput = {
  claimType: 'loss_of_income_treatment',
  accidentDate: '2024-03-01',
  lossOfIncomeDetails: {
    incomeFrequency: 'monthly',
    incomeAmount: 60000,
    periodUnit: 'months',
    periodValue: 3.5
  }
};
const resLoss = calculateMotorAccidentCompensation(testLoss);
assertEqual(resLoss.totalEstimatedCompensation, 210000, 'Treatment loss of earnings ₹2,10,000');

console.log('\n-------------------------------------------------------------');
if (failedCount === 0) {
  console.log('🎉 ALL MOTOR ACCIDENT REGRESSION SUITE TESTS PASSED WITH 100% SUCCESS!\n');
} else {
  console.error(`❌ ${failedCount} REGRESSION TESTS FAILED.\n`);
  process.exit(1);
}
