// The Act certificate as an image, in the course's pixel style: white paper for printing, the
// pixel snake-P and the name in the pixel face, the Act on a sun-coloured pixel seal, the floor's
// residents drawn in pixels, and the address that proves it's real. 2000 x 1414, the shape of A4 landscape, so the PDF is the
// same picture filling the page. Drawn with next/og on request. Server only.
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { castColour, floorFor } from "@/lib/cast";
import { getIndex } from "@/lib/content/server";
import type { Certificate } from "@/lib/server/certificates";
import { CAST_LOOKS } from "@/lib/pixel/looks";
import { DAY, DISPLAY, OUTLINE, OgMark, OgPerson, TEXT, ROMAN, SUN, SUN_INK, bareUrl, longDate, ogFonts } from "./og";

export const CERTIFICATE_SIZE = { width: 2000, height: 1414 };

/** The Act's subject ("Algorithms and data structures"), or the title it was issued under. */
export function actName(c: Pick<Certificate, "actId" | "actTitle">): string {
  try {
    return getIndex().acts.find((a) => a.id === c.actId)?.subject ?? c.actTitle;
  } catch {
    return c.actTitle;
  }
}

/** A long name gets a smaller size so it stays on one or two lines; always a multiple of 8, where the pixel face is crisp. */
const nameSize = (name: string) => (name.length <= 16 ? 144 : name.length <= 24 ? 120 : name.length <= 36 ? 96 : 80);

function CertificateArt({ c, url }: { c: Certificate; url: string }) {
  const floor = floorFor(c.actNumber);
  const roman = ROMAN[c.actNumber] ?? String(c.actNumber);
  // Everyone on the roof shows as a head, so all six fit on the seal.
  const residents = (floor?.residents ?? []).filter((who) => CAST_LOOKS[who]);
  const label = { fontFamily: TEXT, fontWeight: 700, fontSize: 26, color: DAY.text2 } as const;
  const value = { fontFamily: DISPLAY, fontSize: 40, color: DAY.text } as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: DAY.bg, color: DAY.text, fontFamily: TEXT, position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: "100%", height: 24, background: SUN }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "128px 128px 104px" }}>
        {/* The brand, and what this is. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <OgMark size={96} />
            <span style={{ fontFamily: DISPLAY, fontSize: 56 }}>{BRAND.name}</span>
          </div>
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 30, color: DAY.text2 }}>Certificate of completion</span>
        </div>

        {/* Who, and what they finished. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, gap: 80 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1240 }}>
            <span style={{ fontSize: 36, color: DAY.text2, marginBottom: 20 }}>This certifies that</span>
            <span style={{ fontFamily: DISPLAY, fontSize: nameSize(c.name), lineHeight: 1.05, marginBottom: 40 }}>{c.name}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 56, lineHeight: 1.15, marginBottom: 16 }}>
              completed Act {roman}: {actName(c)}
            </span>
            <span style={{ fontSize: 36, color: DAY.text2, lineHeight: 1.4 }}>
              {c.projects} real Python projects, built, tested and shipped.
            </span>
            {floor ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
                <div style={{ display: "flex", width: 24, height: 24, background: castColour(floor.residents[0] ?? "").face, border: `4px solid ${OUTLINE}` }} />
                <span style={{ fontSize: 30, color: DAY.text2 }}>
                  {floor.room}, {floor.act === 1 ? "the ground floor" : floor.act === 9 ? "the roof" : floor.label.toLowerCase()} of the Clocktower
                </span>
              </div>
            ) : null}
          </div>
          {/* The seal: the Act on sun, with the floor's residents standing on it. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: 400, background: SUN, color: SUN_INK, border: `8px solid ${OUTLINE}`, boxShadow: `16px 16px 0 ${OUTLINE}` }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 56, lineHeight: 1, marginTop: 40 }}>Act</span>
            <span style={{ fontFamily: DISPLAY, fontSize: roman.length > 3 ? 128 : 176, lineHeight: 1, marginTop: 8 }}>{roman}</span>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", marginTop: 24 }}>
              {residents.map((who) => <OgPerson key={who} look={CAST_LOOKS[who]} expression="proud" {...(residents.length > 2 ? { scale: 2, crop: "head" as const } : { scale: residents.length > 1 ? 3 : 4, pose: "thumbs" as const })} />)}
            </div>
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
