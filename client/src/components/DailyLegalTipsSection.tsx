import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const roleLower = (user?.role || '').toLowerCase();
  const isAdmin = roleLower === 'admin';
  const isAdvocate = roleLower === 'advocate';

  const [tips, setTips] = useState<LegalTip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token && (isAdmin || isAdvocate)) {
      fetchLegalTips();
    } else {
      setLoading(false);
    }
  }, [token, isAdmin, isAdvocate]);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const fetchLegalTips = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/legal-tips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && (data.success || Array.isArray(data.tips) || Array.isArray(data))) {
        const tipsList = Array.isArray(data.tips) ? data.tips : (Array.isArray(data) ? data : []);
        setTips(tipsList);
        setErrorMsg(null);
      } else {
        if (res.status === 401) {
          setErrorMsg('Please sign in to access Daily Legal Tips/Updates.');
        } else if (res.status === 403) {
          setErrorMsg(data.message || 'Daily Legal Tips/Updates are available only to enrolled advocates.');
        } else {
          setErrorMsg(data.message || 'Unable to load Daily Legal Tips/Updates.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching legal tips preview:', err);
      setErrorMsg('Unable to load Daily Legal Tips/Updates.');
    } finally {
      setLoading(false);
    }
  };

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

  // Restrict access for normal users / unauthenticated
  if (!token || (!isAdmin && !isAdvocate)) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 text-center space-y-3">
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

  const latestTip = tips.length > 0 ? tips[0] : null;

  return (
    <div
      onClick={() => navigate('/daily-legal-tips')}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/40 rounded-2xl shadow-sm hover:shadow-md p-6 transition-all duration-200 cursor-pointer group space-y-4"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 group-hover:scale-105 transition-transform">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
              Daily Legal Tips / Updates
              <Sparkles size={14} className="text-amber-500 opacity-80" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stay updated with daily legal practice tips and updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
          <span>{isAdmin ? 'Manage Tips' : 'View All Tips'}</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Content Preview */}
      {loading ? (
        <div className="text-center py-6 text-xs text-slate-400">
          Loading Daily Legal Tips...
        </div>
      ) : errorMsg ? (
        <div className="text-xs text-amber-600 dark:text-amber-400 p-3 bg-amber-500/10 rounded-xl">
          {errorMsg}
        </div>
      ) : latestTip ? (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/70 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDateDisplay(latestTip.date)}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
              Latest Tip
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {latestTip.tipText}
          </p>
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
          No legal tips have been published yet. Click to manage and view all legal tips.
        </div>
      )}
    </div>
  );
};
