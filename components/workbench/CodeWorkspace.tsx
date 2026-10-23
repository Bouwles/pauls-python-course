"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckReport, Files, RunResult } from "@/lib/python/protocol";
import { Button } from "../ui/Button";
import { CheckIcon, RunIcon, StopIcon } from "../ui/Icons";
import { Editor, type EditorHandle } from "./Editor";
import { Console } from "./Console";
import { TestReport } from "./TestReport";
import { VersionHistory } from "./VersionHistory";
import { ShortcutsSheet } from "./ShortcutsSheet";
import { Visualiser } from "./Visualiser";
import type { TraceResult } from "@/lib/python/protocol";
import { useWorkbench } from "./context";
import { useCodeFiles } from "./useCodeFiles";
import { useSession } from "@/lib/store/session";
import { saveCode } from "@/lib/store/progress";
import { playSound } from "@/lib/sound";
import styles from "./CodeWorkspace.module.css";

export interface CodeWorkspaceProps {
  stepId: string;
  files: string[];
  entry?: string;
  starter: Files;
  starterFrom?: string | null;
  readOnly?: boolean;
  /** Run is disabled until the learner has committed to a prediction, for example. */
  runDisabledReason?: string | null;
  /** Tests key for Check, e.g. "sign-on-the-door/make". No Check button without it. */
  checkKey?: string | null;
  checkLabel?: string;
  timeoutMs?: number;
  onRun?: (result: RunResult, files: Files) => void;
  onCheck?: (report: CheckReport, files: Files) => void;
  passLine?: string | null;
  /** Lets a parent read the current files (e.g. an investigate task checking the editor's code). */
  filesRef?: React.MutableRefObject<(() => Files) | null>;
  checkRef?: React.MutableRefObject<((key: string) => Promise<CheckReport | null>) | null>;
  extraFiles?: Files;
  showReset?: boolean;
  /** Command-line programs: an Arguments box whose words become sys.argv[1:]. */
  argvField?: boolean;
}

/** Split "a 'b c' d" the way a shell would, near enough for teaching. */
export function splitArgs(text: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[1] ?? m[2] ?? m[3] ?? "");
  return out;
}

const SPLIT_KEY = "ppc-output-height";

export function CodeWorkspace({
  stepId,
  files,
  entry = "main.py",
  starter,
  starterFrom,
  readOnly = false,
  runDisabledReason = null,
  checkKey = null,
  checkLabel = "Check",
  timeoutMs = 10_000,
  onRun,
  onCheck,
  passLine,
  filesRef,
  checkRef,
  extraFiles,
  showReset = true,
  argvField = false,
}: CodeWorkspaceProps) {
  const { job, store, runner, markedLine, showZone, logEvent } = useWorkbench();
  const { profile } = useSession();
  const code = useCodeFiles({ store, jobId: job.id, stepId, files, starter, starterFrom });
  const [active, setActive] = useState(files.includes(entry) ? entry : files[0]!);
  const [pane, setPane] = useState<"output" | "checks" | "steps">("output");
  const [trace, setTrace] = useState<{ result: TraceResult; source: string; startLine: number | null } | null>(null);
  const [history, setHistory] = useState(false);
  const [outputHeight, setOutputHeight] = useState(260);
  const [args, setArgs] = useState("");
  const editor = useRef<EditorHandle | null>(null);
  const { state } = runner;
  const busy = state.phase !== "idle";

  useEffect(() => {
    try {
      const h = Number(localStorage.getItem(SPLIT_KEY));
      if (h > 80) setOutputHeight(h);
    } catch {
      // ignore
    }
  }, []);

  // Files the learner's programs have written in this job (Section 10.4).
  const [written, setWritten] = useState<Files>({});
  useEffect(() => {
    if (!store) return;
    void store.prefixed("code_files", `${job.id}/_files/`).then((rows) => setWritten(Object.fromEntries(rows.map((r) => [r.filename, r.content]))));
  }, [store, job.id]);
  const allFiles = useCallback((): Files => ({ ...job.data, ...written, ...(extraFiles ?? {}), ...(code.contents ?? {}) }), [job.data, written, extraFiles, code.contents]);
  if (filesRef) filesRef.current = allFiles;

  const doRun = useCallback(async () => {
    if (busy || runDisabledReason || !code.contents) return;
    playSound("key", profile.settings.sound);
    await code.takeSnapshot("run");
    setPane("output");
    showZone("output");
    const files = allFiles();
    logEvent("run");
    const result = await runner.run(files, entry, argvField ? splitArgs(args) : []);
    if (result && store && Object.keys(result.filesOut).length) {
      for (const [name, content] of Object.entries(result.filesOut)) await saveCode(store, job.id, "_files", name, content, null);
      setWritten((w) => ({ ...w, ...result.filesOut }));
    }
    // Drawings need room: grow the output the way the visualiser does.
    if (result?.visuals?.frames.length || result?.figures?.length) setOutputHeight((h) => Math.max(h, Math.round(window.innerHeight * 0.55)));
    if (result) onRun?.(result, files);
  }, [busy, runDisabledReason, code, allFiles, runner, entry, onRun, showZone, logEvent, argvField, args, profile.settings.sound, store, job.id]);

  const doTrace = useCallback(
    async (startLine: number | null = null) => {
      if (busy || !code.contents) return;
      await code.takeSnapshot("run");
      setPane("steps");
      showZone("output");
      const files = allFiles();
      logEvent("visualise");
      // The trace runs live, so input() still works: the console shows any prompts while it runs.
      setPane("output");
      const result = await runner.trace(files, entry);
      if (result) {
        setTrace({ result, source: files[entry] ?? "", startLine });
        setPane("steps");
        setOutputHeight((h) => Math.max(h, Math.round(window.innerHeight * 0.55)));
      }
    },
    [busy, code, allFiles, entry, showZone, logEvent, runner],
  );

  // Explain it to Dennis opens the visualiser at the line that surprised you.
  useEffect(() => {
    const onVis = (e: Event) => void doTrace((e as CustomEvent<number>).detail ?? null);
    window.addEventListener("ppc:visualise", onVis);
    return () => window.removeEventListener("ppc:visualise", onVis);
  }, [doTrace]);

  const doCheckWith = useCallback(
    async (key: string) => {
      if (busy || !code.contents) return null;
      await code.takeSnapshot("check");
      setPane("checks");
      showZone("output");
      const files = allFiles();
      const report = await runner.check(files, key, entry, timeoutMs);
      return report;
    },
    [busy, code, allFiles, runner, entry, timeoutMs, showZone],
  );
  if (checkRef) checkRef.current = doCheckWith;

  const doCheck = useCallback(async () => {
    if (!checkKey) return;
    const report = await doCheckWith(checkKey);
    if (report) {
      logEvent("check", { passed: report.status === "ok" && report.results.filter((r) => !r.stretch).every((r) => r.passed) });
      onCheck?.(report, allFiles());
    }
  }, [checkKey, doCheckWith, onCheck, allFiles, logEvent]);

  // Global shortcuts, so they work outside the editor too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "Enter") return;
      if ((e.target as HTMLElement)?.closest?.(".cm-editor")) return; // the editor handles its own
      e.preventDefault();
      if (e.shiftKey) void doCheck();
      else void doRun();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doRun, doCheck]);

  const errorLine = state.result?.status === "error" && state.result.error?.file === active ? state.result.error.line : null;
  const contents = code.contents;

  const startDrag = (e: React.PointerEvent) => {
    const startY = e.clientY;
    const start = outputHeight;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => setOutputHeight(Math.max(100, Math.min(window.innerHeight - 220, start + (startY - ev.clientY))));
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      try {
        localStorage.setItem(SPLIT_KEY, String(outputHeightRef.current));
      } catch {
        // ignore
      }
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };
  const outputHeightRef = useRef(outputHeight);
  outputHeightRef.current = outputHeight;

  return (
    <div className={styles.workspace}>
      <div className={styles.editorPane}>
        <div className={styles.toolbar}>
          <div className={styles.tabs} role="tablist" aria-label="Files">
            {files.map((f) => (
              <button key={f} role="tab" aria-selected={f === active} className={styles.fileTab} onClick={() => setActive(f)}>
                {f}
              </button>
            ))}
            {readOnly ? <span className={styles.readonly}>read only</span> : null}
          </div>
          <div className={styles.actions}>
            {showReset && !readOnly ? (
              <Button
                size="sm"
                variant="quiet"
                onClick={() => {
                  if (contents && window.confirm("Put the starting code back? Your current code is kept in History.")) void code.replace(active, starter[active] ?? "", "manual");
                }}
              >
                Reset
              </Button>
            ) : null}
            {!readOnly ? (
              <Button size="sm" variant="quiet" onClick={() => setHistory(true)}>
                History
              </Button>
            ) : null}
            <ShortcutsSheet />
            <Button size="sm" variant="quiet" onClick={() => void doTrace()} disabled={busy || !contents}>
              Step through
            </Button>
            {state.phase === "running" || state.phase === "checking" ? (
              <Button size="sm" variant="danger" icon={<StopIcon />} onClick={runner.stop}>
                Stop
              </Button>
            ) : (
              <Button size="sm" variant="primary" icon={<RunIcon />} onClick={() => void doRun()} disabled={Boolean(runDisabledReason) || !contents || state.phase === "starting"} title={runDisabledReason ?? undefined} shortcut="⌘↵" keys="Control+Enter Meta+Enter">
                Run
              </Button>
            )}
            {checkKey ? (
              <Button size="sm" variant="secondary" icon={<CheckIcon />} onClick={() => void doCheck()} disabled={busy || !contents} shortcut="⇧⌘↵" keys="Control+Shift+Enter Meta+Shift+Enter">
                {checkLabel}
              </Button>
            ) : null}
          </div>
        </div>
        {code.conflict ? (
          <p className={styles.conflict}>
            You edited this on another device too. The newer version is here; the other one is in History.{" "}
            <button className={styles.linkButton} onClick={() => void code.dismissConflict()}>
              Dismiss
            </button>
          </p>
        ) : null}
        {runDisabledReason ? <p className={styles.note}>{runDisabledReason}</p> : null}
        {argvField ? (
          <label className={styles.argv}>
            <span>
              python {entry}
            </span>
            <input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="arguments, like --list or add 'Fix the gate'" spellCheck={false} aria-label="Command-line arguments" />
          </label>
        ) : null}
        <div className={styles.editorWrap}>
          {contents ? (
            <Editor
              docKey={`${stepId}/${active}/${code.version}`}
              value={contents[active] ?? ""}
              onChange={(v, cursor) => code.update(active, v, cursor)}
              readOnly={readOnly}
              onRun={() => void doRun()}
              onCheck={() => void doCheck()}
              errorLine={errorLine}
              markLine={markedLine}
              initialCursor={code.cursors[active] ?? null}
              label={`Code editor, ${active}`}
              handleRef={editor}
            />
          ) : (
            <p className={styles.note}>Opening your file.</p>
          )}
        </div>
      </div>
      <div
        className={styles.handle}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize output"
        aria-valuemin={100}
        aria-valuemax={typeof window === "undefined" ? 800 : Math.max(100, window.innerHeight - 220)}
        aria-valuenow={outputHeight}
        aria-valuetext={`Output ${outputHeight} pixels tall`}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={(e) => {
        if (e.key === "ArrowUp") setOutputHeight((h) => Math.min(window.innerHeight - 220, h + 24));
        if (e.key === "ArrowDown") setOutputHeight((h) => Math.max(100, h - 24));
      }} />
      <div className={styles.outputPane} style={{ height: outputHeight }}>
        <div className={styles.paneTabs} role="tablist" aria-label="Output">
          <button role="tab" aria-selected={pane === "output"} className={styles.paneTab} onClick={() => setPane("output")}>
            Output
          </button>
          {checkKey ? (
            <button role="tab" aria-selected={pane === "checks"} className={styles.paneTab} onClick={() => setPane("checks")}>
              Checks
            </button>
          ) : null}
          {trace ? (
            <button role="tab" aria-selected={pane === "steps"} className={styles.paneTab} onClick={() => setPane("steps")}>
              Step through
            </button>
          ) : null}
          {state.runtime.status === "loading" ? <span className={styles.loading}>Starting Python.</span> : null}
        </div>
        <div className={styles.paneBody}>
          {pane === "steps" && trace ? (
            <Visualiser key={`${trace.source.length}-${trace.result.steps.length}-${trace.startLine}`} trace={trace.result} source={trace.source} startLine={trace.startLine} />
          ) : pane === "output" || (pane === "steps" && !trace) ? (
            <Console state={state} source={contents?.[entry] ?? ""} onInput={runner.provideInput} onShowLine={(l) => editor.current?.goToLine(l)} onRetry={() => void runner.retryLoad()} />
          ) : (
            <TestReport report={state.report} progress={state.checkProgress} source={contents?.[entry] ?? ""} onShowLine={(l) => editor.current?.goToLine(l)} passLine={passLine} />
          )}
        </div>
      </div>
      {history ? (
        <VersionHistory
          stepId={stepId}
          file={active}
          current={contents?.[active] ?? ""}
          onClose={() => setHistory(false)}
          onRestore={(content) => {
            void code.replace(active, content, "restore");
            setHistory(false);
          }}
        />
      ) : null}
    </div>
  );
}
