export interface LimitationArticle {
  id: string;
  actName: string;
  articleNumber: string;
  subArticle: string | null;
  division: 'First Division - Suits' | 'Second Division - Appeals' | 'Third Division - Applications';
  part: string;
  category: string;
  description: string;
  limitationValue: number;
  limitationUnit: 'years' | 'months' | 'days';
  startingPoint: string;
  source: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  lastVerified: string;
  version: string;
  active: boolean;
  notes?: string;
}

export { LIMITATION_ARTICLES } from '../../../server/src/data/limitationArticles';
