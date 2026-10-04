export interface SectionMapping {
  _id: string;
  oldAct: string;
  oldSection: string;
  oldSectionTitle: string;
  newAct: string;
  newSection: string;
  newSectionTitle: string;
  mappingType: 'DIRECT_EQUIVALENT' | 'MODIFIED_EQUIVALENT' | 'MERGED' | 'SPLIT' | 'PARTIAL_EQUIVALENT' | 'NO_DIRECT_EQUIVALENT' | 'REPEALED_OR_OMITTED' | 'MULTIPLE_NEW_PROVISIONS' | 'MULTIPLE_OLD_PROVISIONS' | 'DIRECT_REPLACEMENT' | 'REORGANIZED';
  mappingExplanation: string;
  newSectionContent?: string;
  keyChanges?: string[] | string;
  sourceName?: string;
  sourceUrl?: string;
  officialSourceUrl?: string;
  verificationStatus?: 'VERIFIED' | 'SECONDARY_SOURCE_VERIFIED' | 'NEEDS_REVIEW';
  verifiedBy?: string;
  lastVerifiedAt?: string;
  canonicalKey?: string;

  // Backwards compatibility aliases
  legacyAct?: string;
  legacySection?: string;
  legacyTitle?: string;
  newTitle?: string;
  mappingStatus?: string;
  sourceReference?: string;
  factualNotes?: string;
}

export const builtInSectionMappings: SectionMapping[] = [
  // IPC -> BNS
  {
    _id: 'builtin-1',
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 302',
    oldSectionTitle: 'Punishment for murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 103(1)',
    newSectionTitle: 'Punishment for murder & Mob Lynching',
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Substantive punishment for murder transferred from IPC 302 to BNS Section 103(1). BNS 103(2) adds explicit statutory capital punishment / life imprisonment penalty for mob lynching and group hate crimes.',
    newSectionContent: `(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.

(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.`,
    keyChanges: [
      'IPC Section 302 corresponds to BNS Section 103(1).',
      'Sub-section (2) introduces a landmark statutory penalty specifically for mob lynching and group hate crimes.',
      'Prescribes capital punishment or life imprisonment for every member of a lynching group.'
    ],
    sourceName: 'India Code (Gazette of India)',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department, Ministry of Law and Justice',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IPC::302::BNS::103(1)',
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 302',
    legacyTitle: 'Punishment for murder',
    newTitle: 'Punishment for murder & Mob Lynching',
    mappingStatus: 'VERIFIED',
    sourceReference: 'India Code (https://www.indiacode.nic.in/)',
    factualNotes: 'IPC 302 murder penalty corresponds to BNS 103(1).'
  },
  {
    _id: 'builtin-2',
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 304',
    oldSectionTitle: 'Punishment for culpable homicide not amounting to murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 105',
    newSectionTitle: 'Punishment for culpable homicide not amounting to murder',
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Culpable homicide not amounting to murder renumbered from IPC 304 to BNS Section 105. Maintains life imprisonment or up to 10 years for Part I, and up to 10 years or fine for Part II.',
    newSectionContent: `Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine, if the act by which the death is caused is done with the intention of causing death...`,
    keyChanges: [
      'Renumbered from IPC 304 to BNS Section 105.',
      'Maintains distinction between intention and knowledge of causing bodily injury.'
    ],
    sourceName: 'India Code (Gazette of India)',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IPC::304::BNS::105'
  },
  {
    _id: 'builtin-3',
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 304A',
    oldSectionTitle: 'Causing death by negligence',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 106(1)',
    newSectionTitle: 'Causing death by negligence & Hit-and-Run',
    mappingType: 'SPLIT',
    mappingExplanation: 'IPC 304A baseline negligence sentence increased from 2 to 5 years under BNS 106(1). BNS 106(2) creates a distinct 10-year imprisonment offence for hit-and-run drivers who flee without reporting to police.',
    newSectionContent: `(1) Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which shall not be less than five years, and shall also be liable to fine.

(2) Whoever causes the death of any person by rash and negligent driving of vehicle not amounting to culpable homicide, and escapes without reporting it to a police officer or a Magistrate soon after the incident, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`,
    keyChanges: [
      'Baseline sentence for rash/negligent death increased from 2 years (IPC 304A) to 5 years (BNS 106(1)).',
      'Hit-and-run driver non-reporting offence carries up to 10 years imprisonment under BNS 106(2).'
    ],
    sourceName: 'India Code (Gazette of India)',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IPC::304A::BNS::106(1)'
  },
  {
    _id: 'builtin-4',
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 307',
    oldSectionTitle: 'Attempt to murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 109',
    newSectionTitle: 'Attempt to murder',
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Attempt to murder transferred from IPC 307 to BNS Section 109. Prescribes up to 10 years imprisonment, and life imprisonment if hurt is caused.',
    newSectionContent: `(1) Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`,
    keyChanges: [
      'Renumbered from IPC 307 to BNS Section 109.',
      'Preserves 10-year baseline and life imprisonment when physical hurt is inflicted.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IPC::307::BNS::109'
  },
  {
    _id: 'builtin-5',
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 376',
    oldSectionTitle: 'Punishment for rape',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 64',
    newSectionTitle: 'Punishment for rape',
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Rape penal provisions transferred from IPC 376 to BNS Section 64. Mandatory minimum sentence increased from 7 years to 10 years, extendable to life imprisonment.',
    newSectionContent: `(1) Whoever... commits rape shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.`,
    keyChanges: [
      'Renumbered from IPC 376 to BNS Section 64.',
      'Mandatory minimum sentence increased from 7 to 10 years rigorous imprisonment.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IPC::376::BNS::64'
  },
  {
    _id: 'builtin-6',
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 420',
    oldSectionTitle: 'Cheating and dishonestly inducing delivery of property',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 318(4)',
    newSectionTitle: 'Cheating and dishonestly inducing delivery of property',
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC Section 420 (cheating with property delivery) relocated to BNS Section 318(4). General cheating is governed under BNS 318(1) and 318(2).',
    newSectionContent: `(4) Whoever cheats and dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'Renumbered from IPC 420 to BNS Section 318(4).',
      'Preserves maximum 7-year imprisonment and fine.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IPC::420::BNS::318(4)'
  },
  {
    _id: 'builtin-7',
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 124A',
    oldSectionTitle: 'Sedition',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 152',
    newSectionTitle: 'Acts endangering sovereignty, unity and integrity of India',
    mappingType: 'REPEALED_OR_OMITTED',
    mappingExplanation: 'IPC Section 124A (Sedition) was repealed. Replaced by BNS Section 152 targeting acts endangering national integrity, electronic communications, and financial funding of secessionist acts without utilizing the term "Sedition".',
    newSectionContent: `Whoever, purposely or knowingly, by words... or by electronic communication or by use of financial means, excites secession or armed rebellion or subversive activities... shall be punished with imprisonment for life or up to seven years.`,
    keyChanges: [
      'Term "Sedition" completely omitted.',
      'BNS Section 152 focuses specifically on subversion, secession, armed rebellion, and financial funding of terrorism/separatism.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IPC::124A::BNS::152'
  },

  // CrPC -> BNSS
  {
    _id: 'builtin-8',
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 154',
    oldSectionTitle: 'Information in cognizable cases (First Information Report)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 173',
    newSectionTitle: 'Information in cognizable cases (e-FIR & Zero FIR)',
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'CrPC 154 provisions for lodging FIR now map to BNSS Section 173 with formal statutory framework for Zero FIR across all jurisdictions, e-FIR registration, and 14-day preliminary enquiry window for offences punishable between 3 to 7 years.',
    newSectionContent: `(1) Every information relating to the commission of a cognizable offence... may be given by electronic communication (e-FIR), provided it is taken on record on being signed within three days by the person giving it.
(2) Zero FIR: Information relating to cognizable offences shall be recorded irrespective of jurisdiction...`,
    keyChanges: [
      'Statutory mandate for Zero FIR regardless of territorial jurisdiction.',
      'Framework for e-FIR with signature validation within 3 days.',
      'Preliminary enquiry window of 14 days for offences carrying 3-7 years sentence.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'CrPC::154::BNSS::173'
  },
  {
    _id: 'builtin-9',
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 167',
    oldSectionTitle: 'Procedure when investigation cannot be completed in 24 hours (Remand)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 187',
    newSectionTitle: 'Procedure when investigation cannot be completed in 24 hours',
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Remand provisions under CrPC 167 relocated to BNSS Section 187. Allows 15 days of police custody in whole or in parts spread across the first 40 or 60 days of detention, and authorizes virtual production via video conferencing.',
    newSectionContent: `(2) The Magistrate may authorize detention in police custody for a term not exceeding fifteen days in the whole, or in parts, at any time during the initial forty days or sixty days out of detention period of sixty days or ninety days.`,
    keyChanges: [
      '15-day police custody can be spread across the initial 40 or 60 days of detention.',
      'Explicit statutory authorization for video-conferencing production for remand extension.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'CrPC::167::BNSS::187'
  },
  {
    _id: 'builtin-10',
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 438',
    oldSectionTitle: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 482',
    newSectionTitle: 'Direction for grant of bail to person apprehending arrest',
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Anticipatory bail provisions transferred from CrPC Section 438 to BNSS Section 482 without altering core judicial principles.',
    newSectionContent: `Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section...`,
    keyChanges: [
      'Renumbered from CrPC 438 to BNSS Section 482.',
      'Sessions Court and High Court concurrent jurisdiction preserved.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'CrPC::438::BNSS::482'
  },

  // Evidence -> BSA
  {
    _id: 'builtin-11',
    oldAct: 'Indian Evidence Act, 1872 (IEA)',
    oldSection: 'Section 65B',
    oldSectionTitle: 'Admissibility of electronic records',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 63',
    newSectionTitle: 'Admissibility of electronic records',
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Electronic evidence certificate requirements under IEA Section 65B transferred to BSA Section 63. Expands scope to cover semiconductor memory, cloud storage, encrypted digital chats, and server logs.',
    newSectionContent: `(1) Any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or semiconductor memory produced by a computer shall be deemed to be also a document...`,
    keyChanges: [
      'Renumbered from IEA 65B to BSA Section 63.',
      'Explicit inclusion of cloud storage, server logs, smartphone apps, and semiconductor memory.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IEA::65B::BSA::63'
  },
  {
    _id: 'builtin-12',
    oldAct: 'Indian Evidence Act, 1872 (IEA)',
    oldSection: 'Section 27',
    oldSectionTitle: 'How much of information received from accused may be proved',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 23',
    newSectionTitle: 'How much of information received from accused may be proved',
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Discovery statement provisions in police custody transferred from IEA 27 to BSA Section 23.',
    newSectionContent: `Provided that, when any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information... as relates distinctly to the fact thereby discovered, may be proved.`,
    keyChanges: [
      'Renumbered from IEA 27 to BSA Section 23.',
      'Preserves admissibility of material recovery statements.'
    ],
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department',
    lastVerifiedAt: '2024-07-01',
    canonicalKey: 'IEA::27::BSA::23'
  }
];
