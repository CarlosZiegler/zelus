import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import { Pool, neonConfig } from '@neondatabase/serverless'
import postgres from 'postgres'
import ws from 'ws'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Detect if we're connecting to Neon (production) or local PostgreSQL (development)
const isNeonConnection = connectionString.includes('neon.tech')

function createDb() {
  if (isNeonConnection) {
    // Configure WebSocket for Node.js environments
    neonConfig.webSocketConstructor = ws

    // Use Neon serverless driver with WebSocket pool for better performance
    // This supports transactions and is optimized for serverless environments
    const pool = new Pool({ connectionString })
    return drizzleNeon(pool, { schema })
  } else {
    // Use postgres-js for local development
    const client = postgres(connectionString!)
    return drizzlePostgres(client, { schema })
  }
}

export const db = createDb()

export type DB = typeof db
