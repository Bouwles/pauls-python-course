// The payments seam (REDESIGN.md 8.3): the app talks to this interface, never to a provider
// directly, so the provider can change without touching anything else.
import type { PlanId } from "../plans";

export type ProviderName = "paddle" | "stripe" | "sandbox";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "expired";

export interface CheckoutInput {
  userId: string;
  email: string;
  plan: Exclude<PlanId, "free">;
  /** Classroom only: how many seats, and for which class. */
  seats?: number;
  classId?: string | null;
  successUrl: string;
  cancelUrl: string;
}

/** A provider's webhook event, reduced to what the app needs. */
export interface BillingEvent {
  id: string;
  type: string;
  kind: "subscription" | "founder" | "seats" | "ignore";
  userId: string | null;
  plan: Exclude<PlanId, "free"> | null;
  status: SubscriptionStatus | null;
  periodEnd: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  seats?: number;
  classId?: string | null;
  /** When the provider says it happened, so a late-arriving older event can't undo a newer one. */
  occurredAt: string;
}

export interface PaymentsProvider {
  name: ProviderName;
  /** Has the owner added the keys this provider needs? */
  configured(): boolean;
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  createPortalSession(input: { userId: string; customerId: string | null; returnUrl: string }): Promise<{ url: string }>;
  /** Verifies the signature (throws SignatureError if it's wrong) and returns the events. */
  handleWebhook(rawBody: string, headers: Headers): Promise<BillingEvent[]>;
  getSubscription(subscriptionId: string): Promise<{ status: SubscriptionStatus; periodEnd: string | null } | null>;
}

export class SignatureError extends Error {}
export class ProviderError extends Error {}
