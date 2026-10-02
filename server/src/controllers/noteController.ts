import { Response } from 'express';
import { Note, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper for strict role verification
const checkAuthorizedRole = (req: AuthenticatedRequest, res: Response): boolean => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return false;
  }
  const roleLower = (req.user.role || '').toLowerCase();
  if (roleLower !== 'admin' && roleLower !== 'advocate') {
    res.status(403).json({
      success: false,
      message: 'Access denied. My Notes is available only to Admins and authorized Advocates.'
    });
    return false;
  }
  return true;
};

// ------------------------------------------------------------------
// 1. GET USER NOTES (Private to authenticated user)
// ------------------------------------------------------------------
export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAuthorizedRole(req, res)) return;

    const currentUserId = req.user!.id;

    // Retrieve notes strictly belonging to current authenticated user
    const notes = await Note.find({ userId: currentUserId });

    // Sort newest / most recently updated first
    const sortedNotes = (notes || []).sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      notes: sortedNotes
    });
  } catch (error: any) {
    console.error('Error fetching user notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your notes. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 2. CREATE NOTE
// ------------------------------------------------------------------
export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAuthorizedRole(req, res)) return;

    const { title, content } = req.body;

    const cleanTitle = (title || '').trim();
    const cleanContent = (content || '').trim();

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required.'
      });
    }

    if (!cleanContent) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required.'
      });
    }

    if (cleanTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Note title must not exceed 200 characters.'
      });
    }

    if (cleanContent.length > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Note content must not exceed 20,000 characters.'
      });
    }

    const newNote = await Note.create({
      userId: req.user!.id,
      title: cleanTitle,
      content: cleanContent
    });

    try {
      await AuditLog.create({
        userId: req.user!.id,
        userName: req.user!.name || 'User',
        role: req.user!.role || 'Advocate',
        action: 'CREATE_NOTE',
        ip: req.ip || '127.0.0.1',
        details: `Created private note: ${cleanTitle}`
      });
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Note saved successfully.',
      note: newNote
    });
  } catch (error: any) {
    console.error('Error creating note:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to save the note. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 3. GET SINGLE NOTE BY ID (With ownership check)
// ------------------------------------------------------------------
export const getNoteById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAuthorizedRole(req, res)) return;

    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note || String(note.userId) !== String(req.user!.id)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      note
    });
  } catch (error: any) {
    console.error('Error fetching note details:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve note details.'
    });
  }
};

// ------------------------------------------------------------------
// 4. UPDATE NOTE (With ownership check)
// ------------------------------------------------------------------
export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAuthorizedRole(req, res)) return;

    const noteId = req.params.id;
    const { title, content } = req.body;

    const cleanTitle = (title || '').trim();
    const cleanContent = (content || '').trim();

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required.'
      });
    }

    if (!cleanContent) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required.'
      });
    }

    const existingNote = await Note.findById(noteId);
    if (!existingNote || String(existingNote.userId) !== String(req.user!.id)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied.'
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        title: cleanTitle,
        content: cleanContent,
        updatedAt: new Date().toISOString()
      },
      { new: true }
    );

    try {
      await AuditLog.create({
        userId: req.user!.id,
        userName: req.user!.name || 'User',
        role: req.user!.role || 'Advocate',
        action: 'UPDATE_NOTE',
        ip: req.ip || '127.0.0.1',
        details: `Updated private note ID: ${noteId}`
      });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      note: updatedNote
    });
  } catch (error: any) {
    console.error('Error updating note:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to save note updates. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 5. DELETE NOTE (With ownership check)
// ------------------------------------------------------------------
export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAuthorizedRole(req, res)) return;

    const noteId = req.params.id;
    const existingNote = await Note.findById(noteId);

    if (!existingNote || String(existingNote.userId) !== String(req.user!.id)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied.'
      });
    }

    await Note.findByIdAndDelete(noteId);

    try {
      await AuditLog.create({
        userId: req.user!.id,
        userName: req.user!.name || 'User',
        role: req.user!.role || 'Advocate',
        action: 'DELETE_NOTE',
        ip: req.ip || '127.0.0.1',
        details: `Deleted private note ID: ${noteId}`
      });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Note deleted permanently.'
    });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete the note. Please try again.'
    });
  }
};
