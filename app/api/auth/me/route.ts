import { getSessionUser, oauthProviders, supabaseEnabled } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  return json({ user, mode: supabaseEnabled() ? "supabase" : "local", oauth: oauthProviders() });
}
