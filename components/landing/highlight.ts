// Static Python highlighting for the landing page's pictures of code, with the editor's token
// colours (--syn-*), without loading CodeMirror.
import { parser } from "@lezer/python";
import { highlightTree, tagHighlighter, tags as t } from "@lezer/highlight";

const highlighter = tagHighlighter([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], class: "kw" },
  { tag: [t.string, t.special(t.string)], class: "str" },
  { tag: [t.number, t.bool, t.null], class: "num" },
  { tag: [t.comment, t.lineComment], class: "com" },
  { tag: [t.function(t.variableName), t.function(t.definition(t.variableName))], class: "fn" },
  { tag: [t.standard(t.variableName), t.self], class: "bi" },
]);

export type Token = { text: string; kind: "kw" | "str" | "num" | "com" | "fn" | "bi" | null };

/** Lines of tokens, each with the kind of thing it is. */
export function highlight(code: string): Token[][] {
  const source = code.replace(/\n+$/, "");
  const lines: Token[][] = [[]];
  const push = (text: string, kind: Token["kind"]) => {
    text.split("\n").forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ text: part, kind });
    });
  };
  let pos = 0;
  highlightTree(parser.parse(source), highlighter, (from, to, classes) => {
    if (from > pos) push(source.slice(pos, from), null);
    push(source.slice(from, to), (classes.split(" ")[0] as Token["kind"]) ?? null);
    pos = to;
  });
  if (pos < source.length) push(source.slice(pos), null);
  return lines;
}
