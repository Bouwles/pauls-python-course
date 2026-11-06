// Records funnel events. Never throws: analytics must not break a request.
import type { FunnelEvent } from "../funnel";
import type { Db } from "./db";

export async function recordFunnel(db: Db, event: FunnelEvent, who: { userId?: string | null; visitor?: string | null }) {
  try {
    await db.asService((q) => q("insert into public.funnel_events (event, visitor, user_id) values ($1, $2, $3)", [event, who.visitor ?? null, who.userId ?? null]));
  } catch (e) {
    console.error("[funnel]", e);
  }
}

export interface WeekRow {
  week: string;
  counts: Record<string, number>;
}

/** Distinct people per event per week, for the last `weeks` weeks (Monday-based). */
export async function weeklyFunnel(db: Db, weeks = 8): Promise<WeekRow[]> {
  const rows = await db.asService((q) =>
    q<{ week: string; event: string; people: number }>(
      `select to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week, event,
              count(distinct coalesce(user_id::text, visitor))::int as people
       from public.funnel_events
       where created_at > now() - ($1 || ' weeks')::interval
       group by 1, 2 order by 1 desc`,
      [String(weeks)],
    ),
  );
  const byWeek = new Map<string, Record<string, number>>();
  for (const r of rows) byWeek.set(r.week, { ...(byWeek.get(r.week) ?? {}), [r.event]: r.people });
  return [...byWeek].map(([week, counts]) => ({ week, counts }));
}

/** Everyone ever, per event: the all-time funnel. */
export async function totalFunnel(db: Db): Promise<Record<string, number>> {
  const rows = await db.asService((q) => q<{ event: string; people: number }>("select event, count(distinct coalesce(user_id::text, visitor))::int as people from public.funnel_events group by event"));
  return Object.fromEntries(rows.map((r) => [r.event, r.people]));
}
