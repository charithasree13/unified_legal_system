/**
 * Date Difference Calculation Engine for Elite Legal Desk
 * Provides strict UTC date normalization, elapsed calendar day calculations,
 * leap year handling, optional inclusive day counting, and accurate calendar breakdown.
 */

export interface DateDifferenceInput {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  includeBothDates?: boolean;
}

export interface CalendarBreakdown {
  years: number;
  months: number;
  days: number;
  formatted: string;
}

export interface DateDifferenceResult {
  isValid: boolean;
  errorMessage?: string;
  startDateFormatted: string; // e.g. "20 October 2026"
  endDateFormatted: string;   // e.g. "30 November 2026"
  totalDays: number;          // Standard elapsed days (endDate - startDate)
  inclusiveDays: number;      // Include both start & end dates (totalDays + 1)
  selectedDays: number;       // Value corresponding to user's includeBothDates preference
  breakdown: CalendarBreakdown;
  isSameDate: boolean;
  isLeapYearSpan: boolean;
}

/**
 * Checks if a given year is a leap year (366 days)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns total days in a given month of a given year
 */
export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(Date.UTC(year, monthZeroIndexed + 1, 0)).getUTCDate();
}

/**
 * Formats a Date or YYYY-MM-DD string into a clean legal display date (e.g., "20 October 2026")
 */
export function formatLegalDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;

  const [year, month, day] = parts;
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  
  return utcDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Parses YYYY-MM-DD string into UTC timestamp in milliseconds
 */
function parseUtcDate(dateStr: string): { year: number; month: number; day: number; timestamp: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [year, month, day] = parts;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const utcTimestamp = Date.UTC(year, month - 1, day);
  // Verify date validity (e.g. avoid 31st Feb auto-overflow)
  const verifyDate = new Date(utcTimestamp);
  if (verifyDate.getUTCFullYear() !== year || verifyDate.getUTCMonth() !== month - 1 || verifyDate.getUTCDate() !== day) {
    return null;
  }

  return { year, month, day, timestamp: utcTimestamp };
}

/**
 * Calculates calendar breakdown (years, months, days) between start and end dates.
 */
export function calculateCalendarBreakdown(
  startY: number, startM: number, startD: number,
  endY: number, endM: number, endD: number
): CalendarBreakdown {
  let y = endY - startY;
  let m = endM - startM;
  let d = endD - startD;

  if (d < 0) {
    // Borrow days from previous month of end date
    const prevMonthM = endM - 2 < 0 ? 11 : endM - 2;
    const prevMonthY = endM - 2 < 0 ? endY - 1 : endY;
    const daysInPrevMonth = getDaysInMonth(prevMonthY, prevMonthM);
    
    d += daysInPrevMonth;
    m -= 1;
  }

  if (m < 0) {
    m += 12;
    y -= 1;
  }

  // Format readable text
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} ${y === 1 ? 'year' : 'years'}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? 'month' : 'months'}`);
  if (d > 0 || (y === 0 && m === 0)) parts.push(`${d} ${d === 1 ? 'day' : 'days'}`);

  return {
    years: y,
    months: m,
    days: d,
    formatted: parts.join(' ')
  };
}

/**
 * Evaluates the date difference between Start Date and End Date.
 */
export function calculateDateDifference(input: DateDifferenceInput): DateDifferenceResult {
  const { startDate, endDate, includeBothDates = false } = input;

  if (!startDate || !startDate.trim()) {
    return {
      isValid: false,
      errorMessage: 'Start date is required.',
      startDateFormatted: '',
      endDateFormatted: '',
      totalDays: 0,
      inclusiveDays: 0,
      selectedDays: 0,
      breakdown: { years: 0, months: 0, days: 0, formatted: '0 days' },
      isSameDate: false,
      isLeapYearSpan: false
    };
  }

  if (!endDate || !endDate.trim()) {
    return {
      isValid: false,
      errorMessage: 'End date is required.',
      startDateFormatted: '',
      endDateFormatted: '',
      totalDays: 0,
      inclusiveDays: 0,
      selectedDays: 0,
      breakdown: { years: 0, months: 0, days: 0, formatted: '0 days' },
      isSameDate: false,
      isLeapYearSpan: false
    };
  }

  const startParsed = parseUtcDate(startDate);
  const endParsed = parseUtcDate(endDate);

  if (!startParsed) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid Start Date.',
      startDateFormatted: '',
      endDateFormatted: '',
      totalDays: 0,
      inclusiveDays: 0,
      selectedDays: 0,
      breakdown: { years: 0, months: 0, days: 0, formatted: '0 days' },
      isSameDate: false,
      isLeapYearSpan: false
    };
  }

  if (!endParsed) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid End Date.',
      startDateFormatted: '',
      endDateFormatted: '',
      totalDays: 0,
      inclusiveDays: 0,
      selectedDays: 0,
      breakdown: { years: 0, months: 0, days: 0, formatted: '0 days' },
      isSameDate: false,
      isLeapYearSpan: false
    };
  }

  // Validate date ordering
  if (endParsed.timestamp < startParsed.timestamp) {
    return {
      isValid: false,
      errorMessage: 'End date must be on or after the start date.',
      startDateFormatted: formatLegalDate(startDate),
      endDateFormatted: formatLegalDate(endDate),
      totalDays: 0,
      inclusiveDays: 0,
      selectedDays: 0,
      breakdown: { years: 0, months: 0, days: 0, formatted: '0 days' },
      isSameDate: false,
      isLeapYearSpan: false
    };
  }

  // Calculate elapsed days
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((endParsed.timestamp - startParsed.timestamp) / msPerDay);
  const inclusiveDays = totalDays + 1;
  const selectedDays = includeBothDates ? inclusiveDays : totalDays;
  const isSameDate = totalDays === 0;

  // Check if any year in span is a leap year
  let isLeapYearSpan = false;
  for (let yr = startParsed.year; yr <= endParsed.year; yr++) {
    if (isLeapYear(yr)) {
      isLeapYearSpan = true;
      break;
    }
  }

  const breakdown = calculateCalendarBreakdown(
    startParsed.year, startParsed.month, startParsed.day,
    endParsed.year, endParsed.month, endParsed.day
  );

  return {
    isValid: true,
    startDateFormatted: formatLegalDate(startDate),
    endDateFormatted: formatLegalDate(endDate),
    totalDays,
    inclusiveDays,
    selectedDays,
    breakdown,
    isSameDate,
    isLeapYearSpan
  };
}
