import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Clock, ShieldAlert, FileText, 
  Activity, ShieldCheck, Download, Trash2, Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../store/authStore';
import { PortalOverview } from '../components/PortalOverview';
import { FounderSection } from '../components/FounderSection';
import { FooterSection } from '../components/FooterSection';
import { DailyLegalTipsSection } from '../components/DailyLegalTipsSection';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const AdminDashboard: React.FC = () => {
  const { token, addNotification } = useAuthStore();
  const [stats, setStats] = useState({
    totalAdvocates: 0,
    activeUsers: 0,
    pendingVerification: 0,
    uploadedJudgements: 0,
    uploadedLaws: 0,
    collaborationActivities: 0
  });

  const [pendingAdvocates, setPendingAdvocates] = useState<any[]>([]);
  const [selectedAdvocateForReview, setSelectedAdvocateForReview] = useState<any | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch initial dashboard stats
  useEffect(() => {
    fetchStats();
    fetchPendingAdvocates();
  }, [token]);



  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/system/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPendingAdvocates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/advocates/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.advocates)) {
        setPendingAdvocates(data.advocates);
      }
    } catch (err) {
      console.error('Error fetching pending advocates:', err);
    }
  };

  const handleVerify = async (advocateId: string, status: string | boolean) => {
    try {
      const isApproved = status === true || status === 'APPROVED';
      const res = await fetch(`${API_BASE}/api/advocates/${advocateId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: isApproved ? 'APPROVED' : 'REJECTED' })
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        if (isApproved) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addNotification('Advocate Approved', 'Advocate verified successfully. The Advocate is now visible in the Advocate Directory.', 'success');
        } else {
          addNotification('Advocate Rejected', 'Advocate registration has been rejected.', 'info');
        }
        setSelectedAdvocateForReview(null);
        fetchStats();
        fetchPendingAdvocates();
      } else {
        addNotification('Action Failed', data.message || 'Verification status update failed.', 'warning');
      }
    } catch (err) {
      console.error(err);
      addNotification('Error', 'Network error during verification update.', 'warning');
    }
  };

  const handleRejectAdvocate = async (advocateId: string, advocateName: string) => {
    const reason = window.prompt(`Enter optional rejection reason for advocate "${advocateName}":`, 'Details could not be verified with Bar Council records.');
    if (reason === null) return; // user cancelled

    try {
      const res = await fetch(`${API_BASE}/api/advocates/${advocateId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('Advocate Rejected', 'Advocate registration has been rejected.', 'info');
        setSelectedAdvocateForReview(null);
        fetchStats();
        fetchPendingAdvocates();
      } else {
        addNotification('Rejection Failed', data.message || 'Failed to reject advocate.', 'warning');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/system/backup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Trigger JSON download
        const blob = new Blob([JSON.stringify(data.backupPayload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `legal_system_backup_${Date.now()}.json`;
        a.click();
        
        addNotification('Database Backup', 'System database backup file generated successfully.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="space-y-8">
      
      {/* Project Main Theme Overview & Interactive Field Cards */}
      <PortalOverview stats={stats} loadingStats={loadingStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Verification Center */}
        <div id="admin-section-verifications" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  ADVOCATE VERIFICATION
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  Pending Applications: {pendingAdvocates.length}
                </p>
              </div>

              <button
                onClick={() => setShowPendingModal(!showPendingModal)}
                className="px-3 py-1.5 bg-primary/10 dark:bg-sky-400/10 hover:bg-primary/20 text-primary dark:text-sky-400 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-primary/20"
              >
                {showPendingModal ? 'Hide Applications' : 'View Applications'}
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
              {pendingAdvocates.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No pending advocate verification applications.
                </div>
              ) : (
                pendingAdvocates.map((adv: any) => (
                  <div key={adv._id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          {adv.name}
                          {adv.authProvider === 'GOOGLE' && (
                            <span className="text-[9px] bg-sky-500/10 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded font-semibold border border-sky-400/20">
                              Google Auth
                            </span>
                          )}
                        </h4>
                        <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-500/30">
                          Status: Pending
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] space-y-0.5 text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold text-slate-700 dark:text-slate-300">Enrollment No:</span> <span className="font-mono">{adv.enrollmentNumber}</span></p>
                        <p><span className="font-semibold text-slate-700 dark:text-slate-300">Specialization:</span> {adv.specialization || 'Civil Litigation'}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                      <button
                        onClick={() => setSelectedAdvocateForReview(adv)}
                        className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ADMIN VIEW DETAILS MODAL */}
        {selectedAdvocateForReview && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full my-8 overflow-hidden animate-slide-up">
              
              <div className="bg-[#0B3B8E] dark:bg-slate-950 text-white px-6 py-4 flex justify-between items-center border-b border-blue-900/40">
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide uppercase">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <span>Advocate Verification Details</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAdvocateForReview(null)}
                  className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Advocate Name</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedAdvocateForReview.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold border border-amber-500/30 uppercase">
                      {selectedAdvocateForReview.verificationStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-slate-500">Email Address:</span>
                      <p className="font-mono text-slate-900 dark:text-white mt-0.5">{selectedAdvocateForReview.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Phone Number:</span>
                      <p className="font-mono text-slate-900 dark:text-white mt-0.5">{selectedAdvocateForReview.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-slate-500">Bar Council Enrollment Number:</span>
                      <p className="font-mono text-slate-900 dark:text-white mt-0.5 font-bold">{selectedAdvocateForReview.enrollmentNumber}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Enrollment Date:</span>
                      <p className="text-slate-900 dark:text-white mt-0.5">{selectedAdvocateForReview.enrollmentDate || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="font-semibold text-slate-500">Specialization:</span>
                    <p className="text-slate-900 dark:text-white mt-0.5 font-medium">{selectedAdvocateForReview.specialization || 'Civil Litigation'}</p>
                  </div>

                  <div className="pt-2">
                    <span className="font-semibold text-slate-500">Practicing Court / City:</span>
                    <p className="text-slate-900 dark:text-white mt-0.5">{selectedAdvocateForReview.court || 'Senior civil judges court'}, {selectedAdvocateForReview.city || 'Madanapalle'}</p>
                  </div>

                  <div className="pt-2">
                    <span className="font-semibold text-slate-500">Qualification / Bio:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 italic">{selectedAdvocateForReview.bio || 'Verified legal practitioner registered with Bar Council.'}</p>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span>Submission Date:</span> {new Date(selectedAdvocateForReview.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    <div>
                      <span>Auth Provider:</span> {selectedAdvocateForReview.authProvider || 'LOCAL'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRejectAdvocate(selectedAdvocateForReview._id, selectedAdvocateForReview.name)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Reject Application
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerify(selectedAdvocateForReview._id, 'APPROVED')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Approve Advocate
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Daily Legal Tips / Updates Module */}
        <div id="admin-section-legal-tips">
          <DailyLegalTipsSection />
        </div>
      </div>

      {/* Founder Details & Footer Section (Displayed both before and after login) */}
      <FounderSection />
      <FooterSection />

    </div>
  );
};
