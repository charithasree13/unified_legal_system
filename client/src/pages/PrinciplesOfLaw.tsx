import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, X, ArrowLeft, 
  CheckCircle2, AlertCircle, ShieldAlert, Scale, Sparkles, 
  Calendar, Clock, UserCheck, FileText, ArrowRight, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getApiUrl } from '../config/api';

export interface PrincipleOfLawItem {
  _id: string;
  title: string;
  description: string;
  createdBy?: string;
  createdById?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PrinciplesOfLaw: React.FC = () => {
  const { user, token, addNotification } = useAuthStore();
  
  const roleLower = (user?.role || '').toLowerCase();
  const isAdmin = roleLower === 'admin';
  const isAdvocate = roleLower === 'advocate';

  // Core Data States
  const [principles, setPrinciples] = useState<PrincipleOfLawItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // "Read about the principle" Modal State
  const [selectedPrinciple, setSelectedPrinciple] = useState<PrincipleOfLawItem | null>(null);

  // Admin Add / Edit Form Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Admin Delete Confirmation Modal States
  const [deleteTarget, setDeleteTarget] = useState<PrincipleOfLawItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch principles on mount or token change
  useEffect(() => {
    if (token) {
      fetchPrinciples();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchPrinciples = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(getApiUrl('/api/principles-of-law'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPrinciples(Array.isArray(data.principles) ? data.principles : []);
      } else {
        if (res.status === 401) {
          setErrorMsg('Authentication required. Please sign in to access Principles of Law.');
        } else if (res.status === 403) {
          setErrorMsg(data.message || 'Access Denied: Principles of Law module is restricted exclusively to Administrators and Advocates.');
        } else {
          setErrorMsg(data.message || 'Failed to load Principles of Law from server.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching principles of law:', err);
      setErrorMsg('Unable to connect to the legal database server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Filter principles based on search query (case-insensitive title matching)
  const filteredPrinciples = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return principles;
    return principles.filter(p => p.title.toLowerCase().includes(q));
  }, [principles, searchQuery]);

  // Open "Add Principle" Form Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open "Edit Principle" Form Modal
  const handleOpenEditModal = (principle: PrincipleOfLawItem) => {
    setEditingId(principle._id);
    setFormTitle(principle.title);
    setFormDescription(principle.description);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Close Form Modal
  const handleCloseFormModal = () => {
    if (formSubmitting) return; // Prevent closing while in-flight
    setIsFormOpen(false);
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormError(null);
  };

  // Submit Add or Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation A: Title
    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a valid title for the legal principle.');
      return;
    }

    // Validation B: Description
    const trimmedDescription = formDescription.trim();
    if (!trimmedDescription) {
      setFormError('Please enter a comprehensive description explaining the legal principle.');
      return;
    }

    setFormSubmitting(true);

    try {
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? getApiUrl(`/api/principles-of-law/${editingId}`)
        : getApiUrl('/api/principles-of-law');
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addNotification(
          isEditing ? 'Principle Updated' : 'Principle Added',
          isEditing 
            ? `Principle "${trimmedTitle}" updated successfully.`
            : `Principle "${trimmedTitle}" added to the legal database.`,
          'success'
        );

        handleCloseFormModal();
        // Seamless list refresh without full page reload
        await fetchPrinciples();

        // If currently viewing details of this edited principle, update detail view too
        if (selectedPrinciple && selectedPrinciple._id === editingId && data.principle) {
          setSelectedPrinciple(data.principle);
        }
      } else {
        setFormError(data.message || 'Failed to save principle of law to database.');
      }
    } catch (err: any) {
      console.error('Error saving principle of law:', err);
      setFormError('Network communication error. Failed to save principle of law.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Initiate Delete
  const handleOpenDeleteModal = (principle: PrincipleOfLawItem) => {
    setDeleteTarget(principle);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(getApiUrl(`/api/principles-of-law/${deleteTarget._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addNotification(
          'Principle Deleted',
          `Principle "${deleteTarget.title}" deleted from the legal database.`,
          'info'
        );

        // If the deleted principle was open in read modal, close it
        if (selectedPrinciple && selectedPrinciple._id === deleteTarget._id) {
          setSelectedPrinciple(null);
        }

        setDeleteTarget(null);
        await fetchPrinciples();
      } else {
        addNotification(
          'Delete Failed',
          data.message || 'Failed to delete principle of law.',
          'error'
        );
      }
    } catch (err: any) {
      console.error('Error deleting principle of law:', err);
      addNotification(
        'Delete Error',
        'Network error while deleting principle of law.',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. MODULE HEADER & ACTIONS                                              */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A67C3B]/5 dark:bg-[#C7A45A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#183C32]/10 dark:bg-[#6F9A83]/15 text-[#183C32] dark:text-[#8FAF9C] border border-[#183C32]/20 dark:border-[#6F9A83]/30">
                <BookOpen size={13} className="text-[#A67C3B]" />
                Jurisprudence & Doctrine
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#A67C3B]/10 text-[#A67C3B] dark:text-[#D8C49A] border border-[#A67C3B]/30">
                  <UserCheck size={12} />
                  Administrator Control
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#71877B]/10 text-[#5E7468] dark:text-[#AFC9B7] border border-[#71877B]/20">
                  Advocate View: Read-Only
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#242522] dark:text-[#F4F0E7] tracking-tight">
              Principles of Law
            </h1>
            <p className="text-xs sm:text-sm text-[#625F58] dark:text-[#C5C0B6] mt-1 max-w-2xl leading-relaxed">
              Foundational legal doctrines, constitutional tenets, and maxims of jurisprudence established by statutory law and judicial precedent.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Refresh list button */}
            <button
              onClick={fetchPrinciples}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[#D8D1C5] dark:border-[#30352F] bg-[#FFFDF8] dark:bg-[#171916] hover:bg-[#EFEAE0] dark:hover:bg-[#252A24] text-[#625F58] dark:text-[#C5C0B6] transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh List"
              aria-label="Refresh principles list"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Admin Add Principle Button */}
            {isAdmin && (
              <button
                id="btn-add-principle"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#183C32] hover:bg-[#245445] text-[#FFFFFF] rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm cursor-pointer border border-[#183C32]/40 hover:shadow-md"
              >
                <Plus size={17} className="text-[#D8C49A]" />
                <span>Add Principle</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Counter Bar */}
        <div className="mt-6 pt-5 border-t border-[#D8D1C5]/70 dark:border-[#30352F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858078] dark:text-[#969188]" size={16} />
            <input
              id="input-search-principles"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search principles by title (e.g. Natural Justice, Rule of Law)..."
              className="w-full pl-10 pr-9 py-2 bg-[#F7F3EA] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl text-xs sm:text-sm text-[#242522] dark:text-[#F4F0E7] placeholder-[#858078] dark:placeholder-[#969188] focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] focus:ring-2 focus:ring-[#183C32]/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858078] hover:text-[#242522] dark:hover:text-[#F4F0E7] p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-xs text-[#625F58] dark:text-[#C5C0B6] font-medium flex items-center gap-2">
            <span>Showing <strong className="text-[#242522] dark:text-[#F4F0E7]">{filteredPrinciples.length}</strong> of <strong className="text-[#242522] dark:text-[#F4F0E7]">{principles.length}</strong> principles</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ERROR NOTIFICATION BANNER                                              */}
      {/* ========================================================================= */}
      {errorMsg && (
        <div className="bg-[#914F45]/10 border border-[#914F45]/30 rounded-xl p-4 flex items-start gap-3 text-[#914F45] dark:text-[#E5A8A0] text-xs animate-slide-up">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Error Accessing Principles of Law</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
          <button 
            onClick={fetchPrinciples}
            className="px-3 py-1 bg-[#914F45] text-white rounded text-xs font-bold hover:bg-[#7A423B] transition-colors cursor-pointer flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN LISTING: TITLE-ONLY CARDS                                        */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div 
              key={idx} 
              className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-5 animate-pulse space-y-3"
            >
              <div className="h-5 bg-[#EFEAE0] dark:bg-[#252A24] rounded-md w-3/4" />
              <div className="h-4 bg-[#EFEAE0] dark:bg-[#252A24] rounded-md w-1/2" />
              <div className="h-9 bg-[#EFEAE0] dark:bg-[#252A24] rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredPrinciples.length === 0 ? (
        /* Empty State */
        <div className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl p-10 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#A67C3B]/10 dark:bg-[#C7A45A]/15 border border-[#A67C3B]/25 flex items-center justify-center text-[#A67C3B] dark:text-[#D8C49A] mb-4">
            <BookOpen size={28} />
          </div>

          <h3 className="text-lg font-bold font-serif text-[#242522] dark:text-[#F4F0E7]">
            {searchQuery ? 'No Matching Principles Found' : 'No Principles of Law Added Yet'}
          </h3>

          <p className="text-xs sm:text-sm text-[#625F58] dark:text-[#C5C0B6] max-w-md mx-auto mt-2 leading-relaxed">
            {searchQuery
              ? `No legal principle matched your query "${searchQuery}". Try searching with another term or clear the filter.`
              : isAdmin
                ? 'As an Administrator, you have full authority to document and publish foundational principles of law for enrolled advocates to study.'
                : 'No principles of law have been published by the Administrator yet. Please check back later.'}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#EFEAE0] dark:bg-[#252A24] hover:bg-[#D8D1C5] text-[#242522] dark:text-[#F4F0E7] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            ) : isAdmin ? (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#183C32] hover:bg-[#245445] text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>Add the First Principle</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        /* Grid of Title-Only Entries */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredPrinciples.map((item) => (
            <div
              key={item._id}
              className="group bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#D8D1C5] dark:border-[#30352F] hover:border-[#A67C3B]/60 dark:hover:border-[#C7A45A]/60 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header Row: Category Badge & Admin Controls */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#A67C3B]/10 text-[#A67C3B] dark:text-[#D8C49A] border border-[#A67C3B]/25">
                    Legal Principle
                  </span>

                  {/* ADMIN-ONLY MANAGEMENT CONTROLS */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg text-[#625F58] hover:text-[#183C32] hover:bg-[#183C32]/10 dark:text-[#C5C0B6] dark:hover:text-[#8FAF9C] dark:hover:bg-[#6F9A83]/15 transition-colors cursor-pointer"
                        title={`Edit "${item.title}"`}
                        aria-label={`Edit ${item.title}`}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(item)}
                        className="p-1.5 rounded-lg text-[#625F58] hover:text-[#914F45] hover:bg-[#914F45]/10 dark:text-[#C5C0B6] dark:hover:text-[#E5A8A0] transition-colors cursor-pointer"
                        title={`Delete "${item.title}"`}
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Prominent Principle Title (Title-only requirement) */}
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#242522] dark:text-[#F4F0E7] group-hover:text-[#183C32] dark:group-hover:text-[#8FAF9C] transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>

              {/* Action Footer: "Read about the principle" Button */}
              <div className="mt-5 pt-3.5 border-t border-[#D8D1C5]/60 dark:border-[#30352F]/80 flex items-center justify-between">
                <button
                  id={`btn-read-principle-${item._id}`}
                  onClick={() => setSelectedPrinciple(item)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-[#F7F3EA] dark:bg-[#171916] hover:bg-[#183C32] hover:text-white dark:hover:bg-[#6F9A83] dark:hover:text-[#151815] text-[#183C32] dark:text-[#8FAF9C] border border-[#D8D1C5] dark:border-[#30352F] text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs group/btn"
                >
                  <span>Read about the principle</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DETAIL MODAL: "READ ABOUT THE PRINCIPLE"                              */}
      {/* ========================================================================= */}
      {selectedPrinciple && (
        <div 
          className="fixed inset-0 z-50 bg-[#171916]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="principle-detail-title"
        >
          <div className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-[#183C32] text-[#FFFDF8] px-6 py-4 flex items-center justify-between border-b border-[#A67C3B]/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#A67C3B]/20 text-[#D8C49A] border border-[#A67C3B]/30">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-[#D8C49A]">
                    Legal Principle Detailed Record
                  </span>
                  <h2 id="principle-detail-title" className="font-serif font-bold text-base sm:text-lg leading-tight text-[#FFFDF8] line-clamp-1">
                    {selectedPrinciple.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedPrinciple(null)}
                className="p-1.5 rounded-lg text-[#FFFDF8]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close reading view"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Comfortable Reading Typography */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-[#242522] dark:text-[#F4F0E7]">
              
              {/* Full Title Banner */}
              <div className="border-b border-[#D8D1C5] dark:border-[#30352F] pb-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#A67C3B] dark:text-[#C7A45A]">
                  Principle of Law
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#242522] dark:text-[#F4F0E7] mt-1 leading-snug">
                  {selectedPrinciple.title}
                </h1>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#625F58] dark:text-[#C5C0B6] mt-3">
                  {selectedPrinciple.createdAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#A67C3B]" />
                      Recorded on {new Date(selectedPrinciple.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  {selectedPrinciple.createdBy && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserCheck size={13} className="text-[#183C32] dark:text-[#8FAF9C]" />
                      Authorized by {selectedPrinciple.createdBy}
                    </span>
                  )}
                </div>
              </div>

              {/* Full Description with preserved paragraphs and line breaks */}
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-sm sm:text-base leading-relaxed text-[#242522] dark:text-[#F4F0E7] font-normal whitespace-pre-wrap font-sans space-y-4">
                  {selectedPrinciple.description}
                </div>
              </div>

              {/* Read-Only Notice for Advocates */}
              {!isAdmin && (
                <div className="mt-8 p-3.5 rounded-xl bg-[#EFEAE0]/70 dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] flex items-center gap-2.5 text-xs text-[#625F58] dark:text-[#C5C0B6]">
                  <Scale size={16} className="text-[#A67C3B] flex-shrink-0" />
                  <span>
                    Advocate Study Record. The content displayed above is authenticated and curated by the System Administrator.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#EFEAE0]/50 dark:bg-[#171916] px-6 py-4 border-t border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-between">
              <div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      const toEdit = selectedPrinciple;
                      setSelectedPrinciple(null);
                      handleOpenEditModal(toEdit);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#183C32] dark:text-[#8FAF9C] hover:bg-[#183C32]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>Edit this principle</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedPrinciple(null)}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#183C32] hover:bg-[#245445] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft size={15} />
                <span>Back to Listing</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMIN MODAL: ADD / EDIT PRINCIPLE FORM                                */}
      {/* ========================================================================= */}
      {isFormOpen && isAdmin && (
        <div 
          className="fixed inset-0 z-50 bg-[#171916]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-slide-up">
            
            {/* Form Header */}
            <div className="bg-[#183C32] text-white px-6 py-4 flex items-center justify-between border-b border-[#A67C3B]/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#A67C3B]/20 text-[#D8C49A]">
                  {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  {editingId ? 'Edit Principle of Law' : 'Add New Principle of Law'}
                </h3>
              </div>

              <button
                onClick={handleCloseFormModal}
                disabled={formSubmitting}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              
              {/* Error banner inside form */}
              {formError && (
                <div className="p-3 bg-[#914F45]/10 border border-[#914F45]/30 rounded-xl text-xs text-[#914F45] dark:text-[#E5A8A0] flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Field A: Title */}
              <div className="space-y-1.5">
                <label htmlFor="form-principle-title" className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wider">
                  Title of Legal Principle <span className="text-[#914F45]">*</span>
                </label>
                <input
                  id="form-principle-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Natural Justice, Rule of Law, Separation of Powers..."
                  disabled={formSubmitting}
                  className="w-full px-3.5 py-2.5 bg-[#F7F3EA] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl text-xs sm:text-sm text-[#242522] dark:text-[#F4F0E7] placeholder-[#858078] dark:placeholder-[#969188] focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] focus:ring-2 focus:ring-[#183C32]/10 transition-all disabled:opacity-60"
                  required
                />
                <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6]">
                  A concise and authoritative title for the doctrine or principle.
                </p>
              </div>

              {/* Field B: Description */}
              <div className="space-y-1.5">
                <label htmlFor="form-principle-description" className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7] uppercase tracking-wider">
                  Complete Description & Jurisprudence <span className="text-[#914F45]">*</span>
                </label>
                <textarea
                  id="form-principle-description"
                  rows={8}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter detailed explanation of the legal principle, statutory origin, landmark precedents, and rules of application. Paragraph breaks and line spacing will be preserved..."
                  disabled={formSubmitting}
                  className="w-full px-3.5 py-2.5 bg-[#F7F3EA] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl text-xs sm:text-sm text-[#242522] dark:text-[#F4F0E7] placeholder-[#858078] dark:placeholder-[#969188] focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] focus:ring-2 focus:ring-[#183C32]/10 transition-all font-sans leading-relaxed disabled:opacity-60"
                  required
                />
                <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6]">
                  Accommodates comprehensive multiline text and paragraphs. Line breaks, indentation, and formatting are preserved.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  disabled={formSubmitting}
                  className="px-4 py-2 border border-[#D8D1C5] dark:border-[#30352F] text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#EFEAE0] dark:hover:bg-[#252A24] rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#183C32] hover:bg-[#245445] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Submit Principle'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ADMIN MODAL: DELETE CONFIRMATION DIALOG                               */}
      {/* ========================================================================= */}
      {deleteTarget && isAdmin && (
        <div 
          className="fixed inset-0 z-50 bg-[#171916]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up space-y-4">
            
            <div className="w-12 h-12 rounded-xl bg-[#914F45]/15 text-[#914F45] dark:text-[#E5A8A0] border border-[#914F45]/30 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#242522] dark:text-[#F4F0E7]">
                Delete Principle of Law?
              </h3>
              <p className="text-xs sm:text-sm text-[#625F58] dark:text-[#C5C0B6] leading-relaxed">
                Are you sure you want to delete the legal principle <strong className="text-[#242522] dark:text-[#F4F0E7]">"{deleteTarget.title}"</strong>?
              </p>
              <p className="text-[11px] text-[#914F45] dark:text-[#E5A8A0] font-semibold pt-1">
                This record will be permanently removed from the database and will no longer be visible to advocates.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 border border-[#D8D1C5] dark:border-[#30352F] text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#EFEAE0] dark:hover:bg-[#252A24] rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#914F45] hover:bg-[#7A423B] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isDeleting && <RefreshCw size={13} className="animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Principle'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
