import { NextResponse } from "next/server";
import { oauthUrl } from "@/lib/server/auth";
import { limited, originOf } from "@/lib/server/http";

export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (provider !== "google" && provider !== "github") return NextResponse.redirect(new URL("/login", req.url));
  const tooMany = limited(req, "oauth", 10, 60_000);
  if (tooMany) return tooMany;
  const url = await oauthUrl(provider, originOf(req));
  return NextResponse.redirect(url ?? new URL("/login?error=oauth", req.url));
}
