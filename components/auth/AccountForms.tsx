"use client";

// Accounts on the GitHub Pages site, with Supabase from the browser (lib/supabase): sign up with
// a username, an email and a password typed twice; confirm the email with the code or the link
// in it; log in; and reset a forgotten password. Confirming works on any device, since the
// email's code and link (a token_hash) need nothing kept in the browser that asked for it.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { BASE } from "@/lib/static";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/store/session";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import styles from "./AuthForm.module.css";

export const USERNAME = /^[a-z0-9_]{3,20}$/;
export const MIN_PASSWORD = 10;

/** Where the emails' links come back to: this site, wherever it's served from. */
const here = (path: string) => `${window.location.origin}${BASE}${path}`;

/** Only follow `next` within this site: "/path", never "//elsewhere" or "https://...". */
function safeNext(next: string | null, fallback = "/"): string {
  return next && /^\/(?![/\\])/.test(next) ? next : fallback;
}

/** Supabase's messages, in the site's words. */
function said(error: { message?: string; code?: string } | null | undefined): string {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) return "That email and password don't match an account.";
  if (code === "email_not_confirmed" || /not confirmed/i.test(message)) return "You need to confirm your email first, and the code is in the email we sent you.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || /rate limit/i.test(message)) return "That's too many tries for now, so wait a few minutes and try again.";
  if (code === "otp_expired" || /expired|invalid/i.test(message)) return "That code or link has expired or been used already, so send yourself a new one.";
  if (code === "weak_password") return `That password's too short, it needs to be at least ${MIN_PASSWORD} characters.`;
  if (code === "same_password") return "That's your current password, so pick a new one.";
  if (/database error saving new user/i.test(message)) return "Someone has just taken that username, so pick another.";
  if (/fetch|network/i.test(message)) return "Couldn't reach the server, so check your connection and try again.";
  return message || "That didn't work, give it another go in a moment.";
}

function Problem({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className={styles.error} role="alert">
      <Icon name="warning" />
      <span>{text}</span>
    </p>
  );
}

function PasswordFields({ password, setPassword, again, setAgain, label = "Password" }: { password: string; setPassword: (v: string) => void; again: string; setAgain: (v: string) => void; label?: string }) {
  const short = password.length > 0 && password.length < MIN_PASSWORD;
  const differ = again.length > 0 && again !== password;
  return (
    <>
      {/* Hints sit beside the label, not in it, so each box's name is just its label. */}
      <div className={styles.field}>
        <label htmlFor="pw-new" className="label">
          {label}
        </label>
        <input id="pw-new" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="pw-hint" aria-invalid={short || undefined} />
        <small id="pw-hint" className={styles.hint}>
          At least {MIN_PASSWORD} characters.
        </small>
      </div>
      <div className={styles.field}>
        <label htmlFor="pw-again-box" className="label">
          Type it again
        </label>
        <input id="pw-again-box" type="password" autoComplete="new-password" required value={again} onChange={(e) => setAgain(e.target.value)} aria-invalid={differ || undefined} aria-describedby={differ ? "pw-again" : undefined} />
        {differ ? (
          <small id="pw-again" className={styles.hint}>
            The two passwords don&apos;t match yet.
          </small>
        ) : null}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- sign up

type NameState = "empty" | "invalid" | "checking" | "free" | "taken" | "unknown";

export function SignUpForm() {
  const [username, setUsername] = useState("");
  const [nameState, setNameState] = useState<NameState>("empty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [age, setAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const asked = useRef(0);

  // Whether the name is free, a moment after typing stops.
  useEffect(() => {
    if (!username) return setNameState("empty");
    if (!USERNAME.test(username)) return setNameState("invalid");
    setNameState("checking");
    const seq = ++asked.current;
    const timer = setTimeout(async () => {
      const { data, error: e } = await supabase().rpc("username_available", { wanted: username });
      if (seq !== asked.current) return;
      setNameState(e ? "unknown" : data ? "free" : "taken");
    }, 350);
    return () => clearTimeout(timer);
  }, [username]);

  const ready = USERNAME.test(username) && nameState !== "taken" && nameState !== "checking" && email.includes("@") && password.length >= MIN_PASSWORD && password === again && age;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setError(null);
    setBusy(true);
    try {
      const { data: free } = await supabase().rpc("username_available", { wanted: username });
      if (free === false) {
        setNameState("taken");
        return;
      }
      const { data, error: e2 } = await supabase().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username }, emailRedirectTo: here("/account/confirm/") },
      });
      if (e2) return setError(said(e2));
      // With email confirmation off there's a session already; otherwise the email is on its way.
      if (data.session) return window.location.assign(here("/welcome/"));
      setSentTo(email.trim());
    } catch (err) {
      setError(said(err as Error));
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) return <ConfirmCode email={sentTo} />;

  const nameHint: Record<NameState, string> = {
    empty: "3 to 20 lower-case letters, numbers and _, and it's how your friends find you.",
    invalid: "Only lower-case letters, numbers and _, from 3 to 20 characters.",
    checking: "Checking.",
    free: "That one's free.",
    taken: "Someone's already got that one, so try another.",
    unknown: "Couldn't check that just now, but it gets checked again when you make the account.",
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label htmlFor="su-name" className="label">
          Username
        </label>
        <input
          id="su-name"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={20}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
          aria-describedby="name-hint"
          aria-invalid={nameState === "invalid" || nameState === "taken" || undefined}
        />
        <small id="name-hint" className={styles.hint} aria-live="polite">
          {nameHint[nameState]}
        </small>
      </div>
      <div className={styles.field}>
        <label htmlFor="su-email" className="label">
          Email
        </label>
        <input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby="email-hint" />
        <small id="email-hint" className={styles.hint}>
          We send a code to it to check it&apos;s yours.
        </small>
      </div>
      <PasswordFields password={password} setPassword={setPassword} again={again} setAgain={setAgain} />
      <div className={styles.age}>
        <label className={styles.check}>
          <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} required />
          <span>I&apos;m 13 or older.</span>
        </label>
        <p className={styles.hint}>If you&apos;re under 16, check with a parent or guardian first, because in some countries the law asks for their consent.</p>
      </div>
      <Problem text={error} />
      <Button type="submit" variant="primary" className={styles.submit} disabled={!ready || busy}>
        {busy ? "One moment" : "Make the account"}
      </Button>
      <p className={styles.switch}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------- confirming the email

/** "Check your email": type the code from it, or follow its link; and send it again. */
export function ConfirmCode({ email, then = "/welcome/" }: { email: string; then?: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useSession();

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\s/g, "");
    if (!/^\d{6,10}$/.test(token) || busy) return;
    setBusy(true);
    setError(null);
    let result = await supabase().auth.verifyOtp({ email, token, type: "email" });
    if (result.error) result = await supabase().auth.verifyOtp({ email, token, type: "signup" });
    setBusy(false);
    if (result.error) return setError(said(result.error));
    await refresh();
    window.location.assign(here(then));
  };

  const resend = async () => {
    setError(null);
    setNote(null);
    const { error: e } = await supabase().auth.resend({ type: "signup", email, options: { emailRedirectTo: here("/account/confirm/") } });
    if (e) setError(said(e));
    else setNote("Sent it again, but it can take a minute and it might end up in spam.");
  };

  return (
    <form className={styles.form} onSubmit={verify} noValidate>
      <div className={styles.sent} role="status">
        <h2 className={styles.sentTitle}>Check your email</h2>
        <p>
          We sent a code to <strong>{email}</strong>. Type it in here or press the link in the email (it works on any device).
        </p>
      </div>
      <label className={styles.field}>
        <span className="label">The code</span>
        <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" value={code} onChange={(e) => setCode(e.target.value)} maxLength={12} />
      </label>
      <Problem text={error} />
      <Button type="submit" variant="primary" className={styles.submit} disabled={busy || !/^\d{6,10}$/.test(code.replace(/\s/g, ""))}>
        {busy ? "Checking" : "Confirm my email"}
      </Button>
      <Button type="button" variant="ghost" className={styles.toggle} onClick={() => void resend()}>
        Send the email again
      </Button>
      {note ? (
        <p className={styles.hint} role="status">
          {note}
        </p>
      ) : null}
    </form>
  );
}

/**
 * /account/confirm/: where an email's link lands. Three kinds arrive:
 *   - this site's own template: ?token_hash=...&type=... (email, recovery, email_change), checked here;
 *   - Supabase's standard email, which confirms on Supabase's side first and comes back with the
 *     sign-in in the address's #fragment (access_token, refresh_token, type);
 *   - the same with ?code=..., when the sign-up began in this browser;
 * or with an error (#error_description=...) when the link had expired or was used already.
 */
export function ConfirmLink() {
  const params = useSearchParams();
  const { refresh } = useSession();
  const [state, setState] = useState<"working" | "done" | "failed">("working");
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    // On a first visit the page reloads itself once, when its service worker takes over (Python
    // needs that: components/site/ServiceWorker.tsx). Using a link's one-time token before then
    // would spend it on a page about to vanish, so wait for the reload; if none comes, go ahead.
    const reloading = !window.crossOriginIsolated && "serviceWorker" in navigator && (() => {
      try {
        return !sessionStorage.getItem("ppc-isolated");
      } catch {
        return false;
      }
    })();
    if (reloading) {
      const t = setTimeout(() => {
        if (ran.current) return;
        ran.current = true;
        go();
      }, 5000);
      return () => clearTimeout(t);
    }
    ran.current = true;
    go();

    function go() {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const fail = (text: string) => {
      setState("failed");
      setError(text);
    };
    const problem = fragment.get("error_description") ?? params.get("error_description");
    const tokenHash = params.get("token_hash");
    const code = params.get("code");
    const access = fragment.get("access_token");
    const refreshToken = fragment.get("refresh_token");
    const type = (params.get("type") ?? fragment.get("type") ?? "email") as EmailOtpType;
    if (problem) return fail(said({ message: problem, code: fragment.get("error_code") ?? params.get("error_code") ?? undefined }));
    if (!tokenHash && !code && !(access && refreshToken)) {
      return fail("This page only works from the link in the email, so open the email and press the link, or type its code on the sign-up page.");
    }
    void (async () => {
      const { error: e } = tokenHash
        ? await supabase().auth.verifyOtp({ token_hash: tokenHash, type })
        : code
          ? await supabase().auth.exchangeCodeForSession(code)
          : await supabase().auth.setSession({ access_token: access!, refresh_token: refreshToken! });
      if (e) {
        // A ?code= opened in another browser can't be exchanged, but the email is confirmed already.
        if (code) return fail("Your email is confirmed, so log in with your email and password to carry on.");
        return fail(said(e));
      }
      await refresh();
      // replace, not assign: the link, with its sign-in, doesn't stay in the history.
      if (type === "recovery") return window.location.replace(here("/account/reset/"));
      setState("done");
      window.location.replace(here(type === "email_change" ? "/settings/" : "/welcome/"));
    })();
    }
  }, [params, refresh]);

  if (state === "failed")
    return (
      <div className={styles.form}>
        <Problem text={error} />
        <p className={styles.switch}>
          <Link href="/login">Log in</Link>, where you can ask for a new email.
        </p>
      </div>
    );
  return (
    <p className={styles.hint} role="status">
      {state === "done" ? "That's confirmed, taking you in now." : "Checking the link."}
    </p>
  );
}

// ---------------------------------------------------------------- logging in

export function LogInForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const next = safeNext(params.get("next"));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const { error: e2 } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
      if (e2) {
        if (e2.code === "email_not_confirmed" || /not confirmed/i.test(e2.message)) {
          await supabase().auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: here("/account/confirm/") } });
          setUnconfirmed(true);
          return;
        }
        return setError(said(e2));
      }
      await refresh();
      router.push(next);
    } catch (err) {
      setError(said(err as Error));
    } finally {
      setBusy(false);
    }
  };

  if (unconfirmed) return <ConfirmCode email={email.trim()} then={next} />;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label className={styles.field}>
        <span className="label">Email</span>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <div className={styles.field}>
        <label htmlFor="li-password" className="label">
          Password
        </label>
        <input id="li-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <small className={styles.hint}>
          <Link href="/account/forgot">Forgotten it?</Link>
        </small>
      </div>
      <Problem text={error} />
      <Button type="submit" variant="primary" className={styles.submit} disabled={busy || !email || !password}>
        {busy ? "One moment" : "Log in"}
      </Button>
      <p className={styles.switch}>
        New here? <Link href="/signup">Make an account</Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------- a forgotten password

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !email.includes("@")) return;
    setBusy(true);
    setError(null);
    const { error: e2 } = await supabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: here("/account/reset/") });
    setBusy(false);
    // Said the same whether or not there's an account, so the form can't be used to find one.
    if (e2 && !/not found|user/i.test(e2.message)) return setError(said(e2));
    setSent(true);
  };

  if (sent)
    return (
      <div className={styles.sent} role="status">
        <h2 className={styles.sentTitle}>Check your email</h2>
        <p>
          If <strong>{email.trim()}</strong> has an account, a link to set a new password is on its way, although it can take a minute and it might end up in spam.
        </p>
      </div>
    );

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label className={styles.field}>
        <span className="label">Email</span>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <Problem text={error} />
      <Button type="submit" variant="primary" className={styles.submit} disabled={busy || !email.includes("@")}>
        {busy ? "One moment" : "Email me a link"}
      </Button>
      <p className={styles.switch}>
        Remembered it? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}

/** /account/reset/: a new password, once the email's link has signed you in. */
export function ResetForm() {
  const { ready, user } = useSession();
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return null;
  if (!user)
    return (
      <div className={styles.form}>
        <Problem text="This page only works from the link in the reset email, and that link only works once and for an hour." />
        <p className={styles.switch}>
          <Link href="/account/forgot">Send a new one</Link>
        </p>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || password.length < MIN_PASSWORD || password !== again) return;
    setBusy(true);
    setError(null);
    const { error: e2 } = await supabase().auth.updateUser({ password });
    setBusy(false);
    if (e2) return setError(said(e2));
    window.location.assign(here("/"));
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <PasswordFields password={password} setPassword={setPassword} again={again} setAgain={setAgain} label="New password" />
      <Problem text={error} />
      <Button type="submit" variant="primary" className={styles.submit} disabled={busy || password.length < MIN_PASSWORD || password !== again}>
        {busy ? "One moment" : "Save the new password"}
      </Button>
    </form>
  );
}
