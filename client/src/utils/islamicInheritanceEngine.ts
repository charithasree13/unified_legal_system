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
  paternalGrandfatherAlive?: boolean; // True grandfather
  paternalGrandmotherAlive?: boolean; // True grandmother
  maternalGrandmotherAlive?: boolean; // True grandmother

  // Siblings
  fullBrothersCount?: number;
  fullSistersCount?: number;
  consanguineBrothersCount?: number; // Paternal brothers
  consanguineSistersCount?: number; // Paternal sisters
  uterineBrothersCount?: number; // Maternal brothers
  uterineSistersCount?: number; // Maternal sisters

  // Advanced / Other Relatives
  fullBrotherSonsCount?: number; // Nephews (Full brother's son)
  paternalUnclesCount?: number; // Paternal uncles
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
    adjustedDenominator: number; // In case of 'Awl or Radd
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

// Helper: Greatest Common Divisor
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

// Helper: Least Common Multiple
function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

// Simplify Fraction Representation
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

  // 1. Inputs Validation
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
    warnings.push('Selected framework is Shia – Ja\'fari. Note: The current calculation engine strictly implements standard Sunni Hanafi Fara\'id rules. Shia inheritance follows different class groupings (Tabaqat). Calculation generated uses Sunni Hanafi baseline rules.');
  }

  // Validate Non-Negative Inputs
  if (
    (input.grossEstateValue && input.grossEstateValue < 0) ||
    (input.funeralExpenses && input.funeralExpenses < 0) ||
    (input.outstandingDebts && input.outstandingDebts < 0) ||
    (input.validBequest && input.validBequest < 0) ||
    (input.otherDeductions && input.otherDeductions < 0) ||
    (input.wivesCount && input.wivesCount < 0) ||
    (input.sonsCount && input.sonsCount < 0) ||
    (input.daughtersCount && input.daughtersCount < 0) ||
    (input.grandsonsCount && input.grandsonsCount < 0) ||
    (input.granddaughtersCount && input.granddaughtersCount < 0) ||
    (input.fullBrothersCount && input.fullBrothersCount < 0) ||
    (input.fullSistersCount && input.fullSistersCount < 0) ||
    (input.consanguineBrothersCount && input.consanguineBrothersCount < 0) ||
    (input.consanguineSistersCount && input.consanguineSistersCount < 0) ||
    (input.uterineBrothersCount && input.uterineBrothersCount < 0) ||
    (input.uterineSistersCount && input.uterineSistersCount < 0)
  ) {
    return createErrorResult('Negative numeric values or counts are not allowed.');
  }

  // Male / Female Spouse Compatibility Check
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

  // 2. Estate Calculation
  const gross = Math.max(0, input.grossEstateValue || 0);
  const funeral = Math.max(0, input.funeralExpenses || 0);
  const debts = Math.max(0, input.outstandingDebts || 0);
  const reqBequest = Math.max(0, input.validBequest || 0);
  const otherDed = Math.max(0, input.otherDeductions || 0);

  const estateAfterFuneralAndDebts = Math.max(0, gross - funeral - debts - otherDed);

  // Wasiyyah Rule: Cannot exceed 1/3 of estate remaining after debts & funeral expenses (unless approved by heirs)
  const maxAllowableBequest = estateAfterFuneralAndDebts / 3;
  let finalBequest = reqBequest;
  if (reqBequest > maxAllowableBequest && estateAfterFuneralAndDebts > 0) {
    finalBequest = maxAllowableBequest;
    warnings.push(`Specified Wasiyyah (₹${reqBequest.toLocaleString('en-IN')}) exceeds the 1/3 legal limit (₹${maxAllowableBequest.toLocaleString('en-IN')}). Capped at 1/3 per Islamic Fara'id rules unless all heirs consent.`);
  }

  const totalDeductions = funeral + debts + finalBequest + otherDed;
  const netDistributableEstate = Math.max(0, gross - totalDeductions);

  if (gross > 0 && totalDeductions > gross) {
    return createErrorResult(`Total deductions (₹${totalDeductions.toLocaleString('en-IN')}) exceed the gross estate value (₹${gross.toLocaleString('en-IN')}). Estate is insolvent.`);
  }

  steps.push(`Step 1: Estate Accounting — Gross Estate: ₹${gross.toLocaleString('en-IN')} | Deductions (Funeral: ₹${funeral.toLocaleString('en-IN')}, Debts: ₹${debts.toLocaleString('en-IN')}, Valid Wasiyyah: ₹${finalBequest.toLocaleString('en-IN')}): ₹${totalDeductions.toLocaleString('en-IN')} → Net Distributable Estate: ₹${netDistributableEstate.toLocaleString('en-IN')}.`);

  // 3. Heir Existence Flags
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
  const fBrotherSons = input.fullBrotherSonsCount || 0;
  const pUncles = input.paternalUnclesCount || 0;

  // Descendants Check
  const hasMaleDescendants = sons > 0 || grandsons > 0;
  const hasDescendants = sons > 0 || daughters > 0 || grandsons > 0 || granddaughters > 0;

  // Total Siblings Count (Used for Mother's reduction)
  const totalSiblings = fBrothers + fSisters + cBrothers + cSisters + uBrothers + uSisters;

  if (
    wives === 0 && husband === 0 && sons === 0 && daughters === 0 && 
    grandsons === 0 && granddaughters === 0 && father === 0 && mother === 0 && 
    pGrandfather === 0 && pGrandmother === 0 && mGrandmother === 0 && 
    totalSiblings === 0 && fBrotherSons === 0 && pUncles === 0
  ) {
    return createErrorResult('Please select at least one surviving heir to perform calculation.');
  }

  // 4. Determine Exclusions (Hajb)
  steps.push(`Step 2: Heir Exclusion (Hajb) Analysis — Evaluating primary & secondary heir relationships under ${madhhabName}.`);

  // Blocking Rules:
  // Sons block grandsons and granddaughters
  if (sons > 0) {
    if (grandsons > 0) excludedHeirs.push({ heirName: 'Grandson(s) (Son\'s Son)', relationship: 'Son\'s Son', count: grandsons, reason: 'Excluded by surviving Son(s)', blockingHeir: 'Son' });
    if (granddaughters > 0) excludedHeirs.push({ heirName: 'Granddaughter(s) (Son\'s Daughter)', relationship: 'Son\'s Daughter', count: granddaughters, reason: 'Excluded by surviving Son(s)', blockingHeir: 'Son' });
  }

  // Father blocks Grandfather and Paternal Grandmother and ALL Siblings and Nephews/Uncles
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

  // Male descendants (Son / Son's Son) block ALL Siblings
  if (hasMaleDescendants) {
    const blockerName = sons > 0 ? 'Son(s)' : 'Grandson(s)';
    if (father === 0) { // Avoid duplicate log
      if (fBrothers > 0) excludedHeirs.push({ heirName: 'Full Brother(s)', relationship: 'Full Brother', count: fBrothers, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
      if (fSisters > 0) excludedHeirs.push({ heirName: 'Full Sister(s)', relationship: 'Full Sister', count: fSisters, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
      if (cBrothers > 0) excludedHeirs.push({ heirName: 'Consanguine Brother(s)', relationship: 'Consanguine Brother', count: cBrothers, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
      if (cSisters > 0) excludedHeirs.push({ heirName: 'Consanguine Sister(s)', relationship: 'Consanguine Sister', count: cSisters, reason: `Excluded by surviving ${blockerName}`, blockingHeir: blockerName });
    }
    if (uBrothers > 0 && father === 0) excludedHeirs.push({ heirName: 'Uterine Brother(s)', relationship: 'Uterine Brother', count: uBrothers, reason: `Excluded by surviving male descendant (${blockerName})`, blockingHeir: blockerName });
    if (uSisters > 0 && father === 0) excludedHeirs.push({ heirName: 'Uterine Sister(s)', relationship: 'Uterine Sister', count: uSisters, reason: `Excluded by surviving male descendant (${blockerName})`, blockingHeir: blockerName });
  }

  // Female descendants (Daughter / Son's Daughter) block Uterine Siblings
  if ((daughters > 0 || granddaughters > 0) && !hasMaleDescendants && father === 0) {
    const femaleBlocker = daughters > 0 ? 'Daughter(s)' : 'Granddaughter(s)';
    if (uBrothers > 0) excludedHeirs.push({ heirName: 'Uterine Brother(s)', relationship: 'Uterine Brother', count: uBrothers, reason: `Excluded by surviving female descendant (${femaleBlocker})`, blockingHeir: femaleBlocker });
    if (uSisters > 0) excludedHeirs.push({ heirName: 'Uterine Sister(s)', relationship: 'Uterine Sister', count: uSisters, reason: `Excluded by surviving female descendant (${femaleBlocker})`, blockingHeir: femaleBlocker });
  }

  // Mother blocks both Grandmothers
  if (mother > 0) {
    if (mGrandmother > 0) excludedHeirs.push({ heirName: 'Maternal Grandmother', relationship: 'Maternal Grandmother', count: mGrandmother, reason: 'Excluded by surviving Mother', blockingHeir: 'Mother' });
    if (pGrandmother > 0 && father === 0) excludedHeirs.push({ heirName: 'Paternal Grandmother', relationship: 'Paternal Grandmother', count: pGrandmother, reason: 'Excluded by surviving Mother', blockingHeir: 'Mother' });
  }

  // Full Brother blocks Consanguine siblings
  if (fBrothers > 0 && !hasMaleDescendants && father === 0) {
    if (cBrothers > 0) excludedHeirs.push({ heirName: 'Consanguine Brother(s)', relationship: 'Consanguine Brother', count: cBrothers, reason: 'Excluded by surviving Full Brother(s)', blockingHeir: 'Full Brother' });
    if (cSisters > 0) excludedHeirs.push({ heirName: 'Consanguine Sister(s)', relationship: 'Consanguine Sister', count: cSisters, reason: 'Excluded by surviving Full Brother(s)', blockingHeir: 'Full Brother' });
  }

  // 2+ Daughters block Son's Daughters UNLESS Son's Son is present
  if (daughters >= 2 && sons === 0 && grandsons === 0 && granddaughters > 0) {
    excludedHeirs.push({ heirName: 'Granddaughter(s) (Son\'s Daughter)', relationship: 'Son\'s Daughter', count: granddaughters, reason: 'Excluded because 2+ daughters exhaust the 2/3 female descendant quota and no Son\'s Son is present to make them residuary', blockingHeir: 'Daughters (2+)' });
  }

  // 5. Calculate Fixed Shares (Fard)
  // Store raw fixed shares as fractions (numerator / denominator)
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

  // SPOUSE SHARES
  if (husband > 0) {
    // 1/2 if no children/grandchildren, 1/4 if children/grandchildren exist
    const num = 1;
    const den = hasDescendants ? 4 : 2;
    rawFixedShares.push({
      id: 'husband',
      heirName: 'Husband',
      relationship: 'Husband',
      count: 1,
      num, den,
      quranicRef: 'Surah An-Nisa 4:12',
      notes: hasDescendants ? 'Receives 1/4 share due to presence of surviving children/grandchildren.' : 'Receives 1/2 share due to absence of surviving children/grandchildren.'
    });
  } else if (wives > 0) {
    // 1/4 if no children/grandchildren, 1/8 if children/grandchildren exist
    const num = 1;
    const den = hasDescendants ? 8 : 4;
    rawFixedShares.push({
      id: 'wife',
      heirName: wives > 1 ? `Wives (${wives})` : 'Wife',
      relationship: 'Wife',
      count: wives,
      num, den,
      quranicRef: 'Surah An-Nisa 4:12',
      notes: wives > 1 ? `Collective share of ${formatFraction(num, den)} divided equally among ${wives} wives (${formatFraction(num, den * wives)} each).` : `Receives ${formatFraction(num, den)} share.`
    });
  }

  // MOTHER SHARE
  if (mother > 0) {
    // Mother receives 1/6 if descendants exist OR total siblings >= 2. Otherwise 1/3.
    // Special Umariyyatan case check: Spouse + Mother + Father (No children, no siblings)
    const isUmariyyatan = (husband > 0 || wives > 0) && father > 0 && !hasDescendants && totalSiblings === 0;
    if (isUmariyyatan) {
      // Mother gets 1/3 of Remainder after spouse share
      const spouseDen = husband > 0 ? 2 : 4;
      // Remainder = 1 - 1/spouseDen = (spouseDen - 1)/spouseDen. Mother = 1/3 of remainder = (spouseDen - 1) / (3 * spouseDen)
      const num = spouseDen - 1;
      const den = 3 * spouseDen;
      rawFixedShares.push({
        id: 'mother',
        heirName: 'Mother',
        relationship: 'Mother',
        count: 1,
        num, den,
        quranicRef: 'Surah An-Nisa 4:11 (Umariyyatan Consensus)',
        notes: `Special Umariyyatan decision: Mother receives 1/3 of remainder after spouse share (${formatFraction(num, den)} of total estate).`
      });
    } else {
      const num = 1;
      const den = (hasDescendants || totalSiblings >= 2) ? 6 : 3;
      rawFixedShares.push({
        id: 'mother',
        heirName: 'Mother',
        relationship: 'Mother',
        count: 1,
        num, den,
        quranicRef: 'Surah An-Nisa 4:11',
        notes: (hasDescendants || totalSiblings >= 2) ? 'Receives 1/6 share due to presence of descendants or multiple siblings.' : 'Receives 1/3 share.'
      });
    }
  }

  // FATHER SHARE (As Fixed Sharer)
  if (father > 0) {
    if (hasMaleDescendants) {
      // Father gets 1/6 fixed share when male descendant is present
      rawFixedShares.push({
        id: 'father_fixed',
        heirName: 'Father',
        relationship: 'Father',
        count: 1,
        num: 1, den: 6,
        quranicRef: 'Surah An-Nisa 4:11',
        notes: 'Receives 1/6 fixed share due to presence of male descendant.'
      });
    } else if (daughters > 0 || (sons === 0 && grandsons === 0 && granddaughters > 0)) {
      // Father gets 1/6 fixed share PLUS acts as residuary for any remaining estate
      rawFixedShares.push({
        id: 'father_fixed_and_residuary',
        heirName: 'Father',
        relationship: 'Father',
        count: 1,
        num: 1, den: 6,
        quranicRef: 'Surah An-Nisa 4:11',
        notes: 'Receives 1/6 fixed share plus residue (\'Asabah) as closer male relative.'
      });
    }
    // If no descendants exist at all, Father inherits purely as Residuary ('Asabah)
  }

  // GRANDPARENTS (When not blocked)
  if (father === 0 && pGrandfather > 0) {
    if (hasMaleDescendants) {
      rawFixedShares.push({
        id: 'pGrandfather',
        heirName: 'Paternal Grandfather',
        relationship: 'Paternal Grandfather',
        count: 1,
        num: 1, den: 6,
        quranicRef: 'Fiqh Precedent (In place of Father)',
        notes: 'Takes Father\'s 1/6 fixed share in his absence.'
      });
    }
  }

  if (mother === 0) {
    let eligibleGrandmothers = 0;
    if (mGrandmother > 0) eligibleGrandmothers++;
    if (pGrandmother > 0 && father === 0) eligibleGrandmothers++;
    
    if (eligibleGrandmothers > 0) {
      rawFixedShares.push({
        id: 'grandmothers',
        heirName: eligibleGrandmothers > 1 ? 'Maternal & Paternal Grandmothers' : (mGrandmother > 0 ? 'Maternal Grandmother' : 'Paternal Grandmother'),
        relationship: 'Grandmother',
        count: eligibleGrandmothers,
        num: 1, den: 6,
        quranicRef: 'Sunnah / Hadith Precedent',
        notes: eligibleGrandmothers > 1 ? `1/6 collective share split equally between ${eligibleGrandmothers} grandmothers.` : 'Receives 1/6 fixed share.'
      });
    }
  }

  // DAUGHTERS (When no Sons present)
  if (sons === 0 && daughters > 0) {
    if (daughters === 1) {
      rawFixedShares.push({
        id: 'daughters',
        heirName: 'Daughter',
        relationship: 'Daughter',
        count: 1,
        num: 1, den: 2,
        quranicRef: 'Surah An-Nisa 4:11',
        notes: 'Single daughter receives 1/2 fixed share.'
      });
    } else {
      rawFixedShares.push({
        id: 'daughters',
        heirName: `Daughters (${daughters})`,
        relationship: 'Daughter',
        count: daughters,
        num: 2, den: 3,
        quranicRef: 'Surah An-Nisa 4:11',
        notes: `Multiple daughters share 2/3 fixed share equally (${formatFraction(2, 3 * daughters)} each).`
      });
    }
  }

  // SON'S DAUGHTERS (When no Sons and no Grandsons present)
  if (sons === 0 && grandsons === 0 && granddaughters > 0) {
    if (daughters === 0) {
      // Acts like daughters: 1 = 1/2, 2+ = 2/3
      if (granddaughters === 1) {
        rawFixedShares.push({
          id: 'granddaughters',
          heirName: 'Granddaughter (Son\'s Daughter)',
          relationship: 'Son\'s Daughter',
          count: 1,
          num: 1, den: 2,
          quranicRef: 'Fiqh Consensus (In place of Daughter)',
          notes: 'Single granddaughter takes 1/2 fixed share in absence of daughters.'
        });
      } else {
        rawFixedShares.push({
          id: 'granddaughters',
          heirName: `Granddaughters (${granddaughters})`,
          relationship: 'Son\'s Daughter',
          count: granddaughters,
          num: 2, den: 3,
          quranicRef: 'Fiqh Consensus (In place of Daughters)',
          notes: `Multiple granddaughters share 2/3 fixed share equally (${formatFraction(2, 3 * granddaughters)} each).`
        });
      }
    } else if (daughters === 1) {
      // 1 Daughter (1/2) + Son's Daughter(s) (1/6 to complete 2/3 female quota)
      rawFixedShares.push({
        id: 'granddaughters',
        heirName: granddaughters > 1 ? `Granddaughters (${granddaughters})` : 'Granddaughter (Son\'s Daughter)',
        relationship: 'Son\'s Daughter',
        count: granddaughters,
        num: 1, den: 6,
        quranicRef: 'Hadith Precedent (Takmilat al-Thuluthain)',
        notes: `Takes 1/6 share to complete the 2/3 female descendant quota alongside 1 daughter.`
      });
    }
  }

  // FULL SISTERS (When no Sons, Grandsons, Father, Grandfather, or Full Brothers present)
  if (!hasMaleDescendants && father === 0 && pGrandfather === 0 && fBrothers === 0 && fSisters > 0) {
    if (daughters === 0 && granddaughters === 0) { // Only fixed sharer sisters if no female descendants
      if (fSisters === 1) {
        rawFixedShares.push({
          id: 'fullSisters',
          heirName: 'Full Sister',
          relationship: 'Full Sister',
          count: 1,
          num: 1, den: 2,
          quranicRef: 'Surah An-Nisa 4:176',
          notes: 'Single full sister receives 1/2 fixed share in absence of closer male/female heirs.'
        });
      } else {
        rawFixedShares.push({
          id: 'fullSisters',
          heirName: `Full Sisters (${fSisters})`,
          relationship: 'Full Sister',
          count: fSisters,
          num: 2, den: 3,
          quranicRef: 'Surah An-Nisa 4:176',
          notes: `Multiple full sisters share 2/3 fixed share equally (${formatFraction(2, 3 * fSisters)} each).`
        });
      }
    }
  }

  // UTERINE SIBLINGS (When no descendants, Father, or Grandfather present)
  if (!hasDescendants && father === 0 && pGrandfather === 0) {
    const totalUterine = uBrothers + uSisters;
    if (totalUterine === 1) {
      const uName = uBrothers === 1 ? 'Uterine Brother' : 'Uterine Sister';
      rawFixedShares.push({
        id: 'uterineSiblings',
        heirName: uName,
        relationship: 'Uterine Sibling',
        count: 1,
        num: 1, den: 6,
        quranicRef: 'Surah An-Nisa 4:12',
        notes: 'Single uterine sibling receives 1/6 fixed share.'
      });
    } else if (totalUterine > 1) {
      rawFixedShares.push({
        id: 'uterineSiblings',
        heirName: `Uterine Siblings (${totalUterine})`,
        relationship: 'Uterine Sibling',
        count: totalUterine,
        num: 1, den: 3,
        quranicRef: 'Surah An-Nisa 4:12',
        notes: `Multiple uterine siblings share 1/3 fixed share equally regardless of gender (${formatFraction(1, 3 * totalUterine)} each).`
      });
    }
  }

  // 6. Common Denominator & Sum of Fixed Shares
  let baseDen = 1;
  rawFixedShares.forEach(s => {
    baseDen = lcm(baseDen, s.den);
  });
  if (baseDen === 1 && rawFixedShares.length > 0) baseDen = 12;

  let sumFixedNumerator = 0;
  rawFixedShares.forEach(s => {
    sumFixedNumerator += s.num * (baseDen / s.den);
  });

  steps.push(`Step 3: Fixed Shares (Fard) Evaluation — Calculated base common denominator: ${baseDen}. Sum of fixed shares numerator = ${sumFixedNumerator}/${baseDen} (${(sumFixedNumerator / baseDen * 100).toFixed(2)}%).`);

  // 7. Check 'Awl vs Residuary ('Asabah) vs Radd
  let finalBaseDen = baseDen;
  let isAwl = false;
  let isRadd = false;
  let residueNumerator = baseDen - sumFixedNumerator;

  // A. 'AWL (Proportional Reduction if fixed shares > 1)
  if (sumFixedNumerator > baseDen) {
    isAwl = true;
    finalBaseDen = sumFixedNumerator; // Expand base to sum numerator
    residueNumerator = 0;
    warnings.push(`'Awl applied: The total fixed shares (${sumFixedNumerator}/${baseDen}) exceed the available estate. The base denominator has been expanded to ${finalBaseDen} to proportionally adjust all fixed shares without exceeding 100%.`);
    steps.push(`Step 4: 'Awl Adjustment — Base denominator increased from ${baseDen} to ${finalBaseDen}. All fixed shares reduced proportionally.`);
  }

  // Add Fixed Sharers to Eligible List
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
      notes: isAwl ? `${s.notes} (Adjusted by 'Awl to ${formatFraction(numInBase, finalBaseDen)}).` : s.notes
    });
  });

  // B. RESIDUARY ('ASABAH) CALCULATION (If residue exists and residuary heirs are present)
  let residueDistributedTo = 'None';

  if (!isAwl && residueNumerator > 0) {
    steps.push(`Step 4: Residuary ('Asabah) Allocation — Remaining estate residue = ${residueNumerator}/${baseDen} (${(residueNumerator / baseDen * 100).toFixed(2)}%).`);

    // Priority 1: Sons + Daughters (Co-residuaries, 2:1 ratio)
    if (sons > 0) {
      residueDistributedTo = 'Sons and Daughters';
      const totalUnits = (sons * 2) + daughters;
      const residueSharePerUnit = (residueNumerator / baseDen) / totalUnits;

      if (sons > 0) {
        const sonCollectiveFraction = (sons * 2 * residueSharePerUnit);
        const sonIndFraction = sonCollectiveFraction / sons;
        eligibleHeirs.push({
          id: 'sons_residuary',
          heirName: sons > 1 ? `Sons (${sons})` : 'Son',
          relationship: 'Son',
          category: 'Residuary (\'Asabah)',
          count: sons,
          individualFractionStr: formatFraction(sonIndFraction * baseDen, baseDen),
          collectiveFractionStr: formatFraction(sonCollectiveFraction * baseDen, baseDen),
          collectiveFractionValue: sonCollectiveFraction,
          percentageStr: `${(sonCollectiveFraction * 100).toFixed(2)}%`,
          percentageValue: parseFloat((sonCollectiveFraction * 100).toFixed(2)),
          monetaryShare: Math.round(sonCollectiveFraction * netDistributableEstate * 100) / 100,
          quranicReference: 'Surah An-Nisa 4:11',
          notes: daughters > 0 ? `Receives 2x share of daughter as co-residuary ('Asabah bi Ghairihi).` : 'Receives remaining estate as primary residuary (\'Asabah bi Nafsihi).'
        });
      }

      if (daughters > 0) {
        const daughterCollectiveFraction = (daughters * residueSharePerUnit);
        const daughterIndFraction = daughterCollectiveFraction / daughters;
        eligibleHeirs.push({
          id: 'daughters_residuary',
          heirName: daughters > 1 ? `Daughters (${daughters})` : 'Daughter',
          relationship: 'Daughter',
          category: 'Residuary (\'Asabah)',
          count: daughters,
          individualFractionStr: formatFraction(daughterIndFraction * baseDen, baseDen),
          collectiveFractionStr: formatFraction(daughterCollectiveFraction * baseDen, baseDen),
          collectiveFractionValue: daughterCollectiveFraction,
          percentageStr: `${(daughterCollectiveFraction * 100).toFixed(2)}%`,
          percentageValue: parseFloat((daughterCollectiveFraction * 100).toFixed(2)),
          monetaryShare: Math.round(daughterCollectiveFraction * netDistributableEstate * 100) / 100,
          quranicReference: 'Surah An-Nisa 4:11',
          notes: 'Made residuary alongside son (\'Asabah bi Ghairihi), receiving 1 unit per daughter.'
        });
      }
      residueNumerator = 0; // Fully allocated
    }

    // Priority 2: Son's Sons + Son's Daughters (If no Sons)
    else if (grandsons > 0 && residueNumerator > 0) {
      residueDistributedTo = 'Grandson(s) & Granddaughter(s)';
      const totalUnits = (grandsons * 2) + granddaughters;
      const residueSharePerUnit = (residueNumerator / baseDen) / totalUnits;

      const grandsonCollectiveFraction = (grandsons * 2 * residueSharePerUnit);
      eligibleHeirs.push({
        id: 'grandsons_residuary',
        heirName: grandsons > 1 ? `Grandsons (${grandsons})` : 'Grandson (Son\'s Son)',
        relationship: 'Son\'s Son',
        category: 'Residuary (\'Asabah)',
        count: grandsons,
        individualFractionStr: formatFraction(grandsonCollectiveFraction / grandsons * baseDen, baseDen),
        collectiveFractionStr: formatFraction(grandsonCollectiveFraction * baseDen, baseDen),
        collectiveFractionValue: grandsonCollectiveFraction,
        percentageStr: `${(grandsonCollectiveFraction * 100).toFixed(2)}%`,
        percentageValue: parseFloat((grandsonCollectiveFraction * 100).toFixed(2)),
        monetaryShare: Math.round(grandsonCollectiveFraction * netDistributableEstate * 100) / 100,
        quranicReference: 'Fiqh Precedent (\'Asabah)',
        notes: 'Takes residue as secondary male descendant.'
      });

      if (granddaughters > 0) {
        const gdCollectiveFraction = (granddaughters * residueSharePerUnit);
        eligibleHeirs.push({
          id: 'granddaughters_residuary',
          heirName: granddaughters > 1 ? `Granddaughters (${granddaughters})` : 'Granddaughter (Son\'s Daughter)',
          relationship: 'Son\'s Daughter',
          category: 'Residuary (\'Asabah)',
          count: granddaughters,
          individualFractionStr: formatFraction(gdCollectiveFraction / granddaughters * baseDen, baseDen),
          collectiveFractionStr: formatFraction(gdCollectiveFraction * baseDen, baseDen),
          collectiveFractionValue: gdCollectiveFraction,
          percentageStr: `${(gdCollectiveFraction * 100).toFixed(2)}%`,
          percentageValue: parseFloat((gdCollectiveFraction * 100).toFixed(2)),
          monetaryShare: Math.round(gdCollectiveFraction * netDistributableEstate * 100) / 100,
          quranicReference: 'Fiqh Precedent (\'Asabah)',
          notes: 'Made residuary by presence of grandson.'
        });
      }
      residueNumerator = 0;
    }

    // Priority 3: Father (When no male descendants exist)
    else if (father > 0 && residueNumerator > 0) {
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
        existingFatherObj.notes = 'Combines 1/6 fixed share plus remaining estate residue as closest male ascendant.';
      } else {
        eligibleHeirs.push({
          id: 'father_pure_residuary',
          heirName: 'Father',
          relationship: 'Father',
          category: 'Residuary (\'Asabah)',
          count: 1,
          individualFractionStr: formatFraction(fatherResidueFraction * baseDen, baseDen),
          collectiveFractionStr: formatFraction(fatherResidueFraction * baseDen, baseDen),
          collectiveFractionValue: fatherResidueFraction,
          percentageStr: `${(fatherResidueFraction * 100).toFixed(2)}%`,
          percentageValue: parseFloat((fatherResidueFraction * 100).toFixed(2)),
          monetaryShare: Math.round(fatherResidueFraction * netDistributableEstate * 100) / 100,
          quranicReference: 'Surah An-Nisa 4:11 (\'Asabah)',
          notes: 'Takes entire remaining estate residue in absence of descendants.'
        });
      }
      residueNumerator = 0;
    }

    // Priority 4: Paternal Grandfather (If Father absent)
    else if (pGrandfather > 0 && father === 0 && residueNumerator > 0) {
      residueDistributedTo = 'Paternal Grandfather';
      const pgResidueFraction = (residueNumerator / baseDen);
      const existingPg = eligibleHeirs.find(h => h.id === 'pGrandfather');
      if (existingPg) {
        existingPg.collectiveFractionValue += pgResidueFraction;
        existingPg.collectiveFractionStr = formatFraction(existingPg.collectiveFractionValue * baseDen, baseDen);
        existingPg.percentageStr = `${(existingPg.collectiveFractionValue * 100).toFixed(2)}%`;
        existingPg.percentageValue = parseFloat((existingPg.collectiveFractionValue * 100).toFixed(2));
        existingPg.monetaryShare = Math.round(existingPg.collectiveFractionValue * netDistributableEstate * 100) / 100;
        existingPg.category = 'Fixed + Residuary';
      } else {
        eligibleHeirs.push({
          id: 'pGrandfather_residuary',
          heirName: 'Paternal Grandfather',
          relationship: 'Paternal Grandfather',
          category: 'Residuary (\'Asabah)',
          count: 1,
          individualFractionStr: formatFraction(pgResidueFraction * baseDen, baseDen),
          collectiveFractionStr: formatFraction(pgResidueFraction * baseDen, baseDen),
          collectiveFractionValue: pgResidueFraction,
          percentageStr: `${(pgResidueFraction * 100).toFixed(2)}%`,
          percentageValue: parseFloat((pgResidueFraction * 100).toFixed(2)),
          monetaryShare: Math.round(pgResidueFraction * netDistributableEstate * 100) / 100,
          quranicReference: 'Fiqh Precedent (\'Asabah)',
          notes: 'Takes residue as true grandfather in absence of Father.'
        });
      }
      residueNumerator = 0;
    }

    // Priority 5: Full Brothers & Full Sisters (If no Sons, Grandsons, Father, Grandfather)
    else if (fBrothers > 0 && father === 0 && pGrandfather === 0 && residueNumerator > 0) {
      residueDistributedTo = 'Full Brother(s) & Full Sister(s)';
      const totalUnits = (fBrothers * 2) + fSisters;
      const residueSharePerUnit = (residueNumerator / baseDen) / totalUnits;

      const fbCollectiveFraction = (fBrothers * 2 * residueSharePerUnit);
      eligibleHeirs.push({
        id: 'fullBrothers_residuary',
        heirName: fBrothers > 1 ? `Full Brothers (${fBrothers})` : 'Full Brother',
        relationship: 'Full Brother',
        category: 'Residuary (\'Asabah)',
        count: fBrothers,
        individualFractionStr: formatFraction(fbCollectiveFraction / fBrothers * baseDen, baseDen),
        collectiveFractionStr: formatFraction(fbCollectiveFraction * baseDen, baseDen),
        collectiveFractionValue: fbCollectiveFraction,
        percentageStr: `${(fbCollectiveFraction * 100).toFixed(2)}%`,
        percentageValue: parseFloat((fbCollectiveFraction * 100).toFixed(2)),
        monetaryShare: Math.round(fbCollectiveFraction * netDistributableEstate * 100) / 100,
        quranicReference: 'Surah An-Nisa 4:176',
        notes: 'Takes residue as collaterals (\'Asabah bi Nafsihi).'
      });

      if (fSisters > 0) {
        const fsCollectiveFraction = (fSisters * residueSharePerUnit);
        eligibleHeirs.push({
          id: 'fullSisters_residuary',
          heirName: fSisters > 1 ? `Full Sisters (${fSisters})` : 'Full Sister',
          relationship: 'Full Sister',
          category: 'Residuary (\'Asabah)',
          count: fSisters,
          individualFractionStr: formatFraction(fsCollectiveFraction / fSisters * baseDen, baseDen),
          collectiveFractionStr: formatFraction(fsCollectiveFraction * baseDen, baseDen),
          collectiveFractionValue: fsCollectiveFraction,
          percentageStr: `${(fsCollectiveFraction * 100).toFixed(2)}%`,
          percentageValue: parseFloat((fsCollectiveFraction * 100).toFixed(2)),
          monetaryShare: Math.round(fsCollectiveFraction * netDistributableEstate * 100) / 100,
          quranicReference: 'Surah An-Nisa 4:176',
          notes: 'Made residuary alongside full brother(s) (\'Asabah bi Ghairihi).'
        });
      }
      residueNumerator = 0;
    }

    // Priority 6: Full Sister(s) as 'Asabah ma'a al-Ghair (When daughters/granddaughters present, no male collaterals)
    else if (fSisters > 0 && (daughters > 0 || granddaughters > 0) && fBrothers === 0 && father === 0 && pGrandfather === 0 && residueNumerator > 0) {
      residueDistributedTo = 'Full Sister(s) (\'Asabah ma\'a Ghairihi)';
      const fsResidueFraction = (residueNumerator / baseDen);
      eligibleHeirs.push({
        id: 'fullSisters_asabah_maa_ghair',
        heirName: fSisters > 1 ? `Full Sisters (${fSisters})` : 'Full Sister',
        relationship: 'Full Sister',
        category: 'Residuary (\'Asabah)',
        count: fSisters,
        individualFractionStr: formatFraction(fsResidueFraction / fSisters * baseDen, baseDen),
        collectiveFractionStr: formatFraction(fsResidueFraction * baseDen, baseDen),
        collectiveFractionValue: fsResidueFraction,
        percentageStr: `${(fsResidueFraction * 100).toFixed(2)}%`,
        percentageValue: parseFloat((fsResidueFraction * 100).toFixed(2)),
        monetaryShare: Math.round(fsResidueFraction * netDistributableEstate * 100) / 100,
        quranicReference: 'Hadith Precedent (Make sisters residuaries with daughters)',
        notes: 'Takes remaining estate residue as \'Asabah ma\'a al-Ghair alongside female descendants.'
      });
      residueNumerator = 0;
    }
  }

  // C. RADD (Redistribution if residue remains and no residuary heir exists)
  if (!isAwl && residueNumerator > 0) {
    // Check non-spouse fixed sharers eligible for Radd
    const nonSpouseFixedHeirs = eligibleHeirs.filter(h => h.id !== 'husband' && h.id !== 'wife');
    
    if (nonSpouseFixedHeirs.length > 0) {
      isRadd = true;
      residueDistributedTo = 'Redistributed to Non-Spouse Fixed Sharers (Radd)';

      // Calculate total fixed fraction sum of non-spouse sharers
      const nonSpouseSumFraction = nonSpouseFixedHeirs.reduce((acc, h) => acc + h.collectiveFractionValue, 0);
      const spouseFraction = 1.0 - (residueNumerator / baseDen) - nonSpouseSumFraction;

      // Available estate for non-spouse sharers after spouse share = (1 - spouseFraction)
      const availableForRadd = 1.0 - spouseFraction;

      steps.push(`Step 4: Radd Redistribution — Remaining unallocated residue of ${(residueNumerator / baseDen * 100).toFixed(2)}% redistributed to non-spouse fixed sharers in proportion to their fixed shares.`);

      nonSpouseFixedHeirs.forEach(h => {
        const raddProportion = h.collectiveFractionValue / nonSpouseSumFraction;
        h.collectiveFractionValue = raddProportion * availableForRadd;
        h.collectiveFractionStr = formatFraction(h.collectiveFractionValue * baseDen, baseDen);
        h.percentageStr = `${(h.collectiveFractionValue * 100).toFixed(2)}%`;
        h.percentageValue = parseFloat((h.collectiveFractionValue * 100).toFixed(2));
        h.monetaryShare = Math.round(h.collectiveFractionValue * netDistributableEstate * 100) / 100;
        h.category = 'Radd Adjusted';
        h.notes += ' (Increased via Radd redistribution of remaining residue).';
      });

      residueNumerator = 0;
    } else {
      warnings.push('Unallocated residue remains because only spouse or no Radd-eligible fixed sharers are present. In standard Hanafi practice, residue passes to Bayt al-Mal (Public Treasury) or distant kindred (Dhawu al-Arham).');
    }
  }

  // 8. Reconciliation Verification
  const totalAllocatedPercentage = eligibleHeirs.reduce((acc, h) => acc + h.percentageValue, 0);
  const totalAllocatedMonetary = eligibleHeirs.reduce((acc, h) => acc + (h.monetaryShare || 0), 0);
  const totalAllocatedFraction = eligibleHeirs.reduce((acc, h) => acc + h.collectiveFractionValue, 0);

  const reconciled = Math.abs(totalAllocatedFraction - 1.0) < 0.005;

  steps.push(`Step 5: Reconciliation — Total allocated fraction sum = ${totalAllocatedFraction.toFixed(4)} (${totalAllocatedPercentage.toFixed(2)}%). Reconciliation status: ${reconciled ? 'SUCCESSFUL (100.00%)' : 'DISCREPANCY DETECTED'}.`);

  // India Specific Legal Notice
  const legalNotice = input.jurisdiction === 'india'
    ? 'Legal & Personal Law Notice (India): This calculator provides an indicative inheritance calculation based on the selected Islamic inheritance framework (Muslim Personal Law Application Act, 1937). It is not a substitute for formal legal advice, judicial decree, or an official religious ruling (Fatwa). Statutory property succession rights, title transfer, probate, succession certificates, and mutation depend upon verified facts, documentary evidence, court jurisdiction, and applicable laws. Complex cases should be reviewed by a qualified Advocate and Islamic Fiqh specialist.'
    : 'General Legal Notice: This calculator provides indicative inheritance shares based on the selected Fara\'id framework. It does not establish legal ownership or judicial title.';

  return {
    success: reconciled && eligibleHeirs.length > 0,
    caseSummary: {
      deceasedGender: input.deceasedGender === 'male' ? 'Male Deceased' : 'Female Deceased',
      dateOfDeath: input.dateOfDeath || 'Not specified',
      madhhabName,
      jurisdiction: input.jurisdiction === 'india' ? 'India (Muslim Personal Law 1937)' : 'Other / Unspecified',
      grossEstate: gross,
      totalDeductions,
      funeralExpenses: funeral,
      debts,
      wasiyyah: finalBequest,
      otherDeductions: otherDed,
      netDistributableEstate,
      hasMonetaryCalculation: gross > 0
    },
    eligibleHeirs,
    excludedHeirs,
    calculationSummary: {
      baseDenominator: baseDen,
      adjustedDenominator: finalBaseDen,
      fixedSharesSumFractionStr: formatFraction(sumFixedNumerator, baseDen),
      fixedSharesSumValue: sumFixedNumerator / baseDen,
      isAwlApplied: isAwl,
      isRaddApplied: isRadd,
      residueFractionStr: formatFraction(baseDen - sumFixedNumerator, baseDen),
      residueFractionValue: Math.max(0, (baseDen - sumFixedNumerator) / baseDen),
      residueDistributedTo,
      totalAllocatedPercentage: parseFloat(totalAllocatedPercentage.toFixed(2)),
      totalAllocatedMonetary: Math.round(totalAllocatedMonetary * 100) / 100,
      reconciled
    },
    stepByStepExplanation: steps,
    legalNotice,
    warnings,
    errorMessage: !reconciled ? 'Calculation could not reconcile to 100%. Please review family parameters.' : undefined
  };
}

function createErrorResult(msg: string): IslamicInheritanceResult {
  return {
    success: false,
    caseSummary: {
      deceasedGender: 'Unknown',
      dateOfDeath: 'Not specified',
      madhhabName: 'Unspecified',
      jurisdiction: 'Unspecified',
      grossEstate: 0,
      totalDeductions: 0,
      funeralExpenses: 0,
      debts: 0,
      wasiyyah: 0,
      otherDeductions: 0,
      netDistributableEstate: 0,
      hasMonetaryCalculation: false
    },
    eligibleHeirs: [],
    excludedHeirs: [],
    calculationSummary: {
      baseDenominator: 0,
      adjustedDenominator: 0,
      fixedSharesSumFractionStr: '0',
      fixedSharesSumValue: 0,
      isAwlApplied: false,
      isRaddApplied: false,
      residueFractionStr: '0',
      residueFractionValue: 0,
      residueDistributedTo: 'None',
      totalAllocatedPercentage: 0,
      totalAllocatedMonetary: 0,
      reconciled: false
    },
    stepByStepExplanation: [],
    legalNotice: '',
    warnings: [msg],
    errorMessage: msg
  };
}
