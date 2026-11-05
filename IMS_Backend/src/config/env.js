import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(__dirname, '../../.env') });


const requireEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return process.env[name];
};

export const env = process.env.NODE_ENV || 'development';
export const port = Number(process.env.PORT) || 3000;
export const isProduction = env === 'production';
export const isDevelopment = env === 'development';

export const dbUrl = requireEnv('DATABASE_URL');

export const jwtSecret = requireEnv('JWT_SECRET');
export const jwtRefreshSecret = requireEnv('JWT_REFRESH_SECRET');
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
export const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const cors = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

export const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

export const uploadLimit = process.env.UPLOAD_LIMIT
  ? parseInt(process.env.UPLOAD_LIMIT, 10)
  : 10 * 1024 * 1024;

const config = {
  env,
  port,
  isProduction,
  dbUrl,
  jwtSecret,
  jwtExpiresIn,
  cors,
};

export default config;
