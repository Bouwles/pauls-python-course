// How each synced client row maps onto its Postgres table.
import type { Table } from "../store/types";

type Kind = "text" | "int" | "bigint" | "float" | "bool" | "json" | "text[]";

interface Column {
  field: string; // client field
  column: string; // SQL column
  kind: Kind;
}

export interface TableSpec {
  sql: string;
  pk: string[]; // excluding user_id
  columns: Column[];
  /** Append-only tables never overwrite an existing row. */
  appendOnly?: boolean;
  /** Tables the client may write but never reads back. */
  writeOnly?: boolean;
  /** Has an updated_at column used for last-write-wins. */
  versioned: boolean;
  key: (row: Record<string, unknown>) => string;
}

const c = (field: string, column: string, kind: Kind): Column => ({ field, column, kind });

export const TABLE_SPECS: Record<Exclude<Table, "profile">, TableSpec> = {
  job_progress: {
    sql: "job_progress",
    pk: ["job_id"],
    versioned: true,
    columns: [
      c("jobId", "job_id", "text"),
      c("status", "status", "text"),
      c("startedAt", "started_at", "bigint"),
      c("shippedAt", "shipped_at", "bigint"),
      c("stretchDone", "stretch_done", "text[]"),
      c("timeSpent", "time_spent_seconds", "int"),
      c("updatedAt", "updated_at", "bigint"),
    ],
    key: (r) => String(r.jobId),
  },
  step_progress: {
    sql: "step_progress",
    pk: ["job_id", "step_id"],
    versioned: true,
    columns: [
      c("jobId", "job_id", "text"),
      c("stepId", "step_id", "text"),
      c("status", "status", "text"),
      c("attempts", "attempts", "int"),
      c("hintsUsed", "hints_used", "int"),
      c("seenSolution", "seen_solution", "bool"),
      c("predictChoice", "predict_choice", "text"),
      c("selfExplanation", "self_explanation", "text"),
      c("selfRating", "self_rating", "text"),
      c("timeSpent", "time_spent_seconds", "int"),
      c("data", "data", "json"),
      c("updatedAt", "updated_at", "bigint"),
    ],
    key: (r) => `${r.jobId}/${r.stepId}`,
  },
  code_files: {
    sql: "code_files",
    pk: ["job_id", "step_id", "filename"],
    versioned: true,
    columns: [
      c("jobId", "job_id", "text"),
      c("stepId", "step_id", "text"),
      c("filename", "filename", "text"),
      c("content", "content", "text"),
      c("cursor", "cursor", "int"),
      c("updatedAt", "updated_at", "bigint"),
    ],
    key: (r) => `${r.jobId}/${r.stepId}/${r.filename}`,
  },
  code_snapshots: {
    sql: "code_snapshots",
    pk: ["id"],
    versioned: false,
    appendOnly: true,
    columns: [
      c("key", "id", "text"),
      c("jobId", "job_id", "text"),
      c("stepId", "step_id", "text"),
      c("filename", "filename", "text"),
      c("content", "content", "text"),
      c("reason", "reason", "text"),
      c("createdAt", "created_at", "bigint"),
    ],
    key: (r) => String(r.key),
  },
  review_cards: {
    sql: "review_cards",
    pk: ["card_id"],
    versioned: true,
    columns: [
      c("cardId", "card_id", "text"),
      c("conceptId", "concept_id", "text"),
      c("due", "due", "bigint"),
      c("stability", "stability", "float"),
      c("difficulty", "difficulty", "float"),
      c("elapsedDays", "elapsed_days", "int"),
      c("scheduledDays", "scheduled_days", "int"),
      c("learningSteps", "learning_steps", "int"),
      c("reps", "reps", "int"),
      c("lapses", "lapses", "int"),
      c("state", "state", "int"),
      c("lastReview", "last_review", "bigint"),
      c("updatedAt", "updated_at", "bigint"),
    ],
    key: (r) => String(r.cardId),
  },
  review_logs: {
    sql: "review_logs",
    pk: ["id"],
    versioned: false,
    appendOnly: true,
    columns: [
      c("key", "id", "text"),
      c("cardId", "card_id", "text"),
      c("rating", "rating", "int"),
      c("reviewedAt", "reviewed_at", "bigint"),
      c("elapsedDays", "elapsed_days", "int"),
      c("scheduledDays", "scheduled_days", "int"),
    ],
    key: (r) => String(r.key),
  },
  misconceptions: {
    sql: "misconceptions",
    pk: ["misconception_id"],
    versioned: true,
    columns: [
      c("key", "misconception_id", "text"),
      c("count", "count", "int"),
      c("lastSeenAt", "last_seen_at", "bigint"),
      c("lastAddressedAt", "last_addressed_at", "bigint"),
      c("updatedAt", "updated_at", "bigint"),
    ],
    key: (r) => String(r.key),
  },
  drill_bests: {
    sql: "drill_bests",
    pk: ["drill_id"],
    versioned: true,
    columns: [c("key", "drill_id", "text"), c("bestMs", "best_ms", "int"), c("achievedAt", "achieved_at", "bigint"), c("updatedAt", "updated_at", "bigint")],
    key: (r) => String(r.key),
  },
  collectibles: {
    sql: "collectibles",
    pk: ["item_id"],
    versioned: false,
    appendOnly: true,
    columns: [c("key", "item_id", "text"), c("foundAt", "found_at", "bigint")],
    key: (r) => String(r.key),
  },
  story_flags: {
    sql: "story_flags",
    pk: ["flag_id"],
    versioned: false,
    appendOnly: true,
    columns: [c("key", "flag_id", "text"), c("setAt", "set_at", "bigint")],
    key: (r) => String(r.key),
  },
  events: {
    sql: "events",
    pk: ["id"],
    versioned: false,
    appendOnly: true,
    writeOnly: true,
    columns: [c("key", "id", "text"), c("type", "type", "text"), c("payload", "payload", "json"), c("createdAt", "created_at", "bigint")],
    key: (r) => String(r.key),
  },
};

function toDbValue(value: unknown, kind: Kind): unknown {
  if (value === undefined || value === null) return null;
  switch (kind) {
    case "text":
      return String(value).slice(0, 200_000);
    case "int":
    case "bigint": {
      const n = Math.round(Number(value));
      if (!Number.isFinite(n)) throw new Error("not a number");
      return n;
    }
    case "float": {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new Error("not a number");
      return n;
    }
    case "bool":
      return Boolean(value);
    case "json":
      return JSON.stringify(value);
    case "text[]":
      if (!Array.isArray(value)) throw new Error("not a list");
      return value.map(String);
  }
}

function fromDbValue(value: unknown, kind: Kind): unknown {
  if (value === null || value === undefined) return null;
  switch (kind) {
    case "int":
    case "bigint":
    case "float":
      return Number(value);
    case "json":
      return typeof value === "string" ? JSON.parse(value) : value;
    default:
      return value;
  }
}

export function rowToDb(spec: TableSpec, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of spec.columns) out[col.column] = toDbValue(row[col.field], col.kind);
  return out;
}

export function dbToRow(spec: TableSpec, record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of spec.columns) out[col.field] = fromDbValue(record[col.column], col.kind);
  out.key = spec.key(out);
  if (!spec.versioned) out.updatedAt = Number(out.createdAt ?? out.foundAt ?? out.setAt ?? out.reviewedAt ?? 0);
  return out;
}

/** An upsert that only overwrites when the incoming row is at least as new. */
export function upsertSql(spec: TableSpec): string {
  const cols = ["user_id", ...spec.columns.map((c) => c.column)];
  const placeholders = cols.map((_, i) => {
    const kind = i === 0 ? "uuid" : spec.columns[i - 1]!.kind;
    const cast = kind === "json" ? "::jsonb" : kind === "text[]" ? "::text[]" : kind === "uuid" ? "::uuid" : "";
    return `$${i + 1}${cast}`;
  });
  const conflict = ["user_id", ...spec.pk].join(", ");
  if (spec.appendOnly) {
    return `insert into public.${spec.sql} (${cols.join(", ")}) values (${placeholders.join(", ")}) on conflict (${conflict}) do nothing`;
  }
  const updates = spec.columns.filter((c) => !spec.pk.includes(c.column)).map((c) => `${c.column} = excluded.${c.column}`);
  return (
    `insert into public.${spec.sql} (${cols.join(", ")}) values (${placeholders.join(", ")}) ` +
    `on conflict (${conflict}) do update set ${updates.join(", ")} where public.${spec.sql}.updated_at <= excluded.updated_at`
  );
}
