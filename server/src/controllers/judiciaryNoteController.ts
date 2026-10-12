import { Response } from 'express';
import { JudiciaryNote, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Controller: Judiciary Notes Module
 * Role-Based Access Control:
 * - Read (GET): Admin & Advocate ONLY
 * - Add (POST): Admin ONLY
 * - Delete (DELETE): Admin ONLY
 * - Client / User / Unauthenticated: Denied (401 / 403)
 */

/**
 * URL Validation Helper
 * Ensures HTTP or HTTPS protocol, rejects unsafe protocols and malformed strings.
 */
export const isValidHttpUrl = (urlString: string): boolean => {
  if (typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// ------------------------------------------------------------------
// 1. GET ALL JUDICIARY NOTES (Admin & Advocate ONLY)
// ------------------------------------------------------------------
export const getJudiciaryNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access Judiciary Notes.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Judiciary Notes module is restricted exclusively to Administrators and Advocates.'
      });
    }

    const rawNotes = await JudiciaryNote.find({});
    const notesArray = Array.isArray(rawNotes)
      ? rawNotes.map((note: any) => (note.toObject ? note.toObject() : note))
      : [];

    // Chronological order: newest created first
    notesArray.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      notes: notesArray
    });
  } catch (error: any) {
    console.error('Error fetching Judiciary Notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve judiciary notes. Please try again later.'
    });
  }
};

// ------------------------------------------------------------------
// 2. CREATE A NEW JUDICIARY NOTE (Admin ONLY)
// ------------------------------------------------------------------
export const createJudiciaryNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Administrator privileges required to add judiciary notes.'
      });
    }

    const rawTitle = req.body.title;
    const rawLink = req.body.link || req.body.url;

    // A. Validate Title
    if (typeof rawTitle !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Title is required.'
      });
    }

    const trimmedTitle = rawTitle.trim();
    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty or whitespace only.'
      });
    }

    // B. Validate Link
    if (typeof rawLink !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Link is required.'
      });
    }

    const trimmedLink = rawLink.trim();
    if (!trimmedLink) {
      return res.status(400).json({
        success: false,
        message: 'Link cannot be empty or whitespace only.'
      });
    }

    if (!isValidHttpUrl(trimmedLink)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL. Only HTTP and HTTPS links are allowed.'
      });
    }

    // C. Persist to Database
    const newNote = await JudiciaryNote.create({
      title: trimmedTitle,
      link: trimmedLink,
      url: trimmedLink,
      createdBy: req.user.name || 'System Admin',
      createdById: req.user.id || 'admin'
    });

    // Audit Log
    try {
      await AuditLog.create({
        userId: req.user.id || 'admin',
        userName: req.user.name || 'Administrator',
        role: 'Admin',
        action: 'JUDICIARY_NOTE_CREATED',
        ip: req.ip || '127.0.0.1',
        details: `Published judiciary note: "${trimmedTitle}" (${trimmedLink})`
      });
    } catch (auditErr) {
      console.warn('Audit logging warning on note creation:', auditErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Judiciary note published successfully.',
      note: newNote
    });
  } catch (error: any) {
    console.error('Error creating Judiciary Note:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save judiciary note. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 3. DELETE A JUDICIARY NOTE (Admin ONLY)
// ------------------------------------------------------------------
export const deleteJudiciaryNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Administrator privileges required to delete judiciary notes.'
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Judiciary note ID is required.'
      });
    }

    // Check if record exists
    let existingNote = null;
    if (JudiciaryNote.findById) {
      existingNote = await JudiciaryNote.findById(id);
    } else {
      existingNote = await JudiciaryNote.findOne({ _id: id });
    }

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Judiciary note not found or already deleted.'
      });
    }

    // Delete the record
    if (JudiciaryNote.findByIdAndDelete) {
      await JudiciaryNote.findByIdAndDelete(id);
    } else {
      await JudiciaryNote.deleteOne({ _id: id });
    }

    // Audit Log
    try {
      await AuditLog.create({
        userId: req.user.id || 'admin',
        userName: req.user.name || 'Administrator',
        role: 'Admin',
        action: 'JUDICIARY_NOTE_DELETED',
        ip: req.ip || '127.0.0.1',
        details: `Deleted judiciary note: "${existingNote.title}" (ID: ${id})`
      });
    } catch (auditErr) {
      console.warn('Audit logging warning on note deletion:', auditErr);
    }

    return res.status(200).json({
      success: true,
      message: `Judiciary note "${existingNote.title}" was deleted successfully.`,
      id
    });
  } catch (error: any) {
    console.error('Error deleting Judiciary Note:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete judiciary note. Please try again.'
    });
  }
};
