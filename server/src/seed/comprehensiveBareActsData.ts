export interface SectionItem {
  sectionNumber: string;
  title: string;
  content: string;
  subsections?: { number: string; text: string }[];
}

export interface ChapterItem {
  chapterNumber: string;
  title: string;
  sections: SectionItem[];
}

export interface ScheduleItem {
  scheduleNumber: string;
  title: string;
  content: string;
}

export interface BareActSeedItem {
  _id: string;
  canonicalKey?: string;
  title: string;
  actName: string;
  shortTitle: string;
  actNumber: string;
  year: number;
  enactmentDate: string;
  commencementDate: string;
  ministry: string;
  department?: string;
  jurisdiction: string;
  actStatus: 'CURRENTLY_IN_FORCE' | 'AMENDED' | 'AMENDED_NOT_YET_COMMENCED' | 'REPEALED';
  longTitle: string;
  category: string;
  subCategory?: string;
  description: string;
  sourceAuthority: string;
  sourceUrl: string;
  officialSourceUrl: string;
  rightsStatus: string;
  importSource: string;
  dataVersion: string;
  lastVerified: string;
  uploadedBy: string;
  chapters: ChapterItem[];
  schedules?: ScheduleItem[];
}

export const COMPREHENSIVE_BARE_ACTS_DATA: BareActSeedItem[] = [
  {
    _id: "act_bns_2023",
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    actName: "The Bharatiya Nyaya Sanhita, 2023",
    shortTitle: "BNS 2023",
    actNumber: "Act No. 45 of 2023",
    year: 2023,
    enactmentDate: "2023-12-25",
    commencementDate: "2024-07-01",
    ministry: "Ministry of Home Affairs / Ministry of Law and Justice",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the provisions relating to offences and for matters connected therewith or incidental thereto.",
    category: "Criminal Law",
    subCategory: "Substantive Criminal Law",
    description: "Enacted by Parliament (Act No. 45 of 2023). Replaced the Indian Penal Code (1860). Modernized offences against women & children, organized crime, terrorism, mob lynching, and community service penalties.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/20000",
    officialSourceUrl: "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    rightsStatus: "Public Statutory Gazette & Official Government Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
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
              { number: "(1)", text: "Short title: Bharatiya Nyaya Sanhita, 2023." },
              { number: "(2)", text: "Territorial extent: Whole of India." }
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
          },
          {
            sectionNumber: "Section 106",
            title: "Causing death by negligence",
            content: "(1) Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_bnss_2023",
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    actName: "The Bharatiya Nagarik Suraksha Sanhita, 2023",
    shortTitle: "BNSS 2023",
    actNumber: "Act No. 46 of 2023",
    year: 2023,
    enactmentDate: "2023-12-25",
    commencementDate: "2024-07-01",
    ministry: "Ministry of Home Affairs / Ministry of Law and Justice",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the law relating to Criminal Procedure.",
    category: "Procedure",
    subCategory: "Criminal Procedure",
    description: "Enacted by Parliament (Act No. 46 of 2023). Replaced the Code of Criminal Procedure (1973). Regulates criminal investigation, Zero FIR, mandatory digital forensics, electronic summons, court trial timelines, and undertrial bail.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/20001",
    officialSourceUrl: "https://www.mha.gov.in/sites/default/files/250884_english_01042024.pdf",
    rightsStatus: "Public Statutory Gazette & Official Government Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
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
    _id: "act_bsa_2023",
    title: "The Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    actName: "The Bharatiya Sakshya Adhiniyam, 2023",
    shortTitle: "BSA 2023",
    actNumber: "Act No. 47 of 2023",
    year: 2023,
    enactmentDate: "2023-12-25",
    commencementDate: "2024-07-01",
    ministry: "Ministry of Law and Justice",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and provide general rules and principles of evidence for fair trial.",
    category: "Evidence",
    subCategory: "Law of Evidence",
    description: "Act No. 47 of 2023. Replaced the Indian Evidence Act (1872). Equates electronic records with primary evidence and updates digital testimony rules.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/20002",
    officialSourceUrl: "https://www.mha.gov.in/sites/default/files/250885_english_01042024.pdf",
    rightsStatus: "Public Statutory Gazette & Official Government Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Ministry of Law & Justice",
    chapters: [
      {
        chapterNumber: "Part I",
        title: "Relevancy of Facts",
        sections: [
          {
            sectionNumber: "Section 61",
            title: "Electronic and Digital Evidence",
            content: "Electronic or digital records shall have the same legal effect, validity and enforceability as paper documents.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_cpc_1908",
    title: "The Code of Civil Procedure, 1908 (CPC)",
    actName: "The Code of Civil Procedure, 1908",
    shortTitle: "CPC 1908",
    actNumber: "Act No. 5 of 1908",
    year: 1908,
    enactmentDate: "1908-03-21",
    commencementDate: "1909-01-01",
    ministry: "Ministry of Law and Justice",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the laws relating to the Procedure of the Courts of Civil Judicature.",
    category: "Civil Law",
    subCategory: "Civil Procedure",
    description: "Act No. 5 of 1908. Fundamental code governing jurisdiction, trial procedure, pleadings, injunctions, execution of decrees, and civil appeals in Indian civil courts.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2191",
    officialSourceUrl: "https://www.indiacode.nic.in/bitstream/123456789/2191/1/A1908-05.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Legislative Department",
    chapters: [
      {
        chapterNumber: "Part I",
        title: "Suits in General",
        sections: [
          {
            sectionNumber: "Section 9",
            title: "Courts to try all civil suits unless barred",
            content: "The Courts shall (subject to the provisions herein contained) have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred.",
            subsections: []
          },
          {
            sectionNumber: "Section 11",
            title: "Res Judicata",
            content: "No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties...",
            subsections: []
          },
          {
            sectionNumber: "Section 89",
            title: "Settlement of disputes outside the Court (ADR)",
            content: "Where it appears to the Court that there exist elements of a settlement which may be acceptable to the parties, the Court shall formulate the terms of settlement and refer the same for Arbitration, Conciliation, Judicial Settlement or Mediation.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_crpc_1973",
    title: "The Code of Criminal Procedure, 1973 (CrPC)",
    actName: "The Code of Criminal Procedure, 1973",
    shortTitle: "CrPC 1973",
    actNumber: "Act No. 2 of 1974",
    year: 1973,
    enactmentDate: "1974-01-25",
    commencementDate: "1974-04-01",
    ministry: "Ministry of Home Affairs / Ministry of Law and Justice",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "AMENDED",
    longTitle: "An Act to consolidate and amend the law relating to Criminal Procedure.",
    category: "Procedure",
    subCategory: "Criminal Procedure",
    description: "Act No. 2 of 1974. Historical procedure code governing investigation, arrest, bail, trial, and appeals in criminal courts.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1611",
    officialSourceUrl: "https://www.indiacode.nic.in/bitstream/123456789/1611/1/A1974-02.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Legislative Department",
    chapters: [
      {
        chapterNumber: "Chapter XII",
        title: "Information to the Police and Their Powers to Investigate",
        sections: [
          {
            sectionNumber: "Section 154",
            title: "Information in cognizable cases (FIR)",
            content: "(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction...",
            subsections: []
          },
          {
            sectionNumber: "Section 438",
            title: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
            content: "Where any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_ipc_1860",
    title: "The Indian Penal Code, 1860 (IPC)",
    actName: "The Indian Penal Code, 1860",
    shortTitle: "IPC 1860",
    actNumber: "Act No. 45 of 1860",
    year: 1860,
    enactmentDate: "1860-10-06",
    commencementDate: "1862-01-01",
    ministry: "Ministry of Home Affairs",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "AMENDED",
    longTitle: "An Act to provide a general Penal Code for India.",
    category: "Criminal Law",
    subCategory: "Substantive Penal Law",
    description: "Act No. 45 of 1860. The primary substantive penal code of India for over 160 years defining criminal offences and punishments.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2263",
    officialSourceUrl: "https://www.indiacode.nic.in/bitstream/123456789/2263/1/A1860-45.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Legislative Department",
    chapters: [
      {
        chapterNumber: "Chapter XVI",
        title: "Of Offences Affecting the Human Body",
        sections: [
          {
            sectionNumber: "Section 302",
            title: "Punishment for Murder",
            content: "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
            subsections: []
          },
          {
            sectionNumber: "Section 304B",
            title: "Dowry death",
            content: "(1) Where the death of a woman is caused by any burns or bodily injury or occurs otherwise than under normal circumstances within seven years of her marriage, and it is shown that soon before her death she was subjected to cruelty or harassment by her husband or any relative of her husband for, or in connection with, any demand for dowry, such death shall be called 'dowry death'.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_constitution_1950",
    title: "The Constitution of India, 1950",
    actName: "The Constitution of India",
    shortTitle: "Constitution of India",
    actNumber: "Supreme Lex of India",
    year: 1950,
    enactmentDate: "1949-11-26",
    commencementDate: "1950-01-26",
    ministry: "Ministry of Law and Justice",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "The supreme law of the Republic of India establishing fundamental rights, directive principles, and government frameworks.",
    category: "Constitutional Law",
    subCategory: "Supreme Law",
    description: "The supreme law of India. Contains 395 Articles in 22 Parts and 12 Schedules establishing fundamental rights, state policy, parliament, judiciary, and emergency powers.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2186",
    officialSourceUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa58fa5520f8138d0174/uploads/2023/05/2023050195.pdf",
    rightsStatus: "Public Supreme Law Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Constituent Assembly / Govt of India",
    chapters: [
      {
        chapterNumber: "Part III",
        title: "Fundamental Rights",
        sections: [
          {
            sectionNumber: "Article 14",
            title: "Equality before law",
            content: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
            subsections: []
          },
          {
            sectionNumber: "Article 19",
            title: "Protection of certain rights regarding freedom of speech, etc.",
            content: "(1) All citizens shall have the right— (a) to freedom of speech and expression; (b) to assemble peaceably and without arms; (c) to form associations or unions; (d) to move freely throughout the territory of India...",
            subsections: []
          },
          {
            sectionNumber: "Article 21",
            title: "Protection of life and personal liberty",
            content: "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
            subsections: []
          },
          {
            sectionNumber: "Article 32",
            title: "Remedies for enforcement of rights conferred by Part III (Writ Jurisdiction)",
            content: "(1) The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed. (2) The Supreme Court shall have power to issue directions or orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari...",
            subsections: []
          },
          {
            sectionNumber: "Article 226",
            title: "Power of High Courts to issue certain writs",
            content: "Notwithstanding anything in Article 32 every High Court shall have powers, throughout the territories in relation to which it exercises jurisdiction, to issue to any person or authority directions, orders or writs...",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_limitation_1963",
    title: "The Limitation Act, 1963",
    actName: "The Limitation Act, 1963",
    shortTitle: "Limitation Act 1963",
    actNumber: "Act No. 36 of 1963",
    year: 1963,
    enactmentDate: "1963-10-05",
    commencementDate: "1964-01-01",
    ministry: "Ministry of Law and Justice",
    department: "Legislative Department",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the law for the limitation of suits and other proceedings and for purposes connected therewith.",
    category: "Civil Law",
    subCategory: "Limitation & Prescription",
    description: "Act No. 36 of 1963. Governs periods of limitation for instituting suits, appeals, and applications in Indian courts, exclusion of time in legal proceedings, and condonation of delay.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1565",
    officialSourceUrl: "https://www.indiacode.nic.in/bitstream/123456789/1565/1/A1963-36.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Legislative Department",
    chapters: [
      {
        chapterNumber: "Part I",
        title: "Preliminary",
        sections: [
          {
            sectionNumber: "Section 3",
            title: "Bar of limitation",
            content: "(1) Subject to the provisions contained in sections 4 to 24 (inclusive), every suit instituted, appeal preferred, and application made after the prescribed period shall be dismissed, although limitation has not been set up as a defence.",
            subsections: []
          },
          {
            sectionNumber: "Section 5",
            title: "Extension of prescribed period in certain cases (Condonation of Delay)",
            content: "Any appeal or any application may be admitted after the prescribed period, if the appellant or the applicant satisfies the court that he had sufficient cause for not preferring the appeal or making the application within such period.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_arbitration_1996",
    title: "The Arbitration and Conciliation Act, 1996",
    actName: "The Arbitration and Conciliation Act, 1996",
    shortTitle: "Arbitration Act 1996",
    actNumber: "Act No. 26 of 1996",
    year: 1996,
    enactmentDate: "1996-08-16",
    commencementDate: "1996-01-25",
    ministry: "Ministry of Law and Justice",
    department: "Department of Legal Affairs",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the law relating to domestic arbitration, international commercial arbitration and enforcement of foreign arbitral awards.",
    category: "Arbitration Law",
    subCategory: "Alternative Dispute Resolution",
    description: "Act No. 26 of 1996. Governs domestic arbitration, international commercial arbitration, emergency interim relief under Section 9, appointment of arbitrators under Section 11, and setting aside arbitral awards under Section 34.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1978",
    officialSourceUrl: "https://www.indiacode.nic.in/bitstream/123456789/1978/1/A1996-26.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Ministry of Law & Justice",
    chapters: [
      {
        chapterNumber: "Part I",
        title: "Arbitration - General Provisions",
        sections: [
          {
            sectionNumber: "Section 8",
            title: "Power to refer parties to arbitration where there is an arbitration agreement",
            content: "A judicial authority, before which an action is brought in a matter which is the subject of an arbitration agreement shall refer the parties to arbitration unless it finds that prima facie no valid arbitration agreement exists.",
            subsections: []
          },
          {
            sectionNumber: "Section 9",
            title: "Interim measures by Court",
            content: "A party may, before or during arbitral proceedings or at any time after the making of the arbitral award but before it is enforced, apply to a court for interim protection.",
            subsections: []
          },
          {
            sectionNumber: "Section 11",
            title: "Appointment of Arbitrators",
            content: "A party may apply to the Supreme Court or High Court for appointment of arbitrator if procedure fails.",
            subsections: []
          },
          {
            sectionNumber: "Section 34",
            title: "Application for setting aside arbitral award",
            content: "Recourse to a Court against an arbitral award may be made only by an application for setting aside such award in accordance with sub-section (2) and sub-section (3).",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_motor_vehicles_1988",
    title: "The Motor Vehicles Act, 1988",
    actName: "The Motor Vehicles Act, 1988",
    shortTitle: "Motor Vehicles Act 1988",
    actNumber: "Act No. 59 of 1988",
    year: 1988,
    enactmentDate: "1988-10-14",
    commencementDate: "1989-07-01",
    ministry: "Ministry of Road Transport and Highways",
    department: "Transport Department",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the law relating to motor vehicles.",
    category: "Motor Vehicles",
    subCategory: "Road Transport & Accident Compensation",
    description: "Act No. 59 of 1988. Regulates licensing of drivers, vehicle registration, traffic rules, insurance of motor vehicles against third party risks, and Motor Accident Claims Tribunals (MACT).",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1798",
    officialSourceUrl: "https://morth.nic.in/sites/default/files/motor-vehicles-act-1988.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Ministry of Road Transport & Highways",
    chapters: [
      {
        chapterNumber: "Chapter XI",
        title: "Insurance of Motor Vehicles Against Third Party Risks",
        sections: [
          {
            sectionNumber: "Section 166",
            title: "Application for compensation",
            content: "(1) An application for compensation arising out of an accident of the nature specified in sub-section (1) of section 165 may be made— (a) by the person who has sustained the injury; or (b) by the owner of the property; or (c) where death has resulted from the accident, by all or any of the legal representatives of the deceased.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_ni_1881",
    title: "The Negotiable Instruments Act, 1881",
    actName: "The Negotiable Instruments Act, 1881",
    shortTitle: "NI Act 1881",
    actNumber: "Act No. 26 of 1881",
    year: 1881,
    enactmentDate: "1881-12-09",
    commencementDate: "1882-03-01",
    ministry: "Ministry of Finance / Ministry of Law and Justice",
    department: "Department of Financial Services",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to define and amend the law relating to Promissory Notes, Bills of Exchange and Cheques.",
    category: "Banking Law",
    subCategory: "Commercial & Financial Law",
    description: "Act No. 26 of 1881. Governs promissory notes, bills of exchange, cheques, dishonour of cheques for insufficiency of funds (Section 138), statutory demand notice, and interim compensation (Section 143A).",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2196",
    officialSourceUrl: "https://www.indiacode.nic.in/bitstream/123456789/2196/1/A1881-26.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Ministry of Finance",
    chapters: [
      {
        chapterNumber: "Chapter XVII",
        title: "Of Penalties in Case of Dishonour of Certain Cheques for Insufficiency of Funds in the Accounts",
        sections: [
          {
            sectionNumber: "Section 138",
            title: "Dishonour of cheque for insufficiency, etc., of funds in the account",
            content: "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid...",
            subsections: []
          },
          {
            sectionNumber: "Section 141",
            title: "Offences by companies",
            content: "(1) If the person committing an offence under section 138 is a company, every person who, at the time the offence was committed, was in charge of, and was responsible to the company for the conduct of the business of the company...",
            subsections: []
          },
          {
            sectionNumber: "Section 143A",
            title: "Power to direct interim compensation",
            content: "(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973, the Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_it_2000",
    title: "The Information Technology Act, 2000",
    actName: "The Information Technology Act, 2000",
    shortTitle: "IT Act 2000",
    actNumber: "Act No. 21 of 2000",
    year: 2000,
    enactmentDate: "2000-06-09",
    commencementDate: "2000-10-17",
    ministry: "Ministry of Electronics and Information Technology (MeitY)",
    department: "Cyber Law & Governance Division",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to provide legal recognition for transactions carried out by means of electronic data interchange and other means of electronic communication.",
    category: "Cyber Law",
    subCategory: "Information Technology & Digital Protection",
    description: "Act No. 21 of 2000. Provides legal recognition to electronic signatures, electronic governance, cyber crime penalties, computer hacking (Section 66), intermediary safe harbor (Section 79), and digital privacy protection.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1999",
    officialSourceUrl: "https://www.meity.gov.in/writereaddata/files/itact2000.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "MeitY",
    chapters: [
      {
        chapterNumber: "Chapter XI",
        title: "Offences",
        sections: [
          {
            sectionNumber: "Section 66",
            title: "Computer related offences",
            content: "If any person dishonestly or fraudulently does any act referred to in section 43, he shall be punishable with imprisonment for a term which may extend to three years or with fine.",
            subsections: []
          },
          {
            sectionNumber: "Section 66E",
            title: "Punishment for violation of privacy",
            content: "Whoever, intentionally or knowingly captures, publishes or transmits the image of a private area of any person without consent shall be punished with imprisonment up to three years.",
            subsections: []
          },
          {
            sectionNumber: "Section 79",
            title: "Exemption from liability of intermediary in certain cases (Safe Harbor)",
            content: "An intermediary shall not be liable for any third party information, data, or communication link made available or hosted by him if he observes due diligence.",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_ibc_2016",
    title: "The Insolvency and Bankruptcy Code, 2016 (IBC)",
    actName: "The Insolvency and Bankruptcy Code, 2016",
    shortTitle: "IBC 2016",
    actNumber: "Act No. 31 of 2016",
    year: 2016,
    enactmentDate: "2016-05-28",
    commencementDate: "2016-12-01",
    ministry: "Ministry of Corporate Affairs",
    department: "Insolvency Section",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the laws relating to reorganisation and insolvency resolution of corporate persons, partnership firms and individuals in a time bound manner.",
    category: "Corporate Law",
    subCategory: "Insolvency & Restructuring",
    description: "Act No. 31 of 2016. Unified framework governing Corporate Insolvency Resolution Process (CIRP), NCLT proceedings, moratorium under Section 14, operational & financial creditors (Sections 7 & 9), and liquidation.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2154",
    officialSourceUrl: "https://www.mca.gov.in/Ministry/pdf/TheInsolvencyandBankruptcyCode2016.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Ministry of Corporate Affairs",
    chapters: [
      {
        chapterNumber: "Part II Chapter II",
        title: "Corporate Insolvency Resolution Process (CIRP)",
        sections: [
          {
            sectionNumber: "Section 7",
            title: "Initiation of corporate insolvency resolution process by financial creditor",
            content: "A financial creditor either by itself or jointly with other financial creditors may file an application for initiating corporate insolvency resolution process against a corporate debtor before the Adjudicating Authority when a default has occurred.",
            subsections: []
          },
          {
            sectionNumber: "Section 14",
            title: "Moratorium",
            content: "Subject to provisions of sub-sections (2) and (3), on the insolvency commencement date, the Adjudicating Authority shall by order declare moratorium for prohibiting the institution of suits or continuation of pending suits against the corporate debtor...",
            subsections: []
          }
        ]
      }
    ]
  },
  {
    _id: "act_ndps_1985",
    title: "The Narcotic Drugs and Psychotropic Substances Act, 1985 (NDPS)",
    actName: "The Narcotic Drugs and Psychotropic Substances Act, 1985",
    shortTitle: "NDPS Act 1985",
    actNumber: "Act No. 61 of 1985",
    year: 1985,
    enactmentDate: "1985-09-16",
    commencementDate: "1985-11-14",
    ministry: "Ministry of Finance / Narcotics Control Bureau",
    department: "Department of Revenue",
    jurisdiction: "Central / All India",
    actStatus: "CURRENTLY_IN_FORCE",
    longTitle: "An Act to consolidate and amend the law relating to narcotic drugs, to make stringent provisions for the control and regulation of operations relating to narcotic drugs and psychotropic substances.",
    category: "Criminal Law",
    subCategory: "Special Criminal Legislation",
    description: "Act No. 61 of 1985. Governs prohibition, control, and regulation of narcotic drugs, search and seizure safeguards (Sections 42 & 50), commercial quantity penalties, and stringent bail conditions under Section 37.",
    sourceAuthority: "India Code / Legislative Department, Govt. of India",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1789",
    officialSourceUrl: "https://narcoticsindia.nic.in/upload/download/document_id1649232309.pdf",
    rightsStatus: "Public Statutory Record",
    importSource: "India Code Ingestion Pipeline",
    dataVersion: "1.0.0",
    lastVerified: "2026-10-02",
    uploadedBy: "Narcotics Control Bureau",
    chapters: [
      {
        chapterNumber: "Chapter V",
        title: "Procedure",
        sections: [
          {
            sectionNumber: "Section 42",
            title: "Power of entry, search, seizure and arrest without warrant or authorisation",
            content: "Any such officer (being an officer superior in rank to a peon, sepoy or constable) of the departments of central excise, narcotics, customs, revenue intelligence or any other department of a State Government empowered in this behalf...",
            subsections: []
          },
          {
            sectionNumber: "Section 50",
            title: "Conditions under which search of persons shall be conducted",
            content: "When any officer authorised under section 42 is about to search any person under the provisions of section 41, section 42 or section 43, he shall, if such person so requires, take such person without unnecessary delay to the nearest Gazetted Officer of any of the departments mentioned in section 42 or to the nearest Magistrate.",
            subsections: []
          }
        ]
      }
    ]
  }
];
