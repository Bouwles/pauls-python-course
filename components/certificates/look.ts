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

/** The certificate, printed as a banknote is: one green ink on pale paper, with gold for the seal. */
export const ENGRAVED = {
  paper: "#fbf9f1",
  /** The faint pattern under the words. */
  tint: "#e3ebdf",
  ink: "#1c4a3a",
  /** The words. */
  black: "#191d1a",
  soft: "#47524a",
  /** The pen Paul signs with. */
  pen: "#17264f",
  gold: "#c2a04e",
  goldLight: "#ecd693",
  goldDark: "#7d5f1e",
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
