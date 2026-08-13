import { createClient } from "@supabase/supabase-js";

let adminInstance = null;

export function getSupabaseAdmin() {
  if (adminInstance) return adminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  adminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminInstance;
}

// Dynamic proxy export to safely resolve getSupabaseAdmin() at call-time
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