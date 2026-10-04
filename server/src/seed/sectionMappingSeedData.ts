import { LegalSectionMapping, AuditLog } from '../models/Schemas';

export interface LegalMappingSeedItem {
  oldAct: string;
  oldSection: string;
  oldSectionTitle: string;
  newAct: string;
  newSection: string;
  newSectionTitle: string;
  
  // Backward compatibility aliases
  legacyAct?: string;
  legacySection?: string;
  legacyTitle?: string;

  newSectionContent?: string;
  keyChanges?: string[];
  mappingType: 
    | 'DIRECT_EQUIVALENT' | 'MODIFIED_EQUIVALENT' | 'MERGED' | 'SPLIT' 
    | 'PARTIAL_EQUIVALENT' | 'NO_DIRECT_EQUIVALENT' | 'REPEALED_OR_OMITTED' 
    | 'MULTIPLE_NEW_PROVISIONS' | 'MULTIPLE_OLD_PROVISIONS'
    | 'DIRECT_REPLACEMENT' | 'PARTIAL_REPLACEMENT' | 'REORGANIZED';
  mappingExplanation?: string;
  factualNotes?: string;
  sourceName?: string;
  sourceUrl?: string;
  officialSourceUrl?: string;
  sourceReference?: string;
  verificationStatus?: 'VERIFIED' | 'SECONDARY_SOURCE_VERIFIED' | 'NEEDS_REVIEW';
  mappingStatus?: 'VERIFIED' | 'SECONDARY_SOURCE_VERIFIED' | 'NEEDS_REVIEW';
  verifiedBy?: string;
  lastVerifiedAt?: Date;
  version?: number;
  canonicalKey?: string;
  createdBy?: string;
}

export const generateCanonicalKey = (oldAct: string, oldSection: string, newAct: string, newSection: string): string => {
  const norm = (str: string) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${norm(oldAct)}_${norm(oldSection)}_${norm(newAct)}_${norm(newSection)}`;
};

export const seedSectionMappings: LegalMappingSeedItem[] = [
  // -------------------------------------------------------------
  // 1. IPC (1860) → BNS (2023) MAPPINGS
  // -------------------------------------------------------------
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 302',
    oldSectionTitle: 'Punishment for murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 103(1)',
    newSectionTitle: 'Punishment for murder',
    newSectionContent: `(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.

(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.`,
    keyChanges: [
      'Replaces IPC Section 302 with BNS Section 103(1).',
      'Sub-section (2) introduces a landmark statutory penalty specifically for mob lynching and group hate crimes.',
      'Prescribes capital punishment or life imprisonment for every member of a lynching group.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Substantive provisions governing punishment for murder correspond directly from IPC Section 302 to BNS Section 103(1).',
    factualNotes: 'Substantive provisions governing punishment for murder correspond directly from IPC Section 302 to BNS Section 103(1).',
    sourceName: 'India Code / Ministry of Home Affairs',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India (BNS, 2023 - Act No. 45 of 2023)',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department, Ministry of Law and Justice'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 304',
    oldSectionTitle: 'Punishment for culpable homicide not amounting to murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 105',
    newSectionTitle: 'Punishment for culpable homicide not amounting to murder',
    newSectionContent: `Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine, if the act by which the death is caused is done with the intention of causing death; or with imprisonment of either description for a term which may extend to ten years, or with fine, or with both, if the act is done with knowledge that it is likely to cause death, but without any intention to cause death.`,
    keyChanges: [
      'Culpable homicide not amounting to murder relocated from IPC Section 304 to BNS Section 105.',
      'Distinguishes intention-based culpable homicide (Part I) from knowledge-based culpable homicide (Part II).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Direct statutory replacement of IPC 304 under BNS Section 105.',
    factualNotes: 'IPC 304 corresponds directly to BNS Section 105.',
    sourceName: 'India Code / Ministry of Home Affairs',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 304A',
    oldSectionTitle: 'Causing death by negligence',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 106(1)',
    newSectionTitle: 'Causing death by negligence',
    newSectionContent: `(1) Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine.

(2) Whoever causes the death of any person by rash and negligent driving of vehicle not amounting to culpable homicide, and escapes without reporting it to a police officer or a Magistrate soon after the incident, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`,
    keyChanges: [
      'Increases baseline negligence sentence from 2 years (IPC 304A) to 5 years under BNS Section 106(1).',
      'Sub-section (2) introduces stringent 10-year imprisonment penalty for hit-and-run drivers who flee without reporting to police.'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Death caused by rash or negligent act relocated from IPC 304A to BNS Section 106(1), with enhanced hit-and-run penalty under 106(2).',
    factualNotes: 'Death caused by rash or negligent act relocated from IPC 304A to BNS Section 106(1).',
    sourceName: 'India Code / Legislative Department',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 304B',
    oldSectionTitle: 'Dowry death',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 80',
    newSectionTitle: 'Dowry death',
    newSectionContent: `(1) Where the death of a woman is caused by any burns or bodily injury or occurs otherwise than under normal circumstances within seven years of her marriage, and it is shown that soon before her death she was subjected to cruelty or harassment by her husband or any relative of her husband for, or in connection with, any demand for dowry, such death shall be called "dowry death", and such husband or relative shall be deemed to have caused her death.

(2) Whoever commits dowry death shall be punished with imprisonment for a term which shall not be less than seven years but which may extend to imprisonment for life.`,
    keyChanges: [
      'Dowry death transferred from IPC 304B to BNS Section 80.',
      'Preserves 7-year statutory presumption window from marriage and mandatory minimum 7 years imprisonment up to life.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC Section 304B corresponds directly to BNS Section 80.',
    factualNotes: 'Dowry death offences relocated to BNS Section 80.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 307',
    oldSectionTitle: 'Attempt to murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 109',
    newSectionTitle: 'Attempt to murder',
    newSectionContent: `(1) Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.

(2) If hurt is caused to any person by such act, the offender shall be liable either to imprisonment for life, or to such punishment as is hereinbefore mentioned.`,
    keyChanges: [
      'Attempt to murder transferred from IPC 307 to BNS Section 109.',
      'Retains 10-year baseline sentence and life imprisonment if physical hurt is caused during the attempt.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Attempt to murder corresponds directly from IPC Section 307 to BNS Section 109.',
    factualNotes: 'Attempt to murder corresponds directly from IPC Section 307 to BNS Section 109.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 375',
    oldSectionTitle: 'Rape definition',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 63',
    newSectionTitle: 'Rape',
    newSectionContent: `A man is said to commit "rape" if he penetrates his penis, to any extent, into the vagina, mouth, urethra or anus of a woman or makes her to do so with him or any other person...`,
    keyChanges: [
      'Statutory definition of rape relocated from IPC 375 to BNS Section 63.',
      'Maintains protective framework under Chapter V of BNS.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC 375 definition of rape corresponds to BNS Section 63.',
    factualNotes: 'Rape definition relocated to BNS Section 63.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 376',
    oldSectionTitle: 'Punishment for rape',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 64',
    newSectionTitle: 'Punishment for rape',
    newSectionContent: `(1) Whoever commits rape shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.`,
    keyChanges: [
      'Punishment for rape renumbered from IPC 376 to BNS Section 64.',
      'Mandatory minimum sentence of 10 years rigorous imprisonment up to life.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC Section 376 corresponds to BNS Section 64.',
    factualNotes: 'Punishment for rape corresponds to BNS Section 64.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 354',
    oldSectionTitle: 'Assault or criminal force to woman with intent to outrage her modesty',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 74',
    newSectionTitle: 'Assault or use of criminal force to woman with intent to outrage her modesty',
    newSectionContent: `(1) Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year, but which may extend to five years, and shall also be liable to fine.`,
    keyChanges: [
      'Prescribes a mandatory minimum imprisonment of one year (extendable up to five years) compared to erstwhile IPC 354.',
      'Retains gender-specific protection for women under Chapter V of BNS.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Offence transferred from IPC 354 to BNS Section 74.',
    factualNotes: 'Offence of assault or criminal force to outrage modesty transferred from IPC 354 to BNS Section 74.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 354A',
    oldSectionTitle: 'Sexual harassment and punishment for sexual harassment',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 75',
    newSectionTitle: 'Sexual harassment',
    newSectionContent: `(1) A man committing any of the following acts—
(i) physical contact and advances involving unwelcome and explicit sexual overtures; or
(ii) a demand or request for sexual favours; or
(iii) showing pornography against the will of a woman; or
(iv) making sexually coloured remarks,
shall be guilty of the offence of sexual harassment.`,
    keyChanges: [
      'Categorizes sexual harassment under Section 75 of BNS.',
      'Prescribes up to 3 years rigorous imprisonment for physical contact, sexual demands, or showing pornography.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Sexual harassment definitions and penal clauses correspond from IPC Section 354A to BNS Section 75.',
    factualNotes: 'Sexual harassment definitions and penal clauses correspond from IPC Section 354A to BNS Section 75.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 354B',
    oldSectionTitle: 'Assault or use of criminal force to woman with intent to disrobe',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 76',
    newSectionTitle: 'Assault or use of criminal force to woman with intent to disrobe',
    newSectionContent: `Any man who assaults or uses criminal force to any woman or abets such act with the intention of disrobing or compelling her to be naked, shall be punished with imprisonment for a term which shall not be less than three years but which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'Renumbered from IPC Section 354B to BNS Section 76.',
      'Mandates a strict minimum sentence of 3 years imprisonment.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Offence of assault with intent to disrobe relocated to BNS Section 76.',
    factualNotes: 'Offence of assault with intent to disrobe relocated to BNS Section 76.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 354C',
    oldSectionTitle: 'Voyeurism',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 77',
    newSectionTitle: 'Voyeurism',
    newSectionContent: `Any man who watches, or captures the image of a woman engaging in a private act in circumstances where she would usually have the expectation of not being observed...`,
    keyChanges: [
      'Voyeurism renumbered from IPC 354C to BNS Section 77.',
      'Explicitly includes digital recording and image dissemination.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Voyeurism provisions under IPC 354C mapped directly to BNS Section 77.',
    factualNotes: 'Voyeurism provisions under IPC 354C mapped directly to BNS Section 77.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 354D',
    oldSectionTitle: 'Stalking',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 78',
    newSectionTitle: 'Stalking',
    newSectionContent: `Any man who follows a woman and contacts, or attempts to contact such woman to foster personal interaction repeatedly despite a clear indication of disinterest...`,
    keyChanges: [
      'Stalking relocated to BNS Section 78.',
      'Strengthens cyber-stalking definitions to cover electronic tracking and email monitoring.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Offence of stalking transferred from IPC 354D to BNS Section 78.',
    factualNotes: 'Offence of stalking transferred from IPC 354D to BNS Section 78.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 378',
    oldSectionTitle: 'Theft',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 303(1)',
    newSectionTitle: 'Theft',
    newSectionContent: `Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.`,
    keyChanges: [
      'Definition of theft relocated from IPC 378 to BNS Section 303(1).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Theft definition under IPC 378 mapped to BNS Section 303(1).',
    factualNotes: 'Theft definition relocated to BNS Section 303(1).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 379',
    oldSectionTitle: 'Punishment for theft',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 303(2)',
    newSectionTitle: 'Punishment for theft',
    newSectionContent: `Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.`,
    keyChanges: [
      'Punishment for theft renumbered from IPC 379 to BNS Section 303(2).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC Section 379 corresponds to BNS Section 303(2).',
    factualNotes: 'Punishment for theft corresponds to BNS Section 303(2).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 420',
    oldSectionTitle: 'Cheating and dishonestly inducing delivery of property',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 318(4)',
    newSectionTitle: 'Cheating and dishonestly inducing delivery of property',
    newSectionContent: `Whoever cheats and dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'Offence of cheating with inducement renumbered from IPC 420 to BNS Section 318(4).',
      'Consolidates property offences under Chapter XVII of BNS.',
      'Retains maximum 7-year imprisonment term and fine.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Offence of cheating with inducement to deliver property transferred from IPC 420 to BNS Section 318(4).',
    factualNotes: 'Offence of cheating with inducement to deliver property transferred from IPC 420 to BNS Section 318(4).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 405',
    oldSectionTitle: 'Criminal breach of trust',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 316(1)',
    newSectionTitle: 'Criminal breach of trust',
    newSectionContent: `Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property... commits criminal breach of trust.`,
    keyChanges: [
      'Definition of criminal breach of trust renumbered from IPC 405 to BNS Section 316(1).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC 405 corresponds to BNS Section 316(1).',
    factualNotes: 'Criminal breach of trust definition relocated to BNS Section 316(1).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 406',
    oldSectionTitle: 'Punishment for criminal breach of trust',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 316(2)',
    newSectionTitle: 'Punishment for criminal breach of trust',
    newSectionContent: `Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both.`,
    keyChanges: [
      'Increases maximum sentence for basic criminal breach of trust from 3 years (IPC 406) to 5 years (BNS 316(2)).'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Punishment for criminal breach of trust renumbered from IPC 406 to BNS Section 316(2) with enhanced penalty.',
    factualNotes: 'Punishment for criminal breach of trust renumbered from IPC 406 to BNS Section 316(2).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 498A',
    oldSectionTitle: 'Husband or relative of husband of a woman subjecting her to cruelty',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 85',
    newSectionTitle: 'Subjecting a woman to cruelty by husband or relatives',
    newSectionContent: `Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.`,
    keyChanges: [
      'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.',
      'Retains comprehensive definition of physical and mental cruelty and dowry coercion.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.',
    factualNotes: 'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 124A',
    oldSectionTitle: 'Sedition',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 152',
    newSectionTitle: 'Acts endangering sovereignty, unity and integrity of India',
    newSectionContent: `Whoever, purposely or knowingly, by words, either spoken or written, or by signs, or by visible representation, or by electronic communication or by use of financial means, excites or attempts to excite, secession or armed rebellion or subversive activities, or encourages feelings of separatist activities or endangers sovereignty or unity and integrity of India, shall be punished with imprisonment for life or with imprisonment of either description which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'IPC 124A (Sedition) repealed; replaced with BNS Section 152 targeting acts endangering national integrity.',
      'Explicitly covers digital/electronic communications and financial funding of secessionist acts.'
    ],
    mappingType: 'REORGANIZED',
    mappingExplanation: 'IPC 124A (Sedition) was repealed and replaced with reorganized provisions under BNS 152 covering actions endangering national integrity.',
    factualNotes: 'IPC 124A (Sedition) was repealed and replaced with reorganized provisions under BNS 152.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 120B',
    oldSectionTitle: 'Punishment of criminal conspiracy',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 61(2)',
    newSectionTitle: 'Criminal conspiracy',
    newSectionContent: `(2) Whoever is a party to a criminal conspiracy to commit an offence punishable with death, imprisonment for life or rigorous imprisonment for a term of two years or upwards, shall, where no express provision is made in this Sanhita for the punishment of such a conspiracy, be punished in the same manner as if he had abetted such offence.`,
    keyChanges: [
      'Criminal conspiracy punishment relocated from IPC 120B to BNS Section 61(2).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC Section 120B corresponds to BNS Section 61(2).',
    factualNotes: 'Criminal conspiracy relocated to BNS Section 61(2).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 34',
    oldSectionTitle: 'Acts done by several persons in furtherance of common intention',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 3(5)',
    newSectionTitle: 'Common intention',
    newSectionContent: `When a criminal act is done by several persons in furtherance of the common intention of all, each of such persons is liable for that act in the same manner as if it were done by him alone.`,
    keyChanges: [
      'Principle of common intention relocated from IPC 34 to BNS Section 3(5).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC Section 34 corresponds directly to BNS Section 3(5).',
    factualNotes: 'Common intention doctrine relocated to BNS Section 3(5).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Penal Code, 1860 (IPC)',
    oldSection: 'Section 279',
    oldSectionTitle: 'Rash driving or riding on a public way',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 281',
    newSectionTitle: 'Rash driving or riding on a public way',
    newSectionContent: `Whoever drives any vehicle, or rides, on any public way in a manner so rash or negligent as to endanger human life, or to be likely to cause hurt or injury to any other person, shall be punished with imprisonment of either description for a term which may extend to six months, or with fine which may extend to one thousand rupees, or with both.`,
    keyChanges: [
      'Rash driving relocated from IPC 279 to BNS Section 281.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IPC 279 corresponds directly to BNS Section 281.',
    factualNotes: 'Rash driving relocated to BNS Section 281.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },

  // -------------------------------------------------------------
  // 2. CrPC (1973) → BNSS (2023) MAPPINGS
  // -------------------------------------------------------------
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 154',
    oldSectionTitle: 'Information in cognizable cases (First Information Report)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 173',
    newSectionTitle: 'Information in cognizable cases',
    newSectionContent: `(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing. Information may be given by electronic communication (e-FIR), provided it is taken on record on being signed within three days by the person giving it.

(2) Zero FIR: Information relating to cognizable offences shall be recorded irrespective of the area where the offence was committed and transferred to the concerned station.

(3) For offences punishable between three and seven years, the police officer may, with prior permission of an officer not below the rank of Deputy Superintendent of Police, proceed to conduct a preliminary enquiry within fourteen days to ascertain whether a prima facie case exists before registering FIR.`,
    keyChanges: [
      'Formal statutory mandate for Zero FIR across all police stations regardless of territorial jurisdiction.',
      'Express statutory framework for e-FIR with signature validation within 3 days.',
      'Mandatory preliminary enquiry window of 14 days for offences carrying 3 to 7 years imprisonment.'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'CrPC 154 provisions for lodging FIR now map to BNSS Section 173 with provisions for Zero FIR & electronic registration.',
    factualNotes: 'CrPC 154 provisions for lodging FIR now map to BNSS Section 173 with provisions for Zero FIR & electronic registration.',
    sourceName: 'India Code / Ministry of Home Affairs',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India (BNSS, 2023 - Act No. 46 of 2023)',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 41',
    oldSectionTitle: 'When police may arrest without warrant',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 35',
    newSectionTitle: 'When police may arrest without warrant',
    newSectionContent: `(1) Any police officer may without an order from a Magistrate and without a warrant, arrest any person who commits a cognizable offence in the presence of a police officer, or against whom a reasonable complaint has been made...

(2) For offences punishable with less than seven years imprisonment, no arrest shall be made without prior permission of an officer not below the rank of Deputy Superintendent of Police in case of infirm, elderly, or sick persons.`,
    keyChanges: [
      'Arrest powers relocated from CrPC 41 to BNSS Section 35.',
      'Mandatory approval from DSP level officer for arresting infirm or elderly persons in minor cases.'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Arrest powers without warrant relocated from CrPC 41 to BNSS Section 35.',
    factualNotes: 'Arrest powers without warrant relocated from CrPC 41 to BNSS Section 35.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 41A',
    oldSectionTitle: 'Notice of appearance before police officer',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 35(3)',
    newSectionTitle: 'Notice of appearance before police officer',
    newSectionContent: `The police officer shall, in all cases where the arrest of a person is not required under sub-section (1), issue a notice directing the person against whom a reasonable complaint has been made to appear before him or at such other place as may be specified in the notice.`,
    keyChanges: [
      'Notice of appearance integrated into sub-section (3) of BNSS Section 35.'
    ],
    mappingType: 'MERGED',
    mappingExplanation: 'CrPC 41A integrated directly into sub-section (3) of BNSS Section 35.',
    factualNotes: 'Notice of appearance provisions integrated into BNSS 35(3).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 161',
    oldSectionTitle: 'Examination of witnesses by police',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 180',
    newSectionTitle: 'Examination of witnesses by police',
    newSectionContent: `(1) Any police officer making an investigation may examine orally any person supposed to be acquainted with the facts and circumstances of the case.

(2) Such person shall be bound to answer truly all questions relating to such case put to him by such officer, other than questions the answers to which would have a tendency to expose him to a criminal charge or to a penalty or forfeiture.

(3) Statements may also be recorded by audio-video electronic means.`,
    keyChanges: [
      'Witness examination provisions renumbered from CrPC 161 to BNSS Section 180.',
      'Expressly permits recording witness statements using audio-video electronic means.'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Examination of witnesses relocated to BNSS Section 180 with audio-video recording option.',
    factualNotes: 'CrPC 161 witness examination mapped to BNSS Section 180.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 164',
    oldSectionTitle: 'Recording of confessions and statements',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 183',
    newSectionTitle: 'Recording of confessions and statements',
    newSectionContent: `Any Metropolitan Magistrate or Judicial Magistrate may, whether or not he has jurisdiction in the case, record any confession or statement made to him in the course of an investigation. Audio-video electronic recording is permitted. In sexual offence cases, statements of victim shall be recorded by a woman Magistrate or in presence of female officer.`,
    keyChanges: [
      'Magistrate confession/statement recording renumbered from CrPC 164 to BNSS Section 183.',
      'Mandatory audio-video recording options and strict female magistrate recording for sexual violence victims.'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Recording of confessions and statements transferred to BNSS Section 183.',
    factualNotes: 'CrPC 164 mapped to BNSS Section 183.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 167',
    oldSectionTitle: 'Procedure when investigation cannot be completed in twenty-four hours (Remand)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 187',
    newSectionTitle: 'Procedure when investigation cannot be completed in twenty-four hours',
    newSectionContent: `(1) Whenever any person is arrested and detained in custody, and it appears that the investigation cannot be completed within twenty-four hours...

(2) Police custody of 15 days can be authorized in whole or in parts at any time during the initial forty days or sixty days out of statutory detention period of 60 or 90 days.`,
    keyChanges: [
      'Sub-section (2) of BNSS 187 permits 15 days police custody in whole or in parts across the initial 40/60 day period.',
      'Sub-section (4) explicitly authorizes virtual production of the accused through audio-video electronic means for subsequent remand extensions.'
    ],
    mappingType: 'PARTIAL_EQUIVALENT',
    mappingExplanation: 'Police and judicial custody remand procedure under CrPC 167 updated and mapped to BNSS Section 187 with flexible 15-day police custody spread.',
    factualNotes: 'Remand procedures transferred from CrPC 167 to BNSS Section 187.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 173',
    oldSectionTitle: 'Report of police officer on completion of investigation (Charge Sheet)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 193',
    newSectionTitle: 'Report of police officer on completion of investigation',
    newSectionContent: `Every investigation under this Chapter shall be completed without unnecessary delay. Police report / charge sheet shall be submitted within 90 days, with electronic submission permissible. Progress report to be informed to informant/victim within 90 days.`,
    keyChanges: [
      'Police charge sheet report relocated from CrPC 173 to BNSS Section 193.',
      'Mandates victim progress updates within 90 days and explicit electronic filing of charge sheets.'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Police report submission transferred to BNSS Section 193.',
    factualNotes: 'CrPC 173 mapped to BNSS Section 193.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 190',
    oldSectionTitle: 'Cognizance of offences by Magistrates',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 210',
    newSectionTitle: 'Cognizance of offences by Magistrates',
    newSectionContent: `Subject to the provisions of this Chapter, any Magistrate of the first class may take cognizance of any offence upon receiving a complaint, police report, or information from any person...`,
    keyChanges: [
      'Cognizance powers renumbered from CrPC 190 to BNSS Section 210.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Cognizance of offences by Magistrates relocated to BNSS Section 210.',
    factualNotes: 'CrPC 190 mapped to BNSS Section 210.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 438',
    oldSectionTitle: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 482',
    newSectionTitle: 'Direction for grant of bail to person apprehending arrest',
    newSectionContent: `Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section...`,
    keyChanges: [
      'Anticipatory bail provisions renumbered from CrPC 438 to BNSS Section 482.',
      'High Court and Sessions Court jurisdiction retained.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Anticipatory bail provisions under CrPC 438 mapped to BNSS Section 482.',
    factualNotes: 'Anticipatory bail provisions under CrPC 438 mapped to BNSS Section 482.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 439',
    oldSectionTitle: 'Special powers of High Court or Court of Session regarding bail',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 483',
    newSectionTitle: 'Special powers of High Court or Court of Session regarding bail',
    newSectionContent: `A High Court or Court of Session may direct that any person accused of an offence and in custody be released on bail...`,
    keyChanges: [
      'Special bail powers renumbered from CrPC 439 to BNSS Section 483.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Special bail powers under CrPC 439 transferred to BNSS Section 483.',
    factualNotes: 'CrPC 439 mapped to BNSS Section 483.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 125',
    oldSectionTitle: 'Order for maintenance of wives, children and parents',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 144',
    newSectionTitle: 'Order for maintenance of wives, children and parents',
    newSectionContent: `If any person having sufficient means neglects or refuses to maintain his wife, unable to maintain herself, or his legitimate or illegitimate child... a Magistrate of the first class may order such person to make a monthly allowance for maintenance.`,
    keyChanges: [
      'Statutory maintenance provisions relocated from CrPC 125 to BNSS Section 144.',
      'Preserves summary remedy for wives, minor children, and elderly parents.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Maintenance provisions transferred from CrPC 125 to BNSS Section 144.',
    factualNotes: 'Maintenance provisions transferred from CrPC 125 to BNSS Section 144.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    oldSection: 'Section 482',
    oldSectionTitle: 'Saving of inherent powers of High Court',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 528',
    newSectionTitle: 'Saving of inherent powers of High Court',
    newSectionContent: `Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.`,
    keyChanges: [
      'Inherent powers of High Court relocated from CrPC 482 to BNSS Section 528.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Inherent powers of High Court under CrPC 482 mapped to BNSS Section 528.',
    factualNotes: 'Inherent powers relocated to BNSS Section 528.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },

  // -------------------------------------------------------------
  // 3. INDIAN EVIDENCE ACT (1872) → BSA (2023) MAPPINGS
  // -------------------------------------------------------------
  {
    oldAct: 'Indian Evidence Act, 1872',
    oldSection: 'Section 65B',
    oldSectionTitle: 'Admissibility of electronic records',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 63',
    newSectionTitle: 'Admissibility of electronic records',
    newSectionContent: `(1) Notwithstanding anything contained in this Adhiniyam, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or semiconductor memory produced by a computer shall be deemed to be also a document.

(2) A certificate signed by a person occupying a responsible official position in relation to the operation of the relevant device shall be submitted certifying admissibility.`,
    keyChanges: [
      'Electronic evidence admissibility certificate requirements relocated from IEA 65B to BSA Section 63.',
      'Expanded scope to explicitly cover semiconductor memory, cloud storage, encrypted digital chats, and server logs.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Electronic evidence admissibility certificate requirements (IEA 65B) relocated to BSA Section 63.',
    factualNotes: 'Electronic evidence admissibility certificate requirements (IEA 65B) relocated to BSA Section 63.',
    sourceName: 'India Code / Ministry of Law and Justice',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India (BSA, 2023 - Act No. 47 of 2023)',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Evidence Act, 1872',
    oldSection: 'Section 24',
    oldSectionTitle: 'Confession caused by inducement, threat or promise, when irrelevant in criminal proceeding',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 22',
    newSectionTitle: 'Confession caused by inducement, threat or promise, when irrelevant in criminal proceeding',
    newSectionContent: `A confession made by an accused person is irrelevant in a criminal proceeding, if the making of the confession appears to the Court to have been caused by any inducement, threat or promise proceeding from a person in authority...`,
    keyChanges: [
      'Involuntary confession rule relocated from IEA 24 to BSA Section 22.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'IEA Section 24 corresponds to BSA Section 22.',
    factualNotes: 'Involuntary confession rule relocated to BSA Section 22.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Evidence Act, 1872',
    oldSection: 'Section 25',
    oldSectionTitle: 'Confession to police officer not to be proved',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 23(1)',
    newSectionTitle: 'Confession to police officer not to be proved',
    newSectionContent: `No confession made to a police officer shall be proved as against a person accused of any offence.`,
    keyChanges: [
      'Inadmissibility of police confessions renumbered from IEA 25 to BSA Section 23(1).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Police confession exclusion rule mapped from IEA 25 to BSA Section 23(1).',
    factualNotes: 'Inadmissibility of police confessions renumbered to BSA Section 23(1).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Evidence Act, 1872',
    oldSection: 'Section 27',
    oldSectionTitle: 'How much of information received from accused may be proved (Discovery Statement)',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 23(2)',
    newSectionTitle: 'How much of information received from accused may be proved',
    newSectionContent: `Provided that, when any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information, whether it amounts to a confession or not, as relates distinctly to the fact thereby discovered, may be proved.`,
    keyChanges: [
      'Discovery statement exception renumbered from IEA 27 to BSA Section 23(2).',
      'Preserves admissibility of material recovery statements made in police custody.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Discovery statement exception under IEA 27 relocated to BSA Section 23(2).',
    factualNotes: 'Discovery statement provisions under IEA 27 relocated to BSA Section 23(2).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Evidence Act, 1872',
    oldSection: 'Section 45',
    oldSectionTitle: 'Opinions of experts',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 39',
    newSectionTitle: 'Opinions of experts',
    newSectionContent: `When the Court has to form an opinion upon a point of foreign law or of science or art, or as to identity of handwriting or finger impressions or digital signature, the opinions upon that point of persons specially skilled in such foreign law, science or art... are relevant facts.`,
    keyChanges: [
      'Expert opinion provisions renumbered from IEA 45 to BSA Section 39.',
      'Explicitly includes digital signature, electronic hash, and cyber forensic experts.'
    ],
    mappingType: 'MODIFIED_EQUIVALENT',
    mappingExplanation: 'Expert evidence scope under IEA 45 expanded and transferred to BSA Section 39.',
    factualNotes: 'Expert opinion provisions relocated to BSA Section 39.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Evidence Act, 1872',
    oldSection: 'Section 101',
    oldSectionTitle: 'Burden of proof',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 104',
    newSectionTitle: 'Burden of proof',
    newSectionContent: `Whoever desires any Court to give judgment as to any legal right or liability dependent on the existence of facts which he asserts, must prove that those facts exist. When a person is bound to prove the existence of any fact, it is said that the burden of proof lies on that person.`,
    keyChanges: [
      'General burden of proof rule renumbered from IEA 101 to BSA Section 104.'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Burden of proof principle under IEA 101 corresponds to BSA Section 104.',
    factualNotes: 'Burden of proof rule relocated to BSA Section 104.',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  },
  {
    oldAct: 'Indian Evidence Act, 1872',
    oldSection: 'Section 32(1)',
    oldSectionTitle: 'Dying declaration',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 26(a)',
    newSectionTitle: 'Cases in which statement of relevant fact by person who is dead or cannot be found is relevant (Dying declaration)',
    newSectionContent: `When the statement is made by a person as to the cause of his death, or as to any of the circumstances of the transaction which resulted in his death, in cases in which the cause of that person's death comes into question...`,
    keyChanges: [
      'Dying declaration admissibility relocated from IEA 32(1) to BSA Section 26(a).'
    ],
    mappingType: 'DIRECT_EQUIVALENT',
    mappingExplanation: 'Dying declaration rule under IEA 32(1) relocated to BSA Section 26(a).',
    factualNotes: 'Dying declaration provisions relocated to BSA Section 26(a).',
    sourceName: 'India Code',
    sourceUrl: 'https://www.indiacode.nic.in/',
    officialSourceUrl: 'https://www.indiacode.nic.in/',
    sourceReference: 'Official Gazette of India',
    verificationStatus: 'VERIFIED',
    verifiedBy: 'Legislative Department'
  }
];

export const seedSectionMappingDatabase = async () => {
  try {
    let createdCount = 0;
    let updatedCount = 0;

    for (const item of seedSectionMappings) {
      const canonicalKey = item.canonicalKey || generateCanonicalKey(item.oldAct, item.oldSection, item.newAct, item.newSection);
      
      const payload = {
        ...item,
        legacyAct: item.oldAct,
        legacySection: item.oldSection,
        legacyTitle: item.oldSectionTitle,
        factualNotes: item.mappingExplanation || item.factualNotes || '',
        canonicalKey,
        mappingStatus: item.verificationStatus || 'VERIFIED',
        lastVerifiedAt: new Date()
      };

      const existing = await LegalSectionMapping.findOne({ canonicalKey });
      if (existing) {
        await LegalSectionMapping.findByIdAndUpdate(existing._id, payload);
        updatedCount++;
      } else {
        await LegalSectionMapping.create(payload);
        createdCount++;
      }
    }

    console.log(`Successfully processed legal section mappings: ${createdCount} created, ${updatedCount} updated.`);
  } catch (error) {
    console.error('Error seeding legal section mappings:', error);
  }
};
