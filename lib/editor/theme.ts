// The Fixwick editor themes (REDESIGN.md 4.3), built from the palette tokens.
// fixwick-night: night-1 background, a night-0 gutter with fog numbers, an active line one step
// lighter, night-4 selection. fixwick-day: the same roles from the day palette. The colours are
// CSS variables, so the two themes differ in CodeMirror's light/dark flag and switch with the page.
import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const fixwickHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: "var(--syn-keyword)" },
  { tag: [t.string, t.special(t.string), t.docString], color: "var(--syn-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--syn-number)" },
  // Comments are fog, not italic: they're for reading.
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--syn-comment)" },
  { tag: [t.function(t.variableName), t.function(t.definition(t.variableName)), t.definition(t.function(t.variableName)), t.function(t.propertyName)], color: "var(--syn-function)", fontWeight: "700" },
  { tag: [t.standard(t.variableName), t.self], color: "var(--syn-builtin)" },
  { tag: [t.className, t.definition(t.className)], color: "var(--syn-function)", fontWeight: "700" },
]);

const spec = {
  "&": {
    backgroundColor: "var(--code-bg)",
    color: "var(--text)",
    fontSize: "var(--editor-font-size)",
    height: "100%",
  },
  ".cm-scroller": { fontFamily: "var(--font-code)", lineHeight: "1.6", fontVariantLigatures: "none", fontFeatureSettings: '"liga" 0, "calt" 0' },
  ".cm-content": { caretColor: "var(--lamp)", padding: "8px 0" },
  // A block caret, like a terminal's.
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--lamp)", borderLeftWidth: "2px" },
  "&.cm-focused": { outline: "none" },
  ".cm-gutters": { backgroundColor: "var(--code-gutter)", color: "var(--text-2)", border: "none" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 8px", minWidth: "3ch" },
  ".cm-activeLine": { backgroundColor: "var(--active-line)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--active-line)", color: "var(--text)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "var(--selection) !important" },
  ".cm-matchingBracket": { backgroundColor: "var(--selection)", outline: "none" },
  ".cm-errorLine": { backgroundColor: "var(--error-line)" },
  ".cm-markLine": { backgroundColor: "color-mix(in srgb, var(--lamp) 14%, transparent)", boxShadow: "inset 4px 0 0 var(--lamp)" },
  ".cm-errorGutter": { width: "16px", padding: "0 0 0 4px" },
  ".cm-errorMark": { display: "flex", alignItems: "center", height: "100%", color: "var(--brick)" },
  ".cm-placeholder": { color: "var(--text-2)" },
  ".cm-tooltip": { backgroundColor: "var(--night-0)", color: "var(--chalk)", border: "none", outline: "2px solid var(--night-4)", boxShadow: "var(--shadow-hard)", borderRadius: "0" },
  ".cm-tooltip-autocomplete > ul": { fontFamily: "var(--font-code)" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--lamp)", color: "var(--night-0)" },
  ".cm-completionIcon": { display: "none" },
  ".cm-panels": { backgroundColor: "var(--night-2)", color: "var(--text)" },
  ".cm-searchMatch": { backgroundColor: "color-mix(in srgb, var(--lamp) 30%, transparent)" },
};

export const fixwickNight = EditorView.theme(spec, { dark: true });
export const fixwickDay = EditorView.theme(spec, { dark: false });

/** "night" or "day", from the page's theme setting and, when it follows the device, the device. */
export function resolvedTheme(): "night" | "day" {
  if (typeof document === "undefined") return "night";
  const setting = document.documentElement.dataset.theme;
  if (setting === "light") return "day";
  if (setting === "system" && window.matchMedia("(prefers-color-scheme: light)").matches) return "day";
  return "night";
}
