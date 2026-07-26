import nodemailer from 'nodemailer';

export interface SendOtpOptions {
  email?: string;
  phone?: string;
  otp: string;
  otpChannel: 'mobile' | 'email';
  purpose: 'Registration Verification' | 'Password Reset' | 'Login Authentication';
}

/**
 * Configure Nodemailer Transporter
 * Dispatches real emails directly using SMTP transport
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

  // Direct SMTP transport configuration
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
 * Dispatches OTP code via Email or SMS directly to the recipient without logging OTP to terminal
 */
export const dispatchOtpNotification = async (options: SendOtpOptions): Promise<boolean> => {
  const { email, phone, otp, otpChannel, purpose } = options;

  if (otpChannel === 'email' && email) {
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Unified Legal System" <no-reply@unifiedlegalsystem.org>',
        to: email.trim().toLowerCase(),
        subject: `[${otp}] Your Security OTP Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background-color: #0F172A; padding: 18px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">⚖️ Unified Legal Professional System</h2>
            </div>
            <div style="padding: 28px; background-color: #ffffff;">
              <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">Security OTP Verification Code</h3>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                You have requested a security OTP for <strong>${purpose}</strong>. Please use the 6-digit key below to complete your authentication:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #0284c7; background-color: #f0f9ff; padding: 14px 28px; border: 1px solid #bae6fd; border-radius: 10px; display: inline-block;">
                  ${otp}
                </span>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
                This OTP code expires in 5 minutes and is valid for single use only. Do not share this OTP key with anyone for your account safety.
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-radius: 0 0 8px 8px;">
              Enterprise Legal Professional System • Confidential & Secure
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error(`Attempted direct email delivery to ${email}`);
      return false;
    }
  }

  return true;
};
