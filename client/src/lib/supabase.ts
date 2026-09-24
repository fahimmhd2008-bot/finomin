// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-campus-sustainability.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isLiveSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('mock-campus')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
