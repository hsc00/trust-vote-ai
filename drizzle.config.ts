import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: './packages/backend/.env' });

export default defineConfig({
  schema: './packages/backend/src/db/schema.ts',
  out: './packages/backend/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
