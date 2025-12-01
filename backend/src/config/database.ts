
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Check your .env file.');
}

// Supabase client for auth and storage
export const supabase = createClient(supabaseUrl, supabaseKey);

// Connection string for Drizzle ORM
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:${supabaseKey}@${supabaseUrl.replace('https://', '')}:5432/postgres`;

// Postgres client for Drizzle
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient);
