import { Law } from '../models/Schemas';

export const initialBareActs = [
  {
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 45 of 2023). Replaced the Indian Penal Code (1860). Governs criminal offenses, public order, bodily safety, cyber crimes, and penal sanctions across India.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    fileName: "Bharatiya_Nyaya_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 46 of 2023). Replaced the Code of Criminal Procedure (1973). Regulates criminal investigation, arrest, court trials, bail guidelines, and mandatory digital forensics.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250884_english_01042024.pdf",
    fileName: "Bharatiya_Nagarik_Suraksha_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "The Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 47 of 2023). Replaced the Indian Evidence Act (1872). Governs rules of evidence, admissibility of electronic and digital records, secondary evidence, and witness examinations.",
    pdfUrl: "https://www.mha.gov.in/sites/default/files/250885_english_01042024.pdf",
    fileName: "Bharatiya_Sakshya_Adhiniyam_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "Code of Civil Procedure, 1908 (CPC)",
    category: "Act",
    description: "Act No. 5 of 1908. Regulates the procedure and administration of all civil litigation, suits, injunctions, appeals, revisions, and execution of decrees in Indian civil courts.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051676.pdf",
    fileName: "Code_of_Civil_Procedure_1908.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Constitution of India",
    category: "Constitution Article",
    description: "Supreme Law of India enacted on 26 January 1950. Outlines Fundamental Rights, Directive Principles of State Policy, Union & State Legislature, Executive, and Judicial Powers.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051648.pdf",
    fileName: "Constitution_of_India.pdf",
    uploadedBy: "Constituent Assembly of India"
  },
  {
    title: "Right to Information Act, 2005 (RTI)",
    category: "Act",
    description: "Act No. 22 of 2005. Empowers Indian citizens to request official information from public authorities, setting up Information Commissions and mandatory disclosure timelines.",
    pdfUrl: "https://rti.gov.in/rti-act.pdf",
    fileName: "RTI_Act_2005.pdf",
    uploadedBy: "Department of Personnel & Training"
  },
  {
    title: "Consumer Protection Act, 2019",
    category: "Act",
    description: "Act No. 35 of 2019. Established Central Consumer Protection Authority (CCPA), e-commerce rules, product liability rules, and three-tier Consumer Dispute Redressal Commissions.",
    pdfUrl: "https://consumeraffairs.nic.in/sites/default/files/CP%20Act%202019.pdf",
    fileName: "Consumer_Protection_Act_2019.pdf",
    uploadedBy: "Ministry of Consumer Affairs"
  },
  {
    title: "The Information Technology Act, 2000 (IT Act)",
    category: "Act",
    description: "Act No. 21 of 2000. Provides legal recognition for transactions carried out by means of electronic data interchange, cyber offenses, digital signatures, and intermediary liabilities.",
    pdfUrl: "https://www.meity.gov.in/writereaddata/files/itact2000/it_amended_act2008.pdf",
    fileName: "Information_Technology_Act_2000.pdf",
    uploadedBy: "Ministry of Electronics & IT"
  },
  {
    title: "The Protection of Children from Sexual Offences Act, 2012 (POCSO)",
    category: "Act",
    description: "Act No. 32 of 2012. Special statutory law to protect children from sexual assault, harassment, and pornography, establishing Special Courts and child-friendly trial procedures.",
    pdfUrl: "https://wcd.nic.in/sites/default/files/POCSO%20Act%202012.pdf",
    fileName: "POCSO_Act_2012.pdf",
    uploadedBy: "Ministry of Women & Child Development"
  },
  {
    title: "The Hindu Marriage Act, 1955",
    category: "Act",
    description: "Act No. 25 of 1955. Codifies laws relating to marriage, restitution of conjugal rights, judicial separation, void marriages, and divorce among Hindus, Buddhists, Jains, and Sikhs.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051612.pdf",
    fileName: "Hindu_Marriage_Act_1955.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Special Marriage Act, 1954",
    category: "Act",
    description: "Act No. 43 of 1954. Provides a special form of marriage for the people of India and all Indian nationals in foreign countries, irrespective of the religion or faith followed by either party.",
    pdfUrl: "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023051614.pdf",
    fileName: "Special_Marriage_Act_1954.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Advocates Act, 1961",
    category: "Act",
    description: "Act No. 25 of 1961. Amends and consolidates the law relating to legal practitioners and provides for the constitution of Bar Councils and an All-India Bar.",
    pdfUrl: "https://www.barcouncilofindia.org/wp-content/uploads/2010/05/Advocates-Act-1961.pdf",
    fileName: "Advocates_Act_1961.pdf",
    uploadedBy: "Bar Council of India"
  },
  {
    title: "The Environment Protection Act, 1986",
    category: "Act",
    description: "Act No. 29 of 1986. Umbrella legislation designed to provide a framework for Central Government coordination of activities of various central and state authorities under environmental laws.",
    pdfUrl: "https://cpcb.nic.in/displaypdf.php?id=RW52aXJvbm1lbnRQcm90ZWN0aW9uQWN0MTk4Ni5wZGY=",
    fileName: "Environment_Protection_Act_1986.pdf",
    uploadedBy: "Ministry of Environment & Forests"
  },
  {
    title: "The Industrial Disputes Act, 1947",
    category: "Act",
    description: "Act No. 14 of 1947. Regulates industrial relations, investigation and settlement of industrial disputes, strikes, lockouts, retrenchment, and lay-off compensation.",
    pdfUrl: "https://labour.gov.in/sites/default/files/industrial_disputes_act_1947.pdf",
    fileName: "Industrial_Disputes_Act_1947.pdf",
    uploadedBy: "Ministry of Labour & Employment"
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
