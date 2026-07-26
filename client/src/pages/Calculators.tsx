import React, { useState, useEffect } from 'react';
import { 
  Calculator, Scale, FileText, ArrowRightLeft, ShieldAlert, 
  Printer, Download, History, RefreshCw, Copy, FileSpreadsheet, RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LegalTriviaLoader } from '../components/LegalTriviaLoader';

export const Calculators: React.FC = () => {
  const { token, addNotification } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'land' | 'court' | 'history' | 'future'>('court');

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
  // 2. DATABASE-DRIVEN COURT FEE CALCULATOR MODULE
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

  // Form Inputs
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Chittoor');
  const [selectedCourt, setSelectedCourt] = useState('District Court');
  const [selectedCaseType, setSelectedCaseType] = useState('Money Recovery Suit');
  const [selectedRelief, setSelectedRelief] = useState('Money Claim Recovery');

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
    fetchMetadata();
    fetchHistory();
  }, [token]);

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
      const res = await fetch('/api/calculators/court-fee/metadata');
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

    setCalcLoading(true);
    setCalcErr('');
    setCalcResult(null);

    const valSuit = Number(suitValue) || 0;
    const valMarket = Number(marketValue) || 0;
    const valProp = Number(propertyValue) || 0;
    const valAgree = Number(agreementValue) || 0;
    const valLoan = Number(loanAmount) || 0;
    const valComp = Number(compensationAmount) || 0;

    if (valSuit < 0 || valMarket < 0 || valProp < 0 || valAgree < 0 || valLoan < 0 || valComp < 0) {
      setCalcErr('Valuation amounts cannot be negative values.');
      setCalcLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/calculators/court-fee/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stateName: selectedState,
          district,
          courtTypeName: selectedCourt,
          caseTypeName: selectedCaseType,
          reliefTypeName: selectedRelief,
          claimAmount: valSuit,
          marketValue: valMarket || valProp || valSuit,
          agreementValue: valAgree || valSuit,
          loanAmount: valLoan || valSuit,
          compensationAmount: valComp || valSuit
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setCalcErr(data.message || 'Fee calculation failed.');
      } else {
        setCalcResult(data.calculation);
        fetchHistory();
        addNotification('Court Fee Calculated', `Statutory fee computed: ₹${data.calculation.calculatedFee.toLocaleString('en-IN')}`, 'success');
      }
    } catch (err) {
      setCalcErr('Network failed calculating court fee.');
    } finally {
      setCalcLoading(false);
    }
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('court')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'court' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale size={14} /> Statutory Court Fee Rule Engine
        </button>
        <button
          onClick={() => setActiveTab('land')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'land' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowRightLeft size={14} /> Land Measurement Converter
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'future' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator size={14} /> Legal Utilities
        </button>
      </div>

      {/* COURT FEE CALCULATOR MAIN MODULE */}
      {activeTab === 'court' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          
          {/* Form Controls */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <Scale className="text-primary dark:text-sky-400" size={20} />
                  Enterprise Court Fee Rule Engine
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  100% Database Driven
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Computes exact statutory court fees from configured database rules across all 28 States and 8 Union Territories.
              </p>
            </div>

            <form onSubmit={handleCourtFeeCalculate} className="space-y-4">
              
              {/* State, District, Court Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">State / Union Territory</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">District Jurisdiction</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  >
                    {(STATE_DISTRICTS[selectedState] || ['Central District', 'North District', 'South District']).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Court Forum</label>
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
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

              {/* Value of Suit (in Rupees) Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Value of Suit (in Rupees) *</label>
                <input
                  type="number"
                  value={suitValue}
                  onChange={(e) => setSuitValue(e.target.value)}
                  min={0}
                  placeholder="Enter suit value in Rupees"
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 font-mono font-bold focus:outline-none focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              {calcErr && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex gap-2 font-medium">
                  <ShieldAlert size={16} />
                  <span>{calcErr}</span>
                </div>
              )}

              {/* Action Buttons: Calculate & Reset */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={calcLoading}
                  className="flex-1 py-3 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  {calcLoading ? <RefreshCw className="animate-spin" size={16} /> : <Scale size={16} />}
                  <span>{calcLoading ? 'Evaluating Rules...' : 'Calculate Court Fee'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Comprehensive Result Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={16} /> Assessment Result Panel
                </h3>

                {calcResult && (
                  <div className="flex gap-1">
                    <button
                      onClick={handleCopyCitation}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs"
                      title="Copy Legal Citation"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => handleDownloadCsv()}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs"
                      title="Export Excel/CSV"
                    >
                      <FileSpreadsheet size={13} />
                    </button>
                    <button
                      onClick={handlePrintReceipt}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs"
                      title="Print Assessment"
                    >
                      <Printer size={13} />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf()}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs"
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
                <div className="text-center py-16 text-xs text-slate-400 space-y-2">
                  <Scale size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <p>Select litigation parameters and hit calculate to evaluate statutory database rules.</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="text-center border-b border-dashed border-slate-350 dark:border-slate-700 pb-2">
                    <p className="font-bold uppercase text-slate-900 dark:text-white">Court Fee Valuation Result</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Last Updated Date: {calcResult.lastUpdatedDate || new Date().toISOString().split('T')[0]}</p>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">State:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedState}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Court:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedCourt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Case Type:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedCaseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applicable Act:</span>
                      <span className="font-semibold text-sky-600 dark:text-sky-400">{calcResult.actName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Section / Provision:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{calcResult.section}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule & Article:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{calcResult.schedule} {calcResult.article}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Formula Type:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{calcResult.feeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Suit Valuation:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{calcResult.suitValuation.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between border-t border-dashed border-slate-350 dark:border-slate-700 pt-2 text-sm font-bold">
                      <span className="text-slate-900 dark:text-white">FINAL COURT FEE:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{calcResult.calculatedFee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {calcResult.warning && (
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded border border-amber-200 text-[10px] font-sans">
                      ⚠️ {calcResult.warning}
                    </div>
                  )}

                  {calcResult.breakdown && calcResult.breakdown.length > 0 && (
                    <div className="border-t border-dashed border-slate-350 dark:border-slate-700 pt-2 text-[10px] space-y-1 font-sans">
                      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Intermediate Calculation Steps:</p>
                      {calcResult.breakdown.map((step: string, idx: number) => (
                        <p key={idx} className="text-slate-600 dark:text-slate-300 leading-tight">• {step}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* LAND CONVERSION TAB */}
      {activeTab === 'land' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 animate-slide-up">
          <div className="mb-6">
            <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="text-primary dark:text-sky-400" size={20} />
              Reactive Land Measurement Converter
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter a value in *any* unit field below. All other standard and regional measurements will instantly auto-calculate.
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
              <div key={unit.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl shadow-sm">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {unit.label}
                </label>
                <input
                  type="text"
                  value={(landValues as any)[unit.id]}
                  onChange={(e) => handleLandConvert(unit.id, e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-800 focus:outline-none focus:border-primary pb-1 font-mono placeholder:text-slate-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FUTURE MODULES TAB */}
      {activeTab === 'future' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 animate-slide-up">
          <div className="mb-6">
            <h3 className="font-bold text-base text-slate-950 dark:text-white mb-1">Future Ready Calculations</h3>
            <p className="text-xs text-slate-400">The following legal utilities are scheduled for upcoming platform updates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Stamp Duty Calculator', desc: 'Auto calculates stamp duties based on property deeds and local state laws.' },
              { title: 'Advocate Fee Calculator', desc: 'Estimates advocate service billings based on legal chambers standard time grids.' },
              { title: 'Interest Calculator', desc: 'Computes simple and compound interest calculations on litigation awards.' },
              { title: 'Property Valuation Calculator', desc: 'Assesses land block rates and guideline values for property disputes.' },
              { title: 'Compensation Calculator', desc: 'Pre-evaluates damages and payouts under Motor Vehicle and Labour claims.' }
            ].map((mod, i) => (
              <div 
                key={i} 
                className="p-4 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl relative overflow-hidden select-none"
              >
                <span className="absolute top-2.5 right-2.5 bg-primary/10 text-primary dark:bg-sky-400/20 dark:text-sky-400 text-[8px] px-2 py-0.5 rounded font-bold uppercase">
                  Coming Soon
                </span>
                <h4 className="font-bold text-xs text-slate-400 mt-2">{mod.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
