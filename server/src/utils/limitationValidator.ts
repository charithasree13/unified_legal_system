import { LIMITATION_ARTICLES, LimitationArticle } from '../data/limitationArticles';

export interface LimitationValidationReport {
  isValid: boolean;
  totalEntries: number;
  uniqueEntriesCount: number;
  duplicateKeys: string[];
  missingFieldsCount: number;
  invalidEntries: string[];
  categoryBreakdown: Record<string, number>;
  divisionBreakdown: Record<string, number>;
  summary: string;
}

/**
 * Performs automated validation on the Limitation Act dataset.
 * Enforces zero-duplicate rule based on unique key: (actName + articleNumber + subArticle).
 */
export const validateLimitationDataset = (): LimitationValidationReport => {
  const seenKeys = new Map<string, LimitationArticle>();
  const duplicateKeys: string[] = [];
  const invalidEntries: string[] = [];
  const categoryBreakdown: Record<string, number> = {};
  const divisionBreakdown: Record<string, number> = {};
  let missingFieldsCount = 0;

  for (const article of LIMITATION_ARTICLES) {
    // 1. Composite Unique Key Construction
    const subKey = article.subArticle ? `_${article.subArticle.toLowerCase()}` : '';
    const compositeKey = `${article.actName.trim()}::Art_${article.articleNumber.trim()}${subKey}`;

    if (seenKeys.has(compositeKey)) {
      duplicateKeys.push(`${compositeKey} (ID: ${article.id})`);
    } else {
      seenKeys.set(compositeKey, article);
    }

    // 2. Validate mandatory statutory data fields
    if (
      !article.id ||
      !article.actName ||
      !article.articleNumber ||
      !article.division ||
      !article.category ||
      !article.description ||
      !article.startingPoint ||
      !article.source ||
      article.limitationValue <= 0 ||
      !['years', 'months', 'days'].includes(article.limitationUnit)
    ) {
      missingFieldsCount++;
      invalidEntries.push(article.id || `Art-${article.articleNumber}`);
    }

    // 3. Category & Division breakdown
    categoryBreakdown[article.category] = (categoryBreakdown[article.category] || 0) + 1;
    divisionBreakdown[article.division] = (divisionBreakdown[article.division] || 0) + 1;
  }

  const totalEntries = LIMITATION_ARTICLES.length;
  const uniqueEntriesCount = seenKeys.size;
  const isValid = duplicateKeys.length === 0 && missingFieldsCount === 0 && totalEntries === uniqueEntriesCount;

  const summary = isValid
    ? `SUCCESS: Complete Limitation Act Schedule validated with ${totalEntries} canonical entries and 0 duplicates.`
    : `FAILURE: Validation detected ${duplicateKeys.length} duplicate(s) and ${missingFieldsCount} incomplete entry/entries.`;

  return {
    isValid,
    totalEntries,
    uniqueEntriesCount,
    duplicateKeys,
    missingFieldsCount,
    invalidEntries,
    categoryBreakdown,
    divisionBreakdown,
    summary
  };
};
