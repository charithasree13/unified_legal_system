import { Project, HearingReminder } from '../models/Schemas';
import { findRegisteredPartyUsers, sendHearingReminderEmail, validateEmail } from './caseEmailService';

/**
 * Returns current YYYY-MM-DD string in the specified timezone
 */
export const getLocalYyyyMmDd = (dateObj: Date = new Date(), timezone = process.env.APP_TIMEZONE || 'Asia/Kolkata'): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(dateObj);
  } catch (err) {
    return dateObj.toISOString().split('T')[0];
  }
};

/**
 * Normalizes hearing date string into YYYY-MM-DD format
 */
export const parseHearingDateToYyyyMmDd = (hearingDateStr: string, timezone = process.env.APP_TIMEZONE || 'Asia/Kolkata'): string | null => {
  if (!hearingDateStr || typeof hearingDateStr !== 'string') return null;
  const trimmed = hearingDateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return getLocalYyyyMmDd(parsed, timezone);
};

/**
 * Calculates calendar day difference (hearingDate - today)
 */
export const calculateCalendarDayDifference = (todayYyyyMmDd: string, hearingYyyyMmDd: string): number => {
  const [y1, m1, d1] = todayYyyyMmDd.split('-').map(Number);
  const [y2, m2, d2] = hearingYyyyMmDd.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

/**
 * Single-pass check to scan active cases and dispatch 3-day hearing reminders
 */
export const runReminderCheckOnce = async (): Promise<{ totalCases: number; eligibleHearings: number; sentReminders: number; failedReminders: number; skippedReminders: number }> => {
  console.log('[Hearing Reminder] Checking upcoming hearings...');
  
  let eligibleCount = 0;
  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  try {
    const projects = await Project.find();
    if (!Array.isArray(projects) || projects.length === 0) {
      console.log('[Hearing Reminder] Found 0 active cases in database.');
      return { totalCases: 0, eligibleHearings: 0, sentReminders: 0, failedReminders: 0, skippedReminders: 0 };
    }

    const appTimezone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
    const todayYyyyMmDd = getLocalYyyyMmDd(new Date(), appTimezone);

    for (const proj of projects) {
      if (!proj.nextHearingDate) continue;

      const hearingYyyyMmDd = parseHearingDateToYyyyMmDd(proj.nextHearingDate, appTimezone);
      if (!hearingYyyyMmDd) continue;

      const diffDays = calculateCalendarDayDifference(todayYyyyMmDd, hearingYyyyMmDd);

      // We specifically check for hearings exactly 3 days away
      if (diffDays === 3) {
        eligibleCount++;
        const caseIdStr = proj._id ? String(proj._id) : proj.name;

        // Resolve recipients: Registered parties OR direct case emails
        const registeredParties = await findRegisteredPartyUsers(proj);
        const recipientList: Array<{ email: string; name: string; clientId?: string }> = [];

        for (const party of registeredParties) {
          if (party.email && validateEmail(party.email)) {
            recipientList.push({
              email: party.email.trim().toLowerCase(),
              name: party.name || 'Client',
              clientId: party.user?._id ? String(party.user._id) : undefined
            });
          }
        }

        // Fallback: If no registered user matches, check case plaintiffEmail / defendantEmail directly
        if (recipientList.length === 0) {
          if (proj.plaintiffEmail && validateEmail(proj.plaintiffEmail)) {
            recipientList.push({
              email: proj.plaintiffEmail.trim().toLowerCase(),
              name: proj.plaintiffName || proj.clientName || 'Client'
            });
          }
          if (proj.defendantEmail && validateEmail(proj.defendantEmail) && proj.defendantEmail.trim().toLowerCase() !== proj.plaintiffEmail?.trim().toLowerCase()) {
            recipientList.push({
              email: proj.defendantEmail.trim().toLowerCase(),
              name: proj.defendantName || 'Client'
            });
          }
        }

        if (recipientList.length === 0) {
          console.log(`[Hearing Reminder] Missing client email for case: ${proj.caseNo || proj.name} - skipping`);
          skippedCount++;
          continue;
        }

        const advocateName = (proj.teamMembers && proj.teamMembers.length > 0) ? proj.teamMembers[0] : 'Assigned Advocate';

        for (const recipient of recipientList) {
          try {
            // Check if reminder was already sent for (caseId + hearingDate + '3_DAY_REMINDER' + email)
            const existingRecord = await HearingReminder.findOne({
              caseId: caseIdStr,
              hearingDate: hearingYyyyMmDd,
              reminderType: '3_DAY_REMINDER',
              email: recipient.email,
              status: 'SENT'
            });

            // Also check legacy Project array
            const legacySent = Array.isArray(proj.hearingRemindersSent) && proj.hearingRemindersSent.some(
              (log: any) => log.hearingDate === proj.nextHearingDate && log.userEmail?.toLowerCase() === recipient.email
            );

            if (existingRecord || legacySent) {
              console.log(`[Hearing Reminder] Reminder already sent - skipping for case: ${proj.caseNo || proj.name} (${recipient.email})`);
              skippedCount++;
              continue;
            }

            console.log(`[Hearing Reminder] Sending reminder for case: ${proj.caseNo || proj.name} to ${recipient.email}...`);

            const sendResult = await sendHearingReminderEmail(
              recipient.email,
              recipient.name,
              proj,
              proj.nextHearingDate,
              advocateName
            );

            if (sendResult.success) {
              sentCount++;
              // Record successful delivery attempt
              await HearingReminder.create({
                caseId: caseIdStr,
                clientId: recipient.clientId || '',
                email: recipient.email,
                hearingDate: hearingYyyyMmDd,
                reminderType: '3_DAY_REMINDER',
                status: 'SENT',
                sentAt: new Date()
              });

              // Legacy project update
              const sentLogs = Array.isArray(proj.hearingRemindersSent) ? proj.hearingRemindersSent : [];
              sentLogs.push({
                hearingDate: proj.nextHearingDate,
                userEmail: recipient.email,
                sentAt: new Date()
              });
              await Project.findByIdAndUpdate(caseIdStr, { hearingRemindersSent: sentLogs });

            } else {
              failedCount++;
              console.error(`[Hearing Reminder] Failed to send reminder for case: ${proj.caseNo || proj.name} to ${recipient.email}`);
              // Record failed delivery attempt without crashing job
              await HearingReminder.create({
                caseId: caseIdStr,
                clientId: recipient.clientId || '',
                email: recipient.email,
                hearingDate: hearingYyyyMmDd,
                reminderType: '3_DAY_REMINDER',
                status: 'FAILED',
                errorMessage: sendResult.error || 'SMTP delivery failed',
                sentAt: new Date()
              });
            }
          } catch (recipientErr: any) {
            failedCount++;
            console.error(`[Hearing Reminder] Error processing recipient ${recipient.email}:`, recipientErr.message || recipientErr);
          }
        }
      }
    }

    console.log(`[Hearing Reminder] Scan completed. Total: ${projects.length}, Eligible: ${eligibleCount}, Sent: ${sentCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`);
    return {
      totalCases: projects.length,
      eligibleHearings: eligibleCount,
      sentReminders: sentCount,
      failedReminders: failedCount,
      skippedReminders: skippedCount
    };
  } catch (err: any) {
    console.error('[Hearing Reminder] Error during reminder job execution:', err.message || err);
    return { totalCases: 0, eligibleHearings: 0, sentReminders: 0, failedReminders: failedCount, skippedReminders: skippedCount };
  }
};

/**
 * Backward compatible function name
 */
export const checkAndSend3DayHearingReminders = async () => {
  return runReminderCheckOnce();
};

/**
 * Initializes in-app recurring scheduler (runs once a day or every 6 hours)
 */
export const startHearingReminderScheduler = () => {
  console.log('🚀 [Hearing Reminder Scheduler] Background scheduler initialized on server startup.');
  
  // Delay initial check by 5 seconds on startup
  setTimeout(() => {
    runReminderCheckOnce();
  }, 5000);

  // Run once every 24 hours (86,400,000 ms)
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    runReminderCheckOnce();
  }, TWENTY_FOUR_HOURS);
};

