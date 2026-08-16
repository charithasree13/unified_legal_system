import { Project } from '../models/Schemas';
import { findRegisteredPartyUsers, dispatch3DayHearingReminderEmail } from './caseEmailService';

/**
 * Calculates day difference between two Date objects (ignoring time components)
 */
const getDayDifference = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

/**
 * Scans all active case projects and dispatches 3-day hearing reminder emails
 */
export const checkAndSend3DayHearingReminders = async () => {
  console.log('⏰ [Hearing Reminder Scheduler] Scanning active case files for upcoming hearing dates...');
  try {
    const projects = await Project.find();
    if (!Array.isArray(projects) || projects.length === 0) {
      return;
    }

    const today = new Date();

    for (const proj of projects) {
      if (!proj.nextHearingDate) continue;

      // Parse hearing date (expects YYYY-MM-DD or valid date string)
      const hearingDateObj = new Date(proj.nextHearingDate);
      if (isNaN(hearingDateObj.getTime())) continue;

      const diffDays = getDayDifference(today, hearingDateObj);

      // Check if hearing date is exactly 3 days away
      if (diffDays === 3) {
        const registeredParties = await findRegisteredPartyUsers(proj);
        if (registeredParties.length === 0) continue;

        const sentLogs = Array.isArray(proj.hearingRemindersSent) ? proj.hearingRemindersSent : [];
        const updatedSentLogs = [...sentLogs];
        let hasNewSends = false;

        for (const party of registeredParties) {
          const alreadySent = sentLogs.some(
            (log: any) => log.hearingDate === proj.nextHearingDate && log.userEmail?.toLowerCase() === party.email.toLowerCase()
          );

          if (!alreadySent) {
            console.log(`📩 Dispatching 3-Day Hearing Reminder for Case "${proj.name}" to registered party: ${party.email}`);
            const success = await dispatch3DayHearingReminderEmail(proj, party);
            if (success) {
              updatedSentLogs.push({
                hearingDate: proj.nextHearingDate,
                userEmail: party.email,
                sentAt: new Date()
              });
              hasNewSends = true;
            }
          }
        }

        if (hasNewSends) {
          await Project.findByIdAndUpdate(proj._id, {
            hearingRemindersSent: updatedSentLogs
          });
        }
      }
    }
  } catch (err: any) {
    console.error('⚠️ Error during 3-day hearing reminder scan:', err.message);
  }
};

/**
 * Initializes hearing reminder scheduler loop
 */
export const startHearingReminderScheduler = () => {
  console.log('🚀 [Hearing Reminder Scheduler] Initialized. Scanning every 6 hours for 3-day hearing alerts.');
  
  // Initial check on server startup
  setTimeout(() => {
    checkAndSend3DayHearingReminders();
  }, 5000);

  // Periodic interval check every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    checkAndSend3DayHearingReminders();
  }, SIX_HOURS);
};
