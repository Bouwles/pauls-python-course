"use client";

import { useEffect, useState } from "react";
import { LinkButton } from "../ui/Button";
import { VisitSpeech } from "../site/VisitSpeech";
import styles from "./Pricing.module.css";

/** After checkout: waits for the provider's webhook to land, then says what's open. */
export function Thanks() {
  const [pro, setPro] = useState<boolean | null>(null);
  useEffect(() => {
    let tries = 0;
    let live = true;
    const poll = async () => {
      const res = await fetch("/api/billing/status", { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as { access?: { pro?: boolean } };
      if (!live) return;
      if (body.access?.pro) setPro(true);
      else if (++tries < 20) setTimeout(() => void poll(), 1500);
      else setPro(false);
    };
    void poll();
    return () => {
      live = false;
    };
  }, []);
  return (
    <section className={styles.checkout} aria-live="polite">
      <h1 className={styles.checkoutTitle}>{pro ? "Every floor is open" : "Thank you"}</h1>
      {pro === null ? <p>Waiting for the payment to come through. This takes a few seconds.</p> : null}
      {pro ? <VisitSpeech place="thanks" who="paul" name="Paul" text="That's every floor open. Take the stairs whenever you're ready." face="laughing" gesture="cheer" size={112} /> : null}
      {pro ? <p>Pro is on. Every floor of the Clocktower is open, and every project in it.</p> : null}
      {pro === false ? <p>The payment hasn&apos;t come through yet. It can take a minute. Check Settings shortly; if it still says Free, write to us and we&apos;ll sort it out.</p> : null}
      <div className={styles.row}>
        <LinkButton href="/map" variant="primary">
          Back to the Clocktower
        </LinkButton>
      </div>
    </section>
  );
}
