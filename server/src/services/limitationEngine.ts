import { LIMITATION_ARTICLES, LimitationArticle } from '../data/limitationArticles';

export interface LimitationCalculationInput {
  articleId: string;
  startingDate: string; // YYYY-MM-DD
  courtClosedOnLastDay?: boolean; // Section 4
  courtClosedNotes?: string;
  condonationRequested?: boolean; // Section 5
  legalDisability?: 'none' | 'minor' | 'insanity' | 'idiocy' | 'other'; // Section 6
  disabilityNotes?: string;
  exclusionDays?: number; // Section 12 (Certified copy, etc.)
  exclusionNotes?: string;
  previousProceeding?: {
    existed: boolean;
    startDate?: string;
    endDate?: string;
    courtName?: string;
    sameMatter?: boolean;
    goodFaith?: boolean;
    jurisdictionIssue?: boolean;
  }; // Section 14
  fraudOrMistake?: 'none' | 'fraud' | 'mistake' | 'concealment'; // Section 17
  discoveryDate?: string;
  acknowledgement?: {
    exists: boolean;
    ackDate?: string;
    beforeExpiry?: boolean;
    docRef?: string;
  }; // Section 18
  partPayment?: {
    exists: boolean;
    paymentDate?: string;
    beforeExpiry?: boolean;
    docRef?: string;
  }; // Section 19
  specialOrLocalLaw?: 'no' | 'yes' | 'not_sure';
}

export interface LimitationCalculationResult {
  article: LimitationArticle;
  inputStartingDate: string;
  effectiveStartingDate: string;
  basePrescribedDeadline: string; // Base date without extra adjustments
  adjustedDeadline: string; // Final calculated indicative deadline
  isPassed: boolean;
  daysRemainingOrPassed: number;
  statutoryAdjustments: {
    section4CourtClosure: {
      applied: boolean;
      summary: string;
    };
    section5Condonation: {
      applicable: boolean;
      summary: string;
    };
    section6LegalDisability: {
      flagged: boolean;
      summary: string;
    };
    section12Exclusion: {
      daysAdded: number;
      summary: string;
    };
    section14PreviousProceeding: {
      flagged: boolean;
      daysExcludableEstimate: number;
      summary: string;
    };
    section17FraudMistake: {
      applied: boolean;
      summary: string;
    };
    section18Acknowledgement: {
      applied: boolean;
      freshPeriodDeadline?: string;
      summary: string;
    };
    section19PartPayment: {
      applied: boolean;
      freshPeriodDeadline?: string;
      summary: string;
    };
    specialLocalLaw: {
      flagged: boolean;
      summary: string;
    };
  };
  summaryText: string;
  disclaimerText: string;
}

/**
 * Add period (years, months, days) to a Date object safely handling month lengths & leap years
 */
export function addLimitationPeriod(baseDate: Date, value: number, unit: 'years' | 'months' | 'days'): Date {
  const result = new Date(baseDate.getTime());
  if (unit === 'years') {
    result.setFullYear(result.getFullYear() + value);
  } else if (unit === 'months') {
    result.setMonth(result.getMonth() + value);
  } else if (unit === 'days') {
    result.setDate(result.getDate() + value);
  }
  return result;
}

/**
 * Format Date to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Core Calculation Engine for Limitation Act, 1963
 */
export function calculateLimitation(input: LimitationCalculationInput): LimitationCalculationResult {
  // 1. Article lookup
  const article = LIMITATION_ARTICLES.find(a => a.id === input.articleId || a.articleNumber === input.articleId);
  if (!article) {
    throw new Error(`Limitation Article with ID '${input.articleId}' not found.`);
  }

  // 2. Parse starting date
  let startStr = input.startingDate;
  
  // Handle Section 17 Fraud / Mistake override if discovery date provided
  let section17Applied = false;
  let section17Summary = "No fraud or mistake alleged.";
  if (input.fraudOrMistake && input.fraudOrMistake !== 'none') {
    if (input.discoveryDate) {
      startStr = input.discoveryDate;
      section17Applied = true;
      section17Summary = `Section 17 potentially applies (${input.fraudOrMistake}). Limitation reckoning commenced from discovery date: ${input.discoveryDate}. Advocate review required to verify diligence under Section 17.`;
    } else {
      section17Summary = `Section 17 issue indicated (${input.fraudOrMistake}). Discovery date required to compute extended limitation.`;
    }
  }

  const startDateObj = new Date(startStr);
  if (isNaN(startDateObj.getTime())) {
    throw new Error("Invalid starting date format. Please enter a valid date (YYYY-MM-DD).");
  }

  // 3. Base Prescribed Period Calculation
  const baseDeadlineObj = addLimitationPeriod(startDateObj, article.limitationValue, article.limitationUnit);
  const basePrescribedDeadline = formatDateISO(baseDeadlineObj);

  // 4. Section 12 Exclusion of Time
  let section12Days = 0;
  let section12Summary = "No exclusion of time specified under Section 12.";
  if (input.exclusionDays && input.exclusionDays > 0) {
    section12Days = Math.floor(input.exclusionDays);
    section12Summary = `Section 12 exclusion applied: ${section12Days} day(s) excluded (e.g., for obtaining certified copies of judgment/decree).`;
  }

  // 5. Section 18 Written Acknowledgement
  let section18Applied = false;
  let section18FreshDeadline: string | undefined = undefined;
  let section18Summary = "No written acknowledgement recorded under Section 18.";
  if (input.acknowledgement?.exists && input.acknowledgement.ackDate) {
    const ackDateObj = new Date(input.acknowledgement.ackDate);
    if (!isNaN(ackDateObj.getTime())) {
      // Verify if acknowledgement occurred before base expiry
      if (ackDateObj <= baseDeadlineObj) {
        section18Applied = true;
        const freshObj = addLimitationPeriod(ackDateObj, article.limitationValue, article.limitationUnit);
        if (section12Days > 0) {
          freshObj.setDate(freshObj.getDate() + section12Days);
        }
        section18FreshDeadline = formatDateISO(freshObj);
        section18Summary = `Section 18 acknowledgement recorded on ${input.acknowledgement.ackDate} before original expiry. A fresh 3-year/prescribed period runs from acknowledgement date.`;
      } else {
        section18Summary = `Section 18 acknowledgement recorded on ${input.acknowledgement.ackDate} AFTER original limitation expired. Acknowledgement after expiry does not revive limitation.`;
      }
    }
  }

  // 6. Section 19 Part Payment
  let section19Applied = false;
  let section19FreshDeadline: string | undefined = undefined;
  let section19Summary = "No part payment recorded under Section 19.";
  if (input.partPayment?.exists && input.partPayment.paymentDate) {
    const payDateObj = new Date(input.partPayment.paymentDate);
    if (!isNaN(payDateObj.getTime())) {
      if (payDateObj <= baseDeadlineObj) {
        section19Applied = true;
        const freshObj = addLimitationPeriod(payDateObj, article.limitationValue, article.limitationUnit);
        if (section12Days > 0) {
          freshObj.setDate(freshObj.getDate() + section12Days);
        }
        section19FreshDeadline = formatDateISO(freshObj);
        section19Summary = `Section 19 part payment recorded on ${input.partPayment.paymentDate} before expiry. A fresh prescribed period runs from payment date.`;
      } else {
        section19Summary = `Section 19 part payment recorded on ${input.partPayment.paymentDate} AFTER original limitation expired. Payment after expiry does not compute a fresh period.`;
      }
    }
  }

  // 7. Calculate Final Adjusted Deadline
  let finalDeadlineObj = new Date(baseDeadlineObj.getTime());

  // Apply Section 12 extra days
  if (section12Days > 0) {
    finalDeadlineObj.setDate(finalDeadlineObj.getDate() + section12Days);
  }

  // Use the latest valid fresh deadline from Section 18 or Section 19 if applicable
  if (section18FreshDeadline) {
    const s18Date = new Date(section18FreshDeadline);
    if (s18Date > finalDeadlineObj) {
      finalDeadlineObj = s18Date;
    }
  }
  if (section19FreshDeadline) {
    const s19Date = new Date(section19FreshDeadline);
    if (s19Date > finalDeadlineObj) {
      finalDeadlineObj = s19Date;
    }
  }

  // 8. Section 4 Court Closure
  let section4Applied = false;
  let section4Summary = "No court closure reported for the last day.";
  if (input.courtClosedOnLastDay) {
    section4Applied = true;
    section4Summary = "Section 4 applies: If court was closed on the last day of limitation, suit/appeal/application may be instituted on the day court re-opens.";
  }

  // 9. Section 5 Condonation
  const isSuit = article.division === 'First Division - Suits';
  let section5Summary = "";
  if (isSuit) {
    section5Summary = "Section 5 condonation of delay DOES NOT apply to Suits. Section 5 is restricted to certain appeals and applications where statutory requirements are satisfied.";
  } else {
    section5Summary = input.condonationRequested
      ? "Section 5 condonation requested: Condonation of delay in appeals/applications is subject to court's satisfaction of 'sufficient cause'."
      : "Section 5 condonation available for appeals/applications upon proving sufficient cause to the court.";
  }

  // 10. Section 6 Legal Disability
  let section6Flagged = false;
  let section6Summary = "No legal disability reported.";
  if (input.legalDisability && input.legalDisability !== 'none') {
    section6Flagged = true;
    section6Summary = `Potential Section 6 issue (${input.legalDisability}): Limitation period runs after disability has ceased. Complex legal issue — Advocate review required.`;
  }

  // 11. Section 14 Previous Proceeding
  let section14Flagged = false;
  let section14DaysEstimate = 0;
  let section14Summary = "No previous proceeding reported under Section 14.";
  if (input.previousProceeding?.existed) {
    section14Flagged = true;
    if (input.previousProceeding.startDate && input.previousProceeding.endDate) {
      const pStart = new Date(input.previousProceeding.startDate);
      const pEnd = new Date(input.previousProceeding.endDate);
      if (!isNaN(pStart.getTime()) && !isNaN(pEnd.getTime()) && pEnd >= pStart) {
        section14DaysEstimate = Math.ceil((pEnd.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    section14Summary = `Section 14 applicability depends on statutory requirements (good faith, defect of jurisdiction, same cause of action). Estimated excludable duration: ${section14DaysEstimate} day(s). Advocate review required.`;
  }

  // 12. Special or Local Law
  let specialLawFlagged = false;
  let specialLawSummary = "Standard Limitation Act, 1963 Schedule rules apply.";
  if (input.specialOrLocalLaw && input.specialOrLocalLaw !== 'no') {
    specialLawFlagged = true;
    specialLawSummary = "Special or local legislation may prescribe a different limitation period or specific exclusion rules under Section 29(2). Verify the applicable special statute before relying on this calculation.";
  }

  const adjustedDeadline = formatDateISO(finalDeadlineObj);

  // Compare with current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineComparisonDate = new Date(finalDeadlineObj);
  deadlineComparisonDate.setHours(0, 0, 0, 0);

  const diffMs = deadlineComparisonDate.getTime() - today.getTime();
  const daysRemainingOrPassed = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const isPassed = daysRemainingOrPassed < 0;

  const summaryText = isPassed
    ? `Based on the entered information, the indicative limitation period has passed by ${Math.abs(daysRemainingOrPassed)} day(s).`
    : `Calculated limitation deadline has not yet passed. Approximately ${daysRemainingOrPassed} day(s) remaining.`;

  const disclaimerText = "This calculator is an informational legal tool intended to assist with preliminary limitation-date calculations. The result is not a final determination of whether a proceeding is barred by limitation. The actual position may depend on the facts, applicable provisions, special or local laws, exclusions of time, acknowledgements, payments, disabilities, fraud or mistake, court closure, case law and other circumstances. An Advocate should verify the applicable law and facts before relying on the calculated date.";

  return {
    article,
    inputStartingDate: input.startingDate,
    effectiveStartingDate: startStr,
    basePrescribedDeadline,
    adjustedDeadline,
    isPassed,
    daysRemainingOrPassed,
    statutoryAdjustments: {
      section4CourtClosure: {
        applied: section4Applied,
        summary: section4Summary
      },
      section5Condonation: {
        applicable: !isSuit,
        summary: section5Summary
      },
      section6LegalDisability: {
        flagged: section6Flagged,
        summary: section6Summary
      },
      section12Exclusion: {
        daysAdded: section12Days,
        summary: section12Summary
      },
      section14PreviousProceeding: {
        flagged: section14Flagged,
        daysExcludableEstimate: section14DaysEstimate,
        summary: section14Summary
      },
      section17FraudMistake: {
        applied: section17Applied,
        summary: section17Summary
      },
      section18Acknowledgement: {
        applied: section18Applied,
        freshPeriodDeadline: section18FreshDeadline,
        summary: section18Summary
      },
      section19PartPayment: {
        applied: section19Applied,
        freshPeriodDeadline: section19FreshDeadline,
        summary: section19Summary
      },
      specialLocalLaw: {
        flagged: specialLawFlagged,
        summary: specialLawSummary
      }
    },
    summaryText,
    disclaimerText
  };
}
