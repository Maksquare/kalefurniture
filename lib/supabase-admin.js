import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

let serviceRoleClient = null;

export function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!serviceRoleClient) {
    serviceRoleClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serviceRoleClient;
}

export function getSupabasePublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getSupabaseAdminClient() {
  const serviceClient = getServiceRoleClient();
  if (serviceClient) {
    return serviceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  let token = null;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get("admin_token")?.value;
  } catch (e) {
    // In non-request contexts, cookies() may throw
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {},
  });
}

export function getSupabaseAdmin() {
  return getServiceRoleClient() || getSupabasePublicClient();
}

export const supabaseAdmin = new Proxy(
  {},
  {
    get(target, prop) {
      const client = getSupabaseAdmin();
      if (!client) {
        return () => ({
          select: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
          insert: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
          update: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
          delete: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
        });
      }
      const val = client[prop];
      return typeof val === "function" ? val.bind(client) : val;
    },
  }
);
