import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import userModel from '../models/user.js';
import otpModel from '../models/otp.js';
import { generateAuthToken } from '../utils/generateToken.js';
import { validateEmailWithAbstract } from '../utils/emailValidation.js';

dotenv.config();

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const normalizeEmail = (email) => email?.trim().toLowerCase();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const emailValidation = await validateEmailWithAbstract(normalizedEmail);
    if (!emailValidation.isAccepted) {
      return res.status(400).json({ message: emailValidation.reason });
    }

    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const authToken = generateAuthToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token: authToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to register user',
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const authToken = generateAuthToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token: authToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to login user',
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
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

    await otpModel.updateMany(
      {
        email: normalizedEmail,
        purpose: 'password-reset',
        status: 'active',
      },
      {
        $set: {
          status: 'expired',
        },
      }
    );

    return res.status(200).json({
      message: 'User verified. Call the send OTP endpoint to continue password reset.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to start forgot password flow',
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !newPassword || !otp) {
      return res.status(400).json({ message: 'email, otp, and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const otpRecord = await otpModel
      .findOne({
        email: normalizedEmail,
        purpose: 'password-reset',
        status: 'active',
      })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found or already used' });
    }

    if (otpRecord.expiresAt < new Date()) {
      otpRecord.status = 'expired';
      await otpRecord.save();
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    otpRecord.status = 'used';
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

export const logoutUser = async (_req, res) => {
  return res.status(200).json({
    message: 'Logout successful on the server. Remove the auth token on the client side.',
  });
};
