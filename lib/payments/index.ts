// Picks the payments provider from config (REDESIGN.md 8.3, DECISIONS.md): Paddle, a merchant
// of record, by default in production; the sandbox in development and tests; Stripe on request.
import { paddle } from "./paddle";
import { stripe } from "./stripe";
import { sandbox } from "./sandbox";
import type { PaymentsProvider, ProviderName } from "./types";

const PROVIDERS: Record<ProviderName, PaymentsProvider> = { paddle, stripe, sandbox };

export function providerName(): ProviderName {
  const p = process.env.PAYMENTS_PROVIDER;
  if (p === "paddle" || p === "stripe" || p === "sandbox") return p;
  return process.env.NODE_ENV === "production" ? "paddle" : "sandbox";
}

export function getProvider(name: string = providerName()): PaymentsProvider | null {
  return name in PROVIDERS ? PROVIDERS[name as ProviderName] : null;
}

export type { PaymentsProvider, BillingEvent, ProviderName } from "./types";
