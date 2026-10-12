import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScrollText, Plus, Search, Trash2, X, ExternalLink, 
  AlertCircle, CheckCircle2, ShieldAlert, Sparkles, 
  Calendar, RefreshCw, Link2, Globe, Shield, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getApiUrl } from '../config/api';

export interface JudiciaryNoteItem {
  _id: string;
  title: string;
  link: string;
  url?: string;
  createdBy?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const JudiciaryNotes: React.FC = () => {
  const { user, token, addNotification } = useAuthStore();

  const roleLower = (user?.role || '').toLowerCase();
  const isAdmin = roleLower === 'admin';
  const isAdvocate = roleLower === 'advocate';

  // Core Data States
  const [notes, setNotes] = useState<JudiciaryNoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin Add Form Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formLink, setFormLink] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Admin Delete Confirmation Modal States
  const [deleteTarget, setDeleteTarget] = useState<JudiciaryNoteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // URL Validation helper (frontend)
  const validateUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('file:') ||
      lower.startsWith('blob:')
    ) {
      return false;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Helper to extract clean domain for display
  const getDisplayDomain = (url: string): string => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return 'external-resource';
    }
  };

  // Fetch Judiciary Notes on mount or token change
  useEffect(() => {
    if (token) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchNotes = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(getApiUrl('/api/judiciary-notes'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNotes(Array.isArray(data.notes) ? data.notes : []);
      } else {
        if (res.status === 401) {
          setErrorMsg('Authentication required. Please sign in to access Judiciary Notes.');
        } else if (res.status === 403) {
          setErrorMsg(data.message || 'Access Denied: Judiciary Notes module is restricted exclusively to Administrators and Advocates.');
        } else {
          setErrorMsg(data.message || 'Failed to load Judiciary Notes from server.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching judiciary notes:', err);
      setErrorMsg('Unable to connect to the legal database server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Filter notes based on search query (case-insensitive title matching)
  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n => n.title.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  // Open "Add Judiciary Note" Modal
  const handleOpenAddModal = () => {
    setFormTitle('');
    setFormLink('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Close Add Modal
  const handleCloseAddModal = () => {
    if (formSubmitting) return; // Prevent closing while in-flight
    setIsAddModalOpen(false);
    setFormTitle('');
    setFormLink('');
    setFormError(null);
  };

  // Submit Add Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation A: Title
    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a valid title for the judiciary note.');
      return;
    }

    // Validation B: Link
    const trimmedLink = formLink.trim();
    if (!trimmedLink) {
      setFormError('Please enter the URL link associated with this judiciary note.');
      return;
    }

    if (!validateUrl(trimmedLink)) {
      setFormError('Please enter a valid HTTP or HTTPS website URL (e.g., https://example.gov.in). Unsafe schemes like javascript: are strictly forbidden.');
      return;
    }

    setFormSubmitting(true);

    try {
      const res = await fetch(getApiUrl('/api/judiciary-notes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: trimmedTitle,
          link: trimmedLink
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addNotification(
          'Judiciary Note Added',
          `"${trimmedTitle}" has been saved and published to the directory.`,
          'success'
        );
        setIsAddModalOpen(false);
        setFormTitle('');
        setFormLink('');
        // Update state immediately without full page reload
        if (data.note) {
          setNotes(prev => [data.note, ...prev]);
        } else {
          fetchNotes();
        }
      } else {
        setFormError(data.message || 'Failed to save judiciary note. Please try again.');
      }
    } catch (err: any) {
      console.error('Error adding judiciary note:', err);
      setFormError('Network communication error while saving note.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (note: JudiciaryNoteItem) => {
    setDeleteTarget(note);
  };

  // Close Delete Modal
  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  // Confirm Delete Note
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const targetTitle = deleteTarget.title;
    const targetId = deleteTarget._id;

    try {
      const res = await fetch(getApiUrl(`/api/judiciary-notes/${targetId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addNotification(
          'Judiciary Note Deleted',
          `"${targetTitle}" was removed successfully.`,
          'info'
        );
        // Remove immediately from state without full page reload
        setNotes(prev => prev.filter(n => n._id !== targetId));
        setDeleteTarget(null);
      } else {
        addNotification(
          'Deletion Failed',
          data.message || 'Unable to delete judiciary note record.',
          'error'
        );
      }
    } catch (err: any) {
      console.error('Error deleting judiciary note:', err);
      addNotification(
        'Deletion Error',
        'Network error occurred while deleting the note.',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Keyboard shortcut to close modals with ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen && !formSubmitting) setIsAddModalOpen(false);
        if (deleteTarget && !isDeleting) setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, formSubmitting, deleteTarget, isDeleting]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E2420] via-[#183C32] to-[#121A15] dark:from-[#171916] dark:via-[#19231D] dark:to-[#111613] p-6 sm:p-8 text-[#F7F3EA] border border-[#A67C3B]/40 shadow-lg">
        {/* Decorative background aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A67C3B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-[#6F9A83]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A67C3B]/20 border border-[#A67C3B]/40 text-[#D8C49A] text-xs font-semibold uppercase tracking-wider mb-3">
              <ScrollText size={14} className="text-[#D8C49A]" />
              <span>Judicial Reference Directory</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-[#F7F3EA] tracking-tight">
              Judiciary Notes
            </h1>
            
            <p className="mt-2 text-xs sm:text-sm text-[#D8D1C5] leading-relaxed">
              Curated repository of official judiciary resource links, high court decisions, constitutional benchmarks, and authoritative legal updates for legal practitioners.
            </p>

            <div className="mt-4 flex items-center gap-3 text-xs text-[#C5C0B6]">
              <span className="flex items-center gap-1.5 font-medium">
                <Shield size={14} className="text-[#A67C3B]" />
                {isAdmin ? 'Admin Management Mode' : 'Advocate Read-Only Access'}
              </span>
              <span className="text-[#858078]">•</span>
              <span>{notes.length} {notes.length === 1 ? 'Resource' : 'Resources'} Published</span>
            </div>
          </div>

          {/* Admin "Add Judiciary Note" Primary Button */}
          {isAdmin && (
            <div className="flex-shrink-0">
              <button
                onClick={handleOpenAddModal}
                className="btn-premium flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                id="btn-add-judiciary-note"
              >
                <Plus size={16} className="text-[#183C32]" />
                <span>Add Judiciary Note</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SEARCH & CONTROLS TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search judiciary notes by title..."
            className="w-full pl-9 pr-9 py-2 text-xs bg-[#EFEAE0]/60 dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7] placeholder:text-[#858078] dark:placeholder:text-[#969188] transition-colors"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188] pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[#858078] hover:text-[#242522] dark:hover:text-[#F4F0E7] p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Counter and Refresh */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
            Showing <strong className="text-[#242522] dark:text-[#F4F0E7]">{filteredNotes.length}</strong> of {notes.length}
          </span>
          <button
            onClick={fetchNotes}
            disabled={loading}
            className="p-2 rounded-lg bg-[#EFEAE0]/70 dark:bg-[#242822] hover:bg-[#D8D1C5] dark:hover:bg-[#2B3029] text-[#625F58] dark:text-[#C5C0B6] transition-colors cursor-pointer"
            title="Refresh listing"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ERROR BANNER (IF ANY) */}
      {/* ------------------------------------------------------------- */}
      {errorMsg && (
        <div className="bg-[#914F45]/10 border border-[#914F45]/30 rounded-xl p-4 flex items-center justify-between gap-3 text-[#914F45] text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={fetchNotes} 
            className="underline font-bold hover:text-[#6E3B33] cursor-pointer flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN CONTENT AREA: NOTES LISTING */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div className="p-12 text-center bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl shadow-xs">
          <div className="inline-block p-4 rounded-full bg-[#183C32]/10 dark:bg-[#6F9A83]/15 text-[#183C32] dark:text-[#6F9A83] mb-3 animate-pulse">
            <ScrollText size={32} />
          </div>
          <p className="text-sm font-semibold text-[#242522] dark:text-[#F4F0E7]">
            Loading Judiciary Notes...
          </p>
          <p className="text-xs text-[#858078] dark:text-[#969188] mt-1">
            Retrieving judicial resources and links from the verified database.
          </p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFDF8] dark:bg-[#1E211D] border border-dashed border-[#D8D1C5] dark:border-[#3A4038] rounded-2xl shadow-xs">
          <div className="inline-block p-4 rounded-full bg-[#EFEAE0] dark:bg-[#242822] text-[#858078] dark:text-[#969188] mb-3">
            <ScrollText size={36} />
          </div>

          {searchQuery ? (
            <>
              <h3 className="text-base font-bold font-serif text-[#242522] dark:text-[#F4F0E7]">
                No matching judiciary notes found
              </h3>
              <p className="text-xs text-[#858078] dark:text-[#969188] mt-1 max-w-sm mx-auto">
                No notes matched your search query "{searchQuery}". Try searching with different terms.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-lg bg-[#EFEAE0] dark:bg-[#242822] text-xs font-semibold text-[#183C32] dark:text-[#D4DED7] hover:bg-[#D8D1C5] cursor-pointer"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold font-serif text-[#242522] dark:text-[#F4F0E7]">
                No judiciary notes published yet
              </h3>
              <p className="text-xs text-[#858078] dark:text-[#969188] mt-1 max-w-md mx-auto">
                {isAdmin 
                  ? 'Add the first judicial resource note to make it accessible to advocates across the platform.'
                  : 'Judiciary reference notes and resource links published by the administration will appear here.'
                }
              </p>
              {isAdmin && (
                <button
                  onClick={handleOpenAddModal}
                  className="mt-5 btn-premium inline-flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Plus size={14} className="text-[#183C32]" />
                  <span>Add First Judiciary Note</span>
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredNotes.map((note) => {
            const destinationUrl = note.link || note.url || '#';
            const domain = getDisplayDomain(destinationUrl);

            return (
              <div
                key={note._id}
                className="group relative bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] hover:border-[#183C32]/60 dark:hover:border-[#6F9A83]/60 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                {/* Note Header & Title */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Badge Icon */}
                    <div className="h-9 w-9 rounded-lg bg-[#183C32]/10 dark:bg-[#6F9A83]/15 text-[#183C32] dark:text-[#8FAF9C] flex items-center justify-center flex-shrink-0 group-hover:bg-[#183C32] group-hover:text-[#F7F3EA] dark:group-hover:bg-[#6F9A83] dark:group-hover:text-[#121A15] transition-colors">
                      <ScrollText size={18} />
                    </div>

                    {/* Admin Delete Action Button (Admin ONLY) */}
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenDeleteModal(note)}
                        className="p-1.5 rounded-md text-[#858078] hover:text-[#914F45] hover:bg-[#914F45]/10 dark:hover:bg-[#914F45]/20 transition-colors cursor-pointer"
                        title="Delete Judiciary Note"
                        aria-label={`Delete ${note.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Title Prominently Displayed */}
                  <h3 className="font-serif font-bold text-base text-[#242522] dark:text-[#F4F0E7] line-clamp-2 leading-snug group-hover:text-[#183C32] dark:group-hover:text-[#C7A45A] transition-colors">
                    {note.title}
                  </h3>

                  {/* Clean Domain / Link Origin Indicator */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#858078] dark:text-[#969188] overflow-hidden">
                    <Globe size={12} className="flex-shrink-0 text-[#A67C3B]" />
                    <span className="truncate">{domain}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-[#D8D1C5]/60 dark:border-[#30352F]/70 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#A67C3B] dark:text-[#C7A45A]">
                    Judicial Link
                  </span>

                  {/* Open Note External Link Action */}
                  <a
                    href={destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#183C32] dark:text-[#D4DED7] bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#183C32] hover:text-[#FFFDF8] dark:hover:bg-[#6F9A83] dark:hover:text-[#121A15] transition-all cursor-pointer shadow-2xs"
                    title={`Open ${note.title} in new tab`}
                  >
                    <span>Open Note</span>
                    <ArrowUpRight size={14} className="flex-shrink-0" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. ADMIN FORM MODAL: ADD JUDICIARY NOTE */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171916]/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-title"
        >
          <div className="bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#A67C3B]/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#EFEAE0]/80 dark:bg-[#171916] border-b border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#183C32]/10 dark:bg-[#6F9A83]/15 text-[#183C32] dark:text-[#8FAF9C] flex items-center justify-center">
                  <ScrollText size={20} />
                </div>
                <div>
                  <h3 id="modal-add-title" className="font-serif font-bold text-lg text-[#242522] dark:text-[#F4F0E7]">
                    Add Judiciary Note
                  </h3>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
                    Publish a new judicial resource or portal link for advocates.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseAddModal}
                disabled={formSubmitting}
                className="p-1.5 rounded-lg text-[#858078] hover:text-[#242522] dark:hover:text-[#F4F0E7] hover:bg-[#D8D1C5] dark:hover:bg-[#2B3029] transition-colors cursor-pointer"
                title="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
              
              {/* Validation Error Banner */}
              {formError && (
                <div className="p-3.5 bg-[#914F45]/10 border border-[#914F45]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#914F45]">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Field A: Title */}
              <div>
                <label htmlFor="judiciary-note-title" className="block text-xs font-bold uppercase tracking-wider text-[#625F58] dark:text-[#C5C0B6] mb-1.5">
                  Title <span className="text-[#914F45]">*</span>
                </label>
                <input
                  id="judiciary-note-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Supreme Court Judgments Portal"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#EFEAE0]/50 dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7] placeholder:text-[#858078] dark:placeholder:text-[#969188] transition-colors"
                  disabled={formSubmitting}
                  autoFocus
                />
                <p className="mt-1 text-[11px] text-[#858078] dark:text-[#969188]">
                  Identifies the judiciary note or linked judicial resource in the listing.
                </p>
              </div>

              {/* Field B: Link */}
              <div>
                <label htmlFor="judiciary-note-link" className="block text-xs font-bold uppercase tracking-wider text-[#625F58] dark:text-[#C5C0B6] mb-1.5">
                  Associated Link <span className="text-[#914F45]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="judiciary-note-link"
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://main.sci.gov.in"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#EFEAE0]/50 dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7] placeholder:text-[#858078] dark:placeholder:text-[#969188] transition-colors"
                    disabled={formSubmitting}
                  />
                  <Link2 size={15} className="absolute left-3 top-3 text-[#858078] dark:text-[#969188] pointer-events-none" />
                </div>
                <p className="mt-1 text-[11px] text-[#858078] dark:text-[#969188]">
                  Enter the actual HTTP or HTTPS URL associated with this note.
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  disabled={formSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#EFEAE0] dark:hover:bg-[#2B3029] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-premium flex items-center gap-2 px-5 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-[#183C32]" />
                      <span>Saving Note...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="text-[#183C32]" />
                      <span>Save Judiciary Note</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. ADMIN CONFIRMATION MODAL: DELETE JUDICIARY NOTE */}
      {/* ------------------------------------------------------------- */}
      {deleteTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171916]/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
        >
          <div className="bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#914F45]/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#914F45]/10 border-b border-[#914F45]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#914F45]/20 text-[#914F45] flex items-center justify-center flex-shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 id="modal-delete-title" className="font-serif font-bold text-base text-[#242522] dark:text-[#F4F0E7]">
                    Delete Judiciary Note
                  </h3>
                  <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6]">
                    Administrator record removal confirmation
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="p-1 rounded-lg text-[#858078] hover:text-[#242522] dark:hover:text-[#F4F0E7] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-3">
              <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] leading-relaxed">
                Are you sure you want to permanently delete the following judiciary note?
              </p>

              {/* Identified Note Card */}
              <div className="p-3.5 bg-[#EFEAE0]/80 dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#3A4038] rounded-xl">
                <h4 className="font-serif font-bold text-sm text-[#242522] dark:text-[#F4F0E7]">
                  "{deleteTarget.title}"
                </h4>
                <p className="text-[11px] text-[#858078] dark:text-[#969188] truncate mt-1">
                  {deleteTarget.link}
                </p>
              </div>

              <p className="text-[11px] text-[#914F45] font-medium">
                This action cannot be undone. The note will be immediately removed from both admin and advocate views.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 bg-[#EFEAE0]/40 dark:bg-[#171916]/50 border-t border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#EFEAE0] dark:hover:bg-[#2B3029] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#914F45] hover:bg-[#7D3E35] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JudiciaryNotes;
