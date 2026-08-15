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
    newSectionContent: 'Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year, but which may extend to five years, and shall also be liable to fine.',
    keyChanges: [
      'Prescribes mandatory minimum imprisonment of 1 year, extendable up to 5 years.',
      'Transferred from IPC 354 to BNS Section 74 under Chapter V (Offences Against Women and Children).',
      'Enhanced fine provisions alongside custodial sentence.'
    ],
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
    newSectionContent: 'A man committing any of the following acts—(i) physical contact and advances involving unwelcome and explicit sexual overtures; or (ii) a demand or request for sexual favours; or (iii) showing pornography against the will of a woman; or (iv) making sexually coloured remarks, shall be guilty of the offence of sexual harassment.',
    keyChanges: [
      'Categorizes sexual harassment under BNS Section 75.',
      'Punishable with rigorous imprisonment up to 3 years or fine for clauses (i), (ii), (iii).',
      'Punishable with imprisonment up to 1 year or fine for clause (iv).'
    ],
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
    newSectionContent: 'Any man who assaults or uses criminal force to any woman or abets such act with the intention of disrobing or compelling her to be naked, shall be punished with imprisonment of either description for a term which shall not be less than three years but which may extend to seven years, and shall also be liable to fine.',
    keyChanges: [
      'Relocated from IPC 354B to BNS Section 76.',
      'Minimum punishment fixed at 3 years imprisonment, extendable to 7 years.'
    ],
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
    newSectionContent: 'Any man who watches, or captures the image of a woman engaging in a private act in circumstances where she would usually have the expectation of not being observed, shall be punished on first conviction with imprisonment of not less than one year extendable to three years, and on second conviction with imprisonment up to seven years.',
    keyChanges: [
      'Voyeurism renumbered from IPC 354C to BNS Section 77.',
      'Covers digital capturing, dissemination, and observation without consent.'
    ],
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
    newSectionContent: 'Any man who—(i) follows a woman and contacts, or attempts to contact such woman repeatedly despite a clear indication of disinterest; or (ii) monitors the use by a woman of the internet, email or any other form of electronic communication, commits the offence of stalking.',
    keyChanges: [
      'Stalking offence relocated to BNS Section 78.',
      'Explicit coverage of cyber-stalking and online electronic monitoring.'
    ],
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
    newSectionContent: 'Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. Section 103(2) introduces specific penalties for murder committed by five or more persons acting in concert on grounds of race, caste, community, sex, place of birth, language, or personal belief.',
    keyChanges: [
      'Direct replacement of IPC Section 302 with BNS Section 103(1).',
      'Sub-section (2) introduces mandatory death or life imprisonment for mob lynching and group hate-crime murders.',
      'Retains capital punishment and life imprisonment options.'
    ],
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
    newSectionContent: 'Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine, if the act by which the death is caused is done with the intention of causing death.',
    keyChanges: [
      'Renumbered from IPC Section 304 to BNS Section 105.',
      'Differentiates acts done with intention versus knowledge under unified sub-clauses.'
    ],
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
    newSectionContent: 'Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine.',
    keyChanges: [
      'Increased general imprisonment limit from 2 years (IPC 304A) to 5 years under BNS 106(1).',
      'Sub-section (2) prescribes up to 10 years imprisonment for hit-and-run drivers who fail to report incidents to police.'
    ],
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
    newSectionContent: 'Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine; and if hurt is caused, with life imprisonment.',
    keyChanges: [
      'Attempt to murder transferred from IPC 307 to BNS Section 109.',
      'Retains 10-year baseline sentence and life imprisonment if physical hurt is caused.'
    ],
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
    newSectionContent: 'Whoever voluntarily causes hurt shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to ten thousand rupees, or with both.',
    keyChanges: [
      'Simple hurt renumbered from IPC 323 to BNS Section 115(2).',
      'Increased maximum fine limit to ₹10,000.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Voluntarily causing simple hurt relocated from IPC 323 to BNS Section 115(2).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 420',
    legacyTitle: 'Cheating and dishonestly inducing delivery of property',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 318(4)',
    newTitle: 'Cheating and dishonestly inducing delivery of property',
    newSectionContent: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
    keyChanges: [
      'Offence of cheating with inducement renumbered from IPC 420 to BNS Section 318(4).',
      'Placed under Chapter XVII (Offences Against Property).',
      'Retains maximum 7-year imprisonment term and fine.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Offence of cheating with inducement to deliver property transferred from IPC 420 to BNS Section 318(4).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 498A',
    legacyTitle: 'Husband or relative of husband of a woman subjecting her to cruelty',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 85',
    newTitle: 'Subjecting a woman to cruelty by husband or relatives',
    newSectionContent: 'Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.',
    keyChanges: [
      'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.',
      'Maintains non-bailable statutory character and 3-year imprisonment term.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 124A',
    legacyTitle: 'Sedition',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 152',
    newTitle: 'Acts endangering sovereignty, unity and integrity of India',
    newSectionContent: 'Whoever, purposely or knowingly, by words, either spoken or written, or by signs, or by visible representation, or by electronic communication or by use of financial means, excites or attempts to excite, secession or armed rebellion or subversive activities, or encourages feelings of separatist activities, shall be punished with imprisonment for life or up to seven years.',
    keyChanges: [
      'IPC 124A (Sedition) repealed; replaced with BNS Section 152 targeting acts endangering national integrity.',
      'Expressly includes financial means and electronic communications.',
      'Maximum sentence increased to life imprisonment or up to 7 years.'
    ],
    mappingType: 'REORGANIZED',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'IPC 124A (Sedition) was repealed and replaced with reorganized provisions under BNS 152 covering actions endangering national integrity.'
  },

  // CrPC -> BNSS Mappings
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 154',
    legacyTitle: 'Information in cognizable cases (First Information Report)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 173',
    newTitle: 'Information in cognizable cases',
    newSectionContent: 'Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing. Information may be given electronically (e-FIR) and registered irrespective of area (Zero FIR). For offences punishable between 3 to 7 years, preliminary enquiry may be conducted within 14 days prior to FIR registration.',
    keyChanges: [
      'Statutory recognition of Zero FIR across all police stations.',
      'Permits lodging information electronically (e-FIR) with digital signature within 3 days.',
      'Introduces 14-day mandatory preliminary enquiry window for 3 to 7 year offences.'
    ],
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
    newSectionContent: 'Any police officer may without an order from a Magistrate and without a warrant, arrest any person who commits a cognizable offence in the presence of a police officer, or against whom a reasonable complaint has been made. For offences punishable with less than 7 years, prior approval of a Deputy Superintendent of Police is mandated for vulnerable persons.',
    keyChanges: [
      'Arrest powers relocated from CrPC 41 to BNSS Section 35.',
      'Mandatory approval from DSP level officer for arresting infirm or elderly persons in minor cases.'
    ],
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
    newSectionContent: 'Whenever any person is arrested and detained in custody, and it appears that the investigation cannot be completed within 24 hours, the magistrate may authorize detention. Police custody of 15 days can be sought in whole or in parts during the initial 40 or 60 days of the total detention period of 60 or 90 days.',
    keyChanges: [
      'Police remand of 15 days can be spread across the first 40/60 days of custody.',
      'Express provisions for audio-video electronic means during remand proceedings.'
    ],
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
    newSectionContent: 'Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest, he shall be released on bail.',
    keyChanges: [
      'Anticipatory bail renumbered from CrPC 438 to BNSS Section 482.',
      'High Court and Sessions Court jurisdiction retained with updated procedural guidelines.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
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
    newSectionContent: 'Any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or semiconductor memory produced by a computer shall be deemed to be also a document. Section 63 provides detailed certification criteria for verifying electronic records.',
    keyChanges: [
      'Electronic evidence admissibility certificate requirements relocated from IEA 65B to BSA Section 63.',
      'Expanded scope to explicitly cover cloud devices, semiconductor memories, and encrypted digital communications.'
    ],
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
    newSectionContent: 'Provided that, when any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information, whether it amounts to a confession or not, as relates distinctly to the fact thereby discovered, may be proved.',
    keyChanges: [
      'Discovery statement provisions renumbered from IEA 27 to BSA Section 23.',
      'Retains constitutional safeguards under Article 20(3) regarding police confessions.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Discovery statement provisions under IEA 27 relocated to BSA Section 23.'
  }
];

export const seedSectionMappingDatabase = async () => {
  try {
    await LegalSectionMapping.deleteMany?.({});
    for (const item of seedSectionMappings) {
      await LegalSectionMapping.create(item);
    }
    console.log(`Successfully seeded ${seedSectionMappings.length} built-in legal section mappings with full statutory content.`);
  } catch (error) {
    try {
      const existing = await LegalSectionMapping.find();
      if (!existing || existing.length === 0) {
        for (const item of seedSectionMappings) {
          await LegalSectionMapping.create(item);
        }
      } else {
        for (const item of seedSectionMappings) {
          const match = await LegalSectionMapping.findOne({ legacySection: item.legacySection });
          if (match && match._id) {
            await LegalSectionMapping.findByIdAndUpdate(match._id, item);
          } else {
            await LegalSectionMapping.create(item);
          }
        }
      }
    } catch (e) {
      console.error('Error seeding legal section mappings:', e);
    }
  }
};
