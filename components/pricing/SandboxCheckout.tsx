"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import styles from "./Pricing.module.css";

/** Pretend checkout and billing portal for the sandbox provider. Nothing here takes money. */
export function SandboxCheckout() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("t");
  const portal = params.get("portal") === "1";
  const [note, setNote] = useState<string | null>(null);

  const act = async (action: string) => {
    const res = await fetch("/api/billing/sandbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, token }) });
    const body = (await res.json().catch(() => ({}))) as { redirect?: string | null; error?: string };
    if (!res.ok) return setNote(body.error ?? "That didn't work.");
    if (body.redirect) window.location.assign(body.redirect);
    else {
      setNote("Done. The webhook went through.");
      router.refresh();
    }
  };

  return (
    <section className={styles.checkout}>
      <Badge tone="info" className={styles.sandboxTag}>
        Sandbox
      </Badge>
      <h1 className={styles.checkoutTitle}>{portal ? "Test billing portal" : "Test checkout"}</h1>
      <p className={styles.note}>
        This is the sandbox payments provider, for development and tests. No card, no money. Each button sends a signed webhook through the same handler a real provider uses.
      </p>
      {portal ? (
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => void act("renew")}>
            Renew
          </Button>
          <Button variant="secondary" onClick={() => void act("fail-payment")}>
            Fail the next payment
          </Button>
          <Button variant="danger" onClick={() => void act("cancel")}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => void act("expire")}>
            Let it expire
          </Button>
        </div>
      ) : (
        <div className={styles.row}>
          <Button variant="primary" onClick={() => void act("pay")} disabled={!token}>
            Pay with the test card
          </Button>
          <Button variant="secondary" onClick={() => router.push("/pricing")}>
            Cancel
          </Button>
        </div>
      )}
      {note ? <p role="status">{note}</p> : null}
    </section>
  );
}
