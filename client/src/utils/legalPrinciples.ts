export interface LegalPrinciple {
  id: number;
  title: string;
  latinOrMaxim?: string;
  description: string;
  source: string;
  category: 'Constitutional Law' | 'Criminal Jurisprudence' | 'Civil & Contract' | 'Natural Justice' | 'Landmark Rulings';
}

export const LEGAL_PRINCIPLES: LegalPrinciple[] = [
  {
    id: 1,
    title: 'Natural Justice: Hear the Other Side',
    latinOrMaxim: 'Audi Alteram Partem',
    description: 'No person should be condemned or judged without an opportunity to be heard. A cornerstone principle of natural justice under Article 21 of the Indian Constitution.',
    source: 'Supreme Court of India (Maneka Gandhi v. Union of India, 1978)',
    category: 'Natural Justice'
  },
  {
    id: 2,
    title: 'No One Can Be Judge in Their Own Cause',
    latinOrMaxim: 'Nemo Judex In Causa Sua',
    description: 'Judges, arbitrators, or authority figures must be free from bias or personal interest to ensure absolute impartiality in judicial and administrative proceedings.',
    source: 'Bar Council of India & Administrative Jurisprudence',
    category: 'Natural Justice'
  },
  {
    id: 3,
    title: 'Bail is the Rule, Jail is the Exception',
    latinOrMaxim: 'Personal Liberty Principle',
    description: 'First articulated by Justice V.R. Krishna Iyer, pre-trial detention should be a last resort, safeguarding an individual’s fundamental right to personal liberty.',
    source: 'Supreme Court of India (State of Rajasthan v. Balchand, 1977)',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 4,
    title: 'Ignorance of the Law is No Excuse',
    latinOrMaxim: 'Ignorantia Juris Non Excusat',
    description: 'Every citizen is presumed to know the law of the land. Claiming unawareness of a legal prohibition cannot exempt anyone from criminal or civil liability.',
    source: 'Indian Penal Code & Bharatiya Nyaya Sanhita',
    category: 'Civil & Contract'
  },
  {
    id: 5,
    title: 'Right to Free Legal Aid',
    latinOrMaxim: 'Article 39A',
    description: 'The State must provide free legal aid to underprivileged citizens to ensure that opportunities for securing justice are not denied due to economic or other disabilities.',
    source: 'Constitution of India & Legal Services Authorities Act, 1987',
    category: 'Constitutional Law'
  },
  {
    id: 6,
    title: 'Zero FIR Provision',
    latinOrMaxim: 'Jurisdiction-Free Reporting',
    description: 'A victim can register an FIR at ANY police station in India regardless of place of occurrence. The station must record it and transfer it to the concerned precinct.',
    source: 'Ministry of Home Affairs & Supreme Court Advisory Guidelines',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 7,
    title: 'Protection Against Self-Incrimination',
    latinOrMaxim: 'Nemo Tenetur Seipsum Accusare',
    description: 'Under Article 20(3), no person accused of any offense shall be compelled to be a witness against themselves or give forced self-incriminating statements.',
    source: 'Article 20(3), Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 8,
    title: 'Finality of Judgments',
    latinOrMaxim: 'Res Judicata',
    description: 'Once a matter between parties has been conclusively decided by a competent court, the same parties cannot litigate the same issue again on the same cause of action.',
    source: 'Section 11, Code of Civil Procedure (CPC)',
    category: 'Civil & Contract'
  },
  {
    id: 9,
    title: 'Fundamental Right to Privacy',
    latinOrMaxim: 'Puttaswamy Ruling',
    description: 'Privacy is a fundamental right protected under Article 21 (Right to Life and Personal Liberty) and part of the basic structure of the Constitution.',
    source: '9-Judge Bench, Supreme Court (Justice K.S. Puttaswamy v. UOI, 2017)',
    category: 'Landmark Rulings'
  },
  {
    id: 10,
    title: 'Doctrine of Basic Structure',
    latinOrMaxim: 'Constitutional Immunity',
    description: 'Parliament has the power to amend the Constitution under Article 368, but cannot alter or destroy its essential basic features such as secularism and judicial independence.',
    source: '13-Judge Bench, Supreme Court (Kesavananda Bharati v. State of Kerala, 1973)',
    category: 'Landmark Rulings'
  },
  {
    id: 11,
    title: 'No Double Jeopardy',
    latinOrMaxim: 'Nemo Debet Bis Vexari',
    description: 'No person shall be prosecuted and punished for the same offense more than once under Article 20(2) of the Indian Constitution.',
    source: 'Article 20(2), Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 12,
    title: 'Voluntary Assumption of Risk',
    latinOrMaxim: 'Volenti Non Fit Injuria',
    description: 'If a person knowingly and voluntarily consents to take a risk, they cannot claim damages for harm resulting from that voluntary activity.',
    source: 'Law of Torts & Civil Law',
    category: 'Civil & Contract'
  },
  {
    id: 13,
    title: 'Act and Intent Must Co-Exist',
    latinOrMaxim: 'Actus Non Facit Reum Nisi Mens Sit Rea',
    description: 'An act alone does not constitute a crime without guilty intent (mens rea), except in strict liability statutory offenses.',
    source: 'Indian Penal Code & Bharatiya Nyaya Sanhita',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 14,
    title: 'Vicarious Liability of Employers',
    latinOrMaxim: 'Respondeat Superior',
    description: 'An employer or master is legally responsible for wrongful acts committed by an employee performed during the course of employment.',
    source: 'Indian Contract Act & Law of Torts',
    category: 'Civil & Contract'
  },
  {
    id: 15,
    title: 'Public Interest Litigation (PIL)',
    latinOrMaxim: 'Locus Standi Relaxation',
    description: 'Any public-spirited citizen or NGO can approach High Courts or the Supreme Court on behalf of marginalized communities whose fundamental rights are violated.',
    source: 'Supreme Court of India (SP Gupta v. Union of India, 1981)',
    category: 'Landmark Rulings'
  },
  {
    id: 16,
    title: 'Doctrine of Severability',
    latinOrMaxim: 'Article 13',
    description: 'If part of a law violates fundamental rights, only the unconstitutional portion is declared void, provided it can be separated from the rest of the statute.',
    source: 'Article 13(1), Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 17,
    title: 'Writ of Habeas Corpus',
    latinOrMaxim: 'Produce the Body',
    description: 'A prerogative remedy issued by courts commanding a detaining authority to produce an arrested person to verify if their detention is lawful.',
    source: 'Article 32 & 226, Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 18,
    title: 'Plea Bargaining in Criminal Cases',
    latinOrMaxim: 'Mutual Disposition',
    description: 'Introduced in CrPC Chapter XXI-A / BNSS, an accused facing certain offenses can negotiate a lesser sentence by voluntarily pleading guilty prior to trial.',
    source: 'Criminal Law Amendment Act, 2005 / BNSS',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 19,
    title: 'Presumption of Innocence',
    latinOrMaxim: 'In Dubio Pro Reo',
    description: 'An accused person is presumed innocent until proven guilty by the prosecution beyond reasonable doubt in criminal proceedings.',
    source: 'Indian Evidence Act, 1872 / Bharatiya Sakshya Adhiniyam',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 20,
    title: 'Rights of an Arrested Person',
    latinOrMaxim: 'Section 50 CrPC / BNSS',
    description: 'Every police officer arresting a person must inform them immediately of the grounds of arrest and their right to be released on bail.',
    source: 'Supreme Court (D.K. Basu v. State of West Bengal, 1997)',
    category: 'Landmark Rulings'
  },
  {
    id: 21,
    title: 'Doctrine of Promissory Estoppel',
    latinOrMaxim: 'Pacta Sunt Servanda',
    description: 'When one party makes a clear promise intending to create legal relations and another acts upon it to their detriment, the promisor cannot back out.',
    source: 'Supreme Court of India (Motilal Padampat Sugar Mills case, 1979)',
    category: 'Civil & Contract'
  },
  {
    id: 22,
    title: 'Rule of Ejusdem Generis',
    latinOrMaxim: 'Of the Same Kind',
    description: 'When general words follow specific words of a particular class in a statute, the general words must be construed as limited to things of the same nature.',
    source: 'Statutory Interpretation Jurisprudence',
    category: 'Constitutional Law'
  },
  {
    id: 23,
    title: 'Let the Buyer Beware',
    latinOrMaxim: 'Caveat Emptor',
    description: 'The buyer alone is responsible for checking the quality and suitability of goods before purchasing, unless the seller gives an express guarantee or misleads.',
    source: 'Sale of Goods Act, 1930',
    category: 'Civil & Contract'
  },
  {
    id: 24,
    title: 'Let the Seller Beware',
    latinOrMaxim: 'Caveat Venditor',
    description: 'Modern consumer protection shifts responsibility to sellers to disclose material defects and ensure safety and fitness of products sold to consumers.',
    source: 'Consumer Protection Act, 2019',
    category: 'Civil & Contract'
  },
  {
    id: 25,
    title: 'Where There is a Right, There is a Remedy',
    latinOrMaxim: 'Ubi Jus Ibi Remedium',
    description: 'Every legal right implies an equivalent legal remedy whenever that right is infringed or violated by another party.',
    source: 'Ashby v. White & Law of Torts',
    category: 'Natural Justice'
  },
  {
    id: 26,
    title: 'The Thing Speaks for Itself',
    latinOrMaxim: 'Res Ipsa Loquitur',
    description: 'In tort law, negligence can be inferred from the mere occurrence of an event when the accident is of a kind that does not ordinarily occur without negligence.',
    source: 'Law of Torts Jurisprudence',
    category: 'Civil & Contract'
  },
  {
    id: 27,
    title: 'Intervening Supervening Cause',
    latinOrMaxim: 'Novus Actus Interveniens',
    description: 'An independent, unexpected act of a third party that breaks the chain of causation between the defendant’s original negligence and the plaintiff’s injury.',
    source: 'Law of Torts & Criminal Negligence',
    category: 'Civil & Contract'
  },
  {
    id: 28,
    title: 'Delay Defeats Equity',
    latinOrMaxim: 'Vigilantibus Non Dormientibus Jura Subveniunt',
    description: 'The law assists those who are vigilant of their legal rights, not those who sleep on them. Claims filed beyond statutory limitation are liable to dismissal.',
    source: 'Limitation Act, 1963',
    category: 'Civil & Contract'
  },
  {
    id: 29,
    title: 'In Equal Fault, Defendant is Stronger',
    latinOrMaxim: 'In Pari Delicto',
    description: 'Where two parties are equally at fault in an illegal transaction, courts will not assist either party to enforce the contract or recover property.',
    source: 'Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 30,
    title: 'No Action Arises from a Bare Promise',
    latinOrMaxim: 'Ex Nudo Pacto Non Oritur Actio',
    description: 'An agreement made without lawful consideration is void and cannot form the basis of an enforceable legal cause of action.',
    source: 'Section 25, Indian Contract Act',
    category: 'Civil & Contract'
  },
  {
    id: 31,
    title: 'As Much as He Deserves',
    latinOrMaxim: 'Quantum Meruit',
    description: 'A party who has performed partial work under a contract is entitled to reasonable remuneration for the value of work done when performance is prevented.',
    source: 'Section 70, Indian Contract Act',
    category: 'Civil & Contract'
  },
  {
    id: 32,
    title: 'Damage Without Legal Injury',
    latinOrMaxim: 'Damnum Sine Injuria',
    description: 'Financial loss or harm suffered without violation of a legal right does not give rise to a legal cause of action for damages.',
    source: 'Gloucester Grammar School Case (1410)',
    category: 'Civil & Contract'
  },
  {
    id: 33,
    title: 'Legal Injury Without Financial Damage',
    latinOrMaxim: 'Injuria Sine Damno',
    description: 'Violation of an absolute legal right entitles the plaintiff to legal remedies and nominal damages even if no actual physical or financial harm occurred.',
    source: 'Ashby v. White (1703) & Bhim Singh v. State of J&K',
    category: 'Constitutional Law'
  },
  {
    id: 34,
    title: 'Welfare of People is Supreme Law',
    latinOrMaxim: 'Salus Populi Est Suprema Lex',
    description: 'The safety, health, and welfare of the public override individual private rights in times of national emergency or public welfare legislation.',
    source: 'Constitutional & Administrative Law',
    category: 'Constitutional Law'
  },
  {
    id: 35,
    title: 'Special Law Overrides General Law',
    latinOrMaxim: 'Lex Specialis Derogat Legi Generali',
    description: 'When a general statutory provision conflicts with a specific statutory provision dealing with the exact subject matter, the special law prevails.',
    source: 'Supreme Court Statutory Interpretation Guidelines',
    category: 'Constitutional Law'
  },
  {
    id: 36,
    title: 'Express Mention Excludes Others',
    latinOrMaxim: 'Expressio Unius Est Exclusio Alterius',
    description: 'Where a statute expressly mentions specific items or persons, it implies the intentional exclusion of all items or persons not mentioned.',
    source: 'Rules of Statutory Interpretation',
    category: 'Constitutional Law'
  },
  {
    id: 37,
    title: 'Absolute Liability for Hazardous Industries',
    latinOrMaxim: 'Deep Pocket & Enterprise Liability',
    description: 'Enterprises engaged in inherently dangerous or hazardous activities owe an absolute and non-delegable duty to prevent harm, subject to zero exceptions.',
    source: 'Supreme Court of India (M.C. Mehta v. Union of India, 1987)',
    category: 'Landmark Rulings'
  },
  {
    id: 38,
    title: 'Strict Liability Doctrine',
    latinOrMaxim: 'Rylands v. Fletcher Principle',
    description: 'A person who brings non-natural, dangerous things onto land is liable for damages if they escape, subject to narrow exceptions like Act of God.',
    source: 'English Common Law & Indian Tort Jurisprudence',
    category: 'Civil & Contract'
  },
  {
    id: 39,
    title: 'Right to Speedy Trial',
    latinOrMaxim: 'Article 21 Extended Right',
    description: 'Speedy trial is an integral part of the fundamental right to life and liberty under Article 21, preventing prolonged detention without trial.',
    source: 'Supreme Court of India (Hussainara Khatoon v. Home Secy, Bihar, 1979)',
    category: 'Landmark Rulings'
  },
  {
    id: 40,
    title: 'Right to Die with Dignity',
    latinOrMaxim: 'Passive Euthanasia & Living Will',
    description: 'The right to life under Article 21 includes the right to die with dignity, legalizing passive euthanasia and advance medical directives under judicial safeguards.',
    source: '5-Judge Bench, Supreme Court (Common Cause v. Union of India, 2018)',
    category: 'Landmark Rulings'
  },
  {
    id: 41,
    title: 'Prevention of Workplace Sexual Harassment',
    latinOrMaxim: 'Vishaka Guidelines',
    description: 'Established mandatory employer guidelines to prevent sexual harassment at workplaces, culminating in the POSH Act of 2013.',
    source: 'Supreme Court of India (Vishaka v. State of Rajasthan, 1997)',
    category: 'Landmark Rulings'
  },
  {
    id: 42,
    title: 'Decriminalization of Same-Sex Relations',
    latinOrMaxim: 'Section 377 Partial Strike Down',
    description: 'Consensual adult homosexual conduct was decriminalized, affirming equality, non-discrimination, and personal autonomy under Articles 14, 15, and 21.',
    source: '5-Judge Bench, Supreme Court (Navtej Singh Johar v. UOI, 2018)',
    category: 'Landmark Rulings'
  },
  {
    id: 43,
    title: 'Decriminalization of Adultery',
    latinOrMaxim: 'Section 497 Unconstitutional',
    description: 'Struck down Section 497 IPC for violating gender equality and female agency, ruling that state intervention in private matrimonial choices is unconstitutional.',
    source: '5-Judge Bench, Supreme Court (Joseph Shine v. Union of India, 2018)',
    category: 'Landmark Rulings'
  },
  {
    id: 44,
    title: 'Transparency in Judiciary: Live Streaming',
    latinOrMaxim: 'Open Court Principle',
    description: 'Sanctioned live streaming of constitutional court proceedings to guarantee public access and transparency in judicial decision-making.',
    source: 'Supreme Court of India (Swapnil Tripathi v. Supreme Court of India, 2018)',
    category: 'Landmark Rulings'
  },
  {
    id: 45,
    title: 'None of the Above (NOTA) Voting Right',
    latinOrMaxim: 'Voter Freedom of Expression',
    description: 'Directed the Election Commission to provide NOTA option on EVMs to uphold voters’ right to reject candidate slates under Article 19(1)(a).',
    source: 'Supreme Court of India (PUCL v. Union of India, 2013)',
    category: 'Landmark Rulings'
  },
  {
    id: 46,
    title: 'Protection of Online Free Speech',
    latinOrMaxim: 'Section 66A IT Act Void',
    description: 'Struck down Section 66A of Information Technology Act for being overly broad and vague, protecting online freedom of speech and expression.',
    source: 'Supreme Court of India (Shreya Singhal v. Union of India, 2015)',
    category: 'Landmark Rulings'
  },
  {
    id: 47,
    title: 'Judicial Independence in Appointments',
    latinOrMaxim: 'Collegium System Doctrine',
    description: 'The Chief Justice of India and senior judges hold primacy in judicial appointments to insulate the judiciary from executive interference.',
    source: 'Supreme Court (Second & Third Judges Cases / NJAC Ruling 2015)',
    category: 'Constitutional Law'
  },
  {
    id: 48,
    title: 'Guidelines to Check Arbitrary Arrests',
    latinOrMaxim: 'Arnesh Kumar Directives',
    description: 'Police officers must not automatically arrest accused persons in offenses punishable by 7 years or less without satisfying statutory necessity under Section 41 CrPC / BNSS.',
    source: 'Supreme Court of India (Arnesh Kumar v. State of Bihar, 2014)',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 49,
    title: 'No Fixed Time Limit on Anticipatory Bail',
    latinOrMaxim: 'Section 438 CrPC / BNSS Protection',
    description: 'Anticipatory bail granted to an accused does not automatically lapse upon filing of charge sheet or summons unless specific conditions are imposed by court.',
    source: '5-Judge Bench, Supreme Court (Sushila Aggarwal v. State of Delhi, 2020)',
    category: 'Landmark Rulings'
  },
  {
    id: 50,
    title: 'Recognition of Transgender Rights',
    latinOrMaxim: 'Third Gender Status',
    description: 'Recognized transgender individuals as Third Gender, granting fundamental rights to self-identified gender identity under Articles 14, 19, and 21.',
    source: 'Supreme Court of India (NALSA v. Union of India, 2014)',
    category: 'Landmark Rulings'
  },
  {
    id: 51,
    title: 'Doctrine of Colorable Legislation',
    latinOrMaxim: 'Quando Aliquid Prohibetur Ex Directo',
    description: 'What the legislature cannot do directly due to constitutional limitations, it cannot do indirectly by disguised statutory drafting.',
    source: 'Kameshwar Singh v. State of Bihar & Constitutional Law',
    category: 'Constitutional Law'
  },
  {
    id: 52,
    title: 'Doctrine of Eclipse',
    latinOrMaxim: 'Dormancy of Inconsistent Laws',
    description: 'A pre-constitutional law inconsistent with Fundamental Rights is not dead, but remains dormant until constitutional amendments remove the inconsistency.',
    source: 'Bhikaji Narain Dhakras v. State of MP (1955)',
    category: 'Constitutional Law'
  },
  {
    id: 53,
    title: 'Doctrine of Pith and Substance',
    latinOrMaxim: 'True Nature and Character',
    description: 'To determine whether a legislature has trespassed beyond its constitutional domain, courts examine the essential substance rather than incidental encroachment.',
    source: 'State of Bombay v. F.N. Balsara (1951)',
    category: 'Constitutional Law'
  },
  {
    id: 54,
    title: 'Doctrine of Territorial Nexus',
    latinOrMaxim: 'Extra-Territorial Operation',
    description: 'A State legislature may enact laws affecting extra-territorial objects provided a real and sufficient connection exists between the State and the subject matter.',
    source: 'State of Bombay v. R.M.D. Chamarbaugwala (1957)',
    category: 'Constitutional Law'
  },
  {
    id: 55,
    title: 'Doctrine of Repugnancy',
    latinOrMaxim: 'Article 254 Conflict',
    description: 'When a State law conflicts with a Central law on a Concurrent List subject, the Central law prevails unless the State law received Presidential Assent.',
    source: 'Article 254, Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 56,
    title: 'Right to Clean Environment & Water',
    latinOrMaxim: 'Article 21 Expanded Scope',
    description: 'The right to enjoy pollution-free water and air is a fundamental component of the Right to Life under Article 21 of the Constitution.',
    source: 'Supreme Court of India (Subhash Kumar v. State of Bihar, 1991)',
    category: 'Landmark Rulings'
  },
  {
    id: 57,
    title: 'Right to Livelihood & Shelter',
    latinOrMaxim: 'Olga Tellis Principle',
    description: 'Depriving a person of their livelihood without fair procedure violates the Right to Life, extending fundamental protection to pavement dwellers.',
    source: 'Supreme Court (Olga Tellis v. Bombay Municipal Corp, 1985)',
    category: 'Landmark Rulings'
  },
  {
    id: 58,
    title: 'Right to Education for Children',
    latinOrMaxim: 'Article 21A Enactment',
    description: 'Free and compulsory education for all children aged 6 to 14 is an enforceable fundamental right guaranteed by the State.',
    source: '86th Constitutional Amendment & Unni Krishnan Ruling',
    category: 'Constitutional Law'
  },
  {
    id: 59,
    title: 'Protection Against Custodial Torture',
    latinOrMaxim: 'D.K. Basu Guidelines',
    description: 'Mandates strict identification, memo of arrest, medical checkups, and right to consult legal counsel during custodial interrogation.',
    source: 'Supreme Court of India (D.K. Basu v. State of WB, 1997)',
    category: 'Landmark Rulings'
  },
  {
    id: 60,
    title: 'Writ of Mandamus',
    latinOrMaxim: 'We Command',
    description: 'A judicial command issued to public officials, corporations, or lower tribunals directing them to perform a mandatory statutory duty.',
    source: 'Article 32 & 226, Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 61,
    title: 'Writ of Certiorari',
    latinOrMaxim: 'To Be Fully Informed',
    description: 'Issued by superior courts to quash orders passed by lower courts or quasi-judicial authorities exceeding jurisdiction or violating natural justice.',
    source: 'Article 32 & 226, Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 62,
    title: 'Writ of Prohibition',
    latinOrMaxim: 'Prevention is Better than Cure',
    description: 'Issued to prevent lower judicial or quasi-judicial bodies from continuing proceedings that exceed their lawful jurisdiction.',
    source: 'Article 32 & 226, Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 63,
    title: 'Writ of Quo Warranto',
    latinOrMaxim: 'By What Authority?',
    description: 'Inquires into the legal legality of a person claiming or usurping a public office created by constitutional or statutory provision.',
    source: 'Article 32 & 226, Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 64,
    title: 'Principle of Unjust Enrichment',
    latinOrMaxim: 'Nemo Locupletari Debet Alieno Damno',
    description: 'No person should be allowed to enrich themselves at another person’s expense without legal justification, requiring restitution.',
    source: 'Quasi-Contracts & Section 72 Indian Contract Act',
    category: 'Civil & Contract'
  },
  {
    id: 65,
    title: 'Rule of Contra Proferentem',
    latinOrMaxim: 'Interpretation Against Drafter',
    description: 'Ambiguous or uncertain clauses in insurance policies or contracts are interpreted strictly against the party who drafted the document.',
    source: 'Contract & Insurance Law Jurisprudence',
    category: 'Civil & Contract'
  },
  {
    id: 66,
    title: 'Doctrine of Frustration of Contract',
    latinOrMaxim: 'Supervening Impossibility',
    description: 'A contract becomes void when performance becomes physically or legally impossible due to an unforeseen event beyond control of either party.',
    source: 'Section 56, Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 67,
    title: 'Meeting of the Minds',
    latinOrMaxim: 'Consensus Ad Idem',
    description: 'An agreement requires both contracting parties to agree upon the same thing in the exact same sense for a valid binding contract.',
    source: 'Section 13, Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 68,
    title: 'Lawful Object & Consideration',
    latinOrMaxim: 'Section 23 Contract Act',
    description: 'Agreements are void if the object or consideration is forbidden by law, defeats statutory provisions, is fraudulent, or opposes public policy.',
    source: 'Section 23, Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 69,
    title: "Minor's Agreement is Void Ab Initio",
    latinOrMaxim: 'Absolute Incapacity',
    description: 'An agreement entered into by a minor (under 18 years) is completely void from the beginning and cannot be ratified upon attaining majority.',
    source: 'Privy Council (Mohori Bibee v. Dharmodas Ghose, 1903)',
    category: 'Civil & Contract'
  },
  {
    id: 70,
    title: 'Undue Influence in Contracts',
    latinOrMaxim: 'Dominant Position Abuse',
    description: 'A contract is voidable when one party in a position of trust or dominant authority uses that position to obtain unfair advantage over another.',
    source: 'Section 16, Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 71,
    title: 'Fraud vs Misrepresentation',
    latinOrMaxim: 'Intention to Deceive',
    description: 'Fraud involves active concealment or false assertions with intent to deceive, whereas misrepresentation involves innocent false statements without deceit.',
    source: 'Section 17 & 18, Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 72,
    title: 'Anticipatory Breach of Contract',
    latinOrMaxim: 'Renunciation Before Performance',
    description: 'When a party refuses or disables themselves from performing their obligation before the due date, the innocent party can rescind immediately.',
    source: 'Section 39, Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 73,
    title: 'Liquidated Damages vs Penalty',
    latinOrMaxim: 'Section 74 Contract Act',
    description: 'Courts award reasonable compensation for breach of contract, not exceeding the stipulated amount, regardless of whether a penalty is named.',
    source: 'Supreme Court (Maula Bux v. Union of India, 1969)',
    category: 'Civil & Contract'
  },
  {
    id: 74,
    title: 'Specific Performance Remedy',
    latinOrMaxim: 'Equitable Relief',
    description: 'Courts may compel a defaulting party to perform their precise contractual obligation when monetary damages provide inadequate compensation.',
    source: 'Specific Relief Act, 1963 (Amended 2018)',
    category: 'Civil & Contract'
  },
  {
    id: 75,
    title: 'Restitution of Rescinded Contracts',
    latinOrMaxim: 'Section 65 Contract Act',
    description: 'When an agreement is discovered void or a contract becomes void, any person who received any advantage must restore or compensate for it.',
    source: 'Section 65, Indian Contract Act, 1872',
    category: 'Civil & Contract'
  },
  {
    id: 76,
    title: 'Reliability of Dying Declaration',
    latinOrMaxim: 'Nemo Moriturus Praesumitur Mentiri',
    description: 'A dying person is presumed not to lie. Statements made regarding the cause of death are admissible without corroboration if found truthful.',
    source: 'Section 32(1), Indian Evidence Act / BSA',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 77,
    title: 'Burden of Proof Standard',
    latinOrMaxim: 'Standard of Proof Distinction',
    description: 'Criminal prosecutions require proof beyond reasonable doubt, whereas civil disputes require proof on the balance of probabilities.',
    source: 'Indian Evidence Act / Bharatiya Sakshya Adhiniyam',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 78,
    title: 'Rule of Res Gestae',
    latinOrMaxim: 'Same Transaction Facts',
    description: 'Facts which, though not in issue, are so connected with a fact in issue as to form part of the same transaction are relevant and admissible evidence.',
    source: 'Section 6, Indian Evidence Act / BSA',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 79,
    title: 'Estoppel by Conduct',
    latinOrMaxim: 'Allegans Contraria Non Est Audiendus',
    description: 'When one person has, by declaration or act, intentionally caused another to believe a thing to be true, they cannot deny it in subsequent litigation.',
    source: 'Section 115, Indian Evidence Act / BSA',
    category: 'Civil & Contract'
  },
  {
    id: 80,
    title: 'Caution Regarding Accomplice Evidence',
    latinOrMaxim: 'Section 133 & Section 114(b)',
    description: 'An accomplice is a competent witness against an accused, but courts as a rule of prudence require corroboration in material particulars.',
    source: 'Indian Evidence Act / Bharatiya Sakshya Adhiniyam',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 81,
    title: 'Advocate-Client Privilege',
    latinOrMaxim: 'Professional Confidentiality',
    description: 'No advocate can be compelled to disclose professional communications or legal advice given to a client without the client’s express consent.',
    source: 'Section 126, Indian Evidence Act / BSA',
    category: 'Natural Justice'
  },
  {
    id: 82,
    title: 'Hostile Witness Cross-Examination',
    latinOrMaxim: 'Section 154 Evidence Act',
    description: 'Court may permit a party calling a witness to put questions to them which might be put in cross-examination when the witness recants.',
    source: 'Indian Evidence Act / Bharatiya Sakshya Adhiniyam',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 83,
    title: 'Judicial Notice of Facts',
    latinOrMaxim: 'No Proof Required',
    description: 'Courts take official judicial notice of laws, geographic boundaries, public holidays, and constitutional matters without requiring formal witness proof.',
    source: 'Section 56 & 57, Indian Evidence Act / BSA',
    category: 'Constitutional Law'
  },
  {
    id: 84,
    title: 'Plea of Alibi',
    latinOrMaxim: 'Physical Impossibility of Presence',
    description: 'The defense argument that the accused was elsewhere at the exact time of crime, making it physically impossible to have committed the offense.',
    source: 'Section 11, Indian Evidence Act / BSA',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 85,
    title: 'Last Seen Together Theory',
    latinOrMaxim: 'Circumstantial Chain',
    description: 'If the deceased was last seen alive in the company of the accused immediately prior to death, the burden shifts to the accused to offer an explanation.',
    source: 'Supreme Court Criminal Jurisprudence',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 86,
    title: 'Test Identification Parade (TIP)',
    latinOrMaxim: 'Evidentiary Testing',
    description: 'A investigative procedure where witnesses identify suspects or stolen property, serving as corroborative evidence during trial.',
    source: 'Section 9, Indian Evidence Act / BSA',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 87,
    title: 'Confession to Police Officer Inadmissible',
    latinOrMaxim: 'Section 25 Exclusion Rule',
    description: 'No confession made to a police officer shall be proved against a person accused of any offense, protecting against coerced statements.',
    source: 'Section 25, Indian Evidence Act / BSA',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 88,
    title: 'Discovery of Physical Evidence Exception',
    latinOrMaxim: 'Section 27 Exception',
    description: 'Information received from an accused in custody that distinctly leads to the discovery of a physical object or fact is admissible in evidence.',
    source: 'Section 27, Indian Evidence Act / BSA',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 89,
    title: 'Right to Choose Life Partner',
    latinOrMaxim: 'Marital Autonomy',
    description: 'Adult citizens have an absolute right to choose their life partner without state, familial, or community interference under Article 21.',
    source: 'Supreme Court (Lata Singh v. State of UP & Hadiya Case 2018)',
    category: 'Landmark Rulings'
  },
  {
    id: 90,
    title: 'Equal Pay for Equal Work',
    latinOrMaxim: 'Non-Discrimination in Wages',
    description: 'Temporary or contractual employees performing identical duties as permanent staff are entitled to equal pay under Article 39(d) and Article 14.',
    source: 'Supreme Court of India (State of Punjab v. Jagjit Singh, 2016)',
    category: 'Landmark Rulings'
  },
  {
    id: 91,
    title: 'Precautionary Principle in Environment',
    latinOrMaxim: 'Anticipatory Environmental Protection',
    description: 'State authorities must take anticipatory action to prevent environmental degradation without waiting for conclusive scientific proof of harm.',
    source: 'Supreme Court (Vellore Citizens Welfare Forum v. UOI, 1996)',
    category: 'Landmark Rulings'
  },
  {
    id: 92,
    title: 'Polluter Pays Principle',
    latinOrMaxim: 'Environmental Liability',
    description: 'The party responsible for environmental pollution must pay the cost of repairing the environmental damage and compensating victims.',
    source: 'Supreme Court (Indian Council for Enviro-Legal Action, 1996)',
    category: 'Landmark Rulings'
  },
  {
    id: 93,
    title: 'Public Trust Doctrine',
    latinOrMaxim: 'State Stewardship',
    description: 'Natural resources such as rivers, forests, and seashores are held by the State as a trustee for the free and unimpeded use of the general public.',
    source: 'Supreme Court of India (M.C. Mehta v. Kamal Nath, 1997)',
    category: 'Landmark Rulings'
  },
  {
    id: 94,
    title: 'Inter-Generational Equity',
    latinOrMaxim: 'Sustainable Development',
    description: 'Present generations hold natural resources in trust for future generations, requiring balanced ecological conservation and industrial growth.',
    source: 'Environmental Law Jurisprudence',
    category: 'Natural Justice'
  },
  {
    id: 95,
    title: 'Right to Information as Fundamental Right',
    latinOrMaxim: 'Article 19(1)(a) Derivation',
    description: 'Freedom of speech includes the right to receive and know information regarding government functioning and public expenditure.',
    source: 'Supreme Court (State of UP v. Raj Narain, 1975 & RTI Act 2005)',
    category: 'Landmark Rulings'
  },
  {
    id: 96,
    title: 'Non-Arbitrariness as Core of Equality',
    latinOrMaxim: 'Royappa Doctrine',
    description: 'Equality under Article 14 strikes at arbitrariness in executive action, ensuring fairness, reason, and transparency in all state decisions.',
    source: 'Supreme Court of India (E.P. Royappa v. State of TN, 1974)',
    category: 'Landmark Rulings'
  },
  {
    id: 97,
    title: 'Right to Internet Access',
    latinOrMaxim: 'Digital Speech Protection',
    description: 'Freedom of speech and right to trade via internet are constitutionally protected fundamental rights under Article 19(1)(a) and 19(1)(g).',
    source: 'Supreme Court of India (Anuradha Bhasin v. UOI, 2020)',
    category: 'Landmark Rulings'
  },
  {
    id: 98,
    title: 'Rule of Law Triad',
    latinOrMaxim: 'Dicey’s Rule of Law',
    description: 'Requires supremacy of regular law over arbitrary power, equality before law for all citizens, and constitutional rights derived from judicial decisions.',
    source: 'A.V. Dicey & Article 14 Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 99,
    title: 'Separation of Powers Doctrine',
    latinOrMaxim: 'Trias Politica',
    description: 'Legislature, Executive, and Judiciary must operate within their distinct constitutional spheres without usurping powers assigned to coordinate organs.',
    source: 'Article 50 & Basic Structure Doctrine',
    category: 'Constitutional Law'
  },
  {
    id: 100,
    title: 'The Law Does Not Concern Itself with Trifles',
    latinOrMaxim: 'De Minimis Non Curat Lex',
    description: 'Courts will not entertain lawsuits or criminal charges for trivial, negligible, or technical harms that cause no real damage.',
    source: 'Section 95, Indian Penal Code / BNSS',
    category: 'Criminal Jurisprudence'
  },
  {
    id: 101,
    title: 'The Law Does Not Compel Impossible Acts',
    latinOrMaxim: 'Lex Non Cogit Ad Impossibilia',
    description: 'Where statutory performance becomes physically impossible due to factors beyond control, failure to perform will not attract legal penalty.',
    source: 'Supreme Court Legal Maxim Jurisprudence',
    category: 'Natural Justice'
  },
  {
    id: 102,
    title: 'Better for a Provision to Have Effect than Perish',
    latinOrMaxim: 'Ut Res Magis Valeat Quam Pereat',
    description: 'Statutory provisions must be interpreted constructively so as to give them meaningful operation rather than rendering them ineffective.',
    source: 'Rules of Statutory Construction',
    category: 'Constitutional Law'
  },
  {
    id: 103,
    title: 'Core Rationale Binding Lower Courts',
    latinOrMaxim: 'Ratio Decidendi',
    description: 'The essential legal principle or reason for a judicial decision which constitutes binding precedent for lower courts under Article 141.',
    source: 'Article 141, Constitution of India',
    category: 'Constitutional Law'
  },
  {
    id: 104,
    title: 'Judicial Observations Made in Passing',
    latinOrMaxim: 'Obiter Dicta',
    description: 'Statements or opinions expressed by a judge in a court ruling that are not essential to the decision, holding persuasive rather than binding authority.',
    source: 'Judicial Precedents & Article 141',
    category: 'Constitutional Law'
  },
  {
    id: 105,
    title: 'Doctrine of Precedent: Stand by Decided Matters',
    latinOrMaxim: 'Stare Decisis',
    description: 'Courts must abide by former precedent rulings to maintain stability, predictability, and consistency in legal interpretations.',
    source: 'Article 141, Constitution of India',
    category: 'Constitutional Law'
  }
];

/**
 * Returns a randomized Legal Principle for display during buffering/loading states
 */
export const getRandomLegalPrinciple = (): LegalPrinciple => {
  const randomIndex = Math.floor(Math.random() * LEGAL_PRINCIPLES.length);
  return LEGAL_PRINCIPLES[randomIndex];
};
