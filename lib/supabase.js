import { createBrowserClient } from "@supabase/ssr";

let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Named export for backwards compatibility
export const supabase = typeof window !== "undefined" ? getSupabase() : null;