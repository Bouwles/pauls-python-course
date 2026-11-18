"use client";

// Sync straight from the browser to Supabase, for the GitHub Pages site (lib/store/sync.ts runs
// it). Rows map onto the same tables the local version's server writes (lib/server/tables.ts),
// as the signed-in learner, so row level security keeps everyone to their own rows; an older
// copy of a row never overwrites a newer one (the keep_newest trigger in migration 0008).
import { TABLE_SPECS, dbToRow, rowToDb, type TableSpec } from "../server/tables";
import { TABLES, type PullResponse, type SyncChange, type Table } from "../store/types";
import type { SyncTransport } from "../store/sync";
import { supabase } from "./client";

type Row = Record<string, unknown>;

/** A row as PostgREST takes it: like rowToDb, but JSON columns as values rather than text. */
function toRest(spec: TableSpec, row: Row, userId: string): Row {
  const out = rowToDb(spec, row);
  for (const c of spec.columns) if (c.kind === "json" && typeof out[c.column] === "string") out[c.column] = JSON.parse(out[c.column] as string);
  return { user_id: userId, ...out };
}

function profileToRest(row: Row, userId: string): Row {
  // Never the username or role: those change through their own screens, not sync.
  return {
    id: userId,
    display_name: String(row.displayName ?? "").slice(0, 40),
    character: row.character ?? null,
    settings: row.settings ?? {},
    experience: row.experience ?? null,
    last_location: row.lastLocation ?? null,
    onboarded: Boolean(row.onboarded),
    updated_at: Math.round(Number(row.updatedAt ?? Date.now())),
  };
}

export function profileFromDb(p: Row): Row {
  return {
    key: "me",
    displayName: p.display_name ?? "",
    character: p.character ?? null,
    settings: p.settings ?? {},
    experience: p.experience ?? null,
    lastLocation: p.last_location ?? null,
    onboarded: Boolean(p.onboarded),
    username: p.username ?? null,
    updatedAt: Number(p.updated_at ?? 0),
  };
}

/** A database error that no retry will fix: a row the table refuses. */
const refused = (code: string | undefined) => Boolean(code && /^(22|23)/.test(code));
/** The session is gone or doesn't allow it. */
const signedOut = (status: number | undefined, code: string | undefined) => status === 401 || code === "PGRST301" || code === "42501";

async function upsert(table: string, rows: Row[], onConflict: string, appendOnly: boolean) {
  return supabase().from(table).upsert(rows, { onConflict, ignoreDuplicates: appendOnly });
}

export function supabaseTransport(userId: string): SyncTransport {
  return {
    async push(changes: SyncChange[]) {
      const { data } = await supabase().auth.getSession();
      if (!data.session || data.session.user.id !== userId) return "signed-out";
      const byTable = new Map<Table, Row[]>();
      for (const c of changes) {
        if (!TABLES.includes(c.table) || typeof c.row !== "object" || c.row === null) continue;
        const list = byTable.get(c.table) ?? [];
        list.push(c.row as unknown as Row);
        byTable.set(c.table, list);
      }
      for (const [table, rows] of byTable) {
        const spec = table === "profile" ? null : TABLE_SPECS[table];
        const sqlTable = spec ? spec.sql : "profiles";
        const onConflict = spec ? ["user_id", ...spec.pk].join(",") : "id";
        const appendOnly = Boolean(spec?.appendOnly);
        const shaped: Row[] = [];
        for (const r of rows) {
          try {
            shaped.push(spec ? toRest(spec, r, userId) : profileToRest(r, userId));
          } catch {
            // A row this table can't hold (not a number where one belongs): nothing to send.
          }
        }
        // One row per key: the last change to it is the one that counts.
        const keyed = new Map<string, Row>();
        for (const r of shaped) keyed.set(onConflict.split(",").map((k) => String(r[k])).join("/"), r);
        const unique = [...keyed.values()];
        if (!unique.length) continue;
        const { error, status } = await upsert(sqlTable, unique, onConflict, appendOnly);
        if (!error) continue;
        if (signedOut(status, error.code)) return "signed-out";
        if (!refused(error.code)) throw new Error(`sync failed: ${error.code} ${error.message}`);
        // One row in the batch was refused: send them one at a time, and drop only that one.
        for (const r of unique) {
          const one = await upsert(sqlTable, [r], onConflict, appendOnly);
          if (one.error && signedOut(one.status, one.error.code)) return "signed-out";
          if (one.error && !refused(one.error.code)) throw new Error(`sync failed: ${one.error.code}`);
        }
      }
      return { conflicts: [], serverTime: Date.now() };
    },

    async pull() {
      const { data, error } = await supabase().rpc("sync_pull");
      if (error || !data) return null;
      const all = data as Record<string, Row[] | number>;
      const rows: PullResponse["rows"] = {};
      const profile = (all.profiles as Row[] | undefined)?.[0];
      if (profile) rows.profile = [profileFromDb(profile)] as unknown as PullResponse["rows"]["profile"];
      for (const table of TABLES) {
        if (table === "profile") continue;
        const spec = TABLE_SPECS[table];
        const list = all[spec.sql];
        if (!Array.isArray(list)) continue;
        (rows as Record<string, unknown[]>)[table] = list.map((r) => dbToRow(spec, r));
      }
      return { rows, serverTime: Number(all.server_time ?? Date.now()) };
    },
  };
}
