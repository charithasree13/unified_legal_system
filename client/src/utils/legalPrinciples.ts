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
    description: 'Once a matter between parties has been conclusively decided by a competent court, the same parties cannot litigate the same issue again.',
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
    source: 'Indian Penal Code & Criminal Jurisprudence',
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
    description: 'Introduced in CrPC Chapter XXI-A, an accused facing certain offenses can negotiate a lesser sentence by voluntarily pleading guilty prior to trial.',
    source: 'Criminal Law Amendment Act, 2005 / Bharatiya Nagarik Suraksha Sanhita',
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
  }
];

/**
 * Returns a randomized Legal Principle for display during buffering/loading states
 */
export const getRandomLegalPrinciple = (): LegalPrinciple => {
  const randomIndex = Math.floor(Math.random() * LEGAL_PRINCIPLES.length);
  return LEGAL_PRINCIPLES[randomIndex];
};
