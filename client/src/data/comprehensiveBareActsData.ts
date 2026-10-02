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
  }
];
