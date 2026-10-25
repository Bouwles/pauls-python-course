// Paddle Billing, the default provider: a merchant of record, so Paddle handles sales tax and
// VAT, invoices, refunds and chargebacks for a solo seller. Plain fetch, no SDK.
// Owner action: create a Paddle account, then set PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET,
// PADDLE_ENV (sandbox or live) and the NEXT_PUBLIC_PRICE_* ids in .env.
import { verifyPaddle } from "./signing";
import { isPaidPlan, planForPrice, priceFor } from "./prices";
import { ProviderError, type BillingEvent, type PaymentsProvider, type SubscriptionStatus } from "./types";

const api = () => (process.env.PADDLE_ENV === "live" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com");

async function call<T>(method: string, path: string, body?: unknown, fetcher: typeof fetch = fetch): Promise<T> {
  const res = await fetcher(`${api()}${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY ?? ""}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { detail?: string } };
  if (!res.ok || !json.data) throw new ProviderError(json.error?.detail ?? `Paddle ${method} ${path} failed (${res.status}).`);
  return json.data;
}

const STATUS: Record<string, SubscriptionStatus> = { active: "active", trialing: "trialing", past_due: "past_due", paused: "past_due", canceled: "canceled" };

interface PaddleSubscription {
  id: string;
  status: string;
  customer_id: string;
  current_billing_period?: { ends_at?: string } | null;
  scheduled_change?: { action?: string; effective_at?: string } | null;
  custom_data?: { user_id?: string; plan?: string; class_id?: string } | null;
  items?: { price?: { id?: string }; quantity?: number }[];
}

export function paddleEvents(payload: { event_id: string; event_type: string; occurred_at: string; data: Record<string, unknown> }): BillingEvent[] {
  const type = payload.event_type;
  const d = payload.data as unknown as PaddleSubscription & { subscription_id?: string | null; origin?: string };
  const custom = d.custom_data ?? {};
  const priceId = d.items?.[0]?.price?.id;
  const plan = (isPaidPlan(custom.plan) ? custom.plan : null) ?? planForPrice(priceId);
  const base = { id: payload.event_id, type, userId: custom.user_id ?? null, plan, customerId: d.customer_id ?? null, occurredAt: payload.occurred_at };
  if (type.startsWith("subscription.")) {
    const status = STATUS[d.status] ?? "expired";
    const periodEnd = d.current_billing_period?.ends_at ?? d.scheduled_change?.effective_at ?? null;
    if (plan === "classroom") return [{ ...base, kind: "seats", status, periodEnd, subscriptionId: d.id, seats: d.items?.[0]?.quantity ?? 1, classId: custom.class_id ?? null }];
    return [{ ...base, kind: "subscription", status, periodEnd, subscriptionId: d.id }];
  }
  // A one-off purchase (the founding member offer) arrives as a completed transaction.
  if (type === "transaction.completed" && plan === "founder") return [{ ...base, kind: "founder", status: "active", periodEnd: null, subscriptionId: null }];
  return [{ ...base, kind: "ignore", status: null, periodEnd: null, subscriptionId: null }];
}

export const paddle: PaymentsProvider = {
  name: "paddle",
  configured: () => Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_WEBHOOK_SECRET),
  async createCheckout(input) {
    const price = priceFor(input.plan);
    if (!price) throw new ProviderError(`No Paddle price id for ${input.plan}.`);
    const tx = await call<{ checkout?: { url?: string } }>("POST", "/transactions", {
      items: [{ price_id: price, quantity: input.plan === "classroom" ? (input.seats ?? 1) : 1 }],
      custom_data: { user_id: input.userId, plan: input.plan, class_id: input.classId ?? null },
      checkout: { url: input.successUrl },
    });
    if (!tx.checkout?.url) throw new ProviderError("Paddle didn't return a checkout link. Set a default payment link in the Paddle dashboard.");
    return { url: tx.checkout.url };
  },
  async createPortalSession(input) {
    if (!input.customerId) throw new ProviderError("No Paddle customer for this account yet.");
    const s = await call<{ urls?: { general?: { overview?: string } } }>("POST", `/customers/${input.customerId}/portal-sessions`, {});
    if (!s.urls?.general?.overview) throw new ProviderError("Paddle didn't return a portal link.");
    return { url: s.urls.general.overview };
  },
  async handleWebhook(rawBody, headers) {
    verifyPaddle(process.env.PADDLE_WEBHOOK_SECRET ?? "", headers.get("paddle-signature"), rawBody);
    return paddleEvents(JSON.parse(rawBody));
  },
  async getSubscription(id) {
    const s = await call<PaddleSubscription>("GET", `/subscriptions/${id}`);
    return { status: STATUS[s.status] ?? "expired", periodEnd: s.current_billing_period?.ends_at ?? null };
  },
};
