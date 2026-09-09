import { PrismaClient } from '@prisma/client';

import { dbConfig } from '../config/db.js';
import { env } from '../config/env.js';

// Prevent multiple instances of Prisma Client in development
// caused by hot reloading (nodemon)
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient(dbConfig);

if (env !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
