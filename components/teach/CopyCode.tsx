"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import styles from "./Teach.module.css";

/** A class's join code with a button that copies it. */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard (an old browser, or permission refused): the code is on screen to copy by hand.
    }
  };
  return (
    <span className={styles.copy}>
      <code className={styles.code}>{code}</code>
      <Button size="sm" variant="quiet" onClick={() => void copy()} aria-label={`Copy the code ${code.split("").join(" ")}`}>
        {copied ? "Copied" : "Copy"}
      </Button>
      <span className="visually-hidden" role="status">
        {copied ? "Code copied." : ""}
      </span>
    </span>
  );
}
