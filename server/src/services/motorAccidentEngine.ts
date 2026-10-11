import {
  SARLA_VERMA_MULTIPLIER_TABLE,
  MACT_LEGAL_RULES,
  getSarlaVermaMultiplier,
  getFutureProspectsPercentage,
  getPersonalExpenseDeduction,
  getConventionalHeadsRates,
  LegalRuleDefinition
} from '../data/motorAccidentRules';

export type ClaimType =
  | 'death'
  | 'permanent_disability'
  | 'injury_medical'
  | 'loss_of_income_treatment'
  | 'other_compensation';

export type EmploymentCategory =
  | 'salaried_permanent'
  | 'self_employed_fixed'
  | 'unemployed_homemaker';

export type IncomePeriod = 'monthly' | 'annual';

export interface ConsortiumClaimantsInput {
  spouses: number;
  children: number;
  parents: number;
}

export interface ItemisedExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  isEvidenceAttached?: boolean;
  notes?: string;
}

export interface CustomCompensationHead {
  id: string;
  title: string;
  amount: number;
  isAutomated?: boolean;
  notes?: string;
  reviewRequired?: boolean;
}

export interface MotorAccidentClaimInput {
  claimType: ClaimType;
  claimantName?: string;
  deceasedOrVictimName?: string;
  caseReferenceNumber?: string;
  accidentDate: string; // YYYY-MM-DD
  
  // Death Compensation specific fields
  deathDetails?: {
    ageAtAccident: number;
    employmentCategory: EmploymentCategory;
    incomePeriod: IncomePeriod;
    incomeAmount: number;
    annualIncomeTax?: number;
    maritalStatus: 'bachelor' | 'married';
    dependantsCount: number;
    isBachelorWithLargeFamily?: boolean;
    consortiumClaimants?: ConsortiumClaimantsInput;
    useEnhancedConventionalHeads?: boolean; // 10% triennial inflation indexation (Default: true)
    additionalHeads?: CustomCompensationHead[];
  };

  // Permanent Disability specific fields
  disabilityDetails?: {
    ageAtAccident: number;
    employmentCategory: EmploymentCategory;
    incomePeriod: IncomePeriod;
    incomeAmount: number;
    annualIncomeTax?: number;
    medicalDisabilityPercent: number; // 0 - 100
    functionalDisabilityPercent: number; // 0 - 100 affecting earning capacity
    occupationDetails?: string;
    medicalExpensesIncurred?: number;
    futureMedicalExpenses?: number;
    rehabilitationAndAttendant?: number;
    specialDietAndConveyance?: number;
    painAndSuffering?: number;
    lossOfAmenities?: number;
    additionalHeads?: CustomCompensationHead[];
  };

  // Injury & Medical Expenses specific fields
  injuryMedicalDetails?: {
    expenses: ItemisedExpenseItem[];
  };

  // Loss of Income During Treatment specific fields
  lossOfIncomeDetails?: {
    incomeFrequency: 'daily' | 'weekly' | 'monthly' | 'annual';
    incomeAmount: number;
    periodUnit: 'days' | 'weeks' | 'months';
    periodValue: number;
    medicalLeaveBasis?: string;
    notes?: string;
  };

  // Other Compensation Heads specific fields
  otherHeadsDetails?: {
    customHeads: CustomCompensationHead[];
  };
}

export interface CalculationBreakdownStep {
  stepNumber: number;
  label: string;
  value: string;
  formulaOrMethod: string;
  legalCitation: string;
}

export interface MotorAccidentCalculationResult {
  claimType: ClaimType;
  claimantSummary: {
    accidentDate: string;
    victimAge?: number;
    employmentCategory?: string;
    establishedAnnualIncome?: number;
    caseReferenceNumber?: string;
  };
  itemisedHeads: Array<{
    head: string;
    amount: number;
    category: 'pecuniary' | 'non_pecuniary' | 'statutory_conventional' | 'special';
    legalCitation: string;
    notes?: string;
  }>;
  intermediateSteps: CalculationBreakdownStep[];
  totalEstimatedCompensation: number;
  statutoryNoFaultBenchmark: {
    applicableSection: string;
    statutoryFixedAmount: number;
    differenceFromEstimate: number;
    guidanceNote: string;
  };
  legalRulesApplied: Array<{
    ruleId: string;
    title: string;
    citation: string;
    summary: string;
  }>;
  limitationAlert: {
    isPassed: boolean;
    daysSinceAccident: number;
    statutoryDeadlineDate: string;
    warningMessage?: string;
  };
  disclaimerText: string;
  auditTrail: {
    calculatedAt: string;
    version: string;
  };
}

/**
 * Format Indian currency number (e.g. 15,00,000)
 */
export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

/**
 * Core Motor Accident Compensation Engine
 */
export function calculateMotorAccidentCompensation(
  input: MotorAccidentClaimInput
): MotorAccidentCalculationResult {
  const calculatedAt = new Date().toISOString();
  const accidentDateObj = new Date(input.accidentDate);
  const now = new Date();
  
  // Calculate limitation under Section 166(3) (6 months from accident date)
  let limitationDays = 0;
  let deadlineDateStr = '';
  let limitationWarning: string | undefined = undefined;
  let isLimitationPassed = false;

  if (!isNaN(accidentDateObj.getTime())) {
    const deadlineObj = new Date(accidentDateObj.getTime());
    deadlineObj.setMonth(deadlineObj.getMonth() + 6);
    deadlineDateStr = deadlineObj.toISOString().split('T')[0];
    
    const diffTime = now.getTime() - accidentDateObj.getTime();
    limitationDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (now.getTime() > deadlineObj.getTime()) {
      isLimitationPassed = true;
      limitationWarning = `Section 166(3) Limitation Warning: The statutory 6-month period from the accident date (${input.accidentDate}) expired on ${deadlineDateStr}. An application for condonation of delay with sufficient cause must be filed before the MACT.`;
    }
  }

  const limitationAlert = {
    isPassed: isLimitationPassed,
    daysSinceAccident: limitationDays,
    statutoryDeadlineDate: deadlineDateStr,
    warningMessage: limitationWarning
  };

  const disclaimerText =
    'LEGAL NOTICE & STATUTORY DISCLAIMER: This assessment is an indicative calculation generated strictly for advocates and administrators based on verified Indian statutory frameworks (Motor Vehicles Act, 1988 as amended) and landmark Supreme Court precedents (Pranay Sethi, Sarla Verma, Magma General Insurance, Raj Kumar). Actual awards depend on the judicial appreciation of documentary evidence, proof of negligence, and tribunal discretion under Section 168 of the Act.';

  // -------------------------------------------------------------
  // 1. CLAIM TYPE: DEATH COMPENSATION
  // -------------------------------------------------------------
  if (input.claimType === 'death') {
    const details = input.deathDetails;
    if (!details) {
      throw new Error('Death compensation details must be provided.');
    }

    const age = details.ageAtAccident;
    if (age < 0 || age > 120 || isNaN(age)) {
      throw new Error('Valid age at time of accident is required.');
    }

    // 1. Established Annual Income
    const grossAnnual =
      details.incomePeriod === 'monthly'
        ? details.incomeAmount * 12
        : details.incomeAmount;
    const tax = Math.max(0, details.annualIncomeTax || 0);
    const netAnnualIncome = Math.max(0, grossAnnual - tax);

    // 2. Future Prospects
    const prospectsInfo = getFutureProspectsPercentage(age, details.employmentCategory);
    const futureProspectsAmount = Math.round((netAnnualIncome * prospectsInfo.percentage) / 100);
    const adjustedAnnualIncome = netAnnualIncome + futureProspectsAmount;

    // 3. Personal & Living Expense Deduction
    const deductionInfo = getPersonalExpenseDeduction(
      details.maritalStatus,
      details.dependantsCount,
      details.isBachelorWithLargeFamily
    );
    const personalDeductionAmount = Math.round(adjustedAnnualIncome * deductionInfo.deductionRatio);
    const annualLossOfDependency = Math.max(0, adjustedAnnualIncome - personalDeductionAmount);

    // 4. Multiplier
    const multiplierInfo = getSarlaVermaMultiplier(age);
    const multiplier = multiplierInfo.multiplier;
    const totalLossOfDependency = Math.round(annualLossOfDependency * multiplier);

    // 5. Conventional Heads (Pranay Sethi 2017 Para 52, 59.8 & Magma 2018)
    const convRates = getConventionalHeadsRates(input.accidentDate, details.useEnhancedConventionalHeads);
    const lossOfEstate = convRates.lossOfEstate;
    const funeralExpenses = convRates.funeralExpenses;
    const consortiumRatePerPerson = convRates.consortiumPerPerson;

    const isBachelor = String(details.maritalStatus || '').trim().toLowerCase() === 'bachelor';
    // Spousal consortium only for married deceased
    const spouses = isBachelor ? 0 : Math.max(0, details.consortiumClaimants?.spouses ?? 1);
    const children = Math.max(0, details.consortiumClaimants?.children ?? 0);
    const parents = Math.max(0, details.consortiumClaimants?.parents ?? (isBachelor ? 2 : 0));

    const spousalConsortium = spouses * consortiumRatePerPerson;
    const parentalConsortium = children * consortiumRatePerPerson;
    const filialConsortium = parents * consortiumRatePerPerson;
    const totalConsortium = spousalConsortium + parentalConsortium + filialConsortium;

    // 6. Additional Heads
    let additionalHeadsSum = 0;
    const extraHeads: Array<{ head: string; amount: number; category: any; legalCitation: string; notes?: string }> = [];
    if (details.additionalHeads && details.additionalHeads.length > 0) {
      for (const h of details.additionalHeads) {
        if (h.amount > 0) {
          additionalHeadsSum += h.amount;
          extraHeads.push({
            head: h.title,
            amount: h.amount,
            category: 'special',
            legalCitation: 'Documented Special Damages / Tribunal Judicial Discretion',
            notes: h.notes
          });
        }
      }
    }

    const totalCompensation =
      totalLossOfDependency + lossOfEstate + funeralExpenses + totalConsortium + additionalHeadsSum;

    // Statutory No-fault comparison: Section 164 is ₹5,00,000
    const statutoryNoFault = 500000;

    const itemisedHeads: MotorAccidentCalculationResult['itemisedHeads'] = [
      {
        head: 'Loss of Dependency',
        amount: totalLossOfDependency,
        category: 'pecuniary',
        legalCitation: 'Sarla Verma (2009) 6 SCC 121 & Pranay Sethi (2017) 16 SCC 680',
        notes: `Adjusted Net Income ₹${adjustedAnnualIncome.toLocaleString('en-IN')} minus living expense deduction (${(deductionInfo.deductionRatio * 100).toFixed(1)}%) × Multiplier (${multiplier})`
      },
      {
        head: 'Loss of Estate',
        amount: lossOfEstate,
        category: 'statutory_conventional',
        legalCitation: 'Pranay Sethi (2017) 16 SCC 680 (Para 52, 59.8)',
        notes: convRates.indexationLabel
      },
      {
        head: 'Funeral Expenses',
        amount: funeralExpenses,
        category: 'statutory_conventional',
        legalCitation: 'Pranay Sethi (2017) 16 SCC 680 (Para 52, 59.8)',
        notes: convRates.indexationLabel
      }
    ];

    if (spousalConsortium > 0) {
      itemisedHeads.push({
        head: `Spousal Consortium (${spouses} surviving spouse)`,
        amount: spousalConsortium,
        category: 'non_pecuniary',
        legalCitation: 'Magma General Insurance (2018) 18 SCC 130 & Satinder Kaur (2021)',
        notes: `₹${consortiumRatePerPerson.toLocaleString('en-IN')} per surviving spouse`
      });
    }

    if (parentalConsortium > 0) {
      itemisedHeads.push({
        head: `Parental Consortium (${children} child/children)`,
        amount: parentalConsortium,
        category: 'non_pecuniary',
        legalCitation: 'Magma General Insurance (2018) 18 SCC 130',
        notes: `₹${consortiumRatePerPerson.toLocaleString('en-IN')} per dependent child`
      });
    }

    if (filialConsortium > 0) {
      itemisedHeads.push({
        head: `Filial Consortium (${parents} surviving parent(s))`,
        amount: filialConsortium,
        category: 'non_pecuniary',
        legalCitation: 'Magma General Insurance (2018) 18 SCC 130',
        notes: `₹${consortiumRatePerPerson.toLocaleString('en-IN')} per surviving parent`
      });
    }

    itemisedHeads.push(...extraHeads);

    const intermediateSteps: CalculationBreakdownStep[] = [
      {
        stepNumber: 1,
        label: 'Gross Established Annual Income',
        value: formatINR(grossAnnual),
        formulaOrMethod:
          details.incomePeriod === 'monthly'
            ? `Monthly ₹${details.incomeAmount.toLocaleString('en-IN')} × 12 months`
            : `Annual established amount`,
        legalCitation: 'Sarla Verma (2009) 6 SCC 121 (Para 44)'
      },
      {
        stepNumber: 2,
        label: 'Applicable Income Tax Deduction',
        value: tax > 0 ? `-${formatINR(tax)}` : '₹0 (Below taxable threshold / Not applicable)',
        formulaOrMethod: 'Established gross income less actual income tax payable',
        legalCitation: 'Pranay Sethi (2017) 16 SCC 680 (Para 59.1)'
      },
      {
        stepNumber: 3,
        label: 'Net Base Annual Income',
        value: formatINR(netAnnualIncome),
        formulaOrMethod: `Gross Annual (${formatINR(grossAnnual)}) - Income Tax (${formatINR(tax)})`,
        legalCitation: 'Pranay Sethi (2017) 16 SCC 680'
      },
      {
        stepNumber: 4,
        label: `Future Prospects Addition (+${prospectsInfo.percentage}%)`,
        value: `+${formatINR(futureProspectsAmount)}`,
        formulaOrMethod: `${netAnnualIncome.toLocaleString('en-IN')} × ${prospectsInfo.percentage}% (${prospectsInfo.rationale})`,
        legalCitation: prospectsInfo.citation
      },
      {
        stepNumber: 5,
        label: 'Adjusted Annual Income',
        value: formatINR(adjustedAnnualIncome),
        formulaOrMethod: `Net Base (${formatINR(netAnnualIncome)}) + Future Prospects (${formatINR(futureProspectsAmount)})`,
        legalCitation: 'Pranay Sethi (2017) 16 SCC 680'
      },
      {
        stepNumber: 6,
        label: `Personal & Living Expense Deduction (${(deductionInfo.deductionRatio * 100).toFixed(1)}%)`,
        value: `-${formatINR(personalDeductionAmount)}`,
        formulaOrMethod: `${deductionInfo.deductionLabel}`,
        legalCitation: deductionInfo.legalReference
      },
      {
        stepNumber: 7,
        label: 'Annual Loss of Dependency',
        value: formatINR(annualLossOfDependency),
        formulaOrMethod: `Adjusted Income (${formatINR(adjustedAnnualIncome)}) - Personal Deduction (${formatINR(personalDeductionAmount)})`,
        legalCitation: 'Sarla Verma (2009) 6 SCC 121'
      },
      {
        stepNumber: 8,
        label: `Applicable Age Multiplier (${multiplier})`,
        value: `Multiplier: ${multiplier}`,
        formulaOrMethod: `Determined based on victim age of ${age} years (${multiplierInfo.entry.legalBasis})`,
        legalCitation: 'Sarla Verma (2009) 6 SCC 121 (Para 42) & Pranay Sethi (2017)'
      },
      {
        stepNumber: 9,
        label: 'Total Loss of Dependency',
        value: formatINR(totalLossOfDependency),
        formulaOrMethod: `Annual Loss (${formatINR(annualLossOfDependency)}) × Multiplier (${multiplier})`,
        legalCitation: 'Sarla Verma (2009) 6 SCC 121 (Para 42)'
      },
      {
        stepNumber: 10,
        label: 'Conventional Heads & Consortium Subtotal',
        value: formatINR(lossOfEstate + funeralExpenses + totalConsortium),
        formulaOrMethod: `Estate (${formatINR(lossOfEstate)}) + Funeral (${formatINR(funeralExpenses)}) + Consortium (${formatINR(totalConsortium)})`,
        legalCitation: 'Pranay Sethi (2017) & Magma General Insurance (2018)'
      }
    ];

    const legalRulesApplied = [
      {
        ruleId: 'RULE-SV-MULTIPLIER',
        title: 'Sarla Verma Age Multiplier Table',
        citation: 'Sarla Verma (2009) 6 SCC 121 (Para 42)',
        summary: `Multiplier ${multiplier} selected for age ${age} years.`
      },
      {
        ruleId: 'RULE-PS-FUTURE-PROSPECTS',
        title: 'Future Prospects Addition',
        citation: prospectsInfo.citation,
        summary: `Added ${prospectsInfo.percentage}% future prospects based on ${details.employmentCategory.replace('_', ' ')} employment at age ${age}.`
      },
      {
        ruleId: 'RULE-SV-PERSONAL-DEDUCTION',
        title: 'Deduction for Personal & Living Expenses',
        citation: deductionInfo.legalReference,
        summary: `Deducted ${(deductionInfo.deductionRatio * 100).toFixed(1)}% living expenses based on ${details.maritalStatus} status and ${details.dependantsCount} dependants.`
      },
      {
        ruleId: 'RULE-CONVENTIONAL-HEADS',
        title: 'Conventional Heads & Triennial Indexation',
        citation: 'Pranay Sethi (2017) 16 SCC 680',
        summary: `Awarded Loss of Estate (${formatINR(lossOfEstate)}) and Funeral Expenses (${formatINR(funeralExpenses)}).`
      },
      {
        ruleId: 'RULE-MAGMA-CONSORTIUM',
        title: 'Consortium Recognition',
        citation: 'Magma General Insurance (2018) 18 SCC 130',
        summary: `Awarded consortium across eligible claimants: Spousal (${spouses}), Parental (${children}), Filial (${parents}).`
      }
    ];

    return {
      claimType: 'death',
      claimantSummary: {
        accidentDate: input.accidentDate,
        victimAge: age,
        employmentCategory: details.employmentCategory,
        establishedAnnualIncome: grossAnnual,
        caseReferenceNumber: input.caseReferenceNumber
      },
      itemisedHeads,
      intermediateSteps,
      totalEstimatedCompensation: totalCompensation,
      statutoryNoFaultBenchmark: {
        applicableSection: 'Section 164, Motor Vehicles Act, 1988',
        statutoryFixedAmount: statutoryNoFault,
        differenceFromEstimate: totalCompensation - statutoryNoFault,
        guidanceNote:
          totalCompensation >= statutoryNoFault
            ? `The structured Section 166 fault-based claim estimate (₹${totalCompensation.toLocaleString('en-IN')}) exceeds the no-fault statutory fixed baseline of ₹5,00,000 under Section 164 by ₹${(totalCompensation - statutoryNoFault).toLocaleString('en-IN')}.`
            : `The statutory no-fault baseline of ₹5,00,000 under Section 164 is higher than the structured dependency assessment.`
      },
      legalRulesApplied,
      limitationAlert,
      disclaimerText,
      auditTrail: {
        calculatedAt,
        version: 'MACT-ENGINE-v1.0'
      }
    };
  }

  // -------------------------------------------------------------
  // 2. CLAIM TYPE: PERMANENT DISABILITY COMPENSATION
  // -------------------------------------------------------------
  if (input.claimType === 'permanent_disability') {
    const details = input.disabilityDetails;
    if (!details) {
      throw new Error('Permanent disability details must be provided.');
    }

    const age = details.ageAtAccident;
    if (age < 0 || age > 120 || isNaN(age)) {
      throw new Error('Valid age is required.');
    }

    const grossAnnual =
      details.incomePeriod === 'monthly'
        ? details.incomeAmount * 12
        : details.incomeAmount;
    const tax = Math.max(0, details.annualIncomeTax || 0);
    const netAnnualIncome = Math.max(0, grossAnnual - tax);

    // Future prospects in disability: Pappu Deo Yadav v. Naresh Kumar (2022) 13 SCC 790
    const prospectsInfo = getFutureProspectsPercentage(age, details.employmentCategory);
    const futureProspectsAmount = Math.round((netAnnualIncome * prospectsInfo.percentage) / 100);
    const adjustedAnnualIncome = netAnnualIncome + futureProspectsAmount;

    // Multiplier
    const multiplierInfo = getSarlaVermaMultiplier(age);
    const multiplier = multiplierInfo.multiplier;

    // Functional disability percentage
    const functionalPercent = Math.min(100, Math.max(0, details.functionalDisabilityPercent));
    const medicalPercent = Math.min(100, Math.max(0, details.medicalDisabilityPercent));

    // Future Loss of Earnings = (Adjusted Annual Income) × Multiplier × (functionalPercent / 100)
    // Raj Kumar v. Ajay Kumar (2011) 1 SCC 343: No personal living expense deduction in injury cases!
    const futureLossOfEarnings = Math.round(adjustedAnnualIncome * multiplier * (functionalPercent / 100));

    // Pecuniary damages
    const medicalExpenses = Math.max(0, details.medicalExpensesIncurred || 0);
    const futureMedicalExpenses = Math.max(0, details.futureMedicalExpenses || 0);
    const rehabilitationAndAttendant = Math.max(0, details.rehabilitationAndAttendant || 0);
    const specialDietAndConveyance = Math.max(0, details.specialDietAndConveyance || 0);

    // Non-pecuniary damages
    const painAndSuffering = Math.max(0, details.painAndSuffering || 0);
    const lossOfAmenities = Math.max(0, details.lossOfAmenities || 0);

    let additionalHeadsSum = 0;
    const extraHeads: Array<{ head: string; amount: number; category: any; legalCitation: string; notes?: string }> = [];
    if (details.additionalHeads && details.additionalHeads.length > 0) {
      for (const h of details.additionalHeads) {
        if (h.amount > 0) {
          additionalHeadsSum += h.amount;
          extraHeads.push({
            head: h.title,
            amount: h.amount,
            category: 'special',
            legalCitation: 'Tribunal Discretion / Special Circumstances',
            notes: h.notes
          });
        }
      }
    }

    const totalCompensation =
      futureLossOfEarnings +
      medicalExpenses +
      futureMedicalExpenses +
      rehabilitationAndAttendant +
      specialDietAndConveyance +
      painAndSuffering +
      lossOfAmenities +
      additionalHeadsSum;

    // Section 164 grievous hurt benchmark: ₹2,50,000
    const statutoryGrievousHurt = 250000;

    const itemisedHeads: MotorAccidentCalculationResult['itemisedHeads'] = [
      {
        head: `Future Loss of Earning Capacity (${functionalPercent}%)`,
        amount: futureLossOfEarnings,
        category: 'pecuniary',
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343 & Pappu Deo Yadav (2022) 13 SCC 790',
        notes: `Adjusted Annual Income ₹${adjustedAnnualIncome.toLocaleString('en-IN')} × Multiplier (${multiplier}) × Functional Disability (${functionalPercent}%)`
      }
    ];

    if (medicalExpenses > 0) {
      itemisedHeads.push({
        head: 'Medical & Hospitalization Expenses Incurred',
        amount: medicalExpenses,
        category: 'pecuniary',
        legalCitation: 'Section 166, Motor Vehicles Act, 1988 (Pecuniary Damages)',
        notes: 'Supported by hospital bills, pharmacy receipts, and discharge vouchers'
      });
    }

    if (futureMedicalExpenses > 0) {
      itemisedHeads.push({
        head: 'Estimated Future Medical Treatment & Surgery',
        amount: futureMedicalExpenses,
        category: 'pecuniary',
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343',
        notes: 'Subject to medical board recommendation / expert physician deposition'
      });
    }

    if (rehabilitationAndAttendant > 0) {
      itemisedHeads.push({
        head: 'Rehabilitation & Attendant / Caregiver Charges',
        amount: rehabilitationAndAttendant,
        category: 'pecuniary',
        legalCitation: 'Kajal v. Jagdish Chand (2020) 4 SCC 413',
        notes: 'Nursing assistance and mobility support during and post-treatment'
      });
    }

    if (specialDietAndConveyance > 0) {
      itemisedHeads.push({
        head: 'Special Nutrition Diet & Conveyance / Ambulance',
        amount: specialDietAndConveyance,
        category: 'pecuniary',
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343',
        notes: 'Dietary supplements and transportation for regular medical follow-ups'
      });
    }

    if (painAndSuffering > 0) {
      itemisedHeads.push({
        head: 'Pain, Shock and Suffering',
        amount: painAndSuffering,
        category: 'non_pecuniary',
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343',
        notes: 'Non-pecuniary damages assessed considering hospitalization duration and severity'
      });
    }

    if (lossOfAmenities > 0) {
      itemisedHeads.push({
        head: 'Loss of Amenities of Life & Enjoyment',
        amount: lossOfAmenities,
        category: 'non_pecuniary',
        legalCitation: 'Govind Yadav v. New India Insurance (2011) 10 SCC 683',
        notes: 'Compensating deprivation of physical ability to enjoy routine lifestyle activities'
      });
    }

    itemisedHeads.push(...extraHeads);

    const intermediateSteps: CalculationBreakdownStep[] = [
      {
        stepNumber: 1,
        label: 'Net Established Annual Income',
        value: formatINR(netAnnualIncome),
        formulaOrMethod: `Gross Annual (${formatINR(grossAnnual)}) - Income Tax (${formatINR(tax)})`,
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011)'
      },
      {
        stepNumber: 2,
        label: `Future Prospects Addition (+${prospectsInfo.percentage}%)`,
        value: `+${formatINR(futureProspectsAmount)}`,
        formulaOrMethod: `Pappu Deo Yadav rule applied to permanent disability: ${netAnnualIncome.toLocaleString('en-IN')} × ${prospectsInfo.percentage}%`,
        legalCitation: 'Pappu Deo Yadav v. Naresh Kumar (2022) 13 SCC 790'
      },
      {
        stepNumber: 3,
        label: 'Adjusted Annual Income Base',
        value: formatINR(adjustedAnnualIncome),
        formulaOrMethod: `Net Income (${formatINR(netAnnualIncome)}) + Future Prospects (${formatINR(futureProspectsAmount)})`,
        legalCitation: 'Pappu Deo Yadav (2022)'
      },
      {
        stepNumber: 4,
        label: `Multiplier (${multiplier}) for Age ${age}`,
        value: `Multiplier: ${multiplier}`,
        formulaOrMethod: `Sarla Verma table age ${age} standard`,
        legalCitation: 'Sarla Verma (2009) 6 SCC 121 (Para 42)'
      },
      {
        stepNumber: 5,
        label: `Medical vs Functional Disability`,
        value: `Medical: ${medicalPercent}% | Functional: ${functionalPercent}%`,
        formulaOrMethod: `Medical impairment does not equate to loss of earning capacity. Functional impact on claimant's occupation (${details.occupationDetails || 'General'}) assessed at ${functionalPercent}%.`,
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343 (Para 10-13)'
      },
      {
        stepNumber: 6,
        label: 'Future Loss of Earning Capacity',
        value: formatINR(futureLossOfEarnings),
        formulaOrMethod: `Adjusted Income (${formatINR(adjustedAnnualIncome)}) × Multiplier (${multiplier}) × Functional Disability (${functionalPercent}%) [No deduction for personal living expenses in disability]`,
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343'
      },
      {
        stepNumber: 7,
        label: 'Medical & Associated Pecuniary Subtotal',
        value: formatINR(medicalExpenses + futureMedicalExpenses + rehabilitationAndAttendant + specialDietAndConveyance),
        formulaOrMethod: 'Treatment + Future Medical + Attendant + Diet/Conveyance',
        legalCitation: 'Pecuniary damages under Section 166'
      },
      {
        stepNumber: 8,
        label: 'Non-Pecuniary Damages Subtotal',
        value: formatINR(painAndSuffering + lossOfAmenities),
        formulaOrMethod: `Pain and suffering (${formatINR(painAndSuffering)}) + Loss of amenities (${formatINR(lossOfAmenities)})`,
        legalCitation: 'Govind Yadav (2011) & Raj Kumar (2011)'
      }
    ];

    const legalRulesApplied = [
      {
        ruleId: 'RULE-RAJ-KUMAR-DISABILITY',
        title: 'Three-Stage Inquiry in Permanent Disability',
        citation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343',
        summary: `Tribunal principle: Physical impairment of ${medicalPercent}% distinguished from functional disability of ${functionalPercent}% affecting earning capacity.`
      },
      {
        ruleId: 'RULE-PS-FUTURE-PROSPECTS',
        title: 'Future Prospects in Permanent Disability',
        citation: 'Pappu Deo Yadav v. Naresh Kumar (2022) 13 SCC 790',
        summary: `Added ${prospectsInfo.percentage}% future prospects to permanent disability loss of earnings.`
      },
      {
        ruleId: 'RULE-SV-MULTIPLIER',
        title: 'Sarla Verma Age Multiplier Table',
        citation: 'Sarla Verma (2009) 6 SCC 121 (Para 42)',
        summary: `Multiplier ${multiplier} applied for claimant age ${age}.`
      }
    ];

    return {
      claimType: 'permanent_disability',
      claimantSummary: {
        accidentDate: input.accidentDate,
        victimAge: age,
        employmentCategory: details.employmentCategory,
        establishedAnnualIncome: grossAnnual,
        caseReferenceNumber: input.caseReferenceNumber
      },
      itemisedHeads,
      intermediateSteps,
      totalEstimatedCompensation: totalCompensation,
      statutoryNoFaultBenchmark: {
        applicableSection: 'Section 164, Motor Vehicles Act, 1988 (Grievous Hurt)',
        statutoryFixedAmount: statutoryGrievousHurt,
        differenceFromEstimate: totalCompensation - statutoryGrievousHurt,
        guidanceNote:
          totalCompensation >= statutoryGrievousHurt
            ? `The structured Section 166 permanent disability compensation estimate (₹${totalCompensation.toLocaleString('en-IN')}) exceeds the statutory no-fault grievous hurt baseline of ₹2,50,000 under Section 164 by ₹${(totalCompensation - statutoryGrievousHurt).toLocaleString('en-IN')}.`
            : `The statutory no-fault baseline of ₹2,50,000 under Section 164 is higher than the structured estimate.`
      },
      legalRulesApplied,
      limitationAlert,
      disclaimerText,
      auditTrail: {
        calculatedAt,
        version: 'MACT-ENGINE-v1.0'
      }
    };
  }

  // -------------------------------------------------------------
  // 3. CLAIM TYPE: INJURY AND MEDICAL EXPENSES
  // -------------------------------------------------------------
  if (input.claimType === 'injury_medical') {
    const details = input.injuryMedicalDetails;
    if (!details || !Array.isArray(details.expenses) || details.expenses.length === 0) {
      throw new Error('At least one itemised medical or injury expense item must be provided.');
    }

    let grandTotal = 0;
    const categoryTotals: Record<string, number> = {};
    const itemisedHeads: MotorAccidentCalculationResult['itemisedHeads'] = [];

    for (const exp of details.expenses) {
      const amt = Math.max(0, exp.amount || 0);
      grandTotal += amt;
      const cat = exp.category || 'General Treatment';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

      itemisedHeads.push({
        head: `${cat}: ${exp.description || 'Medical Item'}`,
        amount: amt,
        category: 'pecuniary',
        legalCitation: 'Section 166, Motor Vehicles Act, 1988 (Actual Pecuniary Losses)',
        notes: exp.notes ? `${exp.notes}${exp.isEvidenceAttached ? ' (Evidence Attached)' : ''}` : (exp.isEvidenceAttached ? 'Evidence Attached' : undefined)
      });
    }

    const intermediateSteps: CalculationBreakdownStep[] = Object.keys(categoryTotals).map((cat, idx) => ({
      stepNumber: idx + 1,
      label: `Subtotal for ${cat}`,
      value: formatINR(categoryTotals[cat]),
      formulaOrMethod: `Sum of itemised vouchers in ${cat}`,
      legalCitation: 'Section 166 MVA Pecuniary Head'
    }));

    intermediateSteps.push({
      stepNumber: intermediateSteps.length + 1,
      label: 'Grand Total Medical & Injury Damages',
      value: formatINR(grandTotal),
      formulaOrMethod: 'Sum of all validated medical vouchers and treatment receipts',
      legalCitation: 'Section 166, Motor Vehicles Act, 1988'
    });

    return {
      claimType: 'injury_medical',
      claimantSummary: {
        accidentDate: input.accidentDate,
        caseReferenceNumber: input.caseReferenceNumber
      },
      itemisedHeads,
      intermediateSteps,
      totalEstimatedCompensation: grandTotal,
      statutoryNoFaultBenchmark: {
        applicableSection: 'Section 164, Motor Vehicles Act, 1988 (Grievous Hurt)',
        statutoryFixedAmount: 250000,
        differenceFromEstimate: grandTotal - 250000,
        guidanceNote: 'Section 164 statutory baseline for grievous hurt is ₹2,50,000 on a no-fault basis.'
      },
      legalRulesApplied: [
        {
          ruleId: 'RULE-PECUNIARY-MEDICAL',
          title: 'Pecuniary Compensation for Actual Medical Expenses',
          citation: 'Section 166, Motor Vehicles Act, 1988',
          summary: `Reimbursement of itemised hospital, surgical, medicine, diagnostic, and allied expenses supported by documentary evidence.`
        }
      ],
      limitationAlert,
      disclaimerText,
      auditTrail: {
        calculatedAt,
        version: 'MACT-ENGINE-v1.0'
      }
    };
  }

  // -------------------------------------------------------------
  // 4. CLAIM TYPE: LOSS OF INCOME DURING TREATMENT
  // -------------------------------------------------------------
  if (input.claimType === 'loss_of_income_treatment') {
    const details = input.lossOfIncomeDetails;
    if (!details) {
      throw new Error('Loss of income during treatment details must be provided.');
    }

    const income = Math.max(0, details.incomeAmount || 0);
    const periodVal = Math.max(0, details.periodValue || 0);

    // Convert income to daily and monthly rate
    let dailyRate = 0;
    let monthlyRate = 0;

    if (details.incomeFrequency === 'daily') {
      dailyRate = income;
      monthlyRate = income * 30;
    } else if (details.incomeFrequency === 'weekly') {
      dailyRate = income / 7;
      monthlyRate = (income / 7) * 30;
    } else if (details.incomeFrequency === 'monthly') {
      dailyRate = income / 30;
      monthlyRate = income;
    } else {
      // annual
      dailyRate = income / 365;
      monthlyRate = income / 12;
    }

    let calculatedLoss = 0;
    let formulaDesc = '';

    if (details.periodUnit === 'days') {
      calculatedLoss = Math.round(dailyRate * periodVal);
      formulaDesc = `Daily rate (₹${dailyRate.toFixed(2)}) × ${periodVal} days`;
    } else if (details.periodUnit === 'weeks') {
      calculatedLoss = Math.round(dailyRate * 7 * periodVal);
      formulaDesc = `Weekly rate (₹${(dailyRate * 7).toFixed(2)}) × ${periodVal} weeks`;
    } else {
      // months
      calculatedLoss = Math.round(monthlyRate * periodVal);
      formulaDesc = `Monthly rate (₹${monthlyRate.toFixed(2)}) × ${periodVal} months`;
    }

    const itemisedHeads: MotorAccidentCalculationResult['itemisedHeads'] = [
      {
        head: `Loss of Earnings During Active Treatment (${periodVal} ${details.periodUnit})`,
        amount: calculatedLoss,
        category: 'pecuniary',
        legalCitation: 'Section 166, Motor Vehicles Act, 1988 & Raj Kumar v. Ajay Kumar (2011)',
        notes: details.medicalLeaveBasis || 'Certified active recuperation period during which victim was incapacitated from earning'
      }
    ];

    const intermediateSteps: CalculationBreakdownStep[] = [
      {
        stepNumber: 1,
        label: 'Established Income Rate',
        value: `${formatINR(income)} per ${details.incomeFrequency}`,
        formulaOrMethod: `Claimant stated ${details.incomeFrequency} income`,
        legalCitation: 'Documentary evidence / Salary slips / Form 16 / Bank statements'
      },
      {
        stepNumber: 2,
        label: 'Equivalent Standard Rates',
        value: `Daily: ₹${dailyRate.toFixed(2)} | Monthly: ₹${monthlyRate.toFixed(2)}`,
        formulaOrMethod: 'Standard 30-day month / 365-day year pro-rata division',
        legalCitation: 'Standard accounting formula'
      },
      {
        stepNumber: 3,
        label: `Recuperation / Hospitalization Duration`,
        value: `${periodVal} ${details.periodUnit}`,
        formulaOrMethod: details.medicalLeaveBasis || 'Medical discharge summary & doctor sick leave recommendation',
        legalCitation: 'Medical Certificate / Treatment Record'
      },
      {
        stepNumber: 4,
        label: 'Loss of Income During Treatment',
        value: formatINR(calculatedLoss),
        formulaOrMethod: formulaDesc,
        legalCitation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343'
      }
    ];

    return {
      claimType: 'loss_of_income_treatment',
      claimantSummary: {
        accidentDate: input.accidentDate,
        caseReferenceNumber: input.caseReferenceNumber
      },
      itemisedHeads,
      intermediateSteps,
      totalEstimatedCompensation: calculatedLoss,
      statutoryNoFaultBenchmark: {
        applicableSection: 'Section 164, Motor Vehicles Act, 1988',
        statutoryFixedAmount: 250000,
        differenceFromEstimate: calculatedLoss - 250000,
        guidanceNote: 'Section 164 provides statutory relief for death or grievous hurt.'
      },
      legalRulesApplied: [
        {
          ruleId: 'RULE-LOSS-INCOME-TREATMENT',
          title: 'Loss of Earnings During Treatment Period',
          citation: 'Raj Kumar v. Ajay Kumar (2011) 1 SCC 343',
          summary: 'Full compensation for actual loss of earnings suffered by the injured victim during hospitalization and active medical rest.'
        }
      ],
      limitationAlert,
      disclaimerText,
      auditTrail: {
        calculatedAt,
        version: 'MACT-ENGINE-v1.0'
      }
    };
  }

  // -------------------------------------------------------------
  // 5. CLAIM TYPE: OTHER COMPENSATION HEADS
  // -------------------------------------------------------------
  if (input.claimType === 'other_compensation') {
    const details = input.otherHeadsDetails;
    if (!details || !Array.isArray(details.customHeads) || details.customHeads.length === 0) {
      throw new Error('At least one compensation head item must be provided.');
    }

    let grandTotal = 0;
    const itemisedHeads: MotorAccidentCalculationResult['itemisedHeads'] = [];
    const intermediateSteps: CalculationBreakdownStep[] = [];

    details.customHeads.forEach((head, index) => {
      const amt = Math.max(0, head.amount || 0);
      grandTotal += amt;

      itemisedHeads.push({
        head: head.title,
        amount: amt,
        category: 'special',
        legalCitation: 'Special / Documented Loss under Section 166',
        notes: head.notes ? `${head.notes}${head.reviewRequired ? ' [Tribunal Review Required]' : ''}` : (head.reviewRequired ? '[Tribunal Review Required]' : undefined)
      });

      intermediateSteps.push({
        stepNumber: index + 1,
        label: head.title,
        value: formatINR(amt),
        formulaOrMethod: head.isAutomated ? 'Automated Estimate' : 'Manually Entered Assessment',
        legalCitation: head.reviewRequired ? 'Subject to Judicial Review' : 'Documented Head'
      });
    });

    intermediateSteps.push({
      stepNumber: intermediateSteps.length + 1,
      label: 'Total Custom / Additional Heads',
      value: formatINR(grandTotal),
      formulaOrMethod: 'Arithmetic sum of itemised additional heads',
      legalCitation: 'Section 166, Motor Vehicles Act, 1988'
    });

    return {
      claimType: 'other_compensation',
      claimantSummary: {
        accidentDate: input.accidentDate,
        caseReferenceNumber: input.caseReferenceNumber
      },
      itemisedHeads,
      intermediateSteps,
      totalEstimatedCompensation: grandTotal,
      statutoryNoFaultBenchmark: {
        applicableSection: 'Section 164, Motor Vehicles Act, 1988',
        statutoryFixedAmount: 250000,
        differenceFromEstimate: grandTotal - 250000,
        guidanceNote: 'Comparison with Section 164 baseline.'
      },
      legalRulesApplied: [
        {
          ruleId: 'RULE-SPECIAL-HEADS',
          title: 'Special Damages & Pecuniary Heads',
          citation: 'Section 166, Motor Vehicles Act, 1988',
          summary: 'Tribunal jurisdiction to award just compensation on documented special heads.'
        }
      ],
      limitationAlert,
      disclaimerText,
      auditTrail: {
        calculatedAt,
        version: 'MACT-ENGINE-v1.0'
      }
    };
  }

  throw new Error(`Unsupported claim type: ${input.claimType}`);
}
