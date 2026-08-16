import nodemailer from 'nodemailer';
import { User } from '../models/Schemas';

export interface RegisteredPartyUser {
  user: any;
  roleInCase: 'Plaintiff' | 'Defendant' | 'Client';
  email: string;
  name: string;
}

/**
 * Configure Nodemailer Transporter
 */
const createTransporter = () => {
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
              <h3 style="color: #0f172a; margin-top: 0;">Dear ${party.name},</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                You are receiving this notification because your registered email is associated as a <strong>${party.roleInCase}</strong> in a new legal case file created by Advocate <strong>${advocateName}</strong>.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                <table style="width: 100%; text-align: left; font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Case File Name:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${project.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Case Number:</td>
                    <td style="padding: 6px 0; color: #0284c7; font-weight: bold;">${project.caseNo || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Court & Jurisdiction:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${project.courtType || 'District Court'} (${project.courtCity || 'N/A'})</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Case Category:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${project.caseType || 'Civil'} Litigation</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Plaintiff:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${project.plaintiffName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Defendant:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${project.defendantName || 'N/A'}</td>
                  </tr>
                  <tr style="border-top: 1px dashed #cbd5e1;">
                    <td style="padding: 10px 0 4px 0; color: #b91c1c; font-weight: 700;">Upcoming Hearing:</td>
                    <td style="padding: 10px 0 4px 0; color: #b91c1c; font-weight: 800; font-size: 15px;">
                      ${project.nextHearingDate || 'To be scheduled'}
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
 * Dispatch 3-Day Pre-Hearing Email Reminder
 */
export const dispatch3DayHearingReminderEmail = async (project: any, targetParty: RegisteredPartyUser): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Unified Legal System" <no-reply@unifiedlegalsystem.org>',
      to: targetParty.email.trim().toLowerCase(),
      subject: `🔔 HEARING REMINDER (In 3 Days): ${project.name} [Case No: ${project.caseNo || 'N/A'}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #b91c1c; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">🔔 UPCOMING COURT HEARING REMINDER</h2>
            <p style="color: #fef2f2; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">Hearing Date is in Exactly 3 Days</p>
          </div>

          <div style="padding: 24px; color: #1e293b;">
            <h3 style="color: #0f172a; margin-top: 0;">Dear ${targetParty.name},</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              This is an automated 3-day reminder regarding your upcoming court hearing for case file <strong>${project.name}</strong> as registered in the Unified Legal System.
            </p>

            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <table style="width: 100%; text-align: left; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #991b1b; font-weight: 700; width: 140px;">HEARING DATE:</td>
                  <td style="padding: 6px 0; color: #991b1b; font-weight: 800; font-size: 16px;">${project.nextHearingDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Case File Name:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${project.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Case Number:</td>
                  <td style="padding: 6px 0; color: #0284c7; font-weight: bold;">${project.caseNo || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Court & Location:</td>
                  <td style="padding: 6px 0; color: #0f172a;">${project.courtType || 'District Court'}, ${project.courtCity || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Your Role in Case:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${targetParty.roleInCase}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              Please consult with your assigned advocate and ensure all required documents, witness statements, and compliance filings are ready prior to the hearing.
            </p>
          </div>

          <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
            Enterprise Unified Legal System • Registered User Hearing Alert Service
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Dispatched 3-day hearing reminder email to registered party (${targetParty.email})`);
    return true;
  } catch (err: any) {
    console.error(`Failed to send 3-day reminder to ${targetParty.email}:`, err.message);
    return false;
  }
};
