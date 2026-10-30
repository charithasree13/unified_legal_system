/**
 * Elite Legal Desk — Legal Research Controller
 * Exposes Free-First Legal Research API endpoints for Indian Judgments and Bare Acts.
 * All endpoints enforce authentication and advocate/admin authorization.
 */

import { Request, Response } from 'express';
import { legalResearchService } from '../services/legalResearch/legalResearchService';
import { LegalResearchQuery, CourtLevel } from '../services/legalResearch/types';

// Helper to safely clean string query inputs
function cleanStr(val: any): string | undefined {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim();
  // Strip control characters
  return s.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * GET /api/legal-research/search
 * Unified or tabbed search across Judgments, Court Orders, and Statutory Bare Acts.
 */
export const search = async (req: Request, res: Response) => {
  try {
    const { 
      q, search: searchQuery, type, court, courtLevel, state, bench, judge, 
      year, yearRange, citation, caseNumber, jurisdiction, category, 
      subject, sectionNumber, actStatus, letter, docType, page, limit, sort, provider 
    } = req.query;

    const parsedQuery: LegalResearchQuery = {
      search: cleanStr(searchQuery || q),
      type: (type === 'judgments' || type === 'acts' || type === 'all') ? type : 'all',
      court: cleanStr(court),
      courtLevel: courtLevel as CourtLevel,
      state: cleanStr(state),
      bench: cleanStr(bench),
      judge: cleanStr(judge),
      year: cleanStr(year),
      yearRange: cleanStr(yearRange),
      citation: cleanStr(citation),
      caseNumber: cleanStr(caseNumber),
      jurisdiction: cleanStr(jurisdiction),
      category: cleanStr(category || subject),
      subject: cleanStr(subject || category),
      sectionNumber: cleanStr(sectionNumber),
      actStatus: cleanStr(actStatus),
      letter: cleanStr(letter),
      docType: cleanStr(docType),
      page: Math.max(1, parseInt(String(page || '1'), 10) || 1),
      limit: Math.max(1, Math.min(50, parseInt(String(limit || '10'), 10) || 10)),
      sort: (sort === 'oldest' || sort === 'relevance' || sort === 'title') ? sort : 'newest',
      provider: cleanStr(provider)
    };

    const results = await legalResearchService.search(parsedQuery);
    return res.status(200).json(results);
  } catch (error: any) {
    console.error('Error executing legal research search:', error.message || error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while executing the legal research query. Please retry or refine your keywords.' 
    });
  }
};

/**
 * GET /api/legal-research/judgments/:id
 * Retrieves judgment details and on-demand content without DB persistence.
 */
export const getJudgmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cleanId = cleanStr(id);
    if (!cleanId) {
      return res.status(400).json({ success: false, message: 'Valid judgment identifier is required.' });
    }

    const judgment = await legalResearchService.getJudgmentById(cleanId);
    if (!judgment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Judgment record not found in available legal repositories or registries.' 
      });
    }

    return res.status(200).json({
      success: true,
      judgment,
      disclaimer: "Unofficial judicial determination copy for research only. Official court-certified copies must be obtained from the respective registry."
    });
  } catch (error: any) {
    console.error('Error retrieving judgment by id:', error.message || error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve judgment details from upstream repository.' 
    });
  }
};

/**
 * GET /api/legal-research/acts/search
 * Searches Central and State Bare Acts, Rules and Regulations.
 */
export const searchActs = async (req: Request, res: Response) => {
  try {
    const { q, search: searchQuery, jurisdiction, category, year, actStatus, letter, page, limit, sort } = req.query;

    const parsedQuery: LegalResearchQuery = {
      search: cleanStr(searchQuery || q),
      jurisdiction: cleanStr(jurisdiction),
      category: cleanStr(category),
      year: cleanStr(year),
      actStatus: cleanStr(actStatus),
      letter: cleanStr(letter),
      page: Math.max(1, parseInt(String(page || '1'), 10) || 1),
      limit: Math.max(1, Math.min(50, parseInt(String(limit || '10'), 10) || 10)),
      sort: (sort === 'oldest' || sort === 'title') ? sort : 'newest'
    };

    const result = await legalResearchService.searchActs(parsedQuery);
    return res.status(200).json({
      success: true,
      ...result,
      sourceNotice: "Statutory Bare Acts catalogued from India Code and Official Gazettes under Section 52(1)(q)(ii) of the Copyright Act, 1957."
    });
  } catch (error: any) {
    console.error('Error searching Bare Acts:', error.message || error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while querying the statutory Bare Acts repository.' 
    });
  }
};

/**
 * GET /api/legal-research/acts/:id
 * Retrieves Bare Act metadata, statement of objects, and chapter/section outline.
 */
export const getActById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cleanId = cleanStr(id);
    if (!cleanId) {
      return res.status(400).json({ success: false, message: 'Valid Bare Act identifier is required.' });
    }

    const act = await legalResearchService.getActById(cleanId);
    if (!act) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bare Act not found in official statutory repository.' 
      });
    }

    return res.status(200).json({
      success: true,
      act,
      sourceNotice: "Official statutory text provided under Section 52(1)(q)(ii) Copyright Act, 1957 from India Code."
    });
  } catch (error: any) {
    console.error('Error retrieving act by id:', error.message || error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve Bare Act details from official repository.' 
    });
  }
};

/**
 * GET /api/legal-research/acts/:id/sections/:sectionId
 * Retrieves dynamic section text, subsections, amendments, and related provisions on-demand.
 */
export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { id, sectionId } = req.params;
    const cleanActId = cleanStr(id);
    const cleanSecId = cleanStr(sectionId);

    if (!cleanActId || !cleanSecId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both Act ID and Section identifier are required.' 
      });
    }

    const section = await legalResearchService.getSectionById(cleanActId, cleanSecId);
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: `Section ${cleanSecId} not found for Act ${cleanActId}. Refer to official India Code handle.` 
      });
    }

    return res.status(200).json({
      success: true,
      section,
      sourceNotice: "Official statutory provision fetched on-demand from India Code without persistent database storage."
    });
  } catch (error: any) {
    console.error('Error retrieving section by id:', error.message || error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve statutory section provision.' 
    });
  }
};

/**
 * GET /api/legal-research/providers/status
 * Real-time verification of provider billing, free-only policy, API token status,
 * and coverage limitations.
 */
export const getProvidersStatus = async (_req: Request, res: Response) => {
  try {
    const statusReport = legalResearchService.getProvidersStatus();
    return res.status(200).json({
      success: true,
      ...statusReport
    });
  } catch (error: any) {
    console.error('Error generating providers status:', error.message || error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate provider status report.' 
    });
  }
};
