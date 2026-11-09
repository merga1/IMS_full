import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const requireEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return process.env[name];
};

export const env = process.env.NODE_ENV || 'development';
export const port = Number(process.env.PORT) || 3000;
const isDevelopment = env === 'development';

// Fail fast at start-up if a mandatory secret is missing.
requireEnv('DATABASE_URL');
export const jwtSecret = requireEnv('JWT_SECRET');
export const jwtRefreshSecret = requireEnv('JWT_REFRESH_SECRET');

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : isDevelopment
    ? ['http://localhost:5173', 'http://localhost:3000']
    : [];

export const cors = {
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
