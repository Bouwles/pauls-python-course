// The Act certificate as an image (REDESIGN-2.md 1 and 2): white paper for printing, the
// snake-P mark and the name in the display face, the Act on a sun-coloured seal, and the
// address that proves it's real. 2000 x 1414, the shape of A4 landscape, so the PDF is the
// same picture filling the page. Drawn with next/og on request. Server only.
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { castColour, floorFor } from "@/lib/cast";
import { getIndex } from "@/lib/content/server";
import type { Certificate } from "@/lib/server/certificates";
import { DAY, DISPLAY, OgMark, TEXT, ROMAN, SUN, SUN_INK, bareUrl, longDate, ogFonts } from "./og";

export const CERTIFICATE_SIZE = { width: 2000, height: 1414 };

/** The Act's subject ("Algorithms and data structures"), or the title it was issued under. */
export function actName(c: Pick<Certificate, "actId" | "actTitle">): string {
  try {
    return getIndex().acts.find((a) => a.id === c.actId)?.subject ?? c.actTitle;
  } catch {
    return c.actTitle;
  }
}

/** A long name gets a smaller size so it stays on one or two lines. */
const nameSize = (name: string) => (name.length <= 16 ? 150 : name.length <= 24 ? 124 : name.length <= 36 ? 100 : 80);

function CertificateArt({ c, url }: { c: Certificate; url: string }) {
  const floor = floorFor(c.actNumber);
  const roman = ROMAN[c.actNumber] ?? String(c.actNumber);
  const label = { fontFamily: TEXT, fontWeight: 700, fontSize: 26, color: DAY.text2 } as const;
  const value = { fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: DAY.text, letterSpacing: -0.8 } as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: DAY.bg, color: DAY.text, fontFamily: TEXT, position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: "100%", height: 24, background: SUN }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "128px 128px 104px" }}>
        {/* The brand, and what this is. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <OgMark size={84} />
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, letterSpacing: -1 }}>{BRAND.name}</span>
          </div>
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 30, color: DAY.text2 }}>Certificate of completion</span>
        </div>

        {/* Who, and what they finished. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, gap: 80 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1240 }}>
            <span style={{ fontSize: 36, color: DAY.text2, marginBottom: 20 }}>This certifies that</span>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: nameSize(c.name), lineHeight: 1.02, letterSpacing: -nameSize(c.name) * 0.02, marginBottom: 40 }}>{c.name}</span>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, lineHeight: 1.1, letterSpacing: -1.2, marginBottom: 16 }}>
              completed Act {roman}: {actName(c)}
            </span>
            <span style={{ fontSize: 36, color: DAY.text2, lineHeight: 1.4 }}>
              {c.projects} real Python projects, built, tested and shipped.
            </span>
            {floor ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
                <div style={{ display: "flex", width: 22, height: 22, borderRadius: 4, background: castColour(floor.residents[0] ?? "").face }} />
                <span style={{ fontSize: 30, color: DAY.text2 }}>
                  {floor.room}, {floor.act === 1 ? "the ground floor" : floor.act === 9 ? "the roof" : floor.label.toLowerCase()} of the Clocktower
                </span>
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "none", width: 380, height: 380, borderRadius: 9999, background: SUN, color: SUN_INK }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, lineHeight: 1 }}>Act</span>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: roman.length > 3 ? 132 : 176, lineHeight: 1, letterSpacing: -3, marginTop: 4 }}>{roman}</span>
          </div>
        </div>

        {/* When, where to check it, and who signed it. */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 88, paddingTop: 40, borderTop: `2px solid ${DAY.line}` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={label}>Issued</span>
            <span style={value}>{longDate(c.issuedAt)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <span style={label}>Check it at</span>
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 32, lineHeight: 1.3, color: DAY.text }}>{bareUrl(url)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <span style={label}>Signed</span>
            <span style={value}>{BRAND.creditName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The verification address printed on the certificate and linked from it. */
export const certificateUrl = (c: Pick<Certificate, "id">, site: string) => `${site.replace(/\/$/, "")}/certificates/${c.id}`;

/** The certificate as a PNG response. `headers` go on the response (caching, file name). */
export function certificateImage(c: Certificate, site: string, headers?: Record<string, string>): ImageResponse {
  return new ImageResponse(<CertificateArt c={c} url={certificateUrl(c, site)} />, { ...CERTIFICATE_SIZE, fonts: ogFonts(), headers });
}

/** The certificate's PNG bytes, for the PDF. */
export async function certificatePng(c: Certificate, site: string): Promise<Buffer> {
  return Buffer.from(await certificateImage(c, site).arrayBuffer());
}
