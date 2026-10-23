import { NextResponse } from "next/server";
import { exchangeSupabaseCode } from "@/lib/server/auth";

// Supabase sends people back here after a magic link, email confirmation or OAuth.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  const ok = code ? await exchangeSupabaseCode(code) : false;
  return NextResponse.redirect(new URL(ok ? "/welcome?from=link" : "/login?error=link", req.url));
}
