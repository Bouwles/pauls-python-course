"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PLANS, money, type PlanId } from "@/lib/plans";
import { usePlan } from "@/lib/usePlan";
import { Button, LinkButton } from "../ui/Button";
import { AskAParent } from "./AskAParent";
import styles from "./Pricing.module.css";

const LABEL: Partial<Record<PlanId, string>> = {
  "pro-monthly": "Pro, monthly",
  "pro-yearly": "Pro, yearly",
  founder: "Founding member, for life",
};

/**
 * Before the provider's checkout: which plan, and the one question the law and good sense
 * ask (REDESIGN.md 8.3). Under 18 needs a parent's or guardian's permission.
 */
export function Checkout() {
  const params = useSearchParams();
  const plan = (params.get("plan") ?? "pro-yearly") as PlanId;
  const { status } = usePlan();
  const [confirmed, setConfirmed] = useState<"adult" | "guardian" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const p = PLANS[plan] ?? PLANS["pro-yearly"];

  if (status && !status.signedIn) {
    const here = `/pricing/checkout?plan=${plan}`;
    return (
      <section className={`frame-panel ${styles.checkout}`}>
        <h1 className={styles.title}>Get Pro</h1>
        <p>Pro belongs to an account, so your progress and your plan stay together. Make one first, or log in.</p>
        <div className={styles.row}>
          <LinkButton href={`/signup?next=${encodeURIComponent(here)}`} variant="primary">
            Make an account
          </LinkButton>
          <LinkButton href={`/login?next=${encodeURIComponent(here)}`} variant="quiet">
            Log in
          </LinkButton>
        </div>
      </section>
    );
  }

  if (status?.access.pro) {
    return (
      <section className={`frame-panel ${styles.checkout}`}>
        <h1 className={styles.title}>You have Pro</h1>
        <p>Every Act is open. Billing is in Settings.</p>
        <div className={styles.row}>
          <LinkButton href="/map" variant="primary">
            Back to the map
          </LinkButton>
          <LinkButton href="/settings#billing" variant="quiet">
            Manage billing
          </LinkButton>
        </div>
      </section>
    );
  }

  const go = async () => {
    if (!confirmed) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, confirmed }) });
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && body.url) window.location.assign(body.url);
    else {
      setError(body.error ?? "Checkout didn't start. Try again in a minute.");
      setBusy(false);
    }
  };

  const price = p.price === null ? "" : p.interval === "year" ? `${money(p.price)} a year (${money(p.price / 12)} a month)` : p.interval === "month" ? `${money(p.price)} a month` : money(p.price);

  return (
    <section className={`frame-panel ${styles.checkout}`} aria-labelledby="checkout-title">
      <h1 id="checkout-title" className={styles.title}>
        Get Pro
      </h1>
      <p>
        <strong>{LABEL[plan] ?? p.name}</strong>: {price}. Cancel any time from Settings.{" "}
        {plan === "pro-yearly" ? <Link href="/pricing/checkout?plan=pro-monthly">Pay monthly instead</Link> : plan === "pro-monthly" ? <Link href="/pricing/checkout?plan=pro-yearly">Pay yearly instead</Link> : null}
      </p>
      <fieldset className={styles.choices}>
        <legend className={styles.note}>Before you pay</legend>
        <label className={styles.choice}>
          <input type="radio" name="confirmed" checked={confirmed === "adult"} onChange={() => setConfirmed("adult")} />
          <span>I&apos;m 18 or over.</span>
        </label>
        <label className={styles.choice}>
          <input type="radio" name="confirmed" checked={confirmed === "guardian"} onChange={() => setConfirmed("guardian")} />
          <span>I&apos;m under 18, and a parent or guardian has said yes and is here with me.</span>
        </label>
      </fieldset>
      <div className={styles.row}>
        <Button variant="primary" onClick={() => void go()} disabled={busy} locked={confirmed ? false : "Answer the question above first."}>
          {busy ? "Opening checkout" : "Continue to payment"}
        </Button>
        <LinkButton href="/pricing" variant="quiet">
          Not now
        </LinkButton>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <AskAParent />
      {status && !status.onSale ? <p className={styles.note}>Pro isn&apos;t on sale yet. Everything in Act I is free in the meantime.</p> : null}
    </section>
  );
}
