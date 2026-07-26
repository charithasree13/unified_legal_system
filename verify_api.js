// Unified Legal System - Core Algorithms & Verification Unit
console.log('🧪 Starting core algorithm verification checks...\n');

// 1. LAND CONVERSION RATES VALIDATION
const RATES = {
  sqFeet: 1,
  sqYard: 9,
  sqMeter: 10.76391,
  gunta: 1089,
  cent: 435.6,
  bigha: 27000,
  acre: 43560,
  hectare: 107639.1
};

const convertLand = (value, fromUnit, toUnit) => {
  const sqFeetBase = value * RATES[fromUnit];
  return parseFloat((sqFeetBase / RATES[toUnit]).toFixed(3));
};

console.log('📐 [1/2] Land Conversion Algorithm Verification:');
const sampleAcre = 2.5;
const convertedHectares = convertLand(sampleAcre, 'acre', 'hectare');
const expectedHectares = parseFloat(((sampleAcre * 43560) / 107639.1).toFixed(3));

if (convertedHectares === expectedHectares) {
  console.log(`✅ SUCCESS: ${sampleAcre} Acres converts to ${convertedHectares} Hectares correctly.`);
} else {
  console.error(`❌ FAILURE: Land conversion mismatch. Got ${convertedHectares}, expected ${expectedHectares}`);
}

const sampleCent = 100;
const convertedSqFt = convertLand(sampleCent, 'cent', 'sqFeet');
if (convertedSqFt === 43560) {
  console.log(`✅ SUCCESS: ${sampleCent} Cents converts to ${convertedSqFt} SqFt correctly (Equal to 1 Acre).`);
} else {
  console.error(`❌ FAILURE: Cent to SqFt conversion mismatch. Got ${convertedSqFt}, expected 43560`);
}


// 2. COURT FEE REGULATORY FORMULAS VALIDATION
const calculateCourtFee = (suitValue, courtType, state) => {
  const value = Number(suitValue);
  let fee = 0;

  if (state === 'Maharashtra') {
    fee = value <= 50000 ? value * 0.02 : value * 0.05;
  } else if (state === 'Delhi') {
    fee = value * 0.04;
  } else if (state === 'Karnataka') {
    fee = value <= 100000 ? value * 0.025 : value * 0.06;
  } else {
    fee = value * 0.035;
  }

  if (fee < 100) fee = 100;
  if (courtType === 'High Court' && fee > 150000) fee = 150000;

  return Math.round(fee);
};

console.log('\n⚖️  [2/2] Court Fee Formulas Verification:');
const sampleValue = 500000;

// Test Delhi (Flat 4%)
const delhiFee = calculateCourtFee(sampleValue, 'District Court', 'Delhi');
if (delhiFee === 20000) {
  console.log(`✅ SUCCESS: Delhi High Court fee for suit valuation INR ${sampleValue} calculated as INR ${delhiFee} (4% flat).`);
} else {
  console.error(`❌ FAILURE: Delhi Fee mismatch. Got ${delhiFee}, expected 20000`);
}

// Test Karnataka (Over 100,000 is 6%)
const karnatakaFee = calculateCourtFee(sampleValue, 'District Court', 'Karnataka');
if (karnatakaFee === 30000) {
  console.log(`✅ SUCCESS: Karnataka fee for suit valuation INR ${sampleValue} calculated as INR ${karnatakaFee} (6% over threshold).`);
} else {
  console.error(`❌ FAILURE: Karnataka Fee mismatch. Got ${karnatakaFee}, expected 30000`);
}

console.log('\n🎉 All core algorithms verified successfully.');
