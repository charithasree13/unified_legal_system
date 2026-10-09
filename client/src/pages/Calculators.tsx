import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, Scale, FileText, ArrowRightLeft, ShieldAlert, ArrowRight,
  Printer, Download, History, RefreshCw, Copy, FileSpreadsheet, RotateCcw, Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LegalTriviaLoader } from '../components/LegalTriviaLoader';
import { evaluateCourtFee } from '../utils/courtFeeEngine';
import { InterestCalculatorPage } from './InterestCalculatorPage';
import { DateDifferenceCalculatorPage } from './DateDifferenceCalculatorPage';

interface CalculatorsProps {
  initialTab?: 'land' | 'interest' | 'date' | 'court';
}

export const Calculators: React.FC<CalculatorsProps> = ({ initialTab }) => {
  const { user, token, addNotification } = useAuthStore();
  const roleLower = (user?.role || '').toLowerCase();
  const isAdvocateOrAdmin = roleLower === 'admin' || roleLower === 'advocate';

  const [activeTab, setActiveTab] = useState<'land' | 'interest' | 'date' | 'court'>(() => {
    if (initialTab === 'court') {
      if (isAdvocateOrAdmin) return 'court';
      return 'land';
    }
    if (initialTab && ['land', 'interest', 'date'].includes(initialTab)) {
      return initialTab;
    }
    return 'land';
  });

  useEffect(() => {
    if (initialTab === 'court') {
      if (!isAdvocateOrAdmin) {
        setActiveTab('land');
        addNotification('Access Restricted', 'The Court Fee Calculator is restricted exclusively to Advocates and Administrators.', 'error');
      } else {
        setActiveTab('court');
      }
    } else if (initialTab && ['land', 'interest', 'date'].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isAdvocateOrAdmin]);

  const handleTabChange = (tab: 'land' | 'interest' | 'date' | 'court') => {
    if (tab === 'court' && !isAdvocateOrAdmin) {
      addNotification('Access Restricted', 'The Court Fee Calculator is restricted exclusively to Advocates and Administrators.', 'error');
      return;
    }
    setActiveTab(tab);
  };

  // -------------------------------------------------------------
  // 1. LAND CONVERSION CALCULATOR
  // -------------------------------------------------------------
  const [landValues, setLandValues] = useState({
    acre: '',
    hectare: '',
    cent: '',
    sqYard: '',
    sqMeter: '',
    sqFeet: '',
    gunta: '',
    bigha: ''
  });

  const RATES: { [key: string]: number } = {
    sqFeet: 1,
    sqYard: 9,
    sqMeter: 10.76391,
    gunta: 1089,
    cent: 435.6,
    bigha: 27000,
    acre: 43560,
    hectare: 107639.1
  };

  const handleLandConvert = (unit: string, valueStr: string) => {
    if (valueStr === '') {
      setLandValues({
        acre: '', hectare: '', cent: '', sqYard: '', sqMeter: '', sqFeet: '', gunta: '', bigha: ''
      });
      return;
    }

    const value = parseFloat(valueStr);
    if (isNaN(value)) return;

    const sqFeetBase = value * RATES[unit];

    setLandValues({
      sqFeet: parseFloat((sqFeetBase / RATES.sqFeet).toFixed(3)).toString(),
      sqYard: parseFloat((sqFeetBase / RATES.sqYard).toFixed(3)).toString(),
      sqMeter: parseFloat((sqFeetBase / RATES.sqMeter).toFixed(3)).toString(),
      gunta: parseFloat((sqFeetBase / RATES.gunta).toFixed(3)).toString(),
      cent: parseFloat((sqFeetBase / RATES.cent).toFixed(3)).toString(),
      bigha: parseFloat((sqFeetBase / RATES.bigha).toFixed(3)).toString(),
      acre: parseFloat((sqFeetBase / RATES.acre).toFixed(3)).toString(),
      hectare: parseFloat((sqFeetBase / RATES.hectare).toFixed(3)).toString(),
      [unit]: valueStr
    });
  };

  // -------------------------------------------------------------
  // 2. DATABASE-DRIVEN COURT FEE CALCULATOR MODULE (Advocate & Admin Only)
  // -------------------------------------------------------------
  const [metadata, setMetadata] = useState<{
    states: any[];
    courtTypes: any[];
    caseTypes: any[];
    reliefTypes: any[];
    acts: any[];
  }>({
    states: [],
    courtTypes: [],
    caseTypes: [],
    reliefTypes: [],
    acts: []
  });

  const ALL_CASE_TYPES = [
    'Money Recovery Suit',
    'Partition Suit',
    'Specific Performance',
    'Declaration',
    'Declaration with Consequential Relief',
    'Permanent Injunction',
    'Mandatory Injunction',
    'Possession Suit',
    'Mortgage Suit',
    'Redemption Suit',
    'Eviction Suit',
    'Title Suit',
    'Recovery of Loan',
    'Cancellation of Sale Deed',
    'Cancellation of Gift Deed',
    'Appeal',
    'Execution Petition',
    'Civil Revision',
    'Civil Miscellaneous Appeal',
    'Probate',
    'Succession Certificate',
    'Guardianship',
    'Commercial Suit',
    'Consumer Complaint',
    'Arbitration',
    'Land Acquisition'
  ];

  const STATE_DISTRICTS: { [key: string]: string[] } = {
    'Andhra Pradesh': ['Chittoor', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Kurnool', 'Anantapur', 'Nellore', 'Kadapa', 'Tirupati', 'Kakinada'],
    'Telangana': ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    'Delhi': ['Central Delhi', 'New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Dwarka', 'Patiala House', 'Rohini', 'Saket'],
    'Maharashtra': ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Thane', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'],
    'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'],
    'West Bengal': ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly', 'Darjeeling'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur Nagar', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Varanasi', 'Prayagraj', 'Agra']
  };

  const CASE_RELIEF_MAP: { [key: string]: string[] } = {
    'Money Recovery Suit': ['Money Claim Recovery'],
    'Recovery of Loan': ['Bank Debt Recovery', 'Money Claim Recovery'],
    'Possession Suit': ['Property Market Valuation Possession'],
    'Partition Suit': ['Partition Share Market Value'],
    'Specific Performance': ['Contract Agreement Consideration'],
    'Declaration': ['Fixed Title Declaration', 'Declaration with Consequential Relief'],
    'Declaration with Consequential Relief': ['Declaration with Consequential Relief', 'Fixed Title Declaration'],
    'Permanent Injunction': ['Fixed Injunction Relief'],
    'Mandatory Injunction': ['Fixed Injunction Relief'],
    'Cancellation of Sale Deed': ['Cancellation Sale Deed Market Value'],
    'Cancellation of Gift Deed': ['Cancellation Sale Deed Market Value'],
    'Commercial Suit': ['Commercial Suit Ad Valorem'],
    'Consumer Complaint': ['Consumer Compensation Claim'],
    'Writ Petition': ['Writ Petition Fixed Fee']
  };

  // Form Inputs
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Chittoor');
  const [selectedCourt, setSelectedCourt] = useState('District Court');
  const [selectedCaseType, setSelectedCaseType] = useState('Money Recovery Suit');
  const [selectedRelief, setSelectedRelief] = useState('Money Claim Recovery');

  const handleCaseTypeChange = (ct: string) => {
    setSelectedCaseType(ct);
    const availableReliefs = CASE_RELIEF_MAP[ct];
    if (availableReliefs && availableReliefs.length > 0) {
      setSelectedRelief(availableReliefs[0]);
    }
  };

  // Valuation Amount Inputs
  const [suitValue, setSuitValue] = useState('100000');
  const [marketValue, setMarketValue] = useState('0');
  const [propertyValue, setPropertyValue] = useState('0');
  const [agreementValue, setAgreementValue] = useState('0');
  const [loanAmount, setLoanAmount] = useState('0');
  const [compensationAmount, setCompensationAmount] = useState('0');

  // Calculation Results
  const [calcResult, setCalcResult] = useState<any | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcErr, setCalcErr] = useState('');

  // Calculation History List
  const [calcHistory, setCalcHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isAdvocateOrAdmin && token) {
      fetchMetadata();
      fetchHistory();
    }
  }, [token, isAdvocateOrAdmin]);

  // Update district when state changes
  useEffect(() => {
    const list = STATE_DISTRICTS[selectedState];
    if (list && list.length > 0) {
      setDistrict(list[0]);
    } else {
      setDistrict('');
    }
  }, [selectedState]);

  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/calculators/court-fee/metadata', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok) {
        setMetadata({
          states: data.states || [],
          courtTypes: data.courtTypes || [],
          caseTypes: data.caseTypes || [],
          reliefTypes: data.reliefTypes || [],
          acts: data.acts || []
        });
      }
    } catch (err) {
      console.error('Failed loading fee metadata:', err);
    }
  };

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/calculators/court-fee/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.history)) {
        setCalcHistory(data.history);
      }
    } catch (err) {
      console.error('Failed loading history:', err);
    }
  };

  const handleReset = () => {
    setSelectedState('Andhra Pradesh');
    setDistrict('Chittoor');
    setSelectedCourt('District Court');
    setSelectedCaseType('Money Recovery Suit');
    setSelectedRelief('Money Claim Recovery');
    setSuitValue('100000');
    setMarketValue('0');
    setPropertyValue('0');
    setAgreementValue('0');
    setLoanAmount('0');
    setCompensationAmount('0');
    setCalcResult(null);
    setCalcErr('');
    addNotification('Form Reset', 'All court fee parameters reset to default.', 'info');
  };

  const handleCourtFeeCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdvocateOrAdmin) {
      addNotification('Access Restricted', 'The Court Fee Calculator is restricted exclusively to Advocates and Administrators.', 'error');
      return;
    }

    setCalcLoading(true);
    setCalcErr('');
    setCalcResult(null);

    const valSuit = Number(suitValue) || 0;
    const valMarket = Number(marketValue) || 0;
    const valProp = Number(propertyValue) || 0;
    const valAgree = Number(agreementValue) || 0;
    const valLoan = Number(loanAmount) || 0;
    const valComp = Number(compensationAmount) || 0;

    if (valSuit <= 0) {
      setCalcErr('Please enter a valid suit value greater than zero.');
      setCalcLoading(false);
      return;
    }

    if (valSuit < 0 || valMarket < 0 || valProp < 0 || valAgree < 0 || valLoan < 0 || valComp < 0) {
      setCalcErr('Valuation amounts cannot be negative values.');
      setCalcLoading(false);
      return;
    }

    const payload = {
      state: selectedState,
      district: district,
      courtForum: selectedCourt,
      suitValue: valSuit,
      stateName: selectedState,
      courtTypeName: selectedCourt,
      caseTypeName: selectedCaseType,
      reliefTypeName: selectedRelief,
      claimAmount: valSuit,
      marketValue: valMarket || valProp || valSuit,
      agreementValue: valAgree || valSuit,
      loanAmount: valLoan || valSuit,
      compensationAmount: valComp || valSuit
    };

    let calculatedSuccess = false;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/court-fee/calculate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && (data.calculation || data.courtFee !== undefined)) {
        const calculationData = data.calculation || {
          suitValuation: data.suitValue,
          calculatedFee: data.courtFee,
          feeType: data.calculationType,
          legalProvision: data.ruleReference,
          ruleReference: data.ruleReference,
          effectiveFrom: data.effectiveFrom,
          sourceName: data.sourceName,
          sourceType: data.sourceType,
          sourceReference: data.sourceReference,
          lastVerified: data.lastVerified,
          breakdown: []
        };
        setCalcResult(calculationData);
        fetchHistory();
        addNotification('Court Fee Calculated', `Statutory fee computed: ₹${calculationData.calculatedFee.toLocaleString('en-IN')}`, 'success');
        calculatedSuccess = true;
      }
    } catch (err: any) {
      console.warn('Backend court fee API error:', err);
    }

    // Client-side statutory calculation fallback if backend API returned non-OK or failed
    if (!calculatedSuccess) {
      try {
        const fallbackResult = evaluateCourtFee({
          stateName: selectedState,
          district: district,
          courtTypeName: selectedCourt,
          caseTypeName: selectedCaseType,
          reliefTypeName: selectedRelief,
          claimAmount: valSuit,
          marketValue: valMarket || valProp || valSuit,
          agreementValue: valAgree || valSuit,
          loanAmount: valLoan || valSuit,
          compensationAmount: valComp || valSuit
        }, [], []);

        setCalcResult(fallbackResult);
        addNotification('Court Fee Calculated', `Statutory fee computed: ₹${fallbackResult.calculatedFee.toLocaleString('en-IN')}`, 'success');
      } catch (fbErr: any) {
        console.error('Client fallback calculation error:', fbErr);
        setCalcErr('Unable to calculate court fee. Please check input parameters.');
      }
    }

    setCalcLoading(false);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPdf = (historyId?: string) => {
    const id = historyId || calcResult?.historyId;
    if (id) {
      window.open(`/api/calculators/court-fee/history/${id}/pdf`, '_blank');
    } else {
      window.print();
    }
  };

  const handleDownloadCsv = (historyId?: string) => {
    const id = historyId || calcResult?.historyId;
    if (id) {
      window.open(`/api/calculators/court-fee/history/${id}/csv`, '_blank');
    } else {
      addNotification('CSV Export', 'Please save or calculate fee first.', 'warning');
    }
  };

  const handleCopyCitation = () => {
    if (calcResult?.legalProvision) {
      navigator.clipboard.writeText(calcResult.legalProvision);
      addNotification('Copied Citation', 'Statutory citation copied to clipboard.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Tabs */}
      <div className="legal-card p-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleTabChange('land')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'land' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <ArrowRightLeft size={14} /> Land Measurement Calculator
        </button>

        <button
          onClick={() => handleTabChange('interest')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'interest' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <Calculator size={14} /> Interest Calculator
        </button>

        <button
          onClick={() => handleTabChange('date')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'date' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <Calendar size={14} /> Date Calculator
        </button>

        {isAdvocateOrAdmin && (
          <button
            onClick={() => handleTabChange('court')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'court' ? 'btn-premium' : 'btn-secondary'
            }`}
          >
            <Scale size={14} /> Court Fee Calculator
            <span className="ml-1 text-[9px] bg-[#A67C3B]/20 text-[#A67C3B] dark:text-[#D8C49A] border border-[#A67C3B]/30 px-1.5 py-0.5 rounded font-bold uppercase">Advocate & Admin</span>
          </button>
        )}
      </div>

      {/* 1. LAND MEASUREMENT CONVERTER TAB */}
      {activeTab === 'land' && (
        <div className="card-land p-6 animate-slide-up">
          <div className="mb-6">
            <h3 className="font-bold text-base text-[#242522] dark:text-[#F4F0E7] flex items-center gap-2 font-serif">
              <ArrowRightLeft className="text-[#B85232] dark:text-[#E88C74]" size={20} />
              Land Measurement Calculator
            </h3>
            <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-1">
              Enter a value in any measurement field below. All standard and regional land units auto-calculate instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { id: 'acre', label: 'Acres (Standard)' },
              { id: 'hectare', label: 'Hectares (SI)' },
              { id: 'cent', label: 'Cents (South India)' },
              { id: 'gunta', label: 'Guntas (Deccan/South)' },
              { id: 'bigha', label: 'Bighas (North/East)' },
              { id: 'sqYard', label: 'Square Yards' },
              { id: 'sqMeter', label: 'Square Meters' },
              { id: 'sqFeet', label: 'Square Feet' }
            ].map((unit) => (
              <div key={unit.id} className="p-4 bg-[#EFEAE0] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-xl shadow-xs">
                <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wider mb-2">
                  {unit.label}
                </label>
                <input
                  type="text"
                  value={(landValues as any)[unit.id]}
                  onChange={(e) => handleLandConvert(unit.id, e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm font-bold bg-transparent border-b border-[#D8D1C5] dark:border-[#3A4038] focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] pb-1 font-mono text-[#242522] dark:text-[#F4F0E7] placeholder:text-[#858078]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. INTEREST CALCULATOR TAB */}
      {activeTab === 'interest' && (
        <div className="animate-slide-up">
          <InterestCalculatorPage />
        </div>
      )}

      {/* 3. DATE CALCULATOR TAB */}
      {activeTab === 'date' && (
        <div className="animate-slide-up">
          <DateDifferenceCalculatorPage />
        </div>
      )}

      {/* 4. COURT FEE CALCULATOR MAIN MODULE (Advocate & Admin Only) */}
      {isAdvocateOrAdmin && activeTab === 'court' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          
          {/* Form Controls - Medium-Light Clean Architecture */}
          <div className="lg:col-span-2 legal-card p-6 sm:p-8 space-y-6 overflow-hidden bg-[#FFFDF8] dark:bg-slate-900 border border-[#E4DCCF] dark:border-slate-800 rounded-2xl shadow-sm">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-[#242522] dark:text-[#F4F0E7] font-serif flex items-center gap-2">
                  <Scale className="text-[#A67C3B] dark:text-[#C7A45A]" size={20} />
                  Enterprise Court Fee Rule Engine
                </h3>
              </div>
              <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-1 leading-relaxed">
                Computes exact statutory court fees from configured database rules across all 28 States and 8 Union Territories.
              </p>
            </div>

            <form onSubmit={handleCourtFeeCalculate} className="space-y-5">
              
              {/* State, District, Court Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wider mb-1">State / Union Territory</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="legal-input w-full block text-xs sm:text-sm font-medium"
                  >
                    <optgroup label="States">
                      {[
                        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
                        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
                        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
                        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
                        'Telangana', 'Tripura', 'Uttarakhand', 'Uttar Pradesh', 'West Bengal'
                      ].map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="Union Territories">
                      {[
                        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
                        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
                      ].map(ut => <option key={ut} value={ut}>{ut}</option>)}
                    </optgroup>
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wider mb-1">District Jurisdiction</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="legal-input w-full block text-xs sm:text-sm font-medium"
                  >
                    {(STATE_DISTRICTS[selectedState] || ['Central District', 'North District', 'South District']).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wider mb-1">Court Forum</label>
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="legal-input w-full block text-xs sm:text-sm font-medium"
                  >
                    {[
                      'District Court',
                      'Junior Civil Judge Court',
                      'Senior Civil Judge Court',
                      'Family Court',
                      'Commercial Court',
                      'Small Causes Court',
                      'High Court',
                      'Supreme Court',
                      'Consumer Commission',
                      'Other Civil Courts'
                    ].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Proceeding Case Type & Relief Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wider mb-1">Proceeding / Case Type</label>
                  <select
                    value={selectedCaseType}
                    onChange={(e) => handleCaseTypeChange(e.target.value)}
                    className="legal-input w-full block text-xs sm:text-sm font-medium"
                  >
                    {(metadata.caseTypes.length > 0 ? metadata.caseTypes.map((ct: any) => ct.name) : ALL_CASE_TYPES).map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wider mb-1">Relief Requested</label>
                  <select
                    value={selectedRelief}
                    onChange={(e) => setSelectedRelief(e.target.value)}
                    className="legal-input w-full block text-xs sm:text-sm font-medium"
                  >
                    {(CASE_RELIEF_MAP[selectedCaseType] || ['Money Claim Recovery', 'Property Market Valuation Possession', 'Fixed Title Declaration', 'Fixed Injunction Relief']).map((r: string) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Value of Suit (in Rupees) Input */}
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] uppercase tracking-wider mb-1">Value of Suit (in Rupees) *</label>
                <input
                  type="number"
                  value={suitValue}
                  onChange={(e) => setSuitValue(e.target.value)}
                  min={0}
                  placeholder="Enter suit value in Rupees"
                  className="legal-input w-full font-mono font-bold text-sm"
                />
              </div>

              {calcErr && (
                <div className="p-3.5 bg-[#F1E2DF] text-[#914F45] dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs flex gap-2 font-medium border border-red-200 dark:border-red-900/50">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{calcErr}</span>
                </div>
              )}

              {/* Action Buttons: Calculate & Reset */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={calcLoading}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#183C32] hover:bg-[#245445] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {calcLoading ? <RefreshCw className="animate-spin" size={16} /> : <Scale size={16} />}
                  <span>{calcLoading ? 'Evaluating Rules...' : 'Calculate Court Fee'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3 rounded-xl border border-[#71877B] text-[#183C32] hover:bg-[#EFEAE0] dark:text-[#C5C0B6] dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Comprehensive Result Panel */}
          <div className="legal-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xs text-[#858078] dark:text-[#969188] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={16} /> Assessment Result Panel
                </h3>

                {calcResult && (
                  <div className="flex gap-1">
                    <button
                      onClick={handleCopyCitation}
                      className="p-1.5 bg-[#EFEAE0] hover:bg-[#D8D1C5] dark:bg-[#1E211D] text-[#242522] dark:text-[#F4F0E7] rounded text-xs"
                      title="Copy Legal Citation"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => handleDownloadCsv()}
                      className="p-1.5 bg-[#EFEAE0] hover:bg-[#D8D1C5] dark:bg-[#1E211D] text-[#242522] dark:text-[#F4F0E7] rounded text-xs"
                      title="Export Excel/CSV"
                    >
                      <FileSpreadsheet size={13} />
                    </button>
                    <button
                      onClick={handlePrintReceipt}
                      className="p-1.5 bg-[#EFEAE0] hover:bg-[#D8D1C5] dark:bg-[#1E211D] text-[#242522] dark:text-[#F4F0E7] rounded text-xs"
                      title="Print Assessment"
                    >
                      <Printer size={13} />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf()}
                      className="p-1.5 bg-[#EFEAE0] hover:bg-[#D8D1C5] dark:bg-[#1E211D] text-[#242522] dark:text-[#F4F0E7] rounded text-xs"
                      title="Download PDF"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                )}
              </div>

              {calcLoading ? (
                <div className="py-8">
                  <LegalTriviaLoader loadingText="Evaluating Statutory Rules & Fee Schedules..." />
                </div>
              ) : calcResult === null ? (
                <div className="text-center py-16 text-xs text-[#858078] dark:text-[#969188] space-y-2">
                  <Scale size={36} className="mx-auto text-[#71877B]" />
                  <p>Select litigation parameters and hit calculate to evaluate statutory database rules.</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs font-mono bg-[#EFEAE0] dark:bg-[#1E211D] p-4 rounded-xl border border-[#D8D1C5] dark:border-[#3A4038]">
                  <div className="text-center border-b border-dashed border-[#D8D1C5] dark:border-[#3A4038] pb-2">
                    <p className="font-bold uppercase text-[#242522] dark:text-[#F4F0E7] font-serif">Court Fee Valuation Result</p>
                    <p className="text-[9px] text-[#858078] dark:text-[#969188] mt-0.5">Last Updated Date: {calcResult.lastUpdatedDate || new Date().toISOString().split('T')[0]}</p>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">State:</span>
                      <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{selectedState}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">Court:</span>
                      <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{selectedCourt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">Case Type:</span>
                      <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{selectedCaseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">Applicable Act:</span>
                      <span className="font-semibold text-[#183C32] dark:text-[#6F9A83]">{calcResult.actName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">Section / Provision:</span>
                      <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{calcResult.section}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">Schedule & Article:</span>
                      <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{calcResult.schedule} {calcResult.article}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">Formula Type:</span>
                      <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">{calcResult.feeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#625F58] dark:text-[#C5C0B6]">Suit Valuation:</span>
                      <span className="font-semibold text-[#242522] dark:text-[#F4F0E7]">₹{calcResult.suitValuation.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between border-t border-dashed border-[#D8D1C5] dark:border-[#3A4038] pt-2 text-sm font-bold">
                      <span className="text-[#242522] dark:text-[#F4F0E7]">FINAL COURT FEE:</span>
                      <span className="text-[#3F6B50] dark:text-[#6F9A83] font-extrabold">₹{calcResult.calculatedFee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {calcResult.warning && (
                    <div className="p-2 bg-[#F1E9D8] text-[#80632E] rounded border border-[#A67C3B]/30 text-[10px] font-sans">
                      ⚠️ {calcResult.warning}
                    </div>
                  )}

                  {calcResult.breakdown && calcResult.breakdown.length > 0 && (
                    <div className="border-t border-dashed border-[#D8D1C5] dark:border-[#3A4038] pt-2 text-[10px] space-y-1 font-sans">
                      <p className="font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wider text-[9px] mb-0.5">Intermediate Calculation Steps:</p>
                      {calcResult.breakdown.map((step: string, idx: number) => (
                        <p key={idx} className="text-[#625F58] dark:text-[#C5C0B6] leading-tight">• {step}</p>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-[#D8D1C5] dark:border-[#3A4038] pt-3 text-[10px] font-sans text-[#625F58] dark:text-[#C5C0B6] space-y-1 bg-[#FFFDF8] dark:bg-[#242822] p-2.5 rounded-lg mt-2">
                    <p className="font-bold text-[#242522] dark:text-[#F4F0E7] text-[10px]">Legal Source Reference:</p>
                    <p className="text-[#625F58] dark:text-[#C5C0B6] text-[10px]">Source: {calcResult.sourceName || 'State Court Fees Act'} ({calcResult.sourceType || 'statute'})</p>
                    <p className="text-[#858078] dark:text-[#969188] italic text-[9.5px]">"Calculated using configured legal rules. Please verify the applicable fee with the relevant court/official legal source before filing."</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
