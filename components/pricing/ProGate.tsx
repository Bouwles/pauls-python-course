"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActSummary } from "@/lib/content/types";
import { FREE_ACTS } from "@/lib/plans";
import { castColour, floorFor } from "@/lib/cast";
import { LinkButton, Button } from "../ui/Button";
import { Track } from "@/lib/track";
import { GateCard } from "./GateCard";
import styles from "./ProGate.module.css";

const DISMISSED = "ppc-gate-dismissed";

/**
 * The gate after the Act I capstone ships (REDESIGN-2.md 6): the next floor of the Clocktower,
 * still under its dust sheets, what Pro opens, "Get Pro" and "Not now". "Not now" goes back to
 * the Clocktower and the gate doesn't come back.
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
  const pro = acts.filter((a) => !FREE_ACTS.has(a.id)).sort((a, b) => a.number - b.number);
  const next = pro[0];
  if (hidden || !next) return null;
  const floor = floorFor(next.number);
  const notNow = () => {
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      // Private browsing: the gate may show again, which is fine.
    }
    router.push("/map");
  };
  return (
    <>
      <Track event="view-paywall" />
      <GateCard
        as="div"
        h="h2"
        act={next.number}
        subject={next.subject}
        kicker={`Act ${next.number} is next`}
        title="The rest of the Clocktower is in Pro"
        titleId="gate-title"
        actions={
          <>
            <LinkButton href="/pricing/checkout?plan=pro-yearly" variant="primary">
              Get Pro
            </LinkButton>
            <Button variant="secondary" onClick={notNow}>
              Not now
            </Button>
          </>
        }
      >
        <p>That&apos;s the ground floor done. Pro opens {floor ? `${floor.room.replace(/^The /, "the ")}, one floor up,` : "the next floor"} and every floor above it.</p>
        <ul className={styles.floors}>
          {pro.map((a) => {
            const f = floorFor(a.number);
            const who = f?.residents[0] ?? "paul";
            return (
              <li key={a.id}>
                <span className={styles.square} style={{ background: `var(--c-${who}, ${castColour(who).face})` }} aria-hidden="true" />
                <span>{a.subject}</span>
              </li>
            );
          })}
        </ul>
        <p>Everything you&apos;ve built stays yours either way.</p>
      </GateCard>
    </>
  );
}
