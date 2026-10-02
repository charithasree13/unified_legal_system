export interface IslamicInheritanceCaseInput {
  deceasedGender: 'male' | 'female';
  dateOfDeath?: string;
  madhhab: 'sunni_hanafi' | 'sunni_shafi' | 'sunni_maliki' | 'sunni_hanbali' | 'shia_jafari';
  jurisdiction: 'india' | 'other';
  
  // Estate Information
  grossEstateValue?: number | null;
  movableAssets?: number | null;
  immovableAssets?: number | null;
  otherAssets?: number | null;
  funeralExpenses?: number | null;
  outstandingDebts?: number | null;
  validBequest?: number | null; // Wasiyyah (Max 1/3 of net estate after debts)
  otherDeductions?: number | null;

  // Spouse Info
  wivesCount?: number; // Male deceased (0 - 4)
  husbandAlive?: boolean; // Female deceased

  // Children & Descendants
  sonsCount?: number;
  daughtersCount?: number;
  grandsonsCount?: number; // Son's sons
  granddaughtersCount?: number; // Son's daughters

  // Parents
  fatherAlive?: boolean;
  motherAlive?: boolean;

  // Grandparents
  paternalGrandfatherAlive?: boolean;
  paternalGrandmotherAlive?: boolean;
  maternalGrandmotherAlive?: boolean;

  // Siblings
  fullBrothersCount?: number;
  fullSistersCount?: number;
  consanguineBrothersCount?: number;
  consanguineSistersCount?: number;
  uterineBrothersCount?: number;
  uterineSistersCount?: number;

  // Advanced Relatives
  fullBrotherSonsCount?: number;
  paternalUnclesCount?: number;
  hasUnsupportedAdvancedHeir?: boolean;
}

export interface HeirDistribution {
  id: string;
  heirName: string;
  relationship: string;
  category: 'Fixed Share (Fard)' | 'Residuary (\'Asabah)' | 'Fixed + Residuary' | 'Radd Adjusted';
  count: number;
  individualFractionStr: string;
  collectiveFractionStr: string;
  collectiveFractionValue: number;
  percentageStr: string;
  percentageValue: number;
  monetaryShare?: number;
  quranicReference?: string;
  notes?: string;
}

export interface ExcludedHeir {
  heirName: string;
  relationship: string;
  count: number;
  reason: string;
  blockingHeir: string;
}

export interface IslamicInheritanceResult {
  success: boolean;
  caseSummary: {
    deceasedGender: string;
    dateOfDeath: string;
    madhhabName: string;
    jurisdiction: string;
    grossEstate: number;
    totalDeductions: number;
    funeralExpenses: number;
    debts: number;
    wasiyyah: number;
    otherDeductions: number;
    netDistributableEstate: number;
    hasMonetaryCalculation: boolean;
  };
  eligibleHeirs: HeirDistribution[];
  excludedHeirs: ExcludedHeir[];
  calculationSummary: {
    baseDenominator: number;
    adjustedDenominator: number;
    fixedSharesSumFractionStr: string;
    fixedSharesSumValue: number;
    isAwlApplied: boolean;
    isRaddApplied: boolean;
    residueFractionStr: string;
    residueFractionValue: number;
    residueDistributedTo: string;
    totalAllocatedPercentage: number;
    totalAllocatedMonetary: number;
    reconciled: boolean;
  };
  stepByStepExplanation: string[];
  legalNotice: string;
  warnings: string[];
  errorMessage?: string;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

function formatFraction(num: number, den: number): string {
  if (num === 0) return '0';
  if (den === 0) return '0';
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  return `${n}/${d}`;
}

export function calculateIslamicInheritance(input: IslamicInheritanceCaseInput): IslamicInheritanceResult {
  const warnings: string[] = [];
  const steps: string[] = [];
  const eligibleHeirs: HeirDistribution[] = [];
  const excludedHeirs: ExcludedHeir[] = [];

  if (!input.deceasedGender || !['male', 'female'].includes(input.deceasedGender)) {
    return createErrorResult('Please select the deceased\'s gender.');
  }

  const selectedMadhhab = input.madhhab || 'sunni_hanafi';
  let madhhabName = 'Sunni – Hanafi Framework';
  if (selectedMadhhab === 'sunni_shafi') madhhabName = 'Sunni – Shafi\'i Framework';
  else if (selectedMadhhab === 'sunni_maliki') madhhabName = 'Sunni – Maliki Framework';
  else if (selectedMadhhab === 'sunni_hanbali') madhhabName = 'Sunni – Hanbali Framework';
  else if (selectedMadhhab === 'shia_jafari') {
    madhhabName = 'Shia – Ja\'fari Framework';
    warnings.push('Selected framework is Shia – Ja\'fari. Calculation generated uses Sunni Hanafi baseline rules.');
  }

  if (
    (input.grossEstateValue && input.grossEstateValue < 0) ||
    (input.wivesCount && input.wivesCount < 0) ||
    (input.sonsCount && input.sonsCount < 0) ||
    (input.daughtersCount && input.daughtersCount < 0)
  ) {
    return createErrorResult('Negative numeric values or counts are not allowed.');
  }

  if (input.deceasedGender === 'male' && input.husbandAlive) {
    return createErrorResult('Incompatible parameters: A male deceased cannot have a surviving husband.');
  }
  if (input.deceasedGender === 'female' && input.wivesCount && input.wivesCount > 0) {
    return createErrorResult('Incompatible parameters: A female deceased cannot have surviving wives.');
  }
  if (input.deceasedGender === 'male' && input.wivesCount && input.wivesCount > 4) {
    return createErrorResult('Invalid input: Maximum 4 wives permitted under standard calculation parameters.');
  }
  if (input.hasUnsupportedAdvancedHeir) {
    return createErrorResult('Complex case containing advanced/unsupported heir relationships. Professional legal & fiqh review required.');
  }

  const gross = Math.max(0, input.grossEstateValue || 0);
  const funeral = Math.max(0, input.funeralExpenses || 0);
  const debts = Math.max(0, input.outstandingDebts || 0);
  const reqBequest = Math.max(0, input.validBequest || 0);
  const otherDed = Math.max(0, input.otherDeductions || 0);

  const estateAfterFuneralAndDebts = Math.max(0, gross - funeral - debts - otherDed);
  const maxAllowableBequest = estateAfterFuneralAndDebts / 3;
  let finalBequest = reqBequest;
  if (reqBequest > maxAllowableBequest && estateAfterFuneralAndDebts > 0) {
    finalBequest = maxAllowableBequest;
    warnings.push(`Specified Wasiyyah (₹${reqBequest.toLocaleString('en-IN')}) exceeds the 1/3 legal limit (₹${maxAllowableBequest.toLocaleString('en-IN')}). Capped at 1/3 per Islamic Fara'id rules.`);
  }

  const totalDeductions = funeral + debts + finalBequest + otherDed;
  const netDistributableEstate = Math.max(0, gross - totalDeductions);

  if (gross > 0 && totalDeductions > gross) {
    return createErrorResult(`Total deductions (₹${totalDeductions.toLocaleString('en-IN')}) exceed the gross estate value (₹${gross.toLocaleString('en-IN')}). Estate is insolvent.`);
  }

  steps.push(`Step 1: Estate Accounting — Gross Estate: ₹${gross.toLocaleString('en-IN')} | Deductions: ₹${totalDeductions.toLocaleString('en-IN')} → Net Distributable Estate: ₹${netDistributableEstate.toLocaleString('en-IN')}.`);

  const sons = input.sonsCount || 0;
  const daughters = input.daughtersCount || 0;
  const grandsons = input.grandsonsCount || 0;
  const granddaughters = input.granddaughtersCount || 0;
  const wives = input.deceasedGender === 'male' ? (input.wivesCount || 0) : 0;
  const husband = input.deceasedGender === 'female' && input.husbandAlive ? 1 : 0;
  const father = input.fatherAlive ? 1 : 0;
  const mother = input.motherAlive ? 1 : 0;
  const pGrandfather = input.paternalGrandfatherAlive ? 1 : 0;
  const pGrandmother = input.paternalGrandmotherAlive ? 1 : 0;
  const mGrandmother = input.maternalGrandmotherAlive ? 1 : 0;

  const fBrothers = input.fullBrothersCount || 0;
  const fSisters = input.fullSistersCount || 0;
  const cBrothers = input.consanguineBrothersCount || 0;
  const cSisters = input.consanguineSistersCount || 0;
  const uBrothers = input.uterineBrothersCount || 0;
  const uSisters = input.uterineSistersCount || 0;

  const hasMaleDescendants = sons > 0 || grandsons > 0;
  const hasDescendants = sons > 0 || daughters > 0 || grandsons > 0 || granddaughters > 0;
  const totalSiblings = fBrothers + fSisters + cBrothers + cSisters + uBrothers + uSisters;

  if (
    wives === 0 && husband === 0 && sons === 0 && daughters === 0 && 
    grandsons === 0 && granddaughters === 0 && father === 0 && mother === 0 && 
    pGrandfather === 0 && pGrandmother === 0 && mGrandmother === 0 && 
    totalSiblings === 0
  ) {
    return createErrorResult('Please select at least one surviving heir to perform calculation.');
  }

  steps.push(`Step 2: Heir Exclusion (Hajb) Analysis — Evaluating primary & secondary heir relationships under ${madhhabName}.`);

  if (sons > 0) {
    if (grandsons > 0) excludedHeirs.push({ heirName: 'Grandson(s) (Son\'s Son)', relationship: 'Son\'s Son', count: grandsons, reason: 'Excluded by surviving Son(s)', blockingHeir: 'Son' });
    if (granddaughters > 0) excludedHeirs.push({ heirName: 'Granddaughter(s) (Son\'s Daughter)', relationship: 'Son\'s Daughter', count: granddaughters, reason: 'Excluded by surviving Son(s)', blockingHeir: 'Son' });
  }

  if (father > 0) {
    if (pGrandfather > 0) excludedHeirs.push({ heirName: 'Paternal Grandfather', relationship: 'Paternal Grandfather', count: pGrandfather, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
    if (pGrandmother > 0) excludedHeirs.push({ heirName: 'Paternal Grandmother', relationship: 'Paternal Grandmother', count: pGrandmother, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
    if (fBrothers > 0) excludedHeirs.push({ heirName: 'Full Brother(s)', relationship: 'Full Brother', count: fBrothers, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
    if (fSisters > 0) excludedHeirs.push({ heirName: 'Full Sister(s)', relationship: 'Full Sister', count: fSisters, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
    if (cBrothers > 0) excludedHeirs.push({ heirName: 'Consanguine Brother(s)', relationship: 'Consanguine Brother', count: cBrothers, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
    if (cSisters > 0) excludedHeirs.push({ heirName: 'Consanguine Sister(s)', relationship: 'Consanguine Sister', count: cSisters, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
    if (uBrothers > 0) excludedHeirs.push({ heirName: 'Uterine Brother(s)', relationship: 'Uterine Brother', count: uBrothers, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
    if (uSisters > 0) excludedHeirs.push({ heirName: 'Uterine Sister(s)', relationship: 'Uterine Sister', count: uSisters, reason: 'Excluded by surviving Father', blockingHeir: 'Father' });
  }

  if (hasMaleDescendants) {
    const blockerName = sons > 0 ? 'Son(s)' : 'Grandson(s)';
    if (father === 0) {
      if (fBrothers > 0) excludedHeirs.push({ heirName: 'Full Brother(s)', relationship: 'Full Brother', count: fBrothers, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
      if (fSisters > 0) excludedHeirs.push({ heirName: 'Full Sister(s)', relationship: 'Full Sister', count: fSisters, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
      if (cBrothers > 0) excludedHeirs.push({ heirName: 'Consanguine Brother(s)', relationship: 'Consanguine Brother', count: cBrothers, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
      if (cSisters > 0) excludedHeirs.push({ heirName: 'Consanguine Sister(s)', relationship: 'Consanguine Sister', count: cSisters, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
    }
    if (uBrothers > 0 && father === 0) excludedHeirs.push({ heirName: 'Uterine Brother(s)', relationship: 'Uterine Brother', count: uBrothers, reason: `Excluded by surviving male descendant (${blockerName})`, blockingHeir: blockerName });
    if (uSisters > 0 && father === 0) excludedHeirs.push({ heirName: 'Uterine Sister(s)', relationship: 'Uterine Sister', count: uSisters, reason: `Excluded by surviving male descendant (${blockerName})`, blockingHeir: blockerName });
  }

  if (mother > 0) {
    if (mGrandmother > 0) excludedHeirs.push({ heirName: 'Maternal Grandmother', relationship: 'Maternal Grandmother', count: mGrandmother, reason: 'Excluded by surviving Mother', blockingHeir: 'Mother' });
    if (pGrandmother > 0 && father === 0) excludedHeirs.push({ heirName: 'Paternal Grandmother', relationship: 'Paternal Grandmother', count: pGrandmother, reason: 'Excluded by surviving Mother', blockingHeir: 'Mother' });
  }

  interface FixedShareRaw {
    id: string;
    heirName: string;
    relationship: string;
    count: number;
    num: number;
    den: number;
    quranicRef: string;
    notes: string;
  }
  const rawFixedShares: FixedShareRaw[] = [];

  if (husband > 0) {
    const den = hasDescendants ? 4 : 2;
    rawFixedShares.push({ id: 'husband', heirName: 'Husband', relationship: 'Husband', count: 1, num: 1, den, quranicRef: 'Surah An-Nisa 4:12', notes: hasDescendants ? 'Receives 1/4 share.' : 'Receives 1/2 share.' });
  } else if (wives > 0) {
    const den = hasDescendants ? 8 : 4;
    rawFixedShares.push({ id: 'wife', heirName: wives > 1 ? `Wives (${wives})` : 'Wife', relationship: 'Wife', count: wives, num: 1, den, quranicRef: 'Surah An-Nisa 4:12', notes: `Collective share of ${formatFraction(1, den)} split equally.` });
  }

  if (mother > 0) {
    const isUmariyyatan = (husband > 0 || wives > 0) && father > 0 && !hasDescendants && totalSiblings === 0;
    if (isUmariyyatan) {
      const spouseDen = husband > 0 ? 2 : 4;
      rawFixedShares.push({ id: 'mother', heirName: 'Mother', relationship: 'Mother', count: 1, num: spouseDen - 1, den: 3 * spouseDen, quranicRef: 'Surah An-Nisa 4:11 (Umariyyatan)', notes: '1/3 of remainder after spouse share.' });
    } else {
      const den = (hasDescendants || totalSiblings >= 2) ? 6 : 3;
      rawFixedShares.push({ id: 'mother', heirName: 'Mother', relationship: 'Mother', count: 1, num: 1, den, quranicRef: 'Surah An-Nisa 4:11', notes: den === 6 ? 'Receives 1/6 share.' : 'Receives 1/3 share.' });
    }
  }

  if (father > 0) {
    if (hasMaleDescendants) {
      rawFixedShares.push({ id: 'father_fixed', heirName: 'Father', relationship: 'Father', count: 1, num: 1, den: 6, quranicRef: 'Surah An-Nisa 4:11', notes: '1/6 fixed share due to male descendant.' });
    } else if (daughters > 0 || (sons === 0 && grandsons === 0 && granddaughters > 0)) {
      rawFixedShares.push({ id: 'father_fixed_and_residuary', heirName: 'Father', relationship: 'Father', count: 1, num: 1, den: 6, quranicRef: 'Surah An-Nisa 4:11', notes: '1/6 fixed share plus residue.' });
    }
  }

  if (father === 0 && pGrandfather > 0 && hasMaleDescendants) {
    rawFixedShares.push({ id: 'pGrandfather', heirName: 'Paternal Grandfather', relationship: 'Paternal Grandfather', count: 1, num: 1, den: 6, quranicRef: 'Fiqh Precedent', notes: '1/6 fixed share in place of Father.' });
  }

  if (mother === 0) {
    let eligibleGrandmothers = 0;
    if (mGrandmother > 0) eligibleGrandmothers++;
    if (pGrandmother > 0 && father === 0) eligibleGrandmothers++;
    if (eligibleGrandmothers > 0) {
      rawFixedShares.push({ id: 'grandmothers', heirName: eligibleGrandmothers > 1 ? 'Grandmothers' : 'Grandmother', relationship: 'Grandmother', count: eligibleGrandmothers, num: 1, den: 6, quranicRef: 'Sunnah Precedent', notes: '1/6 shared equally.' });
    }
  }

  if (sons === 0 && daughters > 0) {
    if (daughters === 1) rawFixedShares.push({ id: 'daughters', heirName: 'Daughter', relationship: 'Daughter', count: 1, num: 1, den: 2, quranicRef: 'Surah An-Nisa 4:11', notes: '1/2 fixed share.' });
    else rawFixedShares.push({ id: 'daughters', heirName: `Daughters (${daughters})`, relationship: 'Daughter', count: daughters, num: 2, den: 3, quranicRef: 'Surah An-Nisa 4:11', notes: '2/3 fixed share shared.' });
  }

  if (sons === 0 && grandsons === 0 && granddaughters > 0) {
    if (daughters === 0) {
      if (granddaughters === 1) rawFixedShares.push({ id: 'granddaughters', heirName: 'Granddaughter', relationship: 'Son\'s Daughter', count: 1, num: 1, den: 2, quranicRef: 'Fiqh Precedent', notes: '1/2 fixed share.' });
      else rawFixedShares.push({ id: 'granddaughters', heirName: `Granddaughters (${granddaughters})`, relationship: 'Son\'s Daughter', count: granddaughters, num: 2, den: 3, quranicRef: 'Fiqh Precedent', notes: '2/3 fixed share shared.' });
    } else if (daughters === 1) {
      rawFixedShares.push({ id: 'granddaughters', heirName: `Granddaughter(s)`, relationship: 'Son\'s Daughter', count: granddaughters, num: 1, den: 6, quranicRef: 'Hadith Precedent', notes: '1/6 share to complete 2/3 quota.' });
    }
  }

  if (!hasDescendants && father === 0 && pGrandfather === 0) {
    const totalUterine = uBrothers + uSisters;
    if (totalUterine === 1) rawFixedShares.push({ id: 'uterineSiblings', heirName: uBrothers === 1 ? 'Uterine Brother' : 'Uterine Sister', relationship: 'Uterine Sibling', count: 1, num: 1, den: 6, quranicRef: 'Surah An-Nisa 4:12', notes: '1/6 fixed share.' });
    else if (totalUterine > 1) rawFixedShares.push({ id: 'uterineSiblings', heirName: `Uterine Siblings (${totalUterine})`, relationship: 'Uterine Sibling', count: totalUterine, num: 1, den: 3, quranicRef: 'Surah An-Nisa 4:12', notes: '1/3 shared equally.' });
  }

  let baseDen = 1;
  rawFixedShares.forEach(s => { baseDen = lcm(baseDen, s.den); });
  if (baseDen === 1 && rawFixedShares.length > 0) baseDen = 12;

  let sumFixedNumerator = 0;
  rawFixedShares.forEach(s => { sumFixedNumerator += s.num * (baseDen / s.den); });

  steps.push(`Step 3: Fixed Shares (Fard) Evaluation — Common denominator: ${baseDen}. Total fixed numerator = ${sumFixedNumerator}/${baseDen}.`);

  let finalBaseDen = baseDen;
  let isAwl = false;
  let isRadd = false;
  let residueNumerator = baseDen - sumFixedNumerator;

  if (sumFixedNumerator > baseDen) {
    isAwl = true;
    finalBaseDen = sumFixedNumerator;
    residueNumerator = 0;
    warnings.push(`'Awl applied: Fixed shares (${sumFixedNumerator}/${baseDen}) exceed estate. Base expanded to ${finalBaseDen}.`);
  }

  rawFixedShares.forEach(s => {
    const numInBase = s.num * (baseDen / s.den);
    const fractionVal = numInBase / finalBaseDen;
    const percentageVal = fractionVal * 100;
    const monetaryVal = netDistributableEstate > 0 ? (fractionVal * netDistributableEstate) : 0;
    const indNum = numInBase / s.count;

    eligibleHeirs.push({
      id: s.id,
      heirName: s.heirName,
      relationship: s.relationship,
      category: isAwl ? 'Radd Adjusted' : 'Fixed Share (Fard)',
      count: s.count,
      individualFractionStr: formatFraction(indNum, finalBaseDen),
      collectiveFractionStr: formatFraction(numInBase, finalBaseDen),
      collectiveFractionValue: fractionVal,
      percentageStr: `${percentageVal.toFixed(2)}%`,
      percentageValue: parseFloat(percentageVal.toFixed(2)),
      monetaryShare: Math.round(monetaryVal * 100) / 100,
      quranicReference: s.quranicRef,
      notes: s.notes
    });
  });

  let residueDistributedTo = 'None';
  if (!isAwl && residueNumerator > 0) {
    if (sons > 0) {
      residueDistributedTo = 'Sons and Daughters';
      const totalUnits = (sons * 2) + daughters;
      const residueSharePerUnit = (residueNumerator / baseDen) / totalUnits;
      const sonCollectiveFraction = (sons * 2 * residueSharePerUnit);
      eligibleHeirs.push({
        id: 'sons_residuary', heirName: sons > 1 ? `Sons (${sons})` : 'Son', relationship: 'Son', category: 'Residuary (\'Asabah)', count: sons,
        individualFractionStr: formatFraction(sonCollectiveFraction / sons * baseDen, baseDen), collectiveFractionStr: formatFraction(sonCollectiveFraction * baseDen, baseDen), collectiveFractionValue: sonCollectiveFraction,
        percentageStr: `${(sonCollectiveFraction * 100).toFixed(2)}%`, percentageValue: parseFloat((sonCollectiveFraction * 100).toFixed(2)),
        monetaryShare: Math.round(sonCollectiveFraction * netDistributableEstate * 100) / 100, quranicReference: 'Surah An-Nisa 4:11', notes: 'Primary residuary (2x daughter share).'
      });
      if (daughters > 0) {
        const daughterCollectiveFraction = (daughters * residueSharePerUnit);
        eligibleHeirs.push({
          id: 'daughters_residuary', heirName: daughters > 1 ? `Daughters (${daughters})` : 'Daughter', relationship: 'Daughter', category: 'Residuary (\'Asabah)', count: daughters,
          individualFractionStr: formatFraction(daughterCollectiveFraction / daughters * baseDen, baseDen), collectiveFractionStr: formatFraction(daughterCollectiveFraction * baseDen, baseDen), collectiveFractionValue: daughterCollectiveFraction,
          percentageStr: `${(daughterCollectiveFraction * 100).toFixed(2)}%`, percentageValue: parseFloat((daughterCollectiveFraction * 100).toFixed(2)),
          monetaryShare: Math.round(daughterCollectiveFraction * netDistributableEstate * 100) / 100, quranicReference: 'Surah An-Nisa 4:11', notes: 'Co-residuary alongside sons.'
        });
      }
      residueNumerator = 0;
    } else if (father > 0 && residueNumerator > 0) {
      residueDistributedTo = 'Father (Residuary Share)';
      const fatherResidueFraction = (residueNumerator / baseDen);
      const existingFatherObj = eligibleHeirs.find(h => h.id === 'father_fixed_and_residuary' || h.id === 'father_fixed');
      if (existingFatherObj) {
        existingFatherObj.collectiveFractionValue += fatherResidueFraction;
        existingFatherObj.collectiveFractionStr = formatFraction(existingFatherObj.collectiveFractionValue * baseDen, baseDen);
        existingFatherObj.percentageStr = `${(existingFatherObj.collectiveFractionValue * 100).toFixed(2)}%`;
        existingFatherObj.percentageValue = parseFloat((existingFatherObj.collectiveFractionValue * 100).toFixed(2));
        existingFatherObj.monetaryShare = Math.round(existingFatherObj.collectiveFractionValue * netDistributableEstate * 100) / 100;
        existingFatherObj.category = 'Fixed + Residuary';
      } else {
        eligibleHeirs.push({
          id: 'father_pure_residuary', heirName: 'Father', relationship: 'Father', category: 'Residuary (\'Asabah)', count: 1,
          individualFractionStr: formatFraction(fatherResidueFraction * baseDen, baseDen), collectiveFractionStr: formatFraction(fatherResidueFraction * baseDen, baseDen), collectiveFractionValue: fatherResidueFraction,
          percentageStr: `${(fatherResidueFraction * 100).toFixed(2)}%`, percentageValue: parseFloat((fatherResidueFraction * 100).toFixed(2)),
          monetaryShare: Math.round(fatherResidueFraction * netDistributableEstate * 100) / 100, quranicReference: 'Surah An-Nisa 4:11', notes: 'Takes remaining residue.'
        });
      }
      residueNumerator = 0;
    }
  }

  if (!isAwl && residueNumerator > 0) {
    const nonSpouseFixedHeirs = eligibleHeirs.filter(h => h.id !== 'husband' && h.id !== 'wife');
    if (nonSpouseFixedHeirs.length > 0) {
      isRadd = true;
      residueDistributedTo = 'Redistributed to Non-Spouse Fixed Sharers (Radd)';
      const nonSpouseSumFraction = nonSpouseFixedHeirs.reduce((acc, h) => acc + h.collectiveFractionValue, 0);
      const spouseFraction = 1.0 - (residueNumerator / baseDen) - nonSpouseSumFraction;
      const availableForRadd = 1.0 - spouseFraction;

      nonSpouseFixedHeirs.forEach(h => {
        const raddProportion = h.collectiveFractionValue / nonSpouseSumFraction;
        h.collectiveFractionValue = raddProportion * availableForRadd;
        h.collectiveFractionStr = formatFraction(h.collectiveFractionValue * baseDen, baseDen);
        h.percentageStr = `${(h.collectiveFractionValue * 100).toFixed(2)}%`;
        h.percentageValue = parseFloat((h.collectiveFractionValue * 100).toFixed(2));
        h.monetaryShare = Math.round(h.collectiveFractionValue * netDistributableEstate * 100) / 100;
        h.category = 'Radd Adjusted';
      });
      residueNumerator = 0;
    }
  }

  const totalAllocatedPercentage = eligibleHeirs.reduce((acc, h) => acc + h.percentageValue, 0);
  const totalAllocatedMonetary = eligibleHeirs.reduce((acc, h) => acc + (h.monetaryShare || 0), 0);
  const totalAllocatedFraction = eligibleHeirs.reduce((acc, h) => acc + h.collectiveFractionValue, 0);
  const reconciled = Math.abs(totalAllocatedFraction - 1.0) < 0.005;

  const legalNotice = input.jurisdiction === 'india'
    ? 'Legal & Personal Law Notice (India): This calculator provides an indicative inheritance calculation based on Muslim Personal Law Application Act, 1937. It does not substitute for formal legal advice or judicial decree.'
    : 'General Legal Notice: Indicative calculation based on Fara\'id rules.';

  return {
    success: reconciled && eligibleHeirs.length > 0,
    caseSummary: {
      deceasedGender: input.deceasedGender === 'male' ? 'Male Deceased' : 'Female Deceased',
      dateOfDeath: input.dateOfDeath || 'Not specified',
      madhhabName,
      jurisdiction: input.jurisdiction === 'india' ? 'India (Muslim Personal Law 1937)' : 'Other',
      grossEstate: gross, totalDeductions, funeralExpenses: funeral, debts, wasiyyah: finalBequest, otherDeductions: otherDed, netDistributableEstate, hasMonetaryCalculation: gross > 0
    },
    eligibleHeirs, excludedHeirs,
    calculationSummary: {
      baseDenominator: baseDen, adjustedDenominator: finalBaseDen,
      fixedSharesSumFractionStr: formatFraction(sumFixedNumerator, baseDen), fixedSharesSumValue: sumFixedNumerator / baseDen,
      isAwlApplied: isAwl, isRaddApplied: isRadd, residueFractionStr: formatFraction(baseDen - sumFixedNumerator, baseDen), residueFractionValue: Math.max(0, (baseDen - sumFixedNumerator) / baseDen),
      residueDistributedTo, totalAllocatedPercentage: parseFloat(totalAllocatedPercentage.toFixed(2)), totalAllocatedMonetary: Math.round(totalAllocatedMonetary * 100) / 100, reconciled
    },
    stepByStepExplanation: steps, legalNotice, warnings,
    errorMessage: !reconciled ? 'Calculation could not reconcile to 100%.' : undefined
  };
}

function createErrorResult(msg: string): IslamicInheritanceResult {
  return {
    success: false,
    caseSummary: { deceasedGender: 'Unknown', dateOfDeath: 'Not specified', madhhabName: 'Unspecified', jurisdiction: 'Unspecified', grossEstate: 0, totalDeductions: 0, funeralExpenses: 0, debts: 0, wasiyyah: 0, otherDeductions: 0, netDistributableEstate: 0, hasMonetaryCalculation: false },
    eligibleHeirs: [], excludedHeirs: [],
    calculationSummary: { baseDenominator: 0, adjustedDenominator: 0, fixedSharesSumFractionStr: '0', fixedSharesSumValue: 0, isAwlApplied: false, isRaddApplied: false, residueFractionStr: '0', residueFractionValue: 0, residueDistributedTo: 'None', totalAllocatedPercentage: 0, totalAllocatedMonetary: 0, reconciled: false },
    stepByStepExplanation: [], legalNotice: '', warnings: [msg], errorMessage: msg
  };
}
