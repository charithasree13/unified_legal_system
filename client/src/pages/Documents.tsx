import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Download, Bookmark, ZoomIn, ZoomOut, Printer, 
  Tag, Calendar, Landmark, Scale, ExternalLink, X, BookmarkCheck, Trash2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Documents: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const [tab, setTab] = useState<'judgement' | 'law'>('judgement');
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

  // Reader Modal States
  const [readingDoc, setReadingDoc] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    fetchDocuments();
    // Load local bookmarks
    const saved = localStorage.getItem('legal_bookmarked_docs');
    if (saved) setBookmarkedDocs(JSON.parse(saved));
  }, [token, tab, courtFilter, stateFilter, judgeFilter, yearFilter, lawCategory]);

  const fetchDocuments = async () => {
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

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Search Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          {/* Tab togglers */}
          <div className="flex gap-2">
            <button
              onClick={() => { setTab('judgement'); setSearch(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                tab === 'judgement' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Scale size={14} /> Judgements Repository
            </button>
            <button
              onClick={() => { setTab('law'); setSearch(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                tab === 'law' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText size={14} /> Bare Acts & Statutes
            </button>
          </div>

          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider hidden md:block">
            Secure Legal Library
          </h2>
        </div>

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
                  ? "Search judgements by Title, Subject, Judge..." 
                  : "Search Bare Acts, Constitutional Articles, Rules..."
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
                <option value="">Category (All)</option>
                <option>Act</option>
                <option>Rule</option>
                <option>Regulation</option>
                <option>Constitution Article</option>
                <option>Notification</option>
              </select>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Search Library
            </button>
          </div>

        </form>
      </div>

      {/* Library Grid */}
      {tab === 'judgement' ? (
        // Judgements Grid List
        judgements.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 max-w-lg mx-auto">
            <Scale size={48} className="mx-auto text-slate-350 mb-3 animate-pulse-slow" />
            <h4 className="font-bold text-sm">Judgement Database Empty</h4>
            <p className="text-xs text-slate-400 mt-1">
              Admin roles upload litigation outcomes here. Verify database queries if active records exist.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {judgements.map((jud) => {
              const isBookmarked = bookmarkedDocs.includes(jud._id);
              return (
                <div 
                  key={jud._id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] bg-primary/10 text-primary dark:bg-sky-400/20 dark:text-sky-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Judgement
                      </span>
                      <button 
                        onClick={() => handleToggleBookmark(jud._id, jud.title)}
                        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors ${
                          isBookmarked ? 'text-primary dark:text-sky-400' : 'text-slate-300'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={18} className="text-emerald-500" /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 leading-relaxed">
                      {jud.title}
                    </h3>
                    
                    <div className="mt-3.5 space-y-1.5 text-xs text-slate-400">
                      <p className="flex items-center gap-1.5 font-semibold text-slate-500">
                        <Landmark size={13} /> {jud.court}{jud.state ? ` - ${jud.state}` : ''}
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
                          <span key={idx} className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold flex items-center gap-0.5">
                            <Tag size={8} /> {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => setReadingDoc(jud)}
                      className="text-xs text-primary dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
            <FileText size={48} className="mx-auto text-slate-350 mb-3 animate-pulse-slow" />
            <h4 className="font-bold text-sm">Statutory Library Empty</h4>
            <p className="text-xs text-slate-400 mt-1">
              Admin roles upload Bare Acts, Articles, and Regulations. Check filter classifications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {laws.map((law) => {
              const isBookmarked = bookmarkedDocs.includes(law._id);
              return (
                <div 
                  key={law._id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] bg-secondary/15 text-[#1e293b] dark:text-sky-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {law.category}
                      </span>
                      <button 
                        onClick={() => handleToggleBookmark(law._id, law.title)}
                        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors ${
                          isBookmarked ? 'text-primary dark:text-sky-400' : 'text-slate-300'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={18} className="text-emerald-500" /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 leading-relaxed">
                      {law.title}
                    </h3>
                    
                    {law.description && (
                      <p className="text-[11px] text-slate-400 mt-2 text-justify line-clamp-3">
                        {law.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => setReadingDoc(law)}
                      className="text-xs text-primary dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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

      {/* Case Reader/Bare-act Document PDF Simulator Viewer Modal */}
      {readingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col justify-between animate-slide-up">
            
            {/* Top Toolbar */}
            <div className="h-14 bg-primary dark:bg-slate-850 text-white flex items-center justify-between px-6">
              <h3 className="font-bold text-xs truncate max-w-lg flex items-center gap-2">
                <FileText size={16} />
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
                    {readingDoc.court || readingDoc.category} | DECIDED ON: {readingDoc.year || '2026'}
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
                  
                  <p className="font-bold text-xs uppercase font-sans pt-4">III. FINAL JUDICIAL ORDER</p>
                  <p>
                    5. Accordingly, the petition is allowed. The order of the conversion tribunal is upheld, and the respondents are directed to execute the registry files within a period of six weeks from today. Parties shall bear their own litigation costs. Ordered accordingly.
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
                className="px-4 py-1.5 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <Download size={12} /> Download PDF Copy
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
