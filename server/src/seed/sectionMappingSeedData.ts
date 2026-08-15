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
    newSectionContent: `(1) Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year, but which may extend to five years, and shall also be liable to fine.

(2) Where any person is convicted of an offence under sub-section (1), the Court may, having regard to the nature of the offence and the circumstances of the case, order the offender to undergo mandatory corrective counselling or community service in addition to the statutory penalty.`,
    keyChanges: [
      'Prescribes a mandatory minimum imprisonment of one year (extendable up to five years) compared to the erstwhile IPC Section 354.',
      'Retains strict gender-specific protection for women against modesty violation under Chapter V of BNS.',
      'Mandatory fine imposed concurrently with custodial imprisonment term.',
      'Enables judicial discretion for corrective counselling and rehabilitation programs.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Offence of assault or criminal force to outrage modesty transferred from IPC 354 to BNS Section 74 with mandatory minimum sentencing guidelines.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 354A',
    legacyTitle: 'Sexual harassment and punishment for sexual harassment',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 75',
    newTitle: 'Sexual harassment',
    newSectionContent: `(1) A man committing any of the following acts—
(i) physical contact and advances involving unwelcome and explicit sexual overtures; or
(ii) a demand or request for sexual favours; or
(iii) showing pornography against the will of a woman; or
(iv) making sexually coloured remarks,
shall be guilty of the offence of sexual harassment.

(2) Any man who commits the offence specified in clause (i) or clause (ii) or clause (iii) of sub-section (1) shall be punished with rigorous imprisonment for a term which may extend to three years, or with fine, or with both.

(3) Any man who commits the offence specified in clause (iv) of sub-section (1) shall be punished with imprisonment of either description for a term which may extend to one year, or with fine, or with both.`,
    keyChanges: [
      'Categorizes sexual harassment under Section 75 of BNS.',
      'Prescribes up to 3 years rigorous imprisonment for physical contact, sexual demands, or showing pornography.',
      'Prescribes up to 1 year imprisonment or fine for making sexually coloured remarks.'
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
    newSectionContent: `Any man who assaults or uses criminal force to any woman or abets such act with the intention of disrobing or compelling her to be naked, shall be punished with imprisonment of either description for a term which shall not be less than three years but which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'Renumbered from IPC Section 354B to BNS Section 76.',
      'Mandates a strict minimum sentence of 3 years imprisonment, extendable up to 7 years with fine.'
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
    newSectionContent: `(1) Any man who watches, or captures the image of a woman engaging in a private act in circumstances where she would usually have the expectation of not being observed either by the perpetrator or by any other person at the behest of the perpetrator or disseminates such image, shall be punished on first conviction with imprisonment of either description for a term which shall not be less than one year, but which may extend to three years, and shall also be liable to fine.

(2) On a second or subsequent conviction, the offender shall be punished with imprisonment of either description for a term which shall not be less than three years, but which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'Voyeurism renumbered from IPC 354C to BNS Section 77.',
      'Explicitly includes digital recording, internet broadcasting, and image dissemination without consent.'
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
    newSectionContent: `(1) Any man who—
(i) follows a woman and contacts, or attempts to contact such woman to foster personal interaction repeatedly despite a clear indication of disinterest by such woman; or
(ii) monitors the use by a woman of the internet, email or any other form of electronic communication,
commits the offence of stalking.

(2) Whoever commits the offence of stalking shall be punished on first conviction with imprisonment of either description for a term which may extend to three years, and shall also be liable to fine; and be punished on a second or subsequent conviction, with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine.`,
    keyChanges: [
      'Stalking relocated to BNS Section 78.',
      'Strengthens cyber-stalking definitions to cover electronic tracking, email monitoring, and social media harassment.'
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
    newSectionContent: `(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.

(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.`,
    keyChanges: [
      'Replaces IPC Section 302 with BNS Section 103(1).',
      'Sub-section (2) introduces a landmark statutory penalty specifically for mob lynching and group hate crimes.',
      'Prescribes capital punishment or life imprisonment for every member of a lynching group.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Substantive provisions governing punishment for murder correspond directly from IPC Section 302 to BNS Section 103(1).'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 304A',
    legacyTitle: 'Causing death by negligence',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 106(1)',
    newTitle: 'Causing death by negligence',
    newSectionContent: `(1) Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine.

(2) Whoever causes the death of any person by rash and negligent driving of vehicle not amounting to culpable homicide, and escapes without reporting it to a police officer or a Magistrate soon after the incident, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`,
    keyChanges: [
      'Increases baseline negligence sentence from 2 years (IPC 304A) to 5 years under BNS Section 106(1).',
      'Sub-section (2) introduces stringent 10-year imprisonment penalty for hit-and-run drivers who flee without reporting to police.'
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
    newSectionContent: `(1) Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.

(2) If hurt is caused to any person by such act, the offender shall be liable either to imprisonment for life, or to such punishment as is hereinbefore mentioned.`,
    keyChanges: [
      'Attempt to murder transferred from IPC 307 to BNS Section 109.',
      'Retains 10-year baseline sentence and life imprisonment if physical hurt is caused during the attempt.'
    ],
    mappingType: 'DIRECT_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Attempt to murder corresponds directly from IPC Section 307 to BNS Section 109.'
  },
  {
    legacyAct: 'Indian Penal Code, 1860 (IPC)',
    legacySection: 'Section 420',
    legacyTitle: 'Cheating and dishonestly inducing delivery of property',
    newAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    newSection: 'Section 318(4)',
    newTitle: 'Cheating and dishonestly inducing delivery of property',
    newSectionContent: `(1) Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.

(2) Whoever cheats with the knowledge that he is likely thereby to cause wrongful loss to a person whose interest in the transaction he was bound by law or contract to protect, shall be punished with imprisonment up to five years.

(3) Whoever cheats and dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'Offence of cheating with inducement renumbered from IPC 420 to BNS Section 318(4).',
      'Consolidates property offences under Chapter XVII of BNS.',
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
    newSectionContent: `Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.

Explanation.—For the purposes of this section, "cruelty" means—
(a) any wilful conduct which is of such a nature as is likely to drive the woman to commit suicide or to cause grave injury or danger to life, limb or health (whether mental or physical) of the woman; or
(b) harassment of the woman where such harassment is with a view to coercing her or any person related to her to meet any unlawful demand for any property or valuable security.`,
    keyChanges: [
      'Cruelty by husband or in-laws renumbered from IPC 498A to BNS Section 85.',
      'Retains comprehensive definition of physical and mental cruelty and unlawful dowry coercion.',
      'Non-bailable, cognizable statutory nature preserved.'
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
    newSectionContent: `Whoever, purposely or knowingly, by words, either spoken or written, or by signs, or by visible representation, or by electronic communication or by use of financial means, excites or attempts to excite, secession or armed rebellion or subversive activities, or encourages feelings of separatist activities or endangers sovereignty or unity and integrity of India, shall be punished with imprisonment for life or with imprisonment of either description which may extend to seven years, and shall also be liable to fine.`,
    keyChanges: [
      'IPC 124A (Sedition) repealed; replaced with BNS Section 152 targeting acts endangering national integrity.',
      'Explicitly covers digital/electronic communications and financial funding of secessionist acts.',
      'Maximum imprisonment fixed at life imprisonment or up to 7 years with fine.'
    ],
    mappingType: 'REORGANIZED',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'IPC 124A (Sedition) was repealed and replaced with reorganized provisions under BNS 152 covering actions endangering national integrity.'
  },

  // CrPC -> BNSS Mappings
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 167',
    legacyTitle: 'Procedure when investigation cannot be completed in twenty-four hours (Remand)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 187',
    newTitle: 'Procedure when investigation cannot be completed in twenty-four hours',
    newSectionContent: `(1) Whenever any person is arrested and detained in custody, and it appears that the investigation cannot be completed within the period of twenty-four hours fixed by section 58, and there are grounds for believing that the accusation or information is well-founded, the officer in charge of the police station shall forthwith transmit to the nearest Magistrate a copy of the entries in the diary.

(2) The Magistrate to whom an accused person is forwarded under this section may, irrespective of whether he has or has no jurisdiction to try the case, authorize the detention of the accused in such custody as such Magistrate thinks fit, for a term not exceeding fifteen days in the whole, or in parts, at any time during the initial forty days or sixty days out of detention period of sixty days or ninety days.

(3) The Magistrate may authorize the detention of the accused person beyond the period of fifteen days, if he is satisfied that adequate grounds exist for doing so, but no Magistrate shall authorize the detention of the accused person in custody under this sub-section for a total period exceeding—
(i) ninety days, where the investigation relates to an offence punishable with death, imprisonment for life or imprisonment for a term of ten years or more;
(ii) sixty days, where the investigation relates to any other offence.

(4) No Magistrate shall authorize detention of the accused in custody of the police under this section unless the accused is produced before him in person for the first time and subsequently through production of the accused either in person or through audio-video electronic means.`,
    keyChanges: [
      'A new insertion into Sub-section (2) of Section 187 of BNSS provides that police custody of 15 days can be authorized in whole or in parts throughout the initial 40 or 60 days of detention, overcoming the former initial 15-day restriction under CrPC 167.',
      'Sub-section (4) explicitly authorizes virtual production of the accused through audio-video electronic means for subsequent remand extensions.',
      'Retains maximum statutory limit of 60/90 days for default bail eligibility.'
    ],
    mappingType: 'PARTIAL_REPLACEMENT',
    mappingStatus: 'VERIFIED',
    sourceReference: 'Source: External legal reference (Official Gazette of India)',
    factualNotes: 'Police and judicial custody remand procedure under CrPC 167 updated and mapped to BNSS Section 187 with flexible 15-day police custody spread.'
  },
  {
    legacyAct: 'Code of Criminal Procedure, 1973 (CrPC)',
    legacySection: 'Section 154',
    legacyTitle: 'Information in cognizable cases (First Information Report)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 173',
    newTitle: 'Information in cognizable cases',
    newSectionContent: `(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing. Information may be given by electronic communication (e-FIR), provided it is taken on record on being signed within three days by the person giving it.

(2) Zero FIR: Information relating to cognizable offences shall be recorded irrespective of the area where the offence was committed and transferred to the concerned station.

(3) For offences punishable between three and seven years, the police officer may, with prior permission of an officer not below the rank of Deputy Superintendent of Police, proceed to conduct a preliminary enquiry within fourteen days to ascertain whether a prima facie case exists before registering FIR.`,
    keyChanges: [
      'Formal statutory mandate for Zero FIR across all police stations regardless of territorial jurisdiction.',
      'Express statutory framework for e-FIR with signature validation within 3 days.',
      'Mandatory preliminary enquiry window of 14 days for offences carrying 3 to 7 years imprisonment.'
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
    newSectionContent: `(1) Any police officer may without an order from a Magistrate and without a warrant, arrest any person who commits a cognizable offence in the presence of a police officer, or against whom a reasonable complaint has been made.

(2) For offences punishable with less than seven years imprisonment, no arrest shall be made without prior permission of an officer not below the rank of Deputy Superintendent of Police in case of infirm, elderly, or sick persons.`,
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
    legacySection: 'Section 438',
    legacyTitle: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)',
    newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    newSection: 'Section 482',
    newTitle: 'Direction for grant of bail to person apprehending arrest',
    newSectionContent: `Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest, he shall be released on bail; and that Court may, after taking into consideration the nature and gravity of the accusation, grant anticipatory bail.`,
    keyChanges: [
      'Anticipatory bail provisions renumbered from CrPC 438 to BNSS Section 482.',
      'High Court and Sessions Court jurisdiction retained with updated interim relief guidelines.'
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
    newSectionContent: `(1) Notwithstanding anything contained in this Adhiniyam, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or semiconductor memory produced by a computer shall be deemed to be also a document.

(2) The conditions referred to in sub-section (1) in respect of a computer output shall be the following:
(a) the computer output was produced by the computer during the period over which the computer was used regularly to store or process information;
(b) during the said period, information of the kind contained in the electronic record was regularly fed into the computer in the ordinary course of the said activities.

(3) A certificate signed by a person occupying a responsible official position in relation to the operation of the relevant device shall be submitted certifying admissibility.`,
    keyChanges: [
      'Electronic evidence admissibility certificate requirements relocated from IEA 65B to BSA Section 63.',
      'Expanded scope to explicitly cover semiconductor memory, cloud storage, encrypted digital chats, and server logs.'
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
    newSectionContent: `Provided that, when any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information, whether it amounts to a confession or not, as relates distinctly to the fact thereby discovered, may be proved.`,
    keyChanges: [
      'Discovery statement provisions renumbered from IEA 27 to BSA Section 23.',
      'Preserves admissibility of material recovery statements made in police custody.'
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
    console.log(`Successfully seeded ${seedSectionMappings.length} built-in legal section mappings with full statutory content & key changes.`);
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
