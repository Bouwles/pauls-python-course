"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { Button, LinkButton } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import styles from "./AuthForm.module.css";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh, oauth, mode: backend } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") === "link" ? "That link has expired or has already been used. Ask for a new one." : null);
  const [busy, setBusy] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [useLink, setUseLink] = useState(false);
  const keep = params.get("keep") === "1";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (useLink) {
        const res = await fetch("/api/auth/magic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(body.error ?? "That didn't work.");
        setLinkSent(true);
        return;
      }
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ageConfirmed: age }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "That didn't work.");
      const user = await refresh();
      if (!user && backend === "supabase" && mode === "signup") {
        setLinkSent(true);
        return;
      }
      // Only follow `next` within this site: "/path", never "//elsewhere" or "https://...".
      const next = params.get("next");
      const safeNext = next && /^\/(?![/\\])/.test(next) ? next : "/map";
      router.push(mode === "signup" ? "/welcome" : safeNext);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (linkSent) {
    return (
      <div className={styles.sent} role="status">
        <h2 className={styles.sentTitle}>Check your email</h2>
        <p>
          A link is on its way to <strong>{email}</strong>. It works once, for fifteen minutes.
        </p>
        {backend === "local" ? (
          <p className={styles.dev}>
            Running without an email service: the link is in the <Link href="/dev/mailbox">development mailbox</Link>.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {keep ? (
        <p className={styles.keep}>
          <PixelIcon name="saved" />
          <span>Your work so far moves into the new account.</span>
        </p>
      ) : null}
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {!useLink ? (
        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={mode === "signup" ? 10 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={mode === "signup" ? "pw-hint" : undefined}
          />
          {mode === "signup" ? (
            <small id="pw-hint" className={styles.hint}>
              At least 10 characters.
            </small>
          ) : null}
        </label>
      ) : null}
      {mode === "signup" ? (
        <div className={styles.age}>
          <label className={styles.check}>
            <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} required />
            <span>I&apos;m 13 or older.</span>
          </label>
          <p className={styles.hint}>If you&apos;re under 16, check with a parent or guardian first. In some countries the law asks for their consent.</p>
        </div>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          <PixelIcon name="cross" />
          <span>{error}</span>
        </p>
      ) : null}
      <Button type="submit" variant="primary" className={styles.submit} disabled={busy || !email || (!useLink && !password) || (mode === "signup" && !age)}>
        {busy ? "One moment" : useLink ? "Email me a link" : mode === "signup" ? "Make the account" : "Log in"}
      </Button>
      <Button type="button" variant="quiet" className={styles.toggle} onClick={() => setUseLink((v) => !v)}>
        {useLink ? "Use a password instead" : "Email me a sign-in link instead"}
      </Button>
      {oauth.length ? (
        <div className={styles.oauth}>
          <p className={styles.or}>Or</p>
          {oauth.includes("google") ? (
            <LinkButton variant="quiet" className={styles.provider} href={mode === "signup" && !age ? undefined : "/api/auth/oauth/google"} aria-disabled={mode === "signup" && !age}>
              Continue with Google
            </LinkButton>
          ) : null}
          {oauth.includes("github") ? (
            <LinkButton variant="quiet" className={styles.provider} href={mode === "signup" && !age ? undefined : "/api/auth/oauth/github"} aria-disabled={mode === "signup" && !age}>
              Continue with GitHub
            </LinkButton>
          ) : null}
        </div>
      ) : null}
      <p className={styles.switch}>
        {mode === "signup" ? (
          <>
            Already have an account? <Link href={`/login${keep ? "?keep=1" : ""}`}>Log in</Link>
          </>
        ) : (
          <>
            New here? <Link href="/signup">Make an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
