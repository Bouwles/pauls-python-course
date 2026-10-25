import { BRAND, siteUrl } from "@/lib/brand";
import { imagePdf } from "@/lib/pixel/pdf";
import { getCertificate, drawCertificate } from "@/lib/server/certificates";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** The certificate as a one-page PDF, for printing. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) return new Response("Not found", { status: 404 });
  const r = drawCertificate(c, siteUrl());
  const pdf = imagePdf(r.w, r.h, r.rgb(), `${BRAND.name} certificate: ${c.name}, Act ${c.actNumber}`);
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Cache-Control": "public, max-age=3600", "Content-Disposition": `attachment; filename="${BRAND.name.toLowerCase()}-certificate-act-${c.actNumber}.pdf"` },
  });
}
