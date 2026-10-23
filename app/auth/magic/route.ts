import { NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/server/auth";
import { limited } from "@/lib/server/http";

export async function GET(req: Request) {
  const tooMany = limited(req, "magic-verify", 20, 60_000);
  if (tooMany) return tooMany;
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const result = await verifyMagicLink(token);
  return NextResponse.redirect(new URL(result.ok ? "/welcome?from=link" : "/login?error=link", req.url));
}
