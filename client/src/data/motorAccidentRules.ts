/**
 * Legal Rules Configuration for Motor Accident Claims Tribunal (MACT) Compensation
 * Client Data Definitions & Authoritative Precedents
 */

export interface LegalRuleDefinition {
  ruleId: string;
  category: 'multiplier' | 'future_prospects' | 'deduction' | 'conventional_heads' | 'disability' | 'statutory_fixed' | 'limitation';
  title: string;
  legalSource: string;
  citation: string;
  applicableScope: string;
  effectiveVersion: string;
  description: string;
  formulaOrValue: string;
  parameters: Record<string, any>;
  isReviewed: boolean;
  reviewedDate: string;
  notes: string;
}

export interface MultiplierEntry {
  minAge: number;
  maxAge: number;
  multiplier: number;
  legalBasis: string;
}

export const SARLA_VERMA_MULTIPLIER_TABLE: MultiplierEntry[] = [
  { minAge: 0, maxAge: 15, multiplier: 15, legalBasis: 'Second Schedule MVA / Sarla Verma Para 42 (Child benchmark)' },
  { minAge: 15, maxAge: 20, multiplier: 18, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 21, maxAge: 25, multiplier: 18, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 26, maxAge: 30, multiplier: 17, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 31, maxAge: 35, multiplier: 16, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 36, maxAge: 40, multiplier: 15, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 41, maxAge: 45, multiplier: 14, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 46, maxAge: 50, multiplier: 13, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 51, maxAge: 55, multiplier: 11, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 56, maxAge: 60, multiplier: 9, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 61, maxAge: 65, multiplier: 7, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' },
  { minAge: 66, maxAge: 120, multiplier: 5, legalBasis: 'Sarla Verma (2009) 6 SCC 121, Para 42' }
];

export const MACT_LEGAL_RULES: LegalRuleDefinition[] = [
  {
    ruleId: 'RULE-MVA-SEC164-NOFAULT',
    category: 'statutory_fixed',
    title: 'Section 164 Fixed Statutory Compensation (No-Fault Basis)',
    legalSource: 'The Motor Vehicles Act, 1988 (as amended by Act 32 of 2019)',
    citation: 'Section 164, Motor Vehicles Act, 1988 (w.e.f. 01.04.2022)',
    applicableScope: 'Fatal accidents and grievous hurt claims where claimant elects statutory no-fault remedy',
    effectiveVersion: '2019 Amendment (In force April 1, 2022)',
    description: 'Fixed statutory compensation payable without requiring proof of wrongful act, neglect, or default of the owner or driver.',
    formulaOrValue: 'Death: ₹5,00,000; Grievous Hurt: ₹2,50,000',
    parameters: {
      deathCompensation: 500000,
      grievousHurtCompensation: 250000
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Claimant may elect structured compensation under Section 166 or fixed statutory under Section 164. Section 164 relieves burden of proving negligence.'
  },
  {
    ruleId: 'RULE-MVA-SEC166-3-LIMITATION',
    category: 'limitation',
    title: 'Section 166(3) Statutory Limitation for Claim Application',
    legalSource: 'Motor Vehicles (Amendment) Act, 2019',
    citation: 'Section 166(3), Motor Vehicles Act, 1988',
    applicableScope: 'All claims filed under Section 166 arising from accidents post-amendment',
    effectiveVersion: 'Effective from 01.04.2022',
    description: 'Statutory deadline of six months from the date of the accident for filing compensation claims before the MACT.',
    formulaOrValue: '6 Months from Date of Occurrence',
    parameters: {
      limitationMonths: 6
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Prior to 2019, limitation was omitted. The 2019 amendment re-introduced a 6-month limitation bar. Tribunals and High Courts have examined whether condonation of delay under Limitation Act applies.'
  },
  {
    ruleId: 'RULE-SV-MULTIPLIER',
    category: 'multiplier',
    title: 'Sarla Verma Standard Multiplier Scale',
    legalSource: 'Supreme Court of India',
    citation: 'Sarla Verma (Smt) and Others v. Delhi Transport Corporation and Anr. (2009) 6 SCC 121 (Para 42)',
    applicableScope: 'Fatal and permanent disability claims under Section 166',
    effectiveVersion: 'Reaffirmed by 5-Judge Constitution Bench in Pranay Sethi (2017)',
    description: 'Multiplier determined based on the age of the deceased or injured victim at the time of the accident.',
    formulaOrValue: 'Age-band table (5 to 18)',
    parameters: {
      table: SARLA_VERMA_MULTIPLIER_TABLE
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Provides uniform, non-arbitrary multiplier calculation to prevent disparity across Tribunals.'
  },
  {
    ruleId: 'RULE-PS-FUTURE-PROSPECTS',
    category: 'future_prospects',
    title: 'Future Prospects Addition to Established Income',
    legalSource: 'Supreme Court of India (Constitution Bench)',
    citation: 'National Insurance Company Limited v. Pranay Sethi and Others (2017) 16 SCC 680 (Para 59.3, 59.4)',
    applicableScope: 'Fatal claims & Permanent disability affecting earning capacity (Pappu Deo Yadav)',
    effectiveVersion: 'Constitution Bench authoritative standard',
    description: 'Percentage added to established income (net of tax) towards loss of future prospects, depending on employment classification and age band.',
    formulaOrValue: 'Salaried: <40: +50%, 40-50: +30%, 50-60: +15%, >60: 0%. Self-Employed: <40: +40%, 40-50: +25%, 50-60: +10%, >60: 0%.',
    parameters: {
      salaried: [
        { maxAge: 39, additionPercent: 50 },
        { maxAge: 50, additionPercent: 30 },
        { maxAge: 60, additionPercent: 15 },
        { maxAge: 120, additionPercent: 0 }
      ],
      selfEmployed: [
        { maxAge: 39, additionPercent: 40 },
        { maxAge: 50, additionPercent: 25 },
        { maxAge: 60, additionPercent: 10 },
        { maxAge: 120, additionPercent: 0 }
      ]
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Income tax payable on established income must be deducted before computing future prospects addition.'
  },
  {
    ruleId: 'RULE-SV-PERSONAL-DEDUCTION',
    category: 'deduction',
    title: 'Deduction for Personal and Living Expenses of Deceased',
    legalSource: 'Supreme Court of India',
    citation: 'Sarla Verma v. DTC (2009) 6 SCC 121 (Paras 30-32)',
    applicableScope: 'Fatal accident compensation claims under Section 166',
    effectiveVersion: 'Confirmed in Pranay Sethi (2017)',
    description: 'Fractional deduction from adjusted annual income for the personal living expenses the deceased would have spent on himself/herself.',
    formulaOrValue: 'Bachelor: 50% (or 33.33% if large family). Married: 1 dependant: 50%; 2-3 dependants: 33.33% (1/3); 4-6 dependants: 25% (1/4); >6 dependants: 20% (1/5).',
    parameters: {
      bachelorDefault: 0.50,
      bachelorLargeDependentFamily: 0.333333,
      married1Dependant: 0.50,
      married2To3Dependants: 0.333333,
      married4To6Dependants: 0.25,
      marriedAbove6Dependants: 0.20
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Where deceased was a bachelor, normally 50% is deducted. If mother is a widow and siblings are dependent, deduction is reduced to 1/3.'
  },
  {
    ruleId: 'RULE-CONVENTIONAL-HEADS',
    category: 'conventional_heads',
    title: 'Conventional Compensation Heads (Estate & Funeral)',
    legalSource: 'Supreme Court of India (Constitution Bench)',
    citation: 'Pranay Sethi (2017) 16 SCC 680 (Para 52, 59.8)',
    applicableScope: 'Fatal accident claims',
    effectiveVersion: 'Base 2017 with 10% triennial inflation escalation (2020: +10%, 2023: +21%)',
    description: 'Statutory non-pecuniary compensation for loss of estate and funeral expenses with triennial 10% enhancement.',
    formulaOrValue: 'Base: ₹15,000 each. Enhanced (2023+ indexed): ₹18,150 each.',
    parameters: {
      lossOfEstateBase: 15000,
      lossOfEstateEnhanced: 18150,
      funeralExpensesBase: 15000,
      funeralExpensesEnhanced: 18150,
      triennialEnhancementPercent: 10
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Para 59.8 explicitly directed that conventional heads should be enhanced at the rate of 10% every three years.'
  },
  {
    ruleId: 'RULE-MAGMA-CONSORTIUM',
    category: 'conventional_heads',
    title: 'Consortium Compensation (Spousal, Parental, Filial)',
    legalSource: 'Supreme Court of India',
    citation: 'Magma General Insurance Co. Ltd. v. Nanu Ram (2018) 18 SCC 130 & United India Insurance v. Satinder Kaur (2021) 11 SCC 780',
    applicableScope: 'Fatal accident claims for surviving spouse, children, and parents',
    effectiveVersion: '2018 / 2021 precedents with triennial indexation',
    description: 'Recognizes three distinct facets of consortium: spousal (to surviving husband/wife), parental (to minor/dependent children), and filial (to surviving parents).',
    formulaOrValue: '₹40,000 base per eligible claimant (Enhanced 2023+: ₹48,400 per eligible claimant)',
    parameters: {
      spousalConsortiumBase: 40000,
      spousalConsortiumEnhanced: 48400,
      parentalConsortiumPerChildBase: 40000,
      parentalConsortiumPerChildEnhanced: 48400,
      filialConsortiumPerParentBase: 40000,
      filialConsortiumPerParentEnhanced: 48400
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Satinder Kaur (2021) confirmed that no separate compensation is payable under loss of love and affection once consortium is awarded.'
  },
  {
    ruleId: 'RULE-RAJ-KUMAR-DISABILITY',
    category: 'disability',
    title: 'Permanent Disability & Loss of Earning Capacity Inquiry',
    legalSource: 'Supreme Court of India',
    citation: 'Raj Kumar v. Ajay Kumar and Anr. (2011) 1 SCC 343',
    applicableScope: 'Non-fatal injury claims with permanent physical impairment',
    effectiveVersion: 'Authoritative 3-stage disability standard',
    description: 'Medical physical disability percentage certified by doctors does not mechanically dictate loss of earning capacity. Tribunal must evaluate specific vocation and functional handicap.',
    formulaOrValue: 'Loss of Future Earnings = (Annual Income + Future Prospects) × Multiplier × (Functional Disability % / 100)',
    parameters: {
      requiresFunctionalAssessment: true,
      nonPecuniaryHeads: ['Pain and Suffering', 'Loss of Amenities', 'Loss of Expectation of Life', 'Disfigurement']
    },
    isReviewed: true,
    reviewedDate: '2024-01-15',
    notes: 'Inquiry requires examining: (i) extent of physical impairment, (ii) nature of occupation/work, and (iii) actual impact of impairment on claimant carrying out that trade.'
  }
];

export function getSarlaVermaMultiplier(age: number): { multiplier: number; entry: MultiplierEntry } {
  const safeAge = Math.max(0, Math.min(120, Math.floor(age)));
  const found = SARLA_VERMA_MULTIPLIER_TABLE.find(e => safeAge >= e.minAge && safeAge <= e.maxAge);
  if (found) {
    return { multiplier: found.multiplier, entry: found };
  }
  return {
    multiplier: 5,
    entry: { minAge: 66, maxAge: 120, multiplier: 5, legalBasis: 'Sarla Verma (Above 65 years standard)' }
  };
}

export function getFutureProspectsPercentage(
  age: number,
  employmentCategory: 'salaried_permanent' | 'self_employed_fixed' | 'unemployed_homemaker'
): { percentage: number; rationale: string; citation: string } {
  if (employmentCategory === 'unemployed_homemaker') {
    if (age < 40) return { percentage: 40, rationale: 'Self-employed / notional income standard for age < 40 (+40%)', citation: 'Pranay Sethi (2017) Para 59.4' };
    if (age <= 50) return { percentage: 25, rationale: 'Self-employed / notional income standard for age 40-50 (+25%)', citation: 'Pranay Sethi (2017) Para 59.4' };
    if (age <= 60) return { percentage: 10, rationale: 'Self-employed / notional income standard for age 50-60 (+10%)', citation: 'Pranay Sethi (2017) Para 59.4' };
    return { percentage: 0, rationale: 'No future prospects addition for age above 60', citation: 'Pranay Sethi (2017) Para 59.4' };
  }

  if (employmentCategory === 'salaried_permanent') {
    if (age < 40) return { percentage: 50, rationale: 'Permanent salaried employment below 40 years (+50%)', citation: 'Pranay Sethi (2017) Para 59.3' };
    if (age <= 50) return { percentage: 30, rationale: 'Permanent salaried employment between 40-50 years (+30%)', citation: 'Pranay Sethi (2017) Para 59.3' };
    if (age <= 60) return { percentage: 15, rationale: 'Permanent salaried employment between 50-60 years (+15%)', citation: 'Pranay Sethi (2017) Para 59.3' };
    return { percentage: 0, rationale: 'Permanent salaried employment above 60 years (0%)', citation: 'Pranay Sethi (2017) Para 59.3' };
  }

  if (age < 40) return { percentage: 40, rationale: 'Self-employed / fixed wages below 40 years (+40%)', citation: 'Pranay Sethi (2017) Para 59.4' };
  if (age <= 50) return { percentage: 25, rationale: 'Self-employed / fixed wages between 40-50 years (+25%)', citation: 'Pranay Sethi (2017) Para 59.4' };
  if (age <= 60) return { percentage: 10, rationale: 'Self-employed / fixed wages between 50-60 years (+10%)', citation: 'Pranay Sethi (2017) Para 59.4' };
  return { percentage: 0, rationale: 'Self-employed / fixed wages above 60 years (0%)', citation: 'Pranay Sethi (2017) Para 59.4' };
}

export function getPersonalExpenseDeduction(
  maritalStatus: 'bachelor' | 'married',
  dependantsCount: number,
  isBachelorWithLargeFamily: boolean = false
): { deductionRatio: number; deductionLabel: string; legalReference: string } {
  if (maritalStatus === 'bachelor') {
    if (isBachelorWithLargeFamily || dependantsCount >= 3) {
      return {
        deductionRatio: 1 / 3,
        deductionLabel: '1/3rd (33.33%) — Bachelor with large dependent family (widowed mother & dependent siblings)',
        legalReference: 'Sarla Verma (2009) 6 SCC 121 (Para 32)'
      };
    }
    return {
      deductionRatio: 1 / 2,
      deductionLabel: '1/2 (50.00%) — Bachelor deceased standard deduction',
      legalReference: 'Sarla Verma (2009) 6 SCC 121 (Para 31)'
    };
  }

  if (dependantsCount <= 1) {
    return {
      deductionRatio: 1 / 2,
      deductionLabel: '1/2 (50.00%) — Married deceased with 1 dependent',
      legalReference: 'Sarla Verma (2009) 6 SCC 121 (Para 30)'
    };
  }
  if (dependantsCount >= 2 && dependantsCount <= 3) {
    return {
      deductionRatio: 1 / 3,
      deductionLabel: '1/3rd (33.33%) — Married deceased with 2 to 3 dependants',
      legalReference: 'Sarla Verma (2009) 6 SCC 121 (Para 30)'
    };
  }
  if (dependantsCount >= 4 && dependantsCount <= 6) {
    return {
      deductionRatio: 1 / 4,
      deductionLabel: '1/4th (25.00%) — Married deceased with 4 to 6 dependants',
      legalReference: 'Sarla Verma (2009) 6 SCC 121 (Para 30)'
    };
  }
  return {
    deductionRatio: 1 / 5,
    deductionLabel: '1/5th (20.00%) — Married deceased with more than 6 dependants',
    legalReference: 'Sarla Verma (2009) 6 SCC 121 (Para 30)'
  };
}
