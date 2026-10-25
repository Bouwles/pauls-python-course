// Webhook signature checks, shared by the providers. Constant-time comparisons, and old
// timestamps refused so a captured request can't be replayed.
import { createHmac, timingSafeEqual } from "node:crypto";
import { SignatureError } from "./types";

export const TOLERANCE_SECONDS = 300;

export function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Parses "k1=v1;k2=v2" or "k1=v1,k2=v2" headers into pairs (keys can repeat, as Stripe's v1 does). */
export function parseSignatureHeader(header: string | null, sep: string): [string, string][] {
  if (!header) return [];
  return header.split(sep).map((part) => {
    const i = part.indexOf("=");
    return [part.slice(0, i).trim(), part.slice(i + 1).trim()] as [string, string];
  });
}

export function checkTimestamp(ts: number, now = Date.now()) {
  if (!Number.isFinite(ts) || Math.abs(now / 1000 - ts) > TOLERANCE_SECONDS) throw new SignatureError("Webhook timestamp out of range.");
}

/** Paddle: `Paddle-Signature: ts=...;h1=...`, the HMAC of `${ts}:${body}`. */
export function verifyPaddle(secret: string, header: string | null, body: string, now = Date.now()) {
  const pairs = parseSignatureHeader(header, ";");
  const ts = Number(pairs.find(([k]) => k === "ts")?.[1]);
  const h1s = pairs.filter(([k]) => k === "h1").map(([, v]) => v);
  checkTimestamp(ts, now);
  const want = hmacHex(secret, `${ts}:${body}`);
  if (!h1s.some((h) => safeEqual(h, want))) throw new SignatureError("Bad Paddle signature.");
}

/** Stripe: `Stripe-Signature: t=...,v1=...`, the HMAC of `${t}.${body}`. */
export function verifyStripe(secret: string, header: string | null, body: string, now = Date.now()) {
  const pairs = parseSignatureHeader(header, ",");
  const t = Number(pairs.find(([k]) => k === "t")?.[1]);
  const v1s = pairs.filter(([k]) => k === "v1").map(([, v]) => v);
  checkTimestamp(t, now);
  const want = hmacHex(secret, `${t}.${body}`);
  if (!v1s.some((v) => safeEqual(v, want))) throw new SignatureError("Bad Stripe signature.");
}

/** Sandbox: the same shape as Paddle's, with the sandbox secret. */
export function signSandbox(secret: string, body: string, now = Date.now()): string {
  const ts = Math.floor(now / 1000);
  return `ts=${ts};h1=${hmacHex(secret, `${ts}:${body}`)}`;
}
