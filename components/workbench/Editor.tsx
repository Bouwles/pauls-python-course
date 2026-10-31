"use client";

import { useEffect, useRef } from "react";
import { Compartment, EditorState, RangeSet, StateEffect, StateField, type Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  drawSelection,
  gutter,
  GutterMarker,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as placeholderExt,
  type DecorationSet,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab, insertNewlineAndIndent } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching, indentOnInput, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { searchKeymap } from "@codemirror/search";
import { currentEditorTheme, ppcHighlight } from "@/lib/editor/theme";
import styles from "./Editor.module.css";

// The error line also gets a small warning mark in its own gutter: a filled circle with a "!".
class ErrorMarker extends GutterMarker {
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-errorMark";
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M8 4.2v4.6" stroke="var(--fail-ink)" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.4" r="1.1" fill="var(--fail-ink)"/></svg>';
    return span;
  }
}
const errorMarker = new ErrorMarker();

// Line decorations for the error line and for a marked line (the duck, the visualiser).
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

const errorLineField = StateField.define<number | null>({
  create: () => null,
  update(value, tr) {
    for (const e of tr.effects) if (e.is(setLines)) return e.value.error;
    return value;
  },
});

const errorGutter = gutter({
  class: "cm-errorGutter",
  markers: (view) => {
    const line = view.state.field(errorLineField);
    if (!line || line > view.state.doc.lines) return RangeSet.empty;
    return RangeSet.of([errorMarker.range(view.state.doc.line(line).from)]);
  },
  initialSpacer: () => errorMarker,
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
  const themeSlot = useRef(new Compartment());
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
      errorLineField,
      errorGutter,
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
      syntaxHighlighting(ppcHighlight),
      themeSlot.current.of(currentEditorTheme()),
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

  // Follow the page between dark and light (the Settings switch, or the device when following it).
  useEffect(() => {
    const apply = () => view.current?.dispatch({ effects: themeSlot.current.reconfigure(currentEditorTheme()) });
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", apply);
    };
  }, []);

  return <div ref={host} className={styles.editor} data-readonly={readOnly || undefined} />;
}
