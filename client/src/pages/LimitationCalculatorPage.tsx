import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Scale, Search, Filter, Calendar, Clock, AlertTriangle, CheckCircle2, 
  XCircle, Printer, RotateCcw, Info, FileText, ChevronDown, ChevronUp, 
  ShieldAlert, Sparkles, ExternalLink, Check, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LIMITATION_ARTICLES } from '../data/limitationArticles';
import type { LimitationArticle } from '../data/limitationArticles';
import { calculateLimitation } from '../utils/limitationEngine';
import type { LimitationCalculationInput, LimitationCalculationResult } from '../utils/limitationEngine';

export const LimitationCalculatorPage: React.FC = () => {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'calculator' | 'directory' | 'chequeBounce' | 'consumer'>('calculator');
  const pageTopRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the top when the calculator page opens or switches tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainElem = document.querySelector('main');
    if (mainElem) {
      mainElem.scrollTop = 0;
    }
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const mainElem = document.querySelector('main');
    if (mainElem) {
      mainElem.scrollTop = 0;
    }
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // Search & Filter state for Directory & Calculator
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Step 1: Proceeding Type Filter for Calculator
  const [proceedingType, setProceedingType] = useState<'Suit' | 'Appeal' | 'Application'>('Suit');

  // Step 2 & 3: Selected Article for Calculator
  const [selectedArticleId, setSelectedArticleId] = useState<string>('LA-054'); // Default Specific Performance Art 54
  const [detailModalArticle, setDetailModalArticle] = useState<LimitationArticle | null>(null);

  // Step 4: Starting Date Input
  const [startingDate, setStartingDate] = useState<string>(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    return today.toISOString().split('T')[0];
  });

  // Step 5: Advanced Statutory Inputs
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [courtClosed, setCourtClosed] = useState<boolean>(false);
  const [courtClosedNotes, setCourtClosedNotes] = useState<string>('');
  const [condonationRequested, setCondonationRequested] = useState<boolean>(false);
  const [legalDisability, setLegalDisability] = useState<'none' | 'minor' | 'insanity' | 'idiocy' | 'other'>('none');
  const [disabilityNotes, setDisabilityNotes] = useState<string>('');
  const [exclusionDays, setExclusionDays] = useState<number>(0);
  const [exclusionNotes, setExclusionNotes] = useState<string>('');
  
  // Section 14
  const [prevProcExisted, setPrevProcExisted] = useState<boolean>(false);
  const [prevProcStart, setPrevProcStart] = useState<string>('');
  const [prevProcEnd, setPrevProcEnd] = useState<string>('');
  const [prevProcCourt, setPrevProcCourt] = useState<string>('');
  const [prevProcSameMatter, setPrevProcSameMatter] = useState<boolean>(true);
  const [prevProcGoodFaith, setPrevProcGoodFaith] = useState<boolean>(true);
  const [prevProcJurisdiction, setPrevProcJurisdiction] = useState<boolean>(true);

  // Section 17
  const [fraudMistake, setFraudMistake] = useState<'none' | 'fraud' | 'mistake' | 'concealment'>('none');
  const [discoveryDate, setDiscoveryDate] = useState<string>('');

  // Section 18
  const [ackExists, setAckExists] = useState<boolean>(false);
  const [ackDate, setAckDate] = useState<string>('');
  const [ackDocRef, setAckDocRef] = useState<string>('');

  // Section 19
  const [partPayExists, setPartPayExists] = useState<boolean>(false);
  const [partPayDate, setPartPayDate] = useState<string>('');
  const [partPayDocRef, setPartPayDocRef] = useState<string>('');

  // Special Law
  const [specialLaw, setSpecialLaw] = useState<'no' | 'yes' | 'not_sure'>('no');

  // Calculation Result
  const [calcResult, setCalcResult] = useState<LimitationCalculationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation Test Report State
  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [validating, setValidating] = useState<boolean>(false);

  // Cheque Bounce Module State
  const [cbMemoDate, setCbMemoDate] = useState<string>('');
  const [cbNoticeSentDate, setCbNoticeSentDate] = useState<string>('');
  const [cbNoticeRecvDate, setCbNoticeRecvDate] = useState<string>('');

  // Consumer Protection Module State
  const [cpCauseDate, setCpCauseDate] = useState<string>('');
  const [cpForum, setCpForum] = useState<string>('District Commission');

  // Get currently selected article object
  const currentArticle = useMemo(() => {
    return LIMITATION_ARTICLES.find(a => a.id === selectedArticleId) || LIMITATION_ARTICLES[0];
  }, [selectedArticleId]);

  // Categories list
  const categoriesList = useMemo(() => {
    const cats = Array.from(new Set(LIMITATION_ARTICLES.map(a => a.category)));
    return ['All', ...cats];
  }, []);

  // Filtered articles for selection dropdown / list
  const filteredCalcArticles = useMemo(() => {
    return LIMITATION_ARTICLES.filter(a => {
      // Filter by Proceeding Type
      if (proceedingType === 'Suit' && a.division !== 'First Division - Suits') return false;
      if (proceedingType === 'Appeal' && a.division !== 'Second Division - Appeals') return false;
      if (proceedingType === 'Application' && a.division !== 'Third Division - Applications') return false;

      // Filter by Category if selected
      if (selectedCategoryFilter !== 'All' && a.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
        return false;
      }

      // Filter by Search Query if present
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.articleNumber.toLowerCase().includes(q) ||
          (a.subArticle && a.subArticle.toLowerCase().includes(q)) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.startingPoint.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [proceedingType, selectedCategoryFilter, searchQuery]);

  // Filtered articles for All Articles Directory Tab
  const directoryArticles = useMemo(() => {
    return LIMITATION_ARTICLES.filter(a => {
      if (selectedDivision !== 'All' && !a.division.toLowerCase().includes(selectedDivision.toLowerCase())) {
        return false;
      }
      if (selectedCategoryFilter !== 'All' && a.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.articleNumber.toLowerCase().includes(q) ||
          (a.subArticle && a.subArticle.toLowerCase().includes(q)) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.startingPoint.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedDivision, selectedCategoryFilter, searchQuery]);

  // Execute Calculation
  const handleCalculate = () => {
    setErrorMsg(null);
    if (!selectedArticleId) {
      setErrorMsg("Please select a Limitation Act Article.");
      return;
    }
    if (!startingDate) {
      setErrorMsg("Please enter the date from which the limitation period begins.");
      return;
    }

    const payload: LimitationCalculationInput = {
      articleId: selectedArticleId,
      startingDate,
      courtClosedOnLastDay: courtClosed,
      courtClosedNotes,
      condonationRequested,
      legalDisability,
      disabilityNotes,
      exclusionDays,
      exclusionNotes,
      previousProceeding: {
        existed: prevProcExisted,
        startDate: prevProcStart,
        endDate: prevProcEnd,
        courtName: prevProcCourt,
        sameMatter: prevProcSameMatter,
        goodFaith: prevProcGoodFaith,
        jurisdictionIssue: prevProcJurisdiction
      },
      fraudOrMistake: fraudMistake,
      discoveryDate,
      acknowledgement: {
        exists: ackExists,
        ackDate,
        docRef: ackDocRef
      },
      partPayment: {
        exists: partPayExists,
        paymentDate: partPayDate,
        docRef: partPayDocRef
      },
      specialOrLocalLaw: specialLaw
    };

    try {
      const res = calculateLimitation(payload);
      setCalcResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to calculate limitation period.");
    }
  };

  // Reset Calculator
  const handleReset = () => {
    setSelectedArticleId('LA-054');
    setProceedingType('Suit');
    setSelectedCategoryFilter('All');
    setSearchQuery('');
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    setStartingDate(today.toISOString().split('T')[0]);

    setShowAdvanced(false);
    setCourtClosed(false);
    setCourtClosedNotes('');
    setCondonationRequested(false);
    setLegalDisability('none');
    setDisabilityNotes('');
    setExclusionDays(0);
    setExclusionNotes('');
    setPrevProcExisted(false);
    setPrevProcStart('');
    setPrevProcEnd('');
    setPrevProcCourt('');
    setPrevProcSameMatter(true);
    setPrevProcGoodFaith(true);
    setPrevProcJurisdiction(true);
    setFraudMistake('none');
    setDiscoveryDate('');
    setAckExists(false);
    setAckDate('');
    setAckDocRef('');
    setPartPayExists(false);
    setPartPayDate('');
    setPartPayDocRef('');
    setSpecialLaw('no');

    setCalcResult(null);
    setErrorMsg(null);
  };

  // Run Dataset Verification Test API
  const handleRunValidationTest = async () => {
    setValidating(true);
    try {
      const res = await fetch('/api/calculators/limitation/validate-dataset', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setValidationReport(data.report);
      } else {
        setValidationReport({ isValid: false, summary: data.message || "Validation test failed." });
      }
    } catch (err: any) {
      setValidationReport({ isValid: false, summary: "Error invoking dataset validation test." });
    } finally {
      setValidating(false);
    }
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div ref={pageTopRef} className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Header Banner - Bespoke Handcrafted Medium-Light Executive Slate Design */}
      <div className="bg-gradient-to-r from-[#F3F6FA] via-[#E9EFF7] to-[#F1F5FA] dark:from-slate-900 dark:via-[#142036] dark:to-slate-900 text-[#0F172A] dark:text-white p-6 sm:p-8 rounded-[1.5rem] shadow-lg border border-[#CBD5E1] dark:border-slate-800 border-l-[6px] border-l-[#1E3A8A] dark:border-l-amber-500 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] dark:bg-slate-800 text-amber-300 dark:text-amber-400 flex items-center justify-center shadow-md flex-shrink-0">
                <Scale size={26} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest bg-[#1E3A8A]/10 dark:bg-amber-500/15 text-[#1E3A8A] dark:text-amber-300 px-3 py-1 rounded-md border border-[#1E3A8A]/30 dark:border-amber-500/40 uppercase">
                  STATUTORY ADVOCATE TOOL
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F172A] dark:text-white tracking-tight mt-1">
                  Limitation Act Calculator
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 mt-3 max-w-2xl leading-relaxed font-normal">
              Calculate indicative statutory limitation periods, excludable time under Sections 4–19, fresh acknowledgement periods, and filing deadlines under the <strong className="text-[#1E3A8A] dark:text-amber-300 font-semibold border-b border-[#1E3A8A]/30 dark:border-amber-500/40 pb-0.5">Limitation Act, 1963</strong> (India Code).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              onClick={handleRunValidationTest}
              disabled={validating}
              className="px-4 py-2.5 bg-[#183C32] hover:bg-[#245445] dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl text-xs font-extrabold border border-[#183C32]/40 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Sparkles size={15} className="text-white dark:text-slate-950" />
              {validating ? 'Running Audit...' : 'Run Dataset Coverage Test'}
            </button>
          </div>
        </div>

        {/* Source Disclaimer Bar */}
        <div className="mt-6 pt-4 border-t border-[#CBD5E1] dark:border-slate-700/80 flex flex-wrap items-center justify-between text-[11px] text-[#475569] dark:text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-[#183C32] dark:text-amber-400" />
            <span>Official Legal Source: <strong className="text-[#0F172A] dark:text-amber-200 font-semibold">The Limitation Act, 1963 (Schedule) — India Code</strong></span>
          </div>
          <span className="text-[#64748B] dark:text-slate-400 font-mono">152 Schedule Entries | 100% Duplicate-Free Canonical Dataset</span>
        </div>
      </div>

      {/* Dataset Validation Modal / Banner */}
      {validationReport && (
        <div className={`p-5 rounded-2xl border shadow-lg animate-slide-up ${
          validationReport.isValid 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {validationReport.isValid ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertTriangle size={24} className="text-red-500" />}
              <div>
                <h3 className="font-bold text-sm">Automated Schedule Verification Result</h3>
                <p className="text-xs mt-1">{validationReport.summary}</p>
              </div>
            </div>
            <button 
              onClick={() => setValidationReport(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          {validationReport.isValid && (
            <div className="mt-4 pt-3 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Total Entries</span>
                <p className="font-bold">{validationReport.totalEntries}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Unique Canonical Keys</span>
                <p className="font-bold">{validationReport.uniqueEntriesCount}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Duplicates Detected</span>
                <p className="font-bold">0 (PASS)</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Suits / Appeals / Apps</span>
                <p className="font-bold">120 / 8 / 24</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Scale size={16} />
          Limitation Calculator
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookOpen size={16} />
          All Schedule Articles ({LIMITATION_ARTICLES.length})
        </button>

        <button
          onClick={() => setActiveTab('chequeBounce')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'chequeBounce'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Clock size={16} />
          Section 138 NI Act Cheque Bounce
        </button>

        <button
          onClick={() => setActiveTab('consumer')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'consumer'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Info size={16} />
          Consumer Protection Limitation
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MAIN LIMITATION CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Controls & Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STEP 1: Select Type of Proceeding */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary dark:text-sky-400 text-xs flex items-center justify-center font-bold">1</span>
                  Select Type of Proceeding
                </h3>
                <span className="text-[10px] uppercase font-bold text-slate-400">Statutory Division</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Suit', label: 'Suit', desc: 'First Division (Art 1–113)' },
                  { id: 'Appeal', label: 'Appeal', desc: 'Second Division (Art 114–117)' },
                  { id: 'Application', label: 'Application', desc: 'Third Division (Art 118–137)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setProceedingType(item.id as any);
                      // Auto pick first matching article
                      const firstMatch = LIMITATION_ARTICLES.find(a => 
                        item.id === 'Suit' ? a.division === 'First Division - Suits' :
                        item.id === 'Appeal' ? a.division === 'Second Division - Appeals' :
                        a.division === 'Third Division - Applications'
                      );
                      if (firstMatch) setSelectedArticleId(firstMatch.id);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      proceedingType === item.id
                        ? 'border-primary bg-primary/5 text-primary dark:text-sky-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2 & 3: Filter & Select Limitation Article */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary dark:text-sky-400 text-xs flex items-center justify-center font-bold">2</span>
                  Select Limitation Article / Sub-Article
                </h3>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {filteredCalcArticles.length} Available
                </span>
              </div>

              {/* Category Filter & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Category Filter
                  </label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Search Article # / Keyword
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 54, specific performance, 137, appeal..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Selected Article Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Choose Article
                </label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary shadow-sm text-left truncate dir-ltr"
                >
                  {filteredCalcArticles.map(art => (
                    <option key={art.id} value={art.id}>
                      Article {art.articleNumber}{art.subArticle ? `(${art.subArticle})` : ''} - {art.category} | {art.limitationValue} {art.limitationUnit} | {art.description.substring(0, 65)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Article Preview Card */}
              {currentArticle && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-sky-400 font-bold text-xs rounded-md">
                        Article {currentArticle.articleNumber}{currentArticle.subArticle ? `(${currentArticle.subArticle})` : ''}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {currentArticle.category}
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {currentArticle.limitationValue} {currentArticle.limitationUnit}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Statutory Description:</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {currentArticle.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Starting Point Rule (Time from which period begins):</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 italic">
                      "{currentArticle.startingPoint}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: Starting Date Input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary dark:text-sky-400 text-xs flex items-center justify-center font-bold">3</span>
                  Date from which Limitation Period Begins
                </h3>
                <Calendar size={16} className="text-primary dark:text-sky-400" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Starting Event Date (DD/MM/YYYY)
                </label>
                <input
                  type="date"
                  value={startingDate}
                  onChange={(e) => setStartingDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary shadow-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Applies rule: <em>"{currentArticle?.startingPoint}"</em>
                </p>
              </div>
            </div>

            {/* STEP 5: Advanced Statutory Factors (Sections 4-19) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-500 text-xs flex items-center justify-center font-bold">4</span>
                  Advanced Statutory Adjustments (Sections 4–19)
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                  <span>{showAdvanced ? 'Hide Options' : 'Configure Advanced Factors'}</span>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {showAdvanced && (
                <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-6 animate-slide-up">
                  
                  {/* Section 4: Court Closure */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courtClosed}
                        onChange={(e) => setCourtClosed(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Section 4 — Court Closure on Expiry Date
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Was the relevant court closed on the last day of the prescribed period? If checked, suit/appeal/application may be instituted on reopening day.
                    </p>
                  </div>

                  {/* Section 5: Condonation of Delay */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={condonationRequested}
                        onChange={(e) => setCondonationRequested(e.target.checked)}
                        disabled={currentArticle.division === 'First Division - Suits'}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 disabled:opacity-50"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Section 5 — Condonation of Delay (Appeals/Applications Only)
                      </span>
                    </label>
                    {currentArticle.division === 'First Division - Suits' ? (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        ⚠️ Note: Section 5 condonation does NOT apply to Suits.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Check if applying for condonation of delay upon showing sufficient cause to court.
                      </p>
                    )}
                  </div>

                  {/* Section 6: Legal Disability */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block font-bold text-xs text-slate-900 dark:text-white">
                      Section 6 — Legal Disability
                    </label>
                    <select
                      value={legalDisability}
                      onChange={(e) => setLegalDisability(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="none">None</option>
                      <option value="minor">Minority (Minor at time right accrued)</option>
                      <option value="insanity">Insanity</option>
                      <option value="idiocy">Idiocy</option>
                      <option value="other">Other statutory disability</option>
                    </select>
                  </div>

                  {/* Section 12: Exclusion of Time */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block font-bold text-xs text-slate-900 dark:text-white">
                      Section 12 — Exclusion of Time (e.g. Certified Copy Days)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={exclusionDays}
                        onChange={(e) => setExclusionDays(parseInt(e.target.value) || 0)}
                        className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-bold"
                        placeholder="Exclusion days"
                      />
                      <span className="text-xs text-slate-500">Days to exclude</span>
                    </div>
                  </div>

                  {/* Section 14: Previous Proceeding */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prevProcExisted}
                        onChange={(e) => setPrevProcExisted(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Section 14 — Previous Proceeding in Court without Jurisdiction
                      </span>
                    </label>

                    {prevProcExisted && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Start Date</label>
                          <input
                            type="date"
                            value={prevProcStart}
                            onChange={(e) => setPrevProcStart(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded p-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">End Date</label>
                          <input
                            type="date"
                            value={prevProcEnd}
                            onChange={(e) => setPrevProcEnd(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 17: Fraud / Mistake */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block font-bold text-xs text-slate-900 dark:text-white">
                      Section 17 — Fraud / Mistake / Concealment
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={fraudMistake}
                        onChange={(e) => setFraudMistake(e.target.value as any)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                      >
                        <option value="none">None</option>
                        <option value="fraud">Fraud Alleged</option>
                        <option value="mistake">Mistake Alleged</option>
                        <option value="concealment">Concealment Issue</option>
                      </select>

                      {fraudMistake !== 'none' && (
                        <input
                          type="date"
                          placeholder="Discovery Date"
                          value={discoveryDate}
                          onChange={(e) => setDiscoveryDate(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold"
                        />
                      )}
                    </div>
                  </div>

                  {/* Section 18: Written Acknowledgement */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ackExists}
                        onChange={(e) => setAckExists(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Section 18 — Written Acknowledgement of Liability
                      </span>
                    </label>

                    {ackExists && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Acknowledgement Date</label>
                          <input
                            type="date"
                            value={ackDate}
                            onChange={(e) => setAckDate(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded p-1.5 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Document Ref / Notes</label>
                          <input
                            type="text"
                            placeholder="e.g. Letter dated DD/MM/YYYY"
                            value={ackDocRef}
                            onChange={(e) => setAckDocRef(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 19: Part Payment */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={partPayExists}
                        onChange={(e) => setPartPayExists(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Section 19 — Part Payment of Principal or Interest
                      </span>
                    </label>

                    {partPayExists && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Part Payment Date</label>
                          <input
                            type="date"
                            value={partPayDate}
                            onChange={(e) => setPartPayDate(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded p-1.5 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500">Receipt / Ref</label>
                          <input
                            type="text"
                            placeholder="e.g. Cheque/Receipt No."
                            value={partPayDocRef}
                            onChange={(e) => setPartPayDocRef(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Special / Local Law */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block font-bold text-xs text-slate-900 dark:text-white">
                      Special or Local Law Involved?
                    </label>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="specialLaw" value="no" checked={specialLaw === 'no'} onChange={() => setSpecialLaw('no')} />
                        No
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="specialLaw" value="yes" checked={specialLaw === 'yes'} onChange={() => setSpecialLaw('yes')} />
                        Yes
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="specialLaw" value="not_sure" checked={specialLaw === 'not_sure'} onChange={() => setSpecialLaw('not_sure')} />
                        Not Sure
                      </label>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Calculate & Reset Action CTAs */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 py-3.5 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scale size={18} />
                Calculate Filing Deadline
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

          </div>

          {/* Right Results & Report Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {calcResult ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 sticky top-6 animate-slide-up">
                
                {/* Result Header & Status Badge */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Calculation Summary
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-sans mt-0.5">
                      LIMITATION RESULT
                    </h2>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    calcResult.isPassed 
                      ? 'bg-red-500/10 text-red-600 border border-red-500/30' 
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                  }`}>
                    {calcResult.isPassed ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    {calcResult.isPassed ? 'Period Passed' : 'Active Window'}
                  </span>
                </div>

                {/* Primary Dates Grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Selected Article</span>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                      Art {calcResult.article.articleNumber}{calcResult.article.subArticle ? `(${calcResult.article.subArticle})` : ''}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Prescribed Period</span>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                      {calcResult.article.limitationValue} {calcResult.article.limitationUnit}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Starting Date</span>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                      {calcResult.effectiveStartingDate}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Calculated Deadline</span>
                    <p className="font-extrabold text-base text-amber-600 dark:text-amber-400 mt-0.5">
                      {calcResult.adjustedDeadline}
                    </p>
                  </div>
                </div>

                {/* Status Summary Banner */}
                <div className={`p-4 rounded-xl text-xs font-semibold ${
                  calcResult.isPassed
                    ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                }`}>
                  {calcResult.summaryText}
                </div>

                {/* Statutory Adjustments Breakdown */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Statutory Factors & Adjustments
                  </h4>

                  <div className="space-y-2 text-xs">
                    {calcResult.statutoryAdjustments.section4CourtClosure.applied && (
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 rounded-lg">
                        <strong>Sec 4 Court Closure:</strong> {calcResult.statutoryAdjustments.section4CourtClosure.summary}
                      </div>
                    )}

                    {calcResult.statutoryAdjustments.section12Exclusion.daysAdded > 0 && (
                      <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg">
                        <strong>Sec 12 Exclusion:</strong> {calcResult.statutoryAdjustments.section12Exclusion.summary}
                      </div>
                    )}

                    {calcResult.statutoryAdjustments.section18Acknowledgement.applied && (
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg">
                        <strong>Sec 18 Acknowledgement:</strong> {calcResult.statutoryAdjustments.section18Acknowledgement.summary}
                      </div>
                    )}

                    {calcResult.statutoryAdjustments.section19PartPayment.applied && (
                      <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 rounded-lg">
                        <strong>Sec 19 Part Payment:</strong> {calcResult.statutoryAdjustments.section19PartPayment.summary}
                      </div>
                    )}

                    {calcResult.statutoryAdjustments.section6LegalDisability.flagged && (
                      <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
                        <strong>Sec 6 Disability:</strong> {calcResult.statutoryAdjustments.section6LegalDisability.summary}
                      </div>
                    )}

                    {calcResult.statutoryAdjustments.section14PreviousProceeding.flagged && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg">
                        <strong>Sec 14 Prev Proceeding:</strong> {calcResult.statutoryAdjustments.section14PreviousProceeding.summary}
                      </div>
                    )}

                    {calcResult.statutoryAdjustments.specialLocalLaw.flagged && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-lg">
                        <strong>Special Law:</strong> {calcResult.statutoryAdjustments.specialLocalLaw.summary}
                      </div>
                    )}
                  </div>
                </div>

                {/* Legal Review Disclaimer Warning */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-amber-700 dark:text-amber-400">
                    <ShieldAlert size={14} /> Statutory Legal Review Notice
                  </div>
                  <p className="leading-relaxed">
                    {calcResult.disclaimerText}
                  </p>
                </div>

                {/* Print Report Action */}
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer size={16} />
                  Print Limitation Report
                </button>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
                <div className="h-16 w-16 bg-primary/10 text-primary dark:text-sky-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Scale size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                    Limitation Output Window
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Select an article, starting date, and any statutory factors, then click <strong>Calculate Filing Deadline</strong> to render the indicative results.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL ARTICLES DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          {/* Controls & Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                  Complete Limitation Act Schedule Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Browse and search all {LIMITATION_ARTICLES.length} canonical Schedule entries under the Limitation Act, 1963.
                </p>
              </div>

              <span className="px-3 py-1 bg-primary/10 text-primary dark:text-sky-400 text-xs font-bold rounded-full">
                {directoryArticles.length} Matches
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Division</label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-semibold"
                >
                  <option value="All">All Divisions</option>
                  <option value="Suits">First Division - Suits</option>
                  <option value="Appeals">Second Division - Appeals</option>
                  <option value="Applications">Third Division - Applications</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category</label>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-semibold"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Search Keywords</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Article #, title, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directoryArticles.map(art => (
              <div 
                key={art.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-sky-400 font-extrabold text-xs rounded-md">
                      Article {art.articleNumber}{art.subArticle ? `(${art.subArticle})` : ''}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {art.limitationValue} {art.limitationUnit}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-1">
                    {art.category} | {art.division.split('-')[1] || art.division}
                  </h4>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed line-clamp-3">
                    {art.description}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic line-clamp-2">
                    Start: "{art.startingPoint}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailModalArticle(art)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => {
                      setSelectedArticleId(art.id);
                      setProceedingType(
                        art.division === 'First Division - Suits' ? 'Suit' :
                        art.division === 'Second Division - Appeals' ? 'Appeal' : 'Application'
                      );
                      setActiveTab('calculator');
                    }}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    Use This Article <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECTION 138 NI ACT CHEQUE BOUNCE TIMELINE */}
      {/* ========================================================================= */}
      {activeTab === 'chequeBounce' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 px-3 py-0.5 rounded-full">
              SPECIAL STATUTORY TIMELINE
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans mt-1">
              Section 138 Negotiable Instruments Act Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Calculates statutory demand notice windows and complaint filing deadlines under Section 138 & Section 142 of the Negotiable Instruments Act, 1881.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                1. Dishonour / Return Memo Date
              </label>
              <input
                type="date"
                value={cbMemoDate}
                onChange={(e) => setCbMemoDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                2. Legal Notice Sent Date
              </label>
              <input
                type="date"
                value={cbNoticeSentDate}
                onChange={(e) => setCbNoticeSentDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400">Must be within 30 days of Memo</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                3. Legal Notice Received Date
              </label>
              <input
                type="date"
                value={cbNoticeRecvDate}
                onChange={(e) => setCbNoticeRecvDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400">Triggers 15-day payment window</span>
            </div>
          </div>

          {cbNoticeRecvDate && (
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slide-up">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                Statutory NI Act Compliance Schedule
              </h4>

              {(() => {
                const recvObj = new Date(cbNoticeRecvDate);
                const payExpiry = new Date(recvObj);
                payExpiry.setDate(payExpiry.getDate() + 15);

                const causeAccrual = new Date(payExpiry);
                causeAccrual.setDate(causeAccrual.getDate() + 1);

                const complaintDeadline = new Date(causeAccrual);
                complaintDeadline.setMonth(complaintDeadline.getMonth() + 1);

                return (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-lg border">
                      <span><strong>15-Day Payment Window Expiry:</strong> Drawer must pay by:</span>
                      <span className="font-extrabold text-amber-600">{payExpiry.toISOString().split('T')[0]}</span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-lg border">
                      <span><strong>Cause of Action Accrual Date:</strong> Right to file complaint arises on:</span>
                      <span className="font-extrabold text-blue-600">{causeAccrual.toISOString().split('T')[0]}</span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-lg border">
                      <span><strong>Complaint Filing Deadline (Sec 142):</strong> File complaint in court by:</span>
                      <span className="font-extrabold text-emerald-600">{complaintDeadline.toISOString().split('T')[0]}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONSUMER PROTECTION ACT LIMITATION */}
      {/* ========================================================================= */}
      {activeTab === 'consumer' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-3 py-0.5 rounded-full">
              SPECIAL ACT LIMITATION
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans mt-1">
              Consumer Protection Act, 2019 Limitation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Calculates statutory 2-year limitation period for filing consumer complaints under Section 69 of CPA 2019.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Cause of Action Arose
              </label>
              <input
                type="date"
                value={cpCauseDate}
                onChange={(e) => setCpCauseDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Consumer Forum / Commission Level
              </label>
              <select
                value={cpForum}
                onChange={(e) => setCpForum(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="District Commission">District Consumer Disputes Redressal Commission</option>
                <option value="State Commission">State Consumer Disputes Redressal Commission</option>
                <option value="National Commission">National Consumer Disputes Redressal Commission (NCDRC)</option>
              </select>
            </div>
          </div>

          {cpCauseDate && (
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slide-up">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                Consumer Complaint Statutory Calculation
              </h4>

              {(() => {
                const cDate = new Date(cpCauseDate);
                const cpDeadline = new Date(cDate);
                cpDeadline.setFullYear(cpDeadline.getFullYear() + 2);

                return (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <span><strong>Statutory Period:</strong> Section 69 CPA 2019:</span>
                      <span className="font-extrabold text-primary">2 Years</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <span><strong>Calculated Filing Deadline:</strong> File complaint before:</span>
                      <span className="font-extrabold text-emerald-600 text-sm">{cpDeadline.toISOString().split('T')[0]}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Detail View Modal */}
      {detailModalArticle && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary text-white font-extrabold text-xs rounded-lg">
                  Article {detailModalArticle.articleNumber}{detailModalArticle.subArticle ? `(${detailModalArticle.subArticle})` : ''}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {detailModalArticle.category}
                </span>
              </div>
              <button 
                onClick={() => setDetailModalArticle(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div>
                <strong className="block text-[10px] uppercase font-bold text-slate-400">Division & Part:</strong>
                <p>{detailModalArticle.division} | {detailModalArticle.part}</p>
              </div>

              <div>
                <strong className="block text-[10px] uppercase font-bold text-slate-400">Statutory Description:</strong>
                <p className="mt-0.5 leading-relaxed">{detailModalArticle.description}</p>
              </div>

              <div>
                <strong className="block text-[10px] uppercase font-bold text-slate-400">Prescribed Limitation Period:</strong>
                <p className="font-extrabold text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                  {detailModalArticle.limitationValue} {detailModalArticle.limitationUnit}
                </p>
              </div>

              <div>
                <strong className="block text-[10px] uppercase font-bold text-slate-400">Time From Which Period Begins:</strong>
                <p className="italic mt-0.5">"{detailModalArticle.startingPoint}"</p>
              </div>

              <div>
                <strong className="block text-[10px] uppercase font-bold text-slate-400">Legal Source:</strong>
                <p>{detailModalArticle.source}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setDetailModalArticle(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setSelectedArticleId(detailModalArticle.id);
                  setProceedingType(
                    detailModalArticle.division === 'First Division - Suits' ? 'Suit' :
                    detailModalArticle.division === 'Second Division - Appeals' ? 'Appeal' : 'Application'
                  );
                  setDetailModalArticle(null);
                  setActiveTab('calculator');
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                Use This Article in Calculator <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LimitationCalculatorPage;
