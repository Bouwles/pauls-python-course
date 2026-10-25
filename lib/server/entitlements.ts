// Who has Pro (REDESIGN.md 8.1, 8.3). Webhooks write the entitlements; this reads them.
// Pro comes from a subscription (active, trialing, or past due within the 7-day grace
// period, or cancelled but paid up to the end of the period), a founding member
// purchase, or a classroom seat that hasn't expired.
import type { JobSummary } from "../content/types";
import { FREE_ACTS, type PlanId } from "../plans";
import type { Db } from "./db";

export const GRACE_DAYS = 7;
const DAY = 86_400_000;

export interface EntitlementRow {
  user_id: string;
  plan: Exclude<PlanId, "free" | "classroom">;
  status: "active" | "trialing" | "past_due" | "canceled" | "expired";
  current_period_end: string | Date | null;
  provider: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
}

export interface Access {
  pro: boolean;
  /** How Pro was got, or null on the free plan. */
  via: "subscription" | "founder" | "seat" | null;
  plan: PlanId;
  status: EntitlementRow["status"] | null;
  periodEnd: string | null;
  /** Past due, still inside the grace period: Pro stays on, with one calm banner in Settings. */
  grace: boolean;
  provider: string | null;
}

export const FREE: Access = { pro: false, via: null, plan: "free", status: null, periodEnd: null, grace: false, provider: null };

const time = (v: string | Date | null) => (v ? new Date(v).getTime() : null);

/** The rule itself, separate from the database so it can be tested on its own. */
export function accessFrom(row: EntitlementRow | null, seatUntil: string | Date | null, now = Date.now()): Access {
  if (row) {
    const end = time(row.current_period_end);
    const periodEnd = end ? new Date(end).toISOString() : null;
    const base = { plan: row.plan, status: row.status, periodEnd, provider: row.provider };
    if (row.plan === "founder" && row.status !== "expired") return { ...base, pro: true, via: "founder", grace: false };
    if (row.status === "active" || row.status === "trialing") return { ...base, pro: true, via: "subscription", grace: false };
    if (row.status === "past_due" && end !== null && now < end + GRACE_DAYS * DAY) return { ...base, pro: true, via: "subscription", grace: true };
    if (row.status === "canceled" && end !== null && now < end) return { ...base, pro: true, via: "subscription", grace: false };
    const seat = time(seatUntil);
    if (seat && now < seat) return { ...base, pro: true, via: "seat", grace: false };
    return { ...base, pro: false, via: null, grace: false };
  }
  const seat = time(seatUntil);
  if (seat && now < seat) return { ...FREE, pro: true, via: "seat", plan: "classroom", periodEnd: new Date(seat).toISOString() };
  return FREE;
}

export async function getAccess(db: Db, userId: string | null): Promise<Access> {
  if (!userId) return FREE;
  return db.asService(async (q) => {
    const [row] = await q<EntitlementRow>("select * from public.entitlements where user_id = $1", [userId]);
    const [seat] = await q<{ until: string | null }>(
      "select max(p.expires_at) as until from public.seat_grants g join public.seat_pools p on p.id = g.pool_id where g.user_id = $1",
      [userId],
    );
    return accessFrom(row ?? null, seat?.until ?? null);
  });
}

/** Everything after the free Act needs Pro. */
export function isProJob(job: Pick<JobSummary, "act">): boolean {
  return !FREE_ACTS.has(job.act);
}

export type JobAccess =
  | { open: true }
  /** The first project of a Pro Act: its Ask is a free preview, the rest is locked. */
  | { open: false; preview: true }
  | { open: false; preview: false };

/**
 * Can this learner open this project? Free projects always. Pro projects with Pro, or if they
 * started it while they had Pro: your work is always yours, so a lapsed learner keeps what they began.
 */
export async function jobAccess(db: Db, userId: string | null, job: JobSummary, firstInAct: boolean): Promise<JobAccess> {
  if (!isProJob(job)) return { open: true };
  if ((await getAccess(db, userId)).pro) return { open: true };
  if (userId) {
    const started = await db.asService((q) => q("select 1 from public.job_progress where user_id = $1 and job_id = $2 and status <> 'not-started' limit 1", [userId, job.id]));
    if (started.length) return { open: true };
  }
  return { open: false, preview: firstInAct };
}
