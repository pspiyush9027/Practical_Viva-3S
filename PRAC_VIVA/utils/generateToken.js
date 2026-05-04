import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return process.env.JWT_SECRET;
};

export const generateAuthToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
