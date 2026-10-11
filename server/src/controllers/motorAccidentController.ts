import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  calculateMotorAccidentCompensation,
  MotorAccidentClaimInput,
  MotorAccidentCalculationResult
} from '../services/motorAccidentEngine';
import {
  MACT_LEGAL_RULES,
  SARLA_VERMA_MULTIPLIER_TABLE
} from '../data/motorAccidentRules';
import { MotorAccidentCalculationRecord, AuditLog } from '../models/Schemas';

/**
 * Controller for Motor Accident Compensation Calculator (MACT)
 * STRICT ACCESS CONTROL: Admin and Advocate roles only.
 */

/**
 * Helper: Strict Role Verification
 */
function verifyAdminOrAdvocateRole(req: AuthenticatedRequest, res: Response): boolean {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access the Motor Accident Compensation Calculator.'
    });
    return false;
  }

  const roleLower = (req.user.role || '').toLowerCase();
  if (roleLower !== 'admin' && roleLower !== 'advocate') {
    res.status(403).json({
      success: false,
      message: 'Access Denied: The Motor Accident Compensation Calculator is restricted exclusively to Administrators and Advocates.'
    });
    return false;
  }

  return true;
}

/**
 * Calculate MACT Compensation
 * POST /api/calculators/motor-accident/calculate
 */
export const calculateCompensation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!verifyAdminOrAdvocateRole(req, res)) return;

    const inputData: MotorAccidentClaimInput = req.body;
    if (!inputData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Motor accident claim parameters are required.'
      });
    }

    if (!inputData.claimType) {
      return res.status(400).json({
        success: false,
        message: 'Claim type is required (death, permanent_disability, injury_medical, loss_of_income_treatment, other_compensation).'
      });
    }

    const validClaimTypes = [
      'death',
      'permanent_disability',
      'injury_medical',
      'loss_of_income_treatment',
      'other_compensation'
    ];

    if (!validClaimTypes.includes(inputData.claimType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid claim type. Must be one of: ${validClaimTypes.join(', ')}`
      });
    }

    if (!inputData.accidentDate) {
      return res.status(400).json({
        success: false,
        message: 'Accident date is required to evaluate statutory applicability and limitation.'
      });
    }

    // Input boundary validations
    if (inputData.claimType === 'death') {
      const d = inputData.deathDetails;
      if (!d) {
        return res.status(400).json({ success: false, message: 'Death compensation parameters are required.' });
      }
      if (typeof d.ageAtAccident !== 'number' || d.ageAtAccident < 0 || d.ageAtAccident > 120) {
        return res.status(400).json({ success: false, message: 'Valid age at accident (0 - 120) is required.' });
      }
      if (typeof d.incomeAmount !== 'number' || d.incomeAmount < 0) {
        return res.status(400).json({ success: false, message: 'Valid non-negative established income is required.' });
      }
      if (typeof d.dependantsCount !== 'number' || d.dependantsCount < 0) {
        return res.status(400).json({ success: false, message: 'Valid non-negative dependants count is required.' });
      }
    } else if (inputData.claimType === 'permanent_disability') {
      const d = inputData.disabilityDetails;
      if (!d) {
        return res.status(400).json({ success: false, message: 'Disability compensation parameters are required.' });
      }
      if (typeof d.ageAtAccident !== 'number' || d.ageAtAccident < 0 || d.ageAtAccident > 120) {
        return res.status(400).json({ success: false, message: 'Valid age at accident (0 - 120) is required.' });
      }
      if (typeof d.functionalDisabilityPercent !== 'number' || d.functionalDisabilityPercent < 0 || d.functionalDisabilityPercent > 100) {
        return res.status(400).json({ success: false, message: 'Functional disability percentage must be between 0 and 100%.' });
      }
    } else if (inputData.claimType === 'injury_medical') {
      const d = inputData.injuryMedicalDetails;
      if (!d || !Array.isArray(d.expenses) || d.expenses.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one itemised medical expense is required.' });
      }
    } else if (inputData.claimType === 'loss_of_income_treatment') {
      const d = inputData.lossOfIncomeDetails;
      if (!d || typeof d.incomeAmount !== 'number' || d.incomeAmount < 0 || typeof d.periodValue !== 'number' || d.periodValue <= 0) {
        return res.status(400).json({ success: false, message: 'Valid income rate and positive recuperation period are required.' });
      }
    } else if (inputData.claimType === 'other_compensation') {
      const d = inputData.otherHeadsDetails;
      if (!d || !Array.isArray(d.customHeads) || d.customHeads.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one custom compensation head is required.' });
      }
    }

    // Execute core engine calculation
    const result: MotorAccidentCalculationResult = calculateMotorAccidentCompensation(inputData);

    // Optionally auto-persist if requested
    if (req.body.saveToHistory === true && req.user) {
      try {
        await MotorAccidentCalculationRecord.create({
          userId: req.user.id,
          userName: req.user.name || 'Advocate',
          userRole: req.user.role,
          caseReferenceNumber: inputData.caseReferenceNumber || 'UNREFERENCED',
          claimType: inputData.claimType,
          accidentDate: inputData.accidentDate,
          claimantName: inputData.claimantName || 'Claimant',
          victimName: inputData.deceasedOrVictimName || '',
          totalEstimatedCompensation: result.totalEstimatedCompensation,
          inputPayload: inputData,
          resultPayload: result
        });
      } catch (saveErr) {
        console.warn('⚠️ Could not auto-save MACT calculation record:', saveErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Motor accident compensation calculation completed successfully.',
      data: result
    });

  } catch (error: any) {
    console.error('❌ Motor Accident Calculation Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while processing motor accident compensation.',
      error: error.message
    });
  }
};

/**
 * Get Authoritative Legal Rules & Multiplier Tables
 * GET /api/calculators/motor-accident/rules
 */
export const getLegalRules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!verifyAdminOrAdvocateRole(req, res)) return;

    return res.status(200).json({
      success: true,
      message: 'MACT statutory rules and judicial precedent tables retrieved successfully.',
      data: {
        rules: MACT_LEGAL_RULES,
        multiplierTable: SARLA_VERMA_MULTIPLIER_TABLE,
        statutoryConstants: {
          section164DeathBaseline: 500000,
          section164GrievousHurtBaseline: 250000,
          section166LimitationMonths: 6,
          conventionalHeadsBase: 15000,
          conventionalHeadsEnhanced: 18150,
          consortiumBasePerClaimant: 40000,
          consortiumEnhancedPerClaimant: 48400
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Get Legal Rules Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving legal rules.',
      error: error.message
    });
  }
};

/**
 * Save Calculation Record Manually
 * POST /api/calculators/motor-accident/history
 */
export const saveCalculationHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!verifyAdminOrAdvocateRole(req, res)) return;

    const { inputPayload, resultPayload, caseReferenceNumber, claimantName, victimName } = req.body;
    if (!inputPayload || !resultPayload) {
      return res.status(400).json({
        success: false,
        message: 'Both inputPayload and resultPayload are required to persist calculation.'
      });
    }

    const record = await MotorAccidentCalculationRecord.create({
      userId: req.user!.id,
      userName: req.user!.name || 'Advocate',
      userRole: req.user!.role,
      caseReferenceNumber: caseReferenceNumber || inputPayload.caseReferenceNumber || 'UNREFERENCED',
      claimType: inputPayload.claimType || 'death',
      accidentDate: inputPayload.accidentDate || new Date().toISOString().split('T')[0],
      claimantName: claimantName || inputPayload.claimantName || 'Claimant',
      victimName: victimName || inputPayload.deceasedOrVictimName || '',
      totalEstimatedCompensation: resultPayload.totalEstimatedCompensation || 0,
      inputPayload,
      resultPayload
    });

    return res.status(201).json({
      success: true,
      message: 'Calculation assessment record saved successfully.',
      recordId: record._id
    });
  } catch (error: any) {
    console.error('❌ Save Calculation History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving calculation history.',
      error: error.message
    });
  }
};

/**
 * Get Calculation History for Advocate / Admin
 * GET /api/calculators/motor-accident/history
 */
export const getCalculationHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!verifyAdminOrAdvocateRole(req, res)) return;

    const query: any = {};
    // If not Admin, restrict to the user's own calculations
    if ((req.user!.role || '').toLowerCase() !== 'admin') {
      query.userId = req.user!.id;
    }

    const records = await MotorAccidentCalculationRecord.find(query);
    // Sort descending by creation date
    const sorted = records.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.status(200).json({
      success: true,
      records: sorted.slice(0, 50)
    });
  } catch (error: any) {
    console.error('❌ Get Calculation History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching calculation history.',
      error: error.message
    });
  }
};

/**
 * Admin: Update Legal Rule / Audit Status
 * PUT /api/admin/motor-accident/rules/:id
 */
export const updateAdminRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Administrator credentials required to modify legal rules.'
      });
    }

    const { id } = req.params;
    const { isReviewed, notes } = req.body;

    const targetRule = MACT_LEGAL_RULES.find(r => r.ruleId === id);
    if (!targetRule) {
      return res.status(404).json({
        success: false,
        message: `Legal rule with ID ${id} not found.`
      });
    }

    if (isReviewed !== undefined) {
      targetRule.isReviewed = Boolean(isReviewed);
      targetRule.reviewedDate = new Date().toISOString().split('T')[0];
    }
    if (notes !== undefined) {
      targetRule.notes = String(notes);
    }

    // Log admin audit action
    try {
      await AuditLog.create({
        action: 'UPDATE_MACT_LEGAL_RULE',
        adminId: req.user.id,
        adminName: req.user.name,
        target: id,
        details: `Rule review status updated to ${targetRule.isReviewed}. Notes: ${notes || 'N/A'}`
      });
    } catch {}

    return res.status(200).json({
      success: true,
      message: `Legal rule ${id} updated successfully by Administrator.`,
      rule: targetRule
    });
  } catch (error: any) {
    console.error('❌ Update Admin Rule Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update rule.',
      error: error.message
    });
  }
};
