import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Plus, CheckCircle2, AlertCircle, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface LegalTip {
  _id: string;
  date: string; // YYYY-MM-DD
  tipText: string;
  createdBy?: string;
  createdAt?: string;
}

export const DailyLegalTipsSection: React.FC = () => {
  const { user, token } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const isAdvocate = user?.role === 'Advocate';

  const [tips, setTips] = useState<LegalTip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin form state
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tipText, setTipText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
        setTips(data.tips || []);
      } else {
        setErrorMsg(data.message || 'Unable to load Daily Legal Tips/Updates. Please try again.');
      }
    } catch (err: any) {
      console.error('Error fetching legal tips:', err);
      setErrorMsg('Unable to load Daily Legal Tips/Updates. Please try again.');
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
        setSuccessMsg(data.message || (editingId ? 'Legal tip updated successfully.' : 'Legal tip saved successfully.'));
        setTipText('');
        setEditingId(null);
        setInputDate(new Date().toISOString().split('T')[0]);
        await fetchLegalTips();
      } else {
        setErrorMsg(data.message || 'Failed to save legal tip.');
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
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTipText('');
    setInputDate(new Date().toISOString().split('T')[0]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Daily Legal Tip?')) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/legal-tips/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Legal tip deleted successfully.');
        await fetchLegalTips();
      } else {
        setErrorMsg(data.message || 'Failed to delete legal tip.');
      }
    } catch (err: any) {
      console.error('Error deleting tip:', err);
      setErrorMsg('Failed to delete legal tip.');
    }
  };

  // Date Formatting Helper (e.g., "27 September 2026")
  const formatDateDisplay = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      const parts = dateStr.split('T')[0].split('-');
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

  // If unauthenticated or normal user/client role
  if (!token || (!isAdmin && !isAdvocate)) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 text-center space-y-3">
        <div className="h-10 w-10 mx-auto rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <ShieldAlert size={20} />
        </div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Advocate & Admin Feature Restricted
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Daily Legal Tips & Updates are reserved exclusively for enrolled Advocates and Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Daily Legal Tips / Updates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAdmin 
                ? 'Manage and publish daily practice updates for enrolled Advocates.' 
                : 'Daily legal practice guidance, statutory tips, and courtroom procedure updates.'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          {isAdmin ? 'Admin Management' : 'Advocate Channel'}
        </span>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 animate-fade-in">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ADMIN CREATION / EDITING FORM */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus size={14} className="text-amber-500" />
              {editingId ? 'Edit Legal Tip' : 'Add Legal Tip'}
            </h4>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Date / Month / Year
              </label>
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Add Legal Tip (Text Only)
              </label>
              <textarea
                value={tipText}
                onChange={(e) => setTipText(e.target.value)}
                placeholder="Enter daily legal tip or procedural update for advocates..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>{submitting ? 'Saving Tip...' : editingId ? 'Update Tip' : 'Submit'}</span>
            </button>
          </div>
        </form>
      )}

      {/* CONTENT LISTING AREA */}
      <div>
        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          {isAdmin ? 'Existing Legal Tips History' : 'Recent Daily Updates'}
        </h4>

        {loading ? (
          <div className="text-center py-10 text-xs font-semibold text-slate-400">
            Loading Daily Legal Tips...
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            No Daily Legal Tips/Updates have been published yet.
          </div>
        ) : (
          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {tips.map((tip) => (
              <div
                key={tip._id}
                className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Calendar size={14} />
                    <span>{formatDateDisplay(tip.date)}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(tip)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-900 rounded-md transition-colors"
                        title="Edit Legal Tip"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(tip._id)}
                        className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-white dark:hover:bg-slate-900 rounded-md transition-colors"
                        title="Delete Legal Tip"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {tip.tipText}
                </p>

                {tip.createdBy && (
                  <div className="text-[10px] text-slate-400 text-right pt-1">
                    Published by: {tip.createdBy}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
