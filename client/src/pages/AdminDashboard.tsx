import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Clock, ShieldAlert, FileText, Database, 
  Activity, CloudUpload, ShieldCheck, Download, Trash2, Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../store/authStore';

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
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Document uploads states
  const [docType, setDocType] = useState<'judgement' | 'law'>('judgement');
  const [docTitle, setDocTitle] = useState('');
  const [docCourt, setDocCourt] = useState('Supreme Court of India');
  const [docState, setDocState] = useState('');
  const [docJudge, setDocJudge] = useState('');
  const [docYear, setDocYear] = useState(new Date().getFullYear());
  const [docSubject, setDocSubject] = useState('');
  const [docKeywords, setDocKeywords] = useState('');
  const [docCategory, setDocCategory] = useState('Act');
  const [docFile, setDocFile] = useState<File | null>(null);
  
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Fetch initial dashboard stats & logs
  useEffect(() => {
    fetchStats();
    fetchLogs();
    fetchPendingAdvocates();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/system/stats', {
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

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/system/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAuditLogs(data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingAdvocates = async () => {
    try {
      const res = await fetch('/api/advocates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // filter unverified advocates
        setPendingAdvocates(data.advocates.filter((a: any) => !a.isVerified));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (advocateId: string, status: boolean) => {
    try {
      const res = await fetch(`/api/advocates/${advocateId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        if (status) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addNotification('Advocate Verified', 'Advocate enrollment credentials successfully approved.', 'success');
        } else {
          addNotification('Advocate Status Updated', 'Verification status set to unverified.', 'warning');
        }
        fetchStats();
        fetchPendingAdvocates();
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/system/backup', {
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
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !docTitle) {
      setUploadError('Title and PDF document file are required.');
      return;
    }

    setUploadProgress(true);
    setUploadError('');
    setUploadMsg('');

    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('title', docTitle);

    let endpoint = '';
    if (docType === 'judgement') {
      endpoint = '/api/documents/judgements';
      formData.append('court', docCourt);
      if (docState) {
        formData.append('state', docState);
      }
      formData.append('judge', docJudge);
      formData.append('year', String(docYear));
      formData.append('subject', docSubject);
      formData.append('keywords', docKeywords);
    } else {
      endpoint = '/api/documents/laws';
      formData.append('category', docCategory);
      formData.append('description', docSubject);
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.message || 'Failed to upload document.');
      } else {
        setUploadMsg('PDF document successfully uploaded and categorized.');
        setDocTitle('');
        setDocState('');
        setDocJudge('');
        setDocSubject('');
        setDocKeywords('');
        setDocFile(null);
        
        fetchStats();
        fetchLogs();
        addNotification('Document Uploaded', `${docType === 'judgement' ? 'Judgement' : 'Law/Act'} successfully published.`, 'success');
      }
    } catch (err) {
      setUploadError('Network error uploading file.');
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Advocates', val: stats.totalAdvocates, icon: Users, color: 'text-primary' },
          { label: 'Active Users', val: stats.activeUsers, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Pending Verify', val: stats.pendingVerification, icon: Clock, color: 'text-amber-500' },
          { label: 'Judgements', val: stats.uploadedJudgements, icon: FileText, color: 'text-sky-500' },
          { label: 'Acts/Laws', val: stats.uploadedLaws, icon: FileText, color: 'text-indigo-500' },
          { label: 'Collab Actions', val: stats.collaborationActivities, icon: Activity, color: 'text-purple-500' }
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {c.label}
              </span>
              <c.icon size={16} className={c.color} />
            </div>
            <h3 className="text-xl font-bold font-sans mt-1">
              {loadingStats ? '...' : c.val}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Quick Action: Document Publishing */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 h-fit">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CloudUpload size={18} className="text-primary dark:text-sky-400" />
            Upload Legal Document (PDF)
          </h3>

          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg mb-4">
            <button
              onClick={() => setDocType('judgement')}
              className={`py-1 text-xs font-semibold rounded-md ${
                docType === 'judgement' ? 'bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              Judgement PDF
            </button>
            <button
              onClick={() => setDocType('law')}
              className={`py-1 text-xs font-semibold rounded-md ${
                docType === 'law' ? 'bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              Law / Act PDF
            </button>
          </div>

          <form onSubmit={handleDocUpload} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
                className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                placeholder="e.g. State of Karnataka vs. Ramesh Rao"
              />
            </div>

            {docType === 'judgement' ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Court Type</label>
                    <select
                      value={docCourt}
                      onChange={(e) => setDocCourt(e.target.value)}
                      className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    >
                      <option>Supreme Court of India</option>
                      <option>High Court</option>
                      <option>Senior civil judges court</option>
                      <option>Junior civil Judges court</option>
                      <option>Judicial magistrate of 1st class</option>
                      <option>Consumers forum</option>
                      <option>DRT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">State / UT</label>
                    <select
                      value={docState}
                      onChange={(e) => setDocState(e.target.value)}
                      className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    >
                      <option value="">National / Central</option>
                      <optgroup label="States">
                        <option>Andhra Pradesh</option>
                        <option>Arunachal Pradesh</option>
                        <option>Assam</option>
                        <option>Bihar</option>
                        <option>Chhattisgarh</option>
                        <option>Goa</option>
                        <option>Gujarat</option>
                        <option>Haryana</option>
                        <option>Himachal Pradesh</option>
                        <option>Jharkhand</option>
                        <option>Karnataka</option>
                        <option>Kerala</option>
                        <option>Madhya Pradesh</option>
                        <option>Maharashtra</option>
                        <option>Manipur</option>
                        <option>Meghalaya</option>
                        <option>Mizoram</option>
                        <option>Nagaland</option>
                        <option>Odisha</option>
                        <option>Punjab</option>
                        <option>Rajasthan</option>
                        <option>Sikkim</option>
                        <option>Tamil Nadu</option>
                        <option>Telangana</option>
                        <option>Tripura</option>
                        <option>Uttarakhand</option>
                        <option>Uttar Pradesh</option>
                        <option>West Bengal</option>
                      </optgroup>
                      <optgroup label="Union Territories">
                        <option>Andaman and Nicobar Islands</option>
                        <option>Chandigarh</option>
                        <option>Dadra and Nagar Haveli and Daman and Diu</option>
                        <option>Delhi</option>
                        <option>Jammu and Kashmir</option>
                        <option>Ladakh</option>
                        <option>Lakshadweep</option>
                        <option>Puducherry</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Year</label>
                    <input
                      type="number"
                      value={docYear}
                      onChange={(e) => setDocYear(Number(e.target.value))}
                      className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Judge(s)</label>
                    <input
                      type="text"
                      value={docJudge}
                      onChange={(e) => setDocJudge(e.target.value)}
                      className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                      placeholder="e.g. Justice D.Y. Chandrachud"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Subject Area</label>
                    <input
                      type="text"
                      value={docSubject}
                      onChange={(e) => setDocSubject(e.target.value)}
                      className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                      placeholder="e.g. Constitutional Law"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Keywords (comma sep)</label>
                  <input
                    type="text"
                    value={docKeywords}
                    onChange={(e) => setDocKeywords(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="writ petition, fundamental rights"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  >
                    <option>Act</option>
                    <option>Rule</option>
                    <option>Regulation</option>
                    <option>Constitution Article</option>
                    <option>Notification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Summary / Description</label>
                  <textarea
                    value={docSubject}
                    onChange={(e) => setDocSubject(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none h-20"
                    placeholder="Brief description of the Bare Act or statutory notification..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">Choose PDF Document File</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
              />
            </div>

            {uploadError && <p className="text-[11px] text-red-500 font-semibold mt-1">{uploadError}</p>}
            {uploadMsg && <p className="text-[11px] text-emerald-500 font-semibold mt-1">{uploadMsg}</p>}

            <button
              type="submit"
              disabled={uploadProgress}
              className="w-full py-2 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded text-xs font-semibold transition-all mt-2 cursor-pointer shadow"
            >
              {uploadProgress ? 'Publishing Document PDF...' : 'Publish Legal PDF'}
            </button>
          </form>
        </div>

        {/* Verification Center */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              Verify Advocate Credentials
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
              {pendingAdvocates.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  All advocate profiles currently verified.
                </div>
              ) : (
                pendingAdvocates.map((adv: any) => (
                  <div key={adv._id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-xs text-slate-950 dark:text-slate-50">{adv.name}</h4>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                          Exp: {adv.experience} yrs
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Enrollment No: {adv.enrollmentNumber}</p>
                      <p className="text-[10px] text-slate-400">Specialization: {adv.specialization}</p>
                      <p className="text-[10px] text-slate-400">Court: {adv.court}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-3.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50">
                      <button
                        onClick={() => handleVerify(adv._id, true)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                      >
                        Approve Credentials
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={handleBackup}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Database size={14} /> Download Secure DB Backup
            </button>
          </div>
        </div>

        {/* Real-time System Audit Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 h-[480px] overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-amber-500" />
              Real-time System Audit Trails
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 overflow-y-auto h-[380px] pr-1 space-y-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">No logs collected yet.</div>
              ) : (
                auditLogs.map((log: any) => (
                  <div key={log._id} className="py-2.5 text-[11px]">
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      <span>{log.userName} ({log.role})</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-semibold text-slate-850 dark:text-slate-200">{log.action}</p>
                    <p className="text-slate-400 mt-0.5 text-[10px]">{log.details}</p>
                    <p className="text-[9px] text-primary dark:text-sky-400 mt-0.5 font-mono">IP: {log.ip}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
