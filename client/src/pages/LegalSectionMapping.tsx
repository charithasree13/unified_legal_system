import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  BookOpen, BookMarked, Search, ShieldCheck, Scale, ArrowRight, ArrowLeftRight, CheckCircle2, 
  HelpCircle, RefreshCw, Filter, Sparkles, FileText, Check, ExternalLink,
  Layers, AlertCircle, Info, Plus, Edit3, Trash2, Activity, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { builtInSectionMappings, type SectionMapping } from '../data/builtInSectionMappings';

export const LegalSectionMapping: React.FC = () => {
  const { user, token } = useAuthStore();

  // Access restriction: Allowed only for Admin and Advocates
  const isAuthorized = user?.role === 'Admin' || user?.role === 'Advocate';
  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  const isAdmin = user?.role === 'Admin';

  const [mappings, setMappings] = useState<SectionMapping[]>(builtInSectionMappings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Act pair: 'IPC_BNS' | 'CRPC_BNSS' | 'IEA_BSA'
  const [selectedPair, setSelectedPair] = useState<'IPC_BNS' | 'CRPC_BNSS' | 'IEA_BSA'>('IPC_BNS');

  // Direction: 'OLD_TO_NEW' (IPC -> BNS) vs 'NEW_TO_OLD' (BNS -> IPC)
  const [direction, setDirection] = useState<'OLD_TO_NEW' | 'NEW_TO_OLD'>('OLD_TO_NEW');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');
  const [mappingTypeFilter, setMappingTypeFilter] = useState('ALL');

  // Selected item ID for detailed view
  const [selectedMappingId, setSelectedMappingId] = useState<string>('');

  // Admin Quality Report Modal State
  const [showHealthReport, setShowHealthReport] = useState(false);
  const [healthReportData, setHealthReportData] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Admin Add/Edit Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: '',
    oldSectionTitle: '',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: '',
    newSectionTitle: '',
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: '',
    newSectionContent: '',
    keyChanges: '',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED'
  });

  // Fetch mappings from API with built-in fallback
  const fetchMappings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/section-mappings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setMappings(data.data);
      } else {
        setMappings(builtInSectionMappings);
      }
    } catch (err) {
      setMappings(builtInSectionMappings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  // Filter mappings based on selected pair, search, and type filter
  const filteredMappings = mappings.filter((item) => {
    const oldActText = (item.oldAct || item.legacyAct || '').toLowerCase();
    const newActText = (item.newAct || '').toLowerCase();

    // Filter by pair
    if (selectedPair === 'IPC_BNS') {
      const matchesIpcBns = (oldActText.includes('penal') || oldActText.includes('ipc')) &&
                            (newActText.includes('nyaya') || newActText.includes('bns'));
      if (!matchesIpcBns) return false;
    } else if (selectedPair === 'CRPC_BNSS') {
      const matchesCrpcBnss = (oldActText.includes('procedure') || oldActText.includes('crpc')) &&
                              (newActText.includes('nagarik') || newActText.includes('bnss'));
      if (!matchesCrpcBnss) return false;
    } else if (selectedPair === 'IEA_BSA') {
      const matchesIeaBsa = (oldActText.includes('evidence') || oldActText.includes('iea')) &&
                            (newActText.includes('sakshya') || newActText.includes('bsa'));
      if (!matchesIeaBsa) return false;
    }

    // Filter by mapping type
    if (mappingTypeFilter !== 'ALL' && item.mappingType !== mappingTypeFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanQ = q.replace(/^(section|sec\.?)\s*/i, '').trim();

      const oldSecClean = (item.oldSection || item.legacySection || '').toLowerCase().replace(/^(section|sec\.?)\s*/i, '').trim();
      const newSecClean = (item.newSection || '').toLowerCase().replace(/^(section|sec\.?)\s*/i, '').trim();

      const matchOldSec = oldSecClean === cleanQ || (item.oldSection || item.legacySection || '').toLowerCase().includes(q);
      const matchNewSec = newSecClean === cleanQ || (item.newSection || '').toLowerCase().includes(q);
      const matchOldTitle = (item.oldSectionTitle || item.legacyTitle || '').toLowerCase().includes(q);
      const matchNewTitle = (item.newSectionTitle || item.newTitle || '').toLowerCase().includes(q);
      const matchExpl = (item.mappingExplanation || item.factualNotes || '').toLowerCase().includes(q);
      const matchContent = (item.newSectionContent || '').toLowerCase().includes(q);

      if (!matchOldSec && !matchNewSec && !matchOldTitle && !matchNewTitle && !matchExpl && !matchContent) {
        return false;
      }
    }

    return true;
  });

  // Set default selected mapping when list updates
  useEffect(() => {
    if (filteredMappings.length > 0 && (!selectedMappingId || !filteredMappings.some(m => m._id === selectedMappingId))) {
      setSelectedMappingId(filteredMappings[0]._id);
    }
  }, [filteredMappings, selectedPair, direction]);

  const activeMapping = mappings.find(m => m._id === selectedMappingId) || filteredMappings[0];

  // Helper for rendering classification badges
  const renderMappingTypeBadge = (type: string) => {
    switch (type) {
      case 'DIRECT_EQUIVALENT':
      case 'DIRECT_REPLACEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 size={13} /> Direct Equivalent
          </span>
        );
      case 'MODIFIED_EQUIVALENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
            <RefreshCw size={13} /> Modified Equivalent
          </span>
        );
      case 'SPLIT':
      case 'MULTIPLE_NEW_PROVISIONS':
      case 'MULTIPLE_REPLACEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <Scale size={13} /> Split / Multiple Provisions
          </span>
        );
      case 'MERGED':
      case 'MULTIPLE_OLD_PROVISIONS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            <Layers size={13} /> Merged Provision
          </span>
        );
      case 'PARTIAL_EQUIVALENT':
      case 'PARTIAL_REPLACEMENT':
      case 'REORGANIZED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
            <Filter size={13} /> Partial Equivalent
          </span>
        );
      case 'REPEALED_OR_OMITTED':
      case 'NO_DIRECT_EQUIVALENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            <HelpCircle size={13} /> Repealed / No Direct Equivalent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Info size={13} /> {type}
          </span>
        );
    }
  };

  // Fetch Health Report
  const fetchHealthReport = async () => {
    setHealthLoading(true);
    try {
      const response = await fetch('/api/section-mappings/health/report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHealthReportData(data.report);
      }
    } catch (err) {
      console.error('Failed to load health report:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  // Open Admin modal for Create or Edit
  const handleOpenAdminModal = (item?: SectionMapping) => {
    if (item) {
      setEditingId(item._id);
      setFormData({
        oldAct: item.oldAct || item.legacyAct || 'Indian Penal Code, 1860 (IPC)',
        oldSection: item.oldSection || item.legacySection || '',
        oldSectionTitle: item.oldSectionTitle || item.legacyTitle || '',
        newAct: item.newAct || 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
        newSection: item.newSection || '',
        newSectionTitle: item.newSectionTitle || item.newTitle || '',
        mappingType: item.mappingType || 'DIRECT_EQUIVALENT',
        mappingExplanation: item.mappingExplanation || item.factualNotes || '',
        newSectionContent: item.newSectionContent || '',
        keyChanges: Array.isArray(item.keyChanges) ? item.keyChanges.join('\n') : (item.keyChanges || ''),
        sourceName: item.sourceName || 'India Code',
        sourceUrl: item.sourceUrl || 'https://www.indiacode.nic.in/',
        officialSourceUrl: item.officialSourceUrl || 'https://www.indiacode.nic.in/',
        verificationStatus: item.verificationStatus || 'VERIFIED'
      });
    } else {
      setEditingId(null);
      setFormData({
        oldAct: selectedPair === 'IPC_BNS' ? 'Indian Penal Code, 1860 (IPC)' : selectedPair === 'CRPC_BNSS' ? 'Code of Criminal Procedure, 1973 (CrPC)' : 'Indian Evidence Act, 1872 (IEA)',
        oldSection: '',
        oldSectionTitle: '',
        newAct: selectedPair === 'IPC_BNS' ? 'Bharatiya Nyaya Sanhita, 2023 (BNS)' : selectedPair === 'CRPC_BNSS' ? 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)' : 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
        newSection: '',
        newSectionTitle: '',
        mappingType: 'DIRECT_EQUIVALENT',
        mappingExplanation: '',
        newSectionContent: '',
        keyChanges: '',
        sourceName: 'India Code',
        sourceUrl: 'https://www.indiacode.nic.in/',
        officialSourceUrl: 'https://www.indiacode.nic.in/',
        verificationStatus: 'VERIFIED'
      });
    }
    setShowAdminModal(true);
  };

  // Submit Admin Form (Create/Update)
  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/section-mappings/${editingId}` : '/api/section-mappings';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        keyChanges: formData.keyChanges ? formData.keyChanges.split('\n').filter(Boolean) : []
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowAdminModal(false);
        fetchMappings();
      } else {
        alert(data.message || 'Error saving section mapping.');
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    }
  };

  // Admin Delete Mapping
  const handleDeleteMapping = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this statutory section mapping?')) return;
    try {
      const res = await fetch(`/api/section-mappings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMappings();
      } else {
        alert(data.message || 'Failed to delete section mapping.');
      }
    } catch (err: any) {
      alert('Error deleting mapping: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-primary text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-sky-500/20 text-sky-300 p-2.5 rounded-2xl backdrop-blur-md border border-sky-400/30">
                <BookOpen size={28} />
              </span>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-sky-300 font-sans">
                  Official Legal Research Tool
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Old Acts → New Acts Converter
                </h1>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowHealthReport(true); fetchHealthReport(); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 transition shadow"
                >
                  <Activity size={15} /> Data Quality Report
                </button>
                <button
                  onClick={() => handleOpenAdminModal()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition shadow"
                >
                  <Plus size={15} /> Add Mapping
                </button>
              </div>
            )}
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
            Find corresponding provisions under India's new criminal laws with statutory section mappings, detailed legal notes, and authoritative source references.
          </p>
        </div>
      </div>

      {/* 3 Major Law Transition Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Penal Code</span>
            <span className="text-[10px] font-bold text-slate-400">Commenced 01 July 2024</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            IPC, 1860 <ArrowRight size={14} className="text-slate-400" /> BNS, 2023
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Indian Penal Code, 1860 replaced by Bharatiya Nyaya Sanhita, 2023. Consolidates offences against women, bodily offences, property crimes, and mob lynching.
          </p>
          <a href="https://www.indiacode.nic.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline">
            Official Gazette Source <ExternalLink size={12} />
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Procedure Code</span>
            <span className="text-[10px] font-bold text-slate-400">Commenced 01 July 2024</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            CrPC, 1973 <ArrowRight size={14} className="text-slate-400" /> BNSS, 2023
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Code of Criminal Procedure, 1973 replaced by Bharatiya Nagarik Suraksha Sanhita, 2023. Introduces Zero FIR, e-FIR, mandatory timelines, and video remands.
          </p>
          <a href="https://www.indiacode.nic.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline">
            Official Gazette Source <ExternalLink size={12} />
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Evidence Act</span>
            <span className="text-[10px] font-bold text-slate-400">Commenced 01 July 2024</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            IEA, 1872 <ArrowRight size={14} className="text-slate-400" /> BSA, 2023
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Indian Evidence Act, 1872 replaced by Bharatiya Sakshya Adhiniyam, 2023. Expands statutory admissibility for electronic records, digital chats, and server logs.
          </p>
          <a href="https://www.indiacode.nic.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline">
            Official Gazette Source <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Converter Interactive Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
        
        {/* Act Selector & Direction Switcher Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          
          {/* Act Pair Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedPair('IPC_BNS')}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all ${
                selectedPair === 'IPC_BNS'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              IPC ↔ BNS (Penal Laws)
            </button>
            <button
              onClick={() => setSelectedPair('CRPC_BNSS')}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all ${
                selectedPair === 'CRPC_BNSS'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              CrPC ↔ BNSS (Procedure Laws)
            </button>
            <button
              onClick={() => setSelectedPair('IEA_BSA')}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all ${
                selectedPair === 'IEA_BSA'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Evidence Act ↔ BSA (Evidence Laws)
            </button>
          </div>

          {/* Bidirectional Switcher */}
          <button
            onClick={() => setDirection(prev => prev === 'OLD_TO_NEW' ? 'NEW_TO_OLD' : 'OLD_TO_NEW')}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-extrabold hover:bg-sky-100 dark:hover:bg-sky-900 transition shadow-sm"
          >
            <ArrowLeftRight size={16} />
            Direction: {direction === 'OLD_TO_NEW' 
              ? `${selectedPair === 'IPC_BNS' ? 'IPC → BNS' : selectedPair === 'CRPC_BNSS' ? 'CrPC → BNSS' : 'Evidence → BSA'}` 
              : `${selectedPair === 'IPC_BNS' ? 'BNS → IPC' : selectedPair === 'CRPC_BNSS' ? 'BNSS → CrPC' : 'BSA → Evidence'}`}
          </button>
        </div>

        {/* Search & Converter Input Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* Search Box */}
          <div className="lg:col-span-8">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Search size={15} className="text-primary dark:text-sky-400" />
              Enter Section Number or Offence Keyword (e.g. 302, 154, 65B, murder, cheating, bail, electronic evidence)
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type section number (e.g. 302, 354, 420) or keyword..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-400 transition"
              />
            </div>
          </div>

          {/* Mapping Relationship Filter */}
          <div className="lg:col-span-4">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Filter size={15} className="text-primary dark:text-sky-400" /> Mapping Type
            </label>
            <select
              value={mappingTypeFilter}
              onChange={(e) => setMappingTypeFilter(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-400 transition"
            >
              <option value="ALL">All Mapping Types</option>
              <option value="DIRECT_EQUIVALENT">Direct Equivalent</option>
              <option value="MODIFIED_EQUIVALENT">Modified Equivalent</option>
              <option value="SPLIT">Split / Multiple New Provisions</option>
              <option value="MERGED">Merged Provisions</option>
              <option value="PARTIAL_EQUIVALENT">Partial Equivalent</option>
              <option value="REPEALED_OR_OMITTED">Repealed / No Direct Equivalent</option>
            </select>
          </div>

        </div>

      </div>

      {/* Selected Provision Result Card */}
      {activeMapping && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-sky-400 dark:border-sky-800 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                {direction === 'OLD_TO_NEW' ? 'OLD → NEW CONVERSION' : 'NEW → OLD REVERSE LOOKUP'}
              </span>
              {renderMappingTypeBadge(activeMapping.mappingType)}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck size={14} /> Status: {activeMapping.verificationStatus || 'VERIFIED'}
              </span>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenAdminModal(activeMapping)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Mapping"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteMapping(activeMapping._id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete Mapping"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Side-by-Side Result Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Old Provision Card */}
            <div className={`p-6 rounded-2xl border space-y-3 transition-all ${
              direction === 'OLD_TO_NEW' 
                ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700' 
                : 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {direction === 'OLD_TO_NEW' ? 'OLD STATUTORY PROVISION' : 'CORRESPONDING OLD PROVISION'}
                </span>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                  {activeMapping.oldAct || activeMapping.legacyAct}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeMapping.oldSection || activeMapping.legacySection}
                </h2>
                <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                  {activeMapping.oldSectionTitle || activeMapping.legacyTitle}
                </h3>
              </div>
            </div>

            {/* New Provision Card */}
            <div className={`p-6 rounded-2xl border space-y-3 transition-all ${
              direction === 'OLD_TO_NEW' 
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-800' 
                : 'bg-slate-50 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  {direction === 'OLD_TO_NEW' ? 'NEW STATUTORY PROVISION' : 'TARGET NEW PROVISION'}
                </span>
                <span className="text-xs font-extrabold text-sky-900 dark:text-sky-100 bg-sky-200 dark:bg-sky-900 px-2.5 py-1 rounded-lg">
                  {activeMapping.newAct}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-950 dark:text-sky-100 tracking-tight">
                  {activeMapping.newSection}
                </h2>
                <h3 className="text-sm sm:text-base font-bold text-sky-900 dark:text-sky-200 mt-1 leading-snug">
                  {activeMapping.newSectionTitle || activeMapping.newTitle}
                </h3>
              </div>
            </div>

          </div>

          {/* Mapping Explanation Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <FileText size={15} className="text-primary dark:text-sky-400" /> Mapping Explanation & Judicial Context
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {activeMapping.mappingExplanation || activeMapping.factualNotes || 'Official statutory section transition mapping.'}
            </p>
          </div>

          {/* New Section Content Text */}
          {activeMapping.newSectionContent && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <BookMarked size={15} className="text-primary dark:text-sky-400" /> Full Text of New Provision
              </h4>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-line shadow-inner">
                {activeMapping.newSectionContent}
              </div>
            </div>
          )}

          {/* Source Reference & Verification */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Authoritative Source:</span>
              <a
                href={activeMapping.officialSourceUrl || activeMapping.sourceUrl || 'https://www.indiacode.nic.in/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                {activeMapping.sourceName || 'India Code (https://www.indiacode.nic.in/)'} <ExternalLink size={13} />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span>Verified By: <strong>{activeMapping.verifiedBy || 'Legislative Dept.'}</strong></span>
              <span>Last Verified: <strong>{activeMapping.lastVerifiedAt ? new Date(activeMapping.lastVerifiedAt).toLocaleDateString() : '2024-07-01'}</strong></span>
            </div>
          </div>

        </div>
      )}

      {/* Directory Grid of Matching Mappings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-primary dark:text-sky-400" />
            Verified Statutory Mapping Directory ({filteredMappings.length})
          </h3>
          <span className="text-xs text-slate-400">Click any record to inspect full statutory details</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2" />
            <p className="text-xs text-slate-500">Fetching statutory mappings from legal database...</p>
          </div>
        ) : filteredMappings.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No statutory mappings found matching "{searchQuery}". Try searching for section number (e.g. 302, 154) or offence name.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMappings.map((m) => {
              const isSelected = m._id === activeMapping?._id;
              const oldSec = m.oldSection || m.legacySection;
              const oldTitle = m.oldSectionTitle || m.legacyTitle;
              const newSec = m.newSection;
              const newTitle = m.newSectionTitle || m.newTitle;

              return (
                <div
                  key={m._id}
                  onClick={() => setSelectedMappingId(m._id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-sky-500/5 dark:border-sky-400 dark:bg-sky-400/10 shadow-md ring-2 ring-primary dark:ring-sky-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 mb-1">
                      <span>{direction === 'OLD_TO_NEW' ? oldSec : newSec}</span>
                      {isSelected && <Check size={14} className="text-primary dark:text-sky-400 font-bold" />}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {direction === 'OLD_TO_NEW' ? oldSec : newSec}
                      </span>
                      <ArrowRight size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="text-sm font-extrabold text-sky-600 dark:text-sky-300">
                        {direction === 'OLD_TO_NEW' ? newSec : oldSec}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1.5 font-semibold">
                      {direction === 'OLD_TO_NEW' ? oldTitle : newTitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
                    <span>{m.mappingType ? m.mappingType.replace(/_/g, ' ') : 'VERIFIED'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Legal Reference Disclaimer Notice */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium space-y-2">
        <h4 className="font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" /> Legal Reference Notice
        </h4>
        <p>
          This converter is intended strictly as a legal research and reference aid. A section correspondence does not by itself determine the law applicable to a particular case. Applicability may depend on the date of the offence, procedural stage, transitional provisions and specific facts. Always verify current law from official legislation published on India Code and seek professional legal advice where necessary.
        </p>
      </div>

      {/* Admin Mapping Health Report Modal */}
      {showHealthReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-sky-500" /> Legal Mapping Quality & Health Report
              </h3>
              <button onClick={() => setShowHealthReport(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {healthLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2" />
                <p className="text-xs text-slate-500">Generating quality health report...</p>
              </div>
            ) : healthReportData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{healthReportData.totalMappings}</div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mt-1">Total Mappings</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-300">
                    <div className="text-2xl font-extrabold">{healthReportData.verifiedMappings}</div>
                    <div className="text-[11px] font-bold uppercase mt-1">Verified</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-300">
                    <div className="text-2xl font-extrabold">{healthReportData.needsReview}</div>
                    <div className="text-[11px] font-bold uppercase mt-1">Needs Review</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{healthReportData.duplicates}</div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mt-1">Duplicates</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Secondary Source Verified:</span>
                    <strong>{healthReportData.secondarySourceVerified}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Invalid Records:</span>
                    <strong>{healthReportData.invalidRecords}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Verified Date:</span>
                    <strong>{healthReportData.lastVerifiedDate}</strong>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Primary Authority:</span>
                    <strong>{healthReportData.officialPrimarySource}</strong>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="text-right">
              <button onClick={() => setShowHealthReport(false)} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Mapping Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingId ? 'Edit Section Mapping' : 'Add New Section Mapping'}
              </h3>
              <button onClick={() => setShowAdminModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdminFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Old Act</label>
                  <input
                    type="text"
                    value={formData.oldAct}
                    onChange={(e) => setFormData({ ...formData, oldAct: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Old Section</label>
                  <input
                    type="text"
                    value={formData.oldSection}
                    onChange={(e) => setFormData({ ...formData, oldSection: e.target.value })}
                    placeholder="e.g. Section 302"
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Old Section Title</label>
                <input
                  type="text"
                  value={formData.oldSectionTitle}
                  onChange={(e) => setFormData({ ...formData, oldSectionTitle: e.target.value })}
                  placeholder="e.g. Punishment for murder"
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">New Act</label>
                  <input
                    type="text"
                    value={formData.newAct}
                    onChange={(e) => setFormData({ ...formData, newAct: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">New Section</label>
                  <input
                    type="text"
                    value={formData.newSection}
                    onChange={(e) => setFormData({ ...formData, newSection: e.target.value })}
                    placeholder="e.g. Section 103(1)"
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">New Section Title</label>
                <input
                  type="text"
                  value={formData.newSectionTitle}
                  onChange={(e) => setFormData({ ...formData, newSectionTitle: e.target.value })}
                  placeholder="e.g. Punishment for murder & Mob Lynching"
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Mapping Type</label>
                  <select
                    value={formData.mappingType}
                    onChange={(e) => setFormData({ ...formData, mappingType: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="DIRECT_EQUIVALENT">DIRECT_EQUIVALENT</option>
                    <option value="MODIFIED_EQUIVALENT">MODIFIED_EQUIVALENT</option>
                    <option value="SPLIT">SPLIT</option>
                    <option value="MERGED">MERGED</option>
                    <option value="PARTIAL_EQUIVALENT">PARTIAL_EQUIVALENT</option>
                    <option value="REPEALED_OR_OMITTED">REPEALED_OR_OMITTED</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Verification Status</label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="SECONDARY_SOURCE_VERIFIED">SECONDARY_SOURCE_VERIFIED</option>
                    <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Mapping Explanation</label>
                <textarea
                  rows={3}
                  value={formData.mappingExplanation}
                  onChange={(e) => setFormData({ ...formData, mappingExplanation: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Text of New Section</label>
                <textarea
                  rows={3}
                  value={formData.newSectionContent}
                  onChange={(e) => setFormData({ ...formData, newSectionContent: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold"
                >
                  Save Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LegalSectionMapping;
