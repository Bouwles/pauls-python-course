import { getDb } from "@/lib/server/db";
import { sharedProject } from "@/lib/server/share";
import { shareCard } from "./ShareCard";

export const dynamic = "force-dynamic";

/** The share card for a shipped project, drawn on request (1200 x 630 PNG). */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; jobId: string }> }) {
  const { slug, jobId } = await ctx.params;
  const p = await sharedProject(await getDb(), slug, jobId);
  if (!p) return new Response("Not found", { status: 404 });
  return shareCard(p, slug, { "Cache-Control": "public, max-age=600" });
}
