import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './app/lib/db/migrations',
  schema: './app/lib/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
