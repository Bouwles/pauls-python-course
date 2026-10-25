// Sign-in, in two modes:
// - Supabase (when NEXT_PUBLIC_SUPABASE_URL is set): email/password, magic link, Google, GitHub.
// - Local (otherwise): email/password and magic link, implemented here, so the app
//   runs end to end before any accounts exist. Magic links appear at /dev/mailbox.
import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./db";
import { BRAND } from "../brand";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export interface SessionUser {
  id: string;
  email: string;
}

export type AuthResult = { ok: true; user: SessionUser } | { ok: false; error: string };

export const SESSION_COOKIE = "ppc_session";
const SESSION_DAYS = 30;
const MAGIC_MINUTES = 15;

export const supabaseEnabled = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function oauthProviders(): ("google" | "github")[] {
  if (!supabaseEnabled()) return [];
  return (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS ?? "google,github")
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is "google" | "github" => p === "google" || p === "github");
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Use at least 10 characters.";
  if (password.length > 200) return "That password is longer than we can store.";
  return null;
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

async function supabaseServer() {
  const { createServerClient } = await import("@supabase/ssr");
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component; the session is refreshed on the next route handler call.
        }
      },
    },
  });
}

export async function supabaseAdmin() {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is needed to delete accounts.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Local
// ---------------------------------------------------------------------------

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("base64")}$${key.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [scheme, n, r, p, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const key = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

async function startLocalSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const db = await getDb();
  await db.asService((q) =>
    q("insert into local_auth.sessions (token_hash, user_id, expires_at) values ($1, $2, now() + ($3 || ' days')::interval)", [sha256(token), userId, String(SESSION_DAYS)]),
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}

async function localUserByEmail(email: string) {
  const db = await getDb();
  const rows = await db.asService((q) => q<{ id: string; email: string; encrypted_password: string | null }>("select id, email, encrypted_password from auth.users where email = $1", [email]));
  return rows[0] ?? null;
}

async function createLocalUser(email: string, password: string | null): Promise<SessionUser> {
  const db = await getDb();
  const hash = password ? await hashPassword(password) : null;
  const rows = await db.asService((q) =>
    q<{ id: string; email: string }>("insert into auth.users (email, encrypted_password, email_confirmed_at) values ($1, $2, now()) returning id, email", [email, hash]),
  );
  return rows[0]!;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getSessionUser(): Promise<SessionUser | null> {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const rows = await db.asService((q) =>
    q<{ id: string; email: string }>(
      "select u.id, u.email from local_auth.sessions s join auth.users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now()",
      [sha256(token)],
    ),
  );
  return rows[0] ?? null;
}

export async function signUp(emailRaw: string, password: string, origin: string): Promise<AuthResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!validEmail(email)) return { ok: false, error: "That email address doesn't look right." };
  const problem = passwordProblem(password);
  if (problem) return { ok: false, error: problem };
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback` } });
    if (error || !data.user) return { ok: false, error: error?.message ?? "Sign-up failed." };
    return { ok: true, user: { id: data.user.id, email } };
  }
  if (await localUserByEmail(email)) return { ok: false, error: "There's already an account with that email. Try logging in." };
  const user = await createLocalUser(email, password);
  await startLocalSession(user.id);
  return { ok: true, user };
}

export async function signIn(emailRaw: string, password: string): Promise<AuthResult> {
  const email = emailRaw.trim().toLowerCase();
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, error: "That email and password don't match." };
    return { ok: true, user: { id: data.user.id, email } };
  }
  const user = await localUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.encrypted_password))) {
    return { ok: false, error: "That email and password don't match." };
  }
  await startLocalSession(user.id);
  return { ok: true, user: { id: user.id, email: user.email } };
}

export async function signOut(): Promise<void> {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
    return;
  }
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.asService((q) => q("delete from local_auth.sessions where token_hash = $1", [sha256(token)]));
  }
  store.delete(SESSION_COOKIE);
}

/** Sends a sign-in link. Creates the account on first use, like Supabase does. */
export async function sendMagicLink(emailRaw: string, origin: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  if (!validEmail(email)) return { ok: false, error: "That email address doesn't look right." };
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback` } });
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const token = randomBytes(32).toString("base64url");
  const link = `${origin}/auth/magic?token=${token}`;
  const db = await getDb();
  await db.asService(async (q) => {
    await q("insert into local_auth.magic_links (token_hash, email, expires_at) values ($1, $2, now() + ($3 || ' minutes')::interval)", [sha256(token), email, String(MAGIC_MINUTES)]);
    await q("insert into local_auth.mailbox (to_email, subject, body, link) values ($1, $2, $3, $4)", [
      email,
      `Your link to ${BRAND.townName}`,
      `Moss says: here's your way in. The link works once, for ${MAGIC_MINUTES} minutes.`,
      link,
    ]);
  });
  console.log(`[local auth] magic link for ${email}: ${link}`);
  return { ok: true };
}

export async function verifyMagicLink(token: string): Promise<AuthResult> {
  const db = await getDb();
  const rows = await db.asService((q) =>
    q<{ email: string }>(
      "update local_auth.magic_links set used_at = now() where token_hash = $1 and used_at is null and expires_at > now() returning email",
      [sha256(token)],
    ),
  );
  const email = rows[0]?.email;
  if (!email) return { ok: false, error: "That link has expired or has already been used." };
  const existing = await localUserByEmail(email);
  const user = existing ? { id: existing.id, email: existing.email } : await createLocalUser(email, null);
  await startLocalSession(user.id);
  return { ok: true, user };
}

export async function exchangeSupabaseCode(code: string): Promise<boolean> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return !error;
}

export async function oauthUrl(provider: "google" | "github", origin: string): Promise<string | null> {
  if (!supabaseEnabled()) return null;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${origin}/auth/callback` } });
  return error ? null : data.url;
}

export async function changePassword(user: SessionUser, current: string, next: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const problem = passwordProblem(next);
  if (problem) return { ok: false, error: problem };
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.updateUser({ password: next });
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const row = await localUserByEmail(user.email);
  if (row?.encrypted_password && !(await verifyPassword(current, row.encrypted_password))) {
    return { ok: false, error: "The current password isn't right." };
  }
  const hash = await hashPassword(next);
  const db = await getDb();
  await db.asService((q) => q("update auth.users set encrypted_password = $1 where id = $2", [hash, user.id]));
  return { ok: true };
}

/** Deletes the account. Every learner table cascades from auth.users. */
export async function deleteAccount(user: SessionUser): Promise<void> {
  if (supabaseEnabled()) {
    const admin = await supabaseAdmin();
    await admin.auth.admin.deleteUser(user.id);
    await signOut();
    return;
  }
  const db = await getDb();
  await db.asService((q) => q("delete from auth.users where id = $1", [user.id]));
  (await cookies()).delete(SESSION_COOKIE);
}
