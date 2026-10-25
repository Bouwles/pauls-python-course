import { randomUUID } from "node:crypto";
import { getProvider } from "@/lib/payments";
import { applyEvents } from "@/lib/payments/apply";
import { openSession, sandboxAllowed, sandboxDelivery } from "@/lib/payments/sandbox";
import type { BillingEvent } from "@/lib/payments/types";
import { getDb } from "@/lib/server/db";
import { json, readJson, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

/**
 * The sandbox provider's side (development and tests only): "pay" finishes a pretend
 * checkout; the portal actions renew, fail a payment, cancel or expire. Each one is sent as a
 * signed webhook through the same handler a real provider's would go through.
 */
export async function POST(req: Request) {
  if (!sandboxAllowed()) return json({ error: "Not here." }, 404);
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ action?: string; token?: string }>(req, 8_000);
  const db = await getDb();
  const now = Date.now();
  const event = (over: Partial<BillingEvent>): BillingEvent => ({
    id: `sb_${randomUUID()}`,
    type: "subscription.updated",
    kind: "subscription",
    userId: user.id,
    plan: "pro-monthly",
    status: "active",
    periodEnd: new Date(now + 30 * DAY).toISOString(),
    customerId: `sbcus_${user.id.slice(0, 8)}`,
    subscriptionId: `sbsub_${user.id.slice(0, 8)}`,
    occurredAt: new Date(now).toISOString(),
    ...over,
  });

  let events: BillingEvent[];
  let redirect: string | null = null;
  if (body?.action === "pay") {
    const s = body.token ? openSession(body.token) : null;
    if (!s || s.userId !== user.id) return json({ error: "That checkout has expired. Start again from the pricing page." }, 400);
    const days = s.plan === "pro-yearly" || s.plan === "classroom" ? 365 : 30;
    if (s.plan === "founder") events = [event({ type: "transaction.completed", kind: "founder", plan: "founder", periodEnd: null, subscriptionId: null })];
    else if (s.plan === "classroom") events = [event({ type: "subscription.created", kind: "seats", plan: "classroom", seats: s.seats ?? 5, classId: s.classId ?? null, subscriptionId: `sbseats_${randomUUID().slice(0, 8)}`, periodEnd: new Date(now + days * DAY).toISOString() })];
    else events = [event({ type: "subscription.created", plan: s.plan, periodEnd: new Date(now + days * DAY).toISOString() })];
    redirect = s.successUrl;
  } else {
    const [row] = await db.asService((q) => q<{ plan: BillingEvent["plan"]; current_period_end: string | null }>("select plan, current_period_end from public.entitlements where user_id = $1", [user.id]));
    if (!row) return json({ error: "No sandbox subscription on this account." }, 404);
    const end = row.current_period_end ? new Date(row.current_period_end).toISOString() : new Date(now + 30 * DAY).toISOString();
    if (body?.action === "renew") events = [event({ plan: row.plan, periodEnd: new Date(now + 30 * DAY).toISOString() })];
    else if (body?.action === "fail-payment") events = [event({ type: "subscription.past_due", plan: row.plan, status: "past_due", periodEnd: new Date(now - DAY).toISOString() })];
    else if (body?.action === "cancel") events = [event({ type: "subscription.canceled", plan: row.plan, status: "canceled", periodEnd: end })];
    else if (body?.action === "expire") events = [event({ type: "subscription.canceled", plan: row.plan, status: "expired", periodEnd: new Date(now - DAY).toISOString() })];
    else return json({ error: "Unknown action." }, 400);
  }
  const delivery = sandboxDelivery(events);
  const handled = await getProvider("sandbox")!.handleWebhook(delivery.body, delivery.headers);
  const result = await applyEvents(db, "sandbox", handled);
  return json({ ok: true, redirect, ...result });
}
