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
      <div className="bg-[#FFFDF8] dark:bg-[#242822] border border-[#D8D1C5] dark:border-[#3A4038] rounded-2xl shadow-xs p-6 text-center space-y-3">
        <div className="h-10 w-10 mx-auto rounded-full bg-[#F1E9D8] dark:bg-[#332A19] text-[#A67C3B] dark:text-[#C7A45A] flex items-center justify-center font-bold">
          <ShieldAlert size={20} />
        </div>
        <h3 className="font-bold text-sm text-[#242522] dark:text-[#F4F0E7]">
          Advocate & Admin Feature Restricted
        </h3>
        <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] max-w-sm mx-auto">
          Daily Legal Tips & Updates are reserved exclusively for enrolled Advocates and Administrators.
        </p>
      </div>
    );
  }

  const latestTip = tips.length > 0 ? tips[0] : null;

  return (
    <div
      onClick={() => navigate('/daily-legal-tips')}
      className="bg-[#FFFDF8] dark:bg-[#242822] border border-[#D8D1C5] dark:border-[#3A4038] hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] hover:border-[#71877B] dark:hover:border-[#6F9A83] rounded-2xl shadow-xs hover:shadow-md p-6 transition-all duration-200 cursor-pointer group space-y-4"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F1E9D8] dark:bg-[#332A19] text-[#A67C3B] dark:text-[#C7A45A] border border-[#D8D1C5] dark:border-[#3A4038] group-hover:scale-105 transition-transform">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#242522] dark:text-[#F4F0E7] group-hover:text-[#183C32] dark:group-hover:text-[#6F9A83] transition-colors flex items-center gap-2">
              Daily Legal Tips / Updates
              <Sparkles size={14} className="text-[#A67C3B] dark:text-[#C7A45A] opacity-80" />
            </h3>
            <p className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
              Stay updated with daily legal practice tips and updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#A67C3B] dark:text-[#C7A45A] group-hover:translate-x-1 transition-transform">
          <span>{isAdmin ? 'Manage Tips' : 'View All Tips'}</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Content Preview */}
      {loading ? (
        <div className="text-center py-6 text-xs text-[#858078] dark:text-[#969188]">
          Loading Daily Legal Tips...
        </div>
      ) : errorMsg ? (
        <div className="text-xs text-[#80632E] dark:text-[#D8C49A] p-3 bg-[#F1E9D8] dark:bg-[#332A19] rounded-xl border border-[#D8D1C5] dark:border-[#3A4038]">
          {errorMsg}
        </div>
      ) : latestTip ? (
        <div className="p-4 bg-[#EFEAE0]/60 dark:bg-[#1E211D] rounded-xl border border-[#D8D1C5] dark:border-[#3A4038] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#A67C3B] dark:text-[#C7A45A] flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDateDisplay(latestTip.date)}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F1E9D8] dark:bg-[#332A19] text-[#80632E] dark:text-[#D8C49A]">
              Latest Tip
            </span>
          </div>
          <p className="text-xs text-[#242522] dark:text-[#F4F0E7] line-clamp-2 leading-relaxed">
            {latestTip.tipText}
          </p>
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-[#858078] dark:text-[#969188] bg-[#EFEAE0]/60 dark:bg-[#1E211D] rounded-xl border border-[#D8D1C5] dark:border-[#3A4038]">
          No legal tips have been published yet. Click to manage and view all legal tips.
        </div>
      )}
    </div>
  );
};
