import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if running locally (non-Neon database) or on Replit (Neon database)
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech');

let pool: any;
let db: any;

if (isNeonDatabase) {
  // Use Neon serverless driver for Replit/cloud
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Use standard pg driver for local PostgreSQL
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNode({ client: pool, schema });
}

export { pool, db };