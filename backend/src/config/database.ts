import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './env.js';
import * as schema from '../schemas/index.js';

if (!config.database.url) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(config.database.url);
export const db = drizzle(client, { schema });