// The editor themes: ppc-dark and ppc-light, built from
// the design tokens. The code stays in the code face; the chrome around it is pixel.
// Syntax: keywords in the light blue, strings green, numbers in the sun colour, comments in
// the tertiary text colour (never italic: they're for reading), function names in the text
// colour and bold, builtins orange. Every colour is a CSS variable from tokens.css, so the two
// themes share one spec and differ only in CodeMirror's light/dark flag; the page's theme
// switches the values underneath.
//
// Contrast against the editor background (4.5:1 is the floor):
//   dark  (#12141A): keyword 7.6, string 10.2, number 10.5, comment 4.9, builtin 8.7, text 16.9
//   light (#FFFFFF): keyword 6.2, string 5.3,  number 5.4,  comment 4.8, builtin 5.1, text 17.9
//   line numbers: 6.0 dark, 5.0 light
import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const ppcHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: "var(--syn-keyword)" },
  { tag: [t.string, t.special(t.string), t.docString], color: "var(--syn-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--syn-number)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--syn-comment)", fontStyle: "normal" },
  { tag: [t.function(t.variableName), t.function(t.definition(t.variableName)), t.definition(t.function(t.variableName)), t.function(t.propertyName)], color: "var(--syn-function)", fontWeight: "700" },
  { tag: [t.className, t.definition(t.className)], color: "var(--syn-function)", fontWeight: "700" },
  { tag: [t.standard(t.variableName), t.self], color: "var(--syn-builtin)" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "var(--syn-operator)" },
]);

const spec = {
  "&": {
    backgroundColor: "var(--editor)",
    color: "var(--text)",
    fontSize: "var(--editor-font-size)",
    height: "100%",
  },
  ".cm-scroller": { fontFamily: "var(--font-code)", lineHeight: "1.65", fontVariantLigatures: "none", fontFeatureSettings: '"liga" 0, "calt" 0' },
  ".cm-content": { caretColor: "var(--sun)", padding: "12px 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--sun)", borderLeftWidth: "2px" },
  "&.cm-focused": { outline: "none" },
  // Line numbers: the gutter token is too faint to read at 4.5:1, so they sit between it and text-2.
  ".cm-gutters": { backgroundColor: "var(--gutter)", color: "color-mix(in srgb, var(--text-2) 85%, var(--editor))", border: "none" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 16px", minWidth: "3ch" },
  ".cm-activeLine": { backgroundColor: "var(--active-line)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--active-line)", color: "var(--text-2)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "var(--selection) !important" },
  ".cm-matchingBracket": { backgroundColor: "var(--selection)", outline: "none" },
  ".cm-errorLine": { backgroundColor: "var(--error-line)" },
  ".cm-markLine": { backgroundColor: "var(--sun-wash)", boxShadow: "inset 4px 0 0 var(--sun)" },
  ".cm-errorGutter": { width: "18px", padding: "0 0 0 4px" },
  ".cm-errorMark": { display: "flex", alignItems: "center", height: "100%", color: "var(--fail)" },
  ".cm-placeholder": { color: "var(--text-2)" },
  // Tooltips and completions are pixel panels: square, a stepped two-pixel outline, a hard shadow.
  ".cm-tooltip": {
    backgroundColor: "var(--surface-2)",
    color: "var(--text)",
    border: "none",
    borderRadius: "0",
    boxShadow: "0 -2px 0 0 var(--px-outline), 0 2px 0 0 var(--px-outline), -2px 0 0 0 var(--px-outline), 2px 0 0 0 var(--px-outline), 4px 4px 0 0 var(--px-drop)",
  },
  ".cm-tooltip-autocomplete > ul": { fontFamily: "var(--font-code)", padding: "4px" },
  ".cm-tooltip-autocomplete > ul > li": { borderRadius: "0", padding: "2px 8px" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--sun)", color: "var(--sun-ink)" },
  ".cm-completionIcon": { display: "none" },
  ".cm-panels": { backgroundColor: "var(--surface-1)", color: "var(--text)" },
  ".cm-panels.cm-panels-bottom": { borderTop: "2px solid var(--line)" },
  ".cm-panel input, .cm-panel button": { fontSize: "14px" },
  ".cm-searchMatch": { backgroundColor: "var(--sun-wash)", outline: "2px solid var(--sun)" },
  ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "var(--selection)" },
};

/** ppc-dark: the default. */
export const ppcDark = EditorView.theme(spec, { dark: true });
/** ppc-light: the same roles on white. */
export const ppcLight = EditorView.theme(spec, { dark: false });

/** "dark" or "light", from the page's theme setting and, when it follows the device, the device. */
export function resolvedTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  const setting = document.documentElement.dataset.theme;
  if (setting === "light") return "light";
  if (setting === "system" && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

/** The editor theme for the page as it is now. */
export function currentEditorTheme() {
  return resolvedTheme() === "light" ? ppcLight : ppcDark;
}
