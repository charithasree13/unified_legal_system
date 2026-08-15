import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, ShieldCheck, AlertTriangle, ExternalLink, 
  Plus, Edit3, Trash2, Scale, ArrowRight, CheckCircle2, HelpCircle, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

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
  createdBy?: string;
  createdAt?: string;
}

export const LegalSectionMapping: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();

  const [mappings, setMappings] = useState<SectionMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [actFilter, setActFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SectionMapping | null>(null);
  const [formData, setFormData] = useState({
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: '',
    legacyTitle: '',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: '',
    newTitle: '',
    mappingType: 'DIRECT_REPLACEMENT' as SectionMapping['mappingType'],
    mappingStatus: 'VERIFIED' as SectionMapping['mappingStatus'],
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: ''
  });
  const [formErr, setFormErr] = useState('');

  // Fetch section mappings
  const fetchMappings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/section-mappings');
      const data = await response.json();
      if (data.success) {
        setMappings(data.data || []);
      } else {
        setError(data.message || 'Failed to load section mappings.');
      }
    } catch (err) {
      setError('Network error fetching section mappings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  // Filtered Mappings
  const filteredMappings = mappings.filter((item) => {
    // Act Filter
    if (actFilter !== 'ALL') {
      const matchesLegacy = item.legacyAct.toLowerCase().includes(actFilter.toLowerCase());
      const matchesNew = item.newAct.toLowerCase().includes(actFilter.toLowerCase());
      if (!matchesLegacy && !matchesNew) return false;
    }

    // Type Filter
    if (typeFilter !== 'ALL' && item.mappingType !== typeFilter) {
      return false;
    }

    // Status Filter
    if (statusFilter !== 'ALL' && item.mappingStatus !== statusFilter) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        item.legacySection.toLowerCase().includes(q) ||
        item.newSection.toLowerCase().includes(q) ||
        item.legacyTitle.toLowerCase().includes(q) ||
        item.newTitle.toLowerCase().includes(q) ||
        item.legacyAct.toLowerCase().includes(q) ||
        item.newAct.toLowerCase().includes(q) ||
        (item.factualNotes && item.factualNotes.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Open Modal for Creating/Editing
  const openModal = (item?: SectionMapping) => {
    setFormErr('');
    if (item) {
      setEditingItem(item);
      setFormData({
        legacyAct: item.legacyAct,
        legacySection: item.legacySection,
        legacyTitle: item.legacyTitle,
        newAct: item.newAct,
        newSection: item.newSection,
        newTitle: item.newTitle,
        mappingType: item.mappingType,
        mappingStatus: item.mappingStatus,
        sourceReference: item.sourceReference,
        factualNotes: item.factualNotes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        legacyAct: 'Indian Penal Code, 1860 (IPC)',
        legacySection: '',
        legacyTitle: '',
        newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
        newSection: '',
        newTitle: '',
        mappingType: 'DIRECT_REPLACEMENT',
        mappingStatus: 'VERIFIED',
        sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
        factualNotes: ''
      });
    }
    setShowModal(true);
  };

  // Submit Mapping Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');

    if (!formData.legacySection.trim() || !formData.newSection.trim() || !formData.legacyTitle.trim() || !formData.newTitle.trim()) {
      setFormErr('Please fill in all section numbers and provision titles.');
      return;
    }
    if (!formData.sourceReference.trim()) {
      setFormErr('Source reference URL is required for legal accuracy verification.');
      return;
    }

    try {
      const url = editingItem ? `/api/section-mappings/${editingItem._id}` : '/api/section-mappings';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();
      if (resData.success) {
        addNotification(
          editingItem ? 'Mapping Updated' : 'Mapping Added',
          `${formData.legacySection} -> ${formData.newSection} mapping saved successfully.`,
          'success'
        );
        setShowModal(false);
        fetchMappings();
      } else {
        setFormErr(resData.message || 'Error saving section mapping.');
      }
    } catch (err) {
      setFormErr('Failed to communicate with server.');
    }
  };

  // Delete Mapping
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section mapping?')) return;
    try {
      const response = await fetch(`/api/section-mappings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        addNotification(
          'Mapping Deleted',
          'Section mapping record was removed.',
          'warning'
        );
        fetchMappings();
      }
    } catch (err) {
      alert('Failed to delete section mapping.');
    }
  };

  // Render Badge for Mapping Type
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-sky-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-secondary/20 text-secondary p-2 rounded-xl backdrop-blur-sm border border-secondary/30">
              <BookOpen size={24} />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-sky-200">Legal Code Transition Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Statutory Legal Section Mapping System
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-3xl leading-relaxed">
            Factual cross-reference mapping interface between legacy statutes (IPC, CrPC, IEA) and new criminal codes (BNS, BNSS, BSA). Designed for statutory accuracy and verified legal references.
          </p>
        </div>
      </div>

      {/* Control Toolbar: Search & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by section (e.g. Section 302, Section 103), title, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-400 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {(user?.role === 'Admin' || user?.role === 'Advocate') && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                <Plus size={16} /> Add Section Mapping
              </button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Act Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Filter by Statute Pair
            </label>
            <select
              value={actFilter}
              onChange={(e) => setActFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statutes (IPC/BNS, CrPC/BNSS, IEA/BSA)</option>
              <option value="IPC">IPC → BNS (Penal Law)</option>
              <option value="CrPC">CrPC → BNSS (Procedure)</option>
              <option value="IEA">IEA → BSA (Evidence)</option>
            </select>
          </div>

          {/* Mapping Type Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Mapping Classification
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Classifications</option>
              <option value="DIRECT_REPLACEMENT">Direct Replacement</option>
              <option value="MULTIPLE_REPLACEMENT">Multiple Replacement</option>
              <option value="PARTIAL_REPLACEMENT">Partial Replacement</option>
              <option value="REORGANIZED">Reorganized</option>
              <option value="NO_DIRECT_EQUIVALENT">No Direct Equivalent</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Verification Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Mappings</option>
              <option value="NEEDS_REVIEW">Needs Review / Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Showing <strong className="text-slate-800 dark:text-slate-200">{filteredMappings.length}</strong> statutory section mappings</span>
        {statusFilter === 'NEEDS_REVIEW' && (
          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <AlertTriangle size={14} /> Unverified items displayed for review purposes only
          </span>
        )}
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-3" />
          <p className="text-sm text-slate-500">Loading statutory section mappings database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      ) : filteredMappings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No Mappings Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No legal provisions match your active search query or filter selection. Try resetting filters or searching for section numbers.
          </p>
        </div>
      ) : (
        /* Mappings List Cards */
        <div className="grid grid-cols-1 gap-4">
          {filteredMappings.map((item) => (
            <div
              key={item._id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md ${
                item.mappingStatus === 'NEEDS_REVIEW' 
                  ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                
                {/* Badges Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {renderMappingTypeBadge(item.mappingType)}

                  {item.mappingStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck size={12} /> Verified Authoritative Mapping
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <AlertTriangle size={12} /> Needs Review (Not Authoritative)
                    </span>
                  )}
                </div>

                {/* Actions for Admin / Advocate */}
                {(user?.role === 'Admin' || user?.role === 'Advocate') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Mapping"
                    >
                      <Edit3 size={16} />
                    </button>
                    {user?.role === 'Admin' && (
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Delete Mapping"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Statutory Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                
                {/* Legacy Statute Provision Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Legacy Legal Provision
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{item.legacySection}</h4>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">({item.legacyAct})</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                    {item.legacyTitle}
                  </p>
                </div>

                {/* New Code Provision Box */}
                <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
                    New Code Equivalent
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-base font-bold text-sky-950 dark:text-sky-100">{item.newSection}</h4>
                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">({item.newAct})</span>
                  </div>
                  <p className="text-xs text-sky-900 dark:text-sky-200 font-medium mt-1">
                    {item.newTitle}
                  </p>
                </div>
              </div>

              {/* Factual Notes & Source Link Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {item.factualNotes ? (
                  <p className="text-slate-600 dark:text-slate-400 italic flex-1">
                    <strong className="not-italic text-slate-700 dark:text-slate-300">Factual Notes:</strong> {item.factualNotes}
                  </p>
                ) : <div />}

                {/* Clickable Source Reference */}
                <div className="flex-shrink-0">
                  <a
                    href={item.sourceReference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary dark:text-sky-400 hover:underline font-medium bg-primary/5 dark:bg-sky-400/10 px-3 py-1 rounded-lg border border-primary/10 dark:border-sky-400/20"
                  >
                    <span>Source: External legal reference</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Mapping Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit Section Mapping' : 'Add New Legal Section Mapping'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {formErr && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-lg text-xs">
                {formErr}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              
              {/* Legacy Section Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Legacy Statute Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Legacy Act Title</label>
                    <select
                      value={formData.legacyAct}
                      onChange={(e) => setFormData({ ...formData, legacyAct: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Indian Penal Code, 1860 (IPC)">Indian Penal Code, 1860 (IPC)</option>
                      <option value="Code of Criminal Procedure, 1973 (CrPC)">Code of Criminal Procedure, 1973 (CrPC)</option>
                      <option value="Indian Evidence Act, 1872 (IEA)">Indian Evidence Act, 1872 (IEA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Legacy Section Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Section 302"
                      value={formData.legacySection}
                      onChange={(e) => setFormData({ ...formData, legacySection: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Legacy Provision Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Punishment for murder"
                    value={formData.legacyTitle}
                    onChange={(e) => setFormData({ ...formData, legacyTitle: e.target.value })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* New Statute Details */}
              <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl space-y-3">
                <h4 className="font-bold text-sky-800 dark:text-sky-300">New Code Equivalent Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-sky-700 dark:text-sky-400">New Code Title</label>
                    <select
                      value={formData.newAct}
                      onChange={(e) => setFormData({ ...formData, newAct: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Bharatiya Nyaya Sanhita, 2023 (BNS)">Bharatiya Nyaya Sanhita, 2023 (BNS)</option>
                      <option value="Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)">Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)</option>
                      <option value="Bharatiya Sakshya Adhiniyam, 2023 (BSA)">Bharatiya Sakshya Adhiniyam, 2023 (BSA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-sky-700 dark:text-sky-400">New Section Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Section 103(1)"
                      value={formData.newSection}
                      onChange={(e) => setFormData({ ...formData, newSection: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-sky-700 dark:text-sky-400">New Provision Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Punishment for murder"
                    value={formData.newTitle}
                    onChange={(e) => setFormData({ ...formData, newTitle: e.target.value })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Classification & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Mapping Classification Type</label>
                  <select
                    value={formData.mappingType}
                    onChange={(e) => setFormData({ ...formData, mappingType: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="DIRECT_REPLACEMENT">DIRECT_REPLACEMENT</option>
                    <option value="MULTIPLE_REPLACEMENT">MULTIPLE_REPLACEMENT</option>
                    <option value="PARTIAL_REPLACEMENT">PARTIAL_REPLACEMENT</option>
                    <option value="REORGANIZED">REORGANIZED</option>
                    <option value="NO_DIRECT_EQUIVALENT">NO_DIRECT_EQUIVALENT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Verification Status</label>
                  <select
                    value={formData.mappingStatus}
                    onChange={(e) => setFormData({ ...formData, mappingStatus: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="VERIFIED">VERIFIED (Authoritative)</option>
                    <option value="NEEDS_REVIEW">NEEDS_REVIEW (Unverified)</option>
                  </select>
                </div>
              </div>

              {/* Source Reference & Notes */}
              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Source Reference URL (Required)</label>
                <input
                  type="text"
                  placeholder="https://www.centurylawfirm.in/blog/legal-code-comparison-tool/"
                  value={formData.sourceReference}
                  onChange={(e) => setFormData({ ...formData, sourceReference: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Factual Notes (Concise summary)</label>
                <textarea
                  rows={2}
                  placeholder="Brief factual explanation of section changes without copying substantial copyrighted text..."
                  value={formData.factualNotes}
                  onChange={(e) => setFormData({ ...formData, factualNotes: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition shadow-sm"
                >
                  {editingItem ? 'Update Mapping' : 'Save Section Mapping'}
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
