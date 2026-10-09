import React, { useState } from 'react';
import { 
  Scale, Users, Calculator, AlertTriangle, FileText, RotateCcw, Info, CheckCircle2, ShieldAlert, DollarSign, Calendar, BookOpen, Layers
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { calculateHinduSuccession } from '../utils/hinduSuccessionEngine';
import type { 
  HinduSuccessionCaseInput, 
  HinduSuccessionCalculationResult,
  PreDeceasedSonBranch,
  PreDeceasedDaughterBranch,
  PreDeceasedChildBranchFemale
} from '../utils/hinduSuccessionEngine';

export const HinduSuccessionCalculator: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();

  // Basic Case Form State
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [dateOfDeath, setDateOfDeath] = useState<string>('');
  const [successionType, setSuccessionType] = useState<'intestate' | 'coparcenary'>('intestate');
  const [propertyType, setPropertyType] = useState<string>('self_acquired');
  const [estimatedPropertyValue, setEstimatedPropertyValue] = useState<string>('');

  // Male Deceased Inputs
  const [widowsCount, setWidowsCount] = useState<number>(1);
  const [motherAlive, setMotherAlive] = useState<boolean>(true);
  const [survivingSonsCount, setSurvivingSonsCount] = useState<number>(1);
  const [survivingDaughtersCount, setSurvivingDaughtersCount] = useState<number>(1);
  
  // Male Pre-deceased Branches
  const [preDeceasedSonsCount, setPreDeceasedSonsCount] = useState<number>(0);
  const [preDeceasedSonsBranches, setPreDeceasedSonsBranches] = useState<PreDeceasedSonBranch[]>([]);
  
  const [preDeceasedDaughtersCount, setPreDeceasedDaughtersCount] = useState<number>(0);
  const [preDeceasedDaughtersBranches, setPreDeceasedDaughtersBranches] = useState<PreDeceasedDaughterBranch[]>([]);

  // Female Deceased Inputs
  const [husbandAlive, setHusbandAlive] = useState<boolean>(true);
  const [femaleSonsCount, setFemaleSonsCount] = useState<number>(1);
  const [femaleDaughtersCount, setFemaleDaughtersCount] = useState<number>(1);
  const [femalePreDeceasedChildrenCount, setFemalePreDeceasedChildrenCount] = useState<number>(0);
  const [femalePreDeceasedChildrenBranches, setFemalePreDeceasedChildrenBranches] = useState<PreDeceasedChildBranchFemale[]>([]);
  const [femalePropertySource, setFemalePropertySource] = useState<string>('self_acquired');

  // Coparcenary Inputs
  const [coparcenarySonsCount, setCoparcenarySonsCount] = useState<number>(1);
  const [coparcenaryDaughtersCount, setCoparcenaryDaughtersCount] = useState<number>(1);
  const [otherCoparcenersCount, setOtherCoparcenersCount] = useState<number>(0);
  const [priorPartition, setPriorPartition] = useState<boolean>(false);
  const [priorPartitionDate, setPriorPartitionDate] = useState<string>('');
  const [priorPartitionRegistered, setPriorPartitionRegistered] = useState<boolean>(false);

  // Additional Legal Flags
  const [hasWillOrTestament, setHasWillOrTestament] = useState<boolean>(false);
  const [disputedHeirship, setDisputedHeirship] = useState<boolean>(false);

  // Result State & UI Status
  const [result, setResult] = useState<HinduSuccessionCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Dynamic Branch Updates for Male Pre-deceased Sons
  const handlePreDeceasedSonsCountChange = (count: number) => {
    const val = Math.max(0, count);
    setPreDeceasedSonsCount(val);
    const newBranches: PreDeceasedSonBranch[] = [];
    for (let i = 0; i < val; i++) {
      newBranches.push(preDeceasedSonsBranches[i] || {
        id: `pd_son_branch_${i + 1}`,
        widowAlive: false,
        survivingSonsCount: 1,
        survivingDaughtersCount: 0
      });
    }
    setPreDeceasedSonsBranches(newBranches);
  };

  const updatePreDeceasedSonBranch = (index: number, updates: Partial<PreDeceasedSonBranch>) => {
    const updated = [...preDeceasedSonsBranches];
    updated[index] = { ...updated[index], ...updates };
    setPreDeceasedSonsBranches(updated);
  };

  // Handle Dynamic Branch Updates for Male Pre-deceased Daughters
  const handlePreDeceasedDaughtersCountChange = (count: number) => {
    const val = Math.max(0, count);
    setPreDeceasedDaughtersCount(val);
    const newBranches: PreDeceasedDaughterBranch[] = [];
    for (let i = 0; i < val; i++) {
      newBranches.push(preDeceasedDaughtersBranches[i] || {
        id: `pd_daughter_branch_${i + 1}`,
        survivingSonsCount: 1,
        survivingDaughtersCount: 0
      });
    }
    setPreDeceasedDaughtersBranches(newBranches);
  };

  const updatePreDeceasedDaughterBranch = (index: number, updates: Partial<PreDeceasedDaughterBranch>) => {
    const updated = [...preDeceasedDaughtersBranches];
    updated[index] = { ...updated[index], ...updates };
    setPreDeceasedDaughtersBranches(updated);
  };

  // Handle Dynamic Branch Updates for Female Pre-deceased Children
  const handleFemalePreDeceasedChildrenCountChange = (count: number) => {
    const val = Math.max(0, count);
    setFemalePreDeceasedChildrenCount(val);
    const newBranches: PreDeceasedChildBranchFemale[] = [];
    for (let i = 0; i < val; i++) {
      newBranches.push(femalePreDeceasedChildrenBranches[i] || {
        id: `female_pd_child_branch_${i + 1}`,
        survivingSonsCount: 1,
        survivingDaughtersCount: 0
      });
    }
    setFemalePreDeceasedChildrenBranches(newBranches);
  };

  const updateFemalePreDeceasedChildBranch = (index: number, updates: Partial<PreDeceasedChildBranchFemale>) => {
    const updated = [...femalePreDeceasedChildrenBranches];
    updated[index] = { ...updated[index], ...updates };
    setFemalePreDeceasedChildrenBranches(updated);
  };

  // Reset Form Action
  const handleReset = () => {
    setDeceasedGender('male');
    setDateOfDeath('');
    setSuccessionType('intestate');
    setPropertyType('self_acquired');
    setEstimatedPropertyValue('');
    setWidowsCount(1);
    setMotherAlive(true);
    setSurvivingSonsCount(1);
    setSurvivingDaughtersCount(1);
    setPreDeceasedSonsCount(0);
    setPreDeceasedSonsBranches([]);
    setPreDeceasedDaughtersCount(0);
    setPreDeceasedDaughtersBranches([]);
    setHusbandAlive(true);
    setFemaleSonsCount(1);
    setFemaleDaughtersCount(1);
    setFemalePreDeceasedChildrenCount(0);
    setFemalePreDeceasedChildrenBranches([]);
    setFemalePropertySource('self_acquired');
    setCoparcenarySonsCount(1);
    setCoparcenaryDaughtersCount(1);
    setOtherCoparcenersCount(0);
    setPriorPartition(false);
    setPriorPartitionDate('');
    setPriorPartitionRegistered(false);
    setHasWillOrTestament(false);
    setDisputedHeirship(false);
    setResult(null);
    setErrorMessage(null);
    addNotification('Form Reset', 'Calculations and input parameters have been cleared.', 'info');
  };

  // Execute Calculation (Calls Protected Backend API with fallback to Client Engine)
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsCalculating(true);

    const numericPropVal = estimatedPropertyValue ? parseFloat(estimatedPropertyValue) : undefined;

    const payload: HinduSuccessionCaseInput = {
      deceasedGender,
      dateOfDeath: dateOfDeath || undefined,
      successionType,
      propertyType: propertyType as any,
      estimatedPropertyValue: numericPropVal,
      widowsCount: deceasedGender === 'male' ? widowsCount : undefined,
      motherAlive: deceasedGender === 'male' ? motherAlive : undefined,
      survivingSonsCount: deceasedGender === 'male' ? survivingSonsCount : undefined,
      survivingDaughtersCount: deceasedGender === 'male' ? survivingDaughtersCount : undefined,
      preDeceasedSonsCount: deceasedGender === 'male' ? preDeceasedSonsCount : undefined,
      preDeceasedSonsBranches: deceasedGender === 'male' ? preDeceasedSonsBranches : undefined,
      preDeceasedDaughtersCount: deceasedGender === 'male' ? preDeceasedDaughtersCount : undefined,
      preDeceasedDaughtersBranches: deceasedGender === 'male' ? preDeceasedDaughtersBranches : undefined,
      husbandAlive: deceasedGender === 'female' ? husbandAlive : undefined,
      femaleSonsCount: deceasedGender === 'female' ? femaleSonsCount : undefined,
      femaleDaughtersCount: deceasedGender === 'female' ? femaleDaughtersCount : undefined,
      femalePreDeceasedChildrenCount: deceasedGender === 'female' ? femalePreDeceasedChildrenCount : undefined,
      femalePreDeceasedChildrenBranches: deceasedGender === 'female' ? femalePreDeceasedChildrenBranches : undefined,
      femalePropertySource: deceasedGender === 'female' ? (femalePropertySource as any) : undefined,
      coparcenarySonsCount: successionType === 'coparcenary' ? coparcenarySonsCount : undefined,
      coparcenaryDaughtersCount: successionType === 'coparcenary' ? coparcenaryDaughtersCount : undefined,
      otherCoparcenersCount: successionType === 'coparcenary' ? otherCoparcenersCount : undefined,
      priorPartition: successionType === 'coparcenary' ? priorPartition : undefined,
      priorPartitionDate: successionType === 'coparcenary' ? priorPartitionDate : undefined,
      priorPartitionRegistered: successionType === 'coparcenary' ? priorPartitionRegistered : undefined,
      hasWillOrTestament,
      disputedHeirship
    };

    try {
      // Try Protected Server API first
      const response = await fetch('/api/calculators/hindu-succession/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 403 || response.status === 401) {
        setErrorMessage('Access Denied. You must be an enrolled Advocate or Administrator to use this calculator.');
        setIsCalculating(false);
        return;
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setResult(resData.data);
      } else {
        // Fallback to client engine if API format differs or server error
        const calcRes = calculateHinduSuccession(payload);
        if (calcRes.errorMessage) {
          setErrorMessage(calcRes.errorMessage);
        }
        setResult(calcRes);
      }
    } catch (err: any) {
      console.warn('⚠️ Server API offline or unreachable, executing local calculation engine:', err.message);
      const calcRes = calculateHinduSuccession(payload);
      if (calcRes.errorMessage) {
        setErrorMessage(calcRes.errorMessage);
      }
      setResult(calcRes);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Header - Bespoke Handcrafted Heritage Design */}
      <div className="bg-gradient-to-r from-[#1b0b14] via-[#2a121e] to-[#170912] text-white p-6 md:p-8 rounded-[1.75rem] shadow-2xl border border-amber-900/40 border-l-[6px] border-l-amber-500 ring-1 ring-white/10 relative overflow-hidden">
        {/* Subtle geometric line pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold text-[11px] uppercase tracking-widest">
            <Scale size={15} className="text-amber-400" />
            <span>Elite Legal Desk — Personal Law Module</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-amber-50 font-serif mb-2">
            Hindu Succession Calculator
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
            Calculate indicative succession shares based on entered family and property details under the applicable statutory provisions of the <strong className="text-amber-300 font-semibold border-b border-amber-500/40 pb-0.5">Hindu Succession Act, 1956</strong> (including the 2005 Amendment Act and authoritative Supreme Court precedents).
          </p>
        </div>
      </div>

      {/* Mandatory Statutory & Legal Disclaimer */}
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 md:p-5 rounded-r-xl dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed flex items-start gap-3 shadow-sm">
        <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <strong className="font-bold text-amber-900 dark:text-amber-400 block mb-0.5">Professional Legal Assistance Notice:</strong>
          This calculator is an informational legal-assistance tool intended for Advocates and Legal Administrators. It does not replace legal advice, formal title verification, or judicial court determinations. Actual succession rights depend upon verified facts, original testamentary documents, personal custom, prior registered partitions, and judicial precedents.
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <form onSubmit={handleCalculate} className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: DECEASED PERSON & GENERAL PARAMETERS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-primary dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users size={18} className="text-amber-500" />
              <span>Section 1 — Deceased Person Details</span>
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
                        ? 'bg-primary text-amber-400 border-primary shadow-md'
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
                        ? 'bg-primary text-amber-400 border-primary shadow-md'
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
                <div className="relative">
                  <input
                    type="date"
                    value={dateOfDeath}
                    onChange={(e) => setDateOfDeath(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Determines applicability of 2005 Amendment (9 Sept 2005)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Succession Category *
                </label>
                <select
                  value={successionType}
                  onChange={(e) => setSuccessionType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="intestate">Intestate Succession (General Estate)</option>
                  <option value="coparcenary">Coparcenary / Joint Family Share Calculation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Property Classification *
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="self_acquired">Self-Acquired Property</option>
                  <option value="ancestral_coparcenary">Ancestral / Coparcenary Joint Property</option>
                  <option value="inherited_father">Inherited from Father</option>
                  <option value="inherited_mother">Inherited from Mother</option>
                  <option value="inherited_husband_father_in_law">Inherited from Husband / Father-in-Law</option>
                  <option value="other">Other / Requires Legal Review</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Estimated Property Value (₹) — Optional
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5000000"
                  value={estimatedPropertyValue}
                  onChange={(e) => setEstimatedPropertyValue(e.target.value)}
                  className="w-full pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                If provided, calculates indicative Rupee value alongside fractional & percentage shares.
              </span>
            </div>
          </div>

          {/* SECTION 2: MALE DECEASED HEIR DETAILS */}
          {deceasedGender === 'male' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
              <h2 className="text-base font-bold text-primary dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Layers size={18} className="text-amber-500" />
                <span>Section 2 — Class I Heirs (Male Deceased)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Surviving Widow(s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={widowsCount}
                    onChange={(e) => setWidowsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Mother Status
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="motherAlive"
                      checked={motherAlive}
                      onChange={(e) => setMotherAlive(e.target.checked)}
                      className="h-4 w-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <label htmlFor="motherAlive" className="text-sm text-slate-700 dark:text-slate-300">
                      Mother is Alive
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Surviving Sons
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={survivingSonsCount}
                    onChange={(e) => setSurvivingSonsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Surviving Daughters
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={survivingDaughtersCount}
                    onChange={(e) => setSurvivingDaughtersCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Pre-deceased Sons
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={preDeceasedSonsCount}
                    onChange={(e) => handlePreDeceasedSonsCountChange(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Pre-deceased Daughters
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={preDeceasedDaughtersCount}
                    onChange={(e) => handlePreDeceasedDaughtersCountChange(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Pre-deceased Son Branches */}
              {preDeceasedSonsCount > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Pre-deceased Son Branch Details (Per Stirpes Division)
                  </h3>
                  {preDeceasedSonsBranches.map((branch, idx) => (
                    <div key={branch.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Pre-deceased Son {idx + 1} Branch
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id={`pd_son_widow_${idx}`}
                            checked={branch.widowAlive}
                            onChange={(e) => updatePreDeceasedSonBranch(idx, { widowAlive: e.target.checked })}
                            className="h-4 w-4 text-amber-600 rounded border-slate-300"
                          />
                          <label htmlFor={`pd_son_widow_${idx}`} className="text-xs text-slate-700 dark:text-slate-300">
                            His Widow Alive
                          </label>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Surviving Sons</label>
                          <input
                            type="number"
                            min="0"
                            value={branch.survivingSonsCount}
                            onChange={(e) => updatePreDeceasedSonBranch(idx, { survivingSonsCount: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-1 px-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Surviving Daughters</label>
                          <input
                            type="number"
                            min="0"
                            value={branch.survivingDaughtersCount}
                            onChange={(e) => updatePreDeceasedSonBranch(idx, { survivingDaughtersCount: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-1 px-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Pre-deceased Daughter Branches */}
              {preDeceasedDaughtersCount > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Pre-deceased Daughter Branch Details (Per Stirpes Division)
                  </h3>
                  {preDeceasedDaughtersBranches.map((branch, idx) => (
                    <div key={branch.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Pre-deceased Daughter {idx + 1} Branch
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Surviving Sons</label>
                          <input
                            type="number"
                            min="0"
                            value={branch.survivingSonsCount}
                            onChange={(e) => updatePreDeceasedDaughterBranch(idx, { survivingSonsCount: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-1 px-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Surviving Daughters</label>
                          <input
                            type="number"
                            min="0"
                            value={branch.survivingDaughtersCount}
                            onChange={(e) => updatePreDeceasedDaughterBranch(idx, { survivingDaughtersCount: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-1 px-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: FEMALE DECEASED HEIR DETAILS */}
          {deceasedGender === 'female' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
              <h2 className="text-base font-bold text-primary dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Layers size={18} className="text-amber-500" />
                <span>Section 2 — Female Intestate Succession (Sections 15 & 16)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Husband Status
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="husbandAlive"
                      checked={husbandAlive}
                      onChange={(e) => setHusbandAlive(e.target.checked)}
                      className="h-4 w-4 text-amber-600 rounded border-slate-300"
                    />
                    <label htmlFor="husbandAlive" className="text-sm text-slate-700 dark:text-slate-300">
                      Husband is Alive
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Surviving Sons
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleSonsCount}
                    onChange={(e) => setFemaleSonsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Surviving Daughters
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleDaughtersCount}
                    onChange={(e) => setFemaleDaughtersCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Pre-deceased Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femalePreDeceasedChildrenCount}
                    onChange={(e) => handleFemalePreDeceasedChildrenCountChange(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Source of Property (Section 15(2) Rule Check) *
                  </label>
                  <select
                    value={femalePropertySource}
                    onChange={(e) => setFemalePropertySource(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="self_acquired">Self-Acquired / Gift / Will</option>
                    <option value="inherited_father">Inherited from Father (Sec 15(2)(a))</option>
                    <option value="inherited_mother">Inherited from Mother (Sec 15(2)(a))</option>
                    <option value="inherited_husband_father_in_law">Inherited from Husband / Father-in-Law (Sec 15(2)(b))</option>
                    <option value="other">Other / Requires Legal Review</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Female Pre-deceased Child Branches */}
              {femalePreDeceasedChildrenCount > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Pre-deceased Child Branch Details
                  </h3>
                  {femalePreDeceasedChildrenBranches.map((branch, idx) => (
                    <div key={branch.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Pre-deceased Child {idx + 1} Branch
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Surviving Sons</label>
                          <input
                            type="number"
                            min="0"
                            value={branch.survivingSonsCount}
                            onChange={(e) => updateFemalePreDeceasedChildBranch(idx, { survivingSonsCount: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-1 px-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Surviving Daughters</label>
                          <input
                            type="number"
                            min="0"
                            value={branch.survivingDaughtersCount}
                            onChange={(e) => updateFemalePreDeceasedChildBranch(idx, { survivingDaughtersCount: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-1 px-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: COPARCENARY SPECIFIC PARAMETERS */}
          {successionType === 'coparcenary' && (
            <div className="bg-amber-500/5 dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-amber-500/30 space-y-5">
              <h2 className="text-base font-bold text-primary dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Scale size={18} className="text-amber-500" />
                <span>Section 3 — Coparcenary Joint Family Details (Section 6)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Coparcener Sons Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={coparcenarySonsCount}
                    onChange={(e) => setCoparcenarySonsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Coparcener Daughters Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={coparcenaryDaughtersCount}
                    onChange={(e) => setCoparcenaryDaughtersCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Other Coparceners
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={otherCoparcenersCount}
                    onChange={(e) => setOtherCoparcenersCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="priorPartition"
                    checked={priorPartition}
                    onChange={(e) => setPriorPartition(e.target.checked)}
                    className="h-4 w-4 text-amber-600 rounded border-slate-300"
                  />
                  <label htmlFor="priorPartition" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Was there a prior partition of joint family property?
                  </label>
                </div>

                {priorPartition && (
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Partition Date</label>
                        <input
                          type="date"
                          value={priorPartitionDate}
                          onChange={(e) => setPriorPartitionDate(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded py-1.5 px-3 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="priorPartitionReg"
                          checked={priorPartitionRegistered}
                          onChange={(e) => setPriorPartitionRegistered(e.target.checked)}
                          className="h-4 w-4 text-amber-600 rounded border-slate-300"
                        />
                        <label htmlFor="priorPartitionReg" className="text-xs text-slate-700 dark:text-slate-300">
                          Registered Partition Deed / Court Decree
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADDITIONAL LEGAL CONSIDERATIONS */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Legal Fact Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasWill"
                  checked={hasWillOrTestament}
                  onChange={(e) => setHasWillOrTestament(e.target.checked)}
                  className="h-4 w-4 text-amber-600 rounded border-slate-300"
                />
                <label htmlFor="hasWill" className="text-xs text-slate-700 dark:text-slate-300">
                  Will / Testament exists (Sec 30)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disputedHeirship"
                  checked={disputedHeirship}
                  onChange={(e) => setDisputedHeirship(e.target.checked)}
                  className="h-4 w-4 text-amber-600 rounded border-slate-300"
                />
                <label htmlFor="disputedHeirship" className="text-xs text-slate-700 dark:text-slate-300">
                  Disputed heirship or pending suit
                </label>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isCalculating}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isCalculating ? (
                <span>Calculating Shares...</span>
              ) : (
                <>
                  <Calculator size={18} />
                  <span>Calculate Succession Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3.5 px-5 rounded-xl transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </form>

        {/* Right Column: Results & Legal Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Result Summary Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-amber-500/30 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-0.5">
                      Succession Calculation Result
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Indicative Legal Shares
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                    result.reconciled 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {result.reconciled ? 'Reconciled (100%)' : 'Needs Verification'}
                  </span>
                </div>

                {/* Case Parameters Summary */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Deceased:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{result.caseSummary.deceasedGender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Death:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{result.caseSummary.dateOfDeath}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Property Type:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{result.caseSummary.propertyType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Value:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {result.caseSummary.estimatedPropertyValue ? `₹ ${result.caseSummary.estimatedPropertyValue.toLocaleString('en-IN')}` : 'N/A'}
                    </strong>
                  </div>
                </div>

                {/* Heir Shares Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Heir / Branch</th>
                        <th className="py-2.5 px-3 font-semibold">Share</th>
                        <th className="py-2.5 px-3 font-semibold text-right">% Share</th>
                        {result.caseSummary.estimatedPropertyValue && (
                          <th className="py-2.5 px-3 font-semibold text-right">Est. Rupee Value</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {result.heirs.map((heir) => (
                        <tr key={heir.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold">{heir.heirName}</div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{heir.category}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                            {heir.fractionStr}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-right">
                            {heir.percentageStr}
                          </td>
                          {result.caseSummary.estimatedPropertyValue && (
                            <td className="py-2.5 px-3 font-medium text-right text-emerald-600 dark:text-emerald-400">
                              {heir.estimatedRupeeValue ? `₹ ${heir.estimatedRupeeValue.toLocaleString('en-IN')}` : '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Applicable Statutory Provisions */}
                {result.applicableProvisions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Scale size={14} className="text-amber-500" />
                      <span>Applicable Statutory Provisions</span>
                    </h4>
                    <div className="space-y-2">
                      {result.applicableProvisions.map((prov, idx) => (
                        <div key={idx} className="p-3 bg-amber-500/5 dark:bg-slate-800/80 border border-amber-500/20 rounded-xl text-xs space-y-0.5">
                          <div className="font-bold text-amber-700 dark:text-amber-400">
                            {prov.section} — {prov.title}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                            {prov.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings / Legal Review Section */}
                {result.warnings.length > 0 && (
                  <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl space-y-2 text-xs">
                    <div className="font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5">
                      <ShieldAlert size={16} />
                      <span>Legal Review Recommended</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                      {result.warnings.map((warn, idx) => (
                        <li key={idx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="h-16 w-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <Scale size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Succession Calculation Generated Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Fill in the deceased person, succession category, and family branch details on the left, then click <strong>Calculate Succession Share</strong> to view statutory fraction and value breakdowns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
