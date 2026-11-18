// Deletes the account of whoever calls it, and everything saved with it (every table references
// auth.users on delete cascade). The browser can't delete an account itself, and the key that can
// must never reach a browser, so it lives here. It only ever deletes the account the request is
// signed in as: nothing in the request says whose account to delete. Deployed with verify_jwt off,
// because it checks the caller's sign-in itself (auth.getUser below), which works whichever kind
// of signing key the project uses.
import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const ALLOWED = new Set(["https://paulspythoncourse.com", "https://www.paulspythoncourse.com", "http://localhost:4173", "http://localhost:4174", "http://localhost:3000"]);

function cors(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED.has(origin) ? origin : "https://paulspythoncourse.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("Origin")), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const url = Deno.env.get("SUPABASE_URL");
  // The project's secret key (bypasses row level security): the new kind if there is one.
  let secret: string | undefined;
  try {
    secret = (JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}") as Record<string, string>).default;
  } catch {
    secret = undefined;
  }
  secret ??= Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !url || !secret) return new Response(JSON.stringify({ error: "Not signed in" }), { status: 401, headers });

  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return new Response(JSON.stringify({ error: "Not signed in" }), { status: 401, headers });

  // Sign them out everywhere first, then delete: the account and, by cascade, all of its rows.
  await admin.auth.admin.signOut(token, "global").catch(() => {});
  const gone = await admin.auth.admin.deleteUser(data.user.id);
  if (gone.error) return new Response(JSON.stringify({ error: "Could not delete the account" }), { status: 500, headers });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});
