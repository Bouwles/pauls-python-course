// Renders the favicons (16, 32, 180, 512 px), public/brand/mark.svg and the OG image (1200x630)
// from the pixel snake-P in lib/pixel/mark.ts, every pixel a whole number of screen pixels. The
// OG image has the name and the line in the pixel face, and the whole class along the bottom.
// Run once after changing the mark, the name or the cast; the files are committed.
//   npx tsx scripts/build-brand.tsx
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import { BRAND } from "../lib/brand";
import { MARK_CELLS, MARK_GRID, MARK_HEX, markSvg } from "../lib/pixel/mark";
import { CAST_LOOKS } from "../lib/pixel/looks";
import { castColour } from "../lib/cast";
import { DISPLAY, NIGHT, OUTLINE, OgMark, OgPerson, SUN, TEXT, ogFonts } from "../components/certificates/og";

const pub = (f: string) => path.join(process.cwd(), "public", f);
const PAGE = NIGHT.bg;

/** The mark as a PNG, `scale` pixels to each of its pixels, centred on a `size` canvas. */
async function markPng(scale: number, size: number, background?: string): Promise<Buffer> {
  const raw = Buffer.alloc(size * size * 4);
  const bg = background ? [1, 3, 5].map((i) => parseInt(background.slice(i, i + 2), 16)) : null;
  const off = Math.floor((size - MARK_GRID * scale) / 2);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const gx = Math.floor((x - off) / scale);
      const gy = Math.floor((y - off) / scale);
      const part = x >= off && y >= off ? MARK_CELLS[gy]?.[gx] : undefined;
      if (part && part !== ".") {
        const hex = MARK_HEX[part];
        raw.set([parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255], i);
      } else if (bg) raw.set([bg[0]!, bg[1]!, bg[2]!, 255], i);
    }
  return sharp(raw, { raw: { width: size, height: size, channels: 4 } }).png().toBuffer();
}

async function main() {
  // Small sizes: the mark alone, edge to edge, on transparency.
  for (const [file, scale] of [["icon-16.png", 1], ["icon-32.png", 2], ["icon.png", 2], ["icon-512.png", 32]] as const) {
    fs.writeFileSync(pub(file), await markPng(scale, MARK_GRID * scale));
    console.log(`public/${file}`);
  }
  // Apple touch icon: no transparency allowed, so the mark sits on the dark page colour.
  fs.writeFileSync(pub("apple-icon.png"), await markPng(9, 180, PAGE));
  console.log("public/apple-icon.png");
  fs.writeFileSync(pub("brand/mark.svg"), markSvg(64) + "\n");
  console.log("public/brand/mark.svg");

  // The OG image: the wordmark and the line, and the class standing along the bottom on their colours.
  const cast = ["paul", "neil", "aaesha", "caitlin", "riya", "yahya"];
  const og = new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: PAGE, color: NIGHT.text, fontFamily: TEXT }}>
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 80px 0", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <OgMark size={64} />
            <span style={{ fontFamily: DISPLAY, fontSize: 48 }}>{BRAND.name}</span>
          </div>
          <span style={{ fontFamily: DISPLAY, fontSize: 56, color: SUN, lineHeight: 1.1 }}>Learn Python by building real things.</span>
          <span style={{ fontSize: 26, lineHeight: 1.4, color: NIGHT.text2 }}>From your first line of code to machine learning, one real project at a time. Free to start.</span>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "center", gap: 0, padding: "0 80px" }}>
          {cast.map((who, i) => (
            <div key={who} style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", width: 172, height: 192, background: castColour(who).face, border: `4px solid ${OUTLINE}`, borderBottom: "none", marginLeft: i ? -4 : 0 }}>
              <OgPerson look={CAST_LOOKS[who]} scale={3} expression={i % 2 ? "pleased" : "neutral"} pose={who === "paul" ? "wave" : "idle"} />
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: ogFonts() },
  );
  fs.writeFileSync(pub("og.png"), Buffer.from(await og.arrayBuffer()));
  console.log("public/og.png");
}

main();
