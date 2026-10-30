/**
 * Elite Legal Desk — Legal Research Architecture Types
 * Defines normalized models for multi-provider legal research,
 * adhering to the Free-First Legal Research Policy.
 */

export type CourtLevel = 
  | 'Supreme Court'
  | 'High Court'
  | 'District Court'
  | 'Tribunal'
  | 'Commission'
  | 'Other';

export interface LegalResearchQuery {
  search?: string;
  q?: string;
  type?: 'all' | 'judgments' | 'acts';
  court?: string;
  courtLevel?: CourtLevel;
  state?: string;
  bench?: string;
  judge?: string;
  year?: number | string;
  yearRange?: string;
  citation?: string;
  caseNumber?: string;
  jurisdiction?: string;
  category?: string;
  subject?: string;
  sectionNumber?: string;
  actStatus?: string;
  letter?: string;
  docType?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'relevance' | 'title';
  provider?: string;
}

export interface DocumentSourceMetadata {
  provider: 'INDIAN_KANOON' | 'ECOURTS_OFFICIAL' | 'SUPREME_COURT_ESCR' | 'HIGH_COURT_REGISTRY' | 'TRIBUNAL_REGISTRY' | 'INDIA_CODE' | 'LOCAL_EDITORIAL';
  providerName: string;
  providerDocId?: string;
  sourceUrl: string;
  officialSourceUrl: string;
  isCertifiedCopy: boolean; // Always false; official certified copies require registry issuance
  attribution: string;
  attributionRequired: boolean;
  attributionLogo?: string;
  coverageNote: string;
}

export interface NormalizedJudgmentSummary {
  background?: string;
  issues?: string;
  relevantLaw?: string;
  courtReasoning?: string;
  holding?: string;
  keyPrinciple?: string;
  outcome?: string;
  fullSummaryText?: string;
}

export interface NormalizedJudgment {
  id: string;
  canonicalKey: string;
  title: string;
  petitioner?: string;
  respondent?: string;
  court: string;
  courtLevel: CourtLevel;
  state?: string;
  bench?: string;
  judge?: string;
  caseNumber?: string;
  appealNumber?: string;
  neutralCitation?: string;
  equivalentCitations?: string[];
  decisionDate?: string;
  year: number;
  judgmentType: string;
  subject: string;
  actsInvolved?: string[];
  sectionsConsidered?: string[];
  keywords?: string[];
  caseOutcome?: string;
  content?: string;
  summary?: NormalizedJudgmentSummary;
  source: DocumentSourceMetadata;
  availability: 'AVAILABLE_TEXT' | 'OFFICIAL_DOCUMENT_LINK' | 'UNAVAILABLE';
  isDynamic: boolean;
}

export interface NormalizedSection {
  actId: string;
  actTitle: string;
  sectionNumber: string;
  heading: string;
  content: string;
  subsections?: Array<{ number: string; text: string }>;
  amendments?: string;
  effectiveDate?: string;
  relatedProvisions?: Array<{
    oldAct: string;
    oldSection: string;
    newAct: string;
    newSection: string;
    mappingType: string;
    notes?: string;
  }>;
  sourceAuthority: string;
  officialSourceUrl: string;
  disclaimer: string;
}

export interface NormalizedActChapter {
  chapterNumber: string;
  title: string;
  sections: Array<{
    sectionNumber: string;
    title: string;
    summary?: string;
  }>;
}

export interface NormalizedAct {
  id: string;
  canonicalKey: string;
  title: string;
  actName: string;
  shortTitle?: string;
  actNumber?: string;
  year: number;
  enactmentDate?: string;
  commencementDate?: string;
  ministry?: string;
  department?: string;
  jurisdiction: string;
  category: string;
  actStatus: 'CURRENTLY_IN_FORCE' | 'AMENDED' | 'AMENDED_NOT_YET_COMMENCED' | 'REPEALED';
  description?: string;
  sourceAuthority: string;
  officialSourceUrl: string;
  sourceUrl?: string;
  totalSections?: number;
  chapters?: NormalizedActChapter[];
  relatedProvisions?: Array<{
    oldAct: string;
    oldSection: string;
    newAct: string;
    newSection: string;
    mappingType: string;
    explanation?: string;
  }>;
  rulesAndRegulations?: Array<{
    title: string;
    year?: number;
    url?: string;
  }>;
  amendments?: Array<{
    title: string;
    date?: string;
    details?: string;
  }>;
  source: DocumentSourceMetadata;
  isDynamic: boolean;
}

export interface ProviderEndpointStatus {
  endpoint: string;
  method: string;
  isPaid: boolean;
  requiresAuth: boolean;
  status: 'ACTIVE_FREE' | 'ACTIVE_WITH_TOKEN' | 'DISABLED_PAID_ENDPOINT' | 'UNAVAILABLE';
  billingMode: 'FREE' | 'PAID' | 'OFFICIAL_FALLBACK';
  notes: string;
}

export interface ProviderStatusDetail {
  id: string;
  name: string;
  enabled: boolean;
  configured: boolean;
  billingMode: 'FREE_TRIAL_DEVELOPER_ONLY' | 'PAID_ENDPOINTS_DISABLED' | 'FREE_GOVERNMENT_OFFICIAL' | 'FREE_PUBLIC_RECORD';
  paidEndpointsDisabled: boolean;
  status: 'CONFIGURED_ACTIVE' | 'AUTHENTICATION_REQUIRED' | 'DISABLED_PAID_ENDPOINT' | 'ONLINE_CONNECTED' | 'QUOTA_EXHAUSTED';
  message: string;
  attributionRequired: boolean;
  attributionText?: string;
  attributionUrl?: string;
  coverage: string;
  limitations: string;
  endpoints: ProviderEndpointStatus[];
}

export interface ProvidersStatusResponse {
  policy: {
    name: string;
    version: string;
    freeOnlyEnforced: boolean;
    paidEndpointsAllowed: boolean;
    zeroFullDocStorageEnforced: boolean;
  };
  providers: {
    indianKanoon: ProviderStatusDetail;
    eCourts: ProviderStatusDetail;
    indiaCode: ProviderStatusDetail;
    courtRegistries: ProviderStatusDetail;
    tribunals: ProviderStatusDetail;
  };
  serverTimestamp: string;
}

export interface LegalResearchSearchResult {
  success: boolean;
  query: LegalResearchQuery;
  results: {
    judgments?: NormalizedJudgment[];
    acts?: NormalizedAct[];
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  providersUsed: string[];
  providerStatus: Record<string, string>;
  coverageNotice: string;
  disclaimer: string;
}
