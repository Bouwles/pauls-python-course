// The Act certificate as an image: the same engraved certificate as the one drawn in the browser,
// from the same shapes (art.ts). 2000 x 1414, the shape of A4 landscape, so the PDF is the same
// picture filling the page. Drawn with next/og on request. Server only.
import { ImageResponse } from "next/og";
import { getIndex } from "@/lib/content/server";
import type { Certificate } from "@/lib/server/certificates";
import { SHEET, certificateShapes, type Face, type Shape } from "./art";
import { ogFonts } from "./og";

export const CERTIFICATE_SIZE = SHEET;

/** The Act's subject ("Algorithms and data structures"), or the title it was issued under. */
export function actName(c: Pick<Certificate, "actId" | "actTitle">): string {
  try {
    return getIndex().acts.find((a) => a.id === c.actId)?.subject ?? c.actTitle;
  } catch {
    return c.actTitle;
  }
}

const FAMILY: Record<Face, string> = { title: "CertTitle, CertSerif", script: "CertScript, CertScriptExt, CertSerif", serif: "CertSerif", italic: "CertSerif" };

/** A path as an SVG picture the size of the sheet, since next/og has no box for one. */
const pathUrl = (s: Extract<Shape, { kind: "path" }>) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET.width}" height="${SHEET.height}" viewBox="0 0 ${SHEET.width} ${SHEET.height}"><path d="${s.d}" fill="${s.fill ?? "none"}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.width ?? 1}" stroke-linejoin="round"` : ""}/></svg>`).toString("base64")}`;

function Drawn({ s }: { s: Shape }) {
  if (s.kind === "rect") return <div style={{ display: "flex", position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, background: s.fill }} />;
  if (s.kind === "path") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" src={pathUrl(s)} width={SHEET.width} height={SHEET.height} style={{ position: "absolute", left: 0, top: 0 }} />;
  }
  const common = { display: "flex", position: "absolute" as const, fontFamily: FAMILY[s.face], fontStyle: s.face === "italic" ? "italic" : "normal", fontSize: s.size, lineHeight: 1, color: s.fill, whiteSpace: "nowrap" as const };
  const along = s.anchor === "end" ? { right: SHEET.width - s.x } : s.anchor === "middle" ? { left: s.x - 800, width: 1600, justifyContent: "center" } : { left: s.x };
  return <span style={{ ...common, top: s.y - s.size * 0.8, height: s.size, ...along }}>{s.text}</span>;
}

function CertificateArt({ c }: { c: Certificate }) {
  // next/og can't set letters round a circle cleanly, so the seal here goes without its ring of words.
  const shapes = certificateShapes({ name: c.name, act: c.actNumber, actName: actName(c), projects: c.projects, day: c.issuedAt, playingAs: null }).filter((s) => s.kind !== "text" || s.turn === undefined);
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%" }}>
      {shapes.map((s, i) => (
        <Drawn key={i} s={s} />
      ))}
    </div>
  );
}

/** The address where a certificate can be checked, linked from its page. */
export const certificateUrl = (c: Pick<Certificate, "id">, site: string) => `${site.replace(/\/$/, "")}/certificates/${c.id}`;

/** The certificate as a PNG response. `headers` go on the response (caching, file name). */
export function certificateImage(c: Certificate, headers?: Record<string, string>): ImageResponse {
  return new ImageResponse(<CertificateArt c={c} />, { ...CERTIFICATE_SIZE, fonts: ogFonts(), headers });
}

/** The certificate's PNG bytes, for the PDF. */
export async function certificatePng(c: Certificate): Promise<Buffer> {
  return Buffer.from(await certificateImage(c).arrayBuffer());
}
