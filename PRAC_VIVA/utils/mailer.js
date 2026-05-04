import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const getDisplayNameFromEmail = (email) => email.split('@')[0] || 'there';

const buildOtpEmailHtml = ({ email, otp }) => {
  const displayName = getDisplayNameFromEmail(email);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset OTP</title>
      </head>
      <body style="margin:0; padding:24px; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#111111;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px; background-color:#ffffff; border:1px solid #e8e8e8; border-radius:12px; padding:48px 32px;">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="width:0; height:0; border-left:28px solid transparent; border-right:28px solid transparent; border-bottom:52px solid #111111;"></div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:24px; line-height:1.4; font-weight:400; padding-bottom:44px;">
                    Verify your email to reset your password
                  </td>
                </tr>
                <tr>
                  <td style="font-size:18px; line-height:1.8; color:#222222;">
                    <p style="margin:0 0 20px 0;">Hello <strong>${displayName}</strong>,</p>
                    <p style="margin:0 0 20px 0;">We received a password reset request for your account from <strong>India</strong>.</p>
                    <p style="margin:0 0 30px 0;">To complete the password reset process, enter the 6-digit code in the original window:</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 0 36px 0;">
                    <div style="display:inline-block; background-color:#f3f3f3; border-radius:12px; padding:26px 36px; font-size:34px; line-height:1; font-weight:700; letter-spacing:12px; color:#222222;">
                      ${otp}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:15px; line-height:1.7; color:#666666;">
                    <p style="margin:0 0 12px 0;">This code will expire in 10 minutes.</p>
                    <p style="margin:0;">If you did not request this, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

export const sendOtpEmail = async (to, otp) => {
  await sendEmail({
    to,
    subject: 'Your password reset OTP',
    text: `Hello ${getDisplayNameFromEmail(to)}, your password reset OTP is ${otp}. It will expire in 10 minutes.`,
    html: buildOtpEmailHtml({ email: to, otp }),
  });
};
