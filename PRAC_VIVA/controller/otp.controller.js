import bcrypt from 'bcrypt';
import otpModel from '../models/otp.js';
import userModel from '../models/user.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { validateEmailWithAbstract } from '../utils/emailValidation.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (email) => email?.trim().toLowerCase();

export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'email is required' });
    }

    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const emailValidation = await validateEmailWithAbstract(normalizedEmail);
    if (!emailValidation.isAccepted) {
      return res.status(400).json({ message: emailValidation.reason });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, 10);

    await otpModel.updateMany(
      {
        email: normalizedEmail,
        purpose: 'password-reset',
        status: { $in: ['active', 'verified'] },
      },
      {
        $set: {
          status: 'expired',
        },
      }
    );

    await otpModel.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'password-reset',
      expiresAt,
    });

    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      message: 'OTP sent successfully',
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};
