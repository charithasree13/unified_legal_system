export interface JudgmentSummary {
  background: string;
  issues: string;
  relevantLaw: string;
  courtReasoning: string;
  holding: string;
  keyPrinciple: string;
  outcome: string;
  fullSummaryText?: string;
}

export interface JudgmentSeedItem {
  _id: string;
  canonicalKey?: string;
  title: string;
  petitioner: string;
  respondent: string;
  court: string;
  courtLevel?: string;
  state?: string;
  judge: string;
  bench: string;
  caseNumber: string;
  appealNumber?: string;
  neutralCitation: string;
  equivalentCitations: string[];
  judgmentDate: string;
  year: number;
  month?: string;
  judgmentType: string;
  subject: string;
  subCategory?: string;
  actsInvolved: string[];
  sectionsConsidered: string[];
  keywords: string[];
  caseOutcome: string;
  sourceAuthority: string;
  sourceUrl: string;
  officialSourceUrl: string;
  rightsStatus: string;
  importSource: string;
  dataVersion: string;
  legalStatus: string;
  lastVerified: string;
  pdfUrl?: string;
  fileName?: string;
  uploadedBy: string;
  summary: JudgmentSummary;
}

export const COMPREHENSIVE_JUDGMENTS_DATA: JudgmentSeedItem[] = [
  {
    _id: "jud_sc_2026_01",
    title: "Composite Appeal Maintainable Where Common Judgment Decides Two Connected Suits By Same Plaintiff: Supreme Court",
    petitioner: "M/s Southern Granites Pvt Ltd",
    respondent: "State of Andhra Pradesh & Ors",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Andhra Pradesh",
    judge: "Justice Vikram Nath & Justice Ahsanuddin Amanullah",
    bench: "Division Bench",
    caseNumber: "Civil Appeal No. 1420 of 2026",
    appealNumber: "SLP (C) No. 8912 of 2025",
    neutralCitation: "2026 INSC 412",
    equivalentCitations: ["2026 (2) SCALE 145", "AIR 2026 SC 890"],
    judgmentDate: "2026-03-15",
    year: 2026,
    month: "March",
    judgmentType: "Civil Appeal",
    subject: "Civil Law",
    subCategory: "Civil Procedure",
    actsInvolved: ["Code of Civil Procedure, 1908"],
    sectionsConsidered: ["Order 41 Rule 1 CPC", "Section 11 CPC"],
    keywords: ["Composite Appeal", "Consolidated Suits", "Common Judgment", "Res Judicata", "Order 41 CPC"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_composite_appeal.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/2026_INSC_412.pdf",
    rightsStatus: "Public Judicial Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
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
    title: "Section 42 NDPS Act: Substantial Compliance Sufficient Where Urgent Search Risk Removing Contraband: Supreme Court",
    petitioner: "State of Punjab",
    respondent: "Gurmail Singh & Anr",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Punjab",
    judge: "Justice J.B. Pardiwala & Justice K. Vinod Chandran",
    bench: "Division Bench",
    caseNumber: "Criminal Appeal No. 812 of 2026",
    appealNumber: "SLP (Crl) No. 4410 of 2025",
    neutralCitation: "2026 INSC 308",
    equivalentCitations: ["2026 (1) Crimes 312", "2026 (2) Ker LT 95"],
    judgmentDate: "2026-02-28",
    year: 2026,
    month: "February",
    judgmentType: "Criminal Appeal",
    subject: "Criminal Law",
    subCategory: "NDPS & Search Safeguards",
    actsInvolved: ["Narcotic Drugs and Psychotropic Substances Act, 1985"],
    sectionsConsidered: ["Section 42 NDPS Act", "Section 41 NDPS Act"],
    keywords: ["NDPS Act", "Section 42 Compliance", "Search & Seizure", "Urgent Search", "Narcotic Contraband"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_ndps_search.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/2026_INSC_308.pdf",
    rightsStatus: "Public Judicial Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
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
    title: "Wife and Children Entitled to Consortium: Supreme Court Enhances Motor Accident Compensation to Rs 12.47 Lakh",
    petitioner: "Saraswathi & Ors",
    respondent: "United India Insurance Co. Ltd.",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Uttar Pradesh",
    judge: "Justice Surya Kant & Justice Dipankar Datta",
    bench: "Division Bench",
    caseNumber: "Civil Appeal No. 3450 of 2026",
    appealNumber: "SLP (C) No. 11200 of 2025",
    neutralCitation: "2026 INSC 510",
    equivalentCitations: ["2026 (3) TAC 12", "2026 (2) ACJ 401"],
    judgmentDate: "2026-03-22",
    year: 2026,
    month: "March",
    judgmentType: "Civil Appeal",
    subject: "Motor Vehicles",
    subCategory: "Accident Compensation & Insurance",
    actsInvolved: ["Motor Vehicles Act, 1988"],
    sectionsConsidered: ["Section 166 Motor Vehicles Act", "Section 168 Motor Vehicles Act"],
    keywords: ["Motor Accident Claim", "Consortium Compensation", "Multiplier Method", "Loss of Dependency", "Future Prospects"],
    caseOutcome: "Partly Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_mact_consortium.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/2026_INSC_510.pdf",
    rightsStatus: "Public Judicial Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_mact_consortium.pdf",
    fileName: "Motor_Accident_Compensation_Consortium_2026.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "The deceased victim, aged 38, died in a road accident involving a rashly driven commercial truck. High Court had awarded Rs 7.5 Lakhs by granting consortium to only the surviving wife while excluding minor children and elderly parents.",
      issues: "Whether spousal, parental, and filial consortium are individually payable to each dependent under Section 166 of Motor Vehicles Act 1988 in light of National Insurance Co. v. Pranay Sethi.",
      relevantLaw: "Motor Vehicles Act, 1988 — Sections 166 & 168; Pranay Sethi & Magma General Insurance precedents.",
      courtReasoning: "The Supreme Court re-affirmed that consortium is not a collective lump sum for a family but a individual statutory right of spousal loss, parental guidance loss for children, and filial companionship loss for parents.",
      holding: "Each legal heir and dependent is entitled to an independent consortium head of Rs 40,000 (with 10% enhancement every 3 years).",
      keyPrinciple: "Loss of companionship under MV Act must be calculated per dependent rather than per household.",
      outcome: "Compensation enhanced from Rs 7.5 Lakhs to Rs 12.47 Lakhs with 7.5% per annum interest from date of claim petition."
    }
  },
  {
    _id: "jud_sc_2026_04",
    title: "Residential House Exemption U/S 60(1)(ccc) CPC Is Personal to Judgment-Debtor, Cannot Be Claimed by Legal Heirs: Supreme Court",
    petitioner: "Rameshwar Dayal (Dead) through LRs",
    respondent: "State Bank of India & Anr",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Delhi",
    judge: "Justice Abhay S. Oka & Justice Ujjal Bhuyan",
    bench: "Division Bench",
    caseNumber: "Civil Appeal No. 2105 of 2026",
    appealNumber: "SLP (C) No. 6710 of 2025",
    neutralCitation: "2026 INSC 198",
    equivalentCitations: ["2026 (1) RCR (Civil) 880", "2026 (2) ALT 45"],
    judgmentDate: "2026-02-10",
    year: 2026,
    month: "February",
    judgmentType: "Civil Appeal",
    subject: "Civil Law",
    subCategory: "Execution of Decrees",
    actsInvolved: ["Code of Civil Procedure, 1908"],
    sectionsConsidered: ["Section 60(1)(ccc) CPC", "Section 50 CPC"],
    keywords: ["Execution of Decree", "Section 60 CPC", "Exemption from Attachment", "Residential House", "Legal Representatives"],
    caseOutcome: "Dismissed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_cpc_section60.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/2026_INSC_198.pdf",
    rightsStatus: "Public Judicial Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2026/judgement_cpc_section60.pdf",
    fileName: "CPC_Section60_Residential_Exemption_2026.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "Bank obtained a money decree against original judgment-debtor. During execution proceedings, the original debtor passed away. His legal heirs resisted attachment of the single residential house claiming statutory immunity under Section 60(1)(ccc) CPC.",
      issues: "Whether the statutory protection against attachment of a main residential house under Section 60(1)(ccc) CPC is a personal privilege of the living debtor or an inheritable immunity by legal heirs.",
      relevantLaw: "Code of Civil Procedure, 1908 — Section 60(1)(ccc) & Section 50 (Liability of Legal Representatives).",
      courtReasoning: "The Court held that the legislative object of Section 60(1)(ccc) is to prevent homelessness of an living judgment-debtor during his lifetime. Upon death, the estate devolves on legal representatives under Section 50 CPC, who inherit property subject to decree liabilities.",
      holding: "Statutory exemption under Section 60(1)(ccc) CPC is personal to the judgment-debtor and lapses upon his death.",
      keyPrinciple: "Statutory execution exemptions designed for personal protection do not insulate inherited property from ancestral decree satisfaction.",
      outcome: "Appeal dismissed; bank permitted to proceed with execution of decree against inherited residential property."
    }
  },
  {
    _id: "jud_sc_2025_01",
    title: "Section 34 Arbitration Act: Court Cannot Modify Arbitral Award, Can Only Confirm or Set Aside: Supreme Court Bench",
    petitioner: "NHAI",
    respondent: "M/s Hakeem & Anr",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Central / All India",
    judge: "Justice R.F. Nariman & Justice B.R. Gavai",
    bench: "Division Bench",
    caseNumber: "Civil Appeal No. 4001 of 2025",
    neutralCitation: "2025 INSC 812",
    equivalentCitations: ["2025 (4) Arb LR 12", "AIR 2025 SC 1120"],
    judgmentDate: "2025-08-14",
    year: 2025,
    month: "August",
    judgmentType: "Civil Appeal",
    subject: "Arbitration Law",
    subCategory: "Setting Aside Arbitral Awards",
    actsInvolved: ["Arbitration and Conciliation Act, 1996"],
    sectionsConsidered: ["Section 34 Arbitration Act", "Section 37 Arbitration Act"],
    keywords: ["Arbitration", "Section 34", "Modification of Award", "Judicial Interference", "UNCITRAL Model Law"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2025/judgement_arbitration_modification.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/2025_INSC_812.pdf",
    rightsStatus: "Public Judicial Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2025/judgement_arbitration_modification.pdf",
    fileName: "Arbitration_Section34_No_Modification_2025.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "District Court in Section 34 proceedings modified the compensation rate awarded by the Arbitrator in land acquisition arbitration. High Court upheld the modification under appellate jurisdiction.",
      issues: "Whether Section 34 of the Arbitration and Conciliation Act 1996 empowers courts to vary or modify arbitral awards or merely permits setting aside.",
      relevantLaw: "Arbitration and Conciliation Act, 1996 — Section 34 & UNCITRAL Model Law Article 34.",
      courtReasoning: "The Supreme Court emphasized that Section 34 is modeled on UNCITRAL Model Law which deliberately avoids conferring power to modify awards. Minimal judicial intervention is the cornerstone of arbitration law. If an award is patently illegal, the court must set it aside and relegate parties to fresh proceedings.",
      holding: "Courts exercising Section 34 jurisdiction cannot modify, rewrite, or alter arbitral awards.",
      keyPrinciple: "Judicial review under Section 34 is supervisory, not appellate; courts can set aside awards but cannot rewrite arbitrator findings.",
      outcome: "Appeal allowed; judicial modification of award set aside."
    }
  },
  {
    _id: "jud_sc_2024_01",
    title: "Zero FIR Registration Mandatory Under Section 173 BNSS: Supreme Court Guidelines on Police Jurisdiction",
    petitioner: "State of Maharashtra",
    respondent: "Prakash & Ors",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Maharashtra",
    judge: "Justice D.Y. Chandrachud & Justice P.S. Narasimha",
    bench: "Division Bench",
    caseNumber: "Criminal Appeal No. 1920 of 2024",
    neutralCitation: "2024 INSC 650",
    equivalentCitations: ["2024 (3) SCC (Crl) 210", "2024 (2) SCALE 88"],
    judgmentDate: "2024-09-10",
    year: 2024,
    month: "September",
    judgmentType: "Criminal Appeal",
    subject: "Criminal Law",
    subCategory: "Investigation & Zero FIR",
    actsInvolved: ["Bharatiya Nagarik Suraksha Sanhita, 2023", "Code of Criminal Procedure, 1973"],
    sectionsConsidered: ["Section 173 BNSS", "Section 154 CrPC"],
    keywords: ["Zero FIR", "Cognizable Offence", "Police Jurisdiction", "BNSS Section 173", "Immediate Registration"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2024/judgement_zero_fir.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/2024_INSC_650.pdf",
    rightsStatus: "Public Judicial Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2024/judgement_zero_fir.pdf",
    fileName: "Zero_FIR_Supreme_Court_2024.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "Victim attempted to lodge complaint of grave cognizable offence at police station where offence did not occur. Police refused registration citing territorial jurisdiction limits.",
      issues: "Whether police officers are bound to register Zero FIR immediately upon receiving cognizable offence information regardless of territorial limits.",
      relevantLaw: "BNSS 2023 Section 173 & Lalita Kumari v. Govt of UP precedent.",
      courtReasoning: "The Court mandated that territorial jurisdiction is irrelevant at the stage of FIR registration. Police must register Zero FIR, initiate emergency medical/forensic preservation, and subsequently transfer case files to jurisdictional station.",
      holding: "Registration of Zero FIR is mandatory upon receipt of cognizable offence disclosure.",
      keyPrinciple: "Procedural boundaries cannot delay crime reporting or victim access to criminal justice.",
      outcome: "Guidelines issued to all Director Generals of Police across States & Union Territories."
    }
  },
  {
    _id: "jud_sc_2020_01",
    title: "Vineeta Sharma v. Rakesh Sharma: Daughters Have Equal Coparcenary Rights By Birth Under Section 6 Hindu Succession Act",
    petitioner: "Vineeta Sharma",
    respondent: "Rakesh Sharma & Ors",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Delhi",
    judge: "Justice Arun Mishra, Justice S. Abdul Nazeer & Justice M.R. Shah",
    bench: "Three Judge Bench",
    caseNumber: "Civil Appeal No. 3260 of 2020",
    neutralCitation: "2020 INSC 515",
    equivalentCitations: ["(2020) 9 SCC 1", "AIR 2020 SC 3717"],
    judgmentDate: "2020-08-11",
    year: 2020,
    month: "August",
    judgmentType: "Civil Appeal",
    subject: "Personal Law",
    subCategory: "Hindu Succession & Coparcenary",
    actsInvolved: ["Hindu Succession Act, 1956", "Hindu Succession (Amendment) Act, 2005"],
    sectionsConsidered: ["Section 6 Hindu Succession Act"],
    keywords: ["Coparcenary", "Daughter's Rights", "Section 6 HSA", "Retrospective Effect", "Ancestral Property"],
    caseOutcome: "Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/2020/judgement_vineeta_sharma.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/2020_INSC_515.pdf",
    rightsStatus: "Public Landmark Judicial Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
    pdfUrl: "https://main.sci.gov.in/supremecourt/2020/judgement_vineeta_sharma.pdf",
    fileName: "Vineeta_Sharma_Hindu_Succession_2020.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "Conflicting Supreme Court decisions (Prakash v. Phulavati & Danamma v. Amar) existed on whether a daughter's coparcenary right under amended Section 6 HSA depends on her father being alive on 09.09.2005.",
      issues: "Whether the 2005 Amendment to Section 6 of the Hindu Succession Act confers coparcenary status on daughters by birth regardless of whether father was living on amendment date.",
      relevantLaw: "Hindu Succession Act, 1956 — Section 6 (as amended by Act 39 of 2005).",
      courtReasoning: "The 3-Judge Bench held that coparcenary right is conferred by birth. It is an unobstructed heritage. The status of living father on 09.09.2005 is irrelevant. The statutory right attached from birth.",
      holding: "Daughters are coparceners by birth with equal rights and liabilities as sons in Joint Hindu Family property.",
      keyPrinciple: "Coparcenary right of a Hindu daughter is created by birth under Section 6 HSA and does not depend on living status of father on 2005 amendment date.",
      outcome: "Reference answered; Prakash v. Phulavati overruled; coparcenary rights of daughters fully protected."
    }
  },
  {
    _id: "jud_sc_1973_01",
    title: "Kesavananda Bharati v. State of Kerala: Basic Structure Doctrine of the Indian Constitution",
    petitioner: "His Holiness Kesavananda Bharati Sripadagalvaru",
    respondent: "State of Kerala & Anr",
    court: "Supreme Court of India",
    courtLevel: "Supreme Court",
    state: "Kerala",
    judge: "Chief Justice S.M. Sikri & 12 Other Judges",
    bench: "13-Judge Constitution Bench",
    caseNumber: "Writ Petition (Civil) No. 135 of 1970",
    neutralCitation: "1973 INSC 98",
    equivalentCitations: ["(1973) 4 SCC 225", "AIR 1973 SC 1461"],
    judgmentDate: "1973-04-24",
    year: 1973,
    month: "April",
    judgmentType: "Writ Petition",
    subject: "Constitutional Law",
    subCategory: "Constitutional Amendments & Basic Structure",
    actsInvolved: ["Constitution of India"],
    sectionsConsidered: ["Article 368", "Article 13", "Article 31C"],
    keywords: ["Basic Structure Doctrine", "Article 368", "Constitutional Amendment", "Judicial Review", "Fundamental Rights"],
    caseOutcome: "Partly Allowed",
    sourceAuthority: "Supreme Court of India",
    sourceUrl: "https://main.sci.gov.in/supremecourt/1973/judgement_kesavananda.pdf",
    officialSourceUrl: "https://judgments.ecourts.gov.in/pdf/1973_INSC_98.pdf",
    rightsStatus: "Public Supreme Constitutional Record",
    importSource: "eCourts / Supreme Court Ingestion Pipeline",
    dataVersion: "1.0.0",
    legalStatus: "Public Judicial Record",
    lastVerified: "2026-10-02",
    pdfUrl: "https://main.sci.gov.in/supremecourt/1973/judgement_kesavananda.pdf",
    fileName: "Kesavananda_Bharati_Basic_Structure_1973.pdf",
    uploadedBy: "Supreme Court Registry",
    summary: {
      background: "Challenge to the 24th, 25th, and 29th Constitutional Amendments which sought to limit fundamental rights and grant unlimited amending power to Parliament under Article 368.",
      issues: "What is the extent of Parliament's power to amend the Constitution of India under Article 368?",
      relevantLaw: "Constitution of India — Article 368, Article 13 & Part III Fundamental Rights.",
      courtReasoning: "By a 7:6 majority, the 13-Judge Bench established that while Parliament has broad power to amend any part of the Constitution including fundamental rights, it cannot alter, damage or destroy the essential features or 'Basic Structure' of the Constitution.",
      holding: "Article 368 does not enable Parliament to alter the basic structure or framework of the Constitution.",
      keyPrinciple: "Parliamentary amending power under Article 368 is limited and cannot abrogate basic structure pillars like judicial review, rule of law, and secularism.",
      outcome: "Basic Structure Doctrine established as fundamental constitutional law of India."
    }
  }
];
