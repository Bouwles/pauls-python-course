// The colours and words the certificates and share cards share, for places with no CSS: the
// server-drawn images (og.tsx) and the certificate drawn in the browser (art.ts), as an SVG on the
// page and on a canvas for the picture. The colours are the values of the tokens in tokens.css.
// Plain values only, so the browser can use them too.

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

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** "30 October 2026", from an ISO time or a day ("2026-10-30"). */
export const longDate = (iso: string) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The site's address without the scheme, for printing. */
export const bareUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
