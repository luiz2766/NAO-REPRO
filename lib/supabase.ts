import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials missing. Client not initialized.");
      return null;
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to anon key (RLS will apply).");
    return getSupabase(); // Fallback to anon key if service role is missing
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// For backward compatibility with existing code
export const supabase = {
  from: (table: string) => {
    const client = getSupabase();
    if (!client) throw new Error("Supabase client not initialized. Check your environment variables.");
    return client.from(table);
  }
} as any;
