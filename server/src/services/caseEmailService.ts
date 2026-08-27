import nodemailer from 'nodemailer';
import { User } from '../models/Schemas';

export interface RegisteredPartyUser {
  user: any;
  roleInCase: 'Plaintiff' | 'Defendant' | 'Client';
  email: string;
  name: string;
}

/**
 * Validates recipient email address format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
};

/**
 * Sanitizes user-controlled string inputs to prevent HTML injection
 */
export const escapeHtml = (str: string): string => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Configure Nodemailer Transporter using environment variables
 */
export const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Verifies SMTP connection configuration
 */
export const verifySmtpConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP Transporter connected and verified successfully.' };
  } catch (err: any) {
    // Log failure without exposing passwords
    const safeError = err.message || 'SMTP Verification Failed';
    console.error('[SMTP Verification Error]:', safeError);
    return { success: false, message: safeError };
  }
};

/**
 * Reusable core function to send hearing reminder emails via SMTP
 */
export const sendHearingReminderEmail = async (
  clientEmail: string,
  clientName: string,
  caseDetails: {
    caseNo?: string;
    name?: string;
    courtType?: string;
    courtCity?: string;
    [key: string]: any;
  },
  hearingDate: string,
  advocateName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!validateEmail(clientEmail)) {
      const err = `Invalid recipient email address: "${clientEmail}"`;
      console.error(`[Hearing Reminder] ${err}`);
      return { success: false, error: err };
    }

    const safeClientName = escapeHtml(clientName || 'Valued Client');
    const safeCaseNo = escapeHtml(caseDetails.caseNo || 'N/A');
    const safeCaseTitle = escapeHtml(caseDetails.name || 'Legal Case File');
    const courtLocation = [caseDetails.courtType, caseDetails.courtCity].filter(Boolean).join(', ');
    const safeCourt = escapeHtml(courtLocation || 'District Court');
    const safeHearingDate = escapeHtml(hearingDate);
    const safeAdvocateName = escapeHtml(advocateName || 'Legal Advocate');

    const subjectCaseRef = caseDetails.caseNo || caseDetails.name || 'Scheduled Hearing';
    const subject = `Important: Hearing Date Reminder – ${subjectCaseRef}`;

    // Plain text fallback version
    const textBody = `Dear ${safeClientName},

This is a reminder that your case has a scheduled hearing.

Case Number: ${safeCaseNo}
Case Title: ${safeCaseTitle}
Court: ${safeCourt}
Hearing Date: ${safeHearingDate}
Advocate: ${safeAdvocateName}

Your hearing is scheduled for 3 days from today.

Please make the necessary arrangements and contact your advocate if you require any clarification.

Regards,
Unified Legal System`;

    // Professional responsive HTML version
    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hearing Date Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border: 1px solid #cbd5e1;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">⚖️ UNIFIED LEGAL SYSTEM</h1>
              <p style="color: #38bdf8; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Hearing Date Reminder</p>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 32px 30px; color: #334155;">
              <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Dear <strong>${safeClientName}</strong>,</p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                This is a reminder that your case has a scheduled hearing.
              </p>
              
              <!-- Case Information Table -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.8;">
                  <tr>
                    <td style="color: #64748b; font-weight: 600; width: 130px; padding: 4px 0;">Case Number:</td>
                    <td style="color: #0284c7; font-weight: 700; padding: 4px 0;">${safeCaseNo}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Case Title:</td>
                    <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">${safeCaseTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Court:</td>
                    <td style="color: #0f172a; padding: 4px 0;">${safeCourt}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="color: #b91c1c; font-weight: 700; padding: 8px 0 4px 0;">Hearing Date:</td>
                    <td style="color: #b91c1c; font-weight: 800; font-size: 16px; padding: 8px 0 4px 0;">${safeHearingDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Advocate:</td>
                    <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">${safeAdvocateName}</td>
                  </tr>
                </table>
              </div>

              <!-- Notice Box -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 600; line-height: 1.5;">
                  🔔 Your hearing is scheduled for 3 days from today.
                </p>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Please make the necessary arrangements and contact your advocate if you require any clarification.
              </p>
              
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px; color: #475569;">Regards,</p>
                <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">Unified Legal System</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              This is an automated notification from Unified Legal System. Please do not reply directly to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Unified Legal System" <no-reply@unifiedlegalsystem.org>',
      to: clientEmail.trim().toLowerCase(),
      subject,
      text: textBody,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Hearing Reminder] Email sent successfully to ${clientEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    const safeErrorMsg = err.message || 'SMTP Send Failed';
    console.error(`[Hearing Reminder] Failed to send email to ${clientEmail}:`, safeErrorMsg);
    return { success: false, error: safeErrorMsg };
  }
};

/**
 * Find registered users in the Unified Legal System matching Plaintiff, Defendant, or Client Phone/Email
 */
export const findRegisteredPartyUsers = async (project: any): Promise<RegisteredPartyUser[]> => {
  try {
    const allUsers = await User.find();
    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      return [];
    }

    const matchedParties: RegisteredPartyUser[] = [];
    const addedUserIds = new Set<string>();

    const pltName = (project.plaintiffName || '').trim().toLowerCase();
    const defName = (project.defendantName || '').trim().toLowerCase();
    const pltEmail = (project.plaintiffEmail || '').trim().toLowerCase();
    const defEmail = (project.defendantEmail || '').trim().toLowerCase();
    const clientPhoneDigits = (project.clientPhone || '').replace(/\D/g, '');

    for (const u of allUsers) {
      if (!u.email) continue;
      const uEmail = u.email.trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const userId = u._id ? String(u._id) : uEmail;

      if (addedUserIds.has(userId)) continue;

      let roleInCase: 'Plaintiff' | 'Defendant' | 'Client' | null = null;

      // 1. Direct Email Match
      if (pltEmail && uEmail === pltEmail) {
        roleInCase = 'Plaintiff';
      } else if (defEmail && uEmail === defEmail) {
        roleInCase = 'Defendant';
      } 
      // 2. Name Match
      else if (pltName && (uName.includes(pltName) || pltName.includes(uName))) {
        roleInCase = 'Plaintiff';
      } else if (defName && (uName.includes(defName) || defName.includes(uName))) {
        roleInCase = 'Defendant';
      }
      // 3. Phone Match
      else if (clientPhoneDigits && uPhoneDigits && clientPhoneDigits === uPhoneDigits) {
        roleInCase = 'Client';
      }

      if (roleInCase) {
        addedUserIds.add(userId);
        matchedParties.push({
          user: u,
          roleInCase,
          email: u.email,
          name: u.name || 'Valued Party'
        });
      }
    }

    return matchedParties;
  } catch (err) {
    console.error('Error finding registered party users:', err);
    return [];
  }
};

/**
 * Dispatch Case Filing & Hearing Notice Email (sent immediately when advocate adds case)
 */
export const dispatchCaseFilingNoticeEmail = async (project: any, advocateName: string): Promise<boolean> => {
  const registeredParties = await findRegisteredPartyUsers(project);

  if (registeredParties.length === 0) {
    console.log(`ℹ️ No registered plaintiff/defendant users found in system for case: ${project.name}`);
    return false;
  }

  const transporter = createTransporter();

  for (const party of registeredParties) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Unified Legal System" <no-reply@unifiedlegalsystem.org>',
        to: party.email.trim().toLowerCase(),
        subject: `⚖️ Legal Notice: Case Registered & Hearing Schedule [${project.caseNo || project.name}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">⚖️ UNIFIED LEGAL PROFESSIONAL SYSTEM</h2>
              <p style="color: #38bdf8; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">Official Case Filing & Hearing Notification</p>
            </div>
            
            <div style="padding: 24px; color: #1e293b;">
              <h3 style="color: #0f172a; margin-top: 0;">Dear ${escapeHtml(party.name)},</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                You are receiving this notification because your registered email is associated as a <strong>${party.roleInCase}</strong> in a new legal case file created by Advocate <strong>${escapeHtml(advocateName)}</strong>.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                <table style="width: 100%; text-align: left; font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Case File Name:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${escapeHtml(project.name)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Case Number:</td>
                    <td style="padding: 6px 0; color: #0284c7; font-weight: bold;">${escapeHtml(project.caseNo || 'N/A')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Court & Jurisdiction:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(project.courtType || 'District Court')} (${escapeHtml(project.courtCity || 'N/A')})</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Case Category:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(project.caseType || 'Civil')} Litigation</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Plaintiff:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(project.plaintiffName || 'N/A')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Defendant:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(project.defendantName || 'N/A')}</td>
                  </tr>
                  <tr style="border-top: 1px dashed #cbd5e1;">
                    <td style="padding: 10px 0 4px 0; color: #b91c1c; font-weight: 700;">Upcoming Hearing:</td>
                    <td style="padding: 10px 0 4px 0; color: #b91c1c; font-weight: 800; font-size: 15px;">
                      ${escapeHtml(project.nextHearingDate || 'To be scheduled')}
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 12px; color: #0369a1; line-height: 1.5;">
                  <strong>🔔 Automated Reminder Notice:</strong> You will also receive an automated email reminder <strong>3 days before the scheduled hearing date</strong> so that you can prepare in advance.
                </p>
              </div>

              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                You can log into your registered Unified Legal System portal account anytime to view updated case proceedings, timeline events, and shared documents.
              </p>
            </div>

            <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              Enterprise Unified Legal System • Automated Hearing Alert Service
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Dispatched case filing notice to registered party (${party.email})`);
    } catch (err: any) {
      console.error(`Failed to send case notice to ${party.email}:`, err.message);
    }
  }

  return true;
};

/**
 * Dispatch 3-Day Pre-Hearing Email Reminder (Legacy wrapper around sendHearingReminderEmail)
 */
export const dispatch3DayHearingReminderEmail = async (project: any, targetParty: RegisteredPartyUser): Promise<boolean> => {
  const result = await sendHearingReminderEmail(
    targetParty.email,
    targetParty.name,
    project,
    project.nextHearingDate,
    project.teamMembers && project.teamMembers.length > 0 ? project.teamMembers[0] : 'Assigned Advocate'
  );
  return result.success;
};

