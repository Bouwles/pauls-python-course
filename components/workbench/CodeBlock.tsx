// Static, highlighted Python for predict questions, worked examples and cards.
// Uses the same token colours as the editor, without loading CodeMirror.
import { parser } from "@lezer/python";
import { highlightTree, tagHighlighter, tags as t } from "@lezer/highlight";
import styles from "./CodeBlock.module.css";

const highlighter = tagHighlighter([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], class: "tk" },
  { tag: [t.string, t.special(t.string)], class: "ts" },
  { tag: [t.number, t.bool, t.null], class: "tn" },
  { tag: [t.comment, t.lineComment], class: "tc" },
  { tag: [t.function(t.variableName), t.function(t.definition(t.variableName)), t.definition(t.function(t.variableName))], class: "tf" },
  { tag: [t.standard(t.variableName), t.self], class: "tb" },
]);

export interface Segment {
  text: string;
  cls: string | null;
}

/** Split code into lines of highlighted segments. */
export function highlightLines(code: string, language: "python" | "text" = "python"): Segment[][] {
  const source = code.replace(/\n$/, "");
  const lines: Segment[][] = [[]];
  const push = (text: string, cls: string | null) => {
    const parts = text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ text: part, cls });
    });
  };
  if (language === "text") {
    push(source, null);
    return lines;
  }
  const tree = parser.parse(source);
  let pos = 0;
  highlightTree(tree, highlighter, (from, to, classes) => {
    if (from > pos) push(source.slice(pos, from), null);
    push(source.slice(from, to), classes);
    pos = to;
  });
  if (pos < source.length) push(source.slice(pos), null);
  return lines;
}

export function CodeBlock({
  code,
  language = "python",
  numbers = true,
  highlight,
  label,
}: {
  code: string;
  language?: "python" | "text";
  numbers?: boolean;
  highlight?: number | null;
  label?: string;
}) {
  const lines = highlightLines(code, language);
  return (
    <pre className={styles.block} aria-label={label} tabIndex={0}>
      <code>
        {lines.map((segs, i) => (
          <span key={i} className={[styles.line, highlight === i + 1 ? styles.hl : ""].join(" ")}>
            {numbers ? <span className={styles.num} aria-hidden="true">{i + 1}</span> : null}
            <span className={styles.text}>
              {segs.length === 0 ? "​" : segs.map((s, j) => (s.cls ? <span key={j} className={s.cls.split(" ").map((c) => styles[c] ?? "").join(" ")}>{s.text}</span> : s.text))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
