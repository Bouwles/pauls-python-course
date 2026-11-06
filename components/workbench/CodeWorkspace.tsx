"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckReport, Files, RunResult, TraceResult } from "@/lib/python/protocol";
import { Button } from "../ui/Button";
import { Menu, type MenuItem } from "../ui/Menu";
import { Icon } from "../ui/Icon";
import { Editor, type EditorHandle } from "./Editor";
import { Console } from "./Console";
import { TestReport } from "./TestReport";
import { VersionHistory } from "./VersionHistory";
import { ShortcutsSheet } from "./ShortcutsSheet";
import { Visualiser } from "./Visualiser";
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
  /** Tests key for Check, e.g. "shop-sign/make". No Check button without it. */
  checkKey?: string | null;
  checkLabel?: string;
  /** How many checks must pass (visible and hidden), for the "Checks 0/5" count. */
  checkCount?: number;
  timeoutMs?: number;
  onRun?: (result: RunResult, files: Files) => void;
  onCheck?: (report: CheckReport, files: Files) => void;
  passLine?: string | null;
  /** The step is done: "Next step" takes Check's place in the toolbar. */
  done?: boolean;
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

const SPLIT_KEY = "ppc-console-height";
const BAR = 40;
const MIN_CONSOLE = 120;

type Pane = "output" | "checks" | "steps";

/**
 * The editor side: the file tabs with Run and Check at the top right (and
 * Reset, History and Keys in the "..." menu), the editor, then the console. The console is a
 * 40 px bar until the first Run or Check, then opens to 35 per cent of the height; drag it to
 * any size and it keeps that size. Once the step is done, "Next step" stands where Check was.
 */
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
  checkCount,
  timeoutMs = 10_000,
  onRun,
  onCheck,
  passLine,
  done = false,
  filesRef,
  checkRef,
  extraFiles,
  showReset = true,
  argvField = false,
}: CodeWorkspaceProps) {
  const { job, store, runner, markedLine, showZone, zone, logEvent, nextStep, goNext, compact } = useWorkbench();
  const { profile } = useSession();
  const code = useCodeFiles({ store, jobId: job.id, stepId, files, starter, starterFrom });
  const [active, setActive] = useState(files.includes(entry) ? entry : files[0]!);
  const [pane, setPane] = useState<Pane>("output");
  const [trace, setTrace] = useState<{ result: TraceResult; source: string; startLine: number | null } | null>(null);
  const [history, setHistory] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const [args, setArgs] = useState("");
  const editor = useRef<EditorHandle | null>(null);
  const { state } = runner;
  const busy = state.phase !== "idle";
  const running = state.phase === "running" || state.phase === "checking";

  // The console's size, once the learner has dragged it; otherwise 35 per cent.
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(SPLIT_KEY));
      if (saved >= MIN_CONSOLE) setHeight(saved);
    } catch {
      // ignore
    }
  }, []);
  const maxHeight = () => Math.max(MIN_CONSOLE, (workspace.current?.clientHeight ?? 600) - 140);
  const openConsole = useCallback(
    (p: Pane) => {
      setPane(p);
      setOpen(true);
      if (height === null && workspace.current) setHeight(Math.max(MIN_CONSOLE + 40, Math.round(workspace.current.clientHeight * 0.35)));
    },
    [height],
  );

  // A program waiting for input() always has the console open.
  useEffect(() => {
    if (state.awaitingInput !== null) setOpen(true);
  }, [state.awaitingInput]);

  // Files the learner's programs have written in this project.
  const [written, setWritten] = useState<Files>({});
  useEffect(() => {
    if (!store) return;
    void store.prefixed("code_files", `${job.id}/_files/`).then((rows) => setWritten(Object.fromEntries(rows.map((r) => [r.filename, r.content]))));
  }, [store, job.id]);
  const allFiles = useCallback((): Files => ({ ...job.data, ...written, ...(extraFiles ?? {}), ...(code.contents ?? {}) }), [job.data, written, extraFiles, code.contents]);
  if (filesRef) filesRef.current = allFiles;

  const grow = () => setHeight((h) => Math.max(h ?? 0, Math.min(maxHeight(), Math.round(window.innerHeight * 0.55))));

  const doRun = useCallback(async () => {
    if (busy || runDisabledReason || !code.contents) return;
    playSound("key", profile.settings.sound);
    await code.takeSnapshot("run");
    openConsole("output");
    showZone("output");
    const files = allFiles();
    logEvent("run");
    const result = await runner.run(files, entry, argvField ? splitArgs(args) : []);
    if (result && store && Object.keys(result.filesOut).length) {
      for (const [name, content] of Object.entries(result.filesOut)) await saveCode(store, job.id, "_files", name, content, null);
      setWritten((w) => ({ ...w, ...result.filesOut }));
    }
    // Drawings need room.
    if (result?.visuals?.frames.length || result?.figures?.length) grow();
    if (result) onRun?.(result, files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, runDisabledReason, code, allFiles, runner, entry, onRun, showZone, logEvent, argvField, args, profile.settings.sound, store, job.id, openConsole]);

  const doTrace = useCallback(
    async (startLine: number | null = null) => {
      if (busy || !code.contents) return;
      await code.takeSnapshot("run");
      showZone("output");
      const files = allFiles();
      logEvent("visualise");
      // The trace runs live, so input() still works: the console shows any prompts while it runs.
      openConsole("output");
      const result = await runner.trace(files, entry);
      if (result) {
        setTrace({ result, source: files[entry] ?? "", startLine });
        setPane("steps");
        grow();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, code, allFiles, entry, showZone, logEvent, runner, openConsole],
  );

  // Explaining it to the duck opens the step-through at the line that surprised you.
  useEffect(() => {
    const onVis = (e: Event) => void doTrace((e as CustomEvent<number>).detail ?? null);
    window.addEventListener("ppc:visualise", onVis);
    return () => window.removeEventListener("ppc:visualise", onVis);
  }, [doTrace]);

  const doCheckWith = useCallback(
    async (key: string) => {
      if (busy || !code.contents) return null;
      await code.takeSnapshot("check");
      openConsole("checks");
      showZone("output");
      const files = allFiles();
      return runner.check(files, key, entry, timeoutMs);
    },
    [busy, code, allFiles, runner, entry, timeoutMs, showZone, openConsole],
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
  const showLine = (l: number) => {
    showZone("code");
    // On a phone the editor is in the other tab: give it a moment to show.
    setTimeout(() => editor.current?.goToLine(l), compact ? 60 : 0);
  };

  const heightRef = useRef(height);
  heightRef.current = height;
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const startY = e.clientY;
    const start = height ?? 240;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => setHeight(Math.max(MIN_CONSOLE, Math.min(maxHeight(), start + (startY - ev.clientY))));
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      try {
        localStorage.setItem(SPLIT_KEY, String(heightRef.current));
      } catch {
        // ignore
      }
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };
  const nudge = (by: number) => {
    const next = Math.max(MIN_CONSOLE, Math.min(maxHeight(), (height ?? 240) + by));
    setHeight(next);
    try {
      localStorage.setItem(SPLIT_KEY, String(next));
    } catch {
      // ignore
    }
  };

  const showNext = done && Boolean(nextStep);
  const menu: MenuItem[] = [
    ...(showNext && checkKey ? [{ label: "Check again", icon: "check" as const, onSelect: () => void doCheck(), disabled: busy || !contents }] : []),
    ...(showReset && !readOnly
      ? [
          {
            label: "Reset",
            icon: "reset" as const,
            onSelect: () => {
              if (contents && window.confirm("Put the starting code back? Your current code is kept in History.")) void code.replace(active, starter[active] ?? "", "manual");
            },
          },
        ]
      : []),
    ...(!readOnly ? [{ label: "History", icon: "history" as const, onSelect: () => setHistory(true) }] : []),
    { label: "Step through", icon: "footprints" as const, onSelect: () => void doTrace(), disabled: busy || !contents },
    { label: "Keys", icon: "keys" as const, onSelect: () => setKeysOpen(true) },
  ];

  // Checks 3/5: how many passed on the last Check.
  const required = state.report?.results.filter((r) => !r.stretch) ?? [];
  const total = checkCount ?? (required.length || undefined);
  const passedCount = required.filter((r) => r.passed).length;
  // A step passed on an earlier visit has no report yet: it still passed every check.
  const checksLabel = !checkKey || total === undefined ? "" : state.report ? `${passedCount}/${total}` : done ? `${total}/${total}` : `0/${total}`;

  const runButton = running ? (
    <Button variant="danger" icon="stop" onClick={runner.stop}>
      Stop
    </Button>
  ) : (
    <Button
      variant="run"
      onClick={() => void doRun()}
      disabled={Boolean(runDisabledReason) || !contents || state.phase === "starting"}
      title={runDisabledReason ?? "Run"}
      shortcut="Ctrl+Enter"
      keys="Control+Enter Meta+Enter"
    >
      Run
    </Button>
  );
  const mainButton = showNext ? (
    <Button variant="primary" icon="next" onClick={goNext} className={styles.nextButton}>
      Next step
    </Button>
  ) : checkKey ? (
    <Button variant="primary" icon="check" onClick={() => void doCheck()} disabled={busy || !contents} title="Check" shortcut="Ctrl+Shift+Enter" keys="Control+Shift+Enter Meta+Shift+Enter">
      {checkLabel}
    </Button>
  ) : null;

  const consoleShown = compact ? true : open;
  const tabs: { id: Pane; label: string; count?: string }[] = [
    { id: "output", label: "Output" },
    ...(checkKey ? [{ id: "checks" as const, label: "Checks", count: checksLabel || undefined }] : []),
    ...(trace ? [{ id: "steps" as const, label: "Step through" }] : []),
  ];

  return (
    <div className={styles.workspace} ref={workspace} data-zone={zone} data-open={consoleShown || undefined}>
      <div className={styles.editorPane}>
        <div className={styles.toolbar}>
          <div className={styles.files} role="tablist" aria-label="Files">
            {files.map((f) => (
              <button key={f} role="tab" aria-selected={f === active} className={styles.fileTab} onClick={() => setActive(f)}>
                <Icon name="fileText" size={16} />
                {f}
              </button>
            ))}
            {readOnly ? <span className={styles.readonly}>Read only</span> : null}
          </div>
          <div className={styles.actions}>
            <span className={styles.wide}>{runButton}</span>
            {mainButton ? <span className={styles.wide}>{mainButton}</span> : null}
            <Menu label="More" items={menu} />
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
        {runDisabledReason ? (
          <p className={styles.note}>
            <Icon name="lock" size={16} />
            {runDisabledReason}
          </p>
        ) : null}
        {argvField ? (
          <label className={styles.argv}>
            <span>python {entry}</span>
            <input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="arguments, like --list or add 'Buy milk'" spellCheck={false} aria-label="Command-line arguments" />
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
            <p className={styles.opening}>Opening your file.</p>
          )}
        </div>
      </div>
      {consoleShown && !compact ? (
        <div
          className={styles.handle}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize the console"
          aria-valuemin={MIN_CONSOLE}
          aria-valuemax={800}
          aria-valuenow={height ?? 240}
          tabIndex={0}
          onPointerDown={startDrag}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") nudge(24);
            else if (e.key === "ArrowDown") nudge(-24);
            else return;
            e.preventDefault();
          }}
        />
      ) : null}
      <section className={styles.console} style={consoleShown && !compact ? { height: height ?? 240 } : undefined} aria-label="Console">
        <div className={styles.bar} style={{ minHeight: BAR }}>
          <div className={styles.tabs} role="tablist" aria-label="Console">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={consoleShown && pane === t.id}
                aria-controls="console-body"
                className={styles.tab}
                onClick={() => openConsole(t.id)}
              >
                {t.label}
                {t.count ? <span className={styles.count}>{t.count}</span> : null}
              </button>
            ))}
          </div>
          {state.runtime.status === "loading" ? (
            <span className={styles.loading}>
              <Icon name="loader" size={16} spin />
              Starting Python
            </span>
          ) : null}
          {compact ? null : (
            <button type="button" className={styles.toggle} aria-expanded={open} onClick={() => (open ? setOpen(false) : openConsole(pane))} title={open ? "Fold the console" : "Open the console"}>
              <Icon name={open ? "caretDown" : "caretUp"} />
              <span className="visually-hidden">{open ? "Fold the console" : "Open the console"}</span>
            </button>
          )}
        </div>
        {consoleShown ? (
          <div id="console-body" className={styles.body} role="tabpanel">
            {pane === "steps" && trace ? (
              <Visualiser key={`${trace.source.length}-${trace.result.steps.length}-${trace.startLine}`} trace={trace.result} source={trace.source} startLine={trace.startLine} />
            ) : pane === "output" || (pane === "steps" && !trace) ? (
              <Console state={state} source={contents?.[entry] ?? ""} onInput={runner.provideInput} onShowLine={showLine} onRetry={() => void runner.retryLoad()} />
            ) : (
              <TestReport report={state.report} progress={state.checkProgress} source={contents?.[entry] ?? ""} onShowLine={showLine} passLine={passLine} />
            )}
          </div>
        ) : null}
      </section>
      {/* Phone: Run and Check (or Next step) pinned to the bottom of the Code and Output tabs. */}
      <div className={styles.pinned}>
        {runButton}
        {mainButton}
      </div>
      {keysOpen ? <ShortcutsSheet onClose={() => setKeysOpen(false)} /> : null}
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
