import React, { useState } from 'react';
import { 
  Calendar, Clock, Copy, Check, Printer, 
  AlertCircle, ShieldCheck, Scale, RotateCcw
} from 'lucide-react';
import { 
  calculateDateDifference, 
  type DateDifferenceResult 
} from '../utils/dateDifferenceEngine';

export const DateDifferenceCalculatorPage: React.FC = () => {
  // Initial empty date states - user must enter dates to calculate
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeBothDates, setIncludeBothDates] = useState<boolean>(false);
  const [calculated, setCalculated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Evaluate calculation result when calculate button is triggered or when user modifies inputs after initial calculate
  const isFormSubmitted = calculated || Boolean(startDate && endDate);
  const result: DateDifferenceResult | null = isFormSubmitted
    ? calculateDateDifference({
        startDate,
        endDate,
        includeBothDates
      })
    : null;

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCalculated(true);
  };

  // Quick Preset Handlers (e.g. +30 Days from start date or today)
  const applyPreset = (daysAdd: number) => {
    let baseDateStr = startDate;
    if (!baseDateStr) {
      baseDateStr = new Date().toISOString().split('T')[0];
      setStartDate(baseDateStr);
    }
    const parts = baseDateStr.split('-').map(Number);
    if (parts.length !== 3) return;
    const startUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
    const targetUtc = new Date(startUtc + daysAdd * 24 * 60 * 60 * 1000);
    const yyyy = targetUtc.getUTCFullYear();
    const mm = String(targetUtc.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(targetUtc.getUTCDate()).padStart(2, '0');
    setEndDate(`${yyyy}-${mm}-${dd}`);
    setCalculated(true);
  };

  // Reset Form to blank state
  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setIncludeBothDates(false);
    setCalculated(false);
  };

  // Copy Summary
  const handleCopy = () => {
    if (!result || !result.isValid) return;
    const summaryText = `ELITE LEGAL DESK - DATE DIFFERENCE CALCULATION
--------------------------------------------------
Start Date: ${result.startDateFormatted} (${startDate})
End Date:   ${result.endDateFormatted} (${endDate})
--------------------------------------------------
Standard Difference (Elapsed): ${result.totalDays} DAYS
Inclusive Count (Both Dates): ${result.inclusiveDays} DAYS
Selected Calculation:          ${result.selectedDays} DAYS
Calendar Breakdown:            ${result.breakdown.formatted}
--------------------------------------------------
Calculated via Elite Legal Desk Public Legal Utility`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      
      {/* Header Banner - Bespoke Handcrafted Executive Indigo Design */}
      <div className="bg-gradient-to-r from-[#0d122b] via-[#161c42] to-[#0c1027] border border-slate-800 border-l-[6px] border-l-indigo-500 ring-1 ring-white/10 text-white p-6 sm:p-8 rounded-[1.75rem] shadow-2xl relative overflow-hidden">
        {/* Subtle geometric line pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <Calendar size={13} className="text-indigo-400" />
              <span>Public Legal Utility</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
              Date Difference Calculator
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl font-normal leading-relaxed">
              Calculate the exact number of calendar days between two dates quickly, accurately, and with precise leap-year handling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm font-mono">
              <ShieldCheck size={14} className="text-emerald-400" /> 100% Free & Open Access
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls */}
        <form onSubmit={handleCalculate} className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="text-sky-600 dark:text-sky-400" size={18} />
              Date Inputs & Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter Start Date and End Date below to calculate elapsed calendar days.
            </p>
          </div>

          {/* Date Range Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Start Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (calculated) setCalculated(true);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                End Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (calculated) setCalculated(true);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>

          </div>

          {/* Quick Preset Add Buttons */}
          <div className="space-y-2 pt-1">
            <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Quick End Date Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '+30 Days', days: 30 },
                { label: '+60 Days', days: 60 },
                { label: '+90 Days', days: 90 },
                { label: '+1 Year (365d)', days: 365 }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.days)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inclusive Count Checkbox Toggle */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeBothDates}
                onChange={(e) => setIncludeBothDates(e.target.checked)}
                className="h-4 w-4 text-sky-600 rounded border-slate-300 dark:border-slate-700 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                Include both start and end dates in calculation
              </span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-7">
              When checked, both boundary dates are included in the count (e.g., adding 1 additional day to include both start and end dates).
            </p>
          </div>

          {/* Validation Error Banner */}
          {result && !result.isValid && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5 font-medium">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
              <span>{result.errorMessage}</span>
            </div>
          )}

          {/* Action Buttons: Calculate Difference & Reset */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Calendar size={15} /> Calculate Difference
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>

        </form>

        {/* Right Column: Result Section */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-6">
          
          <div>
            {/* Result Header & Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Calculation Result
                </h3>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Date Difference Summary
                </p>
              </div>

              {result && result.isValid && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    title="Copy calculation summary"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    title="Print calculation result"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              )}
            </div>

            {!result || !result.isValid ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-3">
                <Calendar size={44} className="mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No dates entered yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                    Select Start Date and End Date on the left and click <strong className="text-slate-600 dark:text-slate-400">Calculate Difference</strong> to view results.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                
                {/* Hero Display Card */}
                <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 text-center relative overflow-hidden shadow-inner">
                  
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block mb-1">
                    DATE DIFFERENCE
                  </span>

                  <p className="text-xs text-slate-300 font-medium mb-3">
                    <span className="text-white font-bold">{result.startDateFormatted}</span> to <span className="text-white font-bold">{result.endDateFormatted}</span>
                  </p>

                  <div className="my-2">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono block">
                      {result.selectedDays}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-sky-400 mt-1 block">
                      {result.selectedDays === 1 ? 'DAY' : 'DAYS'}
                    </span>
                  </div>

                  {includeBothDates && (
                    <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                      Includes both start & end dates
                    </span>
                  )}
                </div>

                {/* Key Metrics Table */}
                <div className="space-y-2.5 text-xs">
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Standard Elapsed Difference:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                      {result.totalDays} {result.totalDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Inclusive Day Count (Both Dates):</span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                      {result.inclusiveDays} {result.inclusiveDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Calendar Breakdown:</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400 font-sans">
                      {result.breakdown.formatted}
                    </span>
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* Legal / Statutory Guidance Footer Note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Scale size={13} className="text-sky-600 dark:text-sky-400" /> Statutory & Judicial Note:
            </p>
            <p className="leading-relaxed">
              Standard elapsed day calculation (End Date minus Start Date) excludes the start date as 0 days, which is standard in legal proceedings under Section 9 of the General Clauses Act, 1897. Inclusive counting counts both boundary dates.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DateDifferenceCalculatorPage;
