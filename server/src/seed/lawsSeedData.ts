import { Law } from '../models/Schemas';

export const initialBareActs = [
  {
    title: "The Bharatiya Nyaya Sanhita, 2023 (BNS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 45 of 2023). Replaced the Indian Penal Code (1860). Governs criminal offenses, public order, bodily safety, cyber crimes, and penal sanctions across India.",
    pdfUrl: "/uploads/bns_2023_statute.pdf",
    fileName: "Bharatiya_Nyaya_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 46 of 2023). Replaced the Code of Criminal Procedure (1973). Regulates criminal investigation, arrest, court trials, bail guidelines, and mandatory digital forensics.",
    pdfUrl: "/uploads/bnss_2023_statute.pdf",
    fileName: "Bharatiya_Nagarik_Suraksha_Sanhita_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "The Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    category: "Act",
    description: "Enacted by Parliament (Act No. 47 of 2023). Replaced the Indian Evidence Act (1872). Governs rules of evidence, admissibility of electronic and digital records, secondary evidence, and witness examinations.",
    pdfUrl: "/uploads/bsa_2023_statute.pdf",
    fileName: "Bharatiya_Sakshya_Adhiniyam_2023.pdf",
    uploadedBy: "Ministry of Law & Justice"
  },
  {
    title: "Code of Civil Procedure, 1908 (CPC)",
    category: "Act",
    description: "Act No. 5 of 1908. Regulates the procedure and administration of all civil litigation, suits, injunctions, appeals, revisions, and execution of decrees in Indian civil courts.",
    pdfUrl: "/uploads/cpc_1908_statute.pdf",
    fileName: "Code_of_Civil_Procedure_1908.pdf",
    uploadedBy: "Legislative Department"
  },
  {
    title: "The Constitution of India",
    category: "Constitution Article",
    description: "Supreme Law of India enacted on 26 January 1950. Outlines Fundamental Rights, Directive Principles of State Policy, Union & State Legislature, Executive, and Judicial Powers.",
    pdfUrl: "/uploads/constitution_of_india.pdf",
    fileName: "Constitution_of_India.pdf",
    uploadedBy: "Constituent Assembly of India"
  },
  {
    title: "Right to Information Act, 2005 (RTI)",
    category: "Act",
    description: "Act No. 22 of 2005. Empowers Indian citizens to request official information from public authorities, setting up Information Commissions and mandatory disclosure timelines.",
    pdfUrl: "/uploads/rti_act_2005.pdf",
    fileName: "RTI_Act_2005.pdf",
    uploadedBy: "Department of Personnel & Training"
  },
  {
    title: "Consumer Protection Act, 2019",
    category: "Act",
    description: "Act No. 35 of 2019. Established Central Consumer Protection Authority (CCPA), e-commerce rules, product liability rules, and three-tier Consumer Dispute Redressal Commissions.",
    pdfUrl: "/uploads/consumer_protection_2019.pdf",
    fileName: "Consumer_Protection_Act_2019.pdf",
    uploadedBy: "Ministry of Consumer Affairs"
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
