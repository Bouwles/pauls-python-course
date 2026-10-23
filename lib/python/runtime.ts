// Main-thread side of the Python worker (public/py-worker.mjs).
//
// Loads Pyodide lazily, streams output, answers input() through a
// SharedArrayBuffer, and stops runaway code: first politely with Pyodide's
// interrupt buffer, then by terminating and restarting the worker.
import type { CheckReport, Files, RunResult, TestMeta, TestResult, TraceResult, ReviewResult } from "./protocol";

export type RuntimeStatus = "idle" | "loading" | "ready" | "busy" | "failed";

export interface RuntimeState {
  status: RuntimeStatus;
  /** True when SharedArrayBuffer is available: interactive input() and clean Stop. */
  isolated: boolean;
  version: string | null;
  error: string | null;
}

export type OutKind = "out" | "err" | "prompt" | "input";

export interface RunHandlers {
  onOut?: (kind: OutKind, text: string) => void;
  onPackages?: (message: string) => void;
  onInput?: (prompt: string) => void;
  onInputUnavailable?: () => void;
}

export interface CheckHandlers {
  onPackages?: (message: string) => void;
  onTests?: (tests: TestMeta[]) => void;
  onResult?: (index: number, result: TestResult) => void;
}

interface RunRequest {
  files: Files;
  entry?: string;
  inputs?: string[];
  seed?: number;
  argv?: string[];
}

type Kind = "run" | "trace" | "check" | "review";

interface Pending {
  id: number;
  kind: Kind;
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
  run?: RunHandlers;
  check?: CheckHandlers;
  tests: TestMeta[];
  results: TestResult[];
  defaultTimeout: number;
}

const INPUT_BYTES = 64 * 1024;
const STOP_GRACE_MS = 1500;
const TEST_GRACE_MS = 2500;

class PythonRuntime {
  private worker: Worker | null = null;
  private loading: Promise<void> | null = null;
  private pending: Pending | null = null;
  private nextId = 1;
  private interrupt: Int32Array | null = null;
  private inputCtl: Int32Array | null = null;
  private inputData: Uint8Array | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;
  private testTimer: ReturnType<typeof setTimeout> | null = null;
  private hardTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<(s: RuntimeState) => void>();
  private loadWaiters: { resolve: () => void; reject: (e: Error) => void }[] = [];
  state: RuntimeState = { status: "idle", isolated: false, version: null, error: null };

  subscribe(fn: (s: RuntimeState) => void): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private setState(patch: Partial<RuntimeState>) {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(this.state);
  }

  /** Start Pyodide if it isn't running. Safe to call repeatedly. */
  load(): Promise<void> {
    if (this.state.status === "ready" || this.state.status === "busy") return Promise.resolve();
    if (this.loading) return this.loading;
    this.loading = new Promise<void>((resolve, reject) => {
      this.loadWaiters.push({ resolve, reject });
      this.spawn();
    });
    return this.loading;
  }

  private spawn() {
    const isolated = typeof crossOriginIsolated !== "undefined" && crossOriginIsolated && typeof SharedArrayBuffer !== "undefined";
    this.setState({ status: "loading", isolated, error: null });
    const worker = new Worker("/py-worker.mjs", { type: "module" });
    this.worker = worker;
    let buffers: { interrupt: SharedArrayBuffer; inputCtl: SharedArrayBuffer; inputData: SharedArrayBuffer } | undefined;
    if (isolated) {
      buffers = {
        interrupt: new SharedArrayBuffer(4),
        inputCtl: new SharedArrayBuffer(8),
        inputData: new SharedArrayBuffer(INPUT_BYTES),
      };
      this.interrupt = new Int32Array(buffers.interrupt);
      this.inputCtl = new Int32Array(buffers.inputCtl);
      this.inputData = new Uint8Array(buffers.inputData);
    } else {
      this.interrupt = this.inputCtl = this.inputData = null;
    }
    worker.onmessage = (e) => this.onMessage(worker, e.data);
    worker.onerror = (e) => {
      e.preventDefault();
      this.onWorkerDied(worker, e.message || "The Python worker stopped.");
    };
    worker.postMessage({ type: "init", buffers, version: process.env.NEXT_PUBLIC_CONTENT_VERSION ?? "" });
  }

  private onWorkerDied(worker: Worker, message: string) {
    if (worker !== this.worker) return;
    const wasLoading = this.state.status === "loading";
    this.worker = null;
    worker.terminate();
    if (wasLoading) {
      this.loading = null;
      this.setState({ status: "failed", error: message });
      for (const w of this.loadWaiters.splice(0)) w.reject(new Error(message));
      return;
    }
    this.finishPendingAsStopped(true, message);
    this.restart();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onMessage(worker: Worker, msg: any) {
    if (worker !== this.worker) return;
    switch (msg.type) {
      case "loading":
        return;
      case "ready":
        this.loading = null;
        this.setState({ status: "ready", version: msg.version, isolated: msg.isolated, error: null });
        for (const w of this.loadWaiters.splice(0)) w.resolve();
        return;
      case "failed":
        this.onWorkerDied(worker, msg.message);
        return;
    }
    const p = this.pending;
    if (!p || msg.id !== p.id) return;
    switch (msg.type) {
      case "out":
        p.run?.onOut?.(msg.kind, msg.text);
        break;
      case "input-request":
        p.run?.onInput?.(msg.prompt);
        break;
      case "input-unavailable":
        p.run?.onInputUnavailable?.();
        break;
      case "packages":
        p.run?.onPackages?.(msg.message);
        p.check?.onPackages?.(msg.message);
        break;
      case "event":
        this.onEvent(p, msg.name, msg.data);
        break;
      case "result":
        this.clearTimers();
        this.pending = null;
        this.setState({ status: "ready" });
        p.resolve(msg.result);
        break;
      case "crash":
        // Pyodide can't be trusted after an internal crash (usually very deep recursion).
        this.clearTimers();
        this.pending = null;
        p.reject(new Error(msg.message));
        this.restart();
        break;
    }
  }

  private onEvent(p: Pending, name: string, data: { index?: number; timeoutMs?: number; result?: TestResult } | TestMeta[]) {
    if (name === "tests" && Array.isArray(data)) {
      p.tests = data;
      p.check?.onTests?.(data);
    } else if (name === "test-start" && !Array.isArray(data)) {
      this.clearTestTimers();
      const timeout = data.timeoutMs ?? p.defaultTimeout;
      this.testTimer = setTimeout(() => {
        if (this.interrupt) this.interrupt[0] = 2;
        this.hardTimer = setTimeout(() => this.hardStopCheck(data.index ?? 0, timeout), TEST_GRACE_MS);
      }, timeout);
    } else if (name === "test-end" && !Array.isArray(data)) {
      this.clearTestTimers();
      if (data.result && data.index !== undefined) {
        p.results[data.index] = data.result;
        p.check?.onResult?.(data.index, data.result);
      }
    }
  }

  /** A check's test ignored the interrupt (or there is no interrupt buffer). */
  private hardStopCheck(index: number, timeout: number) {
    const p = this.pending;
    if (!p || p.kind !== "check") return;
    const results: TestResult[] = p.tests.map((meta, i) => {
      if (p.results[i]) return p.results[i]!;
      if (i === index) {
        return { ...meta, passed: false, error: null, timedOut: true, message: `This took longer than ${Math.round(timeout / 1000)} seconds. A loop that never ends is the usual cause.` };
      }
      return { ...meta, passed: false, error: null, notRun: true, message: "Not run: the check before it had to be stopped." };
    });
    this.pending = null;
    this.clearTimers();
    p.resolve({ status: "ok", results, syntaxError: null } satisfies CheckReport);
    this.restart();
  }

  private finishPendingAsStopped(restarted: boolean, message?: string) {
    const p = this.pending;
    if (!p) return;
    this.pending = null;
    this.clearTimers();
    if (p.kind === "run") {
      const r: RunResult = { status: "stopped", error: null, exitCode: 0, filesOut: {}, output: "", printed: "", inputsRequested: 0, restarted };
      p.resolve(r);
    } else if (p.kind === "trace") {
      const r: TraceResult = { status: "stopped", error: null, steps: [], limit: 0, loops: [], entry: "main.py", output: "" };
      p.resolve(r);
    } else {
      p.reject(new Error(message ?? "Stopped"));
    }
  }

  private restart() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.loading = null;
    this.setState({ status: "idle" });
    void this.load().catch(() => {});
  }

  private clearTestTimers() {
    if (this.testTimer) clearTimeout(this.testTimer);
    if (this.hardTimer) clearTimeout(this.hardTimer);
    this.testTimer = this.hardTimer = null;
  }

  private clearTimers() {
    this.clearTestTimers();
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = null;
  }

  private async call<T>(kind: Kind, request: object, handlers: { run?: RunHandlers; check?: CheckHandlers }, defaultTimeout = 10_000): Promise<T> {
    await this.load();
    if (this.pending) throw new Error("Python is already running something.");
    const id = this.nextId++;
    if (this.interrupt) this.interrupt[0] = 0;
    this.setState({ status: "busy" });
    return new Promise<T>((resolve, reject) => {
      this.pending = { id, kind, resolve: resolve as (v: unknown) => void, reject, ...handlers, tests: [], results: [], defaultTimeout };
      this.worker!.postMessage({ id, kind, request });
    });
  }

  run(request: RunRequest, handlers: RunHandlers = {}): Promise<RunResult> {
    return this.call<RunResult>("run", { stream: true, ...request }, { run: handlers });
  }

  trace(request: RunRequest & { limit?: number }, handlers: RunHandlers = {}): Promise<TraceResult> {
    return this.call<TraceResult>("trace", { stream: true, ...request }, { run: handlers });
  }

  check(request: { files: Files; entry?: string; tests: string; timeoutMs?: number }, handlers: CheckHandlers = {}): Promise<CheckReport> {
    return this.call<CheckReport>("check", request, { check: handlers }, request.timeoutMs ?? 10_000);
  }

  /** Moss's style notes on the learner's files (Section 5.1). Never runs their code. */
  review(request: { files: Files; limit?: number }): Promise<ReviewResult> {
    return this.call<ReviewResult>("review", request, {});
  }

  /** Answer an input() prompt. */
  provideInput(text: string) {
    if (!this.inputCtl || !this.inputData) return;
    const bytes = new TextEncoder().encode(text).slice(0, INPUT_BYTES);
    this.inputData.set(bytes);
    this.inputCtl[1] = bytes.length;
    Atomics.store(this.inputCtl, 0, 2);
    Atomics.notify(this.inputCtl, 0);
  }

  get busy() {
    return this.pending !== null;
  }

  /** Stop whatever is running. Polite first; a restart if Python doesn't listen. */
  stop() {
    if (!this.pending) return;
    if (this.interrupt && this.inputCtl) {
      this.interrupt[0] = 2;
      if (Atomics.load(this.inputCtl, 0) === 1) {
        Atomics.store(this.inputCtl, 0, 3);
        Atomics.notify(this.inputCtl, 0);
      }
      if (this.stopTimer) clearTimeout(this.stopTimer);
      this.stopTimer = setTimeout(() => {
        this.finishPendingAsStopped(true);
        this.restart();
      }, STOP_GRACE_MS);
    } else {
      this.finishPendingAsStopped(true);
      this.restart();
    }
  }
}

let instance: PythonRuntime | null = null;

export function getRuntime(): PythonRuntime {
  if (!instance) instance = new PythonRuntime();
  return instance;
}

export type { PythonRuntime };
