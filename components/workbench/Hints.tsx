"use client";

import { STATIC } from "@/lib/static";
import { staticSolution } from "@/lib/static-data";
import { useState } from "react";
import type { Hints as HintsData } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import type { Files } from "@/lib/python/protocol";
import { PROFESSOR } from "@/lib/cast";
import { useSession } from "@/lib/store/session";
import { queueSoon } from "@/lib/review/deck";
import { Button } from "../ui/Button";
import { CodeBlock } from "./CodeBlock";
import { Inline } from "./Inline";
import { useWorkbench } from "./context";
import styles from "./Hints.module.css";

const MIN_MINUTES = 8;
const LEVELS = ["Nudge", "Plan", "Shape"] as const;

/** Nudge, Plan, Shape, then (only when allowed) the full solution. Each gives a little more away. */
export function Hints({ stepId, hints, row }: { stepId: string; hints: HintsData; row: StepProgressRow }) {
  const { updateStep, react, job, store, logEvent, nameOf, speaker } = useWorkbench();
  const { flush } = useSession();
  const [solution, setSolution] = useState<Files | null>(null);
  const [notYet, setNotYet] = useState<string | null>(null);
  const used = row.hintsUsed;
  const passed = row.status === "passed";

  const reveal = async (level: number) => {
    if (used >= level) return;
    await updateStep(stepId, { hintsUsed: level });
    logEvent("hint", { level });
    if (level === 3) void react("third-hint");
  };

  const askSolution = async () => {
    setNotYet(null);
    await flush();
    // On GitHub Pages the same rule is applied here and the solution read from a file.
    const body: { files?: Files; secondsNeeded?: number; hintsNeeded?: number } = STATIC
      ? await staticSolution(job.id, stepId, used, row.timeSpent, passed)
      : await fetch("/api/solution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id, stepId, hintsUsed: used, timeSpent: row.timeSpent, passed }),
        }).then((r) => r.json() as Promise<{ files?: Files; secondsNeeded?: number; hintsNeeded?: number }>);
    if (body.files) {
      setSolution(body.files);
      if (!passed) {
        await updateStep(stepId, { status: "seen-solution", seenSolution: true });
        if (store) await queueSoon(store, job.conceptsIntroduced);
        void react("solution-seen");
      }
      logEvent("solution-seen");
    } else {
      const mins = Math.ceil((body.secondsNeeded ?? 0) / 60);
      setNotYet(
        mins > 0
          ? `The full solution opens after ${MIN_MINUTES} minutes on a step: about ${mins} more ${mins === 1 ? "minute" : "minutes"}. The Shape hint is most of the way there.`
          : "Use all three hints first.",
      );
    }
  };

  return (
    <div className={styles.hints}>
      <div className={styles.buttons} role="group" aria-label="How much help">
        {LEVELS.map((label, i) => {
          const level = i + 1;
          const shown = used >= level;
          return (
            <Button
              key={label}
              size="sm"
              variant={shown ? "ghost" : used === level - 1 ? "primary" : "secondary"}
              onClick={() => void reveal(level)}
              locked={used < level - 1 ? `Use ${LEVELS[i - 1]} first.` : false}
              aria-expanded={shown}
              icon={shown ? "check" : undefined}
            >
              {label}
            </Button>
          );
        })}
      </div>
      {used >= 1 ? (
        <div className={styles.level}>
          <p className="label">Nudge</p>
          <p className={styles.text}>
            <Inline text={hints.nudge} />
          </p>
        </div>
      ) : (
        <p className={styles.note}>Start with a nudge. Each level gives a little more away.</p>
      )}
      {used >= 2 ? (
        <div className={styles.level}>
          <p className="label">Plan</p>
          <ol className={styles.plan}>
            {hints.plan.map((p, i) => (
              <li key={i}>
                <Inline text={p} />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {used >= 3 ? (
        <div className={styles.level}>
          <p className="label">Shape</p>
          <CodeBlock code={hints.shape} label="The shape of a solution, with gaps" />
        </div>
      ) : null}
      {(used >= 3 || passed) && !solution ? (
        <div className={styles.solutionRow}>
          <Button size="sm" variant="ghost" icon="code" onClick={() => void askSolution()}>
            Show solution
          </Button>
          {notYet ? <p className={styles.note}>{notYet}</p> : null}
        </div>
      ) : null}
      {solution ? (
        <div className={styles.level}>
          <p className={styles.note}>{passed ? `${nameOf(speaker(PROFESSOR))}'s version, for comparison.` : "Read why each line is there. A fresh version of this task will come up in your review."}</p>
          {Object.entries(solution).map(([name, code]) => (
            <div key={name} className={styles.level}>
              {Object.keys(solution).length > 1 ? <p className={styles.file}>{name}</p> : null}
              <CodeBlock code={code} label={`Solution, ${name}`} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
