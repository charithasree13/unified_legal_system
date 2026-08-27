import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { runReminderCheckOnce, getLocalYyyyMmDd, parseHearingDateToYyyyMmDd, calculateCalendarDayDifference } from '../services/hearingReminderScheduler';
import { sendHearingReminderEmail, verifySmtpConnection, validateEmail } from '../services/caseEmailService';
import { HearingReminder } from '../models/Schemas';

/**
 * Manually trigger the scheduled hearing reminder check (Protected: Admin/Advocate)
 */
export const triggerReminders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = await runReminderCheckOnce();
    return res.status(200).json({
      success: true,
      message: 'Hearing reminder job scan completed.',
      summary
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to execute manual hearing reminder trigger.',
      error: error.message
    });
  }
};

/**
 * Safe Test Mode endpoint to test SMTP email dispatch without waiting 3 days (Protected: Admin/Advocate)
 */
export const sendTestReminder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { testEmail, testHearingDate, caseNo, caseName, courtName, advocateName, forceSend } = req.body;

    if (!testEmail || !validateEmail(testEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid testEmail address is required.'
      });
    }

    const appTimezone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
    const todayStr = getLocalYyyyMmDd(new Date(), appTimezone);

    // Default test hearing date to 3 days from today if not provided
    let hearingDateToUse = testHearingDate;
    if (!hearingDateToUse) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      hearingDateToUse = getLocalYyyyMmDd(targetDate, appTimezone);
    } else {
      hearingDateToUse = parseHearingDateToYyyyMmDd(testHearingDate, appTimezone) || testHearingDate;
    }

    const diffDays = calculateCalendarDayDifference(todayStr, hearingDateToUse);
    const isExact3Days = diffDays === 3;

    if (!isExact3Days && !forceSend) {
      return res.status(400).json({
        success: false,
        message: `Test hearing date '${hearingDateToUse}' is ${diffDays} days away from today (${todayStr}), not 3 days. Pass forceSend: true to override.`,
        today: todayStr,
        hearingDate: hearingDateToUse,
        diffDays
      });
    }

    const caseDetails = {
      caseNo: caseNo || 'TEST-CASE-999',
      name: caseName || 'Test Property Dispute Matter',
      courtType: courtName || 'District & Sessions Court',
      courtCity: 'Mumbai'
    };

    const advocateToUse = advocateName || req.user?.name || 'Advocate Sharma';

    const sendResult = await sendHearingReminderEmail(
      testEmail,
      'Test Recipient',
      caseDetails,
      hearingDateToUse,
      advocateToUse
    );

    if (!sendResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Test email delivery failed.',
        error: sendResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: `Test 3-day hearing reminder email sent successfully to ${testEmail}.`,
      details: {
        recipientEmail: testEmail,
        todayDate: todayStr,
        hearingDate: hearingDateToUse,
        diffDays,
        messageId: sendResult.messageId
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error executing test reminder email.',
      error: error.message
    });
  }
};

/**
 * Verify SMTP Server Connection Health
 */
export const checkSmtpHealth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await verifySmtpConnection();
    if (result.success) {
      return res.status(200).json({ success: true, message: result.message });
    } else {
      return res.status(500).json({ success: false, message: result.message });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieve Audit Logs for Hearing Reminders (Admin Only)
 */
export const getReminderLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await HearingReminder.find();
    logs.sort((a: any, b: any) => new Date(b.createdAt || b.sentAt).getTime() - new Date(a.createdAt || a.sentAt).getTime());
    return res.status(200).json({
      success: true,
      count: logs.length,
      logs: logs.slice(0, 100)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hearing reminder logs.'
    });
  }
};
