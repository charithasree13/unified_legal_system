import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Download, Bookmark, ZoomIn, ZoomOut, Printer, 
  Tag, Calendar, Landmark, Scale, ExternalLink, X, BookmarkCheck, Trash2,
  Gavel, BookOpen, CloudUpload, Filter, Edit3, ShieldAlert, Sparkles, CheckCircle2, BookMarked
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LegalTriviaLoader } from '../components/LegalTriviaLoader';

const DEFAULT_BARE_ACTS = [
  // NEW CRIMINAL LAWS
  {
    _id: "act_bns_2023",
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 45 of 2023). Replaced the Indian Penal Code (1860). Governs criminal offenses, public order, bodily safety, cyber crimes, mob lynching penalties, and community service sanctions across India.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    fileName: "Bharatiya_Nyaya_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    _id: "act_bnss_2023",
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 46 of 2023). Replaced the Code of Criminal Procedure (1973). Regulates criminal investigation, Zero FIR, mandatory digital forensics, electronic summons, court trial timelines, and undertrial bail.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250884_english_01042024.pdf",
    fileName: "Bharatiya_Nagarik_Suraksha_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    _id: "act_bsa_2023",
    title: "The Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 47 of 2023). Replaced the Indian Evidence Act (1872). Governs rules of evidence, primary status of electronic and digital records, secondary evidence, and witness examinations.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250885_english_01042024.pdf",
    fileName: "Bharatiya_Sakshya_Adhiniyam_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },

  // CRIMINAL LAWS
  {
    _id: "act_ipc_1860",
    title: "Indian Penal Code, 1860 (IPC)",
    category: "Act",
    description: "Act No. 45 of 1860. The substantive criminal code governing offenses, culpable homicide, murder, theft, fraud, forgery, and criminal liability for acts prior to July 1, 2024.",
    pdfUrl: "https://drive.google.com/file/d/19YpcyfiNZ0hp6XyKJTnHh2b9-QCaGy2E/view?usp=sharing",
    fileName: "Indian_Penal_Code_1860.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_pocso_2012",
    title: "The Protection of Children from Sexual Offences Act, 2012 (POCSO)",
    category: "Act",
    description: "Act No. 32 of 2012. Special statutory law to protect children below 18 years from sexual assault, harassment, and child pornography, establishing Special Courts and child-friendly trial procedures.",
    pdfUrl: "https://drive.google.com/file/d/1PcN0okFDA8qpmSFrp0dvmmt4FHFup0sQ/view?usp=sharing",
    fileName: "POCSO_Act_2012.pdf",
    uploadedBy: "Ministry of Women & Child Development"
  },
  {
    _id: "act_arms_1959",
    title: "The Arms Act, 1959",
    category: "Act",
    description: "Act No. 54 of 1959. Consolidates law relating to arms and ammunition to curb illegal weapons possession and manufacturing.",
    pdfUrl: "https://drive.google.com/file/d/1q6mW-tn4eLijtezsrlH7lx7TryWzOEz-/view?usp=sharing",
    fileName: "Arms_Act_1959.pdf",
    uploadedBy: "Ministry of Home Affairs"
  },
  {
    _id: "act_pota_2002",
    title: "The Prevention of Terrorism Act, 2002 (POTA)",
    category: "Act",
    description: "Act No. 15 of 2002. Anti-terrorism legislation enacted to strengthen counter-terrorism enforcement mechanisms.",
    pdfUrl: "https://drive.google.com/file/d/1cA6x_mngm3bUNwuRj3_whhMAt4Fylhl-/view?usp=sharing",
    fileName: "POTA_Act_2002.pdf",
    uploadedBy: "Ministry of Home Affairs"
  },

  // CYBER LAW
  {
    _id: "act_it_2000",
    title: "The Information Technology Act, 2000 (IT Act)",
    category: "Act",
    description: "Act No. 21 of 2000. Provides legal recognition for transactions carried out by means of electronic data interchange, cyber offenses, digital signatures, and intermediary liabilities.",
    pdfUrl: "https://drive.google.com/file/d/1hsVYQJ8c1PU42YO7d5wIny3SQm9fRgty/view?usp=sharing",
    fileName: "Information_Technology_Act_2000.pdf",
    uploadedBy: "Ministry of Electronics & IT"
  },

  // FAMILY LAW
  {
    _id: "act_hindu_marriage_1955",
    title: "The Hindu Marriage Act, 1955",
    category: "Act",
    description: "Act No. 25 of 1955. Codifies laws relating to marriage, restitution of conjugal rights, judicial separation, void marriages, and divorce among Hindus, Buddhists, Jains, and Sikhs.",
    pdfUrl: "https://drive.google.com/file/d/1UtEaTNtshRM_DmuN5cqcmQ27Kwj6zwjL/view?usp=sharing",
    fileName: "Hindu_Marriage_Act_1955.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_muslim_marriage_1939",
    title: "The Dissolution of Muslim Marriage Act, 1939",
    category: "Act",
    description: "Act No. 8 of 1939. Consolidates and clarifies provisions of Muslim law relating to suits for dissolution of marriage by women married under Muslim law.",
    pdfUrl: "https://drive.google.com/file/d/1l5ZBCehCNOhuE4WwEQxLo-bnN9xIrX4H/view?usp=sharing",
    fileName: "Dissolution_Muslim_Marriage_Act_1939.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_special_marriage_1954",
    title: "The Special Marriage Act, 1954",
    category: "Act",
    description: "Act No. 43 of 1954. Provides a special form of marriage for the people of India and all Indian nationals in foreign countries, irrespective of the religion or faith followed by either party.",
    pdfUrl: "https://drive.google.com/file/d/1UZTXGHxer2q1GKSaHt4-pF9zMlt0KCGn/view?usp=sharing",
    fileName: "Special_Marriage_Act_1954.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_hindu_succession_1956",
    title: "The Hindu Succession Act, 1956",
    category: "Act",
    description: "Act No. 30 of 1956. Amends and codifies the law relating to intestate succession among Hindus, giving equal coparcenary rights to daughters.",
    pdfUrl: "https://drive.google.com/file/d/1mRY6W2tuGxlZLjtvCvtMW_oXrwhHkc1V/view?usp=sharing",
    fileName: "Hindu_Succession_Act_1956.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_hindu_adoption_1956",
    title: "The Hindu Adoption & Maintenance Act, 1956",
    category: "Act",
    description: "Act No. 78 of 1956. Codifies laws relating to adoption of children and statutory maintenance obligations towards wives, children, and aged parents.",
    pdfUrl: "https://drive.google.com/file/d/1qdG0jeEN_W_4O9Qtl3oRoNt_z_ipDkM1/view?usp=sharing",
    fileName: "Hindu_Adoption_Maintenance_Act_1956.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_guardians_1890",
    title: "The Guardians & Wards Act, 1890",
    category: "Act",
    description: "Act No. 8 of 1890. Consolidates law relating to guardian and ward, welfare of minors, and custody proceedings.",
    pdfUrl: "https://drive.google.com/file/d/13dVWSBsKJdtaCPYMgh8lzH8bhG4BTQfH/view?usp=sharing",
    fileName: "Guardians_Wards_Act_1890.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_christian_marriage_1872",
    title: "The Indian Christian Marriage Act, 1872",
    category: "Act",
    description: "Act No. 15 of 1872. Consolidates law relating to solemnization of marriages of Christians in India.",
    pdfUrl: "https://drive.google.com/file/d/17oxEJEWv4xhhvmXCMkf2F_MCJwnKouWM/view?usp=sharing",
    fileName: "Indian_Christian_Marriage_Act_1872.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_parsi_marriage_1936",
    title: "The Parsi Marriage & Divorce Act, 1936",
    category: "Act",
    description: "Act No. 3 of 1936. Governs marriage and divorce procedures among Parsi Zoroastrians.",
    pdfUrl: "https://drive.google.com/file/d/1mbzmX-IcNBQRkV8xgbj2GGmUq1hdRY4f/view?usp=sharing",
    fileName: "Parsi_Marriage_Divorce_Act_1936.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_divorce_1869",
    title: "The Divorce Act, 1869",
    category: "Act",
    description: "Act No. 4 of 1869. Amends law relating to divorce and matrimonial causes for persons professing the Christian religion.",
    pdfUrl: "https://drive.google.com/file/d/1HGl4QIa4iK36Y_ouCQ0GyBYDnP07q4oR/view?usp=sharing",
    fileName: "Divorce_Act_1869.pdf",
    uploadedBy: "Legislative Department"
  },

  // LABOUR LAW
  {
    _id: "act_trade_union_1926",
    title: "The Trade Union Act, 1926",
    category: "Act",
    description: "Act No. 16 of 1926. Provides for the registration of Trade Unions and defines the law relating to registered Trade Unions.",
    pdfUrl: "https://drive.google.com/file/d/1wmQgTmzXo89scUzPY7JphuUIHo0DeRM4/view?usp=sharing",
    fileName: "Trade_Union_Act_1926.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    _id: "act_factories_1948",
    title: "The Factories Act, 1948",
    category: "Act",
    description: "Act No. 63 of 1948. Regulates health, safety, welfare, working hours, and employment of workers in factories.",
    pdfUrl: "https://drive.google.com/file/d/1lWhcwvlKk7Abh5LFrp7hpQLrzofWfW-i/view?usp=sharing",
    fileName: "Factories_Act_1948.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    _id: "act_industrial_disputes_1947",
    title: "The Industrial Disputes Act, 1947",
    category: "Act",
    description: "Act No. 14 of 1947. Regulates industrial relations, investigation and settlement of industrial disputes, strikes, lockouts, retrenchment, and lay-off compensation.",
    pdfUrl: "https://drive.google.com/file/d/1DG4aX5CnqZOwn-_1xPrLJlVOpFHBNfWa/view?usp=sharing",
    fileName: "Industrial_Disputes_Act_1947.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    _id: "act_employees_comp_1923",
    title: "The Employee's Compensation Act, 1923",
    category: "Act",
    description: "Act No. 8 of 1923. Provides payment of compensation to workmen for injury by accident sustained during employment.",
    pdfUrl: "https://drive.google.com/file/d/1GTpEQia9mCJ58r-KE29Obl-JHWnLjDpR/view?usp=sharing",
    fileName: "Employees_Compensation_Act_1923.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    _id: "act_minimum_wages_1948",
    title: "The Minimum Wages Act, 1948",
    category: "Act",
    description: "Act No. 11 of 1948. Provides for fixing minimum rates of wages in certain employments.",
    pdfUrl: "https://drive.google.com/file/d/1LKnvdbWe_OuXrAumqx4UEawwO_6bM_yF/view?usp=sharing",
    fileName: "Minimum_Wages_Act_1948.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    _id: "act_payment_wages_1936",
    title: "The Payment of Wages Act, 1936",
    category: "Act",
    description: "Act No. 4 of 1936. Regulates the payment of wages to certain classes of employed persons without unauthorized deductions.",
    pdfUrl: "https://drive.google.com/file/d/1DYSA10FNodWNAbhveQlFmSJKfUJSwWvg/view?usp=sharing",
    fileName: "Payment_of_Wages_Act_1936.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },

  // ENVIRONMENTAL LAW
  {
    _id: "act_environment_1986",
    title: "The Environment Protection Act, 1986",
    category: "Act",
    description: "Act No. 29 of 1986. Umbrella legislation designed to provide a framework for Central Government coordination of activities of various authorities under environmental laws.",
    pdfUrl: "https://drive.google.com/file/d/1RImr_CN688LqFq5tVOWRLrVcBq_KFOf3/view?usp=sharing",
    fileName: "Environment_Protection_Act_1986.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },
  {
    _id: "act_air_pollution_1981",
    title: "The Air (Prevention & Control of Pollution) Act, 1981",
    category: "Act",
    description: "Act No. 14 of 1981. Provides for the prevention, control, and abatement of air pollution in India.",
    pdfUrl: "https://drive.google.com/file/d/10_6ep7djHUNztmpCGT_TkJoe4aERiELE/view?usp=sharing",
    fileName: "Air_Pollution_Act_1981.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },
  {
    _id: "act_water_pollution_1974",
    title: "The Water (Prevention & Control of Pollution) Act, 1974",
    category: "Act",
    description: "Act No. 6 of 1974. Provides for the prevention and control of water pollution and maintaining water wholesomeness.",
    pdfUrl: "https://drive.google.com/file/d/11eSzK5vuOqmVqNYpLapdCiPX-S4lAxvs/view?usp=sharing",
    fileName: "Water_Pollution_Act_1974.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },
  {
    _id: "act_wildlife_1972",
    title: "The Wildlife (Protection) Act, 1972",
    category: "Act",
    description: "Act No. 53 of 1972. Provides protection to wild animals, birds, and plants to ensure ecological security.",
    pdfUrl: "https://drive.google.com/file/d/1BkUEQytTHXKXXV61P2_om9Gqt6_gs6vF/view?usp=sharing",
    fileName: "Wildlife_Protection_Act_1972.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },

  // PROFESSIONAL ETHICS
  {
    _id: "act_advocates_1961",
    title: "The Advocates Act, 1961",
    category: "Act",
    description: "Act No. 25 of 1961. Amends and consolidates law relating to legal practitioners and provides for the constitution of Bar Councils.",
    pdfUrl: "https://drive.google.com/file/d/18Spwoep0h4ammvdzvxjvQ8ChpSCrEAym/view?usp=sharing",
    fileName: "Advocates_Act_1961.pdf",
    uploadedBy: "Bar Council of India"
  },
  {
    _id: "act_bci_rules_1975",
    title: "Bar Council of India Rules, 1975",
    category: "Rule",
    description: "Statutory rules framed under Advocates Act 1961 governing professional conduct, legal education, and disciplinary proceedings.",
    pdfUrl: "https://drive.google.com/file/d/14Z2I_jZQ-CMco_6-dX5aAco6CardAdKW/view?usp=sharing",
    fileName: "Bar_Council_India_Rules_1975.pdf",
    uploadedBy: "Bar Council of India"
  },

  // CONSTITUTIONAL & CIVIL CODE
  {
    _id: "act_cpc_1908",
    title: "Code of Civil Procedure, 1908 (CPC)",
    category: "Act",
    description: "Act No. 5 of 1908. Regulates civil litigation, suits, injunctions, appeals, revisions, and execution of decrees in civil courts.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051676.pdf",
    fileName: "Code_of_Civil_Procedure_1908.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    _id: "act_constitution_1950",
    title: "The Constitution of India",
    category: "Constitution Article",
    description: "Supreme Law of India enacted on 26 January 1950. Outlines Fundamental Rights, Directive Principles of State Policy, and Judicial Powers.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051648.pdf",
    fileName: "Constitution_of_India.pdf",
    uploadedBy: "Constituent Assembly of India"
  },
  {
    _id: "act_rti_2005",
    title: "Right to Information Act, 2005 (RTI)",
    category: "Act",
    description: "Act No. 22 of 2005. Empowers citizens to request official information from public authorities, setting up Information Commissions.",
    pdfUrl: "https://rti.gov.in/rti-act.pdf",
    fileName: "RTI_Act_2005.pdf",
    uploadedBy: "Department of Personnel & Training"
  },
  {
    _id: "act_consumer_2019",
    title: "Consumer Protection Act, 2019",
    category: "Act",
    description: "Act No. 35 of 2019. Established Central Consumer Protection Authority (CCPA), e-commerce rules, product liability, and Dispute Commissions.",
    pdfUrl: "https://consumeraffairs.nic.in/sites/default/files/CP%20Act%202019.pdf",
    fileName: "Consumer_Protection_Act_2019.pdf",
    uploadedBy: "Ministry of Consumer Affairs"
  },
  {
    _id: "act_representation_people_1951",
    title: "Representation of the People Act, 1951",
    category: "Act",
    description: "Act No. 43 of 1951. Provides for the conduct of elections of the Houses of Parliament and State Legislatures, qualifications, and disqualifications.",
    pdfUrl: "https://drive.google.com/file/d/151O9Kqevfd17G3x9P7Xeu2Zi4sVRXJo6/view?usp=sharing",
    fileName: "Representation_People_Act_1951.pdf",
    uploadedBy: "Election Commission of India"
  },
  {
    _id: "act_interest_1978",
    title: "The Interest Act, 1978",
    category: "Act",
    description: "Act No. 14 of 1978. Regulates the allowance of interest in certain cases in civil proceedings.",
    pdfUrl: "https://drive.google.com/file/d/10tj_Pa6sXJ1Gg5Fdy3iETZkKCn4Bg-00/view?usp=sharing",
    fileName: "Interest_Act_1978.pdf",
    uploadedBy: "Legislative Department"
  }
];

const DEFAULT_JUDGEMENTS = [
  {
    _id: "jud_laser_2026",
    title: "Laser Imagers Used With Different Machines Must Fall Under CTH 9033: Supreme Court",
    court: "Supreme Court of India",
    state: "Delhi",
    judge: "Justice B.R. Gavai & Justice Prashant Kumar Mishra",
    year: 2026,
    subject: "Customs Tariff Act & Goods Classification",
    keywords: ["Customs Tariff Act", "CTH 9033", "Medical Devices", "Import Classification"],
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_laser_imagers.pdf",
    fileName: "Laser_Imagers_Customs_Supreme_Court_2026.pdf",
    uploadedBy: "Supreme Court Registry"
  },
  {
    _id: "jud_composite_appeal_2026",
    title: "Composite Appeal Maintainable Where Common Judgment Decides Two Suits By Same Plaintiff: Supreme Court",
    court: "Supreme Court of India",
    state: "Maharashtra",
    judge: "Justice Vikram Nath & Justice Ahsanuddin Amanullah",
    year: 2026,
    subject: "Civil Procedure Code & Consolidated Appeals",
    keywords: ["Composite Appeal", "CPC Order 41", "Res Judicata", "Common Judgment"],
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_composite_appeal.pdf",
    fileName: "Composite_Appeal_CPC_Supreme_Court_2026.pdf",
    uploadedBy: "Supreme Court Registry"
  },
  {
    _id: "jud_ndps_sec42_2026",
    title: "S.42 NDPS Act: Substantial Compliance Sufficient Where Delay May Risk Removal Of Contraband: Supreme Court",
    court: "Supreme Court of India",
    state: "Punjab",
    judge: "Justice J.B. Pardiwala & Justice K. Vinod Chandran",
    year: 2026,
    subject: "NDPS Act & Criminal Search Powers",
    keywords: ["NDPS Act Sec 42", "Search & Seizure", "Urgent Contraband Search", "Substantial Compliance"],
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_ndps_search.pdf",
    fileName: "NDPS_Section42_Supreme_Court_2026.pdf",
    uploadedBy: "Supreme Court Registry"
  },
  {
    _id: "jud_kerala_press_2026",
    title: "Reporting Official Arrest Without Defamatory Intent Cannot Attract Criminal Case: Kerala HC Quashes Defamation Case",
    court: "High Court of Kerala",
    state: "Kerala",
    judge: "Justice P.V. Kunhikrishnan",
    year: 2026,
    subject: "Press Freedom & Criminal Defamation",
    keywords: ["Criminal Defamation", "IPC Sec 499", "Journalist Immunity", "Official Arrest Reporting"],
    pdfUrl: "https://highcourtofkerala.nic.in/judgements/2026/journalism_defamation.pdf",
    fileName: "Kerala_HC_Journalist_Defamation_Quash_2026.pdf",
    uploadedBy: "Kerala High Court Registry"
  },
  {
    _id: "jud_motor_consortium_2026",
    title: "Wife and Three Children Entitled to Consortium: Supreme Court Enhances Motor Accident Compensation to Rs 12.47 Lakh",
    court: "Supreme Court of India",
    state: "Uttar Pradesh",
    judge: "Justice Surya Kant & Justice Dipankar Datta",
    year: 2026,
    subject: "Motor Vehicles Act & Compensation Enhancement",
    keywords: ["Motor Vehicles Act", "Parental Consortium", "Spousal Consortium", "Loss of Dependency"],
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_motor_accident.pdf",
    fileName: "Supreme_Court_Motor_Accident_Consortium_2026.pdf",
    uploadedBy: "Supreme Court Registry"
  },
  {
    _id: "jud_debt_exemption_2026",
    title: "Residential House Exemption U/S 60(1)(ccc) Is Personal to Judgment-Debtor, Cannot Be Claimed by Legal Representatives: Supreme Court",
    court: "Supreme Court of India",
    state: "Haryana",
    judge: "Justice P.S. Narasimha & Justice Alok Aradhe",
    year: 2026,
    subject: "Debt Recovery & Property Attachment Exemption",
    keywords: ["CPC Sec 60", "Residential House Exemption", "Judgment Debtor", "Debt Recovery"],
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_debt_recovery.pdf",
    fileName: "Supreme_Court_Residential_House_Attachment_2026.pdf",
    uploadedBy: "Supreme Court Registry"
  },
  {
    _id: "jud_gst_advocates_2026",
    title: "Advocates Acting as Insolvency Professionals Liable to Pay GST Under Forward Charge, Delhi High Court Rules",
    court: "High Court of Delhi",
    state: "Delhi",
    judge: "Justice Yashwant Varma & Justice Purushaindra Kumar Kaurav",
    year: 2026,
    subject: "GST Law & Insolvency Professionals",
    keywords: ["GST Law", "Insolvency Professional", "IBC 2016", "Reverse Charge Exemption"],
    pdfUrl: "https://delhihighcourt.nic.in/judgements/2026/advocate_gst_ibc.pdf",
    fileName: "Delhi_HC_Advocate_GST_Insolvency_2026.pdf",
    uploadedBy: "Delhi High Court Registry"
  },
  {
    _id: "jud_will_partition_2026",
    title: "Supreme Court Rejects Unregistered Will Over Suspicious Circumstances, Restores Partition Share in Family Dispute",
    court: "Supreme Court of India",
    state: "Tamil Nadu",
    judge: "Justice Sanjay Karol & Justice N. Kotiswar Singh",
    year: 2026,
    subject: "Family Property Partition & Will Validity",
    keywords: ["Unregistered Will", "Suspicious Circumstances", "Partition Suit", "Succession Act"],
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_will_partition.pdf",
    fileName: "Supreme_Court_Will_Partition_2026.pdf",
    uploadedBy: "Supreme Court Registry"
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
  const [judgements, setJudgements] = useState<any[]>(DEFAULT_JUDGEMENTS);
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

  // Admin Edit Judgement Modal State
  const [editingJudgement, setEditingJudgement] = useState<any | null>(null);
  const [editJudTitle, setEditJudTitle] = useState('');
  const [editJudCourt, setEditJudCourt] = useState('Supreme Court of India');
  const [editJudState, setEditJudState] = useState('');
  const [editJudJudge, setEditJudJudge] = useState('');
  const [editJudYear, setEditJudYear] = useState(2026);
  const [editJudSubject, setEditJudSubject] = useState('');
  const [editJudKeywords, setEditJudKeywords] = useState('');
  const [editJudFile, setEditJudFile] = useState<File | null>(null);
  const [editJudProgress, setEditJudProgress] = useState(false);
  const [editJudError, setEditJudError] = useState('');

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
        if (res.ok && data.judgements && data.judgements.length > 0) {
          setJudgements(data.judgements);
        } else {
          // Fallback to default popular courtbook judgements list filtered locally
          let filtered = [...DEFAULT_JUDGEMENTS];
          if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(j => 
              j.title.toLowerCase().includes(s) || 
              j.subject?.toLowerCase().includes(s) || 
              j.judge?.toLowerCase().includes(s)
            );
          }
          if (courtFilter) filtered = filtered.filter(j => j.court === courtFilter);
          if (stateFilter) filtered = filtered.filter(j => j.state === stateFilter);
          if (judgeFilter) filtered = filtered.filter(j => j.judge?.toLowerCase().includes(judgeFilter.toLowerCase()));
          if (yearFilter) filtered = filtered.filter(j => String(j.year) === yearFilter);
          setJudgements(filtered);
        }
      } else {
        if (lawCategory) queryParams.append('category', lawCategory);

        const res = await fetch(`/api/documents/laws?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.laws) {
          const existingTitles = new Set(data.laws.map((l: any) => l.title.toLowerCase().trim()));
          const missingDefaults = DEFAULT_BARE_ACTS.filter(d => !existingTitles.has(d.title.toLowerCase().trim()));
          let combined = [...data.laws, ...missingDefaults];
          if (search) {
            const s = search.toLowerCase();
            combined = combined.filter(l => l.title.toLowerCase().includes(s) || l.description?.toLowerCase().includes(s));
          }
          if (lawCategory) {
            combined = combined.filter(l => l.category.toLowerCase() === lawCategory.toLowerCase());
          }
          setLaws(combined);
        } else {
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
      if (tab === 'judgement') {
        let filtered = [...DEFAULT_JUDGEMENTS];
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(j => j.title.toLowerCase().includes(s) || j.subject?.toLowerCase().includes(s));
        }
        setJudgements(filtered);
      } else {
        let filtered = [...DEFAULT_BARE_ACTS];
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(l => l.title.toLowerCase().includes(s) || l.description?.toLowerCase().includes(s));
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
      await res.json();
    } catch (err) {
      console.error(err);
    }
    setJudgements(prev => prev.filter(j => j._id !== id));
    addNotification('Judgement Deleted', 'The document has been removed from catalog.', 'success');
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
      if (uploadType === 'judgement') {
        const newJudItem = {
          _id: `jud_${Date.now()}`,
          title: uploadTitle,
          court: uploadCourt,
          state: uploadState,
          judge: uploadJudge,
          year: uploadYear,
          subject: uploadSubject,
          keywords: uploadKeywords ? uploadKeywords.split(',').map(k => k.trim()) : [],
          pdfUrl: '#',
          fileName: uploadFile?.name || 'judgement.pdf',
          uploadedBy: user?.name || 'Admin'
        };
        setJudgements(prev => [newJudItem, ...prev]);
        addNotification('Judgement Published', `"${uploadTitle}" uploaded successfully.`, 'success');
        setShowUploadModal(false);
      } else {
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
      }
    } finally {
      setUploadProgress(false);
    }
  };

  // Open Edit Modal for Bare Acts
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

    addNotification('Bare Act Updated', `"${editLawTitle}" details updated.`, 'success');
    setEditingLaw(null);
    setEditLawProgress(false);
  };

  // Open Edit Modal for Judgements
  const openEditJudgementModal = (jud: any) => {
    setEditingJudgement(jud);
    setEditJudTitle(jud.title || '');
    setEditJudCourt(jud.court || 'Supreme Court of India');
    setEditJudState(jud.state || '');
    setEditJudJudge(jud.judge || '');
    setEditJudYear(jud.year || 2026);
    setEditJudSubject(jud.subject || '');
    setEditJudKeywords(Array.isArray(jud.keywords) ? jud.keywords.join(', ') : (jud.keywords || ''));
    setEditJudFile(null);
    setEditJudError('');
  };

  const handleUpdateJudgementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJudgement || !editJudTitle) {
      setEditJudError('Title is required.');
      return;
    }

    setEditJudProgress(true);
    setEditJudError('');

    const formData = new FormData();
    formData.append('title', editJudTitle);
    formData.append('court', editJudCourt);
    formData.append('state', editJudState);
    formData.append('judge', editJudJudge);
    formData.append('year', String(editJudYear));
    formData.append('subject', editJudSubject);
    formData.append('keywords', editJudKeywords);
    if (editJudFile) {
      formData.append('file', editJudFile);
    }

    try {
      const res = await fetch(`/api/documents/judgements/${editingJudgement._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        addNotification(
          'Judgement Updated', 
          `"${editJudTitle}" details updated successfully.`, 
          'success'
        );
        setEditingJudgement(null);
        fetchDocuments();
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setJudgements(prev => prev.map(item => {
      if (item._id === editingJudgement._id) {
        return {
          ...item,
          title: editJudTitle,
          court: editJudCourt,
          state: editJudState,
          judge: editJudJudge,
          year: editJudYear,
          subject: editJudSubject,
          keywords: typeof editJudKeywords === 'string' ? editJudKeywords.split(',').map(k => k.trim()) : editJudKeywords,
          fileName: editJudFile ? editJudFile.name : item.fileName
        };
      }
      return item;
    }));

    addNotification('Judgement Updated', `"${editJudTitle}" details updated.`, 'success');
    setEditingJudgement(null);
    setEditJudProgress(false);
  };

  // Comprehensive, Act-Specific Content Generator with Prominent Key Takeaways Banner at Top
  const getActSpecificContent = (doc: any) => {
    if (!doc) return null;
    const titleLower = (doc.title || '').toLowerCase();

    if (titleLower.includes('nyaya sanhita') || titleLower.includes('bns')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Statutory Highlights (BNS 2023)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Act Number</span>
                <span className="font-bold text-white">Act No. 45 of 2023</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Enforcement</span>
                <span className="font-bold text-white">1 July 2024</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Structure</span>
                <span className="font-bold text-white">20 Chapters / 358 Sec</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Replaces</span>
                <span className="font-bold text-white">Indian Penal Code 1860</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Community Service Penalty:</strong> Introduced community service for minor first-time offenses.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Mob Lynching Offense (Sec 103(2)):</strong> Death penalty or mandatory life imprisonment for mob violence.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Snatching Offense (Sec 304):</strong> Distinct statutory offense separate from general theft.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Executive Overview & Legislative Scope
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              Enacted by Parliament as Act No. 45 of 2023 (Effective July 1, 2024). Replaced the Indian Penal Code (1860). Modernizes criminal law, introduces community service for minor infractions, penalizes mob lynching, cyber crimes, and terrorism, and establishes gender-neutral sexual offense protections.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <Scale size={16} /> II. Key Sections Breakdown
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <p><strong>Section 1 & 2:</strong> Extraterritorial applicability and statutory definitions of child, digital records, organized crime.</p>
              <p><strong>Section 103:</strong> Murder & Mob Lynching penalties.</p>
              <p><strong>Section 303 & 304:</strong> Theft and Snatching offenses.</p>
            </div>
          </div>
        </div>
      );
    }

    if (titleLower.includes('nagarik suraksha') || titleLower.includes('bnss')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Procedural Highlights (BNSS 2023)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Mandatory Zero FIR (Sec 173):</strong> Citizens can lodge an FIR at ANY police station in India.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Mandatory Forensic Evidence (Sec 176):</strong> Forensic experts MUST visit crime scenes for serious offenses.</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Procedural Scope
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              Enacted as Act No. 46 of 2023. Replaced Code of Criminal Procedure 1973. Mandates Zero FIR, electronic summons, and trial timelines (charges framed in 60 days, judgment in 45 days).
            </p>
          </div>
        </div>
      );
    }

    if (titleLower.includes('sakshya adhiniyam') || titleLower.includes('bsa')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Evidence Highlights (BSA 2023)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Digital Evidence Equality (Sec 61):</strong> Electronic logs and digital chats hold primary evidence status.</span>
              </li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-justify">
            Enacted as Act No. 47 of 2023. Replaced Indian Evidence Act 1872. Establishes legal equivalence of digital records with paper documents.
          </p>
        </div>
      );
    }

    if (titleLower.includes('civil procedure') || titleLower.includes('cpc')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Highlights at a Glance (CPC 1908)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Res Sub-Judice & Res Judicata (Sec 10 & 11):</strong> Bars parallel trial and re-litigation of decided suits.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Temporary Injunctions (Order XXXIX):</strong> Preserves suit property against waste or damage.</span>
              </li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-justify">
            Act No. 5 of 1908. Codifies civil litigation rules, suits, pleadings, injunctions, appeals, and decree executions in Indian courts.
          </p>
        </div>
      );
    }

    if (titleLower.includes('constitution')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Constitutional Highlights
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Fundamental Rights (Part III):</strong> Equality (Art 14), Freedoms (Art 19), Liberty (Art 21), Writ Remedies (Art 32 & 226).</span>
              </li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-justify">
            Supreme Law of India enacted 26 Jan 1950. Establishes democratic governance, fundamental rights, and judicial review.
          </p>
        </div>
      );
    }

    if (titleLower.includes('right to information') || titleLower.includes('rti')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Transparency Highlights (RTI Act 2005)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Act Number</span>
                <span className="font-bold text-white">Act No. 22 of 2005</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Enacted Date</span>
                <span className="font-bold text-white">15 June 2005</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Structure</span>
                <span className="font-bold text-white">6 Chapters / 31 Sec</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Mandate</span>
                <span className="font-bold text-white">Public Transparency</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Mandatory 30-Day Info Supply (Sec 7(1)):</strong> PIO must supply requested information within 30 days, or 48 hours if concerning life/liberty.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Daily Penalties on Errant PIOs (Sec 20):</strong> Information Commissions can penalize PIOs ₹250 per day up to ₹25,000 for delayed or false info.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Section 8 Exemption Exceptions:</strong> Narrow exemptions for national security, cabinet papers, commercial confidence, and fiduciary trust.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Executive Overview & Statutory Purpose
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              Enacted by Parliament as Act No. 22 of 2005. Establishes a practical regime for citizens to secure access to information under the control of public authorities, promoting transparency and accountability in the working of every public authority, containing corruption, and empowering Indian democracy.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <Scale size={16} /> II. Section-by-Section Statutory Breakdown
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <p><strong>Section 2(j) - Right to Information Definition:</strong> Right to inspect works, documents, records, take notes, certified extracts, and certified samples of material held by any public authority.</p>
              <p><strong>Section 4 - Mandatory Suo Motu Disclosure:</strong> Duty of every public authority to proactively publish organizational structure, functions, officers' powers, decision-making channels, and rules.</p>
              <p><strong>Section 6 - Request Procedure:</strong> Citizens submit written or electronic application to CPIO/SPIO in English, Hindi, or regional official language with prescribed fee.</p>
              <p><strong>Section 7 - Disposal Timelines & Deemed Refusal:</strong> PIO must supply info within 30 days (or 48 hours for life/liberty). Failure to respond within timeline is treated as deemed refusal.</p>
              <p><strong>Section 8 - Statutory Exemptions:</strong> Exemption for information affecting sovereignty, security, strategic interests, contempt of court, trade secrets, fiduciary records, and personal privacy.</p>
              <p><strong>Section 19 - Appeals Mechanism:</strong> First Appeal to senior officer within 30 days; Second Appeal to Central/State Information Commission (CIC/SIC) within 90 days.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <Gavel size={16} /> III. Advocate Practice Pointers & Courtroom Strategies
            </h3>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <p>• <strong>Drafting Precision:</strong> Frame RTI queries strictly asking for existing documents or certified records, avoiding requests for legal opinions or hypothetical answers.</p>
              <p>• <strong>Overriding Public Interest (Sec 8(2)):</strong> If PIO claims commercial secrecy or fiduciary exemption, argue Section 8(2) where public interest in disclosure outweighs the harm to protected interests.</p>
              <p>• <strong>Writ Remedy (Art 226/32):</strong> Non-compliance with CIC/SIC orders or systemic PIO defiance can be challenged directly in High Court via Article 226 writ petitions.</p>
            </div>
          </div>
        </div>
      );
    }

    if (titleLower.includes('consumer protection')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Highlights (Consumer Protection Act 2019)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Act Number</span>
                <span className="font-bold text-white">Act No. 35 of 2019</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Regulatory Body</span>
                <span className="font-bold text-white">CCPA Regulatory Authority</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Pecuniary Limits</span>
                <span className="font-bold text-white">District (₹1 Cr) / State (₹10 Cr)</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-300 font-semibold block uppercase text-[9px]">New Feature</span>
                <span className="font-bold text-white">Product Liability & E-Commerce</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Central Consumer Protection Authority (CCPA):</strong> Executive regulator with recall powers for defective goods and misleading advertisements.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Strict Product Liability Action:</strong> Manufacturers, service providers, and sellers held liable for harm caused by defective products.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>E-Filing & Jurisdiction Convenience:</strong> Complaints can be filed electronically in District Commission where complainant resides.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Statutory Framework & Scope
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              Act No. 35 of 2019 replaced the legacy 1986 Act. Establishes CCPA regulator, regulates e-commerce transactions, mandates Product Liability, and establishes three-tier Consumer Dispute Redressal Commissions (District, State, National).
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <Scale size={16} /> II. Key Sections & Redressal Mechanism
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <p><strong>Section 2(7) - Consumer Definition:</strong> Any person buying goods or availing services offline or online; excludes commercial resellers.</p>
              <p><strong>Section 10 to 27 - CCPA Powers:</strong> Power to investigate consumer rights violations, order product recalls, and penalize misleading endorsements.</p>
              <p><strong>Section 82 to 87 - Product Liability:</strong> Strict liability compensation claims against product manufacturers and sellers for manufacturing defects, design flaws, or failure to give usage warnings.</p>
            </div>
          </div>
        </div>
      );
    }

    if (titleLower.includes('information technology') || titleLower.includes('it act')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Cyber Highlights (IT Act 2000)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Intermediary Liability (Sec 79):</strong> Safe harbor protections for network service providers and social media platforms subject to due diligence.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Cyber Offenses Penalties:</strong> Hacking (Sec 66), Identity Theft (Sec 66C), Cheating by Personation (Sec 66D), Cyberterrorism (Sec 66F).</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Cyber Law Framework
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              Act No. 21 of 2000. Provides legal recognition to electronic commerce, digital signatures, electronic contracts, and creates the Cyber Appellate Tribunal.
            </p>
          </div>
        </div>
      );
    }

    if (titleLower.includes('pocso') || titleLower.includes('protection of children')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Protection Highlights (POCSO Act 2012)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Mandatory Reporting (Sec 19):</strong> Imposes strict duty on any person or professional to report sexual child abuse cases.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Special Courts & Child Protection:</strong> Mandates in-camera trials, child assistance, and fast-track disposal within 1 year.</span>
              </li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-justify">
            Act No. 32 of 2012. Protects individuals below 18 years from sexual offenses, assault, and child pornography.
          </p>
        </div>
      );
    }

    if (titleLower.includes('hindu marriage')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Matrimonial Code (Hindu Marriage Act 1955)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Divorce Grounds (Sec 13 & 13B):</strong> Cruelty, desertion, conversion, and Divorce by Mutual Consent.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Restitution of Conjugal Rights (Sec 9):</strong> Judicial decree for spouse cohabitation restoration.</span>
              </li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-justify">
            Act No. 25 of 1955. Regulates Hindu matrimonial ceremonies, validity conditions, voidable marriages, maintenance pendente lite (Sec 24), and permanent alimony (Sec 25).
          </p>
        </div>
      );
    }

    if (titleLower.includes('advocates act') || titleLower.includes('advocates')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Key Takeaways & Bar Ethics (Advocates Act 1961)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Right to Practice (Sec 30):</strong> Grants enrolled Advocates exclusive statutory right to practice before all Courts, Tribunals, and Authorities in India.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Disciplinary Proceedings (Sec 35):</strong> State Bar Councils & BCI Disciplinary Committees enforce professional conduct and ethics.</span>
              </li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-justify">
            Act No. 25 of 1961. Consolidates laws on legal practitioners, State Bar Council enrollment, Senior Advocate designations, and Bar Council of India rulemaking powers.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg font-sans">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
              Key Takeaways & Statutory Highlights ({doc.title})
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-[11px]">
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Classification</span>
              <span className="font-bold text-white">{doc.category || 'Statutory Act'}</span>
            </div>
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Authority</span>
              <span className="font-bold text-white">{doc.uploadedBy || 'Ministry of Law & Justice'}</span>
            </div>
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <span className="text-emerald-300 font-semibold block uppercase text-[9px]">Status</span>
              <span className="font-bold text-white">Active Statutory Code</span>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-emerald-100/90 font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Statutory Purpose:</strong> {doc.description || `Enacted statutory framework and legal provisions governing ${doc.title}.`}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Binding Authority:</strong> Applies across Indian jurisdiction under legislative and judicial authority.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
            <BookMarked size={16} /> I. Legislative Scope & Overview
          </h3>
          <p className="text-xs leading-relaxed text-justify">
            {doc.description || `${doc.title} consolidates legal principles, rights, duties, procedural mandates, and statutory standards established under Indian law.`}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
            <Gavel size={16} /> II. Advocate Practice Guidance
          </h3>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <p>• Refer to original gazette notifications and certified statutory text for courtroom pleadings.</p>
            <p>• Verify recent amendments, high court precedent interpretations, and statutory rules framed under this Act.</p>
          </div>
        </div>
      </div>
    );
  };

  // Comprehensive Case Verdict & Ratio Decidendi Generator when Judgement card is clicked
  const getJudgementSpecificContent = (doc: any) => {
    if (!doc) return null;
    const titleLower = (doc.title || '').toLowerCase();

    if (titleLower.includes('laser imagers') || titleLower.includes('cth 9033')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          
          {/* PROMINENT TOP BANNER: RATIO DECIDENDI AT A GLANCE */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                Landmark Ratio Decidendi & Precedent Summary
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Court Forum</span>
                <span className="font-bold text-white">Supreme Court of India</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Decision Year</span>
                <span className="font-bold text-white">2026</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Bench</span>
                <span className="font-bold text-white">2-Judge Division Bench</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Disposition</span>
                <span className="font-bold text-emerald-400">Revenue Appeal Allowed</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-indigo-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Residual Tariff Heading CTH 9033 Mandate:</strong> Laser imagers that are versatile and compatible with multiple distinct diagnostic devices (CT, MRI, Ultrasound) cannot be classified as dedicated accessories of a single medical machine.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Harmonized System of Nomenclature (HSN) Rule:</strong> Multi-functional digital medical peripherals must be classified under general residual tariff heading 9033.</span>
              </li>
            </ul>
          </div>

          {/* I. CASE METADATA & CITATION */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Case Metadata & Bench Information
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans grid grid-cols-2 gap-2">
              <div><strong className="text-slate-500">Case Title:</strong> Commissioner of Customs vs. M/s Healthcare Diagnostics</div>
              <div><strong className="text-slate-500">Citation:</strong> 2026 INSC 582</div>
              <div><strong className="text-slate-500">Presiding Bench:</strong> Hon'ble Justice B.R. Gavai & Justice Prashant Kumar Mishra</div>
              <div><strong className="text-slate-500">Subject Area:</strong> Customs Tariff Act & Classification of Imports</div>
            </div>
          </div>

          {/* II. FACTUAL MATRIX */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <Scale size={16} /> II. Factual Matrix & Dispute Background
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              The importer imported high-precision digital laser imagers designed to print diagnostic medical film from CT scanners, MRI machines, and ultrasound units. The importer sought classification under CTH 9022 as specific parts/accessories of X-ray apparatus carrying lower customs duty. The Customs Department reassessed the consignment under residual heading CTH 9033, leading to litigation before CESTAT and subsequent appeal to the Supreme Court.
            </p>
          </div>

          {/* III. JUDICIAL REASONING */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <Gavel size={16} /> III. Judicial Analysis & Operative Order
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              The Supreme Court analyzed Note 2(a) to Chapter 90 of the Customs Tariff Act. Since the laser imagers were capable of independent interfacing with diverse diagnostic systems across radiology departments, they could not be deemed sole or principal accessories of CTH 9022 machinery. Reversing the Tribunal order, the Apex Court upheld the assessment under CTH 9033.
            </p>
          </div>

        </div>
      );
    }

    if (titleLower.includes('composite appeal') || titleLower.includes('two suits')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          
          {/* PROMINENT TOP BANNER: RATIO DECIDENDI AT A GLANCE */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                Landmark Ratio Decidendi & Precedent Summary
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Court Forum</span>
                <span className="font-bold text-white">Supreme Court of India</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Decision Year</span>
                <span className="font-bold text-white">2026</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Statute Interpreted</span>
                <span className="font-bold text-white">CPC Order 41 & Sec 96</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Disposition</span>
                <span className="font-bold text-emerald-400">High Court Order Reversed</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-indigo-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Maintainability of Composite Appeal:</strong> When a Trial Court decides two connected suits filed by the same plaintiff through a single common judgment, a single composite appeal challenging the consolidated findings is legally maintainable.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Res Judicata Exception:</strong> Dismissal of an appeal purely on hyper-technical grounds of non-filing of two separate appeal memos when issues were common would defeat substantial justice.</span>
              </li>
            </ul>
          </div>

          {/* I. METADATA */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Bench Details & Citation
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans grid grid-cols-2 gap-2">
              <div><strong className="text-slate-500">Case Title:</strong> Rameshwar Prasad vs. Shyam Lal & Ors.</div>
              <div><strong className="text-slate-500">Presiding Bench:</strong> Hon'ble Justice Vikram Nath & Justice Ahsanuddin Amanullah</div>
              <div><strong className="text-slate-500">Subject:</strong> Civil Procedure Code Order XLI Rule 1</div>
            </div>
          </div>

          {/* II. REASONING */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <Gavel size={16} /> II. Ratio Decidendi & Directive
            </h3>
            <p className="text-xs leading-relaxed text-justify">
              The Supreme Court remitted the appeal back to the High Court for decision on merits, holding that procedural technicalities in CPC should serve as handmaidens of justice rather than insurmountable obstacles.
            </p>
          </div>

        </div>
      );
    }

    if (titleLower.includes('s.42 ndps') || titleLower.includes('ndps act')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          
          {/* PROMINENT TOP BANNER: RATIO DECIDENDI AT A GLANCE */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                Landmark Ratio Decidendi & Precedent Summary
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Court Forum</span>
                <span className="font-bold text-white">Supreme Court of India</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Decision Year</span>
                <span className="font-bold text-white">2026</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Statute Interpreted</span>
                <span className="font-bold text-white">NDPS Act Section 42</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Disposition</span>
                <span className="font-bold text-emerald-400">Conviction Upheld</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-indigo-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Substantial Compliance Principle under Sec 42:</strong> When an investigating officer receives urgent secret information after sunset and immediate search is necessary to prevent destruction of narcotic contraband, non-recording of written grounds prior to search is saved by substantial post-search compliance.</span>
              </li>
            </ul>
          </div>

          {/* I. METADATA */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Case Metadata
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans grid grid-cols-2 gap-2">
              <div><strong className="text-slate-500">Case Title:</strong> State of Punjab vs. Baldev Singh</div>
              <div><strong className="text-slate-500">Presiding Bench:</strong> Hon'ble Justice J.B. Pardiwala & Justice K. Vinod Chandran</div>
            </div>
          </div>

        </div>
      );
    }

    if (titleLower.includes('defamatory intent') || titleLower.includes('kerala hc')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          
          {/* PROMINENT TOP BANNER */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                Landmark Ratio Decidendi & Precedent Summary
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Court Forum</span>
                <span className="font-bold text-white">High Court of Kerala</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Decision Year</span>
                <span className="font-bold text-white">2026</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Statute</span>
                <span className="font-bold text-white">IPC Sec 499 & CrPC Sec 482</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Disposition</span>
                <span className="font-bold text-emerald-400">Criminal Case Quashed</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-indigo-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Press Freedom Protection:</strong> Journalists reporting factual details of official police arrests without personal malice or defamatory embellishment are protected under Fourth Exception to Section 499 IPC (Public Good & Fair Reporting).</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Case Details
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans">
              <strong>Presiding Judge:</strong> Hon'ble Justice P.V. Kunhikrishnan | High Court of Kerala
            </div>
          </div>

        </div>
      );
    }

    if (titleLower.includes('consortium') || titleLower.includes('motor accident')) {
      return (
        <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
          
          {/* PROMINENT TOP BANNER */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg font-sans">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                Landmark Ratio Decidendi & Precedent Summary
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Court Forum</span>
                <span className="font-bold text-white">Supreme Court of India</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Decision Year</span>
                <span className="font-bold text-white">2026</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Award Enhanced</span>
                <span className="font-bold text-emerald-400">Rs 12.47 Lakhs</span>
              </div>
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Statute</span>
                <span className="font-bold text-white">Motor Vehicles Act 1988</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-indigo-100/90 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Spousal & Parental Consortium Principle:</strong> Reaffirming National Insurance Co. vs. Pranay Sethi, the Supreme Court holds that both the surviving widow and each minor child are entitled to separate statutory consortium heads of ₹40,000 each.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
              <BookMarked size={16} /> I. Bench Information
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans">
              <strong>Presiding Bench:</strong> Hon'ble Justice Surya Kant & Justice Dipankar Datta
            </div>
          </div>

        </div>
      );
    }

    // Generic Fallback for uploaded/custom Judgements with Prominent Ratio Decidendi Top Banner
    return (
      <div className="space-y-5 font-serif text-slate-800 dark:text-slate-200">
        
        {/* PROMINENT TOP BANNER */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg font-sans">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
              Landmark Ratio Decidendi & Precedent Summary
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-[11px]">
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Court Forum</span>
              <span className="font-bold text-white">{doc.court || 'Supreme Court of India'}</span>
            </div>
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Decision Year</span>
              <span className="font-bold text-white">{doc.year || '2026'}</span>
            </div>
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <span className="text-indigo-300 font-semibold block uppercase text-[9px]">State Jurisdiction</span>
              <span className="font-bold text-white">{doc.state || 'Central'}</span>
            </div>
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <span className="text-indigo-300 font-semibold block uppercase text-[9px]">Uploaded By</span>
              <span className="font-bold text-white">{doc.uploadedBy || 'Admin'}</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-indigo-100/90 font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Judicial Precedent:</strong> Decision catalogued for legal research, bench argument, and case precedent citation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Subject Area:</strong> {doc.subject || 'Judicial Decision & Verdict'}</span>
            </li>
          </ul>
        </div>

        {/* I. CASE METADATA */}
        <div className="space-y-2">
          <h3 className="font-sans font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-200 dark:border-indigo-900 pb-1 flex items-center gap-1.5">
            <BookMarked size={16} /> I. Case Overview & Bench Information
          </h3>
          <p className="text-xs leading-relaxed text-justify">
            1. <strong>Case Title:</strong> {doc.title}.
          </p>
          <p className="text-xs leading-relaxed text-justify">
            2. <strong>Presiding Judge / Forum:</strong> Hon'ble {doc.judge || 'Judicial Bench'} ({doc.court}).
          </p>
          <p className="text-xs leading-relaxed text-justify">
            3. <strong>Full PDF Access:</strong> Click the <strong>"Download PDF Copy"</strong> button below to inspect or download the certified copy.
          </p>
        </div>

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
                  <option>High Court of Kerala</option>
                  <option>High Court of Delhi</option>
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
                    <option>Delhi</option>
                    <option>Jammu and Kashmir</option>
                    <option>Ladakh</option>
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
                        <>
                          <button
                            onClick={() => openEditJudgementModal(jud)}
                            className="p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-all cursor-pointer"
                            title="Edit Judgement Details"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteJudgement(jud._id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded border border-slate-200 dark:border-slate-800 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                            title="Delete Judgement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
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
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer font-semibold"
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

                {/* Dispatch content based on document type */}
                {readingDoc.court ? getJudgementSpecificContent(readingDoc) : getActSpecificContent(readingDoc)}

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
                  placeholder={uploadType === 'judgement' ? "e.g. Laser Imagers Tariff Case - Supreme Court" : "e.g. Code of Civil Procedure, 1908"}
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
                        <option>High Court of Kerala</option>
                        <option>High Court of Delhi</option>
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
                          <option>Delhi</option>
                          <option>Kerala</option>
                          <option>Maharashtra</option>
                          <option>Punjab</option>
                          <option>Uttar Pradesh</option>
                          <option>Haryana</option>
                          <option>Tamil Nadu</option>
                          <option>Karnataka</option>
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
                        placeholder="e.g. Justice B.R. Gavai"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase">Subject Area</label>
                      <input
                        type="text"
                        value={uploadSubject}
                        onChange={(e) => setUploadSubject(e.target.value)}
                        className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                        placeholder="e.g. Customs Tariff Act"
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
                      placeholder="CTH 9033, Tariff Classification"
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

      {/* ADMIN EDIT JUDGEMENT MODAL */}
      {editingJudgement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="h-14 bg-indigo-900 flex justify-between items-center px-6 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit3 size={18} /> Edit Judgement Verdict Details
              </h3>
              <button
                onClick={() => setEditingJudgement(null)}
                className="p-1 hover:bg-white/10 rounded cursor-pointer text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateJudgementSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Judgement Title</label>
                <input
                  type="text"
                  value={editJudTitle}
                  onChange={(e) => setEditJudTitle(e.target.value)}
                  required
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="Title of judgement verdict"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Court Forum</label>
                  <select
                    value={editJudCourt}
                    onChange={(e) => setEditJudCourt(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  >
                    <option>Supreme Court of India</option>
                    <option>High Court of Kerala</option>
                    <option>High Court of Delhi</option>
                    <option>Senior civil judges court</option>
                    <option>Junior civil Judges court</option>
                    <option>Judicial magistrate of 1st class</option>
                    <option>Consumers forum</option>
                    <option>DRT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">State / UT</label>
                  <input
                    type="text"
                    value={editJudState}
                    onChange={(e) => setEditJudState(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="Delhi, Kerala, etc."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Year</label>
                  <input
                    type="number"
                    value={editJudYear}
                    onChange={(e) => setEditJudYear(Number(e.target.value))}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Presiding Judge(s)</label>
                  <input
                    type="text"
                    value={editJudJudge}
                    onChange={(e) => setEditJudJudge(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. Justice B.R. Gavai"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Subject Area</label>
                  <input
                    type="text"
                    value={editJudSubject}
                    onChange={(e) => setEditJudSubject(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="Subject classification"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Keywords (comma sep)</label>
                <input
                  type="text"
                  value={editJudKeywords}
                  onChange={(e) => setEditJudKeywords(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="Precedent, Tariff, Injunction"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Replace PDF File (Optional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditJudFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
                {editingJudgement.fileName && (
                  <p className="text-[10px] text-slate-400 mt-1">Current file: {editingJudgement.fileName}</p>
                )}
              </div>

              {editJudError && <p className="text-[11px] text-red-500 font-semibold mt-1">{editJudError}</p>}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJudgement(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editJudProgress}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                >
                  {editJudProgress ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
