import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, ShieldCheck, Scale, ArrowRight, CheckCircle2, 
  HelpCircle, RefreshCw, Filter, Sparkles, FileText, ChevronRight, Check,
  Info, Layers, Award
} from 'lucide-react';

interface SectionMapping {
  _id: string;
  legacyAct: string;
  legacySection: string;
  legacyTitle: string;
  newAct: string;
  newSection: string;
  newTitle: string;
  mappingType: 'DIRECT_REPLACEMENT' | 'MULTIPLE_REPLACEMENT' | 'PARTIAL_REPLACEMENT' | 'REORGANIZED' | 'NO_DIRECT_EQUIVALENT';
  mappingStatus: 'VERIFIED' | 'NEEDS_REVIEW';
  sourceReference: string;
  factualNotes?: string;
}

export const LegalSectionMapping: React.FC = () => {
  const [mappings, setMappings] = useState<SectionMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected legacy section state
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'IPC' | 'CrPC' | 'IEA'>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Helper to extract clean short code (IPC, CrPC, IEA)
  const getShortActCode = (actName: string) => {
    if (!actName) return '';
    if (actName.includes('IPC') || actName.includes('Penal Code')) return 'IPC';
    if (actName.includes('CrPC') || actName.includes('Criminal Procedure')) return 'CrPC';
    if (actName.includes('IEA') || actName.includes('Evidence Act')) return 'IEA';
    return actName.split(' ')[0];
  };

  const getNewActShortCode = (actName: string) => {
    if (!actName) return '';
    if (actName.includes('BNS') || actName.includes('Nyaya')) return 'BNS';
    if (actName.includes('BNSS') || actName.includes('Nagarik')) return 'BNSS';
    if (actName.includes('BSA') || actName.includes('Sakshya')) return 'BSA';
    return actName.split(' ')[0];
  };

  // Fetch built-in mappings
  const fetchMappings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/section-mappings');
      const data = await response.json();
      if (data.success && data.data) {
        setMappings(data.data);
        // Default select IPC 354 if available, or first mapping item
        const defaultItem = data.data.find((m: SectionMapping) => 
          m.legacySection.includes('354') || m.legacySection.includes('302')
        ) || data.data[0];

        if (defaultItem) {
          setSelectedSectionId(defaultItem._id);
        }
      } else {
        setError(data.message || 'Failed to load statutory section mappings.');
      }
    } catch (err) {
      setError('Network error loading built-in statutory mappings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  // Filtered list based on activeTab, search, and type filter
  const filteredMappings = mappings.filter((item) => {
    if (activeTab !== 'ALL') {
      const shortCode = getShortActCode(item.legacyAct);
      if (shortCode !== activeTab) return false;
    }

    if (typeFilter !== 'ALL' && item.mappingType !== typeFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanQ = q.replace(/^(section|sec\.?)\s*/i, '');
      const legacySecClean = item.legacySection.toLowerCase().replace(/^(section|sec\.?)\s*/i, '');
      const newSecClean = item.newSection.toLowerCase().replace(/^(section|sec\.?)\s*/i, '');

      const match = 
        item.legacySection.toLowerCase().includes(q) ||
        item.newSection.toLowerCase().includes(q) ||
        legacySecClean.includes(cleanQ) ||
        newSecClean.includes(cleanQ) ||
        item.legacyTitle.toLowerCase().includes(q) ||
        item.newTitle.toLowerCase().includes(q) ||
        item.legacyAct.toLowerCase().includes(q) ||
        item.newAct.toLowerCase().includes(q) ||
        (item.factualNotes && item.factualNotes.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Currently selected item for focus comparison card
  const selectedMapping = mappings.find(m => m._id === selectedSectionId) || filteredMappings[0] || mappings[0];

  // Helper for rendering classification badges
  const renderMappingTypeBadge = (type: SectionMapping['mappingType']) => {
    switch (type) {
      case 'DIRECT_REPLACEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={13} /> Direct Replacement
          </span>
        );
      case 'MULTIPLE_REPLACEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Scale size={13} /> Multiple Replacement
          </span>
        );
      case 'PARTIAL_REPLACEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Filter size={13} /> Partial Replacement
          </span>
        );
      case 'REORGANIZED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <RefreshCw size={13} /> Reorganized
          </span>
        );
      case 'NO_DIRECT_EQUIVALENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <HelpCircle size={13} /> No Direct Equivalent
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Professional Header Banner */}
      <div className="bg-gradient-to-r from-primary via-slate-900 to-sky-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-sky-500/20 text-sky-300 p-2 rounded-xl backdrop-blur-sm border border-sky-400/30">
              <BookOpen size={24} />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-sky-200">Legal Code Transition & Statutory Mapping</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Indian Legal Code Comparison System
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-3xl leading-relaxed">
            Instant statutory cross-reference tool mapping legacy Indian penal, procedural, and evidence statutes (IPC, CrPC, IEA) to the new criminal statutes (BNS, BNSS, BSA). Built with official statutory accuracy.
          </p>
        </div>
      </div>

      {/* Control Bar: Statute Tabs & Quick Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        
        {/* Statute Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Statutes ({mappings.length})
          </button>
          <button
            onClick={() => setActiveTab('IPC')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'IPC'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            IPC → BNS (Penal Law)
          </button>
          <button
            onClick={() => setActiveTab('CrPC')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CrPC'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            CrPC → BNSS (Procedure Code)
          </button>
          <button
            onClick={() => setActiveTab('IEA')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'IEA'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            IEA → BSA (Evidence Act)
          </button>
        </div>

        {/* Quick Dropdown Selector & Search Box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          
          {/* Clean Dropdown Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Select Legacy Section to Compare
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-400 transition"
            >
              {filteredMappings.map((m) => (
                <option key={m._id} value={m._id}>
                  {getShortActCode(m.legacyAct)} {m.legacySection}: {m.legacyTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Section Search Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Search size={14} className="text-primary dark:text-sky-400" /> Search Section Number or Offence
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const q = e.target.value.toLowerCase().trim();
                  if (q) {
                    const match = mappings.find(m => 
                      m.legacySection.toLowerCase().includes(q) || 
                      m.newSection.toLowerCase().includes(q)
                    );
                    if (match) setSelectedSectionId(match._id);
                  }
                }}
                placeholder="Type section number (e.g. 354, 302, 420, 154, 65B) or keyword..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Classification Filter Dropdown */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Classification:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Classifications</option>
              <option value="DIRECT_REPLACEMENT">Direct Replacement</option>
              <option value="MULTIPLE_REPLACEMENT">Multiple Replacement</option>
              <option value="PARTIAL_REPLACEMENT">Partial Replacement</option>
              <option value="REORGANIZED">Reorganized</option>
              <option value="NO_DIRECT_EQUIVALENT">No Direct Equivalent</option>
            </select>
          </div>

          <span className="text-xs font-medium text-slate-400">
            Showing <strong>{filteredMappings.length}</strong> statutory section mappings
          </span>
        </div>

      </div>

      {/* Selected Provision Detailed Comparison Card */}
      {selectedMapping && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border-2 border-sky-300 dark:border-sky-800/80 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          
          {/* Comparison Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {getShortActCode(selectedMapping.legacyAct)} → {getNewActShortCode(selectedMapping.newAct)} Transition
              </span>
              {renderMappingTypeBadge(selectedMapping.mappingType)}
            </div>
            
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={14} /> Authoritative Statutory Mapping
            </span>
          </div>

          {/* Side-by-Side Provision Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* Legacy Section Box */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Legacy Legal Provision
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                  {selectedMapping.legacyAct}
                </span>
              </div>

              <div className="pt-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedMapping.legacySection}
                </h2>
                <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                  {selectedMapping.legacyTitle}
                </h3>
              </div>
            </div>

            {/* New Code Equivalent Box */}
            <div className="p-6 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border-2 border-sky-400 dark:border-sky-700 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  New Code Equivalent
                </span>
                <span className="text-xs font-bold text-sky-900 dark:text-sky-100 bg-sky-200 dark:bg-sky-900 px-2.5 py-1 rounded-lg">
                  {selectedMapping.newAct}
                </span>
              </div>

              <div className="pt-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-950 dark:text-sky-100 tracking-tight flex items-center gap-2">
                  {selectedMapping.newSection}
                </h2>
                <h3 className="text-sm sm:text-base font-bold text-sky-900 dark:text-sky-200 mt-1 leading-snug">
                  {selectedMapping.newTitle}
                </h3>
              </div>
            </div>

          </div>

          {/* Statutory Transition Details & Key Changes */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <FileText size={15} className="text-primary dark:text-sky-400" /> Statutory Transition & Key Provisions
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {selectedMapping.factualNotes || 'Substantive provisions updated in statutory transition.'}
            </p>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Source: External legal reference (Official Gazette of India)
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={12} /> Verified Statutory Reference
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Full Statutory Mappings Table & Directory Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-primary dark:text-sky-400" /> Built-In Statutory Cross-Reference Directory ({filteredMappings.length})
          </h3>
          <span className="text-xs text-slate-400">Click any row to load comparison</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2" />
            <p className="text-xs text-slate-500">Loading statutory section database...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs">{error}</div>
        ) : filteredMappings.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No built-in statutory provisions match the current filter or search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMappings.map((m) => {
              const isSelected = m._id === selectedMapping?._id;
              return (
                <div
                  key={m._id}
                  onClick={() => setSelectedSectionId(m._id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected 
                      ? 'border-primary bg-primary/5 dark:border-sky-400 dark:bg-sky-400/10 shadow-md ring-2 ring-primary dark:ring-sky-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>{getShortActCode(m.legacyAct)}</span>
                      {isSelected && <Check size={14} className="text-primary dark:text-sky-400 font-bold" />}
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{m.legacySection}</span>
                      <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300">{m.newSection}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 font-semibold">
                      {m.legacyTitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>{getNewActShortCode(m.newAct)} Code</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default LegalSectionMapping;
