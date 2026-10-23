// The local half of "everything saves": IndexedDB, one database per learner
// (or "guest"). Every write lands here first and is queued in an outbox for
// the sync engine to send to the server.
import { openDB, type IDBPDatabase } from "idb";
import { TABLES, type Table, type Tables } from "./types";

const VERSION = 1;

interface OutboxEntry {
  key: string; // `${table}:${rowKey}`
  table: Table;
  rowKey: string;
  queuedAt: number;
}

type Listener = () => void;

export class LocalStore {
  readonly scope: string;
  private db: Promise<IDBPDatabase>;
  private listeners = new Map<string, Set<Listener>>();
  private outboxListeners = new Set<Listener>();

  constructor(scope: string) {
    this.scope = scope;
    this.db = openDB(dbName(scope), VERSION, {
      upgrade(db) {
        for (const t of TABLES) if (!db.objectStoreNames.contains(t)) db.createObjectStore(t, { keyPath: "key" });
        if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
        if (!db.objectStoreNames.contains("outbox")) db.createObjectStore("outbox", { keyPath: "key" });
      },
    });
  }

  async get<T extends Table>(table: T, key: string): Promise<Tables[T] | undefined> {
    return (await this.db).get(table, key) as Promise<Tables[T] | undefined>;
  }

  async all<T extends Table>(table: T): Promise<Tables[T][]> {
    return (await this.db).getAll(table) as Promise<Tables[T][]>;
  }

  /** Rows whose key starts with a prefix, e.g. all step progress for one job. */
  async prefixed<T extends Table>(table: T, prefix: string): Promise<Tables[T][]> {
    const range = IDBKeyRange.bound(prefix, prefix + "￿");
    return (await this.db).getAll(table, range) as Promise<Tables[T][]>;
  }

  /** Save a row locally and queue it for the server. */
  async put<T extends Table>(table: T, row: Tables[T], opts: { sync?: boolean } = {}): Promise<void> {
    const db = await this.db;
    const tx = db.transaction([table, "outbox"], "readwrite");
    await tx.objectStore(table).put(row);
    if (opts.sync !== false) {
      const entry: OutboxEntry = { key: `${table}:${row.key}`, table, rowKey: row.key, queuedAt: Date.now() };
      await tx.objectStore("outbox").put(entry);
    }
    await tx.done;
    this.emit(table);
    if (opts.sync !== false) for (const fn of this.outboxListeners) fn();
  }

  async putMany<T extends Table>(table: T, rows: Tables[T][], opts: { sync?: boolean } = {}): Promise<void> {
    if (rows.length === 0) return;
    const db = await this.db;
    const tx = db.transaction([table, "outbox"], "readwrite");
    for (const row of rows) {
      await tx.objectStore(table).put(row);
      if (opts.sync !== false) await tx.objectStore("outbox").put({ key: `${table}:${row.key}`, table, rowKey: row.key, queuedAt: Date.now() });
    }
    await tx.done;
    this.emit(table);
    if (opts.sync !== false) for (const fn of this.outboxListeners) fn();
  }

  async delete(table: Table, key: string): Promise<void> {
    await (await this.db).delete(table, key);
    this.emit(table);
  }

  async kvGet<V>(key: string): Promise<V | undefined> {
    return (await this.db).get("kv", key) as Promise<V | undefined>;
  }

  async kvSet(key: string, value: unknown): Promise<void> {
    await (await this.db).put("kv", value, key);
  }

  // -- outbox ------------------------------------------------------------------

  async outbox(limit = 200): Promise<{ entry: OutboxEntry; row: unknown }[]> {
    const db = await this.db;
    const entries = ((await db.getAll("outbox")) as OutboxEntry[]).sort((a, b) => a.queuedAt - b.queuedAt).slice(0, limit);
    const out: { entry: OutboxEntry; row: unknown }[] = [];
    for (const entry of entries) {
      const row = await db.get(entry.table, entry.rowKey);
      if (row) out.push({ entry, row });
      else await db.delete("outbox", entry.key);
    }
    return out;
  }

  async outboxSize(): Promise<number> {
    return (await this.db).count("outbox");
  }

  /** Remove sent entries, unless the row changed again while the request was in flight. */
  async clearSent(entries: OutboxEntry[]): Promise<void> {
    const db = await this.db;
    const tx = db.transaction("outbox", "readwrite");
    for (const e of entries) {
      const current = (await tx.store.get(e.key)) as OutboxEntry | undefined;
      if (current && current.queuedAt === e.queuedAt) await tx.store.delete(e.key);
    }
    await tx.done;
  }

  /** Queue every row for sending, e.g. after a guest's progress moves into a new account. */
  async queueEverything(): Promise<void> {
    const db = await this.db;
    for (const table of TABLES) {
      const keys = (await db.getAllKeys(table)) as string[];
      const tx = db.transaction("outbox", "readwrite");
      for (const k of keys) await tx.store.put({ key: `${table}:${k}`, table, rowKey: k, queuedAt: Date.now() });
      await tx.done;
    }
    for (const fn of this.outboxListeners) fn();
  }

  onOutbox(fn: Listener): () => void {
    this.outboxListeners.add(fn);
    return () => this.outboxListeners.delete(fn);
  }

  // -- reactivity --------------------------------------------------------------

  subscribe(table: Table, fn: Listener): () => void {
    let set = this.listeners.get(table);
    if (!set) this.listeners.set(table, (set = new Set()));
    set.add(fn);
    return () => set!.delete(fn);
  }

  private emit(table: Table) {
    for (const fn of this.listeners.get(table) ?? []) fn();
  }

  // -- lifecycle ---------------------------------------------------------------

  /** Copy everything from another store into this one (guest progress into a new account). */
  async absorb(other: LocalStore): Promise<number> {
    let count = 0;
    for (const table of TABLES) {
      const rows = await other.all(table);
      const mine = new Map((await this.all(table)).map((r) => [r.key, r]));
      const take = rows.filter((r) => {
        const existing = mine.get(r.key);
        return !existing || (existing.updatedAt ?? 0) < (r.updatedAt ?? 0);
      });
      await this.putMany(table, take as Tables[typeof table][]);
      count += take.length;
    }
    return count;
  }

  async close(): Promise<void> {
    (await this.db).close();
  }

  async destroy(): Promise<void> {
    (await this.db).close();
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(dbName(this.scope));
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  }
}

export function dbName(scope: string) {
  return `ppc:${scope}`;
}

export async function databaseExists(scope: string): Promise<boolean> {
  if (typeof indexedDB === "undefined" || !("databases" in indexedDB)) return true;
  const dbs = await indexedDB.databases();
  return dbs.some((d) => d.name === dbName(scope));
}
