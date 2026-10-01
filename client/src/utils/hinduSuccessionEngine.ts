export interface PreDeceasedSonBranch {
  id: string;
  widowAlive: boolean;
  survivingSonsCount: number;
  survivingDaughtersCount: number;
}

export interface PreDeceasedDaughterBranch {
  id: string;
  survivingSonsCount: number;
  survivingDaughtersCount: number;
}

export interface PreDeceasedChildBranchFemale {
  id: string;
  survivingSonsCount: number;
  survivingDaughtersCount: number;
}

export interface HinduSuccessionCaseInput {
  deceasedGender: 'male' | 'female';
  dateOfDeath?: string;
  successionType: 'intestate' | 'coparcenary';
  propertyType:
    | 'self_acquired'
    | 'ancestral_coparcenary'
    | 'inherited_father'
    | 'inherited_mother'
    | 'inherited_husband_father_in_law'
    | 'other';
  estimatedPropertyValue?: number | null;

  // Male Deceased Inputs
  widowsCount?: number;
  motherAlive?: boolean;
  survivingSonsCount?: number;
  survivingDaughtersCount?: number;
  preDeceasedSonsCount?: number;
  preDeceasedSonsBranches?: PreDeceasedSonBranch[];
  preDeceasedDaughtersCount?: number;
  preDeceasedDaughtersBranches?: PreDeceasedDaughterBranch[];

  // Female Deceased Inputs
  husbandAlive?: boolean;
  femaleSonsCount?: number;
  femaleDaughtersCount?: number;
  femalePreDeceasedChildrenCount?: number;
  femalePreDeceasedChildrenBranches?: PreDeceasedChildBranchFemale[];
  femalePropertySource?:
    | 'self_acquired'
    | 'inherited_father'
    | 'inherited_mother'
    | 'inherited_husband_father_in_law'
    | 'other';

  // Coparcenary Inputs
  coparcenarySonsCount?: number;
  coparcenaryDaughtersCount?: number;
  otherCoparcenersCount?: number;
  priorPartition?: boolean;
  priorPartitionDate?: string;
  priorPartitionRegistered?: boolean;
  hasWillOrTestament?: boolean;
  disputedHeirship?: boolean;
}

export interface HeirShareResult {
  id: string;
  heirName: string;
  relationship: string;
  category: string;
  fractionStr: string;
  fractionValue: number;
  percentageStr: string;
  percentageValue: number;
  estimatedRupeeValue?: number;
  notes?: string;
}

export interface HinduSuccessionCalculationResult {
  success: boolean;
  caseSummary: {
    deceasedGender: string;
    dateOfDeath: string;
    propertyType: string;
    successionType: string;
    estimatedPropertyValue: number | null;
  };
  applicableProvisions: {
    section: string;
    title: string;
    description: string;
  }[];
  heirs: HeirShareResult[];
  totalFractionSum: number;
  reconciled: boolean;
  calculationSteps: string[];
  warnings: string[];
  assumptions: string[];
  errorMessage?: string;
}

function simplifyFraction(numerator: number, denominator: number): string {
  if (numerator === 0) return '0';
  if (denominator === 0) return '0';
  
  const precision = 1000000;
  const numInt = Math.round(numerator * precision);
  const denInt = Math.round(denominator * precision);

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const common = gcd(Math.abs(numInt), Math.abs(denInt));
  
  const finalNum = Math.round(numInt / common);
  const finalDen = Math.round(denInt / common);

  if (finalDen === 1) return `${finalNum}`;
  return `${finalNum}/${finalDen}`;
}

export function calculateHinduSuccession(input: HinduSuccessionCaseInput): HinduSuccessionCalculationResult {
  const steps: string[] = [];
  const warnings: string[] = [];
  const assumptions: string[] = [];
  const provisions: { section: string; title: string; description: string }[] = [];
  const heirs: HeirShareResult[] = [];

  if (!input.deceasedGender || !['male', 'female'].includes(input.deceasedGender)) {
    return {
      success: false,
      caseSummary: {
        deceasedGender: input.deceasedGender || 'Unknown',
        dateOfDeath: input.dateOfDeath || 'Not specified',
        propertyType: input.propertyType || 'Unspecified',
        successionType: input.successionType || 'Unspecified',
        estimatedPropertyValue: input.estimatedPropertyValue || null
      },
      applicableProvisions: [],
      heirs: [],
      totalFractionSum: 0,
      reconciled: false,
      calculationSteps: [],
      warnings: ['Invalid or missing gender of deceased.'],
      assumptions: [],
      errorMessage: 'Gender of deceased is required.'
    };
  }

  if (
    (input.widowsCount && input.widowsCount < 0) ||
    (input.survivingSonsCount && input.survivingSonsCount < 0) ||
    (input.survivingDaughtersCount && input.survivingDaughtersCount < 0) ||
    (input.preDeceasedSonsCount && input.preDeceasedSonsCount < 0) ||
    (input.preDeceasedDaughtersCount && input.preDeceasedDaughtersCount < 0) ||
    (input.femaleSonsCount && input.femaleSonsCount < 0) ||
    (input.femaleDaughtersCount && input.femaleDaughtersCount < 0) ||
    (input.estimatedPropertyValue && input.estimatedPropertyValue < 0)
  ) {
    return {
      success: false,
      caseSummary: {
        deceasedGender: input.deceasedGender,
        dateOfDeath: input.dateOfDeath || 'Not specified',
        propertyType: input.propertyType || 'Unspecified',
        successionType: input.successionType || 'Unspecified',
        estimatedPropertyValue: input.estimatedPropertyValue || null
      },
      applicableProvisions: [],
      heirs: [],
      totalFractionSum: 0,
      reconciled: false,
      calculationSteps: [],
      warnings: ['Negative numeric values are not permitted.'],
      assumptions: [],
      errorMessage: 'Input numbers cannot be negative.'
    };
  }

  const dod = input.dateOfDeath ? new Date(input.dateOfDeath) : null;
  const isPost2005 = dod ? dod >= new Date('2005-09-09') : true;

  if (input.hasWillOrTestament) {
    warnings.push('A Will/Testament is reported. Under Section 30 of the Hindu Succession Act, testamentary disposition overrides intestate rules. This calculation applies only to intestate estate portions.');
  }

  if (input.disputedHeirship) {
    warnings.push('Disputed heirship is reported. Realization of succession rights requires legal evidence and civil court adjudication.');
  }

  const propVal = (input.estimatedPropertyValue && input.estimatedPropertyValue > 0) ? input.estimatedPropertyValue : null;

  // -------------------------------------------------------------
  // BRANCH A: COPARCENARY / ANCESTRAL PROPERTY CALCULATION
  // -------------------------------------------------------------
  if (input.successionType === 'coparcenary' || input.propertyType === 'ancestral_coparcenary') {
    provisions.push({
      section: 'Section 6',
      title: 'Devolution of interest in coparcenary property',
      description: 'As amended by Hindu Succession (Amendment) Act, 2005 and interpreted in Vineeta Sharma v. Rakesh Sharma (2020), daughters are coparceners by birth with equal rights. On death of a coparcener, interest is determined by deemed notional partition immediately before death.'
    });

    steps.push('1. Identified property as Coparcenary / Joint Family Property governed by Section 6.');

    if (input.priorPartition && input.priorPartitionRegistered) {
      const pDate = input.priorPartitionDate ? new Date(input.priorPartitionDate) : null;
      if (pDate && pDate < new Date('2004-12-20')) {
        warnings.push('A registered partition prior to 20 December 2004 severs coparcenary status under Section 6(5). The property will be treated as separate intestate property.');
      }
    }

    const coparcenarySons = input.coparcenarySonsCount || 0;
    const coparcenaryDaughters = input.coparcenaryDaughtersCount || 0;
    const otherCoparceners = input.otherCoparcenersCount || 0;

    const totalCoparceners = 1 + coparcenarySons + coparcenaryDaughters + otherCoparceners;
    steps.push(`2. Determined total coparceners immediately prior to death: 1 Deceased + ${coparcenarySons} Son(s) + ${coparcenaryDaughters} Daughter(s) + ${otherCoparceners} Other = ${totalCoparceners} coparcener(s).`);

    const coparcenarySharePerHead = 1 / totalCoparceners;
    steps.push(`3. Executed Notional Partition: Each coparcener gets a ${simplifyFraction(1, totalCoparceners)} (${(coparcenarySharePerHead * 100).toFixed(2)}%) deemed share.`);

    const deceasedEstateFraction = coparcenarySharePerHead;
    steps.push(`4. Distributing Deceased's ${simplifyFraction(1, totalCoparceners)} coparcenary interest amongst intestate legal heirs.`);

    if (input.deceasedGender === 'male') {
      provisions.push({
        section: 'Section 8 & 10',
        title: 'Distribution of Male Deceased Interest among Class I Heirs',
        description: 'Rules for sharing intestate portion among widows, mother, surviving children, and branches of pre-deceased children.'
      });

      const widows = input.widowsCount || 0;
      const mother = input.motherAlive ? 1 : 0;
      const sons = input.survivingSonsCount || 0;
      const daughters = input.survivingDaughtersCount || 0;
      const pdSons = input.preDeceasedSonsCount || 0;
      const pdDaughters = input.preDeceasedDaughtersCount || 0;

      const mainClass1Heads = (widows > 0 ? 1 : 0) + mother + sons + daughters + pdSons + pdDaughters;

      if (mainClass1Heads === 0) {
        warnings.push('No Class I heirs specified for deceased coparcener. Deceased share devolves upon Class II heirs under Section 8(b).');
      } else {
        const sharePerClass1Head = deceasedEstateFraction / mainClass1Heads;

        for (let i = 1; i <= sons; i++) {
          const inherited = sharePerClass1Head;
          const ownCoparcenary = (i <= coparcenarySons) ? coparcenarySharePerHead : 0;
          const totalShare = ownCoparcenary + inherited;
          heirs.push({
            id: `son_${i}`,
            heirName: `Son ${i}`,
            relationship: 'Son',
            category: 'Coparcener + Class I Heir',
            fractionStr: simplifyFraction(totalShare, 1),
            fractionValue: totalShare,
            percentageStr: `${(totalShare * 100).toFixed(2)}%`,
            percentageValue: parseFloat((totalShare * 100).toFixed(2)),
            estimatedRupeeValue: propVal ? Math.round(totalShare * propVal * 100) / 100 : undefined,
            notes: `Includes ${simplifyFraction(ownCoparcenary, 1)} coparcenary share + ${simplifyFraction(inherited, 1)} inherited intestate share.`
          });
        }

        for (let i = 1; i <= daughters; i++) {
          const inherited = sharePerClass1Head;
          const ownCoparcenary = (i <= coparcenaryDaughters) ? coparcenarySharePerHead : 0;
          const totalShare = ownCoparcenary + inherited;
          heirs.push({
            id: `daughter_${i}`,
            heirName: `Daughter ${i}`,
            relationship: 'Daughter',
            category: 'Coparcener + Class I Heir',
            fractionStr: simplifyFraction(totalShare, 1),
            fractionValue: totalShare,
            percentageStr: `${(totalShare * 100).toFixed(2)}%`,
            percentageValue: parseFloat((totalShare * 100).toFixed(2)),
            estimatedRupeeValue: propVal ? Math.round(totalShare * propVal * 100) / 100 : undefined,
            notes: `Includes ${simplifyFraction(ownCoparcenary, 1)} coparcenary share + ${simplifyFraction(inherited, 1)} inherited intestate share.`
          });
        }

        if (mother > 0) {
          const totalShare = sharePerClass1Head;
          heirs.push({
            id: 'mother',
            heirName: 'Mother of Deceased',
            relationship: 'Mother',
            category: 'Class I Heir',
            fractionStr: simplifyFraction(totalShare, 1),
            fractionValue: totalShare,
            percentageStr: `${(totalShare * 100).toFixed(2)}%`,
            percentageValue: parseFloat((totalShare * 100).toFixed(2)),
            estimatedRupeeValue: propVal ? Math.round(totalShare * propVal * 100) / 100 : undefined,
            notes: 'Inherits Class I share from deceased coparcener estate.'
          });
        }

        if (widows > 0) {
          const sharePerWidow = sharePerClass1Head / widows;
          for (let w = 1; w <= widows; w++) {
            heirs.push({
              id: `widow_${w}`,
              heirName: widows > 1 ? `Widow ${w}` : 'Widow',
              relationship: 'Widow',
              category: 'Class I Heir',
              fractionStr: simplifyFraction(sharePerWidow, 1),
              fractionValue: sharePerWidow,
              percentageStr: `${(sharePerWidow * 100).toFixed(2)}%`,
              percentageValue: parseFloat((sharePerWidow * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(sharePerWidow * propVal * 100) / 100 : undefined,
              notes: widows > 1 ? 'Multiple widows share one Class I share equally.' : 'Inherits Class I share from deceased coparcener estate.'
            });
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // BRANCH B: MALE DECEASED — INTESTATE SUCCESSION (Sections 8, 9, 10 & Schedule)
  // -------------------------------------------------------------
  else if (input.deceasedGender === 'male') {
    provisions.push(
      {
        section: 'Section 8',
        title: 'General rules of succession in the case of males',
        description: 'The property of an intestate Hindu male devolves firstly upon Class I heirs specified in the Schedule.'
      },
      {
        section: 'Section 10',
        title: 'Distribution of property among heirs in Class I of the Schedule',
        description: 'Widow(s), mother, surviving sons, and surviving daughters each take one share. Heirs of a pre-deceased son or pre-deceased daughter take per stirpes.'
      },
      {
        section: 'Schedule',
        title: 'Class I Heirs',
        description: 'Son, Daughter, Widow, Mother, Son of pre-deceased son, Daughter of pre-deceased son, Widow of pre-deceased son, Son of pre-deceased daughter, Daughter of pre-deceased daughter, etc.'
      }
    );

    steps.push('1. Identified deceased as Male with Intestate succession under Section 8.');

    const widows = input.widowsCount || 0;
    const mother = input.motherAlive ? 1 : 0;
    const sons = input.survivingSonsCount || 0;
    const daughters = input.survivingDaughtersCount || 0;
    const pdSons = input.preDeceasedSonsCount || 0;
    const pdDaughters = input.preDeceasedDaughtersCount || 0;

    const mainClass1Heads = (widows > 0 ? 1 : 0) + mother + sons + daughters + pdSons + pdDaughters;

    if (mainClass1Heads > 0) {
      steps.push(`2. Identified ${mainClass1Heads} main Class I heir branch(es): ${widows > 0 ? '1 Widow share' : ''}${mother > 0 ? ', 1 Mother share' : ''}${sons > 0 ? `, ${sons} Son(s)` : ''}${daughters > 0 ? `, ${daughters} Daughter(s)` : ''}${pdSons > 0 ? `, ${pdSons} Pre-deceased Son branch(es)` : ''}${pdDaughters > 0 ? `, ${pdDaughters} Pre-deceased Daughter branch(es)` : ''}.`);
      
      const sharePerHead = 1 / mainClass1Heads;

      if (widows > 0) {
        const widowShare = sharePerHead / widows;
        for (let w = 1; w <= widows; w++) {
          heirs.push({
            id: `widow_${w}`,
            heirName: widows > 1 ? `Widow ${w}` : 'Widow',
            relationship: 'Widow',
            category: 'Class I',
            fractionStr: simplifyFraction(widowShare, 1),
            fractionValue: widowShare,
            percentageStr: `${(widowShare * 100).toFixed(2)}%`,
            percentageValue: parseFloat((widowShare * 100).toFixed(2)),
            estimatedRupeeValue: propVal ? Math.round(widowShare * propVal * 100) / 100 : undefined,
            notes: widows > 1 ? 'Rule 1: All widows together take one share, split equally.' : 'Rule 1: Takes one share.'
          });
        }
      }

      if (mother > 0) {
        heirs.push({
          id: 'mother',
          heirName: 'Mother of Deceased',
          relationship: 'Mother',
          category: 'Class I',
          fractionStr: simplifyFraction(sharePerHead, 1),
          fractionValue: sharePerHead,
          percentageStr: `${(sharePerHead * 100).toFixed(2)}%`,
          percentageValue: parseFloat((sharePerHead * 100).toFixed(2)),
          estimatedRupeeValue: propVal ? Math.round(sharePerHead * propVal * 100) / 100 : undefined,
          notes: 'Rule 2: Mother takes one share.'
        });
      }

      for (let s = 1; s <= sons; s++) {
        heirs.push({
          id: `son_${s}`,
          heirName: `Son ${s}`,
          relationship: 'Son',
          category: 'Class I',
          fractionStr: simplifyFraction(sharePerHead, 1),
          fractionValue: sharePerHead,
          percentageStr: `${(sharePerHead * 100).toFixed(2)}%`,
          percentageValue: parseFloat((sharePerHead * 100).toFixed(2)),
          estimatedRupeeValue: propVal ? Math.round(sharePerHead * propVal * 100) / 100 : undefined,
          notes: 'Rule 2: Surviving son takes one share.'
        });
      }

      for (let d = 1; d <= daughters; d++) {
        heirs.push({
          id: `daughter_${d}`,
          heirName: `Daughter ${d}`,
          relationship: 'Daughter',
          category: 'Class I',
          fractionStr: simplifyFraction(sharePerHead, 1),
          fractionValue: sharePerHead,
          percentageStr: `${(sharePerHead * 100).toFixed(2)}%`,
          percentageValue: parseFloat((sharePerHead * 100).toFixed(2)),
          estimatedRupeeValue: propVal ? Math.round(sharePerHead * propVal * 100) / 100 : undefined,
          notes: 'Rule 2: Surviving daughter takes one share.'
        });
      }

      const pdSonBranches = input.preDeceasedSonsBranches || [];
      for (let b = 0; b < pdSons; b++) {
        const branchInfo = pdSonBranches[b] || { widowAlive: false, survivingSonsCount: 0, survivingDaughtersCount: 0 };
        const branchWidow = branchInfo.widowAlive ? 1 : 0;
        const branchSons = branchInfo.survivingSonsCount || 0;
        const branchDaughters = branchInfo.survivingDaughtersCount || 0;

        const subHeads = branchWidow + branchSons + branchDaughters;
        steps.push(`3. Branch of Pre-deceased Son ${b + 1}: Branch share is ${simplifyFraction(sharePerHead, 1)}, divided per stirpes among ${subHeads} descendant(s).`);

        if (subHeads > 0) {
          const subShare = sharePerHead / subHeads;
          if (branchWidow > 0) {
            heirs.push({
              id: `pd_son_${b + 1}_widow`,
              heirName: `Widow of Pre-deceased Son ${b + 1}`,
              relationship: 'Widow of Pre-deceased Son',
              category: 'Class I (Branch)',
              fractionStr: simplifyFraction(subShare, 1),
              fractionValue: subShare,
              percentageStr: `${(subShare * 100).toFixed(2)}%`,
              percentageValue: parseFloat((subShare * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(subShare * propVal * 100) / 100 : undefined,
              notes: `Rule 4: Equal share within Pre-deceased Son ${b + 1}'s branch.`
            });
          }
          for (let bs = 1; bs <= branchSons; bs++) {
            heirs.push({
              id: `pd_son_${b + 1}_son_${bs}`,
              heirName: `Son ${bs} of Pre-deceased Son ${b + 1}`,
              relationship: 'Grandson (Son of Pre-deceased Son)',
              category: 'Class I (Branch)',
              fractionStr: simplifyFraction(subShare, 1),
              fractionValue: subShare,
              percentageStr: `${(subShare * 100).toFixed(2)}%`,
              percentageValue: parseFloat((subShare * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(subShare * propVal * 100) / 100 : undefined,
              notes: `Rule 4: Equal share within Pre-deceased Son ${b + 1}'s branch.`
            });
          }
          for (let bd = 1; bd <= branchDaughters; bd++) {
            heirs.push({
              id: `pd_son_${b + 1}_daughter_${bd}`,
              heirName: `Daughter ${bd} of Pre-deceased Son ${b + 1}`,
              relationship: 'Granddaughter (Daughter of Pre-deceased Son)',
              category: 'Class I (Branch)',
              fractionStr: simplifyFraction(subShare, 1),
              fractionValue: subShare,
              percentageStr: `${(subShare * 100).toFixed(2)}%`,
              percentageValue: parseFloat((subShare * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(subShare * propVal * 100) / 100 : undefined,
              notes: `Rule 4: Equal share within Pre-deceased Son ${b + 1}'s branch.`
            });
          }
        } else {
          warnings.push(`Pre-deceased Son ${b + 1} branch specified, but no surviving widow/children provided.`);
        }
      }

      const pdDaughterBranches = input.preDeceasedDaughtersBranches || [];
      for (let b = 0; b < pdDaughters; b++) {
        const branchInfo = pdDaughterBranches[b] || { survivingSonsCount: 0, survivingDaughtersCount: 0 };
        const branchSons = branchInfo.survivingSonsCount || 0;
        const branchDaughters = branchInfo.survivingDaughtersCount || 0;

        const subHeads = branchSons + branchDaughters;
        steps.push(`4. Branch of Pre-deceased Daughter ${b + 1}: Branch share is ${simplifyFraction(sharePerHead, 1)}, divided per stirpes among ${subHeads} descendant(s).`);

        if (subHeads > 0) {
          const subShare = sharePerHead / subHeads;
          for (let bs = 1; bs <= branchSons; bs++) {
            heirs.push({
              id: `pd_daughter_${b + 1}_son_${bs}`,
              heirName: `Son ${bs} of Pre-deceased Daughter ${b + 1}`,
              relationship: 'Grandson (Son of Pre-deceased Daughter)',
              category: 'Class I (Branch)',
              fractionStr: simplifyFraction(subShare, 1),
              fractionValue: subShare,
              percentageStr: `${(subShare * 100).toFixed(2)}%`,
              percentageValue: parseFloat((subShare * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(subShare * propVal * 100) / 100 : undefined,
              notes: `Rule 4: Equal share within Pre-deceased Daughter ${b + 1}'s branch.`
            });
          }
          for (let bd = 1; bd <= branchDaughters; bd++) {
            heirs.push({
              id: `pd_daughter_${b + 1}_daughter_${bd}`,
              heirName: `Daughter ${bd} of Pre-deceased Daughter ${b + 1}`,
              relationship: 'Granddaughter (Daughter of Pre-deceased Daughter)',
              category: 'Class I (Branch)',
              fractionStr: simplifyFraction(subShare, 1),
              fractionValue: subShare,
              percentageStr: `${(subShare * 100).toFixed(2)}%`,
              percentageValue: parseFloat((subShare * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(subShare * propVal * 100) / 100 : undefined,
              notes: `Rule 4: Equal share within Pre-deceased Daughter ${b + 1}'s branch.`
            });
          }
        } else {
          warnings.push(`Pre-deceased Daughter ${b + 1} branch specified, but no surviving children provided.`);
        }
      }
    } else {
      provisions.push({
        section: 'Section 8(b)',
        title: 'Class II Heirs Order of Succession',
        description: 'When no Class I heir is present, property devolves upon Class II heirs in order of Entry I (Father), Entry II, etc.'
      });
      warnings.push('No surviving Class I heirs (Widow, Mother, Sons, Daughters, or Pre-deceased children branches) identified. Property devolves upon Class II heirs under Section 8(b), starting with Father (Entry I).');
      
      heirs.push({
        id: 'father_class2',
        heirName: 'Father of Deceased (Class II Entry I)',
        relationship: 'Father',
        category: 'Class II Heir',
        fractionStr: '1',
        fractionValue: 1,
        percentageStr: '100.00%',
        percentageValue: 100,
        estimatedRupeeValue: propVal ? propVal : undefined,
        notes: 'Section 8(b): In absence of Class I heirs, Father as Entry I Class II heir inherits entire estate.'
      });
    }
  }

  // -------------------------------------------------------------
  // BRANCH C: FEMALE DECEASED — INTESTATE SUCCESSION (Sections 15 & 16)
  // -------------------------------------------------------------
  else if (input.deceasedGender === 'female') {
    provisions.push(
      {
        section: 'Section 15',
        title: 'General rules of succession in the case of female Hindus',
        description: 'Rules specifying order of succession for female Hindu property, including general order and special exceptions for property inherited from parents or husband/father-in-law.'
      },
      {
        section: 'Section 16',
        title: 'Order of succession and manner of distribution among heirs of a female Hindu',
        description: 'Distribution among children and husband, or higher categories per stirpes.'
      }
    );

    steps.push('1. Identified deceased as Female with succession governed by Sections 15 & 16.');

    const husband = input.husbandAlive ? 1 : 0;
    const sons = input.femaleSonsCount || 0;
    const daughters = input.femaleDaughtersCount || 0;
    const pdChildren = input.femalePreDeceasedChildrenCount || 0;

    const childrenHeadCount = sons + daughters + pdChildren;

    if (childrenHeadCount > 0) {
      steps.push('2. Identified surviving issue (children/grandchildren). Section 15(1)(a) applies: Property devolves upon Husband, Sons, Daughters, and pre-deceased children branches.');

      const mainHeads = husband + sons + daughters + pdChildren;
      const sharePerHead = 1 / mainHeads;

      if (husband > 0) {
        heirs.push({
          id: 'husband',
          heirName: 'Husband of Deceased',
          relationship: 'Husband',
          category: 'Female Succession Sec 15(1)(a)',
          fractionStr: simplifyFraction(sharePerHead, 1),
          fractionValue: sharePerHead,
          percentageStr: `${(sharePerHead * 100).toFixed(2)}%`,
          percentageValue: parseFloat((sharePerHead * 100).toFixed(2)),
          estimatedRupeeValue: propVal ? Math.round(sharePerHead * propVal * 100) / 100 : undefined,
          notes: 'Section 15(1)(a): Husband shares equally with surviving children.'
        });
      }

      for (let s = 1; s <= sons; s++) {
        heirs.push({
          id: `female_son_${s}`,
          heirName: `Son ${s}`,
          relationship: 'Son',
          category: 'Female Succession Sec 15(1)(a)',
          fractionStr: simplifyFraction(sharePerHead, 1),
          fractionValue: sharePerHead,
          percentageStr: `${(sharePerHead * 100).toFixed(2)}%`,
          percentageValue: parseFloat((sharePerHead * 100).toFixed(2)),
          estimatedRupeeValue: propVal ? Math.round(sharePerHead * propVal * 100) / 100 : undefined,
          notes: 'Section 15(1)(a): Son takes equal share.'
        });
      }

      for (let d = 1; d <= daughters; d++) {
        heirs.push({
          id: `female_daughter_${d}`,
          heirName: `Daughter ${d}`,
          relationship: 'Daughter',
          category: 'Female Succession Sec 15(1)(a)',
          fractionStr: simplifyFraction(sharePerHead, 1),
          fractionValue: sharePerHead,
          percentageStr: `${(sharePerHead * 100).toFixed(2)}%`,
          percentageValue: parseFloat((sharePerHead * 100).toFixed(2)),
          estimatedRupeeValue: propVal ? Math.round(sharePerHead * propVal * 100) / 100 : undefined,
          notes: 'Section 15(1)(a): Daughter takes equal share.'
        });
      }

      const femalePdBranches = input.femalePreDeceasedChildrenBranches || [];
      for (let b = 0; b < pdChildren; b++) {
        const branchInfo = femalePdBranches[b] || { survivingSonsCount: 0, survivingDaughtersCount: 0 };
        const bSons = branchInfo.survivingSonsCount || 0;
        const bDaughters = branchInfo.survivingDaughtersCount || 0;
        const subHeads = bSons + bDaughters;

        if (subHeads > 0) {
          const subShare = sharePerHead / subHeads;
          for (let bs = 1; bs <= bSons; bs++) {
            heirs.push({
              id: `female_pd_${b + 1}_son_${bs}`,
              heirName: `Son ${bs} of Pre-deceased Child ${b + 1}`,
              relationship: 'Grandson (Child of Pre-deceased Child)',
              category: 'Female Succession Sec 15(1)(a)',
              fractionStr: simplifyFraction(subShare, 1),
              fractionValue: subShare,
              percentageStr: `${(subShare * 100).toFixed(2)}%`,
              percentageValue: parseFloat((subShare * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(subShare * propVal * 100) / 100 : undefined,
              notes: 'Per stirpes share under Section 16 Rule 2.'
            });
          }
          for (let bd = 1; bd <= bDaughters; bd++) {
            heirs.push({
              id: `female_pd_${b + 1}_daughter_${bd}`,
              heirName: `Daughter ${bd} of Pre-deceased Child ${b + 1}`,
              relationship: 'Granddaughter (Child of Pre-deceased Child)',
              category: 'Female Succession Sec 15(1)(a)',
              fractionStr: simplifyFraction(subShare, 1),
              fractionValue: subShare,
              percentageStr: `${(subShare * 100).toFixed(2)}%`,
              percentageValue: parseFloat((subShare * 100).toFixed(2)),
              estimatedRupeeValue: propVal ? Math.round(subShare * propVal * 100) / 100 : undefined,
              notes: 'Per stirpes share under Section 16 Rule 2.'
            });
          }
        }
      }
    } 
    else {
      steps.push('2. Identified NO surviving children or grandchildren. Checking property source under Section 15(2).');
      const propSource = input.femalePropertySource || input.propertyType;

      if (propSource === 'inherited_father' || propSource === 'inherited_mother') {
        provisions.push({
          section: 'Section 15(2)(a)',
          title: 'Property inherited from father or mother',
          description: 'Any property inherited by a female Hindu from her father or mother shall devolve, in the absence of any child or child of a pre-deceased child, upon the heirs of the father.'
        });
        warnings.push('Under Section 15(2)(a), property inherited from father/mother devolves upon the Heirs of the Father due to absence of surviving children or grandchildren.');
        
        heirs.push({
          id: 'father_heirs',
          heirName: 'Heirs of the Father (Section 15(2)(a))',
          relationship: 'Heirs of Father',
          category: 'Section 15(2)(a)',
          fractionStr: '1',
          fractionValue: 1,
          percentageStr: '100.00%',
          percentageValue: 100,
          estimatedRupeeValue: propVal ? propVal : undefined,
          notes: 'Property reverts to father line: Father Class I/II heirs (e.g. Father, Mother, Siblings).'
        });
      } 
      else if (propSource === 'inherited_husband_father_in_law') {
        provisions.push({
          section: 'Section 15(2)(b)',
          title: 'Property inherited from husband or father-in-law',
          description: 'Any property inherited by a female Hindu from her husband or father-in-law shall devolve, in the absence of any child or child of a pre-deceased child, upon the heirs of the husband.'
        });
        warnings.push('Under Section 15(2)(b), property inherited from husband/father-in-law devolves upon the Heirs of the Husband due to absence of surviving children or grandchildren.');

        heirs.push({
          id: 'husband_heirs',
          heirName: 'Heirs of the Husband (Section 15(2)(b))',
          relationship: 'Heirs of Husband',
          category: 'Section 15(2)(b)',
          fractionStr: '1',
          fractionValue: 1,
          percentageStr: '100.00%',
          percentageValue: 100,
          estimatedRupeeValue: propVal ? propVal : undefined,
          notes: 'Property reverts to husband line: Husband Class I/II heirs.'
        });
      } 
      else {
        if (husband > 0) {
          heirs.push({
            id: 'husband_sole',
            heirName: 'Husband of Deceased',
            relationship: 'Husband',
            category: 'Female Succession Sec 15(1)(a)',
            fractionStr: '1',
            fractionValue: 1,
            percentageStr: '100.00%',
            percentageValue: 100,
            estimatedRupeeValue: propVal ? propVal : undefined,
            notes: 'Section 15(1)(a): Husband inherits 100% in absence of children.'
          });
        } else {
          provisions.push({
            section: 'Section 15(1)(b)',
            title: 'Heirs of the Husband',
            description: 'In absence of children and husband, self-acquired property of female Hindu devolves upon heirs of the husband.'
          });
          warnings.push('Under Section 15(1)(b), in absence of children and husband, self-acquired property devolves upon the Heirs of the Husband.');

          heirs.push({
            id: 'husband_heirs_sec15_1_b',
            heirName: 'Heirs of the Husband (Section 15(1)(b))',
            relationship: 'Heirs of Husband',
            category: 'Section 15(1)(b)',
            fractionStr: '1',
            fractionValue: 1,
            percentageStr: '100.00%',
            percentageValue: 100,
            estimatedRupeeValue: propVal ? propVal : undefined,
            notes: 'Inherits self-acquired estate of deceased female under Section 15(1)(b).'
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // RECONCILIATION & TOTAL FRACTION VERIFICATION
  // -------------------------------------------------------------
  const totalFractionSum = heirs.reduce((acc, h) => acc + h.fractionValue, 0);
  const reconciled = Math.abs(totalFractionSum - 1.0) < 0.001;

  steps.push(`Final Step: Verified total fraction sum = ${totalFractionSum.toFixed(4)} (${(totalFractionSum * 100).toFixed(2)}%). Reconciled: ${reconciled ? 'YES' : 'NO'}`);

  if (!reconciled && heirs.length > 0) {
    warnings.push('The calculated shares could not be reconciled to 100%. Please review the entered family parameters.');
  }

  assumptions.push('Assumes all heirs are Hindu as defined under Section 2 of the Hindu Succession Act, 1956.');
  assumptions.push('Assumes no disqualification under Sections 24-28 (e.g. unchastity, murder, remarriage prior to repeal, conversion).');

  return {
    success: reconciled && heirs.length > 0,
    caseSummary: {
      deceasedGender: input.deceasedGender === 'male' ? 'Male' : 'Female',
      dateOfDeath: input.dateOfDeath || 'Not specified',
      propertyType: input.propertyType ? input.propertyType.replace(/_/g, ' ').toUpperCase() : 'UNSPECIFIED',
      successionType: input.successionType ? input.successionType.toUpperCase() : 'INTESTATE',
      estimatedPropertyValue: propVal
    },
    applicableProvisions: provisions,
    heirs,
    totalFractionSum,
    reconciled,
    calculationSteps: steps,
    warnings,
    assumptions,
    errorMessage: (!reconciled && heirs.length > 0) ? 'The calculation could not be reconciled. Please review the entered facts.' : undefined
  };
}
