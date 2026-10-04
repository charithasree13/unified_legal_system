/**
 * Interest Calculator Engine for Elite Legal Desk
 * Supports Simple Interest and Compound Interest calculations with actual day counts,
 * leap year handling, Indian Rupee (INR) formatting, and transparent formula breakdowns.
 */

export type CalculationType = 'SIMPLE' | 'COMPOUND';

export type CompoundingFrequency = 'ANNUALLY' | 'SEMI_ANNUALLY' | 'QUARTERLY' | 'MONTHLY' | 'DAILY';

export type DayCountConvention = 'ACTUAL_365' | 'ACTUAL_366' | 'ACTUAL_360';

export type CalculationMode = 'GENERAL' | 'LITIGATION_AWARD';

export interface InterestCalculationParams {
  principal: number;
  rate: number; // Annual percentage (e.g., 12 for 12%)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  calculationType: CalculationType;
  compoundingFrequency?: CompoundingFrequency;
  dayCountConvention?: DayCountConvention;
  mode?: CalculationMode;
}

export interface InterestCalculationResult {
  valid: boolean;
  error?: string;
  principal: number;
  principalFormatted: string;
  rate: number;
  rateFormatted: string;
  startDate: string;
  endDate: string;
  elapsedDays: number;
  elapsedYears: number;
  elapsedTimeFormatted: string;
  dayCountConvention: string;
  dayCountBasis: number;
  calculationType: CalculationType;
  calculationTypeLabel: string;
  compoundingFrequencyLabel: string;
  compoundingFrequencyCount: number;
  interestEarned: number;
  interestEarnedFormatted: string;
  totalAmount: number;
  totalAmountFormatted: string;
  formulaText: string;
  substitutionText: string;
  calculationSteps: string[];
  mode: CalculationMode;
  legalReferenceNotice: string;
}

/**
 * Formats a numeric value into Indian Rupee currency format (e.g. ₹1,00,000.00)
 */
export const formatINR = (amount: number): string => {
  if (isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Checks if a given year is a leap year
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Calculates detailed elapsed time between two dates
 */
export const calculateElapsedTime = (startDateStr: string, endDateStr: string) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const diffTime = end.getTime() - start.getTime();
  const actualDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let startYear = start.getFullYear();
  let startMonth = start.getMonth();
  let startDay = start.getDate();

  let endYear = end.getFullYear();
  let endMonth = end.getMonth();
  let endDay = end.getDate();

  let years = endYear - startYear;
  let months = endMonth - startMonth;
  let days = endDay - startDay;

  if (days < 0) {
    months -= 1;
    // Days in previous month
    const prevMonthDate = new Date(endYear, endMonth, 0);
    days += prevMonthDate.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

  const timeFormatted = `${parts.join(', ')} (${actualDays} Actual ${actualDays === 1 ? 'Day' : 'Days'})`;

  // Detect leap year spanning
  let containsLeapYear = false;
  for (let y = startYear; y <= endYear; y++) {
    if (isLeapYear(y)) {
      containsLeapYear = true;
      break;
    }
  }

  return {
    actualDays,
    years,
    months,
    days,
    timeFormatted,
    containsLeapYear
  };
};

/**
 * Main Interest Calculation Engine Function
 */
export const calculateInterest = (params: InterestCalculationParams): InterestCalculationResult => {
  const {
    principal,
    rate,
    startDate,
    endDate,
    calculationType,
    compoundingFrequency = 'ANNUALLY',
    dayCountConvention = 'ACTUAL_365',
    mode = 'GENERAL'
  } = params;

  // Validation
  if (!principal || isNaN(principal) || principal <= 0) {
    return {
      valid: false,
      error: 'Please enter a valid principal amount greater than 0.',
      principal: 0,
      principalFormatted: '₹0.00',
      rate: 0,
      rateFormatted: '0%',
      startDate,
      endDate,
      elapsedDays: 0,
      elapsedYears: 0,
      elapsedTimeFormatted: '',
      dayCountConvention: 'Actual/365',
      dayCountBasis: 365,
      calculationType: 'SIMPLE',
      calculationTypeLabel: 'Simple Interest',
      compoundingFrequencyLabel: 'Annually',
      compoundingFrequencyCount: 1,
      interestEarned: 0,
      interestEarnedFormatted: '₹0.00',
      totalAmount: 0,
      totalAmountFormatted: '₹0.00',
      formulaText: '',
      substitutionText: '',
      calculationSteps: [],
      mode,
      legalReferenceNotice: ''
    };
  }

  if (rate === undefined || isNaN(rate) || rate < 0) {
    return {
      valid: false,
      error: 'Please enter a valid non-negative annual interest rate.',
      principal,
      principalFormatted: formatINR(principal),
      rate: 0,
      rateFormatted: '0%',
      startDate,
      endDate,
      elapsedDays: 0,
      elapsedYears: 0,
      elapsedTimeFormatted: '',
      dayCountConvention: 'Actual/365',
      dayCountBasis: 365,
      calculationType,
      calculationTypeLabel: calculationType === 'SIMPLE' ? 'Simple Interest' : 'Compound Interest',
      compoundingFrequencyLabel: 'Annually',
      compoundingFrequencyCount: 1,
      interestEarned: 0,
      interestEarnedFormatted: '₹0.00',
      totalAmount: principal,
      totalAmountFormatted: formatINR(principal),
      formulaText: '',
      substitutionText: '',
      calculationSteps: [],
      mode,
      legalReferenceNotice: ''
    };
  }

  if (!startDate || !endDate) {
    return {
      valid: false,
      error: 'Please select both start date and end date.',
      principal,
      principalFormatted: formatINR(principal),
      rate,
      rateFormatted: `${rate}%`,
      startDate,
      endDate,
      elapsedDays: 0,
      elapsedYears: 0,
      elapsedTimeFormatted: '',
      dayCountConvention: 'Actual/365',
      dayCountBasis: 365,
      calculationType,
      calculationTypeLabel: calculationType === 'SIMPLE' ? 'Simple Interest' : 'Compound Interest',
      compoundingFrequencyLabel: 'Annually',
      compoundingFrequencyCount: 1,
      interestEarned: 0,
      interestEarnedFormatted: '₹0.00',
      totalAmount: principal,
      totalAmountFormatted: formatINR(principal),
      formulaText: '',
      substitutionText: '',
      calculationSteps: [],
      mode,
      legalReferenceNotice: ''
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return {
      valid: false,
      error: 'End date must be later than start date.',
      principal,
      principalFormatted: formatINR(principal),
      rate,
      rateFormatted: `${rate}%`,
      startDate,
      endDate,
      elapsedDays: 0,
      elapsedYears: 0,
      elapsedTimeFormatted: '',
      dayCountConvention: 'Actual/365',
      dayCountBasis: 365,
      calculationType,
      calculationTypeLabel: calculationType === 'SIMPLE' ? 'Simple Interest' : 'Compound Interest',
      compoundingFrequencyLabel: 'Annually',
      compoundingFrequencyCount: 1,
      interestEarned: 0,
      interestEarnedFormatted: '₹0.00',
      totalAmount: principal,
      totalAmountFormatted: formatINR(principal),
      formulaText: '',
      substitutionText: '',
      calculationSteps: [],
      mode,
      legalReferenceNotice: ''
    };
  }

  // Elapsed Time Calculation
  const { actualDays, timeFormatted, containsLeapYear } = calculateElapsedTime(startDate, endDate);

  let basisDays = 365;
  let conventionLabel = 'Actual/365';

  if (dayCountConvention === 'ACTUAL_366') {
    basisDays = 366;
    conventionLabel = 'Actual/366 (Leap Year)';
  } else if (dayCountConvention === 'ACTUAL_360') {
    basisDays = 360;
    conventionLabel = 'Actual/360 (Commercial)';
  } else {
    basisDays = 365;
    conventionLabel = 'Actual/365 (Standard Statutory)';
  }

  const timeYears = actualDays / basisDays;

  let interestEarned = 0;
  let totalAmount = 0;
  let formulaText = '';
  let substitutionText = '';
  const calculationSteps: string[] = [];
  let compoundingFrequencyLabel = 'N/A (Simple Interest)';
  let compoundingFrequencyCount = 1;

  if (calculationType === 'SIMPLE') {
    // SI = (P * R * T) / 100 where T = actualDays / basisDays
    interestEarned = (principal * rate * timeYears) / 100;
    totalAmount = principal + interestEarned;

    formulaText = 'SI = (P × R × T) / 100';
    substitutionText = `SI = (${formatINR(principal)} × ${rate}% × (${actualDays} / ${basisDays})) / 100`;

    calculationSteps.push(`Step 1: Calculate time in years using ${conventionLabel} convention: T = ${actualDays} days / ${basisDays} days = ${timeYears.toFixed(6)} years.`);
    calculationSteps.push(`Step 2: Apply Simple Interest Formula: SI = (${principal} × ${rate} × ${timeYears.toFixed(6)}) / 100.`);
    calculationSteps.push(`Step 3: Interest Earned = ${formatINR(interestEarned)}.`);
    calculationSteps.push(`Step 4: Total Amount = Principal + SI = ${formatINR(principal)} + ${formatINR(interestEarned)} = ${formatINR(totalAmount)}.`);
  } else {
    // Compound Interest: A = P * (1 + r / n)^(n * t)
    const r = rate / 100;
    switch (compoundingFrequency) {
      case 'ANNUALLY':
        compoundingFrequencyCount = 1;
        compoundingFrequencyLabel = 'Compounded Annually (1x / Year)';
        break;
      case 'SEMI_ANNUALLY':
        compoundingFrequencyCount = 2;
        compoundingFrequencyLabel = 'Compounded Half-Yearly (2x / Year)';
        break;
      case 'QUARTERLY':
        compoundingFrequencyCount = 4;
        compoundingFrequencyLabel = 'Compounded Quarterly (4x / Year)';
        break;
      case 'MONTHLY':
        compoundingFrequencyCount = 12;
        compoundingFrequencyLabel = 'Compounded Monthly (12x / Year)';
        break;
      case 'DAILY':
        compoundingFrequencyCount = basisDays;
        compoundingFrequencyLabel = `Compounded Daily (${basisDays}x / Year)`;
        break;
    }

    const n = compoundingFrequencyCount;
    const exponent = n * timeYears;
    const base = 1 + r / n;
    totalAmount = principal * Math.pow(base, exponent);
    interestEarned = totalAmount - principal;

    formulaText = 'A = P × (1 + r/n)^(n × t)';
    substitutionText = `A = ${formatINR(principal)} × (1 + (${rate}% / ${n}))^(${n} × (${actualDays}/${basisDays}))`;

    calculationSteps.push(`Step 1: Convert rate to decimal: r = ${rate} / 100 = ${r}.`);
    calculationSteps.push(`Step 2: Time in years T = ${actualDays} / ${basisDays} = ${timeYears.toFixed(6)} years.`);
    calculationSteps.push(`Step 3: Total compounding periods N = n × t = ${n} × ${timeYears.toFixed(6)} = ${exponent.toFixed(6)} periods.`);
    calculationSteps.push(`Step 4: Rate per compounding period = r / n = ${r} / ${n} = ${(r / n).toFixed(8)}.`);
    calculationSteps.push(`Step 5: Accumulated Factor = (1 + ${(r / n).toFixed(8)})^${exponent.toFixed(6)} = ${Math.pow(base, exponent).toFixed(8)}.`);
    calculationSteps.push(`Step 6: Total Final Amount = ${formatINR(principal)} × ${Math.pow(base, exponent).toFixed(8)} = ${formatINR(totalAmount)}.`);
    calculationSteps.push(`Step 7: Compound Interest Earned = Total Amount - Principal = ${formatINR(interestEarned)}.`);
  }

  const legalNotice = mode === 'LITIGATION_AWARD'
    ? 'Litigation Award Reference Notice: Interest calculations on court decrees or awards depend on specific judicial directions, Section 34 of CPC, 1908, Interest Act, 1978, or special contractual terms. This calculation provides an exact mathematical reference based on your inputs.'
    : 'General Interest Reference Notice: This interest calculation is provided for mathematical and financial reference purposes using standard day-count conventions.';

  return {
    valid: true,
    principal,
    principalFormatted: formatINR(principal),
    rate,
    rateFormatted: `${rate}% p.a.`,
    startDate,
    endDate,
    elapsedDays: actualDays,
    elapsedYears: Number(timeYears.toFixed(4)),
    elapsedTimeFormatted: timeFormatted,
    dayCountConvention: conventionLabel,
    dayCountBasis: basisDays,
    calculationType,
    calculationTypeLabel: calculationType === 'SIMPLE' ? 'Simple Interest' : 'Compound Interest',
    compoundingFrequencyLabel,
    compoundingFrequencyCount,
    interestEarned: Number(interestEarned.toFixed(2)),
    interestEarnedFormatted: formatINR(interestEarned),
    totalAmount: Number(totalAmount.toFixed(2)),
    totalAmountFormatted: formatINR(totalAmount),
    formulaText,
    substitutionText,
    calculationSteps,
    mode,
    legalReferenceNotice: legalNotice
  };
};
