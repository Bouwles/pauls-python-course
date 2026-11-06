import { BRAND } from "@/lib/brand";
import { getCertificate } from "@/lib/server/certificates";
import { getDb } from "@/lib/server/db";
import { certificateImage } from "@/components/certificates/CertificateImage";

export const dynamic = "force-dynamic";

const slug = BRAND.name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-");

/** The certificate as a PNG, 2000 x 1414. `?download` saves it instead of showing it. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const c = await getCertificate(await getDb(), id);
  if (!c) return new Response("Not found", { status: 404 });
  const download = new URL(req.url).searchParams.has("download");
  return certificateImage(c, {
    "Cache-Control": "public, max-age=3600",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${slug}-certificate-act-${c.actNumber}.png"`,
  });
}
