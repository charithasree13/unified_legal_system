import { Request, Response } from 'express';
import { LegalSectionMapping } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';
import { seedSectionMappings, generateCanonicalKey } from '../seed/sectionMappingSeedData';

// GET /api/section-mappings
export const getSectionMappings = async (req: Request, res: Response) => {
  try {
    const { search, oldAct, newAct, actPair, direction, mappingType, verificationStatus } = req.query;

    let allMappings: any[] = [];
    try {
      allMappings = await LegalSectionMapping.find().sort({ oldSection: 1 });
    } catch (dbErr) {
      console.warn('MongoDB query warning for section mappings, using built-in seed dataset fallback:', dbErr);
    }

    // Fallback to static seed array if DB returns empty or errors out
    if (!allMappings || allMappings.length === 0) {
      allMappings = seedSectionMappings.map((item, idx) => ({ ...item, _id: `builtin-${idx + 1}` }));
    }

    // Filter by specific Act pair or individual act filters
    if (actPair && typeof actPair === 'string') {
      const pair = actPair.toUpperCase();
      if (pair === 'IPC_BNS' || pair === 'IPC' || pair === 'BNS') {
        allMappings = allMappings.filter((m: any) =>
          (m.oldAct?.includes('Penal Code') || m.oldAct === 'IPC') &&
          (m.newAct?.includes('Nyaya') || m.newAct === 'BNS')
        );
      } else if (pair === 'CRPC_BNSS' || pair === 'CRPC' || pair === 'BNSS') {
        allMappings = allMappings.filter((m: any) =>
          (m.oldAct?.includes('Criminal Procedure') || m.oldAct === 'CrPC') &&
          (m.newAct?.includes('Nagarik Suraksha') || m.newAct === 'BNSS')
        );
      } else if (pair === 'IEA_BSA' || pair === 'EVIDENCE' || pair === 'BSA') {
        allMappings = allMappings.filter((m: any) =>
          (m.oldAct?.includes('Evidence') || m.oldAct === 'IEA') &&
          (m.newAct?.includes('Sakshya') || m.newAct === 'BSA')
        );
      }
    }

    if (oldAct && typeof oldAct === 'string') {
      allMappings = allMappings.filter((m: any) =>
        m.oldAct?.toLowerCase().includes(oldAct.toLowerCase())
      );
    }

    if (newAct && typeof newAct === 'string') {
      allMappings = allMappings.filter((m: any) =>
        m.newAct?.toLowerCase().includes(newAct.toLowerCase())
      );
    }

    if (mappingType && typeof mappingType === 'string') {
      allMappings = allMappings.filter((m: any) => m.mappingType === mappingType);
    }

    if (verificationStatus && typeof verificationStatus === 'string') {
      allMappings = allMappings.filter((m: any) => m.verificationStatus === verificationStatus);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      const cleanQ = q.replace(/^(section|sec\.?)\s*/i, '').trim();

      allMappings = allMappings.filter((m: any) => {
        const oldSecClean = (m.oldSection || m.legacySection || '').toLowerCase().replace(/^(section|sec\.?)\s*/i, '').trim();
        const newSecClean = (m.newSection || '').toLowerCase().replace(/^(section|sec\.?)\s*/i, '').trim();

        const matchOldSec = oldSecClean === cleanQ || (m.oldSection || m.legacySection || '').toLowerCase().includes(q);
        const matchNewSec = newSecClean === cleanQ || (m.newSection || '').toLowerCase().includes(q);
        const matchOldTitle = (m.oldSectionTitle || m.legacyTitle || '').toLowerCase().includes(q);
        const matchNewTitle = (m.newSectionTitle || m.newTitle || '').toLowerCase().includes(q);
        const matchExplanation = (m.mappingExplanation || m.factualNotes || '').toLowerCase().includes(q);
        const matchContent = (m.newSectionContent || '').toLowerCase().includes(q);
        const matchKeyChanges = (m.keyChanges || '').toLowerCase().includes(q);

        return matchOldSec || matchNewSec || matchOldTitle || matchNewTitle || matchExplanation || matchContent || matchKeyChanges;
      });
    }

    return res.status(200).json({
      success: true,
      count: allMappings.length,
      data: allMappings
    });
  } catch (error) {
    console.error('Error fetching section mappings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch legal section mappings.'
    });
  }
};

// GET /api/section-mappings/health/report (Admin Quality Report)
export const getMappingHealthReport = async (req: Request, res: Response) => {
  try {
    let allMappings: any[] = [];
    try {
      allMappings = await LegalSectionMapping.find();
    } catch (err) {
      console.warn('MongoDB query warning for health report, fallback to seed array:', err);
    }

    if (!allMappings || allMappings.length === 0) {
      allMappings = seedSectionMappings;
    }

    const totalMappings = allMappings.length;
    const verifiedMappings = allMappings.filter(m => m.verificationStatus === 'VERIFIED').length;
    const secondarySourceVerified = allMappings.filter(m => m.verificationStatus === 'SECONDARY_SOURCE_VERIFIED').length;
    const needsReview = allMappings.filter(m => m.verificationStatus === 'NEEDS_REVIEW').length;

    // Check duplicates by canonicalKey
    const canonicalSet = new Set<string>();
    let duplicateCount = 0;
    allMappings.forEach(m => {
      const key = m.canonicalKey || generateCanonicalKey(m.oldAct, m.oldSection, m.newAct, m.newSection);
      if (canonicalSet.has(key)) {
        duplicateCount++;
      } else {
        canonicalSet.add(key);
      }
    });

    // Invalid records check
    const invalidRecords = allMappings.filter(m =>
      !m.oldAct || !m.oldSection || !m.newAct || !m.newSection || !m.mappingType || !m.sourceName
    ).length;

    // Latest verified date
    let lastVerifiedDate = new Date('2024-07-01');
    allMappings.forEach(m => {
      if (m.lastVerifiedAt) {
        const d = new Date(m.lastVerifiedAt);
        if (!isNaN(d.getTime()) && d > lastVerifiedDate) {
          lastVerifiedDate = d;
        }
      }
    });

    const ipcBnsCount = allMappings.filter(m => (m.oldAct?.includes('Penal') || m.oldAct === 'IPC')).length;
    const crpcBnssCount = allMappings.filter(m => (m.oldAct?.includes('Procedure') || m.oldAct === 'CrPC')).length;
    const ieaBsaCount = allMappings.filter(m => (m.oldAct?.includes('Evidence') || m.oldAct === 'IEA')).length;

    return res.status(200).json({
      success: true,
      report: {
        totalMappings,
        verifiedMappings,
        secondarySourceVerified,
        needsReview,
        duplicates: duplicateCount,
        invalidRecords,
        lastVerifiedDate: lastVerifiedDate.toISOString().split('T')[0],
        actPairBreakdown: {
          ipcToBns: ipcBnsCount,
          crpcToBnss: crpcBnssCount,
          evidenceToBsa: ieaBsaCount
        },
        officialPrimarySource: 'India Code (https://www.indiacode.nic.in/)'
      }
    });
  } catch (error) {
    console.error('Error generating health report:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate mapping data health report.' });
  }
};

// GET /api/section-mappings/:id
export const getSectionMappingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let mapping = await LegalSectionMapping.findById(id);

    if (!mapping) {
      const found = seedSectionMappings.find((m, i) => `builtin-${i + 1}` === id || (m.oldSection && m.oldSection.toLowerCase() === id.toLowerCase()));
      if (found) {
        mapping = { ...found, _id: id } as any;
      }
    }

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Legal section mapping not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: mapping
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve legal section mapping details.'
    });
  }
};

// POST /api/section-mappings (Admin only)
export const createSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      oldAct,
      oldSection,
      oldSectionTitle,
      newAct,
      newSection,
      newSectionTitle,
      mappingType,
      mappingExplanation,
      newSectionContent,
      keyChanges,
      sourceName,
      sourceUrl,
      officialSourceUrl,
      verificationStatus
    } = req.body;

    if (!oldAct || !oldSection || !newAct || !newSection || !mappingType) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: oldAct, oldSection, newAct, newSection, mappingType.'
      });
    }

    const canonicalKey = generateCanonicalKey(oldAct, oldSection, newAct, newSection);

    // Check duplicate
    const existing = await LegalSectionMapping.findOne({ canonicalKey });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Mapping already exists for canonical key: ${canonicalKey}`,
        existingId: existing._id
      });
    }

    const newMapping = new LegalSectionMapping({
      oldAct,
      oldSection,
      oldSectionTitle,
      newAct,
      newSection,
      newSectionTitle,
      mappingType,
      mappingExplanation,
      newSectionContent: newSectionContent || '',
      keyChanges: keyChanges || '',
      sourceName: sourceName || 'India Code',
      sourceUrl: sourceUrl || 'https://www.indiacode.nic.in/',
      officialSourceUrl: officialSourceUrl || 'https://www.indiacode.nic.in/',
      verificationStatus: verificationStatus || 'VERIFIED',
      verifiedBy: req.user?.name || req.user?.email || 'Admin',
      lastVerifiedAt: new Date(),
      canonicalKey
    });

    await newMapping.save();

    return res.status(201).json({
      success: true,
      message: 'Legal section mapping created successfully.',
      data: newMapping
    });
  } catch (error: any) {
    console.error('Error creating section mapping:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create section mapping.'
    });
  }
};

// PUT /api/section-mappings/:id (Admin only)
export const updateSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.oldAct || updateData.oldSection || updateData.newAct || updateData.newSection) {
      const mapping = await LegalSectionMapping.findById(id);
      if (mapping) {
        const oldAct = updateData.oldAct || mapping.oldAct;
        const oldSection = updateData.oldSection || mapping.oldSection;
        const newAct = updateData.newAct || mapping.newAct;
        const newSection = updateData.newSection || mapping.newSection;
        updateData.canonicalKey = generateCanonicalKey(oldAct, oldSection, newAct, newSection);
      }
    }

    updateData.lastVerifiedAt = new Date();
    updateData.verifiedBy = req.user?.name || req.user?.email || 'Admin';

    const updated = await LegalSectionMapping.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Legal section mapping not found for update.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Legal section mapping updated successfully.',
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating section mapping:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update section mapping.'
    });
  }
};

// DELETE /api/section-mappings/:id (Admin only)
export const deleteSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await LegalSectionMapping.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Legal section mapping not found for deletion.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Legal section mapping deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting section mapping:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete section mapping.'
    });
  }
};

