// server/src/config/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl =
  process.env.SUPABASE_URL ||
  'https://udfpxzmdhcdrneeslwdo.supabase.co';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZnB4em1kaGNkcm5lZXNsd2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTg5MjYsImV4cCI6MjEwNTc5NDkyNn0.XmFdzZcvcTEsXHGJti4HkIlFjSCjNf3--_8BLTupg1o';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.includes('.supabase.co') &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseUrl.includes('mock-campus')
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
