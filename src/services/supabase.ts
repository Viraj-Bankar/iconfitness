import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read directly from import.meta.env with safe fallback for non-Vite environments
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
export const supabaseUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (env.VITE_SUPABASE_URL as string) ||
  '';

export const supabaseAnonKey: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (env.VITE_SUPABASE_ANON_KEY as string) ||
  '';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'YOUR_SUPABASE_URL' &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('https://')
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
}
