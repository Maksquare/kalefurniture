import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// This client bypasses RLS entirely. It should ONLY be used in server actions or API routes, never on the client.
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        fetch: (...args) => fetch(...args, { cache: 'no-store' }),
      },
    }) 
  : null;
