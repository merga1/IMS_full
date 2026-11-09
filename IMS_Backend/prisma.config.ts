import { defineConfig, env } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ override: true }); 

export default defineConfig({
  schema: 'src/database/prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
