import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Scale, FileText, Printer, Download, RotateCcw, RefreshCw, 
  AlertTriangle, ShieldCheck, CheckCircle2, Info, BookOpen, 
  ExternalLink, ChevronDown, ChevronUp, Plus, Trash2, Calendar, 
  HelpCircle, UserCheck, Stethoscope, Car, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { 
  SARLA_VERMA_MULTIPLIER_TABLE, 
  MACT_LEGAL_RULES, 
  type LegalRuleDefinition 
} from '../data/motorAccidentRules';
import { 
  calculateMotorAccidentCompensation, 
  formatINR, 
  type MotorAccidentClaimInput, 
  type MotorAccidentCalculationResult, 
  type ClaimType,
  type EmploymentCategory,
  type IncomePeriod,
  type ItemisedExpenseItem,
  type CustomCompensationHead
} from '../utils/motorAccidentEngine';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const MotorAccidentCalculatorPage: React.FC = () => {
  const { user, token, addNotification } = useAuthStore();
  const pageTopRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Tab: Calculator or Legal Rules Reference
  const [activeView, setActiveView] = useState<'calculator' | 'rules' | 'history'>('calculator');

  // Selected Claim Type (5 distinct options)
  const [claimType, setClaimType] = useState<ClaimType>('death');

  // Common Case Metadata
  const [caseReference, setCaseReference] = useState<string>('');
  const [claimantName, setClaimantName] = useState<string>('');
  const [victimName, setVictimName] = useState<string>('');
  const [accidentDate, setAccidentDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split('T')[0];
  });

  // 1. Death Compensation Form State
  const [deathAge, setDeathAge] = useState<number>(32);
  const [deathEmployment, setDeathEmployment] = useState<EmploymentCategory>('salaried_permanent');
  const [deathIncomePeriod, setDeathIncomePeriod] = useState<IncomePeriod>('monthly');
  const [deathIncomeAmount, setDeathIncomeAmount] = useState<number>(50000);
  const [deathAnnualTax, setDeathAnnualTax] = useState<number>(20000);
  const [deathMaritalStatus, setDeathMaritalStatus] = useState<'bachelor' | 'married'>('married');
  const [deathDependantsCount, setDeathDependantsCount] = useState<number>(3);
  const [deathIsBachelorLargeFamily, setDeathIsBachelorLargeFamily] = useState<boolean>(false);
  const [deathSpouses, setDeathSpouses] = useState<number>(1);
  const [deathChildren, setDeathChildren] = useState<number>(2);
  const [deathParents, setDeathParents] = useState<number>(2);
  const [deathEnhancedConventional, setDeathEnhancedConventional] = useState<boolean>(true);
  const [deathExtraHeads, setDeathExtraHeads] = useState<CustomCompensationHead[]>([]);

  // 2. Permanent Disability Form State
  const [disabilityAge, setDisabilityAge] = useState<number>(28);
  const [disabilityEmployment, setDisabilityEmployment] = useState<EmploymentCategory>('salaried_permanent');
  const [disabilityIncomePeriod, setDisabilityIncomePeriod] = useState<IncomePeriod>('monthly');
  const [disabilityIncomeAmount, setDisabilityIncomeAmount] = useState<number>(40000);
  const [disabilityAnnualTax, setDisabilityAnnualTax] = useState<number>(0);
  const [medicalDisabilityPercent, setMedicalDisabilityPercent] = useState<number>(60);
  const [functionalDisabilityPercent, setFunctionalDisabilityPercent] = useState<number>(40);
  const [occupationDetails, setOccupationDetails] = useState<string>('Civil Site Supervisor');
  const [medicalExpensesIncurred, setMedicalExpensesIncurred] = useState<number>(250000);
  const [futureMedicalExpenses, setFutureMedicalExpenses] = useState<number>(100000);
  const [rehabAndAttendant, setRehabAndAttendant] = useState<number>(50000);
  const [dietAndConveyance, setDietAndConveyance] = useState<number>(30000);
  const [painAndSuffering, setPainAndSuffering] = useState<number>(150000);
  const [lossOfAmenities, setLossOfAmenities] = useState<number>(100000);
  const [disabilityExtraHeads, setDisabilityExtraHeads] = useState<CustomCompensationHead[]>([]);

  // 3. Injury & Medical Expenses Form State
  const [medicalExpensesList, setMedicalExpensesList] = useState<ItemisedExpenseItem[]>([
    { id: '1', category: 'Hospitalization & Bed Charges', description: 'Inpatient ICU & General Ward charges (7 days)', amount: 125000, isEvidenceAttached: true },
    { id: '2', category: 'Surgical Procedures', description: 'Internal plate fixation and orthopaedic surgery', amount: 210000, isEvidenceAttached: true },
    { id: '3', category: 'Medicines & Pharmaceuticals', description: 'Pharmacy invoices and post-operative medications', amount: 38500, isEvidenceAttached: true },
    { id: '4', category: 'Diagnostics & Scans', description: 'Emergency MRI, contrast CT scan, and lab work', amount: 18000, isEvidenceAttached: true }
  ]);
  const [newExpCategory, setNewExpCategory] = useState<string>('Hospitalization & Bed Charges');
  const [newExpDesc, setNewExpDesc] = useState<string>('');
  const [newExpAmount, setNewExpAmount] = useState<number>(0);
  const [newExpEvidence, setNewExpEvidence] = useState<boolean>(true);

  // 4. Loss of Income During Treatment Form State
  const [treatmentIncomeFreq, setTreatmentIncomeFreq] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [treatmentIncomeAmount, setTreatmentIncomeAmount] = useState<number>(45000);
  const [treatmentPeriodUnit, setTreatmentPeriodUnit] = useState<'days' | 'weeks' | 'months'>('months');
  const [treatmentPeriodValue, setTreatmentPeriodValue] = useState<number>(3.5);
  const [treatmentLeaveBasis, setTreatmentLeaveBasis] = useState<string>('Hospital discharge advice & certified orthopaedic sick leave');

  // 5. Other Compensation Heads Form State
  const [otherHeadsList, setOtherHeadsList] = useState<CustomCompensationHead[]>([
    { id: '1', title: 'Damaged Personal Property & Apparel', amount: 15000, isAutomated: false, notes: 'Damaged mobile phone, helmet, and clothing at accident site', reviewRequired: true },
    { id: '2', title: 'Family Accommodation & Attendant Conveyance', amount: 35000, isAutomated: false, notes: 'Hotel lodging expenses for claimant family during outstation hospitalization', reviewRequired: true }
  ]);
  const [newHeadTitle, setNewHeadTitle] = useState<string>('');
  const [newHeadAmount, setNewHeadAmount] = useState<number>(0);
  const [newHeadNotes, setNewHeadNotes] = useState<string>('');

  // Result & Calculation State
  const [calcResult, setCalcResult] = useState<MotorAccidentCalculationResult | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedCitationRule, setExpandedCitationRule] = useState<string | null>(null);

  // Saved History State
  const [savedHistory, setSavedHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Automatically scroll to the top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, []);

  // Run initial calculation once on mount
  useEffect(() => {
    handleExecuteCalculation();
  }, [claimType]);

  // Load saved history if switched to history tab
  useEffect(() => {
    if (activeView === 'history' && token) {
      fetchHistory();
    }
  }, [activeView, token]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/api/calculators/motor-accident/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.records) {
        setSavedHistory(data.records);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Build payload based on selected claim type
  const buildCurrentPayload = (): MotorAccidentClaimInput => {
    const base: MotorAccidentClaimInput = {
      claimType,
      accidentDate,
      caseReferenceNumber: caseReference.trim() || undefined,
      claimantName: claimantName.trim() || undefined,
      deceasedOrVictimName: victimName.trim() || undefined
    };

    if (claimType === 'death') {
      base.deathDetails = {
        ageAtAccident: Number(deathAge),
        employmentCategory: deathEmployment,
        incomePeriod: deathIncomePeriod,
        incomeAmount: Number(deathIncomeAmount),
        annualIncomeTax: Number(deathAnnualTax),
        maritalStatus: deathMaritalStatus,
        dependantsCount: Number(deathDependantsCount),
        isBachelorWithLargeFamily: deathMaritalStatus === 'bachelor' && deathIsBachelorLargeFamily,
        consortiumClaimants: {
          spouses: Number(deathSpouses),
          children: Number(deathChildren),
          parents: Number(deathParents)
        },
        useEnhancedConventionalHeads: deathEnhancedConventional,
        additionalHeads: deathExtraHeads
      };
    } else if (claimType === 'permanent_disability') {
      base.disabilityDetails = {
        ageAtAccident: Number(disabilityAge),
        employmentCategory: disabilityEmployment,
        incomePeriod: disabilityIncomePeriod,
        incomeAmount: Number(disabilityIncomeAmount),
        annualIncomeTax: Number(disabilityAnnualTax),
        medicalDisabilityPercent: Number(medicalDisabilityPercent),
        functionalDisabilityPercent: Number(functionalDisabilityPercent),
        occupationDetails: occupationDetails.trim() || undefined,
        medicalExpensesIncurred: Number(medicalExpensesIncurred),
        futureMedicalExpenses: Number(futureMedicalExpenses),
        rehabilitationAndAttendant: Number(rehabAndAttendant),
        specialDietAndConveyance: Number(dietAndConveyance),
        painAndSuffering: Number(painAndSuffering),
        lossOfAmenities: Number(lossOfAmenities),
        additionalHeads: disabilityExtraHeads
      };
    } else if (claimType === 'injury_medical') {
      base.injuryMedicalDetails = {
        expenses: medicalExpensesList
      };
    } else if (claimType === 'loss_of_income_treatment') {
      base.lossOfIncomeDetails = {
        incomeFrequency: treatmentIncomeFreq,
        incomeAmount: Number(treatmentIncomeAmount),
        periodUnit: treatmentPeriodUnit,
        periodValue: Number(treatmentPeriodValue),
        medicalLeaveBasis: treatmentLeaveBasis.trim() || undefined
      };
    } else if (claimType === 'other_compensation') {
      base.otherHeadsDetails = {
        customHeads: otherHeadsList
      };
    }

    return base;
  };

  const handleExecuteCalculation = async () => {
    setValidationError(null);
    setCalculating(true);

    try {
      const payload = buildCurrentPayload();

      // Validate inputs
      if (!payload.accidentDate) {
        throw new Error('Please specify the date of the accident.');
      }

      if (claimType === 'death') {
        if (!payload.deathDetails || payload.deathDetails.ageAtAccident < 0 || payload.deathDetails.ageAtAccident > 120) {
          throw new Error('Please enter a valid age at the time of the accident (0 to 120).');
        }
        if (payload.deathDetails.incomeAmount < 0) {
          throw new Error('Established income cannot be negative.');
        }
      }

      if (claimType === 'permanent_disability') {
        if (!payload.disabilityDetails || payload.disabilityDetails.ageAtAccident < 0 || payload.disabilityDetails.ageAtAccident > 120) {
          throw new Error('Please enter a valid claimant age (0 to 120).');
        }
        if (payload.disabilityDetails.functionalDisabilityPercent < 0 || payload.disabilityDetails.functionalDisabilityPercent > 100) {
          throw new Error('Functional disability affecting earning capacity must be between 0% and 100%.');
        }
      }

      // First run client-side engine for immediate preview
      const localResult = calculateMotorAccidentCompensation(payload);
      setCalcResult(localResult);

      // If online and authenticated, verify with backend API endpoint
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/calculators/motor-accident/calculate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          const apiData = await res.json();
          if (res.ok && apiData.data) {
            setCalcResult(apiData.data);
          }
        } catch (apiErr) {
          // Fallback to local calculation if offline
          console.warn('Backend API sync notice:', apiErr);
        }
      }

    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Validation error while calculating compensation.');
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setValidationError(null);
    setCaseReference('');
    setClaimantName('');
    setVictimName('');
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    setAccidentDate(d.toISOString().split('T')[0]);

    if (claimType === 'death') {
      setDeathAge(32);
      setDeathEmployment('salaried_permanent');
      setDeathIncomePeriod('monthly');
      setDeathIncomeAmount(50000);
      setDeathAnnualTax(20000);
      setDeathMaritalStatus('married');
      setDeathDependantsCount(3);
      setDeathSpouses(1);
      setDeathChildren(2);
      setDeathParents(2);
      setDeathExtraHeads([]);
    } else if (claimType === 'permanent_disability') {
      setDisabilityAge(28);
      setDisabilityEmployment('salaried_permanent');
      setDisabilityIncomeAmount(40000);
      setMedicalDisabilityPercent(60);
      setFunctionalDisabilityPercent(40);
      setOccupationDetails('Civil Site Supervisor');
      setMedicalExpensesIncurred(250000);
      setFutureMedicalExpenses(100000);
      setRehabAndAttendant(50000);
      setDietAndConveyance(30000);
      setPainAndSuffering(150000);
      setLossOfAmenities(100000);
    } else if (claimType === 'injury_medical') {
      setMedicalExpensesList([]);
    } else if (claimType === 'loss_of_income_treatment') {
      setTreatmentIncomeAmount(45000);
      setTreatmentPeriodValue(3.5);
    } else if (claimType === 'other_compensation') {
      setOtherHeadsList([]);
    }

    setCalcResult(null);
    addNotification('Form Cleared', 'All input values for the selected claim type have been reset.', 'info');
  };

  const handleSaveCalculation = async () => {
    if (!calcResult || !token) {
      addNotification('Save Notice', 'Authentication required to save calculations.', 'warning');
      return;
    }

    try {
      const payload = {
        inputPayload: buildCurrentPayload(),
        resultPayload: calcResult,
        caseReferenceNumber: caseReference || 'MACT-CLAIM',
        claimantName: claimantName || 'Claimant',
        victimName: victimName || 'Victim'
      };

      const res = await fetch(`${API_BASE}/api/calculators/motor-accident/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addNotification('Record Saved', 'Motor accident assessment record saved to your private audit history.', 'success');
      } else {
        addNotification('Save Failed', data.message || 'Unable to save record.', 'warning');
      }
    } catch (err) {
      console.error(err);
      addNotification('Error', 'Network error while saving calculation.', 'warning');
    }
  };

  // Add Item to Medical Expenses Table
  const handleAddMedicalExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpAmount <= 0) {
      addNotification('Invalid Amount', 'Expense amount must be greater than zero.', 'warning');
      return;
    }
    const newItem: ItemisedExpenseItem = {
      id: Date.now().toString(),
      category: newExpCategory,
      description: newExpDesc.trim() || newExpCategory,
      amount: Number(newExpAmount),
      isEvidenceAttached: newExpEvidence
    };
    setMedicalExpensesList(prev => [...prev, newItem]);
    setNewExpDesc('');
    setNewExpAmount(0);
    addNotification('Expense Added', `${newExpCategory} item added to claim table.`, 'success');
  };

  const handleRemoveMedicalExpense = (id: string) => {
    setMedicalExpensesList(prev => prev.filter(item => item.id !== id));
  };

  // Add Item to Other Heads Table
  const handleAddOtherHead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadTitle.trim() || newHeadAmount <= 0) {
      addNotification('Incomplete Item', 'Please enter a description and valid amount.', 'warning');
      return;
    }
    const newHead: CustomCompensationHead = {
      id: Date.now().toString(),
      title: newHeadTitle.trim(),
      amount: Number(newHeadAmount),
      isAutomated: false,
      notes: newHeadNotes.trim() || undefined,
      reviewRequired: true
    };
    setOtherHeadsList(prev => [...prev, newHead]);
    setNewHeadTitle('');
    setNewHeadAmount(0);
    setNewHeadNotes('');
    addNotification('Head Added', 'Custom compensation head added.', 'success');
  };

  const handleRemoveOtherHead = (id: string) => {
    setOtherHeadsList(prev => prev.filter(item => item.id !== id));
  };

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (!calcResult) return;

    const rows = [
      ['ELITE LEGAL DESK - MOTOR ACCIDENT COMPENSATION ASSESSMENT (MACT)'],
      ['Generated On', new Date().toLocaleDateString('en-IN'), new Date().toLocaleTimeString('en-IN')],
      ['Case Reference', caseReference || 'N/A'],
      ['Claimant Name', claimantName || 'N/A'],
      ['Victim Name', victimName || 'N/A'],
      ['Accident Date', accidentDate],
      ['Claim Type', claimType.replace('_', ' ').toUpperCase()],
      [''],
      ['ITEMISED COMPENSATION HEADS'],
      ['Head Description', 'Classification', 'Amount (INR)', 'Legal Precedent / Authority', 'Audit Notes']
    ];

    calcResult.itemisedHeads.forEach(item => {
      rows.push([
        `"${item.head}"`,
        item.category.toUpperCase(),
        String(item.amount),
        `"${item.legalCitation}"`,
        `"${item.notes || ''}"`
      ]);
    });

    rows.push(['']);
    rows.push(['TOTAL ESTIMATED COMPENSATION', '', String(calcResult.totalEstimatedCompensation), 'Section 166 MVA (Just Compensation)', '']);
    rows.push(['Section 164 Statutory Fixed Baseline', '', String(calcResult.statutoryNoFaultBenchmark.statutoryFixedAmount), 'Section 164 MVA (No-Fault Basis)', '']);
    rows.push(['']);
    rows.push(['INTERMEDIATE ARITHMETIC STEPS']);
    rows.push(['Step Number', 'Parameter / Stage', 'Evaluated Value', 'Statutory Method', 'Judicial Citation']);

    calcResult.intermediateSteps.forEach(step => {
      rows.push([
        String(step.stepNumber),
        `"${step.label}"`,
        `"${step.value}"`,
        `"${step.formulaOrMethod}"`,
        `"${step.legalCitation}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MACT_Compensation_${claimType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addNotification('Report Exported', 'CSV assessment report downloaded successfully.', 'success');
  };

  // Export JSON Handler
  const handleExportJson = () => {
    if (!calcResult) return;
    const exportData = {
      platform: 'Elite Legal Desk - Legal Practice Management',
      module: 'Motor Accident Compensation Calculator (MACT)',
      metadata: {
        caseReference: caseReference || 'N/A',
        claimantName: claimantName || 'N/A',
        victimName: victimName || 'N/A',
        accidentDate,
        claimType,
        exportedAt: new Date().toISOString()
      },
      assessmentResult: calcResult
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MACT_Assessment_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('JSON Exported', 'Complete assessment audit payload exported.', 'success');
  };

  return (
    <div ref={pageTopRef} className="space-y-6 pb-16">

      {/* Top Header Section */}
      <div className="bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#183C32]/10 dark:bg-[#6F9A83]/15 text-[#183C32] dark:text-[#8FAF9C]">
                <Scale size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-serif font-bold text-[#242522] dark:text-[#F4F0E7] tracking-tight">
                    Motor Accident Compensation Calculator
                  </h1>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#183C32]/10 dark:bg-[#6F9A83]/20 text-[#183C32] dark:text-[#8FAF9C] border border-[#183C32]/20 dark:border-[#6F9A83]/30">
                    MACT Module
                  </span>
                </div>
                <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-0.5">
                  Structured Statutory & Judicial Assessment under Motor Vehicles Act, 1988 (as amended) and Supreme Court Precedents (<em className="italic">Sarla Verma</em>, <em className="italic">Pranay Sethi</em>, <em className="italic">Raj Kumar</em>).
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Views: Calculator vs Rules vs History */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setActiveView('calculator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'calculator'
                  ? 'bg-[#183C32] text-white shadow-xs'
                  : 'bg-[#EFEAE0] dark:bg-[#242822] text-[#625F58] dark:text-[#C5C0B6] hover:text-[#183C32] dark:hover:text-[#F4F0E7]'
              }`}
            >
              <Car size={14} /> Calculator
            </button>
            <button
              onClick={() => setActiveView('rules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'rules'
                  ? 'bg-[#183C32] text-white shadow-xs'
                  : 'bg-[#EFEAE0] dark:bg-[#242822] text-[#625F58] dark:text-[#C5C0B6] hover:text-[#183C32] dark:hover:text-[#F4F0E7]'
              }`}
            >
              <BookOpen size={14} /> Legal Precedents & Rules
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'history'
                  ? 'bg-[#183C32] text-white shadow-xs'
                  : 'bg-[#EFEAE0] dark:bg-[#242822] text-[#625F58] dark:text-[#C5C0B6] hover:text-[#183C32] dark:hover:text-[#F4F0E7]'
              }`}
            >
              <FileSpreadsheet size={14} /> Audit History
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: LEGAL RULES REFERENCE */}
      {activeView === 'rules' && (
        <div className="space-y-6">
          <div className="bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-5 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#242522] dark:text-[#F4F0E7] flex items-center gap-2">
              <BookOpen size={18} className="text-[#183C32] dark:text-[#8FAF9C]" />
              Authoritative Judicial Rules & Statutory Multiplier Tables
            </h3>
            <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-1">
              Maintained, non-arbitrary legal parameters verified against landmark Constitution Bench and 3-Judge Bench Supreme Court decisions.
            </p>

            {/* Rules Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {MACT_LEGAL_RULES.map(rule => (
                <div 
                  key={rule.ruleId} 
                  className="p-4 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[#183C32] dark:text-[#8FAF9C] text-xs">
                      {rule.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#EFEAE0] dark:bg-[#2B3029] text-[#625F58] dark:text-[#C5C0B6]">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A67C3B] dark:text-[#C7A45A] font-semibold">
                    {rule.citation}
                  </p>
                  <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs leading-relaxed">
                    {rule.description}
                  </p>
                  <div className="pt-2 border-t border-[#D8D1C5]/60 dark:border-[#30352F] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#858078] dark:text-[#969188]">Effective Rule Standard:</span>
                    <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{rule.formulaOrValue}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sarla Verma Multiplier Table View */}
            <div className="mt-6 pt-4 border-t border-[#D8D1C5] dark:border-[#30352F]">
              <h4 className="font-serif font-bold text-sm text-[#242522] dark:text-[#F4F0E7] mb-2 flex items-center gap-1.5">
                <Scale size={16} className="text-[#183C32] dark:text-[#8FAF9C]" />
                Sarla Verma (2009) 6 SCC 121 (Para 42) — Standard Multiplier Schedule
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-[#D8D1C5] dark:border-[#30352F] rounded-lg overflow-hidden">
                  <thead className="bg-[#EFEAE0] dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7] font-semibold">
                    <tr>
                      <th className="p-2.5 border-b border-[#D8D1C5] dark:border-[#30352F]">Age Band</th>
                      <th className="p-2.5 border-b border-[#D8D1C5] dark:border-[#30352F]">Applicable Multiplier</th>
                      <th className="p-2.5 border-b border-[#D8D1C5] dark:border-[#30352F]">Supreme Court Citation & Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D1C5]/60 dark:divide-[#30352F]">
                    {SARLA_VERMA_MULTIPLIER_TABLE.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029]/50">
                        <td className="p-2.5 font-mono font-medium text-[#242522] dark:text-[#F4F0E7]">
                          {row.minAge} to {row.maxAge > 100 ? 'Above 65' : `${row.maxAge} years`}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#183C32] dark:text-[#8FAF9C]">
                          {row.multiplier}
                        </td>
                        <td className="p-2.5 text-[#625F58] dark:text-[#C5C0B6]">
                          {row.legalBasis}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SAVED AUDIT HISTORY */}
      {activeView === 'history' && (
        <div className="bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#242522] dark:text-[#F4F0E7] flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#183C32] dark:text-[#8FAF9C]" />
                Saved Assessment Records & Claims Audit Trail
              </h3>
              <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-0.5">
                Private litigation assessment records saved under your advocate account credentials.
              </p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="px-3 py-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-[#858078] dark:text-[#969188]">
              Loading historical assessment records...
            </div>
          ) : savedHistory.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#858078] dark:text-[#969188] space-y-2">
              <Scale size={32} className="mx-auto text-[#71877B]" />
              <p>No saved calculation assessments found. Calculate a claim and hit "Save Assessment Record" to build an audit trail.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-[#D8D1C5] dark:border-[#30352F] rounded-lg">
                <thead className="bg-[#EFEAE0] dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7] font-semibold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Case Reference</th>
                    <th className="p-2.5">Claim Type</th>
                    <th className="p-2.5">Claimant / Victim</th>
                    <th className="p-2.5">Total Assessment</th>
                    <th className="p-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D1C5]/60 dark:divide-[#30352F]">
                  {savedHistory.map((rec, i) => (
                    <tr key={i} className="hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029]/50">
                      <td className="p-2.5 font-mono text-[#625F58] dark:text-[#C5C0B6]">
                        {new Date(rec.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-2.5 font-semibold text-[#242522] dark:text-[#F4F0E7]">
                        {rec.caseReferenceNumber || 'UNREFERENCED'}
                      </td>
                      <td className="p-2.5 uppercase font-mono text-[11px] text-[#A67C3B] dark:text-[#C7A45A]">
                        {rec.claimType.replace('_', ' ')}
                      </td>
                      <td className="p-2.5 text-[#625F58] dark:text-[#C5C0B6]">
                        {rec.claimantName || rec.victimName || 'N/A'}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-[#183C32] dark:text-[#8FAF9C]">
                        {formatINR(rec.totalEstimatedCompensation)}
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => {
                            if (rec.resultPayload) {
                              setCalcResult(rec.resultPayload);
                              setActiveView('calculator');
                              addNotification('Loaded Assessment', 'Historical assessment restored to results view.', 'info');
                            }
                          }}
                          className="px-2 py-1 rounded bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#D8D1C5] dark:hover:bg-[#30352F] text-[11px] font-semibold cursor-pointer"
                        >
                          View Assessment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MAIN CALCULATOR FORM & RESULTS */}
      {activeView === 'calculator' && (
        <div className="space-y-6">

          {/* Section 166(3) Limitation Banner if applicable */}
          {calcResult?.limitationAlert.isPassed && (
            <div className="p-4 rounded-xl bg-[#F1E9D8] dark:bg-[#9A7435]/15 border border-[#A67C3B]/40 text-[#80632E] dark:text-[#D8C49A] text-xs flex items-start gap-3 animate-fade-in">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-[#A67C3B]" />
              <div className="space-y-1">
                <p className="font-bold text-xs uppercase tracking-wide">
                  Statutory Limitation Notice — Section 166(3), Motor Vehicles Act, 1988
                </p>
                <p className="text-xs leading-relaxed">
                  {calcResult.limitationAlert.warningMessage}
                </p>
                <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6]">
                  Days elapsed since accident date: <strong>{calcResult.limitationAlert.daysSinceAccident} days</strong>. Please prepare an accompanying limitation condonation petition under Section 5 of the Limitation Act, 1963.
                </p>
              </div>
            </div>
          )}

          {/* Claim Type Selector Buttons */}
          <div className="bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-4 shadow-xs">
            <label className="block text-xs font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wider mb-2">
              Select Motor Accident Claim Category:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {[
                { id: 'death' as ClaimType, title: 'Death Compensation', subtitle: 'Fatal dependency loss & consortium' },
                { id: 'permanent_disability' as ClaimType, title: 'Permanent Disability', subtitle: 'Loss of earning capacity (Raj Kumar)' },
                { id: 'injury_medical' as ClaimType, title: 'Injury & Medical', subtitle: 'Itemised hospitalization vouchers' },
                { id: 'loss_of_income_treatment' as ClaimType, title: 'Loss of Income in Treatment', subtitle: 'Pro-rata recuperation wages' },
                { id: 'other_compensation' as ClaimType, title: 'Other Heads', subtitle: 'Property, special travel & care' }
              ].map(tab => {
                const isSelected = claimType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setClaimType(tab.id);
                      setValidationError(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#183C32] dark:border-[#8FAF9C] bg-[#183C32]/5 dark:bg-[#6F9A83]/15 shadow-xs'
                        : 'border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] hover:border-[#71877B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#183C32] dark:text-[#8FAF9C]' : 'text-[#242522] dark:text-[#F4F0E7]'}`}>
                          {tab.title}
                        </span>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-[#183C32] dark:bg-[#8FAF9C]" />}
                      </div>
                      <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6] line-clamp-2">
                        {tab.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form & Results Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Data Entry Form */}
            <div className="lg:col-span-7 bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-5 md:p-6 shadow-xs space-y-5">

              <div className="border-b border-[#D8D1C5] dark:border-[#30352F] pb-3">
                <h3 className="font-serif font-bold text-base text-[#242522] dark:text-[#F4F0E7]">
                  {claimType === 'death' && 'Death Compensation Claim Parameters'}
                  {claimType === 'permanent_disability' && 'Permanent Disability & Earning Impairment'}
                  {claimType === 'injury_medical' && 'Itemised Medical & Hospitalization Damages'}
                  {claimType === 'loss_of_income_treatment' && 'Loss of Earnings During Active Recuperation'}
                  {claimType === 'other_compensation' && 'Additional Legally Documented Heads'}
                </h3>
                <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-0.5">
                  Enter established case facts and documentary evidence values.
                </p>
              </div>

              {/* Case Metadata Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-[#FAF8F2] dark:bg-[#1E211D] rounded-xl border border-[#D8D1C5]/70 dark:border-[#30352F]">
                <div>
                  <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wide mb-1">
                    Date of Accident *
                  </label>
                  <input
                    type="date"
                    value={accidentDate}
                    onChange={(e) => setAccidentDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7] focus:outline-none focus:ring-1 focus:ring-[#183C32]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wide mb-1">
                    Case / Claim Ref No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MACP 104/2024"
                    value={caseReference}
                    onChange={(e) => setCaseReference(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7] focus:outline-none focus:ring-1 focus:ring-[#183C32]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wide mb-1">
                    Claimant / Victim Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smt. Rajeshwari Devi"
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7] focus:outline-none focus:ring-1 focus:ring-[#183C32]"
                  />
                </div>
              </div>

              {/* 1. DEATH COMPENSATION FORM */}
              {claimType === 'death' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Age of the Deceased at Accident *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={deathAge}
                        onChange={(e) => setDeathAge(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7] focus:outline-none focus:ring-1 focus:ring-[#183C32]"
                      />
                      <span className="text-[10px] text-[#858078] dark:text-[#969188] mt-0.5 block">
                        Determines multiplier table as per Sarla Verma (Para 42).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Employment Category *
                      </label>
                      <select
                        value={deathEmployment}
                        onChange={(e) => setDeathEmployment(e.target.value as EmploymentCategory)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7] focus:outline-none focus:ring-1 focus:ring-[#183C32]"
                      >
                        <option value="salaried_permanent">Permanent Salaried Job (+50% / +30% / +15%)</option>
                        <option value="self_employed_fixed">Self-Employed / Fixed Wages (+40% / +25% / +10%)</option>
                        <option value="unemployed_homemaker">Homemaker / Notional Income</option>
                      </select>
                      <span className="text-[10px] text-[#858078] dark:text-[#969188] mt-0.5 block">
                        Determines future prospects as per Pranay Sethi (Constitution Bench).
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Income Period *
                      </label>
                      <select
                        value={deathIncomePeriod}
                        onChange={(e) => setDeathIncomePeriod(e.target.value as IncomePeriod)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      >
                        <option value="monthly">Monthly Income</option>
                        <option value="annual">Annual Income</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Established Income (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={deathIncomeAmount}
                        onChange={(e) => setDeathIncomeAmount(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Annual Income Tax (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={deathAnnualTax}
                        onChange={(e) => setDeathAnnualTax(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      />
                      <span className="text-[10px] text-[#858078] dark:text-[#969188] mt-0.5 block">
                        Deducted before future prospects.
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] space-y-3">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Marital Status & Dependant Deductions (Sarla Verma Paras 30-32)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Marital Status *
                        </label>
                        <select
                          value={deathMaritalStatus}
                          onChange={(e) => setDeathMaritalStatus(e.target.value as 'bachelor' | 'married')}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                        >
                          <option value="married">Married Deceased</option>
                          <option value="bachelor">Bachelor / Single Deceased</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Number of Dependent Family Members *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={deathDependantsCount}
                          onChange={(e) => setDeathDependantsCount(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                        />
                      </div>
                    </div>

                    {deathMaritalStatus === 'bachelor' && (
                      <label className="flex items-center gap-2 text-xs text-[#242522] dark:text-[#F4F0E7] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deathIsBachelorLargeFamily}
                          onChange={(e) => setDeathIsBachelorLargeFamily(e.target.checked)}
                          className="rounded text-[#183C32]"
                        />
                        <span>
                          Deceased was a bachelor with large dependent family (widowed mother & younger dependent siblings — reduce deduction from 50% to 33.33% as per Sarla Verma Para 32)
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] space-y-3">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Consortium Claimants (Magma General Insurance & Satinder Kaur)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Surviving Spouse(s)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={deathSpouses}
                          onChange={(e) => setDeathSpouses(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                        />
                        <span className="text-[10px] text-[#858078] dark:text-[#969188]">Spousal Consortium</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Minor / Dependent Children
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="15"
                          value={deathChildren}
                          onChange={(e) => setDeathChildren(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                        />
                        <span className="text-[10px] text-[#858078] dark:text-[#969188]">Parental Consortium</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Surviving Dependent Parents
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          value={deathParents}
                          onChange={(e) => setDeathParents(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                        />
                        <span className="text-[10px] text-[#858078] dark:text-[#969188]">Filial Consortium</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs text-[#242522] dark:text-[#F4F0E7] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deathEnhancedConventional}
                          onChange={(e) => setDeathEnhancedConventional(e.target.checked)}
                          className="rounded text-[#183C32]"
                        />
                        <span>
                          Apply 10% triennial inflation indexation to conventional heads & consortium (Pranay Sethi Para 59.8: ₹18,150 estate/funeral & ₹48,400 consortium)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PERMANENT DISABILITY FORM */}
              {claimType === 'permanent_disability' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Age of the Injured Claimant *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={disabilityAge}
                        onChange={(e) => setDisabilityAge(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Employment Category *
                      </label>
                      <select
                        value={disabilityEmployment}
                        onChange={(e) => setDisabilityEmployment(e.target.value as EmploymentCategory)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      >
                        <option value="salaried_permanent">Permanent Salaried Job</option>
                        <option value="self_employed_fixed">Self-Employed / Professional / Fixed Wages</option>
                        <option value="unemployed_homemaker">Homemaker / Non-earning</option>
                      </select>
                      <span className="text-[10px] text-[#858078] dark:text-[#969188] mt-0.5 block">
                        Future prospects apply to disability as per Pappu Deo Yadav (2022).
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Income Period
                      </label>
                      <select
                        value={disabilityIncomePeriod}
                        onChange={(e) => setDisabilityIncomePeriod(e.target.value as IncomePeriod)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      >
                        <option value="monthly">Monthly Income</option>
                        <option value="annual">Annual Income</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Established Income (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={disabilityIncomeAmount}
                        onChange={(e) => setDisabilityIncomeAmount(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Claimant Trade / Occupation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Heavy Vehicle Driver"
                        value={occupationDetails}
                        onChange={(e) => setOccupationDetails(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] space-y-3">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Disability Assessment: Medical Impairment vs Functional Earning Loss (Raj Kumar 2011)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Medical Board Disability (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={medicalDisabilityPercent}
                          onChange={(e) => setMedicalDisabilityPercent(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                        />
                        <span className="text-[10px] text-[#858078] dark:text-[#969188]">Certified anatomical / bodily impairment</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Functional Disability Affecting Earnings (%) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={functionalDisabilityPercent}
                          onChange={(e) => setFunctionalDisabilityPercent(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                        />
                        <span className="text-[10px] text-[#183C32] dark:text-[#8FAF9C] font-semibold">Loss of vocational earning capability</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#858078] dark:text-[#969188] italic">
                      * Precedent Note: In Raj Kumar v. Ajay Kumar (2011) 1 SCC 343, the Supreme Court held that medical disability does not automatically equate to loss of earning capacity. The Tribunal must assess how the physical handicap impairs the victim's specific vocation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] space-y-3">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Associated Pecuniary & Non-Pecuniary Damages (₹)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Hospital & Treatment (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={medicalExpensesIncurred}
                          onChange={(e) => setMedicalExpensesIncurred(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Future Medical Treatment (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={futureMedicalExpenses}
                          onChange={(e) => setFutureMedicalExpenses(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Attendant & Nursing Care (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={rehabAndAttendant}
                          onChange={(e) => setRehabAndAttendant(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Special Diet & Conveyance (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={dietAndConveyance}
                          onChange={(e) => setDietAndConveyance(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Pain & Suffering (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={painAndSuffering}
                          onChange={(e) => setPainAndSuffering(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Loss of Amenities of Life (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={lossOfAmenities}
                          onChange={(e) => setLossOfAmenities(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. INJURY & MEDICAL EXPENSES FORM */}
              {claimType === 'injury_medical' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] space-y-3">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Add Itemised Medical Voucher / Hospital Expense
                    </h4>
                    <form onSubmit={handleAddMedicalExpense} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                            Expense Head / Category *
                          </label>
                          <select
                            value={newExpCategory}
                            onChange={(e) => setNewExpCategory(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                          >
                            <option value="Hospitalization & Bed Charges">Hospitalization & Bed Charges</option>
                            <option value="Surgical Procedures & OT">Surgical Procedures & OT</option>
                            <option value="Medicines & Pharmaceuticals">Medicines & Pharmaceuticals</option>
                            <option value="Diagnostics & Scans">Diagnostics & Scans</option>
                            <option value="Physiotherapy & Rehab">Physiotherapy & Rehab</option>
                            <option value="Attendant Charges">Attendant Charges</option>
                            <option value="Ambulance & Conveyance">Ambulance & Conveyance</option>
                            <option value="Special Nutrition Diet">Special Nutrition Diet</option>
                            <option value="Pain & Suffering">Pain & Suffering</option>
                            <option value="Loss of Amenities">Loss of Amenities</option>
                            <option value="Future Medical Procedures">Future Medical Procedures</option>
                            <option value="Other Medical Losses">Other Medical Losses</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                            Description / Voucher Ref
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Apollo Hospital Bill #9041"
                            value={newExpDesc}
                            onChange={(e) => setNewExpDesc(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                            Amount (₹) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Amount in INR"
                            value={newExpAmount || ''}
                            onChange={(e) => setNewExpAmount(Number(e.target.value))}
                            className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs text-[#242522] dark:text-[#F4F0E7] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newExpEvidence}
                            onChange={(e) => setNewExpEvidence(e.target.checked)}
                            className="rounded text-[#183C32]"
                          />
                          <span>Supporting voucher / bill attached with claim petition</span>
                        </label>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-[#183C32] text-white text-xs font-bold hover:bg-[#245445] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> Add Item to Schedule
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List of expenses */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Documented Expense Schedule ({medicalExpensesList.length} items)
                    </h4>
                    {medicalExpensesList.length === 0 ? (
                      <p className="text-xs text-[#858078] dark:text-[#969188] italic p-4 text-center border border-dashed rounded-lg">
                        No medical expense items added yet. Use the form above to add hospital vouchers and treatment expenses.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#D8D1C5]/60 dark:divide-[#30352F] border border-[#D8D1C5] dark:border-[#30352F] rounded-lg overflow-hidden bg-white dark:bg-[#1E211D]">
                        {medicalExpensesList.map((item) => (
                          <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAF8F2] dark:hover:bg-[#2B3029]/40">
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#183C32] dark:text-[#8FAF9C] block">{item.category}</span>
                              <span className="text-[#625F58] dark:text-[#C5C0B6]">{item.description}</span>
                              {item.isEvidenceAttached && (
                                <span className="inline-block text-[10px] text-[#3F6B50] font-semibold bg-[#E5EEE7] px-1.5 py-0.2 rounded ml-2">Evidence Attached</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[#242522] dark:text-[#F4F0E7]">{formatINR(item.amount)}</span>
                              <button
                                onClick={() => handleRemoveMedicalExpense(item.id)}
                                className="p-1 rounded text-[#914F45] hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. LOSS OF INCOME DURING TREATMENT FORM */}
              {claimType === 'loss_of_income_treatment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Income Frequency *
                      </label>
                      <select
                        value={treatmentIncomeFreq}
                        onChange={(e) => setTreatmentIncomeFreq(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      >
                        <option value="monthly">Monthly Wage / Salary</option>
                        <option value="daily">Daily Wage Earner</option>
                        <option value="weekly">Weekly Wages</option>
                        <option value="annual">Annual Income</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Income Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={treatmentIncomeAmount}
                        onChange={(e) => setTreatmentIncomeAmount(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Period Unit *
                      </label>
                      <select
                        value={treatmentPeriodUnit}
                        onChange={(e) => setTreatmentPeriodUnit(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      >
                        <option value="months">Months of Inpatient & Recuperation</option>
                        <option value="weeks">Weeks of Inpatient & Recuperation</option>
                        <option value="days">Days of Inpatient & Recuperation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                        Period Duration *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={treatmentPeriodValue}
                        onChange={(e) => setTreatmentPeriodValue(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-1">
                      Supporting Medical Leave & Discharge Basis
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Hospital discharge summary advising 3 months complete bedrest post femur surgery"
                      value={treatmentLeaveBasis}
                      onChange={(e) => setTreatmentLeaveBasis(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822] text-[#242522] dark:text-[#F4F0E7]"
                    />
                  </div>
                </div>
              )}

              {/* 5. OTHER COMPENSATION HEADS FORM */}
              {claimType === 'other_compensation' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FAF8F2] dark:bg-[#1E211D] space-y-3">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Add Custom Documented Head
                    </h4>
                    <form onSubmit={handleAddOtherHead} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                            Head Title / Loss Description *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Damage to Vehicle & Personal Belongings"
                            value={newHeadTitle}
                            onChange={(e) => setNewHeadTitle(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                            Claim Amount (₹) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Amount in INR"
                            value={newHeadAmount || ''}
                            onChange={(e) => setNewHeadAmount(Number(e.target.value))}
                            className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#625F58] dark:text-[#C5C0B6] mb-1">
                          Evidence Notes / Justification
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Surveyor report, repair estimate, hotel bills"
                          value={newHeadNotes}
                          onChange={(e) => setNewHeadNotes(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] bg-white dark:bg-[#242822]"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-[#183C32] text-white text-xs font-bold hover:bg-[#245445] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} /> Add Custom Head
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wide">
                      Configured Compensation Heads ({otherHeadsList.length})
                    </h4>
                    {otherHeadsList.length === 0 ? (
                      <p className="text-xs text-[#858078] dark:text-[#969188] italic p-4 text-center border border-dashed rounded-lg">
                        No additional compensation heads added.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#D8D1C5]/60 dark:divide-[#30352F] border border-[#D8D1C5] dark:border-[#30352F] rounded-lg overflow-hidden bg-white dark:bg-[#1E211D]">
                        {otherHeadsList.map((head) => (
                          <div key={head.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAF8F2] dark:hover:bg-[#2B3029]/40">
                            <div>
                              <span className="font-bold text-[#242522] dark:text-[#F4F0E7] block">{head.title}</span>
                              {head.notes && <span className="text-[#625F58] dark:text-[#C5C0B6] text-[11px]">{head.notes}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[#183C32] dark:text-[#8FAF9C]">{formatINR(head.amount)}</span>
                              <button
                                onClick={() => handleRemoveOtherHead(head.id)}
                                className="p-1 rounded text-[#914F45] hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Validation Warning Box */}
              {validationError && (
                <div className="p-3.5 bg-[#F1E2DF] dark:bg-red-950/40 text-[#914F45] dark:text-red-300 rounded-xl text-xs flex gap-2 font-medium border border-red-200 dark:border-red-900/50 animate-shake">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Action Buttons: Calculate, Recalculate, Reset Form */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-[#D8D1C5] dark:border-[#30352F]">
                <button
                  type="button"
                  onClick={handleExecuteCalculation}
                  disabled={calculating}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#183C32] hover:bg-[#245445] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {calculating ? <RefreshCw className="animate-spin" size={16} /> : <Scale size={16} />}
                  <span>{calcResult ? 'Recalculate Compensation' : 'Calculate Compensation'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl border border-[#71877B] text-[#183C32] dark:text-[#C5C0B6] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} /> Reset Form
                </button>
              </div>

            </div>

            {/* Right Column: Assessment Results & Arithmetic Audit Trail */}
            <div className="lg:col-span-5 space-y-4">

              <div 
                ref={printAreaRef}
                className="bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-5 shadow-xs space-y-4 print:border-none print:shadow-none"
              >
                
                {/* Results Header */}
                <div className="flex items-center justify-between border-b border-[#D8D1C5] dark:border-[#30352F] pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#242522] dark:text-[#F4F0E7] flex items-center gap-1.5">
                      <FileText size={16} className="text-[#183C32] dark:text-[#8FAF9C]" />
                      Compensation Assessment Breakdown
                    </h3>
                    <p className="text-[10px] text-[#858078] dark:text-[#969188]">
                      Transparent intermediate steps & cited judicial sources
                    </p>
                  </div>

                  {calcResult && (
                    <div className="flex items-center gap-1 print:hidden">
                      <button
                        onClick={handleSaveCalculation}
                        className="p-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-[#183C32] dark:text-[#F4F0E7] text-xs"
                        title="Save Assessment Record"
                      >
                        <UserCheck size={14} />
                      </button>
                      <button
                        onClick={handleExportCsv}
                        className="p-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-[#183C32] dark:text-[#F4F0E7] text-xs"
                        title="Export CSV"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#30352F] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-[#183C32] dark:text-[#F4F0E7] text-xs"
                        title="Print Official Report"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {!calcResult ? (
                  <div className="py-16 text-center text-xs text-[#858078] dark:text-[#969188] space-y-2">
                    <Scale size={32} className="mx-auto text-[#71877B]" />
                    <p>Enter claim values and click Calculate Compensation to view the structured statutory assessment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* Total Estimated Banner */}
                    <div className="p-4 rounded-xl bg-[#EFEAE0]/80 dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#858078] dark:text-[#969188] tracking-wider block">
                        Estimated Total Compensation
                      </span>
                      <div className="text-2xl md:text-3xl font-mono font-extrabold text-[#183C32] dark:text-[#8FAF9C]">
                        {formatINR(calcResult.totalEstimatedCompensation)}
                      </div>
                      <span className="text-[10px] text-[#625F58] dark:text-[#C5C0B6] block">
                        Evaluated under Section 166 (Fault-Liability Multiplier Method)
                      </span>
                    </div>

                    {/* Section 164 Statutory Fixed Comparison */}
                    <div className="p-3 rounded-lg bg-[#FAF8F2] dark:bg-[#242822] border border-[#D8D1C5]/70 dark:border-[#30352F] text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#242522] dark:text-[#F4F0E7]">
                        <span>Section 164 No-Fault Fixed Baseline:</span>
                        <span className="font-mono text-[#A67C3B] dark:text-[#C7A45A]">
                          {formatINR(calcResult.statutoryNoFaultBenchmark.statutoryFixedAmount)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#625F58] dark:text-[#C5C0B6] leading-tight">
                        {calcResult.statutoryNoFaultBenchmark.guidanceNote}
                      </p>
                    </div>

                    {/* Itemised Heads Breakdown */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wider mb-2">
                        Itemised Compensation Heads
                      </h4>
                      <div className="divide-y divide-[#D8D1C5]/60 dark:divide-[#30352F] border border-[#D8D1C5] dark:border-[#30352F] rounded-lg overflow-hidden bg-white dark:bg-[#1E211D]">
                        {calcResult.itemisedHeads.map((item, idx) => (
                          <div key={idx} className="p-2.5 text-xs flex flex-col justify-between hover:bg-[#FAF8F2] dark:hover:bg-[#2B3029]/30">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{item.head}</span>
                              <span className="font-mono font-bold text-[#183C32] dark:text-[#8FAF9C] shrink-0">
                                {formatINR(item.amount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-[#858078] dark:text-[#969188]">
                              <span className="italic">{item.legalCitation}</span>
                              <span className="uppercase text-[9px] font-mono px-1 rounded bg-[#EFEAE0] dark:bg-[#2B3029]">{item.category}</span>
                            </div>
                            {item.notes && (
                              <p className="text-[10px] text-[#625F58] dark:text-[#C5C0B6] mt-0.5">
                                • {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intermediate Arithmetic Steps */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wider mb-2">
                        Intermediate Calculation Steps & Formula Audit
                      </h4>
                      <div className="space-y-1.5">
                        {calcResult.intermediateSteps.map((step) => (
                          <div 
                            key={step.stepNumber} 
                            className="p-2 rounded-lg bg-[#FAF8F2] dark:bg-[#1E211D] border border-[#D8D1C5]/60 dark:border-[#30352F] text-[11px]"
                          >
                            <div className="flex justify-between items-center font-semibold text-[#242522] dark:text-[#F4F0E7]">
                              <span>Step {step.stepNumber}: {step.label}</span>
                              <span className="font-mono font-bold text-[#183C32] dark:text-[#8FAF9C]">{step.value}</span>
                            </div>
                            <p className="text-[10px] text-[#625F58] dark:text-[#C5C0B6] mt-0.5">
                              Method: {step.formulaOrMethod}
                            </p>
                            <p className="text-[9.5px] text-[#A67C3B] dark:text-[#C7A45A] italic">
                              Precedent: {step.legalCitation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Export Actions & Report Generation */}
                    <div className="pt-2 border-t border-[#D8D1C5] dark:border-[#30352F] flex flex-wrap gap-2 print:hidden">
                      <button
                        onClick={handlePrint}
                        className="flex-1 py-2 px-3 rounded-lg border border-[#71877B] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-[#183C32] dark:text-[#F4F0E7]"
                      >
                        <Printer size={13} /> Print Assessment
                      </button>
                      <button
                        onClick={handleExportCsv}
                        className="py-2 px-3 rounded-lg border border-[#71877B] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-[#183C32] dark:text-[#F4F0E7]"
                      >
                        <Download size={13} /> Export CSV
                      </button>
                      <button
                        onClick={handleExportJson}
                        className="py-2 px-3 rounded-lg border border-[#71877B] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-[#183C32] dark:text-[#F4F0E7]"
                      >
                        <FileText size={13} /> Export JSON
                      </button>
                    </div>

                    {/* Statutory Disclaimer */}
                    <div className="p-3 rounded-lg bg-[#FAF8F2] dark:bg-[#1E211D] border border-[#D8D1C5]/70 dark:border-[#30352F] text-[10px] text-[#858078] dark:text-[#969188] leading-normal italic">
                      {calcResult.disclaimerText}
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
