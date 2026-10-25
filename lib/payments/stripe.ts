// Stripe Billing behind the same interface: Checkout, the Customer Portal and webhooks.
// Stripe is not a merchant of record, so the owner handles sales tax (Stripe Tax helps).
// Owner action, if choosing Stripe: set PAYMENTS_PROVIDER=stripe, STRIPE_SECRET_KEY,
// STRIPE_WEBHOOK_SECRET and the NEXT_PUBLIC_PRICE_* ids in .env.
import { verifyStripe } from "./signing";
import { isPaidPlan, planForPrice, priceFor } from "./prices";
import { ProviderError, type BillingEvent, type PaymentsProvider, type SubscriptionStatus } from "./types";

function form(params: Record<string, string | number | undefined | null>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

async function call<T>(method: string, path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY ?? ""}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params ? form(params) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new ProviderError(json.error?.message ?? `Stripe ${method} ${path} failed (${res.status}).`);
  return json;
}

const STATUS: Record<string, SubscriptionStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  incomplete: "past_due",
  incomplete_expired: "expired",
  paused: "past_due",
};

interface StripeSubscription {
  id: string;
  status: string;
  customer: string;
  current_period_end?: number;
  cancel_at?: number | null;
  metadata?: { user_id?: string; plan?: string; class_id?: string };
  items?: { data?: { price?: { id?: string }; quantity?: number; current_period_end?: number }[] };
}

export function stripeEvents(payload: { id: string; type: string; created: number; data: { object: Record<string, unknown> } }): BillingEvent[] {
  const occurredAt = new Date(payload.created * 1000).toISOString();
  const type = payload.type;
  if (type.startsWith("customer.subscription.")) {
    const s = payload.data.object as unknown as StripeSubscription;
    const item = s.items?.data?.[0];
    const plan = (isPaidPlan(s.metadata?.plan) ? s.metadata!.plan : null) ?? planForPrice(item?.price?.id);
    const end = item?.current_period_end ?? s.current_period_end ?? s.cancel_at ?? null;
    const status = type === "customer.subscription.deleted" ? "canceled" : (STATUS[s.status] ?? "expired");
    const base = { id: payload.id, type, userId: s.metadata?.user_id ?? null, plan, status, periodEnd: end ? new Date(end * 1000).toISOString() : null, customerId: s.customer, subscriptionId: s.id, occurredAt } as const;
    if (plan === "classroom") return [{ ...base, kind: "seats", seats: item?.quantity ?? 1, classId: s.metadata?.class_id ?? null }];
    return [{ ...base, kind: "subscription" }];
  }
  if (type === "checkout.session.completed") {
    const c = payload.data.object as { mode?: string; client_reference_id?: string; customer?: string; metadata?: { plan?: string } };
    if (c.mode === "payment" && c.metadata?.plan === "founder") {
      return [{ id: payload.id, type, kind: "founder", userId: c.client_reference_id ?? null, plan: "founder", status: "active", periodEnd: null, customerId: c.customer ?? null, subscriptionId: null, occurredAt }];
    }
  }
  return [{ id: payload.id, type, kind: "ignore", userId: null, plan: null, status: null, periodEnd: null, customerId: null, subscriptionId: null, occurredAt }];
}

export const stripe: PaymentsProvider = {
  name: "stripe",
  configured: () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
  async createCheckout(input) {
    const price = priceFor(input.plan);
    if (!price) throw new ProviderError(`No Stripe price id for ${input.plan}.`);
    const oneOff = input.plan === "founder";
    const meta = { user_id: input.userId, plan: input.plan, class_id: input.classId ?? undefined };
    const s = await call<{ url: string }>("POST", "/checkout/sessions", {
      mode: oneOff ? "payment" : "subscription",
      "line_items[0][price]": price,
      "line_items[0][quantity]": input.plan === "classroom" ? (input.seats ?? 1) : 1,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.userId,
      customer_email: input.email,
      allow_promotion_codes: "true",
      ...Object.fromEntries(Object.entries(meta).map(([k, v]) => [oneOff ? `metadata[${k}]` : `subscription_data[metadata][${k}]`, v])),
      ...(oneOff ? {} : { "metadata[plan]": input.plan }),
    });
    return { url: s.url };
  },
  async createPortalSession(input) {
    if (!input.customerId) throw new ProviderError("No Stripe customer for this account yet.");
    const s = await call<{ url: string }>("POST", "/billing_portal/sessions", { customer: input.customerId, return_url: input.returnUrl });
    return { url: s.url };
  },
  async handleWebhook(rawBody, headers) {
    verifyStripe(process.env.STRIPE_WEBHOOK_SECRET ?? "", headers.get("stripe-signature"), rawBody);
    return stripeEvents(JSON.parse(rawBody));
  },
  async getSubscription(id) {
    const s = await call<StripeSubscription>("GET", `/subscriptions/${id}`);
    const end = s.items?.data?.[0]?.current_period_end ?? s.current_period_end ?? null;
    return { status: STATUS[s.status] ?? "expired", periodEnd: end ? new Date(end * 1000).toISOString() : null };
  },
};
