import { BRAND } from "@/lib/brand";
import { getCertificate } from "@/lib/server/certificates";
import { getDb } from "@/lib/server/db";
import { certificatePng } from "@/components/certificates/CertificateImage";
import { pngToPdf } from "@/components/certificates/pdf";

export const dynamic = "force-dynamic";

const slug = BRAND.name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-");

/** The certificate as a one-page A4 PDF, for printing: the same picture as the PNG. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) return new Response("Not found", { status: 404 });
  const pdf = pngToPdf(await certificatePng(c), `${BRAND.name} certificate: ${c.name}, Act ${c.actNumber}`);
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Cache-Control": "public, max-age=3600", "Content-Disposition": `attachment; filename="${slug}-certificate-act-${c.actNumber}.pdf"` },
  });
}
