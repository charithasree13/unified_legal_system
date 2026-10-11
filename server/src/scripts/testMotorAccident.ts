import { calculateMotorAccidentCompensation, MotorAccidentClaimInput } from '../services/motorAccidentEngine';
import { getSarlaVermaMultiplier, getFutureProspectsPercentage, getPersonalExpenseDeduction } from '../data/motorAccidentRules';

console.log('⚖️  === MOTOR ACCIDENT COMPENSATION CALCULATOR (MACT) AUTOMATED VERIFICATION ===\n');

let failedCount = 0;

function assertEqual(actual: any, expected: any, label: string) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${label} -> Received: ${actual}`);
  } else {
    console.error(`  ❌ FAIL: ${label} -> Expected: ${expected}, but got: ${actual}`);
    failedCount++;
  }
}

// 1. Sarla Verma Multiplier
console.log('[1/6] Validating Sarla Verma (2009) 6 SCC 121 Multiplier Table:');
assertEqual(getSarlaVermaMultiplier(12).multiplier, 15, 'Child under 15 multiplier');
assertEqual(getSarlaVermaMultiplier(20).multiplier, 18, 'Age 20 multiplier');
assertEqual(getSarlaVermaMultiplier(25).multiplier, 18, 'Age 25 multiplier');
assertEqual(getSarlaVermaMultiplier(30).multiplier, 17, 'Age 30 multiplier');
assertEqual(getSarlaVermaMultiplier(35).multiplier, 16, 'Age 35 multiplier');
assertEqual(getSarlaVermaMultiplier(40).multiplier, 15, 'Age 40 multiplier');
assertEqual(getSarlaVermaMultiplier(45).multiplier, 14, 'Age 45 multiplier');
assertEqual(getSarlaVermaMultiplier(50).multiplier, 13, 'Age 50 multiplier');
assertEqual(getSarlaVermaMultiplier(55).multiplier, 11, 'Age 55 multiplier');
assertEqual(getSarlaVermaMultiplier(60).multiplier, 9, 'Age 60 multiplier');
assertEqual(getSarlaVermaMultiplier(65).multiplier, 7, 'Age 65 multiplier');
assertEqual(getSarlaVermaMultiplier(68).multiplier, 5, 'Above 65 multiplier');

// 2. Future Prospects
console.log('\n[2/6] Validating Pranay Sethi (2017) 16 SCC 680 Future Prospects Addition:');
assertEqual(getFutureProspectsPercentage(30, 'salaried_permanent').percentage, 50, 'Salaried < 40 (+50%)');
assertEqual(getFutureProspectsPercentage(45, 'salaried_permanent').percentage, 30, 'Salaried 40-50 (+30%)');
assertEqual(getFutureProspectsPercentage(55, 'salaried_permanent').percentage, 15, 'Salaried 50-60 (+15%)');
assertEqual(getFutureProspectsPercentage(62, 'salaried_permanent').percentage, 0, 'Salaried > 60 (0%)');
assertEqual(getFutureProspectsPercentage(32, 'self_employed_fixed').percentage, 40, 'Self-employed < 40 (+40%)');
assertEqual(getFutureProspectsPercentage(47, 'self_employed_fixed').percentage, 25, 'Self-employed 40-50 (+25%)');
assertEqual(getFutureProspectsPercentage(54, 'self_employed_fixed').percentage, 10, 'Self-employed 50-60 (+10%)');

// 3. Personal Expense Deductions
console.log('\n[3/6] Validating Sarla Verma Personal Expense Deductions:');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 1).deductionRatio.toFixed(2)), 0.50, 'Bachelor standard deduction (50%)');
assertEqual(Number(getPersonalExpenseDeduction('bachelor', 3, true).deductionRatio.toFixed(2)), 0.33, 'Bachelor large family deduction (33%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 1).deductionRatio.toFixed(2)), 0.50, 'Married 1 dependent (50%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 3).deductionRatio.toFixed(2)), 0.33, 'Married 2-3 dependants (33%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 5).deductionRatio.toFixed(2)), 0.25, 'Married 4-6 dependants (25%)');
assertEqual(Number(getPersonalExpenseDeduction('married', 8).deductionRatio.toFixed(2)), 0.20, 'Married >6 dependants (20%)');

// 4. Test Case 1: Death - Salaried 32yo, Married, 3 Dependants
console.log('\n[4/6] Validating Comprehensive Death Compensation Case:');
const testDeath: MotorAccidentClaimInput = {
  claimType: 'death',
  accidentDate: '2024-01-10',
  deathDetails: {
    ageAtAccident: 32,
    employmentCategory: 'salaried_permanent',
    incomePeriod: 'monthly',
    incomeAmount: 50000,
    annualIncomeTax: 20000,
    maritalStatus: 'married',
    dependantsCount: 3,
    consortiumClaimants: { spouses: 1, children: 2, parents: 2 },
    useEnhancedConventionalHeads: true
  }
};
const resDeath = calculateMotorAccidentCompensation(testDeath);
assertEqual(resDeath.totalEstimatedCompensation, 9558300, 'Death total compensation ₹95,58,300');
assertEqual(resDeath.statutoryNoFaultBenchmark.statutoryFixedAmount, 500000, 'Section 164 Statutory fixed baseline ₹5,00,000');

// 5. Test Case 2: Permanent Disability (Raj Kumar 2011 & Pappu Deo Yadav 2022)
console.log('\n[5/6] Validating Permanent Disability Compensation Case:');
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
assertEqual(resDisability.statutoryNoFaultBenchmark.statutoryFixedAmount, 250000, 'Section 164 Grievous Hurt baseline ₹2,50,000');

// 6. Test Case 3: Loss of Income & Medical Items
console.log('\n[6/6] Validating Pecuniary Treatment Losses & Medical Expenses:');
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

if (failedCount === 0) {
  console.log('\n🎉 ALL MOTOR ACCIDENT COMPENSATION CALCULATOR TESTS PASSED WITH 100% SUCCESS!\n');
} else {
  console.error(`\n❌ ${failedCount} TESTS FAILED.`);
  process.exit(1);
}
