
import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js'; // Ensure you have this from previous steps

// Configuration for cookies
export const cookieConfig = {
  httpOnly: true, // Prevents JS access (XSS protection)
  secure: env === 'production', // HTTPS only in prod
  sameSite: 'strict', // CSRF protection
  path: '/', // Available across the app
};

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m', // Short life for security
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d', // Long life
  });
};

// Fast hashing for refresh tokens (store this hash in DB)
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
