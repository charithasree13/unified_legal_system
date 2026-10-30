/**
 * Elite Legal Desk — Tribunals & Specialized Judicial Bodies Registry
 * Comprehensive directory and metadata mapper for Indian specialized courts,
 * appellate tribunals, commissions, and regulatory judicial authorities.
 */

export interface JudicialBodyInfo {
  code: string;
  name: string;
  type: 'Tribunal' | 'Commission' | 'Appellate Tribunal' | 'Board';
  jurisdiction: string;
  headquarters: string;
  benches: string[];
  officialPortal: string;
  searchPortal?: string;
  applicableActs: string[];
  coverageStatus: 'VERIFIED_OFFICIAL_PORTAL';
  citationFormat: string;
}

export const INDIAN_TRIBUNALS_REGISTRY: JudicialBodyInfo[] = [
  {
    code: 'NCLAT',
    name: 'National Company Law Appellate Tribunal',
    type: 'Appellate Tribunal',
    jurisdiction: 'Insolvency, Bankruptcy (IBC), Company Law, Competition Law',
    headquarters: 'New Delhi',
    benches: ['Principal Bench (New Delhi)', 'Chennai Bench'],
    officialPortal: 'https://nclat.nic.in/',
    searchPortal: 'https://nclat.nic.in/order-judgment',
    applicableActs: ['Insolvency and Bankruptcy Code, 2016', 'Companies Act, 2013', 'Competition Act, 2002'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'Company Appeal (AT) (Insolvency) No. / Year'
  },
  {
    code: 'NCLT',
    name: 'National Company Law Tribunal',
    type: 'Tribunal',
    jurisdiction: 'Company disputes, Corporate Insolvency, Mergers & Schemes',
    headquarters: 'New Delhi',
    benches: ['New Delhi (Principal Bench)', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Allahabad', 'Chandigarh', 'Guwahati', 'Jaipur', 'Cuttack', 'Kochi', 'Indore', 'Amaravati'],
    officialPortal: 'https://nclt.gov.in/',
    searchPortal: 'https://nclt.gov.in/order-judgment',
    applicableActs: ['Companies Act, 2013', 'Insolvency and Bankruptcy Code, 2016'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'CP / CA No. of Bench / Year'
  },
  {
    code: 'NGT',
    name: 'National Green Tribunal',
    type: 'Tribunal',
    jurisdiction: 'Environmental protection, Forest conservation, Pollution remedies',
    headquarters: 'New Delhi',
    benches: ['Principal Bench (New Delhi)', 'Bhopal (Central)', 'Pune (Western)', 'Kolkata (Eastern)', 'Chennai (Southern)'],
    officialPortal: 'https://greentribunal.gov.in/',
    searchPortal: 'https://greentribunal.gov.in/judgments',
    applicableActs: ['National Green Tribunal Act, 2010', 'Environment (Protection) Act, 1986', 'Water (Prevention and Control of Pollution) Act, 1974', 'Air (Prevention and Control of Pollution) Act, 1981', 'Forest (Conservation) Act, 1980'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'Original Application No. / Year (NGT)'
  },
  {
    code: 'ITAT',
    name: 'Income Tax Appellate Tribunal',
    type: 'Tribunal',
    jurisdiction: 'Direct Taxes, Income Tax, International Taxation, Transfer Pricing',
    headquarters: 'Mumbai',
    benches: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Ahmedabad', 'Bangalore', 'Hyderabad', 'Pune', 'Chandigarh', 'Cochin', 'Lucknow', 'Jaipur', 'Patna', 'Indore', 'Nagpur', 'Amritsar', 'Cuttack', 'Jodhpur', 'Ranchi', 'Raipur', 'Surat', 'Visakhapatnam', 'Agra', 'Allahabad', 'Jabalpur', 'Rajkot', 'Panaji', 'Varanasi'],
    officialPortal: 'https://itat.gov.in/',
    searchPortal: 'https://itat.gov.in/judgments',
    applicableActs: ['Income-tax Act, 1961'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'ITA No. / Bench / Year'
  },
  {
    code: 'CESTAT',
    name: 'Customs, Excise and Service Tax Appellate Tribunal',
    type: 'Appellate Tribunal',
    jurisdiction: 'Customs, Central Excise, Service Tax, Anti-Dumping',
    headquarters: 'New Delhi',
    benches: ['Principal Bench (New Delhi)', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Ahmedabad', 'Allahabad', 'Hyderabad', 'Chandigarh'],
    officialPortal: 'https://cestat.gov.in/',
    searchPortal: 'https://cestat.gov.in/judgments',
    applicableActs: ['Customs Act, 1962', 'Central Excise Act, 1944', 'Finance Act, 1994 (Service Tax)'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'Appeal No. / Bench / Year'
  },
  {
    code: 'CAT',
    name: 'Central Administrative Tribunal',
    type: 'Tribunal',
    jurisdiction: 'Service matters and recruitment of Central Government employees',
    headquarters: 'New Delhi',
    benches: ['Principal Bench (New Delhi)', 'Ahmedabad', 'Allahabad', 'Bengaluru', 'Chandigarh', 'Chennai', 'Cuttack', 'Ernakulam', 'Guwahati', 'Hyderabad', 'Jabalpur', 'Jaipur', 'Jodhpur', 'Kolkata', 'Lucknow', 'Mumbai', 'Patna', 'Jammu', 'Srinagar'],
    officialPortal: 'https://cgat.gov.in/',
    searchPortal: 'https://cgat.gov.in/order-judgment',
    applicableActs: ['Administrative Tribunals Act, 1985'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'OA No. / Bench / Year'
  },
  {
    code: 'NCDRC',
    name: 'National Consumer Disputes Redressal Commission',
    type: 'Commission',
    jurisdiction: 'Consumer disputes exceeding statutory threshold, appellate review of State Commissions',
    headquarters: 'New Delhi',
    benches: ['New Delhi'],
    officialPortal: 'http://ncdrc.nic.in/',
    searchPortal: 'http://cms.nic.in/ncdrc/search.do',
    applicableActs: ['Consumer Protection Act, 2019', 'Consumer Protection Act, 1986'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'Consumer Case No. / Year or First Appeal No. / Year'
  },
  {
    code: 'APTEL',
    name: 'Appellate Tribunal for Electricity',
    type: 'Appellate Tribunal',
    jurisdiction: 'Electricity tariff disputes, Grid regulation, Petroleum & Natural Gas (PNGRB appeals)',
    headquarters: 'New Delhi',
    benches: ['New Delhi'],
    officialPortal: 'https://aptel.gov.in/',
    searchPortal: 'https://aptel.gov.in/judgments',
    applicableActs: ['Electricity Act, 2003', 'Petroleum and Natural Gas Regulatory Board Act, 2006'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'Appeal No. / Year (APTEL)'
  },
  {
    code: 'TDSAT',
    name: 'Telecom Disputes Settlement and Appellate Tribunal',
    type: 'Appellate Tribunal',
    jurisdiction: 'Telecom, Broadcasting, Cable TV, Airport Economic Regulatory Authority (AERA appeals)',
    headquarters: 'New Delhi',
    benches: ['New Delhi'],
    officialPortal: 'https://tdsat.gov.in/',
    searchPortal: 'https://tdsat.gov.in/judgments',
    applicableActs: ['Telecom Regulatory Authority of India Act, 1997', 'Airports Economic Regulatory Authority of India Act, 2008'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'Petition / Appeal No. / Year (TDSAT)'
  },
  {
    code: 'AFT',
    name: 'Armed Forces Tribunal',
    type: 'Tribunal',
    jurisdiction: 'Military service matters, Court-martial appeals for Army, Navy, Air Force',
    headquarters: 'New Delhi',
    benches: ['Principal Bench (New Delhi)', 'Chandigarh', 'Lucknow', 'Kolkata', 'Guwahati', 'Chennai', 'Kochi', 'Mumbai', 'Jabalpur', 'Jaipur', 'Srinagar'],
    officialPortal: 'https://aftdelhi.nic.in/',
    searchPortal: 'https://aftdelhi.nic.in/order-judgment',
    applicableActs: ['Armed Forces Tribunal Act, 2007', 'Army Act, 1950', 'Air Force Act, 1950', 'Navy Act, 1957'],
    coverageStatus: 'VERIFIED_OFFICIAL_PORTAL',
    citationFormat: 'OA / TA No. / Bench / Year (AFT)'
  }
];

export function findTribunalByCodeOrName(query: string): JudicialBodyInfo | undefined {
  if (!query) return undefined;
  const lower = query.toLowerCase().trim();
  return INDIAN_TRIBUNALS_REGISTRY.find(t => 
    t.code.toLowerCase() === lower || 
    t.name.toLowerCase().includes(lower) ||
    lower.includes(t.code.toLowerCase())
  );
}
