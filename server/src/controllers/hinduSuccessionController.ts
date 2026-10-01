import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateHinduSuccession, HinduSuccessionCaseInput } from '../services/hinduSuccessionEngine';

/**
 * Controller for Hindu Succession Calculator API
 * Enforces Role-Based Access Control: Admin or Advocate required
 */
export const calculateSuccession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    
    // Strict Role Enforcement
    if (!req.user || (roleLower !== 'admin' && roleLower !== 'advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied. The Hindu Succession Calculator is restricted exclusively to enrolled Advocates and Administrators.'
      });
    }

    const inputData: HinduSuccessionCaseInput = req.body;
    
    if (!inputData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Succession case parameters are required.'
      });
    }

    const result = calculateHinduSuccession(inputData);

    if (!result.reconciled && result.errorMessage) {
      return res.status(400).json({
        success: false,
        message: result.errorMessage,
        result
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hindu succession calculation completed successfully.',
      data: result
    });

  } catch (error: any) {
    console.error('❌ Hindu Succession Calculation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing Hindu succession calculation.',
      error: error.message
    });
  }
};
