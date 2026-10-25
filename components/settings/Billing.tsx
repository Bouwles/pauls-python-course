"use client";

import { useState } from "react";
import { PLANS, money } from "@/lib/plans";
import { usePlan } from "@/lib/usePlan";
import { Button, LinkButton } from "../ui/Button";
import styles from "./Settings.module.css";

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null);

/**
 * Billing in Settings (REDESIGN.md 8.4): the plan, when it renews or ends, and "Manage billing",
 * which opens the provider's own page for the card, invoices and cancelling. A failed payment
 * shows one calm note here and nowhere else.
 */
export function Billing() {
  const { status } = usePlan();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!status) return <p className={styles.hint}>Looking up your plan.</p>;
  const a = status.access;

  const manage = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && body.url) window.location.assign(body.url);
    else {
      setError(body.error ?? "Billing didn't open. Try again in a minute.");
      setBusy(false);
    }
  };

  if (!status.signedIn) return <p className={styles.hint}>Log in to see your plan.</p>;

  if (!a.pro && !a.status) {
    return (
      <>
        <p>
          <strong>Free.</strong> All of Act I, the Handbook, and everything you make. {status.onSale ? `Pro is ${money(PLANS["pro-monthly"].price ?? 0)} a month, or ${money(PLANS["pro-yearly"].price ?? 0)} a year.` : "Pro isn't on sale yet."}
        </p>
        {status.onSale ? (
          <div className={styles.row}>
            <LinkButton href="/pricing" variant="primary">
              See Pro
            </LinkButton>
          </div>
        ) : null}
      </>
    );
  }

  const name = a.via === "seat" ? "Pro, through your class" : a.plan === "founder" ? "Founding member" : a.plan === "pro-yearly" ? "Pro, yearly" : "Pro, monthly";
  const end = date(a.periodEnd);
  let when = "";
  if (a.via === "seat") when = end ? `Your class's seats last until ${end}.` : "";
  else if (a.plan === "founder") when = "For life.";
  else if (a.status === "canceled" && a.pro) when = end ? `Cancelled. Pro stays on until ${end}.` : "Cancelled.";
  else if (!a.pro) when = "Ended. Everything you made is still here, and so is your progress.";
  else if (end) when = `Renews on ${end}.`;

  return (
    <>
      {a.grace ? (
        <p className={styles.notice} role="status">
          The last payment didn&apos;t go through. Pro stays on for a few days while you update the card in Manage billing.
        </p>
      ) : null}
      <p>
        <strong>{name}.</strong> {when}
      </p>
      {a.via !== "seat" ? (
        <>
          <div className={styles.row}>
            <Button variant="quiet" onClick={() => void manage()} disabled={busy}>
              Manage billing
            </Button>
            {!a.pro ? (
              <LinkButton href="/pricing" variant="primary">
                Get Pro again
              </LinkButton>
            ) : null}
          </div>
          <p className={styles.hint}>Invoices, the card, and cancelling are all in Manage billing. Cancelling keeps Pro until the end of what you&apos;ve paid for.</p>
        </>
      ) : null}
      {error ? (
        <p className={styles.hint} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
