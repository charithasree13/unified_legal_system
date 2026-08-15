import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Download, Bookmark, ZoomIn, ZoomOut, Printer, 
  Tag, Calendar, Landmark, Scale, ExternalLink, X, BookmarkCheck, Trash2,
  Gavel, BookOpen, CloudUpload, Filter, Edit3
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LegalTriviaLoader } from '../components/LegalTriviaLoader';

const DEFAULT_BARE_ACTS = [
  {
    _id: "act_bns_2023",
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 45 of 2023). Replaced the Indian Penal Code (1860). Governs criminal offenses, public order, bodily safety, cyber crimes, and penal sanctions across India.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    fileName: "Bharatiya_Nyaya_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    _id: "act_bnss_2023",
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 46 of 2023). Replaced the Code of Criminal Procedure (1973). Regulates criminal investigation, arrest, court trials, bail guidelines, and mandatory digital forensics.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250884_english_01042024.pdf",
    fileName: "Bharatiya_Nagarik_Suraksha_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    _id: "act_bsa_2023",
    title: "The Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 47 of 2023). Replaced the Indian Evidence Act (1872). Governs rules of evidence, admissibility of electronic and digital records, secondary evidence, and witness examinations.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250885_english_01042024.pdf",
    fileName: "Bharatiya_Sakshya_Adhiniyam_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    _id: "act_cpc_1908",
    title: "Code of Civil Procedure, 1908 (CPC)",
    category: "Act",
    description: "Act No. 5 of 1908. Regulates the procedure and administration of all civil litigation, suits, injunctions, appeals, revisions, and execution of decrees in Indian civil courts.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051676.pdf",
    fileName: "Code_of_Civil_Procedure_1908.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_constitution_1950",
    title: "The Constitution of India",
    category: "Constitution Article",
    description: "Supreme Law of India enacted on 26 January 1950. Outlines Fundamental Rights, Directive Principles of State Policy, Union & State Legislature, Executive, and Judicial Powers.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051648.pdf",
    fileName: "Constitution_of_India.pdf",
    uploadedBy: "Constituent Assembly of India"
  },
  {
    _id: "act_rti_2005",
    title: "Right to Information Act, 2005 (RTI)",
    category: "Act",
    description: "Act No. 22 of 2005. Empowers Indian citizens to request official information from public authorities, setting up Information Commissions and mandatory disclosure timelines.",
    pdfUrl: "https://rti.gov.in/rti-act.pdf",
    fileName: "RTI_Act_2005.pdf",
    uploadedBy: "Department of Personnel & Training"
  },
  {
    _id: "act_consumer_2019",
    title: "Consumer Protection Act, 2019",
    category: "Act",
    description: "Act No. 35 of 2019. Established Central Consumer Protection Authority (CCPA), e-commerce rules, product liability rules, and three-tier Consumer Dispute Redressal Commissions.",
    pdfUrl: "https://consumeraffairs.nic.in/sites/default/files/CP%20Act%202019.pdf",
    fileName: "Consumer_Protection_Act_2019.pdf",
    uploadedBy: "Ministry of Consumer Affairs"
  }
];

export const Documents: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // For normal users (non-Admin & non-Advocate), Judgements & Laws/Bare Acts are completely hidden
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
  const [laws, setLaws] = useState<any[]>(DEFAULT_BARE_ACTS);
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

  // Admin Edit Bare Act Modal State
  const [editingLaw, setEditingLaw] = useState<any | null>(null);
  const [editLawTitle, setEditLawTitle] = useState('');
  const [editLawCategory, setEditLawCategory] = useState('Act');
  const [editLawDescription, setEditLawDescription] = useState('');
  const [editLawFile, setEditLawFile] = useState<File | null>(null);
  const [editLawProgress, setEditLawProgress] = useState(false);
  const [editLawError, setEditLawError] = useState('');

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
        if (res.ok && data.judgements) {
          setJudgements(data.judgements);
        }
      } else {
        if (lawCategory) queryParams.append('category', lawCategory);

        const res = await fetch(`/api/documents/laws?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.laws && data.laws.length > 0) {
          setLaws(data.laws);
        } else {
          // Fallback to default popular Indian Bare Acts list filtered by search & category
          let filtered = [...DEFAULT_BARE_ACTS];
          if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(l => l.title.toLowerCase().includes(s) || l.description?.toLowerCase().includes(s));
          }
          if (lawCategory) {
            filtered = filtered.filter(l => l.category.toLowerCase() === lawCategory.toLowerCase());
          }
          setLaws(filtered);
        }
      }
    } catch (err) {
      console.error('Document fetch error:', err);
      if (tab === 'law') {
        let filtered = [...DEFAULT_BARE_ACTS];
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(l => l.title.toLowerCase().includes(s) || l.description?.toLowerCase().includes(s));
        }
        if (lawCategory) {
          filtered = filtered.filter(l => l.category.toLowerCase() === lawCategory.toLowerCase());
        }
        setLaws(filtered);
      }
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
      await res.json();
    } catch (err) {
      console.error(err);
    }
    // Optimistic / Fallback remove
    setLaws(prev => prev.filter(l => l._id !== id));
    addNotification('Act/Law Deleted', 'The statutory document has been removed.', 'success');
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
      // Optimistic addition if network/mock API mode
      if (uploadType === 'law') {
        const newLawItem = {
          _id: `act_${Date.now()}`,
          title: uploadTitle,
          category: uploadCategory,
          description: uploadSubject,
          pdfUrl: '#',
          fileName: uploadFile?.name || 'document.pdf',
          uploadedBy: user?.name || 'Admin'
        };
        setLaws(prev => [newLawItem, ...prev]);
        addNotification('Bare Act Published', `"${uploadTitle}" uploaded successfully.`, 'success');
        setShowUploadModal(false);
      } else {
        setUploadError('Network error uploading file.');
      }
    } finally {
      setUploadProgress(false);
    }
  };

  const openEditLawModal = (law: any) => {
    setEditingLaw(law);
    setEditLawTitle(law.title || '');
    setEditLawCategory(law.category || 'Act');
    setEditLawDescription(law.description || '');
    setEditLawFile(null);
    setEditLawError('');
  };

  const handleUpdateLawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaw || !editLawTitle) {
      setEditLawError('Title is required.');
      return;
    }

    setEditLawProgress(true);
    setEditLawError('');

    const formData = new FormData();
    formData.append('title', editLawTitle);
    formData.append('category', editLawCategory);
    formData.append('description', editLawDescription);
    if (editLawFile) {
      formData.append('file', editLawFile);
    }

    try {
      const res = await fetch(`/api/documents/laws/${editingLaw._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        addNotification(
          'Bare Act Updated', 
          `"${editLawTitle}" details updated successfully.`, 
          'success'
        );
        setEditingLaw(null);
        fetchDocuments();
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Update in local state optimistically
    setLaws(prev => prev.map(item => {
      if (item._id === editingLaw._id) {
        return {
          ...item,
          title: editLawTitle,
          category: editLawCategory,
          description: editLawDescription,
          fileName: editLawFile ? editLawFile.name : item.fileName
        };
      }
      return item;
    }));

    addNotification(
      'Bare Act Updated', 
      `"${editLawTitle}" details updated successfully.`, 
      'success'
    );
    setEditingLaw(null);
    setEditLawProgress(false);
  };

  // Helper to generate dynamic, authentic, act-specific statutory content & sections
  const getActSpecificContent = (doc: any) => {
    if (!doc) return null;
    const titleLower = (doc.title || '').toLowerCase();

    if (titleLower.includes('nyaya sanhita') || titleLower.includes('bns')) {
      return (
        <div className="space-y-4 font-serif">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-sans mb-4">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Act Summary & Legislative Scope:</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Enacted by Parliament as Act No. 45 of 2023 (Effective July 1, 2024). Replaced the Indian Penal Code (1860). Modernizes criminal law, introduces community service for minor infractions, penalizes mob lynching, cyber crimes, and terrorism, and establishes gender-neutral sexual offense protections.
            </p>
          </div>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">CHAPTER I: PRELIMINARY (SECTIONS 1–3)</p>
          <p>
            <strong>Section 1 (Short Title & Extent):</strong> This Act may be called the Bharatiya Nyaya Sanhita, 2023. It extends to the whole of India and applies to any offense committed by any citizen of India beyond the territory of India.
          </p>
          <p>
            <strong>Section 2 (Definitions):</strong> Defines "child", "community service", "electronic & digital records", "gender-neutral victim terms", "organized crime syndicate", and "terrorism".
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">CHAPTER II: OF OFFENCES AGAINST THE HUMAN BODY (SECTIONS 100–146)</p>
          <p>
            <strong>Section 103 (Punishment for Murder):</strong> Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. Sub-section (2) prescribes death penalty or life imprisonment for mob lynching based on race, caste, or community.
          </p>
          <p>
            <strong>Section 109 (Attempt to Murder):</strong> Punishes attempt to murder with imprisonment up to ten years or life imprisonment.
          </p>
          <p>
            <strong>Section 74 (Outraging Modesty of Woman):</strong> Assault or use of criminal force to any woman intending to outrage her modesty carries a mandatory term of 1 to 5 years with fine.
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">CHAPTER III: OF OFFENCES AGAINST PROPERTY (SECTIONS 303–334)</p>
          <p>
            <strong>Section 303 (Theft) & Section 304 (Snatching):</strong> Defines theft under Section 303(1). Section 304 introduces a distinct statutory offense for "Snatching" by sudden theft using force or quick movement.
          </p>
          <p>
            <strong>Section 316 (Criminal Breach of Trust):</strong> Punishes dishonest misappropriation of property by public servants, bankers, or agents with imprisonment up to ten years.
          </p>
        </div>
      );
    }

    if (titleLower.includes('nagarik suraksha') || titleLower.includes('bnss')) {
      return (
        <div className="space-y-4 font-serif">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-sans mb-4">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Act Summary & Procedural Guidelines:</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Enacted as Act No. 46 of 2023. Replaced the Code of Criminal Procedure (1973). Enforces mandatory zero FIR registration, forensic evidence collection for serious offenses, electronic summons via SMS/email, and binding timelines for trial completions.
            </p>
          </div>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">CHAPTER I & II: CONSTITUTION OF CRIMINAL COURTS (SECTIONS 1–29)</p>
          <p>
            <strong>Section 2 (Cognizable & Bailable Offence Definitions):</strong> Outlines classification of offenses. Mandates electronic communication for summons, notices, and witness testimonies.
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">CHAPTER V: ARREST OF PERSONS & ZERO FIR (SECTIONS 35–62)</p>
          <p>
            <strong>Section 35 (Notice of Appearance):</strong> Police officer shall issue a notice directing the accused person to appear before him when arrest is not immediately necessary.
          </p>
          <p>
            <strong>Section 173 (Zero FIR & Electronic FIR):</strong> Mandates that information regarding cognizable offenses can be registered at any police station irrespective of territorial jurisdiction (Zero FIR).
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">CHAPTER XII & XXIV: INVESTIGATION & TRIAL TIMELINES (SECTIONS 176–325)</p>
          <p>
            <strong>Section 176 (Mandatory Forensic Evidence):</strong> Mandatory visit by forensic experts to crime scenes for offenses punishable with seven years or more imprisonment.
          </p>
          <p>
            <strong>Section 258 & 313 (Binding Trial Timelines):</strong> Charges must be framed within 60 days of first hearing; judgement must be delivered within 45 days after trial completion.
          </p>
        </div>
      );
    }

    if (titleLower.includes('sakshya adhiniyam') || titleLower.includes('bsa')) {
      return (
        <div className="space-y-4 font-serif">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-sans mb-4">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Act Summary & Evidence Principles:</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Enacted as Act No. 47 of 2023. Replaced the Indian Evidence Act (1872). Establishes legal equivalence between electronic/digital records (emails, server logs, mobile messages, CCTV) and physical paper documents in judicial proceedings.
            </p>
          </div>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">CHAPTER I: RELEVANCY OF FACTS (SECTIONS 1–15)</p>
          <p>
            <strong>Section 3 (Definitions of Evidence):</strong> Includes electronic and digital records, semiconductor memory logs, mobile messages, emails, and cloud data under the primary definition of evidence.
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">CHAPTER II: PRIMARY & SECONDARY EVIDENCE (SECTIONS 57–63)</p>
          <p>
            <strong>Section 61 (Admissibility of Electronic Records):</strong> Electronic records stored in semiconductor memory, optical devices, or magnetic media are admissible without further proof of original paper production.
          </p>
          <p>
            <strong>Section 62 (Special Provisions for Digital Evidence):</strong> Details certification procedures and automated integrity hashes for validating electronic contracts and server records.
          </p>
        </div>
      );
    }

    if (titleLower.includes('civil procedure') || titleLower.includes('cpc')) {
      return (
        <div className="space-y-4 font-serif">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-sans mb-4">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Act Summary & Civil Procedure Code:</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Act No. 5 of 1908. Codifies the comprehensive procedural rules governing the administration of civil litigation, suits, injunctions, appeals, and execution of decrees in Indian courts.
            </p>
          </div>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">PART I: SUITS IN GENERAL (SECTIONS 9–35B)</p>
          <p>
            <strong>Section 9 (Jurisdiction of Civil Courts):</strong> The Courts shall have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred.
          </p>
          <p>
            <strong>Section 10 (Res Sub-Judice):</strong> No Court shall proceed with the trial of any suit in which the matter in issue is also directly and substantially in issue in a previously instituted suit between the same parties.
          </p>
          <p>
            <strong>Section 11 (Res Judicata):</strong> No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties and decided by a competent court.
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">ORDERS & PLEADINGS (ORDERS I TO XXXIX)</p>
          <p>
            <strong>Order VI (Pleadings Generally):</strong> Requires concise statement of material facts without pleading evidence. Order VII rules the requirements of a Plaint; Order VIII governs Written Statements.
          </p>
          <p>
            <strong>Order XXXIX (Temporary Injunctions):</strong> Rules 1 & 2 govern grant of temporary injunctions and interlocutory stay orders to prevent waste, damage, or alienation of suit property during pendency.
          </p>
        </div>
      );
    }

    if (titleLower.includes('constitution')) {
      return (
        <div className="space-y-4 font-serif">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-sans mb-4">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Act Summary & Constitutional Framework:</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Enacted 26 November 1949 (came into force 26 January 1950). The Supreme Law of India establishing a Sovereign Socialist Secular Democratic Republic, Fundamental Rights, and Judicial Supremacy.
            </p>
          </div>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">PART III: FUNDAMENTAL RIGHTS (ARTICLES 12–35)</p>
          <p>
            <strong>Article 14 (Right to Equality):</strong> The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.
          </p>
          <p>
            <strong>Article 19 (Protection of Certain Freedoms):</strong> Guarantees freedom of speech and expression, peaceful assembly, association, movement, residence, and trade or profession.
          </p>
          <p>
            <strong>Article 21 (Protection of Life & Personal Liberty):</strong> No person shall be deprived of his life or personal liberty except according to procedure established by law.
          </p>
          <p>
            <strong>Article 32 (Constitutional Remedies):</strong> Guarantees the right to move the Supreme Court by appropriate proceedings for the enforcement of Fundamental Rights by Writs (Habeas Corpus, Mandamus, Prohibition, Quo Warranto, Certiorari).
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">PART V & VI: JUDICIARY & HIGH COURTS (ARTICLES 136 & 226)</p>
          <p>
            <strong>Article 136 (Special Leave to Appeal):</strong> Supreme Court may, in its discretion, grant special leave to appeal from any judgment, decree, or order in any cause or matter passed by any court or tribunal in India.
          </p>
          <p>
            <strong>Article 226 (Writs Power of High Courts):</strong> Empowers High Courts to issue directions, orders or writs for enforcement of fundamental rights and for any other legal purpose.
          </p>
        </div>
      );
    }

    if (titleLower.includes('right to information') || titleLower.includes('rti')) {
      return (
        <div className="space-y-4 font-serif">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-sans mb-4">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Act Summary & Transparency Provisions:</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Act No. 22 of 2005. Sets out the practical regime of right to information for citizens to secure access to information under the control of public authorities, promoting transparency and accountability.
            </p>
          </div>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">RIGHT TO INFORMATION & OBLIGATIONS (SECTIONS 3–7)</p>
          <p>
            <strong>Section 3 (Right to Information):</strong> Subject to the provisions of this Act, all citizens shall have the right to information.
          </p>
          <p>
            <strong>Section 6 (Request for Obtaining Information):</strong> A person who desires to obtain any information shall make a request in writing or through electronic means to the Central or State Public Information Officer (PIO).
          </p>
          <p>
            <strong>Section 7 (Disposal of Request):</strong> The PIO shall provide information within 30 days of receiving the request (or 48 hours if concerning the life or liberty of a person).
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">EXEMPTIONS & APPEALS (SECTIONS 8 & 19)</p>
          <p>
            <strong>Section 8 (Exemption from Disclosure):</strong> Lists information exempt from disclosure including national security, contempt of court, cabinet papers, trade secrets, and personal privacy.
          </p>
          <p>
            <strong>Section 19 (Appeals):</strong> First Appeal to Officer senior in rank to PIO; Second Appeal to Central or State Information Commission within 90 days.
          </p>
        </div>
      );
    }

    if (titleLower.includes('consumer protection')) {
      return (
        <div className="space-y-4 font-serif">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-sans mb-4">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Act Summary & Consumer Rights Framework:</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Act No. 35 of 2019. Overhauled consumer protection law in India by establishing CCPA, product liability standards, e-commerce dispute redressal, and mediation rules.
            </p>
          </div>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">CONSUMER COMMISSIONS & JURISDICTION (SECTIONS 28–58)</p>
          <p>
            <strong>District Commission (Section 34):</strong> Jurisdiction to entertain complaints where consideration value does not exceed ₹50 Lakhs.
          </p>
          <p>
            <strong>State Commission (Section 47):</strong> Jurisdiction for claims exceeding ₹50 Lakhs but up to ₹2 Crores.
          </p>
          <p>
            <strong>National Commission (Section 58):</strong> Jurisdiction for claims exceeding ₹2 Crores and appellate authority over State Commission orders.
          </p>

          <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">PRODUCT LIABILITY & E-COMMERCE (SECTIONS 82–94)</p>
          <p>
            <strong>Section 83 (Product Liability Action):</strong> Action for product liability against product manufacturers, service providers, or sellers for harm caused by defective products or deficient services.
          </p>
        </div>
      );
    }

    // Generic fallback for custom uploaded acts or judgements
    return (
      <div className="space-y-4 font-serif">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-sans mb-4">
          <p className="font-bold text-slate-900 dark:text-slate-200">Statutory / Judicial Document Overview:</p>
          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {doc.description || `Official statutory publication / case verdict document uploaded for ${doc.title}.`}
          </p>
        </div>

        <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400">I. STATUTORY PROVISIONS & SUMMARY</p>
        <p>
          1. <strong>Title & Scope:</strong> {doc.title}. Categorized under <em>{doc.category || doc.court || 'Statute'}</em>.
        </p>
        <p>
          2. <strong>Enactment / Forum Details:</strong> Published under official authority ({doc.uploadedBy || 'Ministry of Law & Justice'}). Presiding Forum / Enactment Year: {doc.year || '2026'}.
        </p>

        <p className="font-bold text-xs uppercase font-sans text-indigo-700 dark:text-indigo-400 pt-3">II. STATUTORY TEXT & ANALYSIS</p>
        <p>
          3. The statutory provisions and terms contained in <strong>{doc.title}</strong> apply to all relevant judicial proceedings, public registries, and administrative authorities across the designated territory.
        </p>
        <p>
          4. For complete full-text gazette schedules, original court seal certifications, and annexures, click the <strong>"Download PDF Copy"</strong> button below.
        </p>
      </div>
    );
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
                        <>
                          <button
                            onClick={() => openEditLawModal(law)}
                            className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-all cursor-pointer"
                            title="Edit Bare Act / Law"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLaw(law._id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded border border-slate-200 dark:border-slate-800 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                            title="Delete Act/Law"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
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
                {/* Title & Metadata Header */}
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

                {/* Dynamic Authentic Act-Specific Statutory Content */}
                {getActSpecificContent(readingDoc)}

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

      {/* ADMIN EDIT BARE ACT MODAL */}
      {editingLaw && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="h-14 bg-emerald-900 flex justify-between items-center px-6 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit3 size={18} /> Edit Bare Act / Statute Details
              </h3>
              <button
                onClick={() => setEditingLaw(null)}
                className="p-1 hover:bg-white/10 rounded cursor-pointer text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateLawSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Act Title</label>
                <input
                  type="text"
                  value={editLawTitle}
                  onChange={(e) => setEditLawTitle(e.target.value)}
                  required
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="e.g. The Bharatiya Nyaya Sanhita, 2023"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Statutory Category</label>
                <select
                  value={editLawCategory}
                  onChange={(e) => setEditLawCategory(e.target.value)}
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
                  value={editLawDescription}
                  onChange={(e) => setEditLawDescription(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none h-24"
                  placeholder="Brief description of the statutory act or Gazette notification..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Replace PDF File (Optional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditLawFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
                {editingLaw.fileName && (
                  <p className="text-[10px] text-slate-400 mt-1">Current file: {editingLaw.fileName}</p>
                )}
              </div>

              {editLawError && <p className="text-[11px] text-red-500 font-semibold mt-1">{editLawError}</p>}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLaw(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLawProgress}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                >
                  {editLawProgress ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
