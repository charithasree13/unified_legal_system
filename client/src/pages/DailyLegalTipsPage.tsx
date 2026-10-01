import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Plus, CheckCircle2, AlertCircle, Edit2, Trash2, ShieldAlert, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface LegalTip {
  _id: string;
  date: string; // YYYY-MM-DD
  tipText: string;
  createdBy?: string;
  createdAt?: string;
}

export const DailyLegalTipsPage: React.FC = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const roleLower = (user?.role || '').toLowerCase();
  const isAdmin = roleLower === 'admin';
  const isAdvocate = roleLower === 'advocate';

  const [tips, setTips] = useState<LegalTip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Today's date string normalized (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Admin form state
  const [inputDate, setInputDate] = useState<string>(todayStr);
  const [tipText, setTipText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (token && (isAdmin || isAdvocate)) {
      fetchLegalTips();
    } else {
      setLoading(false);
    }
  }, [token, isAdmin, isAdvocate]);

  const fetchLegalTips = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/legal-tips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTips(Array.isArray(data.tips) ? data.tips : []);
      } else {
        if (res.status === 401) {
          setErrorMsg('Please sign in to access Daily Legal Tips/Updates.');
        } else if (res.status === 403) {
          setErrorMsg(data.message || 'Daily Legal Tips/Updates are available only to enrolled advocates.');
        } else if (res.status === 404) {
          setErrorMsg('Daily Legal Tips service endpoint not found. Please try again later.');
        } else {
          setErrorMsg(data.message || 'Unable to load Daily Legal Tips/Updates. Please try again later.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching legal tips:', err);
      setErrorMsg('Unable to load Daily Legal Tips/Updates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!tipText || tipText.trim() === '') {
      setErrorMsg('Legal tip text cannot be empty.');
      return;
    }

    if (!inputDate) {
      setErrorMsg('Please select a valid date.');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId ? `/api/legal-tips/${editingId}` : '/api/legal-tips';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: inputDate,
          tipText: tipText.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || (editingId ? 'Legal tip updated successfully.' : 'Legal tip added successfully.'));
        setTipText('');
        setEditingId(null);
        setInputDate(new Date().toISOString().split('T')[0]);
        await fetchLegalTips();
      } else {
        if (res.status === 401) {
          setErrorMsg('Your session has expired. Please sign in again.');
        } else if (res.status === 403) {
          setErrorMsg(data.message || 'Only administrators can publish legal tips.');
        } else if (res.status === 409) {
          setErrorMsg('A legal tip already exists for this date.');
        } else {
          setErrorMsg(data.message || 'Failed to save legal tip. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Error saving legal tip:', err);
      setErrorMsg('Failed to save legal tip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (tip: LegalTip) => {
    setEditingId(tip._id);
    setInputDate(tip.date.split('T')[0]);
    setTipText(tip.tipText);
    setErrorMsg(null);
    setSuccessMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTipText('');
    setInputDate(new Date().toISOString().split('T')[0]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const confirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTargetId) return;

    setDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/legal-tips/${deleteTargetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Legal tip deleted successfully.');
        setDeleteTargetId(null);
        await fetchLegalTips();
      } else {
        if (res.status === 403) {
          setErrorMsg('Only administrators can delete legal tips.');
        } else {
          setErrorMsg(data.message || 'Failed to delete legal tip.');
        }
        setDeleteTargetId(null);
      }
    } catch (err: any) {
      console.error('Error deleting tip:', err);
      setErrorMsg('Failed to delete legal tip.');
      setDeleteTargetId(null);
    } finally {
      setDeleting(false);
    }
  };

  // Date Formatting Helper (e.g., "1 October 2026")
  const formatDateDisplay = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      const cleanStr = dateStr.split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${day} ${months[monthIndex]} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Identify today's tip if available
  const todayTip = tips.find(t => t.date.split('T')[0] === todayStr);
  const previousTips = tips.filter(t => t.date.split('T')[0] !== todayStr);

  // If unauthenticated or normal user
  if (!token || (!isAdmin && !isAdvocate)) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-10 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Daily Legal Tips / Updates Access Restricted
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Daily Legal Tips & Updates are reserved exclusively for enrolled Advocates and Administrators.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Back Button & Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          {isAdmin ? 'Admin Management' : 'Enrolled Advocate Channel'}
        </span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shrink-0">
            <BookOpen size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Daily Legal Tips / Updates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Daily legal practice updates and tips for enrolled advocates.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-xs font-semibold text-red-600 dark:text-red-400 animate-fade-in">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ADMIN ADD/EDIT FORM SECTION */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Plus size={16} />
              {editingId ? 'Edit Legal Tip' : 'ADD LEGAL TIP'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  DATE / MONTH / YEAR
                </label>
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  ADD LEGAL TIP (TEXT ONLY)
                </label>
                <textarea
                  value={tipText}
                  onChange={(e) => setTipText(e.target.value)}
                  placeholder="Enter daily legal tip or procedural update for advocates..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white h-24 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{submitting ? 'Saving Tip...' : editingId ? 'Update Tip' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TODAY'S LEGAL TIP SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            Today's Legal Tip
          </h2>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            {formatDateDisplay(todayStr)}
          </span>
        </div>

        {todayTip ? (
          <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Calendar size={14} />
              <span>{formatDateDisplay(todayTip.date)}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-line">
              {todayTip.tipText}
            </p>
            {todayTip.createdBy && (
              <div className="text-[10px] text-slate-400 text-right pt-1">
                Published by: {todayTip.createdBy}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              No legal tip has been published for today.
            </p>
          </div>
        )}
      </div>

      {/* ALL PREVIOUS LEGAL TIPS / UPDATES SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={16} className="text-slate-500" />
            Previous Legal Tips / Updates
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {tips.length} total tip{tips.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs font-semibold text-slate-400">
            Loading Daily Legal Tips...
          </div>
        ) : tips.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No Daily Legal Tips/Updates Yet
            </h3>
            <p className="text-xs text-slate-400">
              No legal tips have been published yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tips.map((tip) => (
              <div
                key={tip._id}
                className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Calendar size={15} />
                    <span>{formatDateDisplay(tip.date)}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(tip)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Edit Legal Tip"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(tip._id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete Legal Tip"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {tip.tipText}
                </p>

                {tip.createdBy && (
                  <div className="text-[10px] text-slate-400 text-right pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                    Published by: {tip.createdBy}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRMATION DIALOG MODAL FOR DELETE */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Delete Legal Tip
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete this legal tip? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
