import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { verifySmtpConnection, createTransporter } from '../services/caseEmailService';

async function runSmtpTest() {
  console.log('--------------------------------------------------');
  console.log('⚖️ Elite Legal Desk - SMTP Connection Test');
  console.log('--------------------------------------------------');
  console.log(`SMTP User: ${process.env.SMTP_USER || 'NOT CONFIGURED'}`);
  console.log(`SMTP From: ${process.env.SMTP_FROM || 'NOT CONFIGURED'}`);
  console.log('--------------------------------------------------');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERROR: SMTP_USER or SMTP_PASS is missing in server/.env file.');
    process.exit(1);
  }

  const recipient = process.argv[2] || process.env.SMTP_USER;
  console.log(`📧 Sending test email to: ${recipient}...`);

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Elite Legal Desk" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: '⚖️ Elite Legal Desk - SMTP Integration Test Success',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #0284c7; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #0f172a; margin-top: 0;">⚖️ Elite Legal Desk SMTP Verified!</h2>
          <p style="color: #334155; line-height: 1.5;">Congratulations! Your SMTP configuration for <strong>${process.env.SMTP_USER}</strong> is active and working perfectly.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">Sent automatically from Elite Legal Desk System</p>
        </div>
      `
    });

    console.log('🎉 SUCCESS: Test email sent!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Please check inbox for ${recipient}`);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ FAILED to send email:', err.message || err);
    process.exit(1);
  }
}

runSmtpTest();
