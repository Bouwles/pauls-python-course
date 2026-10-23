"use client";

import { useEffect, useRef } from "react";
import { EditorState, StateEffect, StateField, type Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as placeholderExt,
  type DecorationSet,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab, insertNewlineAndIndent } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, bracketMatching, indentOnInput, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { searchKeymap } from "@codemirror/search";
import { tags as t } from "@lezer/highlight";
import styles from "./Editor.module.css";

const highlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: "var(--syn-keyword)" },
  { tag: [t.string, t.special(t.string)], color: "var(--syn-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--syn-number)" },
  { tag: [t.comment, t.lineComment], color: "var(--syn-comment)", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.definition(t.variableName)), t.definition(t.function(t.variableName))], color: "var(--syn-function)" },
  { tag: [t.standard(t.variableName), t.self], color: "var(--syn-builtin)" },
]);

const theme = EditorView.theme({
  "&": {
    backgroundColor: "var(--paper-raised)",
    color: "var(--ink)",
    fontSize: "var(--editor-font-size)",
    height: "100%",
  },
  ".cm-scroller": { fontFamily: "var(--font-code)", lineHeight: "1.6", fontVariantLigatures: "none", fontFeatureSettings: '"liga" 0, "calt" 0' },
  ".cm-content": { caretColor: "var(--ink)", padding: "8px 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--ink)", borderLeftWidth: "2px" },
  "&.cm-focused": { outline: "none" },
  // Line numbers are read (errors and hints point at them), so they get body-text contrast.
  ".cm-gutters": { backgroundColor: "var(--paper-raised)", color: "var(--ink-2)", border: "none", borderRight: "1px solid var(--rule)" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 8px", minWidth: "3ch" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--highlight-line) 55%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--ink)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "var(--selection) !important" },
  ".cm-matchingBracket": { backgroundColor: "var(--accent-wash)", outline: "1px solid var(--rule-strong)" },
  ".cm-errorLine": { backgroundColor: "var(--fail-wash)" },
  ".cm-markLine": { backgroundColor: "var(--accent-wash)", boxShadow: "inset 3px 0 0 var(--accent)" },
  ".cm-placeholder": { color: "var(--ink-3)", fontStyle: "italic" },
  ".cm-tooltip": { backgroundColor: "var(--paper-raised)", border: "1px solid var(--rule-strong)", borderRadius: "var(--r-2)" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--accent-wash)", color: "var(--ink)" },
  ".cm-completionIcon": { display: "none" },
});

// Line decorations for the error line and for a marked line (Dennis, the visualiser).
const setLines = StateEffect.define<{ error: number | null; mark: number | null }>();
const lineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (!e.is(setLines)) continue;
      const ranges = [];
      const doc = tr.state.doc;
      const { error, mark } = e.value;
      const marks: [number, string][] = [];
      if (error && error <= doc.lines) marks.push([error, "cm-errorLine"]);
      if (mark && mark <= doc.lines && mark !== error) marks.push([mark, "cm-markLine"]);
      marks.sort((a, b) => a[0] - b[0]);
      for (const [n, cls] of marks) ranges.push(Decoration.line({ class: cls }).range(doc.line(n).from));
      deco = Decoration.set(ranges);
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export interface EditorHandle {
  focus(): void;
  goToLine(line: number): void;
  getCursor(): number;
}

export interface EditorProps {
  value: string;
  onChange?: (value: string, cursor: number) => void;
  readOnly?: boolean;
  onRun?: () => void;
  onCheck?: () => void;
  errorLine?: number | null;
  markLine?: number | null;
  initialCursor?: number | null;
  label: string;
  placeholder?: string;
  handleRef?: React.MutableRefObject<EditorHandle | null>;
  /** Changing this key resets the document to `value` (e.g. switching files or restoring a version). */
  docKey: string;
}

export function Editor({ value, onChange, readOnly = false, onRun, onCheck, errorLine = null, markLine = null, initialCursor, label, placeholder, handleRef, docKey }: EditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const callbacks = useRef({ onChange, onRun, onCheck });
  callbacks.current = { onChange, onRun, onCheck };

  useEffect(() => {
    if (!host.current) return;
    const runKeys = keymap.of([
      { key: "Mod-Enter", run: () => (callbacks.current.onRun?.(), true), preventDefault: true },
      { key: "Mod-Shift-Enter", run: () => (callbacks.current.onCheck?.(), true), preventDefault: true },
      { key: "Enter", run: insertNewlineAndIndent },
    ]);
    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      drawSelection(),
      indentOnInput(),
      indentUnit.of("    "),
      EditorState.tabSize.of(4),
      bracketMatching(),
      closeBrackets(),
      autocompletion({ activateOnTyping: true, icons: false }),
      highlightActiveLine(),
      python(),
      syntaxHighlighting(highlightStyle),
      theme,
      lineField,
      runKeys,
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
      EditorView.contentAttributes.of({ "aria-label": label }),
      EditorView.lineWrapping,
      EditorState.readOnly.of(readOnly),
      EditorView.editable.of(!readOnly),
      EditorView.updateListener.of((u) => {
        if (u.docChanged || u.selectionSet) {
          callbacks.current.onChange?.(u.state.doc.toString(), u.state.selection.main.head);
        }
      }),
    ];
    if (placeholder) extensions.push(placeholderExt(placeholder));
    const state = EditorState.create({
      doc: value,
      selection: initialCursor != null && initialCursor <= value.length ? { anchor: initialCursor } : undefined,
      extensions,
    });
    const v = new EditorView({ state, parent: host.current });
    view.current = v;
    if (handleRef) {
      handleRef.current = {
        focus: () => v.focus(),
        goToLine: (line: number) => {
          const n = Math.max(1, Math.min(line, v.state.doc.lines));
          const pos = v.state.doc.line(n).from;
          v.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
          v.focus();
        },
        getCursor: () => v.state.selection.main.head,
      };
    }
    return () => {
      v.destroy();
      view.current = null;
    };
    // The editor is rebuilt only when the document identity or editability changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKey, readOnly]);

  // External value changes for the same document (e.g. "reset") replace the text.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const current = v.state.doc.toString();
    if (current !== value) v.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: setLines.of({ error: errorLine, mark: markLine }) });
  }, [errorLine, markLine, docKey]);

  return <div ref={host} className={styles.editor} data-readonly={readOnly || undefined} />;
}
