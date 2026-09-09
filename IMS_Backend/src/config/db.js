// src/config/db.js

import { env } from './env.js'; // Assuming you have your env.js set up from previous steps

// Define log levels based on environment
const logLevels = env === 'development' 
  ? ['query', 'info', 'warn', 'error'] 
  : ['error', 'warn']; // In production, we usually only want errors/warns

export const dbConfig = {
  log: logLevels,
  errorFormat: 'minimal', // 'pretty' or 'minimal'
};

export default dbConfig;