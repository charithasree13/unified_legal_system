import { Law } from '../models/Schemas';

export const initialBareActs = [
  // 1. NEW CRIMINAL LAWS
  {
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 45 of 2023). Replaced the Indian Penal Code (1860). Governs criminal offenses, public order, bodily safety, cyber crimes, mob lynching penalties, and community service sanctions across India.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    fileName: "Bharatiya_Nyaya_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 46 of 2023). Replaced the Code of Criminal Procedure (1973). Regulates criminal investigation, Zero FIR, mandatory digital forensics, electronic summons, court trial timelines, and undertrial bail.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250884_english_01042024.pdf",
    fileName: "Bharatiya_Nagarik_Suraksha_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "The Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 47 of 2023). Replaced the Indian Evidence Act (1872). Governs rules of evidence, primary status of electronic and digital records, secondary evidence, and witness examinations.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250885_english_01042024.pdf",
    fileName: "Bharatiya_Sakshya_Adhiniyam_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },

  // 2. CRIMINAL LAWS
  {
    title: "Indian Penal Code, 1860 (IPC)",
    category: "Act",
    description: "Act No. 45 of 1860. The substantive criminal code governing offenses, culpable homicide, murder, theft, fraud, forgery, and criminal liability for acts prior to July 1, 2024.",
    pdfUrl: "https://drive.google.com/file/d/19YpcyfiNZ0hp6XyKJTnHh2b9-QCaGy2E/view?usp=sharing",
    fileName: "Indian_Penal_Code_1860.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Protection of Children from Sexual Offences Act, 2012 (POCSO)",
    category: "Act",
    description: "Act No. 32 of 2012. Special statutory law to protect children below 18 years from sexual assault, harassment, and child pornography, establishing Special Courts and child-friendly trial procedures.",
    pdfUrl: "https://drive.google.com/file/d/1PcN0okFDA8qpmSFrp0dvmmt4FHFup0sQ/view?usp=sharing",
    fileName: "POCSO_Act_2012.pdf",
    uploadedBy: "Ministry of Women & Child Development"
  },
  {
    title: "The Arms Act, 1959",
    category: "Act",
    description: "Act No. 54 of 1959. Consolidates law relating to arms and ammunition to curb illegal weapons possession and manufacturing.",
    pdfUrl: "https://drive.google.com/file/d/1q6mW-tn4eLijtezsrlH7lx7TryWzOEz-/view?usp=sharing",
    fileName: "Arms_Act_1959.pdf",
    uploadedBy: "Ministry of Home Affairs"
  },
  {
    title: "The Prevention of Terrorism Act, 2002 (POTA)",
    category: "Act",
    description: "Act No. 15 of 2002. Anti-terrorism legislation enacted to strengthen counter-terrorism enforcement mechanisms.",
    pdfUrl: "https://drive.google.com/file/d/1cA6x_mngm3bUNwuRj3_whhMAt4Fylhl-/view?usp=sharing",
    fileName: "POTA_Act_2002.pdf",
    uploadedBy: "Ministry of Home Affairs"
  },

  // 3. CYBER & TECHNOLOGY LAW
  {
    title: "The Information Technology Act, 2000 (IT Act)",
    category: "Act",
    description: "Act No. 21 of 2000. Provides legal recognition for transactions carried out by means of electronic data interchange, cyber offenses, digital signatures, and intermediary liabilities.",
    pdfUrl: "https://drive.google.com/file/d/1hsVYQJ8c1PU42YO7d5wIny3SQm9fRgty/view?usp=sharing",
    fileName: "Information_Technology_Act_2000.pdf",
    uploadedBy: "Ministry of Electronics & IT"
  },

  // 4. FAMILY & PERSONAL LAWS
  {
    title: "The Hindu Marriage Act, 1955",
    category: "Act",
    description: "Act No. 25 of 1955. Codifies laws relating to marriage, restitution of conjugal rights, judicial separation, void marriages, and divorce among Hindus, Buddhists, Jains, and Sikhs.",
    pdfUrl: "https://drive.google.com/file/d/1UtEaTNtshRM_DmuN5cqcmQ27Kwj6zwjL/view?usp=sharing",
    fileName: "Hindu_Marriage_Act_1955.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Dissolution of Muslim Marriage Act, 1939",
    category: "Act",
    description: "Act No. 8 of 1939. Consolidates and clarifies provisions of Muslim law relating to suits for dissolution of marriage by women married under Muslim law.",
    pdfUrl: "https://drive.google.com/file/d/1l5ZBCehCNOhuE4WwEQxLo-bnN9xIrX4H/view?usp=sharing",
    fileName: "Dissolution_Muslim_Marriage_Act_1939.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Special Marriage Act, 1954",
    category: "Act",
    description: "Act No. 43 of 1954. Provides a special form of marriage for the people of India and all Indian nationals in foreign countries, irrespective of the religion or faith followed by either party.",
    pdfUrl: "https://drive.google.com/file/d/1UZTXGHxer2q1GKSaHt4-pF9zMlt0KCGn/view?usp=sharing",
    fileName: "Special_Marriage_Act_1954.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Hindu Succession Act, 1956",
    category: "Act",
    description: "Act No. 30 of 1956. Amends and codifies the law relating to intestate succession among Hindus, giving equal coparcenary rights to daughters.",
    pdfUrl: "https://drive.google.com/file/d/1mRY6W2tuGxlZLjtvCvtMW_oXrwhHkc1V/view?usp=sharing",
    fileName: "Hindu_Succession_Act_1956.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Hindu Adoption & Maintenance Act, 1956",
    category: "Act",
    description: "Act No. 78 of 1956. Codifies laws relating to adoption of children and statutory maintenance obligations towards wives, children, and aged parents.",
    pdfUrl: "https://drive.google.com/file/d/1qdG0jeEN_W_4O9Qtl3oRoNt_z_ipDkM1/view?usp=sharing",
    fileName: "Hindu_Adoption_Maintenance_Act_1956.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Guardians & Wards Act, 1890",
    category: "Act",
    description: "Act No. 8 of 1890. Consolidates law relating to guardian and ward, welfare of minors, and custody proceedings.",
    pdfUrl: "https://drive.google.com/file/d/13dVWSBsKJdtaCPYMgh8lzH8bhG4BTQfH/view?usp=sharing",
    fileName: "Guardians_Wards_Act_1890.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Indian Christian Marriage Act, 1872",
    category: "Act",
    description: "Act No. 15 of 1872. Consolidates law relating to solemnization of marriages of Christians in India.",
    pdfUrl: "https://drive.google.com/file/d/17oxEJEWv4xhhvmXCMkf2F_MCJwnKouWM/view?usp=sharing",
    fileName: "Indian_Christian_Marriage_Act_1872.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Parsi Marriage & Divorce Act, 1936",
    category: "Act",
    description: "Act No. 3 of 1936. Governs marriage and divorce procedures among Parsi Zoroastrians.",
    pdfUrl: "https://drive.google.com/file/d/1mbzmX-IcNBQRkV8xgbj2GGmUq1hdRY4f/view?usp=sharing",
    fileName: "Parsi_Marriage_Divorce_Act_1936.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Divorce Act, 1869",
    category: "Act",
    description: "Act No. 4 of 1869. Amends law relating to divorce and matrimonial causes for persons professing the Christian religion.",
    pdfUrl: "https://drive.google.com/file/d/1HGl4QIa4iK36Y_ouCQ0GyBYDnP07q4oR/view?usp=sharing",
    fileName: "Divorce_Act_1869.pdf",
    uploadedBy: "Legislative Department"
  },

  // 5. LABOUR & EMPLOYMENT LAWS
  {
    title: "The Trade Union Act, 1926",
    category: "Act",
    description: "Act No. 16 of 1926. Provides for the registration of Trade Unions and defines the law relating to registered Trade Unions.",
    pdfUrl: "https://drive.google.com/file/d/1wmQgTmzXo89scUzPY7JphuUIHo0DeRM4/view?usp=sharing",
    fileName: "Trade_Union_Act_1926.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    title: "The Factories Act, 1948",
    category: "Act",
    description: "Act No. 63 of 1948. Regulates health, safety, welfare, working hours, and employment of workers in factories.",
    pdfUrl: "https://drive.google.com/file/d/1lWhcwvlKk7Abh5LFrp7hpQLrzofWfW-i/view?usp=sharing",
    fileName: "Factories_Act_1948.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    title: "The Industrial Disputes Act, 1947",
    category: "Act",
    description: "Act No. 14 of 1947. Regulates industrial relations, investigation and settlement of industrial disputes, strikes, lockouts, retrenchment, and lay-off compensation.",
    pdfUrl: "https://drive.google.com/file/d/1DG4aX5CnqZOwn-_1xPrLJlVOpFHBNfWa/view?usp=sharing",
    fileName: "Industrial_Disputes_Act_1947.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    title: "The Employee's Compensation Act, 1923",
    category: "Act",
    description: "Act No. 8 of 1923. Provides payment of compensation to workmen for injury by accident sustained during employment.",
    pdfUrl: "https://drive.google.com/file/d/1GTpEQia9mCJ58r-KE29Obl-JHWnLjDpR/view?usp=sharing",
    fileName: "Employees_Compensation_Act_1923.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    title: "The Minimum Wages Act, 1948",
    category: "Act",
    description: "Act No. 11 of 1948. Provides for fixing minimum rates of wages in certain employments.",
    pdfUrl: "https://drive.google.com/file/d/1LKnvdbWe_OuXrAumqx4UEawwO_6bM_yF/view?usp=sharing",
    fileName: "Minimum_Wages_Act_1948.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },
  {
    title: "The Payment of Wages Act, 1936",
    category: "Act",
    description: "Act No. 4 of 1936. Regulates the payment of wages to certain classes of employed persons without unauthorized deductions.",
    pdfUrl: "https://drive.google.com/file/d/1DYSA10FNodWNAbhveQlFmSJKfUJSwWvg/view?usp=sharing",
    fileName: "Payment_of_Wages_Act_1936.pdf",
    uploadedBy: "Ministry of Labour & Employment"
  },

  // 6. ENVIRONMENTAL & WILDLIFE LAWS
  {
    title: "The Environment Protection Act, 1986",
    category: "Act",
    description: "Act No. 29 of 1986. Umbrella legislation designed to provide a framework for Central Government coordination of activities of various authorities under environmental laws.",
    pdfUrl: "https://drive.google.com/file/d/1RImr_CN688LqFq5tVOWRLrVcBq_KFOf3/view?usp=sharing",
    fileName: "Environment_Protection_Act_1986.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },
  {
    title: "The Air (Prevention & Control of Pollution) Act, 1981",
    category: "Act",
    description: "Act No. 14 of 1981. Provides for the prevention, control, and abatement of air pollution in India.",
    pdfUrl: "https://drive.google.com/file/d/10_6ep7djHUNztmpCGT_TkJoe4aERiELE/view?usp=sharing",
    fileName: "Air_Pollution_Act_1981.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },
  {
    title: "The Water (Prevention & Control of Pollution) Act, 1974",
    category: "Act",
    description: "Act No. 6 of 1974. Provides for the prevention and control of water pollution and maintaining water wholesomeness.",
    pdfUrl: "https://drive.google.com/file/d/11eSzK5vuOqmVqNYpLapdCiPX-S4lAxvs/view?usp=sharing",
    fileName: "Water_Pollution_Act_1974.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },
  {
    title: "The Wildlife (Protection) Act, 1972",
    category: "Act",
    description: "Act No. 53 of 1972. Provides protection to wild animals, birds, and plants to ensure ecological and environmental security.",
    pdfUrl: "https://drive.google.com/file/d/1BkUEQytTHXKXXV61P2_om9Gqt6_gs6vF/view?usp=sharing",
    fileName: "Wildlife_Protection_Act_1972.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },

  // 7. PROFESSIONAL ETHICS
  {
    title: "The Advocates Act, 1961",
    category: "Act",
    description: "Act No. 25 of 1961. Amends and consolidates law relating to legal practitioners and provides for the constitution of Bar Councils.",
    pdfUrl: "https://drive.google.com/file/d/18Spwoep0h4ammvdzvxjvQ8ChpSCrEAym/view?usp=sharing",
    fileName: "Advocates_Act_1961.pdf",
    uploadedBy: "Bar Council of India"
  },
  {
    title: "Bar Council of India Rules, 1975",
    category: "Rule",
    description: "Statutory rules framed under Advocates Act 1961 governing professional conduct, etiquette, legal education, and disciplinary proceedings.",
    pdfUrl: "https://drive.google.com/file/d/14Z2I_jZQ-CMco_6-dX5aAco6CardAdKW/view?usp=sharing",
    fileName: "Bar_Council_India_Rules_1975.pdf",
    uploadedBy: "Bar Council of India"
  },

  // 8. CONSTITUTIONAL & CIVIL CODE
  {
    title: "Code of Civil Procedure, 1908 (CPC)",
    category: "Act",
    description: "Act No. 5 of 1908. Regulates civil litigation, suits, injunctions, appeals, revisions, and execution of decrees in civil courts.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051676.pdf",
    fileName: "Code_of_Civil_Procedure_1908.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Constitution of India",
    category: "Constitution Article",
    description: "Supreme Law of India enacted on 26 January 1950. Outlines Fundamental Rights, Directive Principles of State Policy, and Judicial Powers.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051648.pdf",
    fileName: "Constitution_of_India.pdf",
    uploadedBy: "Constituent Assembly of India"
  },
  {
    title: "Right to Information Act, 2005 (RTI)",
    category: "Act",
    description: "Act No. 22 of 2005. Empowers citizens to request official information from public authorities, setting up Information Commissions.",
    pdfUrl: "https://rti.gov.in/rti-act.pdf",
    fileName: "RTI_Act_2005.pdf",
    uploadedBy: "Department of Personnel & Training"
  },
  {
    title: "Consumer Protection Act, 2019",
    category: "Act",
    description: "Act No. 35 of 2019. Established Central Consumer Protection Authority (CCPA), e-commerce rules, product liability, and Dispute Commissions.",
    pdfUrl: "https://consumeraffairs.nic.in/sites/default/files/CP%20Act%202019.pdf",
    fileName: "Consumer_Protection_Act_2019.pdf",
    uploadedBy: "Ministry of Consumer Affairs"
  },
  {
    title: "Representation of the People Act, 1951",
    category: "Act",
    description: "Act No. 43 of 1951. Provides for the conduct of elections of the Houses of Parliament and State Legislatures, qualifications, and disqualifications.",
    pdfUrl: "https://drive.google.com/file/d/151O9Kqevfd17G3x9P7Xeu2Zi4sVRXJo6/view?usp=sharing",
    fileName: "Representation_People_Act_1951.pdf",
    uploadedBy: "Election Commission of India"
  },
  {
    title: "The Interest Act, 1978",
    category: "Act",
    description: "Act No. 14 of 1978. Regulates the allowance of interest in certain cases in civil proceedings.",
    pdfUrl: "https://drive.google.com/file/d/10tj_Pa6sXJ1Gg5Fdy3iETZkKCn4Bg-00/view?usp=sharing",
    fileName: "Interest_Act_1978.pdf",
    uploadedBy: "Legislative Department"
  }
];

export const seedLawsDatabase = async () => {
  try {
    const count = await Law.find();
    if (!count || count.length === 0) {
      console.log('📖 Seeding Initial Popular Indian Bare Acts into database...');
      for (const act of initialBareActs) {
        await Law.create(act);
      }
      console.log('✅ Popular Indian Bare Acts seeded successfully!');
    }
  } catch (error) {
    console.error('❌ Error seeding Bare Acts database:', error);
  }
};
