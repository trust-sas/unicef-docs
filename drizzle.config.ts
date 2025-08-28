import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // Changé de 'driver' à 'dialect'
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Changé de 'connectionString' à 'url'
  },
  verbose: true,
  strict: true,
});