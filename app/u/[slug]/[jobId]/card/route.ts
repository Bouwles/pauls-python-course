import { getDb } from "@/lib/server/db";
import { drawShareCard, sharedProject } from "@/lib/server/share";

export const dynamic = "force-dynamic";

/** The share card for a shipped project: drawn from the pixel art on request. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; jobId: string }> }) {
  const { slug, jobId } = await ctx.params;
  const p = await sharedProject(await getDb(), slug, jobId);
  if (!p) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(drawShareCard(p).png()), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=600" } });
}
