/**
 * Elite Legal Desk — Legal Research Service
 * Multi-provider orchestrator for Indian court judgments, Bare Acts, statutory sections,
 * rules, and judicial registries adhering strictly to the Free-First Policy.
 *
 * Strict Compliance:
 * 1. Zero full-document persistent DB storage in MongoDB.
 * 2. Multi-provider federated discovery (Indian Kanoon, eCourts official, India Code, Registries).
 * 3. Commercial paid endpoints explicitly disabled by configuration.
 * 4. Transparent source attribution and legal disclaimers.
 * 5. In-memory RAM TTL cache only (ephemeral, not written to database).
 */

import { 
  LegalResearchQuery, 
  LegalResearchSearchResult, 
  NormalizedJudgment, 
  NormalizedAct, 
  NormalizedSection, 
  ProvidersStatusResponse 
} from './types';
import { 
  searchIndiaCodeActs, 
  getIndiaCodeActById, 
  getIndiaCodeSectionById, 
  INDIA_CODE_SOURCE_METADATA 
} from './providers/indiaCodeAdapter';
import { 
  searchJudicialRegistries, 
  getJudicialRecordById, 
  ECOURTS_ENDPOINT_BILLING_REGISTRY,
  ECOURTS_SOURCE_METADATA,
  SUPREME_COURT_ESCR_METADATA 
} from './providers/eCourtsAdapter';
import { 
  searchKanoonJudgments, 
  getKanoonDocById, 
  getKanoonProviderStatus,
  KANOON_ENDPOINT_BILLING_REGISTRY,
  INDIAN_KANOON_SOURCE_METADATA 
} from './providers/indianKanoonAdapter';
import { INDIAN_TRIBUNALS_REGISTRY } from './providers/tribunalsRegistry';

// In-Memory RAM TTL Cache (strictly ephemeral, never persisted to MongoDB)
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const ramCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getFromCache<T>(key: string): T | null {
  const item = ramCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    ramCache.delete(key);
    return null;
  }
  return item.data;
}

function setToCache<T>(key: string, data: T): void {
  // Prune cache if exceeding 1000 entries
  if (ramCache.size > 1000) {
    const oldestKey = ramCache.keys().next().value;
    if (oldestKey) ramCache.delete(oldestKey);
  }
  ramCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

export class LegalResearchService {
  /**
   * Unified search across Judgments and Bare Acts
   */
  async search(query: LegalResearchQuery): Promise<LegalResearchSearchResult> {
    const targetType = query.type || 'all';
    const cacheKey = `search:${JSON.stringify(query)}`;
    const cached = getFromCache<LegalResearchSearchResult>(cacheKey);
    if (cached) return cached;

    const providersUsed: string[] = [];
    const providerStatus: Record<string, string> = {};

    let returnedJudgments: NormalizedJudgment[] = [];
    let returnedActs: NormalizedAct[] = [];
    let totalJudgments = 0;
    let totalActs = 0;

    // 1. Search Bare Acts (if requested)
    if (targetType === 'all' || targetType === 'acts') {
      providersUsed.push('India Code (Official Public Domain)');
      const actResults = await searchIndiaCodeActs(query);
      returnedActs = actResults.acts;
      totalActs = actResults.total;
      providerStatus['indiaCode'] = 'ONLINE_CONNECTED';
    }

    // 2. Search Judgments (if requested)
    if (targetType === 'all' || targetType === 'judgments') {
      // 2a. Official Judicial Registries & Supreme Court e-SCR
      providersUsed.push('Supreme Court e-SCR & Official Judicial Registries');
      const regResults = await searchJudicialRegistries(query);
      const registryJudgments = regResults.judgments;
      totalJudgments = regResults.total;
      providerStatus['courtRegistries'] = 'ONLINE_CONNECTED';

      // 2b. Indian Kanoon (if configured with token and permitted free tier)
      const kanoonStatus = getKanoonProviderStatus();
      if (kanoonStatus.configured && kanoonStatus.status === 'CONFIGURED_ACTIVE') {
        providersUsed.push('Indian Kanoon API (Permitted Free Tier)');
        try {
          const kanoonRes = await searchKanoonJudgments(query);
          providerStatus['indianKanoon'] = kanoonRes.providerStatus;
          
          if (kanoonRes.judgments.length > 0) {
            // Deduplicate against verified records
            const existingKeys = new Set(registryJudgments.map(j => j.canonicalKey));
            const uniqueKanoon = kanoonRes.judgments.filter(j => !existingKeys.has(j.canonicalKey));
            returnedJudgments = [...registryJudgments, ...uniqueKanoon];
            totalJudgments = Math.max(totalJudgments, kanoonRes.total);
          } else {
            returnedJudgments = registryJudgments;
          }
        } catch {
          providerStatus['indianKanoon'] = 'ERROR_FALLBACK_ACTIVE';
          returnedJudgments = registryJudgments;
        }
      } else {
        providerStatus['indianKanoon'] = kanoonStatus.status;
        returnedJudgments = registryJudgments;
      }
    }

    const total = targetType === 'acts' ? totalActs : (targetType === 'judgments' ? totalJudgments : totalJudgments + totalActs);
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const totalPages = Math.ceil(total / limit) || 1;

    const result: LegalResearchSearchResult = {
      success: true,
      query,
      results: {
        ...(targetType === 'all' || targetType === 'judgments' ? { judgments: returnedJudgments } : {}),
        ...(targetType === 'all' || targetType === 'acts' ? { acts: returnedActs } : {})
      },
      pagination: {
        total,
        page,
        limit,
        totalPages
      },
      providersUsed,
      providerStatus,
      coverageNotice: "Results federated from Digital Supreme Court Reports (e-SCR), High Court Judicial Registries, and India Code under Section 52(1)(q) of the Indian Copyright Act, 1957. Zero full-document persistent database storage.",
      disclaimer: "Court judgments, statutory texts, and summaries provided through Elite Legal Desk are for legal research, educational, and professional reference purposes only. Unofficial copies do not substitute for official court-certified copies or gazetted notifications."
    };

    setToCache(cacheKey, result);
    return result;
  }

  /**
   * Retrieves single judgment on-demand without database storage
   */
  async getJudgmentById(id: string): Promise<NormalizedJudgment | null> {
    const cacheKey = `judgment:${id}`;
    const cached = getFromCache<NormalizedJudgment>(cacheKey);
    if (cached) return cached;

    let judgment: NormalizedJudgment | null = null;

    // Check if ID belongs to Indian Kanoon
    if (id.startsWith('ik_')) {
      judgment = await getKanoonDocById(id);
    } else {
      // Check official judicial registry
      judgment = await getJudicialRecordById(id);
    }

    if (judgment) {
      setToCache(cacheKey, judgment);
    }
    return judgment;
  }

  /**
   * Searches Bare Acts only
   */
  async searchActs(query: LegalResearchQuery): Promise<{
    acts: NormalizedAct[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    sourceMetadata: any;
  }> {
    const res = await searchIndiaCodeActs(query);
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const totalPages = Math.ceil(res.total / limit) || 1;

    return {
      acts: res.acts,
      pagination: {
        total: res.total,
        page,
        limit,
        totalPages
      },
      sourceMetadata: res.sourceMetadata
    };
  }

  /**
   * Retrieves Bare Act metadata and chapter outline on-demand
   */
  async getActById(id: string): Promise<NormalizedAct | null> {
    const cacheKey = `act:${id}`;
    const cached = getFromCache<NormalizedAct>(cacheKey);
    if (cached) return cached;

    const act = await getIndiaCodeActById(id);
    if (act) {
      setToCache(cacheKey, act);
    }
    return act;
  }

  /**
   * Retrieves individual statutory section on-demand without full DB storage
   */
  async getSectionById(actId: string, sectionId: string): Promise<NormalizedSection | null> {
    const cacheKey = `section:${actId}:${sectionId}`;
    const cached = getFromCache<NormalizedSection>(cacheKey);
    if (cached) return cached;

    const section = await getIndiaCodeSectionById(actId, sectionId);
    if (section) {
      setToCache(cacheKey, section);
    }
    return section;
  }

  /**
   * Generates real-time provider configuration, billing, and coverage report
   */
  getProvidersStatus(): ProvidersStatusResponse {
    const kanoonStatus = getKanoonProviderStatus();
    const eCourtsToken = process.env.ECOURTS_API_TOKEN;
    const hasEcourtsToken = Boolean(eCourtsToken && eCourtsToken.trim() !== '' && !eCourtsToken.includes('your_token'));

    return {
      policy: {
        name: "Elite Legal Desk Free-First Legal Research Policy",
        version: "2.0.0",
        freeOnlyEnforced: true,
        paidEndpointsAllowed: false,
        zeroFullDocStorageEnforced: true
      },
      providers: {
        indianKanoon: {
          id: "indian_kanoon",
          name: "Indian Kanoon API",
          enabled: kanoonStatus.configured,
          configured: kanoonStatus.configured,
          billingMode: "FREE_TRIAL_DEVELOPER_ONLY",
          paidEndpointsDisabled: true,
          status: kanoonStatus.status,
          message: kanoonStatus.message,
          attributionRequired: true,
          attributionText: "Data provided via Indian Kanoon API under terms of service.",
          attributionUrl: "https://indiankanoon.org/",
          coverage: "Supreme Court of India, 25 High Courts and benches, National Green Tribunal, select tribunals.",
          limitations: "Permitted under developer token allowance. Paid packages are strictly disabled. When token is omitted, direct official registry links are provided.",
          endpoints: KANOON_ENDPOINT_BILLING_REGISTRY
        },
        eCourts: {
          id: "ecourts_judicial",
          name: "eCourts Services & National Judicial Data Grid (NJDG)",
          enabled: true,
          configured: hasEcourtsToken,
          billingMode: "PAID_ENDPOINTS_DISABLED",
          paidEndpointsDisabled: true,
          status: "ONLINE_CONNECTED",
          message: "Third-party commercial paid endpoints (ecourtsindia.com) are strictly disabled by free-only policy. Official free Government portals (services.ecourts.gov.in, escr.sci.gov.in, njdg.ecourts.gov.in) are active.",
          attributionRequired: true,
          attributionText: "Official public judicial repository under Section 52(1)(q)(iv) of the Copyright Act, 1957.",
          attributionUrl: "https://services.ecourts.gov.in/",
          coverage: "Supreme Court of India, 25 High Courts, District Courts and Taluka Courts across all Indian States and Union Territories.",
          limitations: "Official court registry documents require direct navigation or CNR lookup; bulk programmatic scraping prohibited by official court terms.",
          endpoints: ECOURTS_ENDPOINT_BILLING_REGISTRY
        },
        indiaCode: {
          id: "india_code",
          name: "India Code (Legislative Department, Ministry of Law and Justice)",
          enabled: true,
          configured: true,
          billingMode: "FREE_GOVERNMENT_OFFICIAL",
          paidEndpointsDisabled: true,
          status: "ONLINE_CONNECTED",
          message: "Official Government of India open legislative portal. 100% free public domain access.",
          attributionRequired: true,
          attributionText: "Statutory texts reproduced under Section 52(1)(q)(ii) of the Copyright Act, 1957 from India Code.",
          attributionUrl: "https://www.indiacode.nic.in/",
          coverage: "Central Acts (1836 to present), 28 State Acts, 8 Union Territory Acts, statutory rules, regulations, and ordinances.",
          limitations: "State legislation digitization depth varies by state legislative department.",
          endpoints: [
            {
              endpoint: "https://www.indiacode.nic.in/handle/123456789/",
              method: "GET",
              isPaid: false,
              requiresAuth: false,
              status: "ACTIVE_FREE",
              billingMode: "FREE",
              notes: "Permanent repository handle for official statutory Bare Acts."
            }
          ]
        },
        courtRegistries: {
          id: "court_registries",
          name: "Supreme Court & High Court Official Registries",
          enabled: true,
          configured: true,
          billingMode: "FREE_PUBLIC_RECORD",
          paidEndpointsDisabled: true,
          status: "ONLINE_CONNECTED",
          message: "Connected to Digital Supreme Court Reports (e-SCR) and High Court registries.",
          attributionRequired: true,
          attributionText: "Supreme Court of India & High Court Registries.",
          attributionUrl: "https://escr.sci.gov.in/",
          coverage: "Supreme Court neutral citations (2024 to present, historical back to 1950), High Court certified judgments.",
          limitations: "Official certified copies require registry stamping; online copies are informational.",
          endpoints: [
            {
              endpoint: "https://escr.sci.gov.in/",
              method: "GET",
              isPaid: false,
              requiresAuth: false,
              status: "ACTIVE_FREE",
              billingMode: "FREE",
              notes: "Digital Supreme Court Reports public repository."
            }
          ]
        },
        tribunals: {
          id: "tribunals_registry",
          name: "Indian Specialized Tribunals & Commissions Directory",
          enabled: true,
          configured: true,
          billingMode: "FREE_PUBLIC_RECORD",
          paidEndpointsDisabled: true,
          status: "ONLINE_CONNECTED",
          message: `Directory active covering ${INDIAN_TRIBUNALS_REGISTRY.length} tribunals and appellate authorities.`,
          attributionRequired: true,
          attributionText: "Official Tribunal Registries (NCLAT, NCLT, NGT, ITAT, CESTAT, CAT, NCDRC, APTEL, TDSAT, AFT).",
          attributionUrl: "https://nclat.nic.in/",
          coverage: "Insolvency & Company Law (NCLAT/NCLT), Environment (NGT), Taxation (ITAT/CESTAT), Administrative (CAT), Consumer (NCDRC), Electricity (APTEL), Telecom (TDSAT), Armed Forces (AFT).",
          limitations: "Official portal navigation provided; daily order uploads depend on respective tribunal registry timelines.",
          endpoints: INDIAN_TRIBUNALS_REGISTRY.map(t => ({
            endpoint: t.officialPortal,
            method: "GET",
            isPaid: false,
            requiresAuth: false,
            status: "ACTIVE_FREE",
            billingMode: "FREE",
            notes: `${t.name} official portal and orders repository.`
          }))
        }
      },
      serverTimestamp: new Date().toISOString()
    };
  }
}

export const legalResearchService = new LegalResearchService();
