// One small SQL interface, two engines:
// - local development and tests: PGlite (Postgres compiled to WebAssembly)
// - production: Supabase Postgres over DATABASE_URL
// Both run the same migrations, and every learner query runs as the
// `authenticated` role with the learner's id as the JWT subject, so the RLS
// policies in supabase/migrations decide what each query can see.
import fs from "node:fs";
import path from "node:path";

export type Query = <R = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<R[]>;

export interface Db {
  /** Run as a signed-in learner: RLS applies. */
  asUser<T>(userId: string, fn: (q: Query) => Promise<T>): Promise<T>;
  /** Run with full access. Only for auth bookkeeping and account deletion. */
  asService<T>(fn: (q: Query) => Promise<T>): Promise<T>;
  kind: "pglite" | "postgres";
}

const claimsFor = (userId: string) => JSON.stringify({ sub: userId, role: "authenticated" });

function migrationFiles(): { name: string; sql: string }[] {
  const dir = path.join(process.cwd(), "supabase", "migrations");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((name) => ({ name, sql: fs.readFileSync(path.join(dir, name), "utf8") }));
}

async function createPglite(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const where = process.env.PPC_DB_DIR ?? path.join(process.cwd(), ".data", "pglite");
  const pg = where === "memory" ? new PGlite() : (fs.mkdirSync(where, { recursive: true }), new PGlite(where));
  await pg.waitReady;
  await pg.exec(fs.readFileSync(path.join(process.cwd(), "lib", "server", "local-bootstrap.sql"), "utf8"));
  const applied = new Set((await pg.query<{ name: string }>("select name from local_auth.migrations")).rows.map((r) => r.name));
  for (const m of migrationFiles()) {
    if (applied.has(m.name)) continue;
    await pg.transaction(async (tx) => {
      await tx.exec(m.sql);
      await tx.query("insert into local_auth.migrations (name) values ($1)", [m.name]);
    });
  }
  return {
    kind: "pglite",
    asUser(userId, fn) {
      return pg.transaction(async (tx) => {
        await tx.query("select set_config('request.jwt.claims', $1, true)", [claimsFor(userId)]);
        await tx.exec("set local role authenticated");
        return fn(async (sql, params) => (await tx.query(sql, params as unknown[])).rows as never);
      });
    },
    asService(fn) {
      return pg.transaction(async (tx) => fn(async (sql, params) => (await tx.query(sql, params as unknown[])).rows as never));
    },
  };
}

async function createPostgres(url: string): Promise<Db> {
  const postgres = (await import("postgres")).default;
  // Supabase's pooler runs in transaction mode, which doesn't support prepared statements.
  const sql = postgres(url, { prepare: false, max: 5, idle_timeout: 20 });
  return {
    kind: "postgres",
    asUser(userId, fn) {
      return sql.begin(async (tx) => {
        await tx.unsafe("select set_config('request.jwt.claims', $1, true)", [claimsFor(userId)]);
        await tx.unsafe("set local role authenticated");
        return fn(async (s, params) => (await tx.unsafe(s, (params ?? []) as never[])) as never);
      }) as Promise<never>;
    },
    asService(fn) {
      return sql.begin(async (tx) => fn(async (s, params) => (await tx.unsafe(s, (params ?? []) as never[])) as never)) as Promise<never>;
    },
  };
}

const g = globalThis as unknown as { __ppcDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!g.__ppcDb) {
    const url = process.env.DATABASE_URL;
    g.__ppcDb = url ? createPostgres(url) : createPglite();
    g.__ppcDb.catch(() => {
      g.__ppcDb = undefined;
    });
  }
  return g.__ppcDb;
}

/** For tests: forget the cached connection. */
export function resetDbForTests() {
  g.__ppcDb = undefined;
}
