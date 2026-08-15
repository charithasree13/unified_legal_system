import { Request, Response } from 'express';
import { LegalSectionMapping } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';
import { seedSectionMappings } from '../seed/sectionMappingSeedData';

// GET /api/section-mappings
export const getSectionMappings = async (req: Request, res: Response) => {
  try {
    const { search, legacyAct, newAct, mappingType, mappingStatus } = req.query;

    let allMappings = await LegalSectionMapping.find();

    // Fallback to static seed array if DB returns empty
    if (!allMappings || allMappings.length === 0) {
      allMappings = seedSectionMappings.map((item, idx) => ({ ...item, _id: `builtin-${idx + 1}` }));
    }

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
      const q = search.toLowerCase().trim();
      allMappings = allMappings.filter((m: any) => {
        // Strip common prefixes like 'section', 'sec', 'sec.' for robust matching
        const cleanQ = q.replace(/^(section|sec\.?)\s*/i, '');
        const legacySecClean = m.legacySection?.toLowerCase().replace(/^(section|sec\.?)\s*/i, '');
        const newSecClean = m.newSection?.toLowerCase().replace(/^(section|sec\.?)\s*/i, '');

        return (
          m.legacySection?.toLowerCase().includes(q) ||
          m.newSection?.toLowerCase().includes(q) ||
          legacySecClean?.includes(cleanQ) ||
          newSecClean?.includes(cleanQ) ||
          m.legacyTitle?.toLowerCase().includes(q) ||
          m.newTitle?.toLowerCase().includes(q) ||
          m.factualNotes?.toLowerCase().includes(q)
        );
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

// GET /api/section-mappings/:id
export const getSectionMappingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let mapping = await LegalSectionMapping.findById(id);

    if (!mapping) {
      // Check in seed static data fallback
      const found = seedSectionMappings.find((m, i) => `builtin-${i + 1}` === id || m.legacySection.toLowerCase() === id.toLowerCase());
      if (found) {
        mapping = { ...found, _id: id };
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

// Built-in read-only enforcement
export const createSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(403).json({
    success: false,
    message: 'Legal section mappings are built-in statutory reference data and cannot be added manually.'
  });
};

export const updateSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(403).json({
    success: false,
    message: 'Legal section mappings are built-in statutory reference data and cannot be modified.'
  });
};

export const deleteSectionMapping = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(403).json({
    success: false,
    message: 'Legal section mappings are built-in statutory reference data and cannot be deleted.'
  });
};
