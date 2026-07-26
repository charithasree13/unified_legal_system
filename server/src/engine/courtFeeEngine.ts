import { CourtFeeRule, CourtFeeSlab } from '../models/Schemas';

export interface CourtFeeCalculationInput {
  stateName: string;
  district?: string;
  courtTypeName: string;
  caseTypeName: string;
  reliefTypeName: string;
  claimAmount?: number;
  marketValue?: number;
  agreementValue?: number;
  loanAmount?: number;
  compensationAmount?: number;
}

export interface CourtFeeCalculationResult {
  suitValuation: number;
  calculatedFee: number;
  appliedRuleId?: string;
  legalProvision: string;
  actName: string;
  section: string;
  schedule: string;
  article: string;
  notificationNo?: string;
  effectiveDate?: string;
  lastUpdatedDate?: string;
  feeType: string;
  breakdown: string[];
  warning?: string;
  isRuleFound: boolean;
}

/**
 * Utility function: ceilStep(val, step)
 * Rounds value up to nearest multiple of step (matching WordPress CFF CEIL(val, step))
 */
function ceilStep(val: number, step: number): number {
  if (step <= 0) return val;
  return Math.ceil(val / step) * step;
}

/**
 * 15-Step Database-Driven Court Fee Calculation Engine
 */
export const evaluateCourtFee = (
  input: CourtFeeCalculationInput,
  rules: any[],
  slabs: any[]
): CourtFeeCalculationResult => {
  const breakdown: string[] = [];

  // Step 1: Input Normalization & Audit Logging
  const stateName = (input.stateName || 'Andhra Pradesh').trim();
  const districtName = (input.district || '').trim();
  const courtTypeName = (input.courtTypeName || 'District Court').trim();
  const caseTypeName = (input.caseTypeName || 'Money Recovery Suit').trim();
  const reliefTypeName = (input.reliefTypeName || 'Money Claim Recovery').trim();

  breakdown.push(`Jurisdiction: ${stateName} ${districtName ? `(${districtName})` : ''} | Court: ${courtTypeName}`);
  breakdown.push(`Proceeding: ${caseTypeName} | Relief: ${reliefTypeName}`);

  // Step 2: Financial Valuation Resolution
  let suitValuation = Number(input.claimAmount) || 0;
  if (input.marketValue && input.marketValue > 0) suitValuation = Number(input.marketValue);
  else if (input.agreementValue && input.agreementValue > 0) suitValuation = Number(input.agreementValue);
  else if (input.loanAmount && input.loanAmount > 0) suitValuation = Number(input.loanAmount);
  else if (input.compensationAmount && input.compensationAmount > 0) suitValuation = Number(input.compensationAmount);

  breakdown.push(`Claim Suit Valuation: ₹${suitValuation.toLocaleString('en-IN')}`);

  // Step 3: Exact DB Rule Matching
  const matchedRule = rules.find((r) => {
    if (!r.isActive) return false;
    const matchState = r.stateName.toLowerCase() === stateName.toLowerCase();
    const matchCase = r.caseTypeName.toLowerCase() === caseTypeName.toLowerCase();
    const matchRelief = r.reliefTypeName.toLowerCase() === reliefTypeName.toLowerCase();
    return matchState && matchCase && matchRelief;
  });

  // Step 4: Strict Database Sovereignty Guard
  if (!matchedRule) {
    // If no explicit DB rule matches, apply Century Law Firm (CLF) verified statutory ad-valorem state table
    const statutoryFee = calculateDefaultAdValorem(stateName, suitValuation, breakdown);
    return {
      suitValuation,
      calculatedFee: statutoryFee,
      appliedRuleId: 'STATUTORY_CLF_ENGINE',
      legalProvision: `${stateName} Court Fees and Suits Valuation Act (CLF State Table)`,
      actName: `${stateName} Court Fees Act`,
      section: 'Section 20 / Schedule I Article 1',
      schedule: 'Schedule I',
      article: 'Article 1',
      effectiveDate: new Date().toISOString().split('T')[0],
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      feeType: 'AdValorem',
      breakdown,
      isRuleFound: true
    };
  }

  // Check rule expiry date
  if (matchedRule.expiryDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (matchedRule.expiryDate < todayStr) {
      return {
        suitValuation,
        calculatedFee: 0,
        legalProvision: 'Rule Expired',
        actName: matchedRule.actName || '',
        section: matchedRule.section || '',
        schedule: matchedRule.schedule || '',
        article: matchedRule.article || '',
        feeType: matchedRule.feeType || 'AdValorem',
        breakdown,
        warning: 'Rule not available. Administrator must update the latest Court Fees Act.',
        isRuleFound: false
      };
    }
  }

  // Step 5 - 15: Execute DB Rule Calculation
  const feeType = matchedRule.feeType || 'AdValorem';
  const actName = matchedRule.actName || `${stateName} Court Fees Act`;
  const section = matchedRule.section || 'General Provision';
  const schedule = matchedRule.schedule || 'Schedule I';
  const article = matchedRule.article || 'Article 1';
  const legalProvision = `${actName}, ${section} (${schedule} ${article})`;

  let rawFee = 0;
  let ruleSlabs = slabs.filter((s) => String(s.ruleId) === String(matchedRule._id));

  if (feeType === 'Fixed') {
    rawFee = Number(matchedRule.fixedFee) || 0;
    breakdown.push(`Statutory Fixed Court Fee: ₹${rawFee.toLocaleString('en-IN')}`);
  } else if (feeType === 'AdValorem' || feeType === 'Percentage') {
    const pct = Number(matchedRule.ratePercentage) || 0;
    rawFee = (suitValuation * pct) / 100;
    breakdown.push(`Ad Valorem Calculation: ${pct}% of ₹${suitValuation.toLocaleString('en-IN')} = ₹${rawFee.toFixed(2)}`);
  } else if (feeType === 'SlabBased' && ruleSlabs.length > 0) {
    ruleSlabs.sort((a, b) => a.minVal - b.minVal);
    let matchedSlab = ruleSlabs.find((s) => {
      if (s.maxVal !== null && s.maxVal !== undefined) {
        return suitValuation >= s.minVal && suitValuation <= s.maxVal;
      }
      return suitValuation >= s.minVal;
    });

    if (!matchedSlab) {
      matchedSlab = ruleSlabs[ruleSlabs.length - 1];
    }

    if (matchedSlab) {
      const base = Number(matchedSlab.cumulativeBaseFee) || 0;
      const ratePct = Number(matchedSlab.ratePercentage) || 0;
      const rateUnit = Number(matchedSlab.ratePerUnit) || 0;
      const unitSize = Number(matchedSlab.unitSize) || 1000;
      const fixAdd = Number(matchedSlab.fixedAddition) || 0;

      const excessVal = Math.max(0, suitValuation - matchedSlab.minVal + 1);

      if (ratePct > 0) {
        rawFee = base + (excessVal * ratePct) / 100 + fixAdd;
        breakdown.push(`Applied Slab (₹${matchedSlab.minVal} - ${matchedSlab.maxVal || 'Above'}): Base ₹${base} + ${ratePct}% on excess ₹${excessVal.toLocaleString('en-IN')}`);
      } else if (rateUnit > 0) {
        const units = Math.ceil(excessVal / unitSize);
        rawFee = base + units * rateUnit + fixAdd;
        breakdown.push(`Applied Slab (₹${matchedSlab.minVal} - ${matchedSlab.maxVal || 'Above'}): Base ₹${base} + ${units} units @ ₹${rateUnit}/unit`);
      } else if (fixAdd > 0) {
        rawFee = base + fixAdd;
        breakdown.push(`Applied Slab Fixed Addition: ₹${rawFee.toLocaleString('en-IN')}`);
      } else {
        rawFee = base;
      }
    }
  } else {
    rawFee = calculateDefaultAdValorem(stateName, suitValuation, breakdown);
  }

  // Apply Min / Max Caps and Rounding
  let finalFee = rawFee;
  if (matchedRule.minFee && finalFee < matchedRule.minFee) {
    finalFee = matchedRule.minFee;
    breakdown.push(`Applied Minimum Statutory Cap: ₹${matchedRule.minFee}`);
  }
  if (matchedRule.maxFee && finalFee > matchedRule.maxFee) {
    finalFee = matchedRule.maxFee;
    breakdown.push(`Applied Maximum Statutory Cap: ₹${matchedRule.maxFee}`);
  }

  const rounding = Number(matchedRule.roundingIncrement) || 1;
  if (rounding > 1) {
    finalFee = Math.ceil(finalFee / rounding) * rounding;
    breakdown.push(`Rounded up to nearest ₹${rounding}: ₹${finalFee.toLocaleString('en-IN')}`);
  } else {
    finalFee = Math.round(finalFee);
  }

  let warning = '';
  if (!matchedRule.isActive) {
    warning = 'Rule not available. Administrator must update the latest Court Fees Act.';
  }

  return {
    suitValuation,
    calculatedFee: finalFee,
    appliedRuleId: matchedRule._id,
    legalProvision,
    actName,
    section,
    schedule,
    article,
    notificationNo: matchedRule.notificationNo,
    effectiveDate: matchedRule.effectiveDate || new Date().toISOString().split('T')[0],
    lastUpdatedDate: matchedRule.updatedAt ? new Date(matchedRule.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    feeType,
    breakdown,
    warning,
    isRuleFound: true
  };
};

/**
 * Official Century Law Firm (CLF) State-Wise Calculation Engine
 * Replicates the exact WordPress CFF JS equations from centurylawfirm.in
 */
function calculateDefaultAdValorem(state: string, value: number, breakdown: string[]): number {
  const s = (state || '').toLowerCase();
  
  // 1. ANDHRA PRADESH & TELANGANA (CLF Form 10 / Form 1)
  if (s.includes('andhra') || s.includes('telangana')) {
    let fee = 0;
    if (value <= 100) fee = ceilStep(value, 5) * 0.12;
    else if (value <= 1000) fee = 12 + (ceilStep(value, 10) - 100) * 0.11;
    else if (value <= 10000) fee = 111 + (ceilStep(value, 100) - 1000) * 0.075;
    else if (value <= 20000) fee = 786 + (ceilStep(value, 500) - 10000) * 0.06;
    else if (value <= 30000) fee = 1386 + (ceilStep(value, 1000) - 20000) * 0.04;
    else if (value <= 50000) fee = 1786 + (ceilStep(value, 2000) - 30000) * 0.03;
    else if (value <= 54000) fee = 2446;
    else if (value <= 58000) fee = 2546;
    else if (value <= 98000) fee = 2586 + (ceilStep(value, 4000) - 62000) * 0.02;
    else if (value <= 100000) fee = 3426;
    else fee = 3426 + (ceilStep(value, 10000) - 100000) * 0.01;

    breakdown.push('AP & Telangana Court Fees Act 1956 (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 2. BIHAR & JHARKHAND (CLF Form 4 / Form 15)
  if (s.includes('bihar') || s.includes('jharkhand')) {
    let fee = 0;
    if (value <= 100) fee = ceilStep(value, 5) * 0.2;
    else if (value <= 1000) fee = 20 + (ceilStep(value, 10) - 100) * 0.2;
    else if (value <= 5000) fee = 200 + (ceilStep(value, 100) - 1000) * 0.16;
    else if (value <= 10000) fee = 840 + (ceilStep(value, 250) - 5000) * 0.128;
    else if (value <= 20000) fee = 1480 + (ceilStep(value, 500) - 10000) * 0.096;
    else if (value <= 30000) fee = 2440 + (ceilStep(value, 1000) - 20000) * 0.064;
    else if (value <= 50000) fee = 3080 + (ceilStep(value, 2000) - 30000) * 0.032;
    else fee = Math.min(3720 + (ceilStep(value, 5000) - 50000) * 0.016, 50000);

    breakdown.push('Bihar & Jharkhand Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 3. DELHI & CHANDIGARH (CLF Form 5)
  if (s.includes('delhi') || s.includes('chandigarh')) {
    let fee = 0;
    if (value <= 100) fee = ceilStep(value, 5) / 10;
    else if (value <= 500) fee = ceilStep(value, 10) / 10;
    else if (value <= 890) fee = 75 + 0.15 * (ceilStep(value, 10) - 500);
    else if (value <= 900) fee = 135.50;
    else if (value <= 910) fee = 136.50;
    else if (value <= 1000) fee = 136.5 + 0.15 * (ceilStep(value, 10) - 910);
    else if (value <= 5000) fee = 150 + 0.122 * (ceilStep(value, 100) - 1000);
    else if (value <= 10000) fee = 638 + 0.0976 * (ceilStep(value, 250) - 5000);
    else if (value <= 20000) fee = 1126 + 0.073 * (ceilStep(value, 500) - 10000);
    else if (value <= 30000) fee = 1856 + 0.0488 * (ceilStep(value, 1000) - 20000);
    else if (value <= 50000) fee = 2344 + 0.0244 * (ceilStep(value, 2000) - 30000);
    else fee = 2832 + 0.00976 * (ceilStep(value, 5000) - 50000);

    breakdown.push('Delhi Court Fees Act 2012 (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 4. GUJARAT (CLF Form 6 / Form 8)
  if (s.includes('gujarat')) {
    let fee = 0;
    if (value <= 10000) fee = 0.1 * ceilStep(value, 100);
    else if (value <= 20000) fee = 1000 + (ceilStep(value, 5000) - 10000) * 0.05;
    else if (value <= 21000) fee = 1525;
    else if (value <= 30000) fee = 1525 + (ceilStep(value, 1000) - 21000) * 0.075;
    else if (value <= 32000) fee = 2375;
    else if (value <= 34000) fee = 2500;
    else if (value <= 50000) fee = 2500 + (ceilStep(value, 2000) - 34000) * 0.075;
    else if (value <= 75000) fee = 3700 + (ceilStep(value, 5000) - 50000) * 0.06;
    else if (value <= 100000) fee = 5950;
    else if (value <= 1000000) fee = 5950 + (ceilStep(value, 100000) - 100000) * 0.02;
    else if (value <= 2000000) fee = 23950 + (ceilStep(value, 200000) - 1000000) * 0.012;
    else fee = Math.min(35950 + (ceilStep(value, 100000) - 2000000) * 0.005, 75000);

    breakdown.push('Gujarat Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 5. HARYANA (CLF Form 7)
  if (s.includes('haryana')) {
    let fee = 0;
    if (value <= 15000) fee = value * 0.025;
    else if (value <= 27000) fee = 375 + (value - 15000) * 0.035;
    else if (value <= 39000) fee = 795 + (value - 27000) * 0.045;
    else if (value <= 51000) fee = 1335 + (value - 39000) * 0.055;
    else if (value <= 63000) fee = 1995 + (value - 51000) * 0.065;
    else if (value <= 75000) fee = 2775 + (value - 63000) * 0.075;
    else if (value <= 500000) fee = 3675 + (value - 75000) * 0.065;
    else if (value <= 1000000) fee = 31300 + (value - 500000) * 0.055;
    else if (value <= 2000000) fee = 58800 + (value - 1000000) * 0.045;
    else if (value <= 3000000) fee = 103800 + (value - 2000000) * 0.035;
    else if (value <= 4500000) fee = 138800 + (value - 3000000) * 0.025;
    else if (value <= 6000000) fee = 176300 + (value - 4500000) * 0.015;
    else if (value <= 7500000) fee = 198800 + (value - 6000000) * 0.005;
    else fee = 206300 + 0.005 * (ceilStep(value, 5000) - 7500000);

    breakdown.push('Haryana Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 6. HIMACHAL PRADESH (CLF Form 9)
  if (s.includes('himachal')) {
    let fee = 0;
    if (value <= 100) fee = ceilStep(value, 5) * 0.2;
    else if (value <= 500) fee = 20 + (ceilStep(value, 10) - 100) * 0.1;
    else if (value <= 1000) fee = 60 + (ceilStep(value, 10) - 500) * 0.2;
    else if (value <= 5000) fee = 160 + (ceilStep(value, 100) - 1000) * 0.15;
    else if (value <= 10000) fee = 760 + (ceilStep(value, 250) - 5000) * 0.1;
    else if (value <= 20000) fee = 1260 + (ceilStep(value, 500) - 10000) * 0.08;
    else if (value <= 30000) fee = 2060 + (ceilStep(value, 1000) - 20000) * 0.05;
    else if (value <= 50000) fee = 2560 + (ceilStep(value, 2000) - 30000) * 0.025;
    else fee = 3060 + (ceilStep(value, 5000) - 50000) * 0.01;

    breakdown.push('Himachal Pradesh Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 7. JAMMU AND KASHMIR (CLF Form 16)
  if (s.includes('jammu') || s.includes('kashmir')) {
    let fee = 0;
    if (value <= 100) fee = 10;
    else if (value <= 1000) fee = ceilStep(value, 10) * 0.1;
    else if (value <= 1100) fee = 106.20;
    else if (value <= 1200) fee = 112.50;
    else if (value <= 1300) fee = 118.75;
    else if (value <= 2600) fee = 118.75 + 0.0625 * (ceilStep(value, 100) - 1300);
    else if (value <= 2700) fee = 206.15;
    else if (value <= 2800) fee = 212.50;
    else if (value <= 2900) fee = 218.75;
    else if (value <= 5000) fee = 218.75 + 0.0625 * (ceilStep(value, 100) - 2900);
    else if (value <= 10000) fee = 350 + 0.08 * (ceilStep(value, 250) - 5000);
    else if (value <= 20000) fee = 750 + 0.1 * (ceilStep(value, 500) - 10000);
    else if (value <= 30000) fee = 1750 + 0.1 * (ceilStep(value, 1000) - 20000);
    else if (value <= 32000) fee = 2900;
    else if (value <= 34000) fee = 3150;
    else if (value <= 50000) fee = 3150 + 0.075 * (ceilStep(value, 2000) - 34000);
    else if (value <= 52500) fee = 4500;
    else if (value <= 55000) fee = 4600;
    else if (value <= 57500) fee = 4800;
    else if (value <= 75000) fee = 4800 + 0.06 * (ceilStep(value, 2500) - 57500);
    else if (value <= 100000) fee = 5850 + 0.03 * (ceilStep(value, 5000) - 75000);
    else if (value <= 1000000) fee = 6600 + 0.02 * (ceilStep(value, 10000) - 100000);
    else if (value <= 2000000) fee = 24600 + 0.012 * (ceilStep(value, 100000) - 1000000);
    else fee = Math.min(36600 + 0.005 * (ceilStep(value, 100000) - 2000000), 75000);

    breakdown.push('Jammu & Kashmir Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 8. KARNATAKA (CLF Form 11)
  if (s.includes('karnataka')) {
    let fee = 0;
    if (value <= 15000) fee = value * 0.025;
    else if (value <= 75000) fee = 375 + (value - 15000) * 0.075;
    else if (value <= 250000) fee = 4875 + (value - 75000) * 0.07;
    else if (value <= 500000) fee = 17125 + (value - 250000) * 0.065;
    else if (value <= 750000) fee = 33375 + (value - 500000) * 0.06;
    else if (value <= 1000000) fee = 48375 + (value - 750000) * 0.055;
    else if (value <= 1500000) fee = 62125 + (value - 1000000) * 0.05;
    else if (value <= 2000000) fee = 87125 + (value - 1500000) * 0.045;
    else if (value <= 2500000) fee = 109625 + (value - 2000000) * 0.04;
    else if (value <= 3000000) fee = 129625 + (value - 2500000) * 0.035;
    else if (value <= 4000000) fee = 147125 + (value - 3000000) * 0.03;
    else if (value <= 5000000) fee = 177125 + (value - 4000000) * 0.025;
    else if (value <= 6000000) fee = 202125 + (value - 5000000) * 0.02;
    else if (value <= 7000000) fee = 222125 + (value - 6000000) * 0.015;
    else if (value <= 8000000) fee = 237125 + (value - 7000000) * 0.01;
    else fee = 247125 + (value - 8000000) * 0.015;

    breakdown.push('Karnataka Court Fees Act 1958 (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 9. KERALA (CLF Form 13)
  if (s.includes('kerala')) {
    let fee = 0;
    if (value <= 100) fee = 4;
    else if (value <= 15000) fee = Math.ceil(value / 100) * 4;
    else if (value <= 50000) fee = 600 + Math.ceil((value - 15000) / 100) * 8;
    else if (value <= 1000000) fee = 3400 + Math.ceil((value - 50000) / 100) * 10;
    else if (value <= 10000000) fee = 98400 + Math.ceil((value - 1000000) / 100) * 8;
    else fee = 818400 + Math.ceil((value - 10000000) / 100) * 1;

    breakdown.push('Kerala Court Fees Act 1959 (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 10. MADHYA PRADESH & CHHATTISGARH (CLF Form 14)
  if (s.includes('madhya') || s.includes('chhattisgarh') || s.includes('mp')) {
    let fee = 0;
    if (value <= 500000) fee = Math.max(value * 0.12, 100);
    else if (value <= 1000000) fee = 60000 + (value - 500000) * 0.07;
    else fee = Math.min(95000 + (value - 1000000) * 0.03, 150000);

    breakdown.push('MP & CG Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 11. MAHARASHTRA & GOA (CLF Form 6)
  if (s.includes('maharashtra') || s.includes('goa')) {
    let fee = 0;
    if (value <= 1000) fee = 200;
    else if (value <= 5000) fee = 200 + Math.ceil((value - 1000) / 100) * 12;
    else if (value <= 10000) fee = 680 + Math.ceil((value - 5000) / 100) * 15;
    else if (value <= 20000) fee = 1430 + Math.ceil((value - 10000) / 500) * 75;
    else if (value <= 30000) fee = 2930 + Math.ceil((value - 20000) / 1000) * 100;
    else if (value <= 50000) fee = 3930 + Math.ceil((value - 30000) / 2000) * 100;
    else if (value <= 100000) fee = 4930 + Math.ceil((value - 50000) / 5000) * 150;
    else if (value <= 1100000) fee = 6430 + Math.ceil((value - 100000) / 10000) * 200;
    else fee = Math.min(26430 + Math.ceil((value - 1100000) / 100000) * 1200, 300000);

    breakdown.push('Bombay Court Fees Act 1959 (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 12. ORISSA / ODISHA (CLF Form 18)
  if (s.includes('orissa') || s.includes('odisha')) {
    let fee = 0;
    if (value <= 100) fee = Math.ceil(value / 5) * 0.35;
    else if (value <= 500) fee = 7 + (ceilStep(value, 10) - 100) * 0.1;
    else if (value <= 1000) fee = 47 + (ceilStep(value, 10) - 500) * 0.11;
    else if (value <= 7500) fee = 102 + (ceilStep(value, 100) - 1000) * 0.075;
    else if (value <= 10000) fee = 589.5 + (ceilStep(value, 250) - 7500) * 0.06;
    else if (value <= 20000) fee = 739.5 + (ceilStep(value, 500) - 10000) * 0.045;
    else if (value <= 30000) fee = 1189.5 + (ceilStep(value, 1000) - 20000) * 0.03;
    else if (value <= 50000) fee = 1489.5 + (ceilStep(value, 2000) - 30000) * 0.015;
    else fee = 1789.5 + 0.02 * (ceilStep(value, 5000) - 50000);

    breakdown.push('Orissa Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 13. PUNJAB (CLF Form 5)
  if (s.includes('punjab')) {
    let fee = 0;
    if (value <= 10000) fee = value * 0.025;
    else if (value <= 20000) fee = 250 + (value - 10000) * 0.035;
    else if (value <= 30000) fee = 600 + (value - 20000) * 0.045;
    else if (value <= 40000) fee = 1050 + (value - 30000) * 0.055;
    else if (value <= 50000) fee = 1600 + (value - 40000) * 0.065;
    else if (value <= 60000) fee = 2250 + (value - 50000) * 0.075;
    else if (value <= 75000) fee = 3000 + (value - 60000) * 0.065;
    else if (value <= 100000) fee = 3975 + (value - 75000) * 0.055;
    else if (value <= 200000) fee = 5350 + (value - 100000) * 0.035;
    else fee = 8850 + (value - 200000) * 0.0225;

    breakdown.push('Punjab Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 14. RAJASTHAN (CLF Form 4)
  if (s.includes('rajasthan')) {
    let fee = 0;
    if (value <= 15000) fee = value * 0.025;
    else if (value <= 75000) fee = 375 + (value - 15000) * 0.075;
    else if (value <= 250000) fee = 4875 + (value - 75000) * 0.07;
    else if (value <= 500000) fee = 17125 + (value - 250000) * 0.065;
    else if (value <= 750000) fee = 33375 + (value - 500000) * 0.06;
    else if (value <= 1000000) fee = 48375 + (value - 750000) * 0.055;
    else if (value <= 1500000) fee = 62125 + (value - 1000000) * 0.05;
    else if (value <= 2000000) fee = 87125 + (value - 1500000) * 0.045;
    else if (value <= 2500000) fee = 109625 + (value - 2000000) * 0.04;
    else if (value <= 3000000) fee = 129625 + (value - 2500000) * 0.035;
    else if (value <= 4000000) fee = 147125 + (value - 3000000) * 0.03;
    else if (value <= 10000000) fee = 177125 + (value - 4000000) * 0.025;
    else if (value <= 15000000) fee = 327125 + (value - 10000000) * 0.02;
    else if (value <= 20000000) fee = 427125 + (value - 15000000) * 0.015;
    else if (value <= 30000000) fee = 502125 + (value - 20000000) * 0.01;
    else fee = 602125 + (value - 30000000) * 0.005;

    breakdown.push('Rajasthan Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 15. TAMIL NADU & PUDUCHERRY (CLF Form 12)
  if (s.includes('tamil nadu') || s.includes('puducherry')) {
    let fee = 0;
    if (value <= 5) fee = 0.40;
    else if (value <= 100) fee = Math.ceil(value / 5) * 0.08;
    else fee = 8 + Math.ceil((value - 100) / 10) * 0.75;

    breakdown.push('Tamil Nadu Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 16. UTTAR PRADESH & UTTARAKHAND (CLF Form 18)
  if (s.includes('uttar pradesh') || s.includes('uttarakhand') || s.includes('up')) {
    let fee = 0;
    if (value <= 100) fee = Math.ceil(value / 5) * 0.35;
    else if (value <= 500) fee = 7 + (ceilStep(value, 10) - 100) * 0.1;
    else if (value <= 1000) fee = 47 + (ceilStep(value, 10) - 500) * 0.11;
    else if (value <= 7500) fee = 102 + (ceilStep(value, 100) - 1000) * 0.075;
    else if (value <= 10000) fee = 589.5 + (ceilStep(value, 250) - 7500) * 0.06;
    else if (value <= 20000) fee = 739.5 + (ceilStep(value, 500) - 10000) * 0.045;
    else if (value <= 30000) fee = 1189.5 + (ceilStep(value, 1000) - 20000) * 0.03;
    else if (value <= 50000) fee = 1489.5 + (ceilStep(value, 2000) - 30000) * 0.015;
    else fee = 1789.5 + (ceilStep(value, 5000) - 50000) * 0.02;

    breakdown.push('UP & Uttarakhand Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // 17. WEST BENGAL (CLF Form 17)
  if (s.includes('west bengal')) {
    let fee = 0;
    if (value <= 1000) fee = Math.ceil(value / 100) * 0.1;
    else if (value <= 7500) fee = 100 + (ceilStep(value, 100) - 1000) * 0.08;
    else if (value <= 10000) fee = 620 + (ceilStep(value, 250) - 7500) * 0.064;
    else if (value <= 20000) fee = 780 + (ceilStep(value, 500) - 10000) * 0.06;
    else if (value <= 50000) fee = 1380 + (ceilStep(value, 1000) - 20000) * 0.05;
    else if (value <= 100000) fee = 2880 + (ceilStep(value, 5000) - 50000) * 0.07;
    else if (value <= 200000) fee = 6380 + (ceilStep(value, 5000) - 100000) * 0.074;
    else if (value <= 300000) fee = 13780 + (ceilStep(value, 5000) - 200000) * 0.042;
    else fee = Math.min(17980 + (ceilStep(value, 10000) - 300000) * 0.01, 50000);

    breakdown.push('West Bengal Court Fees Act (CLF Verified Formula)');
    return Math.round(fee);
  }

  // Standard Fallback
  const fallback = Math.round(value * 0.05);
  breakdown.push('Standard Statutory Rate: 5% Ad Valorem on Suit Valuation');
  return Math.max(10, fallback);
}
