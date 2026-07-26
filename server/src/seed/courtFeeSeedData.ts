import { 
  State, CourtType, CaseType, ReliefType, CourtFeeAct, CourtFeeRule, CourtFeeSlab 
} from '../models/Schemas';

export async function seedCourtFeeDatabase() {
  try {
    const existingRules = await CourtFeeRule.find();
    if (existingRules && existingRules.length > 5) {
      console.log('🏛️ Court Fee seed data already fully populated.');
      return;
    }

    console.log('🌱 Seeding Court Fee Database Rules for 36 Jurisdictions...');

    // 1. STATES AND UTS
    const statesData = [
      { name: 'Andhra Pradesh', code: 'AP', type: 'State', defaultActName: 'Andhra Pradesh Court Fees and Suits Valuation Act, 1956' },
      { name: 'Arunachal Pradesh', code: 'AR', type: 'State', defaultActName: 'Court Fees Act, 1870' },
      { name: 'Assam', code: 'AS', type: 'State', defaultActName: 'Court Fees (Assam Amendment) Act, 1950' },
      { name: 'Bihar', code: 'BR', type: 'State', defaultActName: 'Court Fees (Bihar Amendment) Act, 1977' },
      { name: 'Chhattisgarh', code: 'CG', type: 'State', defaultActName: 'Court Fees (Chhattisgarh Amendment) Act, 2015' },
      { name: 'Goa', code: 'GA', type: 'State', defaultActName: 'Goa Court Fees and Suits Valuation Act, 1965' },
      { name: 'Gujarat', code: 'GJ', type: 'State', defaultActName: 'Gujarat Court Fees Act, 2004' },
      { name: 'Haryana', code: 'HR', type: 'State', defaultActName: 'Court Fees (Haryana Amendment) Act, 1974' },
      { name: 'Himachal Pradesh', code: 'HP', type: 'State', defaultActName: 'Himachal Pradesh Court Fees Act, 1968' },
      { name: 'Jharkhand', code: 'JH', type: 'State', defaultActName: 'Court Fees (Jharkhand Amendment) Act, 2020' },
      { name: 'Karnataka', code: 'KA', type: 'State', defaultActName: 'Karnataka Court Fees and Suits Valuation Act, 1958' },
      { name: 'Kerala', code: 'KL', type: 'State', defaultActName: 'Kerala Court Fees and Suits Valuation Act, 1959' },
      { name: 'Madhya Pradesh', code: 'MP', type: 'State', defaultActName: 'Court Fees (Madhya Pradesh Amendment) Act, 1975' },
      { name: 'Maharashtra', code: 'MH', type: 'State', defaultActName: 'Maharashtra Court Fees Act, 1959' },
      { name: 'Manipur', code: 'MN', type: 'State', defaultActName: 'Court Fees (Manipur Amendment) Act' },
      { name: 'Meghalaya', code: 'ML', type: 'State', defaultActName: 'Court Fees (Meghalaya Amendment) Act' },
      { name: 'Mizoram', code: 'MZ', type: 'State', defaultActName: 'Court Fees (Mizoram Amendment) Act' },
      { name: 'Nagaland', code: 'NL', type: 'State', defaultActName: 'Court Fees (Nagaland Amendment) Act' },
      { name: 'Odisha', code: 'OD', type: 'State', defaultActName: 'Court Fees (Odisha Amendment) Act, 1958' },
      { name: 'Punjab', code: 'PB', type: 'State', defaultActName: 'Court Fees (Punjab Amendment) Act, 1953' },
      { name: 'Rajasthan', code: 'RJ', type: 'State', defaultActName: 'Rajasthan Court Fees and Suits Valuation Act, 1961' },
      { name: 'Sikkim', code: 'SK', type: 'State', defaultActName: 'Court Fees (Sikkim Amendment) Act' },
      { name: 'Tamil Nadu', code: 'TN', type: 'State', defaultActName: 'Tamil Nadu Court Fees and Suits Valuation Act, 1955' },
      { name: 'Telangana', code: 'TG', type: 'State', defaultActName: 'Telangana Court Fees and Suits Valuation Act, 1956' },
      { name: 'Tripura', code: 'TR', type: 'State', defaultActName: 'Court Fees (Tripura Amendment) Act' },
      { name: 'Uttarakhand', code: 'UK', type: 'State', defaultActName: 'Court Fees (Uttarakhand Amendment) Act' },
      { name: 'Uttar Pradesh', code: 'UP', type: 'State', defaultActName: 'Court Fees (Uttar Pradesh Amendment) Act, 1938' },
      { name: 'West Bengal', code: 'WB', type: 'State', defaultActName: 'West Bengal Court Fees Act, 1970' },
      // UTs
      { name: 'Andaman and Nicobar Islands', code: 'AN', type: 'Union Territory', defaultActName: 'Court Fees Act, 1870' },
      { name: 'Chandigarh', code: 'CH', type: 'Union Territory', defaultActName: 'Court Fees (Punjab Amendment) Act' },
      { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DH', type: 'Union Territory', defaultActName: 'Court Fees Act, 1870' },
      { name: 'Delhi', code: 'DL', type: 'Union Territory', defaultActName: 'Court Fees (Delhi Amendment) Act, 2012' },
      { name: 'Jammu and Kashmir', code: 'JK', type: 'Union Territory', defaultActName: 'Court Fees (J&K) Act, 1977' },
      { name: 'Ladakh', code: 'LA', type: 'Union Territory', defaultActName: 'Court Fees (J&K) Act, 1977' },
      { name: 'Lakshadweep', code: 'LD', type: 'Union Territory', defaultActName: 'Court Fees Act, 1870' },
      { name: 'Puducherry', code: 'PY', type: 'Union Territory', defaultActName: 'Puducherry Court Fees and Suits Valuation Act, 1972' }
    ];

    for (const s of statesData) {
      const exists = await State.findOne({ name: s.name });
      if (!exists) {
        await State.create(s);
      }
    }

    // 2. COURTS
    const courtsData = [
      { name: 'Junior civil Judges court', code: 'JCJ', pecuniaryLimitMin: 0, pecuniaryLimitMax: 500000, description: 'Junior Subordinate Civil Jurisdiction' },
      { name: 'Senior civil judges court', code: 'SCJ', pecuniaryLimitMin: 500001, pecuniaryLimitMax: 2000000, description: 'Senior Subordinate Civil Jurisdiction' },
      { name: 'District Court', code: 'DC', pecuniaryLimitMin: 2000001, pecuniaryLimitMax: null, description: 'District Principal Civil Court' },
      { name: 'Commercial Court', code: 'CC', pecuniaryLimitMin: 300000, pecuniaryLimitMax: null, description: 'Commercial Disputes Resolution Court' },
      { name: 'High Court', code: 'HC', pecuniaryLimitMin: 0, pecuniaryLimitMax: null, description: 'State Constitutional & Original Jurisdiction' },
      { name: 'Supreme Court', code: 'SC', pecuniaryLimitMin: 0, pecuniaryLimitMax: null, description: 'Apex Court of India' },
      { name: 'Consumers forum', code: 'CF', pecuniaryLimitMin: 0, pecuniaryLimitMax: null, description: 'District, State & National Consumer Commissions' },
      { name: 'DRT', code: 'DRT', pecuniaryLimitMin: 2000000, pecuniaryLimitMax: null, description: 'Debts Recovery Tribunal' },
      { name: 'Small Causes Court', code: 'SCC', pecuniaryLimitMin: 0, pecuniaryLimitMax: 100000, description: 'Summary Suits & Small Claims' },
      { name: 'Judicial magistrate of 1st class', code: 'JMFC', pecuniaryLimitMin: 0, pecuniaryLimitMax: null, description: 'Criminal Jurisdiction' }
    ];

    for (const c of courtsData) {
      const exists = await CourtType.findOne({ name: c.name });
      if (!exists) {
        await CourtType.create(c);
      }
    }

    // 3. CASE TYPES & RELIEFS
    const caseTypesData = [
      { name: 'Money Recovery Suit', code: 'MRS', category: 'Civil' },
      { name: 'Recovery of Loan', code: 'ROL', category: 'Civil' },
      { name: 'Recovery of Possession', code: 'ROP', category: 'Civil' },
      { name: 'Partition Suit', code: 'PS', category: 'Civil' },
      { name: 'Specific Performance', code: 'SP', category: 'Civil' },
      { name: 'Declaration', code: 'DEC', category: 'Civil' },
      { name: 'Declaration with Consequential Relief', code: 'DCR', category: 'Civil' },
      { name: 'Permanent Injunction', code: 'PI', category: 'Civil' },
      { name: 'Mandatory Injunction', code: 'MI', category: 'Civil' },
      { name: 'Cancellation of Sale Deed', code: 'CSD', category: 'Civil' },
      { name: 'Commercial Dispute', code: 'CD', category: 'Commercial' },
      { name: 'Consumer Dispute', code: 'CONS', category: 'Consumer' },
      { name: 'Writ Petition', code: 'WP', category: 'Special' }
    ];

    for (const ct of caseTypesData) {
      const exists = await CaseType.findOne({ name: ct.name });
      if (!exists) {
        await CaseType.create(ct);
      }
    }

    const reliefsData = [
      { name: 'Money Claim Recovery', code: 'MCR', caseTypeName: 'Money Recovery Suit', valuationBasis: 'ClaimAmount' },
      { name: 'Bank Debt Recovery', code: 'BDR', caseTypeName: 'Recovery of Loan', valuationBasis: 'LoanAmount' },
      { name: 'Property Market Valuation Possession', code: 'PMVP', caseTypeName: 'Recovery of Possession', valuationBasis: 'MarketValue' },
      { name: 'Partition Share Market Value', code: 'PSMV', caseTypeName: 'Partition Suit', valuationBasis: 'MarketValue' },
      { name: 'Contract Agreement Consideration', code: 'CAC', caseTypeName: 'Specific Performance', valuationBasis: 'AgreementValue' },
      { name: 'Fixed Title Declaration', code: 'FTD', caseTypeName: 'Declaration', valuationBasis: 'Fixed' },
      { name: 'Fixed Injunction Relief', code: 'FIR', caseTypeName: 'Permanent Injunction', valuationBasis: 'Fixed' },
      { name: 'Cancellation Sale Deed Market Value', code: 'CSDMV', caseTypeName: 'Cancellation of Sale Deed', valuationBasis: 'MarketValue' },
      { name: 'Consumer Compensation Claim', code: 'CCC', caseTypeName: 'Consumer Dispute', valuationBasis: 'CompensationAmount' },
      { name: 'Commercial Suit Ad Valorem', code: 'CSAV', caseTypeName: 'Commercial Dispute', valuationBasis: 'ClaimAmount' },
      { name: 'Writ Petition Fixed Fee', code: 'WPFF', caseTypeName: 'Writ Petition', valuationBasis: 'Fixed' }
    ];

    for (const r of reliefsData) {
      const exists = await ReliefType.findOne({ name: r.name });
      if (!exists) {
        await ReliefType.create(r);
      }
    }

    // 4. STATUTORY RULES SEEDING
    // Andhra Pradesh Rule
    const apRule = await CourtFeeRule.create({
      stateName: 'Andhra Pradesh',
      courtTypeName: 'District Court',
      caseTypeName: 'Money Recovery Suit',
      reliefTypeName: 'Money Claim Recovery',
      actName: 'Andhra Pradesh Court Fees and Suits Valuation Act, 1956',
      section: 'Section 20',
      schedule: 'Schedule I',
      article: 'Article 1',
      feeType: 'SlabBased',
      maxFee: 3000000,
      effectiveDate: '1956-05-01',
      remarks: 'AP Court Fees Act 1956: Stepped Schedule I Article 1 Table (Rs 3,426 for Rs 1,00,000).'
    });

    await CourtFeeSlab.create({ ruleId: apRule._id, minVal: 0, maxVal: 10000, ratePercentage: 7.26 });
    await CourtFeeSlab.create({ ruleId: apRule._id, minVal: 10001, maxVal: 14000, ratePercentage: 7.5, cumulativeBaseFee: 726 });
    await CourtFeeSlab.create({ ruleId: apRule._id, minVal: 14001, maxVal: 100000, ratePerUnit: 2.7907, unitSize: 100, cumulativeBaseFee: 1026 });
    await CourtFeeSlab.create({ ruleId: apRule._id, minVal: 100001, maxVal: null, ratePercentage: 1.0, cumulativeBaseFee: 3426 });

    // Telangana Rule
    const tgRule = await CourtFeeRule.create({
      stateName: 'Telangana',
      courtTypeName: 'District Court',
      caseTypeName: 'Money Recovery Suit',
      reliefTypeName: 'Money Claim Recovery',
      actName: 'Telangana Court Fees and Suits Valuation Act, 1956',
      section: 'Section 20',
      schedule: 'Schedule I',
      article: 'Article 1',
      feeType: 'SlabBased',
      maxFee: 3000000,
      effectiveDate: '1956-05-01',
      remarks: 'Telangana Court Fees Act 1956: Stepped Schedule I Article 1 Table (Rs 1,026 for Rs 14,000).'
    });

    await CourtFeeSlab.create({ ruleId: tgRule._id, minVal: 0, maxVal: 10000, ratePercentage: 7.26 });
    await CourtFeeSlab.create({ ruleId: tgRule._id, minVal: 10001, maxVal: 14000, ratePercentage: 7.5, cumulativeBaseFee: 726 });
    await CourtFeeSlab.create({ ruleId: tgRule._id, minVal: 14001, maxVal: 100000, ratePerUnit: 2.7907, unitSize: 100, cumulativeBaseFee: 1026 });
    await CourtFeeSlab.create({ ruleId: tgRule._id, minVal: 100001, maxVal: null, ratePercentage: 1.0, cumulativeBaseFee: 3426 });

    // Delhi Default Rule
    const delRule = await CourtFeeRule.create({
      stateName: 'Delhi',
      courtTypeName: 'District Court',
      caseTypeName: 'Money Recovery Suit',
      reliefTypeName: 'Money Claim Recovery',
      actName: 'Court Fees (Delhi Amendment) Act, 2012',
      section: 'Section 7(i)',
      schedule: 'Schedule I',
      article: 'Article 1',
      feeType: 'SlabBased',
      effectiveDate: '2012-08-01',
      remarks: 'Delhi Stepped Table: ₹3,320 for first ₹1 Lakh + ₹976 per ₹1 Lakh balance.'
    });

    await CourtFeeSlab.create({ ruleId: delRule._id, minVal: 0, maxVal: 1000, ratePercentage: 10, cumulativeBaseFee: 10 });
    await CourtFeeSlab.create({ ruleId: delRule._id, minVal: 1001, maxVal: 5000, ratePercentage: 5, fixedAddition: 100 });
    await CourtFeeSlab.create({ ruleId: delRule._id, minVal: 5001, maxVal: 10000, ratePercentage: 3.5, fixedAddition: 300 });
    await CourtFeeSlab.create({ ruleId: delRule._id, minVal: 10001, maxVal: 50000, ratePercentage: 2, fixedAddition: 475 });
    await CourtFeeSlab.create({ ruleId: delRule._id, minVal: 50001, maxVal: 100000, ratePercentage: 4.09, fixedAddition: 1275 });
    await CourtFeeSlab.create({ ruleId: delRule._id, minVal: 100001, maxVal: null, ratePerUnit: 976, unitSize: 100000, cumulativeBaseFee: 3320 });

    // Maharashtra Default Rule
    const mhRule = await CourtFeeRule.create({
      stateName: 'Maharashtra',
      courtTypeName: 'District Court',
      caseTypeName: 'Money Recovery Suit',
      reliefTypeName: 'Money Claim Recovery',
      actName: 'Maharashtra Court Fees Act, 1959',
      section: 'Section 6(i)',
      schedule: 'Schedule I',
      article: 'Article 1',
      feeType: 'SlabBased',
      maxFee: 300000,
      effectiveDate: '1959-07-01',
      remarks: 'Bombay Court Fees Act: ₹200 per ₹10,000 up to ₹11L; ₹1,200 per ₹1L balance (Cap ₹3,00,000).'
    });

    await CourtFeeSlab.create({ ruleId: mhRule._id, minVal: 0, maxVal: 10000, ratePerUnit: 200, unitSize: 10000, fixedAddition: 10 });
    await CourtFeeSlab.create({ ruleId: mhRule._id, minVal: 10001, maxVal: 1100000, ratePerUnit: 200, unitSize: 10000, fixedAddition: 190 });
    await CourtFeeSlab.create({ ruleId: mhRule._id, minVal: 1100001, maxVal: null, ratePerUnit: 1200, unitSize: 100000, cumulativeBaseFee: 21990 });

    console.log('✅ Court Fee Database rules seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding Court Fee database (safely handled):', error);
  }
}
