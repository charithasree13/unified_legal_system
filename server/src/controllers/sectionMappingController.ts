import { Request, Response } from 'express';
import { LegalSectionMapping, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

const ALLOWED_MAPPING_TYPES = [
  'DIRECT_REPLACEMENT',
  'MULTIPLE_REPLACEMENT',
  'PARTIAL_REPLACEMENT',
  'REORGANIZED',
  'NO_DIRECT_EQUIVALENT'
];

const ALLOWED_MAPPING_STATUSES = ['VERIFIED', 'NEEDS_REVIEW'];

// GET /api/section-mappings
export const getSectionMappings = async (req: Request, res: Response) => {
  try {
    const { search, legacyAct, newAct, mappingType, mappingStatus } = req.query;

    let allMappings = await LegalSectionMapping.find();

    if (legacyAct && typeof legacyAct === 'string') {
      allMappings = allMappings.filter((m: any) => 
        m.legacyAct?.toLowerCase().includes(legacyAct.toLowerCase())
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

    if (mappingStatus && typeof mappingStatus === 'string') {
      allMappings = allMappings.filter((m: any) => m.mappingStatus === mappingStatus);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      allMappings = allMappings.filter((m: any) => 
        m.legacySection?.toLowerCase().includes(q) ||
        m.newSection?.toLowerCase().includes(q) ||
        m.legacyTitle?.toLowerCase().includes(q) ||
        m.newTitle?.toLowerCase().includes(q) ||
        m.factualNotes?.toLowerCase().includes(q)
      );
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

// GET /api/section-mappings/:id
export const getSectionMappingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mapping = await LegalSectionMapping.findById(id);

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

// POST /api/section-mappings
export const createSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      legacyAct,
      legacySection,
      legacyTitle,
      newAct,
      newSection,
      newTitle,
      mappingType,
      mappingStatus,
      sourceReference,
      factualNotes
    } = req.body;

    if (!legacyAct || !legacySection || !legacyTitle || !newAct || !newSection || !newTitle) {
      return res.status(400).json({
        success: false,
        message: 'All statutory act and section title fields are required.'
      });
    }

    if (!ALLOWED_MAPPING_TYPES.includes(mappingType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mappingType. Must be one of: ${ALLOWED_MAPPING_TYPES.join(', ')}`
      });
    }

    const finalStatus = ALLOWED_MAPPING_STATUSES.includes(mappingStatus) ? mappingStatus : 'NEEDS_REVIEW';

    if (!sourceReference || typeof sourceReference !== 'string' || !sourceReference.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Every verified or stored mapping must contain a valid sourceReference.'
      });
    }

    const newMapping = await LegalSectionMapping.create({
      legacyAct,
      legacySection,
      legacyTitle,
      newAct,
      newSection,
      newTitle,
      mappingType,
      mappingStatus: finalStatus,
      sourceReference,
      factualNotes: factualNotes || '',
      createdBy: req.user?.name || 'Authorized User'
    });

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        role: req.user.role,
        action: `CREATED_SECTION_MAPPING: ${legacySection} -> ${newSection}`,
        details: `Mapping created with status ${finalStatus}`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Legal section mapping created successfully.',
      data: newMapping
    });
  } catch (error) {
    console.error('Error creating section mapping:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create legal section mapping.'
    });
  }
};

// PUT /api/section-mappings/:id
export const updateSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.mappingType && !ALLOWED_MAPPING_TYPES.includes(updateData.mappingType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mappingType. Must be one of: ${ALLOWED_MAPPING_TYPES.join(', ')}`
      });
    }

    if (updateData.mappingStatus && !ALLOWED_MAPPING_STATUSES.includes(updateData.mappingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mappingStatus. Must be one of: ${ALLOWED_MAPPING_STATUSES.join(', ')}`
      });
    }

    const updated = await LegalSectionMapping.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Legal section mapping not found.'
      });
    }

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        role: req.user.role,
        action: `UPDATED_SECTION_MAPPING: ${updated.legacySection} -> ${updated.newSection}`,
        details: `Status: ${updated.mappingStatus}, Type: ${updated.mappingType}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Legal section mapping updated successfully.',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update legal section mapping.'
    });
  }
};

// DELETE /api/section-mappings/:id
export const deleteSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await LegalSectionMapping.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Legal section mapping not found.'
      });
    }

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        role: req.user.role,
        action: `DELETED_SECTION_MAPPING: ${deleted.legacySection}`,
        details: `Deleted mapping ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Legal section mapping deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete legal section mapping.'
    });
  }
};
