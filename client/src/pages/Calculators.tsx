import React, { useState } from 'react';
import { Calculator, Scale, FileText, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Calculators: React.FC = () => {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'land' | 'court' | 'future'>('land');

  // -------------------------------------------------------------
  // LAND CONVERSION CALCULATOR (Reactive Multi-Field Synchronization)
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

  // Conversion rates: mapping of unit to how many Square Feet it represents
  const RATES: { [key: string]: number } = {
    sqFeet: 1,
    sqYard: 9,
    sqMeter: 10.76391,
    gunta: 1089, // 1/40 acre
    cent: 435.6, // 1/100 acre
    bigha: 27000, // standard bigha average
    acre: 43560,
    hectare: 107639.1 // 10,000 sqm
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

    // Convert input value to internal base representation: Square Feet
    const sqFeetBase = value * RATES[unit];

    // Compute all other fields from the base Square Feet
    setLandValues({
      sqFeet: parseFloat((sqFeetBase / RATES.sqFeet).toFixed(3)).toString(),
      sqYard: parseFloat((sqFeetBase / RATES.sqYard).toFixed(3)).toString(),
      sqMeter: parseFloat((sqFeetBase / RATES.sqMeter).toFixed(3)).toString(),
      gunta: parseFloat((sqFeetBase / RATES.gunta).toFixed(3)).toString(),
      cent: parseFloat((sqFeetBase / RATES.cent).toFixed(3)).toString(),
      bigha: parseFloat((sqFeetBase / RATES.bigha).toFixed(3)).toString(),
      acre: parseFloat((sqFeetBase / RATES.acre).toFixed(3)).toString(),
      hectare: parseFloat((sqFeetBase / RATES.hectare).toFixed(3)).toString(),
      [unit]: valueStr // Keep the user's exact typed string to prevent layout cursor jump
    });
  };

  // -------------------------------------------------------------
  // COURT FEE CALCULATOR (District/High/State Specific Logic)
  // -------------------------------------------------------------
  const [suitValue, setSuitValue] = useState('');
  const [courtType, setCourtType] = useState('District Court');
  const [state, setState] = useState('Delhi');
  
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);
  const [calcWarning, setCalcWarning] = useState<string | null>(null);
  const [calcBreakdown, setCalcBreakdown] = useState<string[]>([]);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcErr, setCalcErr] = useState('');

  const handleCourtFeeCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suitValue || isNaN(Number(suitValue))) {
      setCalcErr('Please enter a valid numeric Suit Valuation.');
      return;
    }

    setCalcLoading(true);
    setCalcErr('');
    setCalculatedFee(null);
    setCalcWarning(null);
    setCalcBreakdown([]);

    try {
      const res = await fetch('/api/calculators/court-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ suitValue, courtType, state })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setCalcErr(data.message || 'Fee calculation failed.');
      } else {
        setCalculatedFee(data.calculatedFee);
        setCalcWarning(data.warning || null);
        setCalcBreakdown(data.breakdown || []);
      }
    } catch (err) {
      setCalcErr('Network failed calculating court fee.');
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top selection screen */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 flex gap-2">
        <button
          onClick={() => setActiveTab('land')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'land' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowRightLeft size={14} /> Land Conversion Calculator
        </button>
        <button
          onClick={() => setActiveTab('court')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'court' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale size={14} /> Court Fee Calculator
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'future' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator size={14} /> Future Ready Modules
        </button>
      </div>

      {/* CALCULATOR VIEWS */}
      
      {activeTab === 'land' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 animate-slide-up">
          <div className="mb-6">
            <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="text-primary dark:text-sky-400" size={20} />
              Reactive Land Measurement Converter
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter a value in *any* unit field below. All other standard and regional measurements will instantly auto-calculate and adjust.
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

      {activeTab === 'court' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          
          {/* Calculation Inputs */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-2 mb-2">
              <Scale className="text-primary dark:text-sky-400" size={20} />
              Court Fee Estimator
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Compute the payable judicial stamps and registry court fees based on regional percentages and litigation valuation.
            </p>

            <form onSubmit={handleCourtFeeCalculate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Valuation of Suit (INR)</label>
                <input
                  type="number"
                  value={suitValue}
                  onChange={(e) => setSuitValue(e.target.value)}
                  required
                  min={0}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="e.g. 500000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Court Forum Jurisdiction</label>
                  <select
                    value={courtType}
                    onChange={(e) => setCourtType(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  >
                    <option>District Court</option>
                    <option>High Court</option>
                    <option>Supreme Court</option>
                    <option>Senior civil judges court</option>
                    <option>Junior civil Judges court</option>
                    <option>Judicial magistrate of 1st class</option>
                    <option>Consumers forum</option>
                    <option>DRT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">State / UT Jurisdiction</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  >
                    <optgroup label="States">
                      <option>Andhra Pradesh</option>
                      <option>Arunachal Pradesh</option>
                      <option>Assam</option>
                      <option>Bihar</option>
                      <option>Chhattisgarh</option>
                      <option>Goa</option>
                      <option>Gujarat</option>
                      <option>Haryana</option>
                      <option>Himachal Pradesh</option>
                      <option>Jharkhand</option>
                      <option>Karnataka</option>
                      <option>Kerala</option>
                      <option>Madhya Pradesh</option>
                      <option>Maharashtra</option>
                      <option>Manipur</option>
                      <option>Meghalaya</option>
                      <option>Mizoram</option>
                      <option>Nagaland</option>
                      <option>Odisha</option>
                      <option>Punjab</option>
                      <option>Rajasthan</option>
                      <option>Sikkim</option>
                      <option>Tamil Nadu</option>
                      <option>Telangana</option>
                      <option>Tripura</option>
                      <option>Uttarakhand</option>
                      <option>Uttar Pradesh</option>
                      <option>West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option>Andaman and Nicobar Islands</option>
                      <option>Chandigarh</option>
                      <option>Dadra and Nagar Haveli and Daman and Diu</option>
                      <option>Delhi</option>
                      <option>Jammu and Kashmir</option>
                      <option>Ladakh</option>
                      <option>Lakshadweep</option>
                      <option>Puducherry</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {calcErr && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex gap-2 font-medium">
                  <ShieldAlert size={16} />
                  <span>{calcErr}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={calcLoading}
                className="w-full py-2.5 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow"
              >
                {calcLoading ? 'Calculating Fee Details...' : 'Calculate Court Fee Receipt'}
              </button>
            </form>
          </div>

          {/* Fee Receipt Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                <FileText size={16} /> Fee Estimation Receipt
              </h3>

              {calculatedFee === null ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Fill in the suit value and hit calculate to generate a mock judicial receipt.
                </div>
              ) : (
                <div className="space-y-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="text-center border-b border-dashed border-slate-350 dark:border-slate-700 pb-2">
                    <p className="font-bold uppercase text-slate-900 dark:text-white">Judicial Court Registry</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Est. Receipt #L-{Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Forum:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{courtType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Litigation Value:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">INR {Number(suitValue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-350 dark:border-slate-700 pt-2 text-sm font-bold">
                      <span className="text-slate-900 dark:text-white">APPLICABLE FEE:</span>
                      <span className="text-primary dark:text-sky-400">INR {calculatedFee.toLocaleString()}</span>
                    </div>
                  </div>

                  {calcWarning && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-900/50 text-[10px] font-semibold leading-normal font-sans">
                      ⚠️ {calcWarning}
                    </div>
                  )}

                  {calcBreakdown && calcBreakdown.length > 0 && (
                    <div className="border-t border-dashed border-slate-350 dark:border-slate-700 pt-2.5 text-[10px] space-y-1 font-sans">
                      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] mb-1">Calculation Steps:</p>
                      {calcBreakdown.map((step, idx) => (
                        <p key={idx} className="text-slate-600 dark:text-slate-300 leading-normal">• {step}</p>
                      ))}
                    </div>
                  )}

                  <p className="text-[9px] text-slate-400 leading-relaxed text-center border-t border-dashed border-slate-350 dark:border-slate-700 pt-2.5 font-sans">
                    *The figures listed above are standard approximations based on state schedule guidelines. Check active court notices for updates.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* FUTURE MODULES */}
      {activeTab === 'future' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 animate-slide-up">
          <div className="mb-6">
            <h3 className="font-bold text-base text-slate-950 dark:text-white mb-1">Future Ready Calculations</h3>
            <p className="text-xs text-slate-400">
              The following modules are planned for subsequent service integrations.
            </p>
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
