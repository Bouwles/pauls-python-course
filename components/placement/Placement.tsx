"use client";

// The placement test (Section 8.2): one section per Act, each a short project of Make tasks.
// Passing a section marks that Act's projects as placed: they stay open, the next Act opens,
// and the Act's ideas join the review deck.
import { duration } from "@/lib/display";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ActSummary, PlacementSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { castColour, floorFor } from "@/lib/cast";
import { useSession } from "@/lib/store/session";
import { openActs } from "@/lib/progress-rules";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";
import { LinkButton } from "../ui/Button";
import styles from "./Placement.module.css";

export function Placement({ acts, placements }: { acts: ActSummary[]; placements: PlacementSummary[] }) {
  const { store, ready } = useSession();
  const [progress, setProgress] = useState<Record<string, JobProgressRow> | null>(null);

  useEffect(() => {
    if (!store || !ready) return;
    void store.all("job_progress").then((rows) => setProgress(Object.fromEntries(rows.map((r) => [r.jobId, r]))));
  }, [store, ready]);

  const open = progress ? openActs(acts, progress, placements) : new Set<string>();
  const placedPast = (p: PlacementSummary) => {
    const row = progress?.[p.jobId];
    return row?.status === "shipped" || row?.status === "shipped-stretch";
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>Placement test</h1>
        <p className={styles.lede}>For anyone who has written a fair amount of Python already. Each section is a few Make tasks from one Act, with real checks and no hints.</p>
      </header>
      <div className={`prose ${styles.how}`}>
        <p>
          Pass every task in a section and that Act is marked as placed: the next Act opens in the Clocktower, and the Act&apos;s ideas join your review deck, so Morning Rounds still checks them. Its projects stay open if you&apos;d like to do them anyway.
        </p>
        <p>Take the sections in order. A section you don&apos;t pass costs nothing: the Act is waiting where it always was.</p>
      </div>
      {placements.length === 0 ? (
        <p className={styles.meta}>The placement test isn&apos;t written yet. Start with the first project; the early ones go quickly if you know them.</p>
      ) : (
        <ol className={styles.sections}>
          {placements.map((p) => {
            const act = acts.find((a) => a.id === p.act);
            const available = progress !== null && open.has(p.act);
            const passed = placedPast(p);
            const colour = castColour(floorFor(act?.number ?? 0)?.residents[0] ?? "");
            return (
              <li key={p.jobId} className={styles.section}>
                <span className={styles.number} style={{ background: colour.face, color: colour.ink }} aria-hidden="true">
                  {act?.number}
                </span>
                <div className={styles.sectionText}>
                  <h2 className={styles.sectionTitle}>
                    <span className="visually-hidden">Act {act?.number}: </span>
                    {act?.subject || act?.title || p.title}
                  </h2>
                  <p className={styles.meta}>
                    {p.summary} About {duration(p.estimatedMinutes)}.
                  </p>
                </div>
                <div className={styles.state}>
                  {passed ? (
                    <Badge tone="shipped">
                      <Icon name="tick" size={16} />
                      Placed
                    </Badge>
                  ) : available ? (
                    <LinkButton variant="secondary" href={`/job/${p.jobId}`}>
                      Take this section
                    </LinkButton>
                  ) : progress === null ? null : (
                    <span className={styles.locked}>
                      <Icon name="lock" size={16} />
                      Opens when Act {(act?.number ?? 2) - 1} is placed or done
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className={styles.meta}>
        Rather start from the beginning? <Link href="/job/shop-sign">The first project</Link> takes about twenty minutes. Or <Link href="/map">go to the Clocktower</Link>.
      </p>
    </div>
  );
}
