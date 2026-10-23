// Shared bits for route handlers.
import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "./auth";
import { clientIp, rateLimit } from "./rate-limit";

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Refuse state-changing requests from other sites (belt and braces with SameSite cookies). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers, and server-to-server
  try {
    return new URL(origin).host === new URL(req.url).host || origin === process.env.NEXT_PUBLIC_SITE_URL;
  } catch {
    return false;
  }
}

export function originOf(req: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
}

export async function requireUser(): Promise<SessionUser | Response> {
  const user = await getSessionUser();
  return user ?? json({ error: "Not signed in." }, 401);
}

export function limited(req: Request, name: string, limit: number, windowMs: number): Response | null {
  const r = rateLimit(`${name}:${clientIp(req)}`, limit, windowMs);
  return r.ok ? null : json({ error: "Too many attempts. Wait a minute and try again." }, 429, { "Retry-After": String(r.retryAfter) });
}

export async function readJson<T>(req: Request, maxBytes = 2_000_000): Promise<T | null> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
