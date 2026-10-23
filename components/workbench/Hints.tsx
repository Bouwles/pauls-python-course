"use client";

import { useState } from "react";
import type { CheckableStep, Hints as HintsData } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import type { Files } from "@/lib/python/protocol";
import { useSession } from "@/lib/store/session";
import { queueSoon } from "@/lib/review/deck";
import { Button } from "../ui/Button";
import { CodeBlock } from "./CodeBlock";
import { useWorkbench } from "./context";
import styles from "./Hints.module.css";

const MIN_MINUTES = 8;

/** Nudge, Plan, Shape, then (only when allowed) the full solution. Section 3.5. */
export function Hints({ step, hints, row }: { step: CheckableStep; hints: HintsData; row: StepProgressRow }) {
  const { updateStep, react, job, store, logEvent } = useWorkbench();
  const { flush } = useSession();
  const [solution, setSolution] = useState<Files | null>(null);
  const [notYet, setNotYet] = useState<string | null>(null);
  const used = row.hintsUsed;
  const passed = row.status === "passed";

  const reveal = async (level: number) => {
    if (used >= level) return;
    await updateStep(step.id, { hintsUsed: level });
    logEvent("hint", { level });
    if (level === 3) void react("moss", "third-hint");
  };

  const askSolution = async () => {
    setNotYet(null);
    await flush();
    const res = await fetch("/api/solution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id, stepId: step.id, hintsUsed: used, timeSpent: row.timeSpent, passed }),
    });
    const body = (await res.json()) as { files?: Files; secondsNeeded?: number; hintsNeeded?: number };
    if (res.ok && body.files) {
      setSolution(body.files);
      if (!passed) {
        await updateStep(step.id, { status: "seen-solution", seenSolution: true });
        if (store) await queueSoon(store, job.conceptsIntroduced);
        void react("moss", "solution-seen");
      }
      logEvent("solution-seen");
    } else {
      const mins = Math.ceil((body.secondsNeeded ?? 0) / 60);
      setNotYet(
        mins > 0
          ? `Moss shows the full solution after ${MIN_MINUTES} minutes on a step. About ${mins} more ${mins === 1 ? "minute" : "minutes"}. The Shape hint is most of the way there.`
          : "Use all three hints first.",
      );
    }
  };

  return (
    <section className={styles.hints} aria-labelledby={`hints-${step.id}`}>
      <h2 id={`hints-${step.id}`} className="label">
        Moss&apos;s hints
      </h2>
      <div className={styles.buttons}>
        <Button size="sm" variant={used >= 1 ? "quiet" : "secondary"} onClick={() => void reveal(1)} aria-expanded={used >= 1}>
          Nudge
        </Button>
        <Button size="sm" variant={used >= 2 ? "quiet" : "secondary"} onClick={() => void reveal(2)} disabled={used < 1} aria-expanded={used >= 2}>
          Plan
        </Button>
        <Button size="sm" variant={used >= 3 ? "quiet" : "secondary"} onClick={() => void reveal(3)} disabled={used < 2} aria-expanded={used >= 3}>
          Shape
        </Button>
      </div>
      {used >= 1 ? <p className={styles.nudge}>{hints.nudge}</p> : null}
      {used >= 2 ? (
        <ol className={styles.plan}>
          {hints.plan.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      ) : null}
      {used >= 3 ? <CodeBlock code={hints.shape} label="The shape of a solution, with gaps" /> : null}
      {(used >= 3 || passed) && !solution ? (
        <div className={styles.solutionRow}>
          <Button size="sm" variant="quiet" onClick={() => void askSolution()}>
            Show solution
          </Button>
          {notYet ? <p className={styles.notYet}>{notYet}</p> : null}
        </div>
      ) : null}
      {solution ? (
        <div className={styles.solution}>
          <p className={styles.solutionNote}>{passed ? "Moss's version, for comparison." : "Read why each line is there. A fresh version of this task will come up in your review."}</p>
          {Object.entries(solution).map(([name, code]) => (
            <div key={name}>
              {Object.keys(solution).length > 1 ? <p className={styles.file}>{name}</p> : null}
              <CodeBlock code={code} label={`Solution, ${name}`} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
