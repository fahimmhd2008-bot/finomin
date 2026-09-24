// server/src/config/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-campus-sustainability.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-service-key';

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && 
  process.env.SUPABASE_URL.includes('.supabase.co') &&
  !process.env.SUPABASE_URL.includes('your-supabase-project') &&
  !process.env.SUPABASE_URL.includes('mock-campus') &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase')
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
