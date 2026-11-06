// Generates tokens.css (REDESIGN-2.md 2.4 to 2.7): the dark theme (default), the light
// theme, the sun and blue accents, status and character colours, type, radius, the one
// floating shadow, and motion. Components use these tokens only; style-lint checks it.
//   npx tsx scripts/build-tokens.ts
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// Colours that are the same in both themes.
const fixed = {
  sun: "#FFB627",
  "sun-hover": "#FFC24D",
  "sun-press": "#F0A410",
  "sun-ink": "#2A1E00",
  blue: "#3B6FD8",
  pass: "#2FBF71",
  "pass-ink": "#06210F",
  fail: "#F2545B",
  "fail-ink": "#2B0507",
  warn: "#FFB627",
  // The cast (REDESIGN-2.md 7.1). Violet is a flat colour only, never in a gradient.
  "c-paul": "#FFB627",
  "c-neil": "#1FB5A8",
  "c-aaesha": "#FF7A6B",
  "c-caitlin": "#8C6BF2",
  "c-riya": "#4CC36F",
  "c-yahya": "#3B6FD8",
};

const dark = {
  bg: "#0F1115",
  "surface-1": "#161920",
  "surface-2": "#1D212A",
  "surface-3": "#272C37",
  line: "#2E3441",
  text: "#F2F3F5",
  "text-2": "#A4ABB8",
  "text-3": "#6E7584",
  editor: "#12141A",
  // The main button: chalk on the dark page, ink on the light one.
  btn: "#E8E4DA",
  "btn-hover": "#F7F4EC",
  "btn-ink": "#14171D",
  // Text versions of the accents, for words in colour on the page.
  "sun-text": "#FFB627",
  "blue-text": "#7FA6F0",
  "pass-text": "#4FD38B",
  "fail-text": "#FF7A80",
  "pass-wash": "rgb(47 191 113 / 0.14)",
  "fail-wash": "rgb(242 84 91 / 0.14)",
  "sun-wash": "rgb(255 182 39 / 0.14)",
  "blue-wash": "rgb(59 111 216 / 0.18)",
  "shadow-float": "4px 4px 0 0 #050608",
  "px-outline": "#050608",
  "px-drop": "#050608",
  "px-hi": "rgb(255 255 255 / 0.16)",
  "px-lo": "rgb(0 0 0 / 0.28)",
  scrim: "rgb(8 10 14 / 0.6)",
  // Code (REDESIGN-2.md 3): keywords blue-light, strings green, numbers sun, comments text-3.
  "syn-keyword": "#7FA6F0",
  "syn-string": "#8FD18A",
  "syn-number": "#FFB627",
  "syn-comment": "#7D8493",
  "syn-function": "#F2F3F5",
  "syn-builtin": "#F29E6D",
  "syn-operator": "#C9CED8",
  "active-line": "#181B23",
  selection: "#2B3A5C",
  gutter: "#12141A",
  "gutter-text": "#5A6170",
  "error-line": "rgb(242 84 91 / 0.12)",
  "diff-del": "rgb(242 84 91 / 0.28)",
  "diff-ins": "rgb(47 191 113 / 0.28)",
};

const light: Record<keyof typeof dark, string> = {
  bg: "#F6F7F9",
  "surface-1": "#FFFFFF",
  "surface-2": "#FFFFFF",
  "surface-3": "#EEF0F4",
  line: "#DDE1E8",
  text: "#14171D",
  "text-2": "#4F5665",
  "text-3": "#6B7280",
  editor: "#FFFFFF",
  btn: "#1F2430",
  "btn-hover": "#353C4B",
  "btn-ink": "#F6F7F9",
  "sun-text": "#8A5A00",
  "blue-text": "#2C5BC0",
  "pass-text": "#147A43",
  "fail-text": "#C42F37",
  "pass-wash": "rgb(47 191 113 / 0.12)",
  "fail-wash": "rgb(242 84 91 / 0.10)",
  "sun-wash": "rgb(255 182 39 / 0.18)",
  "blue-wash": "rgb(59 111 216 / 0.10)",
  "shadow-float": "4px 4px 0 0 #B7BFCC",
  "px-outline": "#14171D",
  "px-drop": "#B7BFCC",
  "px-hi": "rgb(255 255 255 / 0.5)",
  "px-lo": "rgb(0 0 0 / 0.16)",
  scrim: "rgb(20 23 29 / 0.35)",
  "syn-keyword": "#2C5BC0",
  "syn-string": "#2F7A2A",
  "syn-number": "#9A5B00",
  "syn-comment": "#5E6572",
  "syn-function": "#14171D",
  "syn-builtin": "#B4501E",
  "syn-operator": "#3A404C",
  "active-line": "#F4F6F9",
  selection: "#D6E2FA",
  gutter: "#FFFFFF",
  "gutter-text": "#8A909C",
  "error-line": "rgb(242 84 91 / 0.10)",
  "diff-del": "rgb(242 84 91 / 0.22)",
  "diff-ins": "rgb(47 191 113 / 0.22)",
};

const block = (o: Record<string, string>, indent = "  ") =>
  Object.entries(o)
    .map(([k, v]) => `${indent}--${k}: ${v};`)
    .join("\n");

// The first redesign's token names. They're no longer defined; style-lint keeps this list so
// it can fail on any that creep back into a component.
export const LEGACY: Record<string, string> = {
  "night-0": "#0F1115",
  "night-1": "var(--surface-1)",
  "night-2": "var(--surface-2)",
  "night-3": "var(--surface-3)",
  "night-4": "var(--line)",
  chalk: "var(--text)",
  fog: "var(--text-2)",
  lamp: "var(--sun)",
  "lamp-dark": "var(--sun-press)",
  kelp: "var(--pass)",
  "kelp-dark": "var(--pass)",
  brick: "var(--fail)",
  "brick-dark": "var(--fail)",
  sea: "var(--blue)",
  "sea-dark": "var(--blue)",
  plum: "var(--c-caitlin)",
  "moss-green": "var(--pass)",
  "day-fog": "var(--text-2)",
  "day-ink": "var(--text)",
  "day-0": "var(--bg)",
  "day-1": "var(--surface-1)",
  "day-2": "var(--surface-2)",
  "day-3": "var(--surface-3)",
  panel: "var(--surface-1)",
  "panel-2": "var(--surface-2)",
  frame: "var(--line)",
  "frame-hi": "var(--line)",
  paper: "var(--surface-2)",
  "paper-raised": "var(--surface-2)",
  "paper-sunk": "var(--bg)",
  ink: "var(--text)",
  "ink-2": "var(--text-2)",
  "ink-3": "var(--text-3)",
  rule: "var(--line)",
  "rule-strong": "var(--line)",
  "control-border": "var(--line)",
  accent: "var(--sun)",
  "accent-dark": "var(--sun-press)",
  "accent-text": "var(--sun-text)",
  "accent-ink": "var(--sun-text)",
  "accent-wash": "var(--sun-wash)",
  "on-accent": "var(--sun-ink)",
  go: "var(--pass)",
  "go-dark": "var(--pass)",
  "go-text": "var(--pass-text)",
  danger: "var(--fail)",
  "danger-dark": "var(--fail)",
  "danger-text": "var(--fail-text)",
  link: "var(--blue)",
  "link-dark": "var(--blue)",
  "link-text": "var(--blue-text)",
  quiet: "var(--surface-3)",
  "quiet-text": "var(--text)",
  "quiet-dark": "transparent",
  "quiet-hover": "var(--line)",
  "code-bg": "var(--editor)",
  inset: "var(--surface-1)",
  "code-gutter": "var(--gutter)",
  "highlight-line": "var(--active-line)",
  "scene-frame": "var(--surface-1)",
  "text-on-frame": "var(--text-2)",
  "fog-on-panel": "var(--text-2)",
  "shadow-hard": "none",
  hairline: "1px solid var(--line)",
  "hairline-strong": "1px solid var(--line)",
  outline: "1px solid var(--line)",
  "font-pixel": "var(--font-display)",
  "font-read": "var(--font-text)",
  "font-prose": "var(--font-text)",
  "font-ui": "var(--font-text)",
  "pixel-1": "15px",
  "pixel-2": "24px",
  "pixel-3": "44px",
  "step--2": "0.8125rem",
  "step--1": "0.875rem",
  "step-0": "1rem",
  "step-1": "1.0625rem",
  "step-2": "1.25rem",
  "step-3": "1.5rem",
  "step-4": "1.75rem",
  "step-5": "2rem",
  "step-6": "2.25rem",
  "prose-size": "var(--fs-3)",
  "lh-prose": "var(--lh-text)",
  "lh-ui": "1.4",
  "lh-tight": "1.15",
  "r-1": "var(--r-md)",
  "r-2": "var(--r-lg)",
  ease: "var(--ease-out)",
  "dur-1": "var(--dur)",
  "dur-2": "var(--dur)",
};
const art = [
  "harbour-night", "deep-slate", "slate", "wet-stone", "stone", "pale-stone", "sail-cloth", "deep-sea", "sea", "sea-green", "foam",
  "dark-moss", "moss", "lichen", "tar", "driftwood", "rust", "ochre", "sand", "dark-brick", "brick", "lamp", "lamp-glow", "rose",
  "navy", "navy-light", "mustard", "tomato-highlight", "tomato-shadow", "shell-highlight", "shell-shadow", "warm-white",
];
for (const a of art) LEGACY[`art-${a}`] = "var(--surface-3)";

const css = `/*
  Design tokens for Paul's Python Course. GENERATED by scripts/build-tokens.ts:
  edit the script, not this file. Dark is the default theme; light is clean white and cool grey.
*/

:root {
  color-scheme: dark;
${block(fixed)}
${block(dark)}

  /* Type (REDESIGN-2.md 2.3): a display face for titles and names, a text face for
     everything else including the UI, and code. Sizes: 14, 15, 17, 20, 24, 32, 44, 60. */
  --font-display: var(--font-display-loaded, "Fredoka"), var(--font-text);
  --font-text: var(--font-text-loaded, "Atkinson Hyperlegible Next"), system-ui, sans-serif;
  --font-code: "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
  --fs-1: 14px;
  --fs-2: 15px;
  --fs-3: 17px;
  --fs-4: 20px;
  --fs-5: 24px;
  --fs-6: 32px;
  --fs-7: 44px;
  --fs-8: 60px;
  /* The display face's sizes (Fredoka): titles, names, buttons, tabs and labels. */
  --px-1: 16px;
  --px-2: 24px;
  --px-3: 32px;
  --px-4: 40px;
  --px-5: 48px;
  --px-6: 64px;
  --lh-text: 1.55;
  --lh-title: 1.1;
  --tracking-display: 0;
  --measure: 68ch;
  --prose-letter-spacing: normal;
  --prose-word-spacing: normal;
  --editor-font-size: 15px;

  /* Space, 4 px base */
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 20px;
  --s-6: 24px;
  --s-8: 32px;
  --s-10: 40px;
  --s-12: 48px;
  --s-16: 64px;
  --s-20: 80px;
  --s-24: 96px;

  /* Shape (REDESIGN3_PLAN.md P2): square pixel corners everywhere. Edges are stepped pixel
     outlines and depth is a hard offset shadow, both from box-shadow (see .px-panel). */
  --r-sm: 0;
  --r-md: 0;
  --r-lg: 0;
  --px: 2px;
  --focus-ring: 0 0 0 2px var(--bg), 0 0 0 4px var(--sun);

  /* Motion (REDESIGN-2.md 2.7) */
  --dur: 160ms;
  --dur-slow: 200ms;
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1);

  /* Layout */
  --header-h: 56px;
  --touch: 44px;
}

/* Phone type scale: 14, 15, 16, 18, 22, 28, 36, 44. */
@media (max-width: 720px) {
  :root {
    --fs-3: 16px;
    --fs-4: 18px;
    --fs-5: 22px;
    --fs-6: 28px;
    --fs-7: 36px;
    --fs-8: 44px;
  }
}

/* Light: chosen in Settings, or following a light device when the theme follows the device. */
:root[data-theme="light"] {
  color-scheme: light;
${block(light)}
}

@media (prefers-color-scheme: light) {
  :root[data-theme="system"] {
    color-scheme: light;
${block(light, "    ")}
  }
}

/* Code that stays dark in both themes (terminal previews, demo screens). */
.code-dark {
${block(Object.fromEntries(Object.entries(dark).filter(([k]) => /^(syn-|editor|active-line|selection|gutter|text)/.test(k))))}
}

:root[data-prose="hyperlegible"] {
  --lh-text: 1.75;
  --prose-letter-spacing: 0.02em;
  --prose-word-spacing: 0.08em;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur: 0ms;
    --dur-slow: 0ms;
  }
}

:root[data-motion="reduced"] {
  --dur: 0ms;
  --dur-slow: 0ms;
}
`;

if (process.argv[1]?.endsWith("build-tokens.ts")) {
  fs.writeFileSync(path.join(root, "tokens.css"), css);
  console.log("tokens.css written");
}
