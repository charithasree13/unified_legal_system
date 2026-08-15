import { LegalSectionMapping } from '../models/Schemas';

export const seedSectionMappings = [
  // IPC -> BNS Mappings
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 302',
    legacyTitle: 'Punishment for murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 103(1)',
    newTitle: 'Punishment for murder',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Substantive provisions governing punishment for murder correspond directly from IPC Section 302 to BNS Section 103(1).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 420',
    legacyTitle: 'Cheating and dishonestly inducing delivery of property',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 318(4)',
    newTitle: 'Cheating and dishonestly inducing delivery of property',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Offence of cheating with inducement to deliver property transferred from IPC 420 to BNS Section 318(4).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 375 & 376',
    legacyTitle: 'Rape and punishment for rape',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 63 & 64',
    newTitle: 'Rape and punishment for rape',
    mappingType: 'MULTIPLE_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Definition of rape (IPC 375) and punishments (IPC 376) are mapped into BNS Sections 63 and 64 respectively.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 124A',
    legacyTitle: 'Sedition',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 152',
    newTitle: 'Acts endangering sovereignty, unity and integrity of India',
    mappingType: 'REORGANIZED',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'IPC 124A (Sedition) was repealed and replaced with reorganized provisions under BNS 152 covering actions endangering national integrity.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 307',
    legacyTitle: 'Attempt to murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 109',
    newTitle: 'Attempt to murder',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Attempt to murder corresponds directly to BNS Section 109.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 498A',
    legacyTitle: 'Husband or relative of husband of a woman subjecting her to cruelty',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 85',
    newTitle: 'Subjecting a woman to cruelty by husband or relatives',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 141',
    legacyTitle: 'Unlawful assembly',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 189',
    newTitle: 'Unlawful assembly',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Definition and terms of unlawful assembly mapped to BNS Section 189.'
  },

  // CrPC -> BNSS Mappings
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 154',
    legacyTitle: 'Information in cognizable cases (First Information Report)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 173',
    newTitle: 'Information in cognizable cases',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'CrPC 154 provisions for lodging FIR now map to BNSS Section 173.'
  },
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 41',
    legacyTitle: 'When police may arrest without warrant',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 35',
    newTitle: 'When police may arrest without warrant',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Arrest powers without warrant relocated from CrPC 41 to BNSS Section 35.'
  },
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 167',
    legacyTitle: 'Procedure when investigation cannot be completed in twenty-four hours (Remand)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 187',
    newTitle: 'Procedure when investigation cannot be completed in twenty-four hours',
    mappingType: 'PARTIAL_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Police and judicial custody remand procedure under CrPC 167 updated and mapped to BNSS Section 187.'
  },
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 438',
    legacyTitle: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 482',
    newTitle: 'Direction for grant of bail to person apprehending arrest',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Anticipatory bail provisions under CrPC 438 mapped to BNSS Section 482.'
  },

  // IEA -> BSA Mappings
  {
    legacyAct: 'Indian Evidence Act, 1872 (IEA)',
    legacySection: 'Section 65B',
    legacyTitle: 'Admissibility of electronic records',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 63',
    newTitle: 'Admissibility of electronic records',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Electronic evidence admissibility certificate requirements (IEA 65B) relocated to BSA Section 63.'
  },
  {
    legacyAct: 'Indian Evidence Act, 1872 (IEA)',
    legacySection: 'Section 27',
    legacyTitle: 'How much of information received from accused may be proved',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 23',
    newTitle: 'How much of information received from accused may be proved',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Discovery statement provisions under IEA 27 relocated to BSA Section 23.'
  },

  // Needs Review / Unverified Example
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 377',
    legacyTitle: 'Unnatural offences',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'N/A',
    newTitle: 'No direct provision',
    mappingType: 'NO_DIRECT_EQUIVALENT',
    mappingStatus: 'NEEDS_REVIEW',
    sourceReference: 'https://www.centurylawfirm.in/blog/legal-code-comparison-tool/',
    factualNotes: 'Draft comparison pending legal expert panel verification regarding omitted provisions.'
  }
];

export const seedSectionMappingDatabase = async () => {
  try {
    const existing = await LegalSectionMapping.find();
    if (existing && existing.length > 0) {
      console.log('Legal Section Mapping database already populated.');
      return;
    }

    for (const item of seedSectionMappings) {
      await LegalSectionMapping.create(item);
    }
    console.log(`Successfully seeded ${seedSectionMappings.length} legal section mappings.`);
  } catch (error) {
    console.error('Error seeding legal section mappings database:', error);
  }
};
