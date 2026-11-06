import localFont from "next/font/local";

// The faces of a formal certificate, on the certificate page alone: blackletter for the course's
// name as on a diploma, copperplate for the person's name, and an engraver's serif for the wording.
// A person's name may need letters like the ones in Łukasz or Dvořák, so copperplate has both halves.
const title = localFont({ src: "../../node_modules/@fontsource/unifrakturmaguntia/files/unifrakturmaguntia-latin-400-normal.woff2", variable: "--font-cert-title", display: "swap", preload: false, adjustFontFallback: false });
const script = localFont({ src: "../../node_modules/@fontsource/pinyon-script/files/pinyon-script-latin-400-normal.woff2", variable: "--font-cert-script", display: "swap", preload: false, adjustFontFallback: false });
const scriptExt = localFont({ src: "../../node_modules/@fontsource/pinyon-script/files/pinyon-script-latin-ext-400-normal.woff2", variable: "--font-cert-script-ext", display: "swap", preload: false, adjustFontFallback: false });
const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource/old-standard-tt/files/old-standard-tt-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/old-standard-tt/files/old-standard-tt-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-cert-serif",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

/** Every certificate face, as class names that set their variables. */
export const certificateFonts = [title, script, scriptExt, serif].map((f) => f.variable).join(" ");
