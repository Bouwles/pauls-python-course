"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRuntime, type OutKind, type RuntimeState } from "@/lib/python/runtime";
import type { CheckReport, Files, RunResult, TestMeta, TestResult, TraceResult } from "@/lib/python/protocol";

export interface OutputPart {
  kind: OutKind;
  text: string;
}

export type RunPhase = "idle" | "starting" | "running" | "checking";

export interface RunnerState {
  phase: RunPhase;
  output: OutputPart[];
  awaitingInput: string | null;
  inputUnavailable: boolean;
  result: RunResult | null;
  report: CheckReport | null;
  checkProgress: { tests: TestMeta[]; results: TestResult[] } | null;
  runtime: RuntimeState;
  loadError: string | null;
  /** A quiet line while a heavy package downloads the first time. */
  packages: string | null;
}

const MAX_PARTS = 4000;

const testsCache = new Map<string, string>();

export async function fetchTests(key: string): Promise<string> {
  const hit = testsCache.get(key);
  if (hit) return hit;
  const res = await fetch(`/api/tests?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error("Couldn't fetch the checks for this step.");
  const body = (await res.json()) as { tests: string };
  testsCache.set(key, body.tests);
  return body.tests;
}

export function useRunner() {
  const runtime = getRuntime();
  const [state, setState] = useState<RunnerState>({
    phase: "idle",
    output: [],
    awaitingInput: null,
    inputUnavailable: false,
    result: null,
    report: null,
    checkProgress: null,
    runtime: runtime.state,
    loadError: null,
    packages: null,
  });
  const buffer = useRef<OutputPart[]>([]);
  const frame = useRef<number | null>(null);

  useEffect(() => runtime.subscribe((r) => setState((s) => ({ ...s, runtime: r }))), [runtime]);

  // Batch streamed output into one render per animation frame.
  const flushOutput = useCallback(() => {
    frame.current = null;
    if (buffer.current.length === 0) return;
    const parts = buffer.current;
    buffer.current = [];
    setState((s) => {
      const out = s.output.slice();
      for (const p of parts) {
        const last = out[out.length - 1];
        if (last && last.kind === p.kind) out[out.length - 1] = { kind: p.kind, text: last.text + p.text };
        else out.push(p);
      }
      return { ...s, output: out.length > MAX_PARTS ? out.slice(-MAX_PARTS) : out };
    });
  }, []);

  const pushOut = useCallback(
    (kind: OutKind, text: string) => {
      buffer.current.push({ kind, text });
      if (frame.current === null) frame.current = requestAnimationFrame(flushOutput);
    },
    [flushOutput],
  );

  const ensureLoaded = useCallback(async () => {
    if (runtime.state.status === "ready" || runtime.state.status === "busy") return true;
    setState((s) => ({ ...s, phase: "starting", loadError: null }));
    try {
      await runtime.load();
      return true;
    } catch (err) {
      setState((s) => ({ ...s, phase: "idle", loadError: (err as Error).message }));
      return false;
    }
  }, [runtime]);

  const run = useCallback(
    async (files: Files, entry = "main.py", argv: string[] = []): Promise<RunResult | null> => {
      if (runtime.busy) return null;
      buffer.current = [];
      setState((s) => ({ ...s, output: [], result: null, report: null, awaitingInput: null, inputUnavailable: false, checkProgress: null }));
      if (!(await ensureLoaded())) return null;
      setState((s) => ({ ...s, phase: "running" }));
      try {
        const result = await runtime.run(
          { files, entry, argv },
          {
            onPackages: (m) => setState((s) => ({ ...s, packages: m })),
            onOut: (k, t) => {
              setState((s) => (s.packages ? { ...s, packages: null } : s));
              pushOut(k, t);
            },
            onInput: (prompt) => {
              flushOutput();
              setState((s) => ({ ...s, awaitingInput: prompt }));
            },
            onInputUnavailable: () => setState((s) => ({ ...s, inputUnavailable: true })),
          },
        );
        flushOutput();
        setState((s) => ({ ...s, phase: "idle", result, awaitingInput: null, packages: null }));
        return result;
      } catch (err) {
        flushOutput();
        const result: RunResult = {
          status: "error",
          error: { type: "RuntimeError", message: "Python stopped unexpectedly. Very deep recursion is the usual cause.", file: null, line: null, column: null, text: null, frames: [], traceback: String((err as Error).message) },
          exitCode: 1,
          filesOut: {},
          output: "",
          printed: "",
          inputsRequested: 0,
        };
        setState((s) => ({ ...s, phase: "idle", result, awaitingInput: null }));
        return result;
      }
    },
    [runtime, ensureLoaded, pushOut, flushOutput],
  );

  const check = useCallback(
    async (files: Files, testsKey: string | { source: string }, entry = "main.py", timeoutMs = 10_000): Promise<CheckReport | null> => {
      if (runtime.busy) return null;
      setState((s) => ({ ...s, report: null, checkProgress: null, result: null, output: [], awaitingInput: null }));
      if (!(await ensureLoaded())) return null;
      let tests: string;
      try {
        tests = typeof testsKey === "string" ? await fetchTests(testsKey) : testsKey.source;
      } catch (err) {
        setState((s) => ({ ...s, loadError: (err as Error).message }));
        return null;
      }
      setState((s) => ({ ...s, phase: "checking", checkProgress: { tests: [], results: [] } }));
      try {
        const report = await runtime.check(
          { files, entry, tests, timeoutMs },
          {
            onPackages: (m) => setState((s) => ({ ...s, packages: m })),
            onTests: (metas) => setState((s) => ({ ...s, checkProgress: { tests: metas, results: [] } })),
            onResult: (i, r) =>
              setState((s) => {
                if (!s.checkProgress) return s;
                const results = s.checkProgress.results.slice();
                results[i] = r;
                return { ...s, checkProgress: { ...s.checkProgress, results } };
              }),
          },
        );
        setState((s) => ({ ...s, phase: "idle", report, checkProgress: null, packages: null }));
        return report;
      } catch (err) {
        const report: CheckReport = { status: "crashed", results: [], syntaxError: null };
        setState((s) => ({ ...s, phase: "idle", report, checkProgress: null, loadError: (err as Error).message }));
        return report;
      }
    },
    [runtime, ensureLoaded],
  );

  /** Run with tracing for the visualiser. Output and input() work as in a normal run. */
  const trace = useCallback(
    async (files: Files, entry = "main.py"): Promise<TraceResult | null> => {
      if (runtime.busy) return null;
      buffer.current = [];
      setState((s) => ({ ...s, output: [], result: null, report: null, awaitingInput: null, checkProgress: null }));
      if (!(await ensureLoaded())) return null;
      setState((s) => ({ ...s, phase: "running" }));
      try {
        const result = await runtime.trace(
          { files, entry, limit: 1000 },
          {
            onOut: pushOut,
            onInput: (prompt) => {
              flushOutput();
              setState((s) => ({ ...s, awaitingInput: prompt }));
            },
          },
        );
        flushOutput();
        setState((s) => ({ ...s, phase: "idle", awaitingInput: null }));
        return result;
      } catch {
        setState((s) => ({ ...s, phase: "idle", awaitingInput: null }));
        return null;
      }
    },
    [runtime, ensureLoaded, pushOut, flushOutput],
  );

  const provideInput = useCallback(
    (text: string) => {
      setState((s) => ({ ...s, awaitingInput: null }));
      runtime.provideInput(text);
    },
    [runtime],
  );

  const stop = useCallback(() => runtime.stop(), [runtime]);

  const clear = useCallback(() => {
    setState((s) => ({ ...s, output: [], result: null, report: null, checkProgress: null }));
  }, []);

  /** Warm Python up in the background, so the first Run is quick. */
  const preload = useCallback(() => {
    void runtime.load().catch(() => {});
  }, [runtime]);

  return { state, run, check, trace, stop, provideInput, clear, preload, retryLoad: ensureLoaded };
}

export type Runner = ReturnType<typeof useRunner>;
