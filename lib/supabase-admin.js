import { createClient } from "@supabase/supabase-js";

let adminInstance = null;

export function getSupabaseAdmin() {
  if (adminInstance) return adminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Always use NEXT_PUBLIC_SUPABASE_ANON_KEY if SUPABASE_SERVICE_ROLE_KEY is not set
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  adminInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminInstance;
}

// Dynamic proxy export so supabaseAdmin always resolves using available environment variables
export const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    const client = getSupabaseAdmin();
    if (!client) {
      return null;
    }
    const val = client[prop];
    return typeof val === "function" ? val.bind(client) : val;
  }
});