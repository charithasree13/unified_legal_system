import React, { useState } from 'react';
import { 
  Calculator, Scale, Calendar, DollarSign, RefreshCw, Copy, Check, Printer, 
  Info, AlertCircle, ShieldCheck, Sparkles, BookOpen, Layers, ArrowRight
} from 'lucide-react';
import { 
  calculateInterest, 
  formatINR, 
  type CalculationType, 
  type CompoundingFrequency, 
  type DayCountConvention, 
  type CalculationMode,
  type InterestCalculationResult
} from '../utils/interestCalculatorEngine';

export const InterestCalculatorPage: React.FC = () => {
  // Today and 1 year ago default dates
  const todayStr = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

  // State
  const [principal, setPrincipal] = useState<string>('100000');
  const [rate, setRate] = useState<string>('10');
  const [startDate, setStartDate] = useState<string>(oneYearAgoStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [calculationType, setCalculationType] = useState<CalculationType>('SIMPLE');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('ANNUALLY');
  const [dayCountConvention, setDayCountConvention] = useState<DayCountConvention>('ACTUAL_365');
  const [mode, setMode] = useState<CalculationMode>('GENERAL');

  const [copied, setCopied] = useState(false);

  // Perform Calculation
  const result: InterestCalculationResult = calculateInterest({
    principal: parseFloat(principal),
    rate: parseFloat(rate),
    startDate,
    endDate,
    calculationType,
    compoundingFrequency,
    dayCountConvention,
    mode
  });

  // Presets
  const applyPreset = (preset: 'CIVIL_DECREE' | 'MOTOR_ACCIDENT' | 'COMMERCIAL') => {
    if (preset === 'CIVIL_DECREE') {
      setPrincipal('500000');
      setRate('6');
      setCalculationType('SIMPLE');
      setMode('LITIGATION_AWARD');
      setDayCountConvention('ACTUAL_365');
    } else if (preset === 'MOTOR_ACCIDENT') {
      setPrincipal('1000000');
      setRate('7.5');
      setCalculationType('SIMPLE');
      setMode('LITIGATION_AWARD');
      setDayCountConvention('ACTUAL_365');
    } else if (preset === 'COMMERCIAL') {
      setPrincipal('250000');
      setRate('12');
      setCalculationType('COMPOUND');
      setCompoundingFrequency('MONTHLY');
      setMode('GENERAL');
      setDayCountConvention('ACTUAL_365');
    }
  };

  // Reset
  const handleReset = () => {
    setPrincipal('100000');
    setRate('10');
    setStartDate(oneYearAgoStr);
    setEndDate(todayStr);
    setCalculationType('SIMPLE');
    setCompoundingFrequency('ANNUALLY');
    setDayCountConvention('ACTUAL_365');
    setMode('GENERAL');
  };

  // Copy result text
  const handleCopy = () => {
    if (!result.valid) return;
    const text = `ELITE LEGAL DESK - INTEREST CALCULATION REPORT
--------------------------------------------------
Calculation Mode: ${result.mode === 'LITIGATION_AWARD' ? 'Litigation Award Reference' : 'General Financial Reference'}
Calculation Type: ${result.calculationTypeLabel}
Principal Amount: ${result.principalFormatted}
Interest Rate: ${result.rateFormatted}
Start Date: ${result.startDate}
End Date: ${result.endDate}
Elapsed Time: ${result.elapsedTimeFormatted}
Day-Count Convention: ${result.dayCountConvention}
--------------------------------------------------
INTEREST EARNED: ${result.interestEarnedFormatted}
TOTAL AMOUNT: ${result.totalAmountFormatted}
--------------------------------------------------
Formula: ${result.formulaText}
${result.legalReferenceNotice}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-primary text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-sky-500/20 text-sky-300 p-2.5 rounded-2xl backdrop-blur-md border border-sky-400/30">
              <Calculator size={28} />
            </span>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-sky-300 font-sans">
                Public Legal Utility Engine
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Interest Calculator
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed font-medium">
            Calculate simple and compound interest with transparent mathematical accuracy for litigation awards, court decrees, contractual claims, and general financial reference.
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" /> Calculation Settings & Parameters
              </h2>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition"
              >
                <RefreshCw size={13} /> Reset Defaults
              </button>
            </div>

            {/* Presets Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Quick Calculation Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('CIVIL_DECREE')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold border transition"
                >
                  Court Decree (6% p.a. SI)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('MOTOR_ACCIDENT')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold border transition"
                >
                  Motor Claim Award (7.5% SI)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('COMMERCIAL')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold border transition"
                >
                  Commercial Debt (12% Comp. Monthly)
                </button>
              </div>
            </div>

            {/* Mode Switcher: General vs Litigation */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Calculation Purpose / Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('GENERAL')}
                  className={`p-3 rounded-2xl text-xs font-extrabold border transition-all ${
                    mode === 'GENERAL'
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  General Financial Reference
                </button>
                <button
                  type="button"
                  onClick={() => setMode('LITIGATION_AWARD')}
                  className={`p-3 rounded-2xl text-xs font-extrabold border transition-all ${
                    mode === 'LITIGATION_AWARD'
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Litigation Award Reference
                </button>
              </div>
            </div>

            {/* Method Switcher: Simple vs Compound */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Calculation Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalculationType('SIMPLE')}
                  className={`p-3.5 rounded-2xl text-xs font-extrabold border transition-all ${
                    calculationType === 'SIMPLE'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Simple Interest (SI = P×R×T/100)
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationType('COMPOUND')}
                  className={`p-3.5 rounded-2xl text-xs font-extrabold border transition-all ${
                    calculationType === 'COMPOUND'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Compound Interest (A = P(1+r/n)^(nt))
                </button>
              </div>
            </div>

            {/* Principal & Interest Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  Principal / Award Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder="e.g. 100000"
                    min="1"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  Annual Interest Rate (% p.a.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="e.g. 10"
                    min="0"
                    className="w-full pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Start & End Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary dark:text-sky-400" /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary dark:text-sky-400" /> End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Compounding Frequency (only shown if Compound) */}
            {calculationType === 'COMPOUND' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Compounding Frequency
                </label>
                <select
                  value={compoundingFrequency}
                  onChange={(e) => setCompoundingFrequency(e.target.value as CompoundingFrequency)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ANNUALLY">Annually (1 Compounding Period / Year)</option>
                  <option value="SEMI_ANNUALLY">Half-Yearly (2 Compounding Periods / Year)</option>
                  <option value="QUARTERLY">Quarterly (4 Compounding Periods / Year)</option>
                  <option value="MONTHLY">Monthly (12 Compounding Periods / Year)</option>
                  <option value="DAILY">Daily (365 Compounding Periods / Year)</option>
                </select>
              </div>
            )}

            {/* Day Count Convention */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Day-Count Convention
              </label>
              <select
                value={dayCountConvention}
                onChange={(e) => setDayCountConvention(e.target.value as DayCountConvention)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ACTUAL_365">Actual/365 (Standard Indian Statutory Basis)</option>
                <option value="ACTUAL_366">Actual/366 (Leap Year Basis)</option>
                <option value="ACTUAL_360">Actual/360 (Commercial / Banking Basis)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-6 space-y-6">
          
          {!result.valid ? (
            <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-3xl p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-sm">
                <AlertCircle size={20} /> Input Validation Error
              </div>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">
                {result.error}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-sky-400 dark:border-sky-800 shadow-xl space-y-6">
              
              {/* Top Result Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Calculation Summary
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {result.calculationTypeLabel} Result
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border transition hover:bg-slate-200"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border transition hover:bg-slate-200"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>

              {/* Big Result Metrics Display Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Interest Earned */}
                <div className="p-5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Interest Earned
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-sky-950 dark:text-sky-100 tracking-tight">
                    {result.interestEarnedFormatted}
                  </div>
                </div>

                {/* Total Final Amount */}
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    {result.mode === 'LITIGATION_AWARD' ? 'Total Award + Interest' : 'Total Final Amount'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                    {result.totalAmountFormatted}
                  </div>
                </div>
              </div>

              {/* Parameters Breakdown Table */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2">
                  Parameters & Time Period
                </h4>

                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-medium pt-1">
                  <div>Principal Amount: <strong>{result.principalFormatted}</strong></div>
                  <div>Annual Rate: <strong>{result.rateFormatted}</strong></div>
                  <div>Start Date: <strong>{result.startDate}</strong></div>
                  <div>End Date: <strong>{result.endDate}</strong></div>
                  <div>Elapsed Time: <strong>{result.elapsedTimeFormatted}</strong></div>
                  <div>Day Count Convention: <strong>{result.dayCountConvention}</strong></div>
                  {result.calculationType === 'COMPOUND' && (
                    <div className="col-span-2">Compounding: <strong>{result.compoundingFrequencyLabel}</strong></div>
                  )}
                </div>
              </div>

              {/* Formula & Step-by-Step Calculation Details */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                  <BookOpen size={15} className="text-primary dark:text-sky-400" /> Formula & Calculation Steps
                </h4>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono space-y-1.5">
                  <div className="text-sky-600 dark:text-sky-400 font-bold">Formula: {result.formulaText}</div>
                  <div className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{result.substitutionText}</div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {result.calculationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Reference Disclaimer */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium space-y-1">
                <div className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Info size={14} className="text-sky-500" /> Legal Reference Notice
                </div>
                <p>{result.legalReferenceNotice}</p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default InterestCalculatorPage;
