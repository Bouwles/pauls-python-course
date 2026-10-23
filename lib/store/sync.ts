// Background sync between the local store and the server.
// Quiet by design: it reports "Saved", "Saving" or "Offline" and never interrupts.
import type { LocalStore } from "./local";
import { snapshotKey } from "./progress";
import { TABLES, type CodeFileRow, type PullResponse, type PushResponse, type SnapshotRow, type Table, type Tables } from "./types";

export type SyncStatus = "local" | "saved" | "saving" | "offline" | "error";

const DEBOUNCE_MS = 2000;
const RETRY_MS = [3000, 8000, 20000, 60000];

export class SyncEngine {
  private store: LocalStore;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<void> | null = null;
  private retries = 0;
  private listeners = new Set<(s: SyncStatus) => void>();
  private stopped = false;
  private unsub: (() => void) | null = null;
  status: SyncStatus = "saved";
  conflicts = new Set<string>();

  constructor(store: LocalStore) {
    this.store = store;
    this.unsub = store.onOutbox(() => this.schedule());
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.onOnline);
      window.addEventListener("pagehide", this.onHide);
      window.addEventListener("ppc:flush-sync", this.onHide);
      document.addEventListener("visibilitychange", this.onVisibility);
    }
  }

  subscribe(fn: (s: SyncStatus) => void): () => void {
    this.listeners.add(fn);
    fn(this.status);
    return () => this.listeners.delete(fn);
  }

  private set(status: SyncStatus) {
    if (this.status === status) return;
    this.status = status;
    for (const fn of this.listeners) fn(status);
  }

  private onOnline = () => this.schedule(0);
  private onHide = () => void this.flush(true);
  private onVisibility = () => {
    if (document.visibilityState === "hidden") void this.flush(true);
  };

  schedule(delay = DEBOUNCE_MS) {
    if (this.stopped) return;
    if (this.status !== "offline") this.set("saving");
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), delay);
  }

  /** Send everything queued. `keepalive` lets the last save finish as the tab closes. */
  async flush(keepalive = false): Promise<void> {
    if (this.stopped) return;
    if (this.inFlight) return this.inFlight;
    this.inFlight = (async () => {
      try {
        for (;;) {
          const batch = await this.store.outbox(200);
          if (batch.length === 0) break;
          const res = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ changes: batch.map((b) => ({ table: b.entry.table, row: b.row })) }),
            keepalive: keepalive && JSON.stringify(batch).length < 60_000,
            credentials: "same-origin",
          });
          if (res.status === 401) {
            this.stop();
            this.set("error");
            return;
          }
          if (!res.ok) throw new Error(`sync failed: ${res.status}`);
          const body = (await res.json()) as PushResponse;
          for (const key of body.conflicts) await this.markConflict(key);
          await this.markSynced(batch.map((b) => ({ table: b.entry.table, row: b.row })), body.serverTime);
          await this.store.clearSent(batch.map((b) => b.entry));
        }
        this.retries = 0;
        this.set("saved");
      } catch {
        this.set(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "offline");
        const wait = RETRY_MS[Math.min(this.retries, RETRY_MS.length - 1)]!;
        this.retries++;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => void this.flush(), wait);
      } finally {
        this.inFlight = null;
      }
    })();
    return this.inFlight;
  }

  /** After a push, code files remember the server version they now match. */
  private async markSynced(changes: { table: Table; row: unknown }[], serverTime: number) {
    for (const c of changes) {
      if (c.table !== "code_files") continue;
      const row = c.row as CodeFileRow;
      const current = await this.store.get("code_files", row.key);
      if (current && current.updatedAt === row.updatedAt) {
        await this.store.put("code_files", { ...current, baseUpdatedAt: row.updatedAt }, { sync: false });
      }
    }
    void serverTime;
  }

  private async markConflict(key: string) {
    this.conflicts.add(key);
    const current = await this.store.get("code_files", key);
    if (current) await this.store.put("code_files", { ...current, conflictNote: true }, { sync: false });
  }

  /** Fetch everything the server has and merge it in. Used on sign-in and on each visit. */
  async pull(): Promise<boolean> {
    try {
      const res = await fetch("/api/sync", { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) return false;
      const body = (await res.json()) as PullResponse;
      for (const table of TABLES) {
        const rows = body.rows[table];
        if (rows?.length) await this.merge(table, rows as Tables[typeof table][]);
      }
      return true;
    } catch {
      this.set("offline");
      return false;
    }
  }

  private async merge<T extends Table>(table: T, incoming: Tables[T][]) {
    const local = new Map((await this.store.all(table)).map((r) => [r.key, r]));
    const take: Tables[T][] = [];
    const snapshots: SnapshotRow[] = [];
    for (const row of incoming) {
      const mine = local.get(row.key);
      if (!mine) {
        take.push(table === "code_files" ? ({ ...row, baseUpdatedAt: row.updatedAt } as Tables[T]) : row);
        continue;
      }
      if (table === "code_files") {
        const a = mine as CodeFileRow;
        const b = row as unknown as CodeFileRow;
        if (a.content === b.content) {
          if (a.baseUpdatedAt !== b.updatedAt) take.push({ ...a, baseUpdatedAt: b.updatedAt } as Tables[T]);
          continue;
        }
        const editedHere = a.baseUpdatedAt === null || a.updatedAt > (a.baseUpdatedAt ?? 0);
        const editedThere = a.baseUpdatedAt === null || b.updatedAt > (a.baseUpdatedAt ?? 0);
        if (editedHere && editedThere) {
          // Both devices changed it: keep both, show the newer, note the other in history.
          const older = a.updatedAt >= b.updatedAt ? b : a;
          const newer = older === a ? b : a;
          snapshots.push({
            key: snapshotKey(older.jobId, older.stepId, older.filename, older.updatedAt),
            jobId: older.jobId,
            stepId: older.stepId,
            filename: older.filename,
            content: older.content,
            reason: "conflict",
            createdAt: older.updatedAt,
            updatedAt: Date.now(),
          });
          take.push({ ...newer, baseUpdatedAt: b.updatedAt, conflictNote: true } as Tables[T]);
          this.conflicts.add(a.key);
        } else if (editedThere) {
          take.push({ ...b, baseUpdatedAt: b.updatedAt } as Tables[T]);
        }
        continue;
      }
      if ((row.updatedAt ?? 0) > (mine.updatedAt ?? 0)) take.push(row);
    }
    await this.store.putMany(table, take, { sync: false });
    if (snapshots.length) await this.store.putMany("code_snapshots", snapshots);
    // Rows that won locally but differ from the server get sent back up.
    if (table === "code_files") {
      const winners = take.filter((r) => (r as unknown as CodeFileRow).conflictNote);
      if (winners.length) await this.store.putMany(table, winners);
    }
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.unsub?.();
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.onOnline);
      window.removeEventListener("pagehide", this.onHide);
      window.removeEventListener("ppc:flush-sync", this.onHide);
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
  }
}
