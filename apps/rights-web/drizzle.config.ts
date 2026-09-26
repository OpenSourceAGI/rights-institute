import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'turso',
  schema: './lib/db/schema.ts',
  out: './lib/db/drizzle',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || 'file:./data/db.sqlite',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
