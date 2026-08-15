import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Download, Bookmark, ZoomIn, ZoomOut, Printer, 
  Tag, Calendar, Landmark, Scale, ExternalLink, X, BookmarkCheck, Trash2,
  Gavel, BookOpen, CloudUpload, Filter
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LegalTriviaLoader } from '../components/LegalTriviaLoader';

export const Documents: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // For normal users (non-Admin & non-Advocate), Judgements & Laws/Bare Acts are hidden
  const isNormalUser = user?.role !== 'Admin' && user?.role !== 'Advocate';
  if (isNormalUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Detect active tab from current URL path
  const getTabFromPath = () => {
    if (location.pathname.includes('/laws')) return 'law';
    return 'judgement';
  };

  const [tab, setTab] = useState<'judgement' | 'law'>(getTabFromPath());
  const [search, setSearch] = useState('');
  
  // Repos data lists
  const [judgements, setJudgements] = useState<any[]>([]);
  const [laws, setLaws] = useState<any[]>([]);
  const [bookmarkedDocs, setBookmarkedDocs] = useState<string[]>([]);
  
  // Filter states
  const [courtFilter, setCourtFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [judgeFilter, setJudgeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [lawCategory, setLawCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Reader Modal States
  const [readingDoc, setReadingDoc] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Admin Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'judgement' | 'law'>('judgement');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCourt, setUploadCourt] = useState('Supreme Court of India');
  const [uploadState, setUploadState] = useState('');
  const [uploadJudge, setUploadJudge] = useState('');
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadKeywords, setUploadKeywords] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Act');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Keep tab in sync with URL changes
  useEffect(() => {
    const currentTabFromPath = getTabFromPath();
    if (currentTabFromPath !== tab) {
      setTab(currentTabFromPath);
    }
  }, [location.pathname]);

  const handleTabChange = (newTab: 'judgement' | 'law') => {
    setTab(newTab);
    setSearch('');
    navigate(newTab === 'judgement' ? '/judgements' : '/laws', { replace: true });
  };

  useEffect(() => {
    fetchDocuments();
    // Load local bookmarks
    const saved = localStorage.getItem('legal_bookmarked_docs');
    if (saved) setBookmarkedDocs(JSON.parse(saved));
  }, [token, tab, courtFilter, stateFilter, judgeFilter, yearFilter, lawCategory]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);

      if (tab === 'judgement') {
        if (courtFilter) queryParams.append('court', courtFilter);
        if (stateFilter) queryParams.append('state', stateFilter);
        if (judgeFilter) queryParams.append('judge', judgeFilter);
        if (yearFilter) queryParams.append('year', yearFilter);

        const res = await fetch(`/api/documents/judgements?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setJudgements(data.judgements);
      } else {
        if (lawCategory) queryParams.append('category', lawCategory);

        const res = await fetch(`/api/documents/laws?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setLaws(data.laws);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleToggleBookmark = (docId: string, title: string) => {
    let list = [...bookmarkedDocs];
    const isBookmarked = list.includes(docId);
    
    if (isBookmarked) {
      list = list.filter((id) => id !== docId);
      addNotification('Bookmark Removed', `"${title.substring(0, 20)}..." removed.`, 'info');
    } else {
      list.push(docId);
      addNotification('Document Bookmarked', `"${title.substring(0, 20)}..." bookmarked.`, 'success');
    }
    
    setBookmarkedDocs(list);
    localStorage.setItem('legal_bookmarked_docs', JSON.stringify(list));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteJudgement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this judgement? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/documents/judgements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('Judgement Deleted', 'The document has been removed from catalog.', 'success');
        setJudgements(prev => prev.filter(j => j._id !== id));
      } else {
        addNotification('Deletion Failed', data.message || 'Error deleting judgement.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Deletion Error', 'Failed to communicate with the server.', 'error');
    }
  };

  const handleDeleteLaw = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this act/law? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/documents/laws/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('Act/Law Deleted', 'The statutory document has been removed.', 'success');
        setLaws(prev => prev.filter(l => l._id !== id));
      } else {
        addNotification('Deletion Failed', data.message || 'Error deleting act/law.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Deletion Error', 'Failed to communicate with the server.', 'error');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      setUploadError('Title and PDF document file are required.');
      return;
    }

    setUploadProgress(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);

    let endpoint = '';
    if (uploadType === 'judgement') {
      endpoint = '/api/documents/judgements';
      formData.append('court', uploadCourt);
      if (uploadState) formData.append('state', uploadState);
      formData.append('judge', uploadJudge);
      formData.append('year', String(uploadYear));
      formData.append('subject', uploadSubject);
      formData.append('keywords', uploadKeywords);
    } else {
      endpoint = '/api/documents/laws';
      formData.append('category', uploadCategory);
      formData.append('description', uploadSubject);
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
        addNotification(
          'Document Published', 
          `${uploadType === 'judgement' ? 'Judgement' : 'Bare Act / Law'} uploaded successfully.`, 
          'success'
        );
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadState('');
        setUploadJudge('');
        setUploadSubject('');
        setUploadKeywords('');
        setUploadFile(null);
        fetchDocuments();
      }
    } catch (err) {
      setUploadError('Network error uploading file.');
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Tab Selector Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('judgement')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              tab === 'judgement' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gavel size={15} />
            Judgements Repository
          </button>
          
          <button
            onClick={() => handleTabChange('law')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              tab === 'law' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen size={15} />
            Bare Acts & Statutes
          </button>
        </div>

        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase hidden md:inline-block">
          {tab === 'judgement' ? 'Case Precedents & Rulings' : 'Legislative Code & Statutory Acts'}
        </span>
      </div>

      {/* DISTINCT SECTION HERO LANDING BANNERS */}
      {tab === 'judgement' ? (
        /* Judgements Hero Banner */
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 text-white shadow-xl animate-fade-in">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Gavel size={12} className="text-indigo-400" />
                  Case Rulings & Precedents
                </span>
                <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {judgements.length} Decisions Catalogued
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-sans tracking-tight text-white">
                Judgements & Precedents Repository
              </h1>
              <p className="text-xs md:text-sm text-indigo-100/80 mt-1.5 max-w-2xl leading-relaxed">
                Search, inspect, and analyze landmark court verdicts, bench opinions, and case precedents from the Supreme Court of India, High Courts & Subordinate Tribunals.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
                {['Supreme Court', 'High Courts', 'Civil / Magistrate Courts', 'Tribunals & DRT'].map((bench, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-indigo-200/90 font-medium flex items-center gap-1">
                    <Landmark size={11} className="text-indigo-400" /> {bench}
                  </span>
                ))}
              </div>
            </div>

            {user?.role === 'Admin' && (
              <button
                onClick={() => { setUploadType('judgement'); setShowUploadModal(true); }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 cursor-pointer flex-shrink-0 border border-indigo-400/30"
              >
                <CloudUpload size={16} /> + Upload Judgement
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Laws & Acts Hero Banner */
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 text-white shadow-xl animate-fade-in">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <BookOpen size={12} className="text-emerald-400" />
                  Statutory Library & Bare Code
                </span>
                <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {laws.length} Statutes Indexed
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-sans tracking-tight text-white">
                Bare Acts & Statutory Code
              </h1>
              <p className="text-xs md:text-sm text-emerald-100/80 mt-1.5 max-w-2xl leading-relaxed">
                Access official Central & State Statutory Acts, Constitutional Articles, Legislative Rules, Amendments, Gazette Regulations & Government Notifications.
              </p>

              <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
                {['Bare Acts', 'Constitutional Articles', 'Statutory Rules', 'Gazette Notifications', 'Regulations'].map((cat, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-emerald-200/90 font-medium flex items-center gap-1">
                    <FileText size={11} className="text-emerald-400" /> {cat}
                  </span>
                ))}
              </div>
            </div>

            {user?.role === 'Admin' && (
              <button
                onClick={() => { setUploadType('law'); setShowUploadModal(true); }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 cursor-pointer flex-shrink-0 border border-emerald-400/30"
              >
                <CloudUpload size={16} /> + Upload Bare Act
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Global query input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === 'judgement' 
                  ? "Search judgements by Title, Subject, Judge name..." 
                  : "Search Bare Acts, Constitutional Articles, Rules & Regulations..."
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* Contextual Filters */}
          <div className="flex gap-2 flex-wrap">
            {tab === 'judgement' ? (
              <>
                <select
                  value={courtFilter}
                  onChange={(e) => setCourtFilter(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                >
                  <option value="">Court Forum (All)</option>
                  <option>Supreme Court of India</option>
                  <option>High Court</option>
                  <option>Senior civil judges court</option>
                  <option>Junior civil Judges court</option>
                  <option>Judicial magistrate of 1st class</option>
                  <option>Consumers forum</option>
                  <option>DRT</option>
                </select>

                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                >
                  <option value="">State / UT (All)</option>
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

                <input
                  type="text"
                  value={judgeFilter}
                  onChange={(e) => setJudgeFilter(e.target.value)}
                  placeholder="Judge Name"
                  className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none max-w-[120px]"
                />

                <input
                  type="number"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  placeholder="Year"
                  className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none max-w-[80px]"
                />
              </>
            ) : (
              <select
                value={lawCategory}
                onChange={(e) => setLawCategory(e.target.value)}
                className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
              >
                <option value="">Category (All Statutory)</option>
                <option>Act</option>
                <option>Rule</option>
                <option>Regulation</option>
                <option>Constitution Article</option>
                <option>Notification</option>
              </select>
            )}

            <button
              type="submit"
              className={`px-4 py-2 ${
                tab === 'judgement' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5`}
            >
              <Filter size={13} />
              Filter Results
            </button>
          </div>

        </form>
      </div>

      {/* Library Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <LegalTriviaLoader loadingText={tab === 'judgement' ? "Fetching Judicial Verdicts & Bench Rulings..." : "Fetching Bare Acts & Statutory Codes..."} />
        </div>
      ) : tab === 'judgement' ? (
        // Judgements Grid List
        judgements.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 max-w-lg mx-auto">
            <Gavel size={48} className="mx-auto text-indigo-400/60 mb-3 animate-pulse-slow" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">Judgements Database Empty</h4>
            <p className="text-xs text-slate-400 mt-1">
              Admin roles upload litigation outcomes and court judgements here. Check back or upload a new record.
            </p>
            {user?.role === 'Admin' && (
              <button
                onClick={() => { setUploadType('judgement'); setShowUploadModal(true); }}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <CloudUpload size={14} /> Upload First Judgement
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {judgements.map((jud) => {
              const isBookmarked = bookmarkedDocs.includes(jud._id);
              return (
                <div 
                  key={jud._id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 hover:border-indigo-400/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                        <Gavel size={10} /> Judgement
                      </span>
                      <button 
                        onClick={() => handleToggleBookmark(jud._id, jud.title)}
                        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors ${
                          isBookmarked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={18} className="text-emerald-500" /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 leading-relaxed">
                      {jud.title}
                    </h3>
                    
                    <div className="mt-3.5 space-y-1.5 text-xs text-slate-400">
                      <p className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                        <Landmark size={13} className="text-indigo-500" /> {jud.court}{jud.state ? ` - ${jud.state}` : ''}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar size={13} /> Decision Year: {jud.year}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Scale size={13} /> Presiding Judge: {jud.judge}
                      </p>
                    </div>

                    {/* Keywords list */}
                    {jud.keywords && jud.keywords.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-4">
                        {jud.keywords.map((k: string, idx: number) => (
                          <span key={idx} className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded font-semibold flex items-center gap-0.5">
                            <Tag size={8} /> {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => setReadingDoc(jud)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Open Case Reader <ExternalLink size={12} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {user?.role === 'Admin' && (
                        <button
                          onClick={() => handleDeleteJudgement(jud._id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded border border-slate-200 dark:border-slate-800 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                          title="Delete Judgement"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <a
                        href={jud.pdfUrl}
                        download
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                        title="Download PDF Copy"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // Laws / Acts Grid List
        laws.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 max-w-lg mx-auto">
            <BookOpen size={48} className="mx-auto text-emerald-400/60 mb-3 animate-pulse-slow" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">Statutory Library Empty</h4>
            <p className="text-xs text-slate-400 mt-1">
              Admin roles upload Bare Acts, Articles, and Regulations here. Check back or upload a new statute.
            </p>
            {user?.role === 'Admin' && (
              <button
                onClick={() => { setUploadType('law'); setShowUploadModal(true); }}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <CloudUpload size={14} /> Upload First Bare Act
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {laws.map((law) => {
              const isBookmarked = bookmarkedDocs.includes(law._id);
              return (
                <div 
                  key={law._id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-400/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                        <BookOpen size={10} /> {law.category}
                      </span>
                      <button 
                        onClick={() => handleToggleBookmark(law._id, law.title)}
                        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors ${
                          isBookmarked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={18} className="text-emerald-500" /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 leading-relaxed">
                      {law.title}
                    </h3>
                    
                    {law.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-justify line-clamp-3 leading-relaxed">
                        {law.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => setReadingDoc(law)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Read bare text <ExternalLink size={12} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {user?.role === 'Admin' && (
                        <button
                          onClick={() => handleDeleteLaw(law._id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded border border-slate-200 dark:border-slate-800 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                          title="Delete Act/Law"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <a
                        href={law.pdfUrl}
                        download
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                        title="Download PDF Copy"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Case Reader / Bare-act Document Viewer Modal */}
      {readingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col justify-between animate-slide-up">
            
            {/* Top Toolbar */}
            <div className={`h-14 ${readingDoc.court ? 'bg-indigo-900' : 'bg-emerald-900'} text-white flex items-center justify-between px-6`}>
              <h3 className="font-bold text-xs truncate max-w-lg flex items-center gap-2">
                {readingDoc.court ? <Gavel size={16} /> : <BookOpen size={16} />}
                {readingDoc.title}
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-xs">
                  <button 
                    onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="px-2 font-mono">{zoomLevel}%</span>
                  <button 
                    onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>

                <button 
                  onClick={handlePrint}
                  className="p-1.5 hover:bg-white/10 rounded"
                  title="Print Document"
                >
                  <Printer size={16} />
                </button>

                <button
                  onClick={() => setReadingDoc(null)}
                  className="p-1 hover:bg-white/10 rounded cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Document Content Canvas */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 overflow-y-auto flex justify-center items-start">
              <div 
                className="bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 p-8 md:p-12 max-w-3xl w-full text-slate-800 dark:text-slate-200 text-justify leading-relaxed transition-all duration-150"
                style={{ fontSize: `${(zoomLevel / 100) * 13}px` }}
              >
                {/* Title */}
                <div className="text-center border-b border-slate-350 dark:border-slate-800 pb-4 mb-6">
                  <h2 className="text-base font-bold text-slate-950 dark:text-white uppercase leading-normal">
                    {readingDoc.title}
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-2 font-sans font-semibold">
                    {readingDoc.court || readingDoc.category} | DECIDED / ENACTED: {readingDoc.year || '2026'}
                  </p>
                  {readingDoc.judge && (
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                      PRESIDING FORUM: Hon'ble Justice {readingDoc.judge}
                    </p>
                  )}
                </div>

                {/* Simulated Legal Document Content */}
                <div className="space-y-4 font-serif">
                  <p className="font-bold text-xs uppercase font-sans">I. PRELIMINARY OBSERVATIONS & STATUTES</p>
                  <p>
                    1. Having regard to the contentions advanced by the learned counsels for the petitioner and respondents, this forum has scrutinized the documentary schedules and statutory provisions referenced under the claim schedule. The subject matter pertains to the validation of evolutionary property grids and administrative conversions.
                  </p>
                  <p>
                    2. The applicable parameters, as indexed under Section 12 of the statutory act, outline the procedures required for validating certificates and authorizations. Sub-section (3) details the rate criteria that the collector or executive magistrate must apply when auditing local claims.
                  </p>

                  <p className="font-bold text-xs uppercase font-sans pt-4">II. DISCUSSION & RATIONALE</p>
                  <p>
                    3. Under standard precedents, a clear distinction is drawn between administrative errors and substantive misrepresentations. In the present appeal, the respondents challenge the validity of the property conversion order on the ground of procedural delay. However, this court observes that the delay was administrative and did not prejudice the respondents' core claims.
                  </p>
                  <p>
                    4. The statutory guidelines define the timelines for land evaluation and court fee assessments. As confirmed by the judicial stamp office, the fee deposited matches the suit value calculation as certified under state-specific schedules.
                  </p>
                  
                  <p className="font-bold text-xs uppercase font-sans pt-4">III. FINAL ORDER & ENACTMENT</p>
                  <p>
                    5. Accordingly, the statutory provisions herein shall be strictly enforced across relevant municipal and judicial jurisdictions. All subordinate officers are directed to adhere to these statutory rules. Ordered accordingly.
                  </p>
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-sans text-slate-400">
                  <span>Unified Legal Professional System Reader</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="h-14 bg-slate-50 dark:bg-slate-950 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Uploaded by: {readingDoc.uploadedBy}</span>
              <a
                href={readingDoc.pdfUrl}
                download
                className={`px-4 py-1.5 ${readingDoc.court ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm`}
              >
                <Download size={12} /> Download PDF Copy
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ADMIN DOCUMENT UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className={`h-14 ${uploadType === 'judgement' ? 'bg-indigo-900' : 'bg-emerald-900'} flex justify-between items-center px-6 text-white`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                {uploadType === 'judgement' ? <Gavel size={18} /> : <BookOpen size={18} />}
                Upload {uploadType === 'judgement' ? 'Judgement Verdict PDF' : 'Bare Act / Statute PDF'}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-white/10 rounded cursor-pointer text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadType('judgement')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    uploadType === 'judgement' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Judgement PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('law')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    uploadType === 'law' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Bare Act / Statute PDF
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Document Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder={uploadType === 'judgement' ? "e.g. State of Karnataka vs. Ramesh Rao" : "e.g. Code of Civil Procedure, 1908"}
                />
              </div>

              {uploadType === 'judgement' ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">Court Type</label>
                      <select
                        value={uploadCourt}
                        onChange={(e) => setUploadCourt(e.target.value)}
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
                        value={uploadState}
                        onChange={(e) => setUploadState(e.target.value)}
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
                        value={uploadYear}
                        onChange={(e) => setUploadYear(Number(e.target.value))}
                        className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">Judge(s)</label>
                      <input
                        type="text"
                        value={uploadJudge}
                        onChange={(e) => setUploadJudge(e.target.value)}
                        className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                        placeholder="e.g. Justice D.Y. Chandrachud"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">Subject Area</label>
                      <input
                        type="text"
                        value={uploadSubject}
                        onChange={(e) => setUploadSubject(e.target.value)}
                        className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                        placeholder="e.g. Constitutional Law"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Keywords (comma sep)</label>
                    <input
                      type="text"
                      value={uploadKeywords}
                      onChange={(e) => setUploadKeywords(e.target.value)}
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
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
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
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
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
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
              </div>

              {uploadError && <p className="text-[11px] text-red-500 font-semibold mt-1">{uploadError}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploadProgress}
                  className={`w-full py-2.5 ${
                    uploadType === 'judgement' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  } text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1.5`}
                >
                  <CloudUpload size={14} />
                  {uploadProgress ? 'Publishing PDF...' : `Publish ${uploadType === 'judgement' ? 'Judgement' : 'Statute'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
