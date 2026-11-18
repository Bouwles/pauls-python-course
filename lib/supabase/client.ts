"use client";

// The one Supabase client in the browser. Sign-in lasts across visits (kept in localStorage)
// and refreshes itself. Emails confirm with a code or a token_hash link (verifyOtp), so a
// confirmation opened on another device works: nothing has to be remembered in this browser.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./project";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: "implicit", storageKey: "ppc-auth" },
    });
  }
  return client;
}
