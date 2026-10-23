"use client";

import { duration } from "@/lib/display";
import type { AskStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { useWorkbench } from "../context";
import { StepHeading } from "./common";
import styles from "./steps.module.css";

export function AskStepView({ step, row }: { step: AskStep; row: StepProgressRow }) {
  const { job, areas, characters, conceptTitles, markPassed, goNext } = useWorkbench();
  const client = characters[job.client]?.name ?? job.client;
  const start = async () => {
    await markPassed(step.id);
    goNext();
  };
  return (
    <>
      <div className={areas.brief}>
        <StepHeading step={step} />
        <div className="prose">
          <p>
            {job.scene === "lamp-room" ? "Up the last of the stairs, into the lamp room." : client === "Moss" ? "Moss has a job for you." : `${client} has come in with a job.`} Read the ticket, then start.
          </p>
        </div>
        <div className={styles.next}>
          <Button variant="primary" onClick={() => void start()}>
            {row.status === "passed" ? "Next step" : "Start the job"}
          </Button>
        </div>
      </div>
      <div className={areas.stage}>
        <div className={styles.stagePad}>
          <article className={styles.ticket} aria-labelledby="ticket-title">
            <div className={styles.ticketHead}>
              <h2 id="ticket-title" className={styles.ticketTitle}>
                {job.title}
              </h2>
              <span className={styles.ticketNo}>No. {String(job.actNumber).padStart(2, "0")}-{String(job.number).padStart(2, "0")}</span>
            </div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: step.specHtml }} />
            {step.example ? (
              <div className={styles.example}>
                <p className="label">Example run</p>
                <pre className={styles.terminal}>{step.example}</pre>
              </div>
            ) : null}
            <dl className={styles.ticketMeta}>
              <dt>For</dt>
              <dd>{client}</dd>
              <dt>Time</dt>
              <dd>About {duration(job.estimatedMinutes)}</dd>
              {job.conceptsIntroduced.length ? (
                <>
                  <dt>New</dt>
                  <dd>
                    <ul className={styles.chips}>
                      {job.conceptsIntroduced.map((c) => (
                        <li key={c}>{conceptTitles[c] ?? c}</li>
                      ))}
                    </ul>
                  </dd>
                </>
              ) : null}
            </dl>
          </article>
        </div>
      </div>
    </>
  );
}
