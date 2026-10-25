import { siteUrl } from "@/lib/brand";
import { getCertificate, drawCertificate } from "@/lib/server/certificates";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** The certificate as a PNG, drawn in pixels on the palette. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) return new Response("Not found", { status: 404 });
  const png = drawCertificate(c, siteUrl()).png();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600", "Content-Disposition": `inline; filename="fixwick-certificate-act-${c.actNumber}.png"` },
  });
}
