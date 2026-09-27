import { Response } from 'express';
import { DailyLegalTip, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

// ------------------------------------------------------------------
// Initial Seed Function for Daily Legal Tips
// ------------------------------------------------------------------
export const seedInitialLegalTips = async () => {
  try {
    const count = await DailyLegalTip.find();
    if (!count || count.length === 0) {
      const initialTips = [
        {
          date: '2026-09-27',
          tipText: 'Ensure all case-related documents, statutory attestations, and client verification affidavits are thoroughly verified before submission in court.',
          createdBy: 'System Admin'
        },
        {
          date: '2026-09-26',
          tipText: 'Under Section 103(1) of Bharatiya Nyaya Sanhita (BNS), review Section 302 IPC cross-mappings and relevant High Court precedent transcripts for murder suit charges.',
          createdBy: 'System Admin'
        },
        {
          date: '2026-09-25',
          tipText: 'Advocates executing notary statutory attestations must maintain serial numbers in their statutory register alongside Bar Council enrollment numbers.',
          createdBy: 'System Admin'
        }
      ];

      for (const tip of initialTips) {
        await DailyLegalTip.create(tip);
      }
      console.log('✅ Daily Legal Tips initial seed completed successfully.');
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
    // Strict backend role authorization check
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'Advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Daily Legal Tips & Updates are reserved exclusively for enrolled Advocates and Administrators.'
      });
    }

    const tips = await DailyLegalTip.find();

    // Sort tips chronologically with latest tip first
    const sortedTips = (tips || []).sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      tips: sortedTips
    });
  } catch (error: any) {
    console.error('Error fetching Daily Legal Tips:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load Daily Legal Tips/Updates. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 2. CREATE / SAVE DAILY LEGAL TIP (Admin ONLY)
// ------------------------------------------------------------------
export const createLegalTip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required to post legal tips.'
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
    if (existingTips && existingTips.length > 0) {
      // Update existing tip record for this date
      const existingId = existingTips[0]._id;
      const updatedTip = await DailyLegalTip.findByIdAndUpdate(existingId, {
        tipText: cleanedText,
        createdBy: req.user.name || 'Admin'
      });

      try {
        await AuditLog.create({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'UPDATE_LEGAL_TIP',
          details: `Updated daily legal tip for date ${formattedDate}`
        });
      } catch (e) {}

      return res.status(200).json({
        success: true,
        message: 'Legal tip saved successfully.',
        tip: updatedTip
      });
    }

    // Otherwise create a new tip record for this date
    const newTip = await DailyLegalTip.create({
      date: formattedDate,
      tipText: cleanedText,
      createdBy: req.user.name || 'Admin'
    });

    // Log audit trail entry
    try {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'CREATE_LEGAL_TIP',
        details: `Published daily legal tip for date ${formattedDate}`
      });
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Legal tip added successfully.',
      tip: newTip
    });
  } catch (error: any) {
    console.error('Error creating Daily Legal Tip:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create legal tip. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 3. UPDATE DAILY LEGAL TIP (Admin ONLY)
// ------------------------------------------------------------------
export const updateLegalTip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.'
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

    const updatedTip = await DailyLegalTip.findByIdAndUpdate(id, updateData);

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
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.'
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
