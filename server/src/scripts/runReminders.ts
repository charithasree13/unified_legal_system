import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db';
import { runReminderCheckOnce, getLocalYyyyMmDd } from '../services/hearingReminderScheduler';
import { sendHearingReminderEmail, verifySmtpConnection } from '../services/caseEmailService';

const run = async () => {
  console.log('⚖️  [Unified Legal System] Starting Hearing Reminder Script...\n');

  try {
    await connectDB();

    const isTestMode = process.argv.includes('--test') || process.argv.includes('-t');
    const emailArg = process.argv.find(arg => arg.startsWith('--email='));
    const testEmail = emailArg ? emailArg.split('=')[1] : (process.env.SMTP_USER || 'client@example.com');

    if (isTestMode) {
      console.log('🧪 Executing SMTP Test Mode...');
      const smtpStatus = await verifySmtpConnection();
      console.log(`📡 SMTP Connection Status: ${smtpStatus.message}`);

      const appTimezone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      const testHearingDate = getLocalYyyyMmDd(targetDate, appTimezone);

      console.log(`📩 Dispatching Test 3-Day Reminder to: ${testEmail}`);
      console.log(`📅 Simulated Hearing Date (3 Days Away): ${testHearingDate}`);

      const testResult = await sendHearingReminderEmail(
        testEmail,
        'Test Client User',
        {
          caseNo: 'TEST-CASE-2026',
          name: 'Commercial Contract Dispute',
          courtType: 'High Court of Judicature',
          courtCity: 'Mumbai'
        },
        testHearingDate,
        'Advocate Rajesh Sharma'
      );

      if (testResult.success) {
        console.log(`\n✅ TEST SUCCESSFUL: Email dispatched successfully. Message ID: ${testResult.messageId}`);
      } else {
        console.error(`\n❌ TEST FAILED: Could not send email. Error: ${testResult.error}`);
      }

      process.exit(testResult.success ? 0 : 1);
    } else {
      console.log('⏰ Executing Scheduled 3-Day Hearing Reminder Scan...');
      const summary = await runReminderCheckOnce();
      console.log('\n📊 Reminder Scan Summary:');
      console.log(`   Total Cases Scanned:  ${summary.totalCases}`);
      console.log(`   Eligible (3-Day):     ${summary.eligibleHearings}`);
      console.log(`   Reminders Sent:       ${summary.sentReminders}`);
      console.log(`   Reminders Skipped:    ${summary.skippedReminders}`);
      console.log(`   Reminders Failed:     ${summary.failedReminders}`);
      
      process.exit(0);
    }
  } catch (err: any) {
    console.error('💥 Fatal error in reminder runner script:', err.message || err);
    process.exit(1);
  }
};

run();
