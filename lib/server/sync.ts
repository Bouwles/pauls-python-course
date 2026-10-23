// Pull and push for learner data. Every query runs as the learner (RLS applies).
import type { Db, Query } from "./db";
import { TABLE_SPECS, dbToRow, rowToDb, upsertSql } from "./tables";
import { TABLES, type Table } from "../store/types";

export const MAX_CHANGES = 500;
const SNAPSHOTS_PER_FILE = 30;

export interface Change {
  table: Table;
  row: Record<string, unknown>;
}

function profileToRow(p: Record<string, unknown>) {
  return {
    key: "me",
    displayName: p.display_name ?? "",
    character: p.character ?? null,
    settings: p.settings ?? {},
    experience: p.experience ?? null,
    lastLocation: p.last_location ?? null,
    onboarded: Boolean(p.onboarded),
    updatedAt: Number(p.updated_at ?? 0),
  };
}

async function readAll(q: Query, userId: string) {
  const rows: Record<string, unknown[]> = {};
  rows.profile = (await q("select * from public.profiles where id = $1", [userId])).map(profileToRow);
  for (const table of TABLES) {
    if (table === "profile") continue;
    const spec = TABLE_SPECS[table];
    if (spec.writeOnly) continue;
    let sql = `select * from public.${spec.sql} where user_id = $1`;
    if (table === "code_snapshots") {
      sql = `select * from (select *, row_number() over (partition by job_id, step_id, filename order by created_at desc) as rn
             from public.code_snapshots where user_id = $1) s where rn <= ${SNAPSHOTS_PER_FILE}`;
    } else if (table === "review_logs") {
      sql += " order by reviewed_at desc limit 2000";
    }
    rows[table] = (await q<Record<string, unknown>>(sql, [userId])).map((r) => dbToRow(spec, r));
  }
  return rows;
}

export function pullAll(db: Db, userId: string) {
  return db.asUser(userId, (q) => readAll(q, userId));
}

export async function pushChanges(db: Db, userId: string, changes: Change[]): Promise<{ conflicts: string[]; rejected: string[] }> {
  const conflicts: string[] = [];
  const rejected: string[] = [];
  await db.asUser(userId, async (q) => {
    for (const [i, change] of changes.entries()) {
      if (!change || typeof change.row !== "object" || change.row === null || !TABLES.includes(change.table)) continue;
      const row = change.row;
      await q(`savepoint s${i}`);
      try {
        if (change.table === "profile") {
          await q(
            `insert into public.profiles (id, display_name, character, settings, experience, last_location, onboarded, updated_at)
             values ($1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb, $7, $8)
             on conflict (id) do update set display_name = excluded.display_name, character = excluded.character,
               settings = excluded.settings, experience = excluded.experience, last_location = excluded.last_location,
               onboarded = excluded.onboarded, updated_at = excluded.updated_at
             where public.profiles.updated_at <= excluded.updated_at`,
            [
              userId,
              String(row.displayName ?? "").slice(0, 40),
              JSON.stringify(row.character ?? null),
              JSON.stringify(row.settings ?? {}),
              row.experience ?? null,
              JSON.stringify(row.lastLocation ?? null),
              Boolean(row.onboarded),
              Number(row.updatedAt ?? Date.now()),
            ],
          );
        } else {
          const spec = TABLE_SPECS[change.table];
          const values = rowToDb(spec, row);
          if (change.table === "code_files") {
            // Edited on two devices: the older version goes to history; the newest wins.
            const existing = await q<{ content: string; updated_at: string }>(
              "select content, updated_at from public.code_files where user_id = $1 and job_id = $2 and step_id = $3 and filename = $4",
              [userId, values.job_id, values.step_id, values.filename],
            );
            const prev = existing[0];
            const base = Number(row.baseUpdatedAt ?? 0);
            if (prev && Number(prev.updated_at) > base && prev.content !== values.content && Number(prev.updated_at) !== Number(values.updated_at)) {
              const older =
                Number(prev.updated_at) < Number(values.updated_at)
                  ? { content: prev.content, at: Number(prev.updated_at) }
                  : { content: String(values.content), at: Number(values.updated_at) };
              await q(
                `insert into public.code_snapshots (user_id, id, job_id, step_id, filename, content, reason, created_at)
                 values ($1, $2, $3, $4, $5, $6, 'conflict', $7) on conflict do nothing`,
                [userId, `${values.job_id}/${values.step_id}/${values.filename}/${String(older.at).padStart(14, "0")}-conflict`, values.job_id, values.step_id, values.filename, older.content, older.at],
              );
              conflicts.push(String(spec.key(row)));
            }
          }
          await q(upsertSql(spec), [userId, ...spec.columns.map((c) => values[c.column])]);
        }
        await q(`release savepoint s${i}`);
      } catch (err) {
        await q(`rollback to savepoint s${i}`);
        rejected.push(`${change.table}:${String(row.key)}`);
        if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") console.warn("[sync] rejected row", change.table, (err as Error).message);
      }
    }
  });
  return { conflicts, rejected };
}
