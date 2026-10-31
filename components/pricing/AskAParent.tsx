"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import styles from "./Pricing.module.css";

/** Under 18? A link to send a parent: the pricing page with a short, plain explanation for them. */
export function AskAParent() {
  const [copied, setCopied] = useState(false);
  const link = typeof window === "undefined" ? "/pricing?for=parent" : `${window.location.origin}/pricing?for=parent`;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Can I have Pro?", url: link });
      else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      }
    } catch {
      // The learner closed the share sheet.
    }
  };
  return (
    <p className={styles.ask}>
      Under 18? Buying needs a parent or guardian to say yes.{" "}
      <Button variant="secondary" size="sm" onClick={() => void share()}>
        Ask a parent
      </Button>
      {copied ? <span className={styles.copied}> Link copied. Send it to them.</span> : null}
    </p>
  );
}
