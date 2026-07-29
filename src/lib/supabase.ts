import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The client is only created when both env vars are present, so the public
 * pages keep rendering (with seed content) before the project is wired up.
 * Everything that writes data must check `isSupabaseReady` first.
 */
export const isSupabaseReady = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseReady
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase yapılandırılmamış. .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.',
    );
  }
  return supabase;
}
