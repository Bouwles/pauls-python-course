// The ppc CLI (Section 10.5) signs in with a device code and then sends a
// Bearer token. Tokens and device codes are stored hashed.
import { createHash, randomBytes, randomInt } from "node:crypto";
import { getDb } from "./db";
import { getSessionUser, type SessionUser } from "./auth";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const DEVICE_MINUTES = 15;
// No vowels or look-alikes, so codes never spell words and are easy to read aloud.
const CODE_CHARS = "BCDFGHJKLMNPQRSTVWXZ";

export function newUserCode(): string {
  const pick = () => Array.from({ length: 4 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
  return `${pick()}-${pick()}`;
}

export async function startDeviceFlow(): Promise<{ deviceCode: string; userCode: string; expiresIn: number }> {
  const db = await getDb();
  const deviceCode = randomBytes(32).toString("base64url");
  for (let attempt = 0; ; attempt++) {
    const userCode = newUserCode();
    try {
      await db.asService((q) =>
        q("insert into public.device_codes (device_code_hash, user_code, expires_at) values ($1, $2, now() + ($3 || ' minutes')::interval)", [sha256(deviceCode), userCode, String(DEVICE_MINUTES)]),
      );
      return { deviceCode, userCode, expiresIn: DEVICE_MINUTES * 60 };
    } catch (err) {
      if (attempt > 4) throw err;
    }
  }
}

export function normaliseUserCode(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z]/g, "");
  return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4)}` : raw.trim().toUpperCase();
}

/** The learner, signed in on the site, approves the code their terminal shows. */
export async function approveDeviceCode(userId: string, rawCode: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db.asService((q) =>
    q("update public.device_codes set user_id = $1, approved_at = now() where user_code = $2 and expires_at > now() and approved_at is null returning user_code", [userId, normaliseUserCode(rawCode)]),
  );
  return rows.length === 1;
}

export type TokenPoll = { status: "ok"; token: string } | { status: "pending" | "expired" | "invalid" };

/** The CLI polls with its device code; once approved it gets a token, once. */
export async function pollDeviceCode(deviceCode: string): Promise<TokenPoll> {
  const db = await getDb();
  return db.asService(async (q) => {
    const rows = await q<{ user_id: string | null; expired: boolean; claimed_at: string | null }>(
      "select user_id, expires_at < now() as expired, claimed_at from public.device_codes where device_code_hash = $1",
      [sha256(deviceCode)],
    );
    const row = rows[0];
    if (!row || row.claimed_at) return { status: "invalid" as const };
    if (row.expired) return { status: "expired" as const };
    if (!row.user_id) return { status: "pending" as const };
    const token = `ppc_${randomBytes(32).toString("base64url")}`;
    await q("update public.device_codes set claimed_at = now() where device_code_hash = $1", [sha256(deviceCode)]);
    await q("insert into public.api_tokens (user_id, token_hash) values ($1, $2)", [row.user_id, sha256(token)]);
    return { status: "ok" as const, token };
  });
}

export async function userFromBearer(req: Request): Promise<SessionUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(ppc_[A-Za-z0-9_-]{20,})$/.exec(header);
  if (!m) return null;
  const db = await getDb();
  const rows = await db.asService((q) =>
    q<{ id: string; email: string }>(
      "update public.api_tokens t set last_used_at = now() from auth.users u where t.token_hash = $1 and u.id = t.user_id returning u.id, u.email",
      [sha256(m[1]!)],
    ),
  );
  return rows[0] ?? null;
}

/** A signed-in learner: the ppc CLI's Bearer token, or the site's session. */
export async function requestUser(req: Request): Promise<SessionUser | null> {
  return (await userFromBearer(req)) ?? (await getSessionUser());
}
