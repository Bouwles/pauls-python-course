import localFont from "next/font/local";

// Fredoka's Latin Extended half, for names like Łukasz or Dvořák on the certificate. The site
// loads only the Latin half (app/layout.tsx); this one is used on the certificate page alone, and
// only for the letters it covers, so everything else stays in the site's own Fredoka.
export const displayExt = localFont({
  src: [
    { path: "../../node_modules/@fontsource/fredoka/files/fredoka-latin-ext-600-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/fredoka/files/fredoka-latin-ext-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display-ext",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF" }],
});
