// What the server-drawn images (certificates and share cards) share: the fonts, the colours,
// the pixel snake-P mark and the learner's pixel avatar. They're drawn with next/og, which reads
// TTF, OTF and WOFF but not WOFF2, so the fonts come from the static .woff files in @fontsource.
// An image has no CSS, so the colours are the values of the tokens in tokens.css. The pixel face
// (Tiny5) is crisp only at multiples of 8 px, so every DISPLAY size in these images is one. Server only.
import fs from "node:fs";
import path from "node:path";
import { MARK_GRID, markSvg } from "@/lib/pixel/mark";
import { personDataUrl } from "@/lib/pixel/svg";
import { avatarToLook } from "@/lib/pixel/looks";
import type { Expression, Pose } from "@/lib/pixel/people";

type Weight = 400 | 700 | 800;
export interface OgFont {
  name: string;
  data: Buffer;
  weight: Weight;
  style: "normal";
}

let fonts: OgFont[] | null = null;

/** Tiny5, the pixel face, for titles, names and numbers; Atkinson Hyperlegible Next for the rest. */
export function ogFonts(): OgFont[] {
  if (fonts) return fonts;
  // Each path written out in full, so the production build's file tracing finds the files. Tiny5
  // has one weight; it's registered at every weight the images ask for, so nothing is faked bold.
  const tiny5 = fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/tiny5/files/tiny5-latin-400-normal.woff"));
  const tiny5Ext = fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/tiny5/files/tiny5-latin-ext-400-normal.woff"));
  fonts = [
    ...([400, 700, 800] as const).map((weight) => ({ name: "Display", weight, style: "normal" as const, data: tiny5 })),
    { name: "Text", weight: 400, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff")) },
    { name: "Text", weight: 700, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-700-normal.woff")) },
    // Latin Extended, for names like Łukasz or Dvořák: a separate family, listed second in DISPLAY and TEXT.
    ...([400, 700, 800] as const).map((weight) => ({ name: "DisplayExt", weight, style: "normal" as const, data: tiny5Ext })),
    { name: "TextExt", weight: 400, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-ext-400-normal.woff")) },
    { name: "TextExt", weight: 700, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-ext-700-normal.woff")) },
  ];
  return fonts;
}

/** The font-family values to use: each face, then its Latin Extended half. */
export const DISPLAY = "Display, DisplayExt";
export const TEXT = "Text, TextExt";

/** The dark theme, for share cards. */
export const NIGHT = {
  bg: "#0F1115",
  surface: "#1D212A",
  line: "#2E3441",
  text: "#F2F3F5",
  text2: "#A4ABB8",
  text3: "#6E7584",
};

/** The light theme, for certificates (they get printed). */
export const DAY = {
  bg: "#FFFFFF",
  surface: "#F6F7F9",
  line: "#DDE1E8",
  text: "#14171D",
  text2: "#4F5665",
  sunText: "#8A5A00",
};

export const SUN = "#FFB627";
/** The dark edge round pixel panels (--px-outline). */
export const OUTLINE = "#050608";
export const SUN_INK = "#2A1E00";
export const PASS = "#2FBF71";
export const PASS_TEXT = "#4FD38B";

/** The pixel snake-P, at a whole-number scale of its 16-pixel grid (16, 32, 48, 64 ...). */
export function OgMark({ size }: { size: number }) {
  const px = Math.max(1, Math.round(size / MARK_GRID)) * MARK_GRID;
  // eslint-disable-next-line @next/next/no-img-element
  return <img width={px} height={px} alt="" src={`data:image/svg+xml;base64,${Buffer.from(markSvg(px)).toString("base64")}`} />;
}

/** The learner's pixel avatar (or a cast member's look), `scale` pixels to each of its pixels. */
export function OgPerson({ character, look, scale, crop = "bust", expression = "pleased", pose = "idle", background }: { character?: unknown; look?: Parameters<typeof personDataUrl>[0]; scale: number; crop?: "bust" | "head"; expression?: Expression; pose?: Pose; background?: string }) {
  const l = look ?? avatarToLook(character);
  const [w, h] = crop === "head" ? [32, 36] : [48, 52];
  // eslint-disable-next-line @next/next/no-img-element
  return <img width={w * scale} height={h * scale} alt="" src={personDataUrl(l, { expression, pose }, { scale, crop, background })} />;
}

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** "30 October 2026" */
export const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The site's address without the scheme, for printing. */
export const bareUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
