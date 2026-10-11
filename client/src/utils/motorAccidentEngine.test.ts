import {
  calculateMotorAccidentCompensation,
  formatINR,
  type MotorAccidentClaimInput
} from './motorAccidentEngine';
import {
  getSarlaVermaMultiplier,
  getFutureProspectsPercentage,
  getPersonalExpenseDeduction
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
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 1).deductionRatio - 0.5) < 0.001, 'Bachelor standard deduction should be 1/2 (50%)');
  assert(Math.abs(getPersonalExpenseDeduction('bachelor', 3, true).deductionRatio - (1 / 3)) < 0.001, 'Bachelor large family deduction should be 1/3rd (33.3%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 1).deductionRatio - 0.5) < 0.001, 'Married with 1 dependent should be 1/2 (50%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 3).deductionRatio - (1 / 3)) < 0.001, 'Married with 2-3 dependants should be 1/3rd (33.3%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 5).deductionRatio - 0.25) < 0.001, 'Married with 4-6 dependants should be 1/4th (25%)');
  assert(Math.abs(getPersonalExpenseDeduction('married', 7).deductionRatio - 0.2) < 0.001, 'Married with >6 dependants should be 1/5th (20%)');

  // 4. TEST CASE 1: FULL DEATH CALCULATION (Salaried 32yo, Married, 3 Dependants)
  // Base Net = 6,00,000 - 20,000 = 5,80,000.
  // Prospects (+50%) = 2,90,000 => Adjusted = 8,70,000.
  // Deduction (1/3) = 2,90,000 => Annual Loss = 5,80,000.
  // Multiplier = 16 => Loss of Dependency = 92,80,000.
  // Conventional: Estate (18,150) + Funeral (18,150) + Spousal (48,400) + 2 Children (96,800) + 2 Parents (96,800) = 2,78,300.
  // Total = 95,58,300.
  const case1Input: MotorAccidentClaimInput = {
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
      consortiumClaimants: {
        spouses: 1,
        children: 2,
        parents: 2
      },
      useEnhancedConventionalHeads: true
    }
  };

  const case1Result = calculateMotorAccidentCompensation(case1Input);
  assert(case1Result.totalEstimatedCompensation === 9558300, `Case 1 total should be ₹95,58,300, got ${case1Result.totalEstimatedCompensation}`);

  // 5. TEST CASE 2: PERMANENT DISABILITY (28yo, Salaried, 60% Medical, 40% Functional)
  // Adjusted Annual = (4,80,000 + 50%) = 7,20,000.
  // Multiplier = 17.
  // Future Earning Loss = 7,20,000 * 17 * 0.40 = 48,96,000.
  // Pecuniary Medical = 2,50,000 + 1,00,000 + 50,000 + 30,000 = 4,30,000.
  // Non-pecuniary = 1,50,000 + 1,00,000 = 2,50,000.
  // Grand Total = 48,96,000 + 4,30,000 + 2,50,000 = 55,76,000.
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
      periodValue: 3.5,
      medicalLeaveBasis: 'Orthopaedic inpatient stay and certified bedrest'
    }
  };
  const case3Result = calculateMotorAccidentCompensation(case3Input);
  assert(case3Result.totalEstimatedCompensation === 210000, `Case 3 loss of income should be ₹2,10,000, got ${case3Result.totalEstimatedCompensation}`);

  // 7. TEST CASE 4: INJURY & MEDICAL ITEMISED VOUCHERS
  const case4Input: MotorAccidentClaimInput = {
    claimType: 'injury_medical',
    accidentDate: '2024-04-10',
    injuryMedicalDetails: {
      expenses: [
        { id: '1', category: 'Hospitalization', description: 'ICU 5 days', amount: 120000 },
        { id: '2', category: 'Pharmacy', description: 'Injectables & antibiotics', amount: 35000 },
        { id: '3', category: 'Surgery', description: 'Femur fixation surgery', amount: 200000 },
        { id: '4', category: 'Diagnostics', description: 'MRI & CT Scans', amount: 15000 }
      ]
    }
  };
  const case4Result = calculateMotorAccidentCompensation(case4Input);
  assert(case4Result.totalEstimatedCompensation === 370000, `Case 4 medical expenses should be ₹3,70,000, got ${case4Result.totalEstimatedCompensation}`);

  // 8. TEST CASE 5: SECTION 164 NO-FAULT BENCHMARK INTEGRATION
  assert(case1Result.statutoryNoFaultBenchmark.statutoryFixedAmount === 500000, 'Death statutory baseline should be ₹5,00,000');
  assert(case2Result.statutoryNoFaultBenchmark.statutoryFixedAmount === 250000, 'Grievous hurt statutory baseline should be ₹2,50,000');

  // 9. CURRENCY FORMATTING
  assert(formatINR(500000) === '₹5,00,000', 'Currency format for 5,00,000 failed');
  assert(formatINR(12500000) === '₹1,25,00,000', 'Currency format for 1.25 Crore failed');

  return passed;
};
