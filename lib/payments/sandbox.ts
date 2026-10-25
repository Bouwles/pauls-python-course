// A pretend provider for local development and tests, so subscribing, renewing, failing a
// payment and cancelling all work end to end before the owner has any provider account.
// Its "checkout" is a page on this site; its webhooks are signed like Paddle's and go
// through the same handler as real ones. Refused in production unless chosen on purpose.
import { createHmac } from "node:crypto";
import { hmacHex, safeEqual, verifyPaddle } from "./signing";
import { ProviderError, SignatureError, type BillingEvent, type CheckoutInput, type PaymentsProvider } from "./types";

export function sandboxSecret(): string {
  return process.env.SANDBOX_PAYMENTS_SECRET ?? "fixwick-sandbox-not-for-production";
}

export function sandboxAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.PAYMENTS_PROVIDER === "sandbox";
}

export interface SandboxSession {
  userId: string;
  plan: CheckoutInput["plan"];
  seats?: number;
  classId?: string | null;
  successUrl: string;
  exp: number;
}

export function sealSession(s: SandboxSession): string {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${body}.${createHmac("sha256", sandboxSecret()).update(body).digest("base64url")}`;
}

export function openSession(token: string, now = Date.now()): SandboxSession | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const want = createHmac("sha256", sandboxSecret()).update(body).digest("base64url");
  if (!safeEqual(mac, want)) return null;
  const s = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SandboxSession;
  return s.exp > now ? s : null;
}

export const sandbox: PaymentsProvider = {
  name: "sandbox",
  configured: () => sandboxAllowed(),
  async createCheckout(input) {
    if (!sandboxAllowed()) throw new ProviderError("The sandbox provider is off in production.");
    const token = sealSession({ userId: input.userId, plan: input.plan, seats: input.seats, classId: input.classId ?? null, successUrl: input.successUrl, exp: Date.now() + 60 * 60 * 1000 });
    return { url: `/pricing/sandbox?t=${encodeURIComponent(token)}` };
  },
  async createPortalSession() {
    if (!sandboxAllowed()) throw new ProviderError("The sandbox provider is off in production.");
    return { url: "/pricing/sandbox?portal=1" };
  },
  async handleWebhook(rawBody, headers) {
    if (!sandboxAllowed()) throw new SignatureError("The sandbox provider is off in production.");
    verifyPaddle(sandboxSecret(), headers.get("sandbox-signature"), rawBody);
    return (JSON.parse(rawBody) as { events: BillingEvent[] }).events;
  },
  async getSubscription() {
    return null;
  },
};

/** Builds a signed sandbox webhook delivery, as the sandbox "provider" would send it. */
export function sandboxDelivery(events: BillingEvent[], now = Date.now()): { body: string; headers: Headers } {
  const body = JSON.stringify({ events });
  const ts = Math.floor(now / 1000);
  return { body, headers: new Headers({ "sandbox-signature": `ts=${ts};h1=${hmacHex(sandboxSecret(), `${ts}:${body}`)}` }) };
}
