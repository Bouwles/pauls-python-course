import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { githubEnabled, saveToken } from "@/lib/server/github";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

/** Step 2: GitHub sends the learner back with a code; swap it for a token and keep it, encrypted. */
export async function GET(req: Request) {
  if (!githubEnabled()) return new NextResponse("GitHub isn't set up on this site.", { status: 404 });
  const url = new URL(req.url);
  const store = await cookies();
  const expected = store.get("ppc_github_state")?.value;
  store.delete("ppc_github_state");
  const user = await getSessionUser();
  const back = (result: string) => NextResponse.redirect(new URL(`/shelf?github=${result}`, req.url));
  if (!user || !expected || url.searchParams.get("state") !== expected || !url.searchParams.get("code")) return back("failed");
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: url.searchParams.get("code") }),
  });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string };
  if (!body.access_token) return back("failed");
  const me = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${body.access_token}`, Accept: "application/vnd.github+json", "User-Agent": BRAND.name.toLowerCase() } });
  const login = ((await me.json().catch(() => ({}))) as { login?: string }).login ?? "";
  await saveToken(user.id, body.access_token, login);
  return back("connected");
}
