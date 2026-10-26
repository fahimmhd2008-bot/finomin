// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://udfpxzmdhcdrneeslwdo.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZnB4em1kaGNkcm5lZXNsd2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTg5MjYsImV4cCI6MjEwNTc5NDkyNn0.XmFdzZcvcTEsXHGJti4HkIlFjSCjNf3--_8BLTupg1o';

export const isLiveSupabase = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseUrl.includes('mock-campus')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
