"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActSummary } from "@/lib/content/types";
import { BRAND } from "@/lib/brand";
import { FREE_ACTS } from "@/lib/plans";
import { LinkButton, Button } from "../ui/Button";
import { CharacterPortrait } from "../world/CharacterPortrait";
import { Track } from "@/lib/track";
import styles from "./ProGate.module.css";

const DISMISSED = "fixwick-gate-dismissed";

/**
 * The gate scene (REDESIGN.md 8.4): after the Act I capstone ships, Mira from the post office
 * asks for help, the High Street glows, and a panel says what's in Pro. "Not now" goes back
 * to the map and the scene doesn't come back.
 */
export function ProGate({ acts }: { acts: Pick<ActSummary, "id" | "number" | "title" | "subject">[] }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(DISMISSED) === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  if (hidden) return null;
  const pro = acts.filter((a) => !FREE_ACTS.has(a.id));
  const notNow = () => {
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      // ignore
    }
    router.push("/map");
  };
  return (
    <section className={styles.gate} aria-labelledby="gate-title">
      <Track event="view-paywall" />
      <div className={`frame-dialogue ${styles.mira}`}>
        <div className={styles.portrait}>
          <CharacterPortrait id="mira" sprite="mira" face="worried" scale={2} height={112} />
        </div>
        <div>
          <p className={styles.name}>Mira</p>
          <p className={styles.line}>
            You fixed the harbour. The post office is next door to chaos. Three sacks of letters, no labels, and the sorting machine reads them upside down. Could you come up the High Street?
          </p>
        </div>
      </div>
      <div className={`frame-panel ${styles.offer}`}>
        <h2 id="gate-title" className={styles.offerTitle}>
          The rest of {BRAND.townName} is in Pro
        </h2>
        <ul className={styles.acts}>
          {pro.map((a) => (
            <li key={a.id}>
              <span className={styles.actNo}>{a.number}</span> {a.title}
              <span className={styles.subject}>{a.subject}</span>
            </li>
          ))}
        </ul>
        <p className={styles.promise}>Everything you&apos;ve built stays yours either way.</p>
        <div className={styles.row}>
          <LinkButton href="/pricing/checkout?plan=pro-yearly" variant="primary">
            Get Pro
          </LinkButton>
          <Button variant="quiet" onClick={notNow}>
            Not now
          </Button>
        </div>
      </div>
    </section>
  );
}
