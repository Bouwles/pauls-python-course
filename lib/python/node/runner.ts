// Runs the Workbench runtime under Node, in a worker thread so per-test
// timeouts can interrupt runaway code exactly as the browser does.
import { Worker } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CheckReport, ReviewResult, RunResult, TestMeta, TraceResult } from "../protocol";

const here = path.dirname(fileURLToPath(import.meta.url));

type Kind = "run" | "trace" | "check" | "describe" | "review";

interface Pending {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
  out: string[];
}

export class NodePython {
  private worker: Worker;
  private interrupt = new Int32Array(new SharedArrayBuffer(4));
  private ready: Promise<void>;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private timer: NodeJS.Timeout | null = null;
  private hardTimer: NodeJS.Timeout | null = null;
  private static readonly HARD_STOP_GRACE_MS = 3000;

  constructor() {
    this.worker = this.spawn();
    this.ready = this.whenReady(this.worker);
  }

  private spawn(): Worker {
    const worker = new Worker(path.join(here, "worker.mjs"), {
      workerData: {
        interrupt: this.interrupt.buffer,
        runtimePath: path.join(here, "..", "py", "ppc_runtime.py"),
      },
    });
    worker.on("message", (msg) => this.onMessage(msg));
    return worker;
  }

  private whenReady(worker: Worker): Promise<void> {
    return new Promise((resolve, reject) => {
      const onMessage = (msg: { type: string }) => {
        if (msg.type === "ready") {
          worker.off("message", onMessage);
          resolve();
        }
      };
      worker.on("message", onMessage);
      worker.once("error", reject);
    });
  }

  /**
   * Code stuck inside one C call (a huge sort, `in` on a long list) never reaches
   * Python's interrupt check. As in the browser, a test that outlives its limit
   * by a few seconds costs the worker: it is terminated and a fresh one started.
   */
  private hardStop() {
    this.clearTimer();
    const stuck = [...this.pending.values()];
    this.pending.clear();
    void this.worker.terminate();
    this.worker = this.spawn();
    this.ready = this.whenReady(this.worker);
    for (const job of stuck) job.reject(new Error("a test ran past its time limit and couldn't be interrupted, so the worker was restarted"));
  }

  private onMessage(msg: { type: string; id: number; [key: string]: unknown }) {
    const job = this.pending.get(msg.id);
    if (msg.type === "event") {
      const data = msg.data as { timeoutMs?: number };
      if (msg.name === "test-start") {
        this.clearTimer();
        const limit = data.timeoutMs ?? 10000;
        this.timer = setTimeout(() => {
          this.interrupt[0] = 2;
        }, limit);
        this.hardTimer = setTimeout(() => this.hardStop(), limit + NodePython.HARD_STOP_GRACE_MS);
      } else if (msg.name === "test-end") {
        this.clearTimer();
      }
      return;
    }
    if (!job) return;
    if (msg.type === "out") {
      job.out.push(String(msg.text));
    } else if (msg.type === "result") {
      this.clearTimer();
      this.pending.delete(msg.id);
      job.resolve(msg.result);
    } else if (msg.type === "crash") {
      this.clearTimer();
      this.pending.delete(msg.id);
      job.reject(new Error(String(msg.message)));
    }
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    if (this.hardTimer) clearTimeout(this.hardTimer);
    this.timer = null;
    this.hardTimer = null;
    this.interrupt[0] = 0;
  }

  private async call<T>(kind: Kind, request: unknown): Promise<T> {
    await this.ready;
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, out: [] });
      this.worker.postMessage({ id, kind, request });
    });
  }

  run(request: { files: Record<string, string>; entry?: string; inputs?: string[]; seed?: number }) {
    return this.call<RunResult>("run", { stream: false, fastSleep: true, ...request });
  }

  trace(request: { files: Record<string, string>; entry?: string; inputs?: string[]; limit?: number }) {
    return this.call<TraceResult>("trace", { stream: false, ...request });
  }

  check(request: { files: Record<string, string>; entry?: string; tests: string; timeoutMs?: number }) {
    return this.call<CheckReport>("check", request);
  }

  review(files: Record<string, string>, limit = 3) {
    return this.call<ReviewResult>("review", { files, limit });
  }

  describe(tests: string) {
    return this.call<TestMeta[]>("describe", { tests });
  }

  async close() {
    await this.worker.terminate();
  }
}
