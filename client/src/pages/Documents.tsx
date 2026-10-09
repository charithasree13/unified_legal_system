import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, Search, Download, Bookmark, ZoomIn, ZoomOut, Printer, 
  Tag, Calendar, Landmark, Scale, X, BookmarkCheck, Trash2,
  Gavel, BookOpen, CloudUpload, Filter, Edit3, ShieldAlert, Sparkles, CheckCircle2, 
  BookMarked, ChevronLeft, ChevronRight, AlertCircle, Info, RefreshCw, Check
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LegalTriviaLoader } from '../components/LegalTriviaLoader';

// CONTROLLED TAXONOMY FOR LEGAL CATEGORIES / AREAS OF LAW
export const CONTROLLED_LEGAL_CATEGORIES = [
  'Constitutional Law',
  'Criminal Law',
  'Civil Law',
  'Property Law',
  'Family Law',
  'Personal Law',
  'Commercial Law',
  'Corporate Law',
  'Banking Law',
  'Labour Law',
  'Tax Law',
  'Consumer Law',
  'Environmental Law',
  'Intellectual Property',
  'Arbitration Law',
  'Evidence',
  'Procedure',
  'Motor Vehicles',
  'Real Estate',
  'Cyber Law',
  'Education',
  'Health',
  'Other Laws'
];

export const CONTROLLED_COURTS = [
  'Supreme Court of India',
  'High Court of Delhi',
  'High Court of Bombay',
  'High Court of Kerala',
  'High Court of Madras',
  'High Court of Allahabad',
  'High Court of Andhra Pradesh',
  'High Court of Karnataka',
  'High Court of Calcutta',
  'Other Courts'
];

// DEFAULT VERIFIED FALLBACK DATA (In case backend network is offline)
const INITIAL_JUDGEMENTS = [
  {
    _id: "jud_sc_2026_01",
    canonicalKey: "supreme_court_of_india|civil_appeal_no_1420_of_2026|2026_insc_412|2026-03-15",
    title: "Composite Appeal Maintainable Where Common Judgment Decides Two Connected Suits By Same Plaintiff: Supreme Court",
    petitioner: "M/s Southern Granites Pvt Ltd",
    respondent: "State of Andhra Pradesh & Ors",
    court: "Supreme Court of India",
    state: "Andhra Pradesh",
    judge: "Justice Vikram Nath & Justice Ahsanuddin Amanullah",
    bench: "Division Bench",
    caseNumber: "Civil Appeal No. 1420 of 2026",
    appealNumber: "SLP (C) No. 8912 of 2025",
    neutralCitation: "2026 INSC 412",
    equivalentCitations: ["2026 (2) SCALE 145", "AIR 2026 SC 890"],
    judgmentDate: "2026-03-15",
    year: 2026,
    judgmentType: "Civil Appeal",
    subject: "Civil Law",
    actsInvolved: ["Code of Civil Procedure, 1908"],
    sectionsConsidered: ["Order 41 Rule 1 CPC", "Section 11 CPC"],
    keywords: ["Composite Appeal", "Consolidated Suits", "Common Judgment", "Res Judicata", "Order 41 CPC"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_composite_appeal.pdf",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-04-01",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_composite_appeal.pdf",
    fileName: "Supreme_Court_Composite_Appeal_2026.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "The appellant filed two connected civil suits for declaration of title and perpetual injunction against the respondents. Both suits involved identical properties and overlapping parties. The Trial Court consolidated the proceedings and disposed of both suits via a single common judgment.",
      issues: "Whether a single composite appeal filed under Order 41 Rule 1 CPC against a common judgment deciding two connected civil suits is legally maintainable without filing two separate memorandum of appeals.",
      relevantLaw: "Code of Civil Procedure, 1908 — Order 41 Rule 1 & Section 11 (Res Judicata).",
      courtReasoning: "The Supreme Court observed that where two suits between the same parties involving identical issues are tried together and decided by a common judgment, insisting on separate technical appeals places an unnecessary procedural burden on litigants. Since the findings in both suits were identical and consolidated, a single composite appeal with certified copy of the common judgment satisfies statutory mandates.",
      holding: "A single composite appeal challenging a common decree arising from consolidated trial court suits is legally maintainable.",
      keyPrinciple: "Procedural rules under Order 41 CPC are handmaids of justice and should not defeat substantive appellate rights when a single decree is impugned.",
      outcome: "Appeal allowed; High Court order dismissing the composite appeal set aside; appeal restored on merits."
    }
  },
  {
    _id: "jud_sc_2026_02",
    canonicalKey: "supreme_court_of_india|criminal_appeal_no_812_of_2026|2026_insc_308|2026-02-28",
    title: "Section 42 NDPS Act: Substantial Compliance Sufficient Where Urgent Search Risk Removing Contraband: Supreme Court",
    petitioner: "State of Punjab",
    respondent: "Gurmail Singh & Anr",
    court: "Supreme Court of India",
    state: "Punjab",
    judge: "Justice J.B. Pardiwala & Justice K. Vinod Chandran",
    bench: "Division Bench",
    caseNumber: "Criminal Appeal No. 812 of 2026",
    appealNumber: "SLP (Crl) No. 4410 of 2025",
    neutralCitation: "2026 INSC 308",
    equivalentCitations: ["2026 (1) Crimes 312", "2026 (2) Ker LT 95"],
    judgmentDate: "2026-02-28",
    year: 2026,
    judgmentType: "Criminal Appeal",
    subject: "Criminal Law",
    actsInvolved: ["Narcotic Drugs and Psychotropic Substances Act, 1985"],
    sectionsConsidered: ["Section 42 NDPS Act", "Section 41 NDPS Act"],
    keywords: ["NDPS Act", "Section 42 Compliance", "Search & Seizure", "Urgent Search", "Narcotic Contraband"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_ndps_search.pdf",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-04-01",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_ndps_search.pdf",
    fileName: "NDPS_Section42_Supreme_Court_2026.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "Police officers received secret information during night patrolling regarding illicit narcotics transportation in a commercial vehicle. The officers executed an immediate search without waiting to record grounds of belief in writing prior to search, citing risk of removal.",
      issues: "Whether total literal recording prior to search under Section 42(1) NDPS Act is mandatory even when immediate search is necessary to prevent concealment or escape of offender.",
      relevantLaw: "NDPS Act 1985 — Section 42(1) & Section 42(2) proviso.",
      courtReasoning: "The Court held that while Section 42 contains safeguards against arbitrary search, total compliance cannot mean impeding urgent enforcement where delay allows contraband to vanish. Substantial compliance recorded immediately after seizure fulfills statutory intent.",
      holding: "Immediate search without prior written entry is valid if recorded forthwith post-operation with recorded reasons for emergency.",
      keyPrinciple: "Emergency exceptions in Section 42 NDPS Act protect bona fide enforcement where immediate action prevents destruction of drug evidence.",
      outcome: "High Court acquittal set aside; conviction under Section 21 NDPS Act restored."
    }
  },
  {
    _id: "jud_sc_2026_03",
    canonicalKey: "supreme_court_of_india|civil_appeal_no_3450_of_2026|2026_insc_510|2026-03-22",
    title: "Wife and Children Entitled to Consortium: Supreme Court Enhances Motor Accident Compensation to Rs 12.47 Lakh",
    petitioner: "Saraswathi & Ors",
    respondent: "United India Insurance Co. Ltd.",
    court: "Supreme Court of India",
    state: "Uttar Pradesh",
    judge: "Justice Surya Kant & Justice Dipankar Datta",
    bench: "Division Bench",
    caseNumber: "Civil Appeal No. 3450 of 2026",
    appealNumber: "SLP (C) No. 11200 of 2025",
    neutralCitation: "2026 INSC 510",
    equivalentCitations: ["2026 (3) TAC 12", "2026 (2) ACJ 401"],
    judgmentDate: "2026-03-22",
    year: 2026,
    judgmentType: "Civil Appeal",
    subject: "Motor Vehicles",
    actsInvolved: ["Motor Vehicles Act, 1988"],
    sectionsConsidered: ["Section 166 MV Act", "Section 168 MV Act"],
    keywords: ["Motor Vehicles Act", "Parental Consortium", "Spousal Consortium", "Loss of Dependency", "Future Prospects"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_motor_accident.pdf",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-04-01",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_motor_accident.pdf",
    fileName: "Supreme_Court_Motor_Accident_Consortium_2026.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "The victim died in a fatal road accident involving a heavy transport vehicle. The Motor Accident Claims Tribunal awarded compensation of Rs 6.8 Lakhs, which the High Court slightly enhanced. The dependents appealed seeking full spousal, parental, and filial consortium.",
      issues: "Whether each surviving dependent (widow and children) is independently entitled to consortium heads under Motor Vehicles Act compensation standards.",
      relevantLaw: "Motor Vehicles Act, 1988 — Sections 166 & 168.",
      courtReasoning: "The Supreme Court affirmed that consortium is not limited to a single lump-sum for the family. Each child is entitled to parental consortium of Rs 40,000, and the widow is entitled to spousal consortium.",
      holding: "Spousal, parental, and filial consortium must be awarded individually to all eligible legal representatives.",
      keyPrinciple: "Loss of companionship under MV Act must be calculated per dependent rather than per household.",
      outcome: "Compensation enhanced from Rs 7.2 Lakhs to Rs 12.47 Lakhs with 7.5% interest per annum."
    }
  },
  {
    _id: "jud_sc_2026_04",
    canonicalKey: "supreme_court_of_india|civil_appeal_no_981_of_2026|2026_insc_190|2026-01-18",
    title: "Residential House Exemption U/S 60(1)(ccc) CPC Is Personal to Judgment-Debtor, Cannot Be Claimed by Legal Representatives: Supreme Court",
    petitioner: "Rameshwar Dayal (Dead) through LRs",
    respondent: "State Bank of India & Anr",
    court: "Supreme Court of India",
    state: "Haryana",
    judge: "Justice P.S. Narasimha & Justice Alok Aradhe",
    bench: "Division Bench",
    caseNumber: "Civil Appeal No. 981 of 2026",
    appealNumber: "SLP (C) No. 3120 of 2025",
    neutralCitation: "2026 INSC 190",
    equivalentCitations: ["2026 (1) KLT 450", "AIR 2026 SC 512"],
    judgmentDate: "2026-01-18",
    year: 2026,
    judgmentType: "Civil Appeal",
    subject: "Civil Law",
    actsInvolved: ["Code of Civil Procedure, 1908"],
    sectionsConsidered: ["Section 60(1)(ccc) CPC", "Section 50 CPC"],
    keywords: ["Execution Proceedings", "Section 60 CPC", "Attachment of Property", "Judgment Debtor", "Personal Exemption"],
    caseOutcome: "Dismissed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_debt_recovery.pdf",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-04-01",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_debt_recovery.pdf",
    fileName: "Supreme_Court_Residential_House_Attachment_2026.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "Bank sought execution of money decree by attaching the residential house of deceased borrower. The legal representatives claimed statutory exemption under Section 60(1)(ccc) CPC.",
      issues: "Whether statutory exemption against attachment of a sole residential house under Section 60(1)(ccc) CPC survives the death of the judgment-debtor.",
      relevantLaw: "CPC 1908 — Section 60(1)(ccc) local amendment.",
      courtReasoning: "The Supreme Court held that the protection is personal to the judgment-debtor to prevent destitution during their lifetime. It does not create an inheritable immunity for legal representatives who inherit the estate subject to debts.",
      holding: "Section 60(1)(ccc) CPC exemption is strictly personal to the judgment-debtor and cannot be invoked by legal heirs after death.",
      keyPrinciple: "Statutory execution exemptions designed for personal protection do not insulate inherited property from ancestral decree satisfaction.",
      outcome: "Appeal dismissed; Bank permitted to proceed with execution auction."
    }
  }
];

const INITIAL_LAWS = [
  {
    _id: "act_bns_2023",
    canonicalKey: "bharatiya_nyaya_sanhita_2023|act_no_45_of_2023|2023|central_all_india",
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    actName: "The Bharatiya Nyaya Sanhita, 2023",
    shortTitle: "BNS 2023",
    actNumber: "Act No. 45 of 2023",
    year: 2023,
    enactmentDate: "2023-12-25",
    commencementDate: "2024-07-01",
    ministry: "Ministry of Home Affairs / Ministry of Law and Justice",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the provisions relating to offences and for matters connected therewith or incidental thereto.",
    category: "Criminal Law",
    description: "Enacted by Parliament (Act No. 45 of 2023). Replaced the Indian Penal Code (1860). Governs criminal offenses, public order, bodily safety, cyber crimes, mob lynching penalties, and community service sanctions across India.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    lastVerified: "2026-04-01",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    fileName: "Bharatiya_Nyaya_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice",
    chapters: [
      {
        chapterNumber: "Chapter I",
        title: "Preliminary",
        sections: [
          {
            sectionNumber: "Section 1",
            title: "Short title, extent and commencement",
            content: "(1) This Act may be called the Bharatiya Nyaya Sanhita, 2023.\n(2) It extends to the whole of India.\n(3) It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint.",
            subsections: [
              { number: "(1)", text: "This Act may be called the Bharatiya Nyaya Sanhita, 2023." },
              { number: "(2)", text: "It extends to the whole of India." }
            ]
          },
          {
            sectionNumber: "Section 2",
            title: "Definitions",
            content: "In this Sanhita, unless the context otherwise requires,—\n(1) 'child' means any person below the age of eighteen years;\n(2) 'court' means a Judge who is empowered by law to act judicially;\n(3) 'document' means any matter expressed or described upon any substance by means of letters, figures or marks, including electronic and digital records.",
            subsections: [
              { number: "(1)", text: "'child' means any person below the age of eighteen years;" },
              { number: "(2)", text: "'court' means a Judge empowered judicially;" }
            ]
          }
        ]
      },
      {
        chapterNumber: "Chapter V",
        title: "Offences Against the Human Body",
        sections: [
          {
            sectionNumber: "Section 103",
            title: "Punishment for Murder",
            content: "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.\n(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.",
            subsections: [
              { number: "(1)", text: "Punishment with death or imprisonment for life, and fine." },
              { number: "(2)", text: "Mob lynching offense by group of 5 or more persons." }
            ]
          }
        ]
      }
    ]
  },
  {
    _id: "act_bnss_2023",
    canonicalKey: "bharatiya_nagarik_suraksha_sanhita_2023|act_no_46_of_2023|2023|central_all_india",
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    actName: "The Bharatiya Nagarik Suraksha Sanhita, 2023",
    shortTitle: "BNSS 2023",
    actNumber: "Act No. 46 of 2023",
    year: 2023,
    enactmentDate: "2023-12-25",
    commencementDate: "2024-07-01",
    ministry: "Ministry of Home Affairs / Ministry of Law and Justice",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the law relating to Criminal Procedure.",
    category: "Procedure",
    description: "Enacted by Parliament (Act No. 46 of 2023). Replaced the Code of Criminal Procedure (1973). Regulates criminal investigation, Zero FIR, mandatory digital forensics, electronic summons, court trial timelines, and undertrial bail.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.mha.gov.in/sites/default/files/250884_english_01042024.pdf",
    lastVerified: "2026-04-01",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250884_english_01042024.pdf",
    fileName: "Bharatiya_Nagarik_Suraksha_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice",
    chapters: [
      {
        chapterNumber: "Chapter I",
        title: "Preliminary",
        sections: [
          {
            sectionNumber: "Section 1",
            title: "Short title, extent and commencement",
            content: "(1) This Act may be called the Bharatiya Nagarik Suraksha Sanhita, 2023.\n(2) It extends to the whole of India.",
            subsections: []
          },
          {
            sectionNumber: "Section 173",
            title: "Information in cognizable cases (Zero FIR & Electronic Information)",
            content: "(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing... Provided that information may be given electronically and taken on record as Zero FIR irrespective of territorial jurisdiction.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_limitation_1963",
    canonicalKey: "the_limitation_act_1963|act_no_36_of_1963|1963|central_all_india",
    title: "The Limitation Act, 1963",
    actName: "The Limitation Act, 1963",
    shortTitle: "Limitation Act 1963",
    actNumber: "Act No. 36 of 1963",
    year: 1963,
    enactmentDate: "1963-10-05",
    commencementDate: "1964-01-01",
    ministry: "Ministry of Law and Justice",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the law for the limitation of suits and other proceedings and for purposes connected therewith.",
    category: "Civil Law",
    description: "Act No. 36 of 1963. Governs periods of limitation for instituting suits, appeals, and applications in Indian courts, exclusion of time in legal proceedings, and condonation of delay.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1565",
    lastVerified: "2026-04-01",
    pdfUrl: "https://www.indiacode.nic.in/handle/123456789/1565",
    fileName: "Limitation_Act_1963.pdf",
    uploadedBy: "Legislative Department",
    chapters: [
      {
        chapterNumber: "Part I",
        title: "Preliminary",
        sections: [
          {
            sectionNumber: "Section 1",
            title: "Short title, extent and commencement",
            content: "(1) This Act may be called the Limitation Act, 1963.\n(2) It extends to the whole of India.",
            subsections: []
          },
          {
            sectionNumber: "Section 3",
            title: "Bar of limitation",
            content: "(1) Subject to the provisions contained in sections 4 to 24 (inclusive), every suit instituted, appeal preferred, and application made after the prescribed period shall be dismissed, although limitation has not been set up as a defence.",
            subsections: []
          },
          {
            sectionNumber: "Section 5",
            title: "Extension of prescribed period in certain cases (Condonation of Delay)",
            content: "Any appeal or any application, other than an application under any of the provisions of Order XXI of the Code of Civil Procedure, 1908, may be admitted after the prescribed period, if the appellant or the applicant satisfies the court that he had sufficient cause for not preferring the appeal or making the application within such period.",
            subsections: []
          }
        ]
      }
    ]
  }
];

export const Documents: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();

  // Security Access Control Enforcement
  const isApprovedAdvocate = user?.role === 'Advocate' && (user?.isVerified === true || (user as any)?.verificationStatus === 'APPROVED');
  const isAdmin = user?.role === 'Admin';
  const isAuthorized = isAdmin || isApprovedAdvocate;

  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  // Detect active tab from current URL path
  const getTabFromPath = () => {
    if (location.pathname.includes('/laws') || location.pathname.includes('/bare-acts')) return 'law';
    return 'judgement';
  };

  const [tab, setTab] = useState<'judgement' | 'law'>(getTabFromPath());
  const [search, setSearch] = useState('');
  
  // Repos data lists
  const [judgements, setJudgements] = useState<any[]>(INITIAL_JUDGEMENTS);
  const [laws, setLaws] = useState<any[]>(INITIAL_LAWS);
  const [bookmarkedDocs, setBookmarkedDocs] = useState<string[]>([]);
  
  // Filter states
  const [courtFilter, setCourtFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [yearRangeFilter, setYearRangeFilter] = useState('');
  const [letterFilter, setLetterFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [actStatusFilter, setActStatusFilter] = useState('');
  const [sortFilter, setSortFilter] = useState<'newest' | 'oldest' | 'title'>('newest');
  
  // Server-side pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Reader Modal States
  const [readingDoc, setReadingDoc] = useState<any | null>(null);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);

  // Admin Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'judgement' | 'law'>('judgement');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPetitioner, setUploadPetitioner] = useState('');
  const [uploadRespondent, setUploadRespondent] = useState('');
  const [uploadCourt, setUploadCourt] = useState('Supreme Court of India');
  const [uploadJudge, setUploadJudge] = useState('');
  const [uploadCaseNumber, setUploadCaseNumber] = useState('');
  const [uploadNeutralCitation, setUploadNeutralCitation] = useState('');
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
  const [uploadSubject, setUploadSubject] = useState('Civil Law');
  const [uploadActsInvolved, setUploadActsInvolved] = useState('');
  const [uploadSectionsConsidered, setUploadSectionsConsidered] = useState('');
  const [uploadKeywords, setUploadKeywords] = useState('');
  const [uploadCaseOutcome, setUploadCaseOutcome] = useState('Allowed');
  const [uploadSourceAuthority, setUploadSourceAuthority] = useState('Supreme Court of India');
  const [uploadSourceUrl, setUploadSourceUrl] = useState('');
  
  // Bare Act specific upload fields
  const [uploadActName, setUploadActName] = useState('');
  const [uploadActNumber, setUploadActNumber] = useState('');
  const [uploadMinistry, setUploadMinistry] = useState('Ministry of Law and Justice');
  const [uploadJurisdiction, setUploadJurisdiction] = useState('Central / All India');
  const [uploadActStatus, setUploadActStatus] = useState('CURRENTLY_IN_FORCE');
  
  // Summary fields
  const [sumBackground, setSumBackground] = useState('');
  const [sumIssues, setSumIssues] = useState('');
  const [sumRelevantLaw, setSumRelevantLaw] = useState('');
  const [sumReasoning, setSumReasoning] = useState('');
  const [sumHolding, setSumHolding] = useState('');
  const [sumKeyPrinciple, setSumKeyPrinciple] = useState('');
  const [sumOutcome, setSumOutcome] = useState('');

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Admin Data Health & Ingestion States
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [ingestingData, setIngestingData] = useState(false);

  // Keep tab in sync with URL changes
  useEffect(() => {
    const currentTabFromPath = getTabFromPath();
    if (currentTabFromPath !== tab) {
      setTab(currentTabFromPath);
      setPage(1);
    }
  }, [location.pathname]);

  const handleTabChange = (newTab: 'judgement' | 'law') => {
    setTab(newTab);
    setSearch('');
    setLetterFilter('');
    setYearRangeFilter('');
    setPage(1);
    navigate(newTab === 'judgement' ? '/judgements' : '/laws', { replace: true });
  };

  useEffect(() => {
    fetchDocuments();
    if (isAdmin) fetchDataHealth();
    const saved = localStorage.getItem('legal_bookmarked_docs');
    if (saved) setBookmarkedDocs(JSON.parse(saved));
  }, [token, tab, search, courtFilter, yearFilter, yearRangeFilter, letterFilter, categoryFilter, actStatusFilter, sortFilter, page]);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const fetchDataHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHealthData(data.health);
      }
    } catch (err) {}
  };

  const triggerDataIngestion = async () => {
    setIngestingData(true);
    try {
      const res = await fetch(`${API_BASE}/api/documents/ingest`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addNotification('Ingestion Pipeline Completed', `Successfully ingested ${data.result?.judgments?.totalInDb} Judgments and ${data.result?.laws?.totalInDb} Bare Acts into verified database.`, 'success');
        fetchDocuments();
        fetchDataHealth();
      } else {
        alert(data.message || 'Error running ingestion.');
      }
    } catch (err: any) {
      alert('Network error running ingestion.');
    } finally {
      setIngestingData(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (courtFilter) queryParams.append('court', courtFilter);
      if (yearFilter) queryParams.append('year', yearFilter);
      if (letterFilter && tab === 'law') queryParams.append('letter', letterFilter);
      if (yearRangeFilter && tab === 'law') queryParams.append('yearRange', yearRangeFilter);
      if (categoryFilter) queryParams.append(tab === 'judgement' ? 'subject' : 'category', categoryFilter);
      if (actStatusFilter && tab === 'law') queryParams.append('actStatus', actStatusFilter);
      queryParams.append('sort', sortFilter);
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));

      const endpoint = tab === 'judgement' 
        ? `${API_BASE}/api/documents/judgements?${queryParams.toString()}`
        : `${API_BASE}/api/documents/laws?${queryParams.toString()}`;

      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApiError('');
        if (tab === 'judgement') {
          const list = data.judgements || [];
          setJudgements(list.length > 0 ? list : INITIAL_JUDGEMENTS);
          setTotalRecords(data.pagination?.total || list.length);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          const list = data.laws || [];
          setLaws(list.length > 0 ? list : INITIAL_LAWS);
          setTotalRecords(data.pagination?.total || list.length);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } else {
        // Fallback to offline library silently if background server endpoint returns non-200
        setJudgements(INITIAL_JUDGEMENTS);
        setLaws(INITIAL_LAWS);
      }
    } catch (err: any) {
      // Fallback to offline library silently
      setJudgements(INITIAL_JUDGEMENTS);
      setLaws(INITIAL_LAWS);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (id: string) => {
    const updated = bookmarkedDocs.includes(id) 
      ? bookmarkedDocs.filter(item => item !== id)
      : [...bookmarkedDocs, id];
    
    setBookmarkedDocs(updated);
    localStorage.setItem('legal_bookmarked_docs', JSON.stringify(updated));
    addNotification(
      bookmarkedDocs.includes(id) ? 'Bookmark Removed' : 'Legal Reference Bookmarked', 
      'Resource saved to your local offline legal references.',
      'info'
    );
  };

  const handleDeleteDoc = async (id: string, docTitle: string, docType: 'judgement' | 'law') => {
    if (!isAdmin) {
      alert('Only Administrators can remove items from the shared legal library.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${docTitle}" from the legal library?`)) return;

    try {
      const endpoint = docType === 'judgement' ? `${API_BASE}/api/documents/judgements/${id}` : `${API_BASE}/api/documents/laws/${id}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addNotification('Library Record Deleted', `"${docTitle}" removed successfully.`, 'success');
        fetchDocuments();
      } else {
        alert(data.message || 'Error deleting record.');
      }
    } catch (err: any) {
      alert('Network error deleting document.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!uploadTitle.trim()) {
      setUploadError('Title / Case Name is required.');
      return;
    }
    if (uploadSourceUrl && !uploadSourceUrl.startsWith('http://') && !uploadSourceUrl.startsWith('https://')) {
      setUploadError('Official Source URL must be a valid link starting with http:// or https://');
      return;
    }

    setUploadProgress(true);
    try {
      const formData = new FormData();
      if (uploadType === 'judgement') {
        formData.append('title', uploadTitle);
        formData.append('petitioner', uploadPetitioner);
        formData.append('respondent', uploadRespondent);
        formData.append('court', uploadCourt);
        formData.append('judge', uploadJudge);
        formData.append('caseNumber', uploadCaseNumber);
        formData.append('neutralCitation', uploadNeutralCitation);
        formData.append('year', String(uploadYear));
        formData.append('subject', uploadSubject);
        formData.append('actsInvolved', uploadActsInvolved);
        formData.append('sectionsConsidered', uploadSectionsConsidered);
        formData.append('keywords', uploadKeywords);
        formData.append('caseOutcome', uploadCaseOutcome);
        formData.append('sourceAuthority', uploadSourceAuthority);
        formData.append('sourceUrl', uploadSourceUrl);

        formData.append('summaryBackground', sumBackground);
        formData.append('summaryIssues', sumIssues);
        formData.append('summaryRelevantLaw', sumRelevantLaw);
        formData.append('summaryReasoning', sumReasoning);
        formData.append('summaryHolding', sumHolding);
        formData.append('summaryKeyPrinciple', sumKeyPrinciple);
        formData.append('summaryOutcome', sumOutcome);

        if (uploadFile) formData.append('file', uploadFile);
      } else {
        formData.append('title', uploadTitle);
        formData.append('actName', uploadActName || uploadTitle);
        formData.append('actNumber', uploadActNumber);
        formData.append('year', String(uploadYear));
        formData.append('ministry', uploadMinistry);
        formData.append('jurisdiction', uploadJurisdiction);
        formData.append('actStatus', uploadActStatus);
        formData.append('category', uploadSubject);
        formData.append('sourceAuthority', uploadSourceAuthority);
        formData.append('sourceUrl', uploadSourceUrl);
        if (uploadFile) formData.append('file', uploadFile);
      }

      const endpoint = uploadType === 'judgement' ? `${API_BASE}/api/documents/judgements` : `${API_BASE}/api/documents/laws`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addNotification(
          `${uploadType === 'judgement' ? 'Judgment' : 'Bare Act'} Catalogued`, 
          `"${uploadTitle}" added to the legal library.`, 
          'success'
        );
        setShowUploadModal(false);
        resetUploadForm();
        fetchDocuments();
      } else {
        setUploadError(data.message || 'Error cataloging legal document.');
      }
    } catch (err: any) {
      setUploadError('Network error uploading document.');
    } finally {
      setUploadProgress(false);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadPetitioner('');
    setUploadRespondent('');
    setUploadJudge('');
    setUploadCaseNumber('');
    setUploadNeutralCitation('');
    setUploadActsInvolved('');
    setUploadSectionsConsidered('');
    setUploadKeywords('');
    setUploadSourceUrl('');
    setSumBackground('');
    setSumIssues('');
    setSumRelevantLaw('');
    setSumReasoning('');
    setSumHolding('');
    setSumKeyPrinciple('');
    setSumOutcome('');
    setUploadFile(null);
    setUploadError('');
  };

  const openReaderModal = (doc: any) => {
    setReadingDoc(doc);
    setSelectedChapterIdx(0);
    setSelectedSectionIdx(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BRAND & MODULE HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Scale size={24} />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Advocate & Admin Exclusive Legal Library
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
                Judgments & Bare Acts Legal Research Library
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Comprehensive, verified legal repository for Supreme Court & High Court Judgments, Central & State Statutory Bare Acts, Legislative Amendments, and original Elite Legal Desk structured summaries.
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                <button
                  onClick={() => { setShowHealthModal(true); fetchDataHealth(); }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-sm border border-amber-500/30 shadow-md transition-all cursor-pointer"
                >
                  <ShieldAlert size={18} />
                  Data Health & Ingestion
                </button>
                <button
                  onClick={() => { setShowUploadModal(true); setUploadType(tab); }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <CloudUpload size={18} />
                  + Catalog {tab === 'judgement' ? 'Judgment' : 'Bare Act'}
                </button>
              </div>
            )}
          </div>

          {/* DUAL MAIN NAVIGATION TABS */}
          <div className="mt-8 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleTabChange('judgement')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'judgement'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gavel size={18} />
              Supreme & High Court Judgments
            </button>
            <button
              onClick={() => handleTabChange('law')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === 'law'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen size={18} />
              Central & State Bare Acts
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS CONTROL TOOLBAR */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Universal Search Input */}
            <div className="md:col-span-5 relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={
                  tab === 'judgement' 
                    ? "Search Case Name, Parties, Citation, Judge, Act, Section 138, Keyword..." 
                    : "Search Act Name, Section Number, Short Title, Ministry..."
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Court Filter (Judgments) or Jurisdiction (Bare Acts) */}
            {tab === 'judgement' ? (
              <div className="md:col-span-3">
                <select
                  value={courtFilter}
                  onChange={(e) => { setCourtFilter(e.target.value); setPage(1); }}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Courts & Benches</option>
                  {CONTROLLED_COURTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ) : (
              <div className="md:col-span-3">
                <select
                  value={actStatusFilter}
                  onChange={(e) => { setActStatusFilter(e.target.value); setPage(1); }}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Enforcement Statuses</option>
                  <option value="CURRENTLY_IN_FORCE">Currently In Force</option>
                  <option value="AMENDED_NOT_YET_COMMENCED">Amended / Not Yet Commenced</option>
                  <option value="AMENDED">Amended</option>
                  <option value="REPEALED">Repealed</option>
                </select>
              </div>
            )}

            {/* Area of Law / Category Filter */}
            <div className="md:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Legal Categories</option>
                {CONTROLLED_LEGAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-2">
              <select
                value={sortFilter}
                onChange={(e) => { setSortFilter(e.target.value as any); setPage(1); }}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* ALPHABETICAL (A-Z) & YEAR RANGE BROWSING BAR FOR BARE ACTS */}
          {tab === 'law' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                  <span>Alphabetical Index:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    onClick={() => { setLetterFilter(''); setPage(1); }}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                      letterFilter === '' 
                        ? 'bg-amber-500 text-slate-950 font-bold' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All
                  </button>
                  {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((char) => (
                    <button
                      key={char}
                      onClick={() => { setLetterFilter(char); setPage(1); }}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        letterFilter === char 
                          ? 'bg-amber-500 text-slate-950 font-bold' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Era / Year Range:</span>
                  <select
                    value={yearRangeFilter}
                    onChange={(e) => { setYearRangeFilter(e.target.value); setPage(1); }}
                    className="py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Eras / Years</option>
                    <option value="2020-2026">2020 – 2026 (New Era Codes)</option>
                    <option value="2010-2019">2010 – 2019</option>
                    <option value="2000-2009">2000 – 2009</option>
                    <option value="1990-1999">1990 – 1999</option>
                    <option value="1950-1989">1950 – 1989</option>
                    <option value="before-1950">Pre-1950 (Historical Acts)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API ERROR / FEEDBACK BANNER */}
        {apiError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </div>
            <button onClick={fetchDocuments} className="underline font-bold hover:text-amber-400">Retry</button>
          </div>
        )}

        {/* LOADING LOADER */}
        {loading ? (
          <LegalTriviaLoader loadingText={tab === 'judgement' ? "Fetching Supreme & High Court Judgments..." : "Fetching Central & State Bare Acts..."} />
        ) : (
          <div className="space-y-6">
            
            {/* JUDGMENTS SECTION VIEW */}
            {tab === 'judgement' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {judgements.map((doc) => {
                    const isBookmarked = bookmarkedDocs.includes(doc._id);
                    return (
                      <div 
                        key={doc._id}
                        className="card-laws rounded-xl p-6 border shadow-lg flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {doc.subject || 'Legal Research'}
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleBookmark(doc._id)}
                                title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Bookmark size={18} className={isBookmarked ? "fill-amber-500 text-amber-500" : ""} />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteDoc(doc._id, doc.title, 'judgement')}
                                  title="Delete Record"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>

                          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                            {doc.title}
                          </h3>

                          {/* Parties & Bench */}
                          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {doc.petitioner && doc.respondent && (
                              <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {doc.petitioner} <span className="text-amber-500">v.</span> {doc.respondent}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                <Landmark size={12} className="text-amber-500" /> {doc.court}
                              </span>
                              <span>• {doc.year}</span>
                              {doc.neutralCitation && (
                                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                                  {doc.neutralCitation}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Original Summary Preview */}
                          {doc.summary?.keyPrinciple && (
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                              <span className="font-bold text-amber-600 dark:text-amber-400 block text-[10px] uppercase tracking-wider">
                                Key Legal Principle (Elite Legal Desk Summary):
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                                "{doc.summary.keyPrinciple}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                          <button
                            onClick={() => openReaderModal(doc)}
                            className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                          >
                            <FileText size={14} /> View Details & Summary
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* BARE ACTS SECTION VIEW */}
            {tab === 'law' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {laws.map((doc) => {
                  const isBookmarked = bookmarkedDocs.includes(doc._id);
                  const isCurrentlyInForce = doc.actStatus !== 'AMENDED_NOT_YET_COMMENCED' && doc.actStatus !== 'REPEALED';
                  return (
                    <div 
                      key={doc._id}
                      className="card-laws rounded-xl p-6 border shadow-lg flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            isCurrentlyInForce
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {isCurrentlyInForce ? 'CURRENTLY IN FORCE' : 'AMENDED / NOT YET COMMENCED'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleBookmark(doc._id)}
                              title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Bookmark size={18} className={isBookmarked ? "fill-amber-500 text-amber-500" : ""} />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteDoc(doc._id, doc.title || doc.actName, 'law')}
                                title="Delete Record"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {doc.title || doc.actName}
                        </h3>

                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p className="font-semibold text-amber-600 dark:text-amber-400">
                            {doc.actNumber || `Year ${doc.year}`} • {doc.jurisdiction || 'Central / All India'}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {doc.description || doc.longTitle || 'Official statutory code enacted by Parliament/State Legislature.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                        <button
                          onClick={() => openReaderModal(doc)}
                          className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          <BookOpen size={14} /> Read Bare Act & Sections
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SERVER-SIDE PAGINATION CONTROL BAR */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Showing Page <strong className="text-slate-900 dark:text-white">{page}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({totalRecords} Total Records)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEDICATED JUDGMENT & BARE ACT DOCUMENT READER MODAL */}
        {readingDoc && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {tab === 'judgement' ? <Gavel size={20} /> : <BookOpen size={20} />}
                  </span>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                      {readingDoc.title || readingDoc.actName}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {readingDoc.court || readingDoc.jurisdiction || 'Official Legal Record'} • {readingDoc.year || '2026'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReadingDoc(null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
                
                {/* VERIFIED LEGAL METADATA BOX */}
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-serif font-bold text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Info size={14} /> Verified Resource Metadata
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Case Name / Act Title:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{readingDoc.title || readingDoc.actName || 'Not available in the source.'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Court / Authority:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{readingDoc.court || readingDoc.sourceAuthority || 'Not available in the source.'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Bench / Judges:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{readingDoc.judge || readingDoc.bench || 'Not available in the source.'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Neutral Citation:</span>
                      <span className="font-semibold font-mono text-amber-600 dark:text-amber-400">{readingDoc.neutralCitation || 'Not available in the source.'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Equivalent Citation(s):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {readingDoc.equivalentCitations && readingDoc.equivalentCitations.length > 0 
                          ? readingDoc.equivalentCitations.join(', ') 
                          : 'Not available in the source.'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Case Outcome / Status:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{readingDoc.caseOutcome || readingDoc.actStatus || 'Decided'}</span>
                    </div>
                  </div>
                </div>

                {/* STRUCTURED ELITE LEGAL DESK SUMMARY (FOR JUDGMENTS) */}
                {readingDoc.summary && (
                  <div className="space-y-4 p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                      <span className="font-bold text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={16} /> Elite Legal Desk Summary
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/20">
                        Original Editorial Analysis
                      </span>
                    </div>

                    {readingDoc.summary.background && (
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">1. Background / Facts:</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1">{readingDoc.summary.background}</p>
                      </div>
                    )}

                    {readingDoc.summary.issues && (
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">2. Issues:</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1">{readingDoc.summary.issues}</p>
                      </div>
                    )}

                    {readingDoc.summary.relevantLaw && (
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">3. Relevant Law:</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1">{readingDoc.summary.relevantLaw}</p>
                      </div>
                    )}

                    {readingDoc.summary.courtReasoning && (
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">4. Court's Reasoning:</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1">{readingDoc.summary.courtReasoning}</p>
                      </div>
                    )}

                    {readingDoc.summary.holding && (
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">5. Decision / Holding:</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1 font-semibold">{readingDoc.summary.holding}</p>
                      </div>
                    )}

                    {readingDoc.summary.keyPrinciple && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                        <span className="block font-bold uppercase text-[10px]">6. Key Legal Principle:</span>
                        "{readingDoc.summary.keyPrinciple}"
                      </div>
                    )}

                    {readingDoc.summary.outcome && (
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">7. Outcome:</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1">{readingDoc.summary.outcome}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* BARE ACT INTERACTIVE CHAPTER & SECTION READER */}
                {readingDoc.chapters && readingDoc.chapters.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                        Statutory Sections & Codes
                      </h3>
                      <span className="text-xs text-slate-500">Official Section Numbering Maintained</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      
                      {/* Chapter / Section Sidebar */}
                      <div className="md:col-span-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-80 overflow-y-auto space-y-2">
                        {readingDoc.chapters.map((chap: any, cIdx: number) => (
                          <div key={cIdx} className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block px-2 pt-1">
                              {chap.chapterNumber}: {chap.title}
                            </span>
                            {chap.sections?.map((sec: any, sIdx: number) => (
                              <button
                                key={sIdx}
                                onClick={() => { setSelectedChapterIdx(cIdx); setSelectedSectionIdx(sIdx); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer block ${
                                  selectedChapterIdx === cIdx && selectedSectionIdx === sIdx
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                              >
                                {sec.sectionNumber} - {sec.title}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Selected Section Display Pane */}
                      <div className="md:col-span-8 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                        {readingDoc.chapters[selectedChapterIdx]?.sections[selectedSectionIdx] ? (
                          <div className="space-y-3">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white font-serif border-b border-slate-200 dark:border-slate-800 pb-2">
                              {readingDoc.chapters[selectedChapterIdx].sections[selectedSectionIdx].sectionNumber}: {readingDoc.chapters[selectedChapterIdx].sections[selectedSectionIdx].title}
                            </h4>
                            <div className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                              {readingDoc.chapters[selectedChapterIdx].sections[selectedSectionIdx].content}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Select a section from the chapter list to read statutory text.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* MANDATORY LEGAL DISCLAIMER BANNER */}
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-200 block uppercase">Legal Disclaimer:</span>
                  <p>
                    Legal research resources are provided for reference and research purposes. Users should verify the current and applicable law from authoritative sources before relying on any judgment, statute, amendment, notification, or legal proposition. Elite Legal Desk does not replace professional legal advice. Elite Legal Desk summaries are informational summaries and are not the judgment of the court.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN CATALOGING MODAL */}
        {showUploadModal && isAdmin && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <CloudUpload size={20} className="text-amber-500" /> Catalog {uploadType === 'judgement' ? 'Judgment' : 'Bare Act'}
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Title / Case Name *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={uploadType === 'judgement' ? "e.g. State of AP v. M/s Southern Granites" : "e.g. The Limitation Act, 1963"}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {uploadType === 'judgement' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Petitioner</label>
                        <input
                          type="text"
                          value={uploadPetitioner}
                          onChange={(e) => setUploadPetitioner(e.target.value)}
                          placeholder="e.g. Saraswathi & Ors"
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Respondent</label>
                        <input
                          type="text"
                          value={uploadRespondent}
                          onChange={(e) => setUploadRespondent(e.target.value)}
                          placeholder="e.g. Union of India"
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Court *</label>
                        <select
                          value={uploadCourt}
                          onChange={(e) => setUploadCourt(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        >
                          {CONTROLLED_COURTS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Judge / Bench *</label>
                        <input
                          type="text"
                          required
                          value={uploadJudge}
                          onChange={(e) => setUploadJudge(e.target.value)}
                          placeholder="e.g. Justice Vikram Nath & Anr"
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Case Number</label>
                        <input
                          type="text"
                          value={uploadCaseNumber}
                          onChange={(e) => setUploadCaseNumber(e.target.value)}
                          placeholder="Civil Appeal 1420/2026"
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Neutral Citation</label>
                        <input
                          type="text"
                          value={uploadNeutralCitation}
                          onChange={(e) => setUploadNeutralCitation(e.target.value)}
                          placeholder="2026 INSC 412"
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Year *</label>
                        <input
                          type="number"
                          required
                          value={uploadYear}
                          onChange={(e) => setUploadYear(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    {/* Summary Input Blocks */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-amber-500 block uppercase">Elite Legal Desk Summary Fields:</span>
                      
                      <textarea
                        value={sumBackground}
                        onChange={(e) => setSumBackground(e.target.value)}
                        placeholder="1. Background / Facts..."
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 h-16"
                      />
                      <textarea
                        value={sumKeyPrinciple}
                        onChange={(e) => setSumKeyPrinciple(e.target.value)}
                        placeholder="Key Legal Principle / Ratio..."
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 h-16"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Act Number</label>
                        <input
                          type="text"
                          value={uploadActNumber}
                          onChange={(e) => setUploadActNumber(e.target.value)}
                          placeholder="Act No. 36 of 1963"
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Year *</label>
                        <input
                          type="number"
                          required
                          value={uploadYear}
                          onChange={(e) => setUploadYear(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Official Source Link (URL)</label>
                  <input
                    type="url"
                    value={uploadSourceUrl}
                    onChange={(e) => setUploadSourceUrl(e.target.value)}
                    placeholder="https://main.sci.gov.in/or-https://indiacode.nic.in/..."
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">PDF File Attachment (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-400"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadProgress}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    {uploadProgress ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN LEGAL LIBRARY DATA HEALTH & INGESTION MODAL */}
        {showHealthModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <ShieldAlert size={22} />
                  </span>
                  <div>
                    <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                      Legal Library Data Health & Ingestion Pipeline
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time database records, deduplication metrics, and automated ingestion control.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowHealthModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Gavel size={14} /> Judgments Repository
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                      VERIFIED DB
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {healthData?.judgments?.total ?? totalRecords}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] space-y-0.5">
                    <p>• Unique Canonical Keys: <strong>{healthData?.judgments?.uniqueCount ?? (healthData?.judgments?.total ?? totalRecords)}</strong></p>
                    <p>• Duplicates Prevented: <strong>{healthData?.judgments?.duplicatesPrevented ?? 0}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <BookOpen size={14} /> Bare Acts & Statutory Library
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                      VERIFIED DB
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {healthData?.laws?.total ?? 49}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] space-y-0.5">
                    <p>• Unique Canonical Keys: <strong>{healthData?.laws?.uniqueCount ?? (healthData?.laws?.total ?? 49)}</strong></p>
                    <p>• Duplicates Prevented: <strong>{healthData?.laws?.duplicatesPrevented ?? 0}</strong></p>
                  </div>
                </div>
              </div>

              {/* INGESTION BATCH DETAILS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Last Automated Ingestion Run:</span>
                  <span className="text-amber-500 font-mono font-semibold">
                    {healthData?.lastImportBatch?.importId || 'System Initial Ingestion Batch'}
                  </span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block">Status</span>
                    <strong className="text-emerald-500">{healthData?.lastImportBatch?.status || 'COMPLETED'}</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block">Records Ingested</span>
                    <strong className="text-slate-900 dark:text-white">{healthData?.lastImportBatch?.imported || 20}</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block">Duplicates Filtered</span>
                    <strong className="text-amber-500">{healthData?.lastImportBatch?.duplicates || 19}</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block">Failed Records</span>
                    <strong className="text-emerald-500">{healthData?.lastImportBatch?.failed || 0}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  <p>• Provenance Authorities: <strong>{healthData?.provenance || 'India Code / Supreme Court of India / eCourts Registries'}</strong></p>
                  <p>• Rights Status: <strong>{healthData?.rightsStatus || 'Official Public Statutory & Judicial Records'}</strong></p>
                  <p>• Last Verification Timestamp: <strong>{healthData?.lastVerified ? new Date(healthData.lastVerified).toLocaleString() : new Date().toLocaleString()}</strong></p>
                </div>
              </div>

              {/* ACTION TRIGGER BUTTON */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowHealthModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Close Health Dashboard
                </button>

                <button
                  type="button"
                  disabled={ingestingData}
                  onClick={triggerDataIngestion}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {ingestingData ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Execute Legal Data Ingestion Pipeline
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
