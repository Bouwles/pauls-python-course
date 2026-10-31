// What the server-drawn images (certificates and share cards) share: the fonts, the colours
// and the snake-P mark. They're drawn with next/og, which reads TTF, OTF and WOFF but not WOFF2,
// so the fonts come from the static .woff files in @fontsource. An image has no CSS, so the
// colours are the values of the tokens in tokens.css (REDESIGN-2.md 2.4). Server only.
import fs from "node:fs";
import path from "node:path";

type Weight = 400 | 700 | 800;
export interface OgFont {
  name: string;
  data: Buffer;
  weight: Weight;
  style: "normal";
}

let fonts: OgFont[] | null = null;

/** Bricolage Grotesque for titles, names and numbers; Atkinson Hyperlegible Next for the rest. */
export function ogFonts(): OgFont[] {
  if (fonts) return fonts;
  // Each path written out in full, so the production build's file tracing finds the files.
  fonts = [
    { name: "Display", weight: 700, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff")) },
    { name: "Display", weight: 800, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff")) },
    { name: "Text", weight: 400, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff")) },
    { name: "Text", weight: 700, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-700-normal.woff")) },
    // Latin Extended, for names like Łukasz or Dvořák: a separate family, listed second in DISPLAY and TEXT.
    { name: "DisplayExt", weight: 700, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-ext-700-normal.woff")) },
    { name: "DisplayExt", weight: 800, style: "normal", data: fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-ext-800-normal.woff")) },
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
export const SUN_INK = "#2A1E00";
export const PASS = "#2FBF71";
export const PASS_TEXT = "#4FD38B";
const FAIL = "#F2545B";

/** The snake curled into a P (public/brand/mark.svg). */
export function OgMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path d="M14 59c4 0 7-2.4 7-6.5V22c0-9.4 6.6-16 15-16 8.6 0 15 6.4 15 14.5S44.6 35 39 35" fill="none" stroke={SUN} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="38" cy="35" rx="8" ry="6.8" fill={SUN} />
      <circle cx="35.6" cy="33" r="1.8" fill={SUN_INK} />
      <path d="M30.6 37.2h-1.9m0 0l-1.3-1.1m1.3 1.1l-1.3 1.1" fill="none" stroke={FAIL} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** "30 October 2026" */
export const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The site's address without the scheme, for printing. */
export const bareUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
