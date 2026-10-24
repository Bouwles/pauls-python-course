import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { githubEnabled } from "@/lib/server/github";
import { originOf } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Step 1: send the learner to GitHub to allow creating public repositories. */
export async function GET(req: Request) {
  if (!githubEnabled()) return new NextResponse("GitHub isn't set up on this site.", { status: 404 });
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/shelf", req.url));
  const state = randomBytes(16).toString("base64url");
  (await cookies()).set("ppc_github_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
  url.searchParams.set("scope", "public_repo");
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", `${originOf(req)}/api/github/callback`);
  return NextResponse.redirect(url);
}
