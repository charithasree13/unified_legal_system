import { Response } from 'express';
import { DailyLegalTip, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

let isInitialSeeded = false;

// ------------------------------------------------------------------
// Initial Seed Function for Daily Legal Tips
// ------------------------------------------------------------------
export const seedInitialLegalTips = async () => {
  try {
    const existing = await DailyLegalTip.find();
    if (existing && existing.length > 0) return;

    const initialTips = [
      {
        date: '2026-10-01',
        tipText: 'Injunction against true owner is not maintainable without establishing lawful possession and clear legal title.',
        createdBy: 'System Admin'
      },
      {
        date: '2026-09-30',
        tipText: 'Under Section 103(1) of Bharatiya Nyaya Sanhita (BNS), review Section 302 IPC cross-mappings and relevant High Court precedent transcripts for murder suit charges.',
        createdBy: 'System Admin'
      },
      {
        date: '2026-09-29',
        tipText: 'Advocates executing notary statutory attestations must maintain serial numbers in their statutory register alongside Bar Council enrollment numbers.',
        createdBy: 'System Admin'
      }
    ];

    for (const tip of initialTips) {
      try {
        const existingForDate = await DailyLegalTip.find({ date: tip.date });
        if (!existingForDate || existingForDate.length === 0) {
          await DailyLegalTip.create(tip);
        }
      } catch (e) { }
    }
  } catch (err) {
    console.error('Error seeding initial Daily Legal Tips:', err);
  }
};

// ------------------------------------------------------------------
// 1. GET ALL DAILY LEGAL TIPS (Enrolled Advocates & Admins ONLY)
// ------------------------------------------------------------------
export const getLegalTips = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();

    // Strict backend role authorization check (Case-insensitive)
    if (!req.user || (roleLower !== 'admin' && roleLower !== 'advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Daily Legal Tips/Updates are available only to enrolled advocates.'
      });
    }

    let tips = await DailyLegalTip.find();
    let tipsArray = Array.isArray(tips) ? tips.map((t: any) => (t.toObject ? t.toObject() : t)) : [];

    // Auto-seed initial legal tips if database has zero tips on initial startup
    if (tipsArray.length === 0 && !isInitialSeeded) {
      isInitialSeeded = true;
      await seedInitialLegalTips();
      const reQueried = await DailyLegalTip.find();
      tipsArray = Array.isArray(reQueried) ? reQueried.map((t: any) => (t.toObject ? t.toObject() : t)) : [];
    }

    // Sort tips chronologically with latest tip first
    tipsArray.sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      tips: tipsArray
    });
  } catch (error: any) {
    console.error('Error fetching Daily Legal Tips:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load Daily Legal Tips/Updates. Please try again later.'
    });
  }
};

// ------------------------------------------------------------------
// 2. CREATE / SAVE DAILY LEGAL TIP (Admin ONLY)
// ------------------------------------------------------------------
export const createLegalTip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can publish legal tips.'
      });
    }

    const { date, tipText } = req.body;

    if (!date || !tipText || String(tipText).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Date and legal tip text are required.'
      });
    }

    // Normalize date string (YYYY-MM-DD)
    const formattedDate = String(date).trim().split('T')[0];
    const cleanedText = String(tipText).trim();

    // Check whether a tip already exists for the selected date
    const existingTips = await DailyLegalTip.find({ date: formattedDate });
    const creatorName = req.user.name || req.user.email || 'Admin';

    if (existingTips && existingTips.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A legal tip already exists for this date.'
      });
    }

    // Otherwise create a new tip record for this date
    const newTip = await DailyLegalTip.create({
      date: formattedDate,
      tipText: cleanedText,
      createdBy: creatorName
    });

    // Log audit trail entry
    try {
      await AuditLog.create({
        userId: req.user.id || 'system',
        userName: creatorName,
        role: req.user.role || 'Admin',
        action: 'CREATE_LEGAL_TIP',
        details: `Published daily legal tip for date ${formattedDate}`
      });
    } catch (e) { }

    return res.status(201).json({
      success: true,
      message: 'Legal tip added successfully.',
      tip: newTip
    });
  } catch (error: any) {
    console.error('Error creating Daily Legal Tip:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save legal tip. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 3. UPDATE DAILY LEGAL TIP (Admin ONLY)
// ------------------------------------------------------------------
export const updateLegalTip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can edit legal tips.'
      });
    }

    const { id } = req.params;
    const { date, tipText } = req.body;

    if (!tipText || String(tipText).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Legal tip text cannot be empty.'
      });
    }

    const formattedDate = date ? String(date).trim().split('T')[0] : undefined;
    const updateData: any = { tipText: String(tipText).trim() };
    if (formattedDate) updateData.date = formattedDate;

    const updatedTip = await DailyLegalTip.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTip) {
      return res.status(404).json({
        success: false,
        message: 'Legal tip record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Legal tip updated successfully.',
      tip: updatedTip
    });
  } catch (error: any) {
    console.error('Error updating Daily Legal Tip:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update legal tip.'
    });
  }
};

// ------------------------------------------------------------------
// 4. DELETE DAILY LEGAL TIP (Admin ONLY)
// ------------------------------------------------------------------
export const deleteLegalTip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete legal tips.'
      });
    }

    const { id } = req.params;
    const deletedTip = await DailyLegalTip.findByIdAndDelete(id);

    if (!deletedTip) {
      return res.status(404).json({
        success: false,
        message: 'Legal tip record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Legal tip deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting Daily Legal Tip:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete legal tip.'
    });
  }
};
