import { originOf } from "@/lib/server/http";
import { ppcZip } from "@/lib/ppc-zip";

export const dynamic = "force-dynamic";

/**
 * The ppc CLI as a source package (Section 10.5): `pip install <site>/ppc.zip`.
 * Built from /cli on request, with this site's address as the default, so the
 * tool talks to whichever deployment it was downloaded from. The GitHub Pages
 * build writes the same file ahead of time (scripts/build-pages.ts).
 */
export async function GET(req: Request) {
  const { name, bytes } = ppcZip(originOf(req));
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
