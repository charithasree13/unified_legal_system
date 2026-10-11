import { Response } from 'express';
import { PrincipleOfLaw, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Controller: Principles of Law
 * Strict Role-Based Access Control:
 * - Read (GET): Admin & Advocate ONLY
 * - Write/Modify (POST, PUT, DELETE): Admin ONLY
 * - Client / Public / Unauthenticated: Denied with 401 / 403
 */

// ------------------------------------------------------------------
// 1. GET ALL PRINCIPLES OF LAW (Admin & Advocate ONLY)
// ------------------------------------------------------------------
export const getPrinciples = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access Principles of Law.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Principles of Law module is restricted exclusively to Administrators and Advocates.'
      });
    }

    const principles = await PrincipleOfLaw.find({});
    const principlesArray = Array.isArray(principles)
      ? principles.map((p: any) => (p.toObject ? p.toObject() : p))
      : [];

    // Sort chronologically (newest created first)
    principlesArray.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      principles: principlesArray
    });
  } catch (error: any) {
    console.error('Error fetching Principles of Law:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve principles of law. Please try again later.'
    });
  }
};

// ------------------------------------------------------------------
// 2. GET SINGLE PRINCIPLE OF LAW BY ID (Admin & Advocate ONLY)
// ------------------------------------------------------------------
export const getPrincipleById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to view this principle of law.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Principles of Law module is restricted exclusively to Administrators and Advocates.'
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Principle ID is required.'
      });
    }

    const principle = await PrincipleOfLaw.findById(id);
    if (!principle) {
      return res.status(404).json({
        success: false,
        message: 'Principle of law not found.'
      });
    }

    const formatted = principle.toObject ? principle.toObject() : principle;

    return res.status(200).json({
      success: true,
      principle: formatted
    });
  } catch (error: any) {
    console.error('Error fetching Principle of Law by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve principle of law details.'
    });
  }
};

// ------------------------------------------------------------------
// 3. CREATE NEW PRINCIPLE OF LAW (Admin ONLY)
// ------------------------------------------------------------------
export const createPrinciple = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to add principles of law.'
      });
    }

    const { title, description } = req.body;

    // Field A Validation: Title
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required and cannot be empty or whitespace.'
      });
    }

    // Field B Validation: Description
    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Description is required and cannot be empty or whitespace.'
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    const newPrinciple = await PrincipleOfLaw.create({
      title: cleanTitle,
      description: cleanDescription,
      createdBy: req.user.name || 'Administrator',
      createdById: req.user.id
    });

    // Audit log tracking
    try {
      await AuditLog.create({
        userId: req.user.id || 'admin',
        userName: req.user.name || 'Administrator',
        role: 'Admin',
        action: 'CREATE_PRINCIPLE_OF_LAW',
        ip: req.ip || '127.0.0.1',
        details: `Created principle of law: "${cleanTitle}"`
      });
    } catch (auditErr) {
      console.warn('Audit log creation warning:', auditErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Principle of law added successfully.',
      principle: newPrinciple
    });
  } catch (error: any) {
    console.error('Error creating Principle of Law:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save principle of law to database. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 4. UPDATE EXISTING PRINCIPLE OF LAW (Admin ONLY)
// ------------------------------------------------------------------
export const updatePrinciple = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to edit principles of law.'
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Principle ID is required.'
      });
    }

    const existing = await PrincipleOfLaw.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Principle of law not found.'
      });
    }

    const { title, description } = req.body;

    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required and cannot be empty.'
      });
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Description is required and cannot be empty.'
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    const updated = await PrincipleOfLaw.findByIdAndUpdate(
      id,
      {
        title: cleanTitle,
        description: cleanDescription,
        updatedBy: req.user.name || 'Administrator'
      },
      { new: true }
    );

    // Audit log tracking
    try {
      await AuditLog.create({
        userId: req.user.id || 'admin',
        userName: req.user.name || 'Administrator',
        role: 'Admin',
        action: 'UPDATE_PRINCIPLE_OF_LAW',
        ip: req.ip || '127.0.0.1',
        details: `Updated principle of law: "${cleanTitle}"`
      });
    } catch (auditErr) {
      console.warn('Audit log update warning:', auditErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Principle of law updated successfully.',
      principle: updated
    });
  } catch (error: any) {
    console.error('Error updating Principle of Law:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update principle of law in database. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 5. DELETE PRINCIPLE OF LAW (Admin ONLY)
// ------------------------------------------------------------------
export const deletePrinciple = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to delete principles of law.'
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Principle ID is required.'
      });
    }

    const existing = await PrincipleOfLaw.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Principle of law not found.'
      });
    }

    const titleToDelete = existing.title || 'Unknown Principle';

    await PrincipleOfLaw.findByIdAndDelete(id);

    // Audit log tracking
    try {
      await AuditLog.create({
        userId: req.user.id || 'admin',
        userName: req.user.name || 'Administrator',
        role: 'Admin',
        action: 'DELETE_PRINCIPLE_OF_LAW',
        ip: req.ip || '127.0.0.1',
        details: `Deleted principle of law: "${titleToDelete}"`
      });
    } catch (auditErr) {
      console.warn('Audit log delete warning:', auditErr);
    }

    return res.status(200).json({
      success: true,
      message: `Principle "${titleToDelete}" deleted successfully.`
    });
  } catch (error: any) {
    console.error('Error deleting Principle of Law:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete principle of law from database. Please try again.'
    });
  }
};
