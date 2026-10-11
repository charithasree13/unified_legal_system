import {
  calculateMotorAccidentCompensation,
  formatINR,
  type MotorAccidentClaimInput
} from './motorAccidentEngine';
import {
  getSarlaVermaMultiplier,
  getFutureProspectsPercentage,
  getPersonalExpenseDeduction,
  getConventionalHeadsRates
} from '../data/motorAccidentRules';

/**
 * Self-verification test suite for Motor Accident Compensation Calculator (MACT) Engine
 * Verifies formulas against Sarla Verma (2009), Pranay Sethi (2017), Magma (2018), and Raj Kumar (2011)
 */
export const runMotorAccidentEngineTests = (): boolean => {
  let passed = true;

  // Helper assertion
  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      console.error(`❌ MACT Test Failed: ${msg}`);
      passed = false;
    }
  };

  // 1. MULTIPLIER VERIFICATION (Sarla Verma 2009, Para 42)
  assert(getSarlaVermaMultiplier(14).multiplier === 15, 'Child under 15 multiplier should be 15');
  assert(getSarlaVermaMultiplier(19).multiplier === 18, 'Age 19 multiplier should be 18');
  assert(getSarlaVermaMultiplier(24).multiplier === 18, 'Age 24 multiplier should be 18');
  assert(getSarlaVermaMultiplier(28).multiplier === 17, 'Age 28 multiplier should be 17');
  assert(getSarlaVermaMultiplier(32).multiplier === 16, 'Age 32 multiplier should be 16');
  assert(getSarlaVermaMultiplier(33).multiplier === 16, 'Age 33 multiplier should be 16');
  assert(getSarlaVermaMultiplier(38).multiplier === 15, 'Age 38 multiplier should be 15');
  assert(getSarlaVermaMultiplier(43).multiplier === 14, 'Age 43 multiplier should be 14');
  assert(getSarlaVermaMultiplier(48).multiplier === 13, 'Age 48 multiplier should be 13');
  assert(getSarlaVermaMultiplier(53).multiplier === 11, 'Age 53 multiplier should be 11');
  assert(getSarlaVermaMultiplier(58).multiplier === 9, 'Age 58 multiplier should be 9');
  assert(getSarlaVermaMultiplier(63).multiplier === 7, 'Age 63 multiplier should be 7');
  assert(getSarlaVermaMultiplier(70).multiplier === 5, 'Age 70 multiplier should be 5');

  // 2. FUTURE PROSPECTS VERIFICATION (Pranay Sethi 2017, Para 59.3 & 59.4)
  assert(getFutureProspectsPercentage(32, 'salaried_permanent').percentage === 50, 'Salaried < 40 should be +50%');
  assert(getFutureProspectsPercentage(45, 'salaried_permanent').percentage === 30, 'Salaried 40-50 should be +30%');
  assert(getFutureProspectsPercentage(55, 'salaried_permanent').percentage === 15, 'Salaried 50-60 should be +15%');
  assert(getFutureProspectsPercentage(65, 'salaried_permanent').percentage === 0, 'Salaried > 60 should be 0%');

  assert(getFutureProspectsPercentage(35, 'self_employed_fixed').percentage === 40, 'Self-employed < 40 should be +40%');
  assert(getFutureProspectsPercentage(48, 'self_employed_fixed').percentage === 25, 'Self-employed 40-50 should be +25%');
  assert(getFutureProspectsPercentage(58, 'self_employed_fixed').percentage === 10, 'Self-employed 50-60 should be +10%');
  assert(getFutureProspectsPercentage(62, 'self_employed_fixed').percentage === 0, 'Self-employed > 60 should be 0%');

  // 3. PERSONAL LIVING EXPENSES DEDUCTION (Sarla Verma 2009, Para 30-32)
  // Married deceased rules:
  assert(Math.abs(getPersonalExpenseDeduction('married', 1).deductionRatio - 0.5) < 0.001, 'Married with 1 dependent should be 1/2 (50%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 2).deductionRatio - (1 / 3)) < 0.001, 'Married with 2 dependants should be 1/3rd (33.3%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 3).deductionRatio - (1 / 3)) < 0.001, 'Married with 3 dependants should be 1/3rd (33.3%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 4).deductionRatio - 0.25) < 0.001, 'Married with 4 dependants should be 1/4th (25%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 5).deductionRatio - 0.25) < 0.001, 'Married with 5 dependants should be 1/4th (25%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 6).deductionRatio - 0.25) < 0.001, 'Married with 6 dependants should be 1/4th (25%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 7).deductionRatio - 0.2) < 0.001, 'Married with 7 dependants should be 1/5th (20%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 8).deductionRatio - 0.2) < 0.001, 'Married with >6 dependants should be 1/5th (20%)');

  // Bachelor deceased rules (Paras 31-32):
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 1).deductionRatio - 0.5) < 0.001, 'Bachelor standard deduction should be 1/2 (50%)');
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 2).deductionRatio - 0.5) < 0.001, 'Bachelor 2 dependants standard deduction should be 1/2 (50%)');
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 3).deductionRatio - (1 / 3)) < 0.001, 'Bachelor large family deduction should be 1/3rd (33.3%)');
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 4).deductionRatio - (1 / 3)) < 0.001, 'Bachelor 4 dependants should be 1/3rd (NOT 1/4th)');
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 6).deductionRatio - (1 / 3)) < 0.001, 'Bachelor 6 dependants should be 1/3rd (NOT 1/4th)');
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 7).deductionRatio - (1 / 3)) < 0.001, 'Bachelor 7 dependants should be 1/3rd (NOT 1/5th)');
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 2, true).deductionRatio - (1 / 3)) < 0.001, 'Bachelor with large family flag should be 1/3rd');

  // 4. USER BENCHMARK TEST CASE:
  // Facts: Age 32, Permanent Salaried, Monthly ₹50,000, Tax ₹0, Married, 4 Dependants.
  // Multiplier: 16
  // Annual Income = ₹6,00,000
  // Future Prospects (50%) = ₹3,00,000
  // Adjusted Annual Income = ₹9,00,000
  // Personal Expense Deduction (25%) = ₹2,25,000
  // Annual Loss of Dependency = ₹6,75,000
  // Total Loss of Dependency = ₹6,75,000 × 16 = ₹1,08,00,000
  const benchmarkInput: MotorAccidentClaimInput = {
    claimType: 'death',
    accidentDate: '2024-01-15',
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
  const depHead = benchmarkResult.itemisedHeads.find(h => h.head === 'Loss of Dependency');
  assert(depHead?.amount === 10800000, `Benchmark Loss of dependency should be ₹1,08,00,000, got ${depHead?.amount}`);

  // Check 3 dependants (Loss of dependency: 9,00,000 * 2/3 * 16 = ₹96,00,000)
  const res3 = calculateMotorAccidentCompensation({
    ...benchmarkInput,
    deathDetails: { ...benchmarkInput.deathDetails!, dependantsCount: 3 }
  });
  const dep3 = res3.itemisedHeads.find(h => h.head === 'Loss of Dependency');
  assert(dep3?.amount === 9600000, `Married 3 dependants should be ₹96,00,000, got ${dep3?.amount}`);

  // Check 6 dependants (Loss of dependency: 9,00,000 * 3/4 * 16 = ₹1,08,00,000)
  const res6 = calculateMotorAccidentCompensation({
    ...benchmarkInput,
    deathDetails: { ...benchmarkInput.deathDetails!, dependantsCount: 6 }
  });
  const dep6 = res6.itemisedHeads.find(h => h.head === 'Loss of Dependency');
  assert(dep6?.amount === 10800000, `Married 6 dependants should be ₹1,08,00,000, got ${dep6?.amount}`);

  // Check 7 dependants (Loss of dependency: 9,00,000 * 4/5 * 16 = ₹1,15,20,000)
  const res7 = calculateMotorAccidentCompensation({
    ...benchmarkInput,
    deathDetails: { ...benchmarkInput.deathDetails!, dependantsCount: 7 }
  });
  const dep7 = res7.itemisedHeads.find(h => h.head === 'Loss of Dependency');
  assert(dep7?.amount === 11520000, `Married 7 dependants should be ₹1,15,20,000, got ${dep7?.amount}`);

  // 5. TEST CASE 2: PERMANENT DISABILITY (28yo, Salaried, 60% Medical, 40% Functional)
  const case2Input: MotorAccidentClaimInput = {
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

  const case2Result = calculateMotorAccidentCompensation(case2Input);
  assert(case2Result.totalEstimatedCompensation === 5576000, `Case 2 disability total should be ₹55,76,000, got ${case2Result.totalEstimatedCompensation}`);

  // 6. TEST CASE 3: LOSS OF INCOME DURING TREATMENT (3.5 months at ₹60,000/mo)
  const case3Input: MotorAccidentClaimInput = {
    claimType: 'loss_of_income_treatment',
    accidentDate: '2024-03-01',
    lossOfIncomeDetails: {
      incomeFrequency: 'monthly',
      incomeAmount: 60000,
      periodUnit: 'months',
      periodValue: 3.5
    }
  };

  const case3Result = calculateMotorAccidentCompensation(case3Input);
  assert(case3Result.totalEstimatedCompensation === 210000, `Case 3 treatment total should be ₹2,10,000, got ${case3Result.totalEstimatedCompensation}`);

  return passed;
};
