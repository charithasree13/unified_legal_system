import React, { useState } from 'react';
import { 
  Scale, Users, Calculator, AlertTriangle, FileText, RotateCcw, Info, CheckCircle2, 
  ShieldAlert, DollarSign, Calendar, BookOpen, Layers, Printer, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { calculateIslamicInheritance } from '../utils/islamicInheritanceEngine';
import type { 
  IslamicInheritanceCaseInput, 
  IslamicInheritanceResult 
} from '../utils/islamicInheritanceEngine';

export const IslamicInheritanceCalculator: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();

  // STEP 1 — DECEASED INFORMATION
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [dateOfDeath, setDateOfDeath] = useState<string>('');
  const [madhhab, setMadhhab] = useState<'sunni_hanafi' | 'sunni_shafi' | 'sunni_maliki' | 'sunni_hanbali' | 'shia_jafari'>('sunni_hanafi');
  const [jurisdiction, setJurisdiction] = useState<'india' | 'other'>('india');

  // STEP 2 — ESTATE DETAILS
  const [grossEstateValue, setGrossEstateValue] = useState<string>('');
  const [movableAssets, setMovableAssets] = useState<string>('');
  const [immovableAssets, setImmovableAssets] = useState<string>('');
  const [otherAssets, setOtherAssets] = useState<string>('');
  const [funeralExpenses, setFuneralExpenses] = useState<string>('0');
  const [outstandingDebts, setOutstandingDebts] = useState<string>('0');
  const [validBequest, setValidBequest] = useState<string>('0');
  const [otherDeductions, setOtherDeductions] = useState<string>('0');

  // STEP 3 — SPOUSE INFORMATION
  const [wivesCount, setWivesCount] = useState<number>(1);
  const [husbandAlive, setHusbandAlive] = useState<boolean>(true);

  // STEP 4 — CHILDREN & DESCENDANTS
  const [sonsCount, setSonsCount] = useState<number>(1);
  const [daughtersCount, setDaughtersCount] = useState<number>(1);
  const [grandsonsCount, setGrandsonsCount] = useState<number>(0);
  const [granddaughtersCount, setGranddaughtersCount] = useState<number>(0);

  // STEP 5 — PARENTS
  const [fatherAlive, setFatherAlive] = useState<boolean>(true);
  const [motherAlive, setMotherAlive] = useState<boolean>(true);

  // STEP 6 — GRANDPARENTS (Expandable)
  const [showGrandparents, setShowGrandparents] = useState<boolean>(false);
  const [paternalGrandfatherAlive, setPaternalGrandfatherAlive] = useState<boolean>(false);
  const [paternalGrandmotherAlive, setPaternalGrandmotherAlive] = useState<boolean>(false);
  const [maternalGrandmotherAlive, setMaternalGrandmotherAlive] = useState<boolean>(false);

  // STEP 7 — SIBLINGS (Expandable)
  const [showSiblings, setShowSiblings] = useState<boolean>(false);
  const [fullBrothersCount, setFullBrothersCount] = useState<number>(0);
  const [fullSistersCount, setFullSistersCount] = useState<number>(0);
  const [consanguineBrothersCount, setConsanguineBrothersCount] = useState<number>(0);
  const [consanguineSistersCount, setConsanguineSistersCount] = useState<number>(0);
  const [uterineBrothersCount, setUterineBrothersCount] = useState<number>(0);
  const [uterineSistersCount, setUterineSistersCount] = useState<number>(0);

  // STEP 8 — ADVANCED / OTHER HEIRS (Expandable)
  const [showAdvancedHeirs, setShowAdvancedHeirs] = useState<boolean>(false);
  const [fullBrotherSonsCount, setFullBrotherSonsCount] = useState<number>(0);
  const [paternalUnclesCount, setPaternalUnclesCount] = useState<number>(0);
  const [hasUnsupportedAdvancedHeir, setHasUnsupportedAdvancedHeir] = useState<boolean>(false);

  // RESULT STATE
  const [result, setResult] = useState<IslamicInheritanceResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Computed Live Net Distributable Estate (Preview)
  const numGross = grossEstateValue ? parseFloat(grossEstateValue) || 0 : (
    (parseFloat(movableAssets) || 0) + (parseFloat(immovableAssets) || 0) + (parseFloat(otherAssets) || 0)
  );
  const numFuneral = parseFloat(funeralExpenses) || 0;
  const numDebts = parseFloat(outstandingDebts) || 0;
  const numBequest = parseFloat(validBequest) || 0;
  const numOtherDed = parseFloat(otherDeductions) || 0;
  
  const totalDeductionsPreview = numFuneral + numDebts + numBequest + numOtherDed;
  const netEstatePreview = Math.max(0, numGross - totalDeductionsPreview);

  // RESET FUNCTION
  const handleReset = () => {
    setDeceasedGender('male');
    setDateOfDeath('');
    setMadhhab('sunni_hanafi');
    setJurisdiction('india');
    setGrossEstateValue('');
    setMovableAssets('');
    setImmovableAssets('');
    setOtherAssets('');
    setFuneralExpenses('0');
    setOutstandingDebts('0');
    setValidBequest('0');
    setOtherDeductions('0');
    setWivesCount(1);
    setHusbandAlive(true);
    setSonsCount(1);
    setDaughtersCount(1);
    setGrandsonsCount(0);
    setGranddaughtersCount(0);
    setFatherAlive(true);
    setMotherAlive(true);
    setPaternalGrandfatherAlive(false);
    setPaternalGrandmotherAlive(false);
    setMaternalGrandmotherAlive(false);
    setFullBrothersCount(0);
    setFullSistersCount(0);
    setConsanguineBrothersCount(0);
    setConsanguineSistersCount(0);
    setUterineBrothersCount(0);
    setUterineSistersCount(0);
    setFullBrotherSonsCount(0);
    setPaternalUnclesCount(0);
    setHasUnsupportedAdvancedHeir(false);
    setResult(null);
    setErrorMessage(null);
    addNotification('Calculator Reset', 'All Islamic inheritance parameters have been restored to default state.', 'info');
  };

  // CALCULATION ACTION
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsCalculating(true);

    const payload: IslamicInheritanceCaseInput = {
      deceasedGender,
      dateOfDeath: dateOfDeath || undefined,
      madhhab,
      jurisdiction,
      grossEstateValue: numGross > 0 ? numGross : undefined,
      movableAssets: movableAssets ? parseFloat(movableAssets) : undefined,
      immovableAssets: immovableAssets ? parseFloat(immovableAssets) : undefined,
      otherAssets: otherAssets ? parseFloat(otherAssets) : undefined,
      funeralExpenses: numFuneral,
      outstandingDebts: numDebts,
      validBequest: numBequest,
      otherDeductions: numOtherDed,
      wivesCount: deceasedGender === 'male' ? wivesCount : undefined,
      husbandAlive: deceasedGender === 'female' ? husbandAlive : undefined,
      sonsCount,
      daughtersCount,
      grandsonsCount,
      granddaughtersCount,
      fatherAlive,
      motherAlive,
      paternalGrandfatherAlive,
      paternalGrandmotherAlive,
      maternalGrandmotherAlive,
      fullBrothersCount,
      fullSistersCount,
      consanguineBrothersCount,
      consanguineSistersCount,
      uterineBrothersCount,
      uterineSistersCount,
      fullBrotherSonsCount,
      paternalUnclesCount,
      hasUnsupportedAdvancedHeir
    };

    try {
      // 1. Try Protected API Endpoint
      const response = await fetch('/api/calculators/islamic-inheritance/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 403 || response.status === 401) {
        setErrorMessage('Unauthorized: Access to the Islamic Inheritance Calculator is available only to Admins and authorized Advocates.');
        setIsCalculating(false);
        return;
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setResult(resData.data);
      } else {
        // Fallback to client engine if API format differs or network offline
        const calcRes = calculateIslamicInheritance(payload);
        if (calcRes.errorMessage) {
          setErrorMessage(calcRes.errorMessage);
        }
        setResult(calcRes);
      }
    } catch (err: any) {
      console.warn('⚠️ Server API unreachable, running local calculation engine:', err.message);
      const calcRes = calculateIslamicInheritance(payload);
      if (calcRes.errorMessage) {
        setErrorMessage(calcRes.errorMessage);
      }
      setResult(calcRes);
    } finally {
      setIsCalculating(false);
    }
  };

  // PRINT / GENERATE REPORT ACTION
  const handlePrintReport = () => {
    if (!result) return;
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Top Banner Header - Bespoke Handcrafted Sacred Jade Design */}
      <div className="bg-gradient-to-r from-[#021f17] via-[#063326] to-[#011a13] text-white p-6 md:p-8 rounded-[1.75rem] shadow-2xl border border-emerald-900/40 border-l-[6px] border-l-emerald-500 ring-1 ring-white/10 relative overflow-hidden">
        {/* Subtle geometric line pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] uppercase tracking-widest">
            <Scale size={15} className="text-emerald-400" />
            <span>Elite Legal Desk — Personal Law Module</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-emerald-50 font-serif mb-2">
            Islamic Inheritance Calculator
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
            Calculate indicative Islamic inheritance shares (Fara'id) based on the selected succession framework, fixed Qur'anic shares (Fard), residuary rules ('Asabah), heir blocking (Hajb), proportional adjustment ('Awl), and residue redistribution (Radd).
          </p>
        </div>
      </div>

      {/* Statutory & Personal Law Advisory Notice */}
      <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-4 md:p-5 rounded-r-xl dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed flex items-start gap-3 shadow-sm">
        <Info className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <strong className="font-bold text-emerald-900 dark:text-emerald-400 block mb-0.5">Indicative Fara'id Calculation Notice:</strong>
          This calculator provides an indicative calculation based on recognized Islamic inheritance principles (Muslim Personal Law Application Act, 1937 in India). It is an informational aid for legal practitioners and administrators, and does not replace legal counsel, formal title verification, or a judicial decree/religious Fatwa.
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3 shadow-xs">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Form Inputs & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Input Form (7 Cols) */}
        <form onSubmit={handleCalculate} className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: DECEASED INFORMATION */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users size={18} className="text-emerald-600" />
              <span>Step 1 — Deceased Information & Framework</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Gender of Deceased *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeceasedGender('male')}
                    className={`py-2.5 px-4 text-xs font-bold rounded-lg border transition-all ${
                      deceasedGender === 'male'
                        ? 'bg-emerald-800 text-emerald-300 border-emerald-700 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Male Deceased
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeceasedGender('female')}
                    className={`py-2.5 px-4 text-xs font-bold rounded-lg border transition-all ${
                      deceasedGender === 'female'
                        ? 'bg-emerald-800 text-emerald-300 border-emerald-700 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Female Deceased
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Date of Death
                </label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  School of Thought / Madhhab *
                </label>
                <select
                  value={madhhab}
                  onChange={(e) => setMadhhab(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="sunni_hanafi">Sunni – Hanafi (Implemented Baseline)</option>
                  <option value="sunni_shafi">Sunni – Shafi'i</option>
                  <option value="sunni_maliki">Sunni – Maliki</option>
                  <option value="sunni_hanbali">Sunni – Hanbali</option>
                  <option value="shia_jafari">Shia – Ja'fari (Special Warning)</option>
                </select>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  The calculation engine applies standard Sunni Hanafi Fara'id rules.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Jurisdiction / Context *
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="india">India (Muslim Personal Law App Act 1937)</option>
                  <option value="other">Other / Not Specified</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: ESTATE & DEDUCTIONS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign size={18} className="text-emerald-600" />
              <span>Step 2 — Estate Details & Deductions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Gross Estate Value (₹) — Optional
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 6000000"
                    value={grossEstateValue}
                    onChange={(e) => setGrossEstateValue(e.target.value)}
                    className="w-full pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Funeral / Burial Expenses (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={funeralExpenses}
                    onChange={(e) => setFuneralExpenses(e.target.value)}
                    className="w-full pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Outstanding Debts / Liabilities (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={outstandingDebts}
                    onChange={(e) => setOutstandingDebts(e.target.value)}
                    className="w-full pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Valid Bequest / Wasiyyah (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={validBequest}
                    onChange={(e) => setValidBequest(e.target.value)}
                    className="w-full pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Subject to Islamic 1/3 legal cap of net estate after debts.
                </span>
              </div>
            </div>

            {/* Live Net Distributable Estate Box */}
            <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-xl border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                  Net Distributable Estate
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Gross (₹{numGross.toLocaleString('en-IN')}) − Deductions (₹{totalDeductionsPreview.toLocaleString('en-IN')})
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-sans">
                  ₹{netEstatePreview.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: SPOUSE INFORMATION (GENDER DYNAMIC) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users size={18} className="text-emerald-600" />
              <span>Step 3 — Spouse Information</span>
            </h2>

            {deceasedGender === 'male' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Surviving Wives Count (0 to 4)
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={wivesCount}
                  onChange={(e) => setWivesCount(Math.min(4, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full sm:w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Wives receive 1/4 (if no issue) or 1/8 (if issue present), divided equally among them.
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Surviving Husband
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="husbandAliveCheck"
                    checked={husbandAlive}
                    onChange={(e) => setHusbandAlive(e.target.checked)}
                    className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="husbandAliveCheck" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Husband is alive
                  </label>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Husband receives 1/2 (if no issue) or 1/4 (if issue present).
                </span>
              </div>
            )}
          </div>

          {/* STEP 4: CHILDREN & DESCENDANTS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers size={18} className="text-emerald-600" />
              <span>Step 4 — Children & Descendants</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Surviving Sons Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={sonsCount}
                  onChange={(e) => setSonsCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Surviving Daughters Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={daughtersCount}
                  onChange={(e) => setDaughtersCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Grandsons (Son's Sons)
                </label>
                <input
                  type="number"
                  min="0"
                  value={grandsonsCount}
                  onChange={(e) => setGrandsonsCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Granddaughters (Son's Daughters)
                </label>
                <input
                  type="number"
                  min="0"
                  value={granddaughtersCount}
                  onChange={(e) => setGranddaughtersCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: PARENTS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users size={18} className="text-emerald-600" />
              <span>Step 5 — Parents</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fatherAliveCheck"
                  checked={fatherAlive}
                  onChange={(e) => setFatherAlive(e.target.checked)}
                  className="h-5 w-5 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="fatherAliveCheck" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Father is Alive
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="motherAliveCheck"
                  checked={motherAlive}
                  onChange={(e) => setMotherAlive(e.target.checked)}
                  className="h-5 w-5 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="motherAliveCheck" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Mother is Alive
                </label>
              </div>
            </div>
          </div>

          {/* STEP 6: GRANDPARENTS (EXPANDABLE) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGrandparents(!showGrandparents)}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                <Layers size={18} />
                Step 6 — Grandparents (Expandable Section)
              </span>
              {showGrandparents ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showGrandparents && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pGrandfatherCheck"
                      checked={paternalGrandfatherAlive}
                      onChange={(e) => setPaternalGrandfatherAlive(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                    />
                    <label htmlFor="pGrandfatherCheck" className="text-xs text-slate-700 dark:text-slate-300">
                      Paternal Grandfather
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pGrandmotherCheck"
                      checked={paternalGrandmotherAlive}
                      onChange={(e) => setPaternalGrandmotherAlive(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                    />
                    <label htmlFor="pGrandmotherCheck" className="text-xs text-slate-700 dark:text-slate-300">
                      Paternal Grandmother
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mGrandmotherCheck"
                      checked={maternalGrandmotherAlive}
                      onChange={(e) => setMaternalGrandmotherAlive(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                    />
                    <label htmlFor="mGrandmotherCheck" className="text-xs text-slate-700 dark:text-slate-300">
                      Maternal Grandmother
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 7: SIBLINGS (EXPANDABLE) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSiblings(!showSiblings)}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                <Users size={18} />
                Step 7 — Siblings (Expandable Categories)
              </span>
              {showSiblings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showSiblings && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Full Brothers
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fullBrothersCount}
                      onChange={(e) => setFullBrothersCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Full Sisters
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fullSistersCount}
                      onChange={(e) => setFullSistersCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Consanguine / Paternal Brothers
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={consanguineBrothersCount}
                      onChange={(e) => setConsanguineBrothersCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Consanguine / Paternal Sisters
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={consanguineSistersCount}
                      onChange={(e) => setConsanguineSistersCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Uterine / Maternal Brothers
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={uterineBrothersCount}
                      onChange={(e) => setUterineBrothersCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Uterine / Maternal Sisters
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={uterineSistersCount}
                      onChange={(e) => setUterineSistersCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 8: ADVANCED FAMILY RELATIONSHIPS (EXPANDABLE) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvancedHeirs(!showAdvancedHeirs)}
              className="w-full p-5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                <BookOpen size={18} />
                Step 8 — Other Heirs / Advanced Family Relationships
              </span>
              {showAdvancedHeirs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showAdvancedHeirs && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Full Brother's Son (Nephews)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fullBrotherSonsCount}
                      onChange={(e) => setFullBrotherSonsCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Paternal Uncles
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paternalUnclesCount}
                      onChange={(e) => setPaternalUnclesCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="unsupportedHeirCheck"
                    checked={hasUnsupportedAdvancedHeir}
                    onChange={(e) => setHasUnsupportedAdvancedHeir(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                  />
                  <label htmlFor="unsupportedHeirCheck" className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    Case involves unlisted/disputed collateral relatives (Flag for manual legal review)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* FORM ACTION BUTTONS */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isCalculating}
              className="flex-1 py-3 px-6 bg-emerald-800 hover:bg-emerald-900 text-emerald-100 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Calculator size={18} />
              <span>{isCalculating ? 'Calculating Fara\'id...' : 'Calculate Inheritance'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>

        </form>

        {/* Right Column: Calculations & Results Presentation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {result ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6 animate-slide-up">
              
              {/* Header & Print Action */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <span>Fara'id Shares Summary</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {result.caseSummary.madhhabName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Print Result Report"
                >
                  <Printer size={16} />
                  <span>Print Report</span>
                </button>
              </div>

              {/* Case Estate Card Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Deceased:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{result.caseSummary.deceasedGender}</span>
                </div>
                {result.caseSummary.hasMonetaryCalculation && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Gross Estate:</span>
                      <span className="font-semibold">₹{result.caseSummary.grossEstate.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Total Deductions:</span>
                      <span className="font-semibold text-red-500">− ₹{result.caseSummary.totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                      <span className="text-emerald-700 dark:text-emerald-400">Net Estate:</span>
                      <span className="text-emerald-700 dark:text-emerald-400">₹{result.caseSummary.netDistributableEstate.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Eligible Heirs Distribution Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users size={16} className="text-emerald-600" />
                  <span>A. Eligible Heirs & Allocated Shares</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        <th className="p-2.5">Heir</th>
                        <th className="p-2.5">Share</th>
                        <th className="p-2.5">%</th>
                        {result.caseSummary.hasMonetaryCalculation && <th className="p-2.5">Amount (₹)</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {result.eligibleHeirs.map((heir) => (
                        <tr key={heir.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5">
                            <span className="font-bold block">{heir.heirName}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{heir.category}</span>
                          </td>
                          <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                            {heir.collectiveFractionStr}
                          </td>
                          <td className="p-2.5 font-bold">
                            {heir.percentageStr}
                          </td>
                          {result.caseSummary.hasMonetaryCalculation && (
                            <td className="p-2.5 font-extrabold text-slate-900 dark:text-white">
                              ₹{(heir.monetaryShare || 0).toLocaleString('en-IN')}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Excluded Heirs Table (Hajb) */}
              {result.excludedHeirs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldAlert size={16} />
                    <span>B. Excluded / Blocked Heirs (Hajb)</span>
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold">
                          <th className="p-2.5">Heir</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Reason / Blocker</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10 text-slate-800 dark:text-slate-200">
                        {result.excludedHeirs.map((ex, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-semibold">{ex.heirName}</td>
                            <td className="p-2.5 font-bold text-red-500">Excluded</td>
                            <td className="p-2.5 text-[11px] text-slate-600 dark:text-slate-300">{ex.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}



              {/* Quranic Primary Citations Panel */}
              <div className="p-4 bg-emerald-900/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block uppercase tracking-wider">
                  Primary Quranic Fara'id References
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  • <strong>Surah An-Nisa 4:11:</strong> Rules governing parental and children shares.<br />
                  • <strong>Surah An-Nisa 4:12:</strong> Rules governing spouse and uterine sibling shares.<br />
                  • <strong>Surah An-Nisa 4:176:</strong> Rules governing full and consanguine sibling shares.
                </p>
              </div>

              {/* Legal Notice */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic border-t border-slate-100 dark:border-slate-800 pt-3">
                {result.legalNotice}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Scale size={32} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  No Calculation Generated Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Fill in the deceased details, estate values, and family heir counts on the left and click <strong className="text-emerald-700 dark:text-emerald-400">Calculate Inheritance</strong> to render complete Fara'id shares.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
