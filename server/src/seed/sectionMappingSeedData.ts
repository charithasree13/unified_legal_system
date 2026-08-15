import { LegalSectionMapping } from '../models/Schemas';

export const seedSectionMappings = [
  // IPC -> BNS Mappings
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 354',
    legacyTitle: 'Assault or criminal force to woman with intent to outrage her modesty',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 74',
    newTitle: 'Assault or use of criminal force to woman with intent to outrage her modesty',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Offence of assault or criminal force to outrage modesty transferred from IPC 354 to BNS Section 74 with equivalent statutory provisions.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 354A',
    legacyTitle: 'Sexual harassment and punishment for sexual harassment',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 75',
    newTitle: 'Sexual harassment',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Sexual harassment definitions and penal clauses correspond from IPC Section 354A to BNS Section 75.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 354B',
    legacyTitle: 'Assault or use of criminal force to woman with intent to disrobe',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 76',
    newTitle: 'Assault or use of criminal force to woman with intent to disrobe',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Offence of assault with intent to disrobe relocated to BNS Section 76.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 354C',
    legacyTitle: 'Voyeurism',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 77',
    newTitle: 'Voyeurism',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Voyeurism provisions under IPC 354C mapped directly to BNS Section 77.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 354D',
    legacyTitle: 'Stalking',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 78',
    newTitle: 'Stalking',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Offence of stalking transferred from IPC 354D to BNS Section 78.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 302',
    legacyTitle: 'Punishment for murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 103(1)',
    newTitle: 'Punishment for murder',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Substantive provisions governing punishment for murder correspond directly from IPC Section 302 to BNS Section 103(1).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 304',
    legacyTitle: 'Punishment for culpable homicide not amounting to murder',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 105',
    newTitle: 'Punishment for culpable homicide not amounting to murder',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Culpable homicide not amounting to murder transferred from IPC 304 to BNS Section 105.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 304A',
    legacyTitle: 'Causing death by negligence',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 106(1)',
    newTitle: 'Causing death by negligence',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Death caused by rash or negligent act relocated from IPC 304A to BNS Section 106(1).'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Attempt to murder corresponds directly from IPC Section 307 to BNS Section 109.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 323',
    legacyTitle: 'Punishment for voluntarily causing hurt',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 115(2)',
    newTitle: 'Voluntarily causing hurt',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Voluntarily causing simple hurt relocated from IPC 323 to BNS Section 115(2).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 324',
    legacyTitle: 'Voluntarily causing hurt by dangerous weapons or means',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 118(1)',
    newTitle: 'Voluntarily causing hurt by dangerous weapons or means',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Causing hurt using dangerous weapons transferred to BNS Section 118(1).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 326',
    legacyTitle: 'Voluntarily causing grievous hurt by dangerous weapons or means',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 118(2)',
    newTitle: 'Voluntarily causing grievous hurt by dangerous weapons or means',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Grievous hurt by dangerous weapons mapped from IPC 326 to BNS Section 118(2).'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Definition of rape (IPC 375) and punishments (IPC 376) mapped into BNS Sections 63 and 64 respectively.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 378 & 379',
    legacyTitle: 'Theft and punishment for theft',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 303(1) & 303(2)',
    newTitle: 'Theft and punishment for theft',
    mappingType: 'MULTIPLE_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Theft definition and penal terms mapped from IPC 378/379 to BNS Section 303.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 405 & 406',
    legacyTitle: 'Criminal breach of trust and punishment',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 316(1) & 316(2)',
    newTitle: 'Criminal breach of trust',
    mappingType: 'MULTIPLE_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Criminal breach of trust provisions relocated from IPC 405/406 to BNS Section 316.'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Offence of cheating with inducement to deliver property transferred from IPC 420 to BNS Section 318(4).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 463 & 465',
    legacyTitle: 'Forgery and punishment for forgery',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 336(1) & 336(2)',
    newTitle: 'Forgery and punishment for forgery',
    mappingType: 'MULTIPLE_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Forgery offences mapped from IPC 463/465 to BNS Section 336.'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 506',
    legacyTitle: 'Punishment for criminal intimidation',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 351(2)',
    newTitle: 'Criminal intimidation',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Criminal intimidation offences transferred from IPC 506 to BNS Section 351(2).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 120B',
    legacyTitle: 'Punishment of criminal conspiracy',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 61(2)',
    newTitle: 'Criminal conspiracy',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Criminal conspiracy renumbered from IPC 120B to BNS Section 61(2).'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'IPC 124A (Sedition) was repealed and replaced with reorganized provisions under BNS 152 covering actions endangering national integrity.'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'CrPC 154 provisions for lodging FIR now map to BNSS Section 173 with provisions for Zero FIR & electronic registration.'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Anticipatory bail provisions under CrPC 438 mapped to BNSS Section 482.'
  },
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 190',
    legacyTitle: 'Cognizance of offences by Magistrates',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 210',
    newTitle: 'Cognizance of offences by Magistrates',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Magistrate cognizance powers transferred from CrPC 190 to BNSS Section 210.'
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
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
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Discovery statement provisions under IEA 27 relocated to BSA Section 23.'
  },
  {
    legacyAct: 'Indian Evidence Act, 1872 (IEA)',
    legacySection: 'Section 3',
    legacyTitle: 'Interpretation clause (Definition of Evidence, Proved, Disproved)',
    newAct: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    newSection: 'Section 2',
    newTitle: 'Definitions and Interpretation',
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Evidence definitions updated to include electronic and digital records, relocated from IEA 3 to BSA Section 2.'
  }
];

export const seedSectionMappingDatabase = async () => {
  try {
    // Clear and re-seed to ensure all updated built-in section mappings (including IPC 354, 302, etc.) are loaded cleanly
    await LegalSectionMapping.deleteMany?.({});
    
    for (const item of seedSectionMappings) {
      await LegalSectionMapping.create(item);
    }
    console.log(`Successfully seeded ${seedSectionMappings.length} built-in legal section mappings.`);
  } catch (error) {
    // Fallback if deleteMany not supported on mock model
    try {
      const existing = await LegalSectionMapping.find();
      if (!existing || existing.length === 0) {
        for (const item of seedSectionMappings) {
          await LegalSectionMapping.create(item);
        }
      } else {
        // Update or insert built-in items
        for (const item of seedSectionMappings) {
          const match = await LegalSectionMapping.findOne({ legacySection: item.legacySection });
          if (!match) {
            await LegalSectionMapping.create(item);
          }
        }
      }
    } catch (e) {
      console.error('Error seeding legal section mappings:', e);
    }
  }
};
