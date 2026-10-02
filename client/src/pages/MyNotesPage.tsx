import React, { useState, useEffect } from 'react';
import { 
  StickyNote, Plus, Search, Edit3, Trash2, Eye, ShieldAlert, 
  Calendar, Clock, CheckCircle2, AlertCircle, X, Sparkles, Lock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export interface NoteItem {
  _id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const MyNotesPage: React.FC = () => {
  const { user, token } = useAuthStore();
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const roleLower = (user?.role || '').toLowerCase();
  const isAuthorized = roleLower === 'admin' || roleLower === 'advocate';

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteItem | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Form inputs
  const [titleInput, setTitleInput] = useState<string>('');
  const [contentInput, setContentInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (token && isAuthorized) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [token, isAuthorized]);

  const fetchNotes = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      } else {
        if (res.status === 403) {
          setErrorMsg(data.message || 'Access denied. My Notes is available only to Admins and authorized Advocates.');
        } else {
          setErrorMsg(data.message || 'Unable to load your notes. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setErrorMsg('Unable to load your notes. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setTitleInput('');
    setContentInput('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: NoteItem) => {
    setEditingNote(note);
    setTitleInput(note.title);
    setContentInput(note.content);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedTitle = titleInput.trim();
    const trimmedContent = contentInput.trim();

    if (!trimmedTitle) {
      setErrorMsg('Note title is required.');
      return;
    }

    if (!trimmedContent) {
      setErrorMsg('Note content is required.');
      return;
    }

    setSubmitting(true);

    try {
      const isEdit = !!editingNote;
      const url = isEdit ? `${API_BASE}/api/notes/${editingNote._id}` : `${API_BASE}/api/notes`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || (isEdit ? 'Note updated successfully.' : 'Note saved successfully.'));
        setIsModalOpen(false);
        setTitleInput('');
        setContentInput('');
        setEditingNote(null);
        fetchNotes();

        // If viewing note was updated, update viewing note state as well
        if (viewingNote && isEdit && viewingNote._id === editingNote._id) {
          setViewingNote(data.note);
        }
      } else {
        setErrorMsg(data.message || 'Unable to save the note. Please try again.');
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setErrorMsg('Unable to save the note. Please check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNoteId) return;

    setDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/notes/${deletingNoteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Note deleted permanently.');
        if (viewingNote && viewingNote._id === deletingNoteId) {
          setViewingNote(null);
        }
        setDeletingNoteId(null);
        fetchNotes();
      } else {
        setErrorMsg(data.message || 'Unable to delete the note. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setErrorMsg('Unable to delete the note. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Filter notes by search query
  const filteredNotes = notes.filter(n => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
    );
  });

  if (!isAuthorized) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Access Restricted</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto">
            My Notes is a private workspace feature available exclusively to System Administrators and Enrolled Advocates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <StickyNote className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Notes
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <Lock size={10} className="text-emerald-500" /> Private
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Keep your private legal and work-related notes organized.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer flex-shrink-0"
        >
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center justify-between gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search my notes..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Notes List / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <StickyNote size={32} />
          </div>
          {searchQuery ? (
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">No matching notes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No notes match "{searchQuery}". Try a different keyword.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">No notes yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                Create a private note to keep important details organized.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  <span>New Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm hover:shadow"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 
                    onClick={() => setViewingNote(note)}
                    className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    {note.title}
                  </h3>
                </div>

                <p 
                  onClick={() => setViewingNote(note)}
                  className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-3 whitespace-pre-wrap cursor-pointer"
                >
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 text-[11px]">
                  <Clock size={12} />
                  <span>Updated: {formatDate(note.updatedAt || note.createdAt)}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingNote(note)}
                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="View Full Note"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(note)}
                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 transition-colors"
                    title="Edit Note"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setDeletingNoteId(note._id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                <span>{editingNote ? 'Edit Note' : 'Create New Note'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g., Property Case – Client Meeting"
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Note / Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  placeholder="Discussed documents required for title verification, next court hearing preparations..."
                  rows={8}
                  maxLength={20000}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans resize-y"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW FULL NOTE MODAL */}
      {viewingNote && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Private Note</span>
              </div>
              <button
                onClick={() => setViewingNote(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {viewingNote.title}
              </h2>

              <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-y border-slate-100 dark:border-slate-800 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-500" />
                  <span>Created: {formatDateTime(viewingNote.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-sky-400" />
                  <span>Updated: {formatDateTime(viewingNote.updatedAt)}</span>
                </div>
              </div>

              <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans pt-2">
                {viewingNote.content}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <button
                onClick={() => {
                  const target = viewingNote;
                  setViewingNote(null);
                  setDeletingNoteId(target._id);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete Note</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = viewingNote;
                    setViewingNote(null);
                    handleOpenEditModal(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  <Edit3 size={14} />
                  <span>Edit Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingNoteId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Delete Note</h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Are you sure you want to delete this note? This action will permanently remove the note from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingNoteId(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
