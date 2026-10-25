// Applies webhook events to the database (REDESIGN.md 8.3). Idempotent: each provider event
// id is stored, and a repeat delivery changes nothing. Out of order: an event older than the
// last one applied to an entitlement is skipped.
import type { Db } from "../server/db";
import type { BillingEvent } from "./types";

const YEAR = 365 * 86_400_000;

export async function applyEvents(db: Db, provider: string, events: BillingEvent[]): Promise<{ applied: number; duplicates: number; skipped: number }> {
  let applied = 0;
  let duplicates = 0;
  let skipped = 0;
  for (const e of events) {
    const outcome = await db.asService(async (q) => {
      const fresh = await q("insert into public.payment_events (provider, event_id, type) values ($1, $2, $3) on conflict do nothing returning event_id", [provider, e.id, e.type]);
      if (!fresh.length) return "duplicate";
      if (e.kind === "ignore" || !e.userId) return "skipped";
      if (e.kind === "seats") {
        const expires = e.periodEnd ?? new Date(Date.now() + YEAR).toISOString();
        const active = e.status === "active" || e.status === "trialing" || e.status === "past_due";
        await q(
          `insert into public.seat_pools (teacher_id, class_id, seats, expires_at, provider, provider_subscription_id)
           values ($1, $2, $3, $4, $5, $6)
           on conflict (provider_subscription_id) do update set seats = excluded.seats, expires_at = excluded.expires_at, class_id = coalesce(excluded.class_id, public.seat_pools.class_id)`,
          [e.userId, e.classId ?? null, Math.max(1, e.seats ?? 1), active ? expires : new Date().toISOString(), provider, e.subscriptionId],
        );
        return "applied";
      }
      const [row] = await q<{ event_time: string | null; status: string | null }>("select event_time, status from public.entitlements where user_id = $1", [e.userId]);
      if (row?.event_time && new Date(row.event_time).getTime() > new Date(e.occurredAt).getTime()) return "skipped";
      // The funnel's last two steps (REDESIGN.md 9.3), recorded as the provider reports them.
      const wasPaying = row?.status === "active" || row?.status === "trialing" || row?.status === "past_due";
      const nowPaying = e.status === "active" || e.status === "trialing";
      if (nowPaying && !wasPaying) await q("insert into public.funnel_events (event, user_id) values ('subscribe', $1)", [e.userId]);
      if (e.status === "canceled" && row?.status !== "canceled") await q("insert into public.funnel_events (event, user_id) values ('cancel', $1)", [e.userId]);
      await q(
        `insert into public.entitlements (user_id, plan, status, current_period_end, provider, provider_customer_id, provider_subscription_id, event_time, updated_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, now())
         on conflict (user_id) do update set plan = excluded.plan, status = excluded.status, current_period_end = excluded.current_period_end,
           provider = excluded.provider, provider_customer_id = coalesce(excluded.provider_customer_id, public.entitlements.provider_customer_id),
           provider_subscription_id = coalesce(excluded.provider_subscription_id, public.entitlements.provider_subscription_id),
           event_time = excluded.event_time, updated_at = now()`,
        [e.userId, e.plan ?? "pro-monthly", e.status ?? "expired", e.periodEnd, provider, e.customerId, e.subscriptionId, e.occurredAt],
      );
      return "applied";
    });
    if (outcome === "applied") applied++;
    else if (outcome === "duplicate") duplicates++;
    else skipped++;
  }
  return { applied, duplicates, skipped };
}

/** A learner who joins a class with seats takes one, if any are left. */
export async function claimSeat(db: Db, userId: string, classId: string): Promise<boolean> {
  return db.asService(async (q) => {
    const pools = await q<{ id: string; seats: number; taken: number }>(
      `select p.id, p.seats, (select count(*)::int from public.seat_grants g where g.pool_id = p.id) as taken
       from public.seat_pools p where p.class_id = $1 and p.expires_at > now() order by p.expires_at desc`,
      [classId],
    );
    for (const p of pools) {
      const mine = await q("select 1 from public.seat_grants where pool_id = $1 and user_id = $2", [p.id, userId]);
      if (mine.length) return true;
      if (p.taken < p.seats) {
        await q("insert into public.seat_grants (pool_id, user_id) values ($1, $2) on conflict do nothing", [p.id, userId]);
        return true;
      }
    }
    return false;
  });
}
