import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateIslamicInheritance, IslamicInheritanceCaseInput } from '../services/islamicInheritanceEngine';

/**
 * Controller for Islamic Inheritance Calculator API
 * Enforces Strict Role-Based Access Control: Admin or Advocate required
 */
export const calculateInheritance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    
    // Strict Role Enforcement Guard
    if (!req.user || (roleLower !== 'admin' && roleLower !== 'advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This calculator is available only to Admins and authorized Advocates.'
      });
    }

    const inputData: IslamicInheritanceCaseInput = req.body;
    
    if (!inputData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Case information parameters are required.'
      });
    }

    const result = calculateIslamicInheritance(inputData);

    if (!result.success && result.errorMessage) {
      return res.status(400).json({
        success: false,
        message: result.errorMessage,
        result
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Islamic inheritance calculation completed successfully.',
      data: result
    });

  } catch (error: any) {
    console.error('❌ Islamic Inheritance Calculation API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing Islamic inheritance calculation.',
      error: error.message
    });
  }
};
