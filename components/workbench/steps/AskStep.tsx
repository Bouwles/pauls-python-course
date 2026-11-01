"use client";

import { useMemo } from "react";
import type { AskStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { duration } from "@/lib/display";
import { Track } from "@/lib/track";
import { Button, LinkButton } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { Prose } from "../Instructions";
import { SpokenLine, Stage, othersIn, personOnStage, roomOf, useConversation } from "../Scene";
import { useWorkbench } from "../context";
import { isSpoken } from "../labels";
import styles from "./ask.module.css";

/**
 * The Ask (REDESIGN3_PLAN.md P3), as a cutscene: the client at their desk in their room on the
 * Clocktower, big and alive, asking for the program a line at a time under the scene. Each line types out while its speaker's mouth moves, with the face
 * and gesture the line calls for; the client waves on their first line. Then the project spec
 * and "Start building". Skip shows every line at once; reduced motion does that from the start.
 */
export function AskStepView({ step, row }: { step: AskStep; row: StepProgressRow }) {
  const { job, areas, conceptTitles, markPassed, goNext, preview, nameOf } = useWorkbench();
  const lines = useMemo(() => step.dialogue.filter((l) => isSpoken(l.who)), [step.dialogue]);
  const client = job.client;
  const clientName = nameOf(client);
  const talk = useConversation(lines.length);

  const start = async () => {
    if (row.status !== "passed") await markPassed(step.id);
    goNext();
  };

  // Who is on the stage, and how they look right now: the one speaking says their line; the
  // others listen with the face of the last thing they said. When it's all said, the client
  // stays with their last face, standing easy.
  const stage = (who: string) => personOnStage(who, lines, talk, client);
  const guests = othersIn(lines, client).map(stage);

  return (
    <div className={areas.full}>
      <div className={styles.ask}>
        <header className={styles.head}>
          <p className={styles.kicker}>A new project for {clientName}</p>
          <h1 className={styles.title}>{job.title}</h1>
        </header>
        <div className={styles.stageWrap}>
          <Stage act={roomOf(client, job.actNumber)} lead={stage(client)} guests={guests} name={clientName} label={`${clientName}, at their desk, who needs the ${job.title.toLowerCase()}`} />
        </div>
        <div className={styles.side}>
          {lines.length ? (
            <ol className={styles.lines} aria-label={`What ${clientName} asks for`}>
              {lines.slice(0, talk.shown).map((l, i) => {
                const again = i > 0 && lines[i - 1]!.who === l.who;
                const live = talk.live(i);
                return (
                  <li key={i} className={[styles.lineItem, again ? styles.same : ""].join(" ")}>
                    <SpokenLine who={l.who} name={again ? undefined : nameOf(l.who)} text={l.text} tail={again ? "none" : "top"} live={live} onMouth={talk.setMouth} onDone={live ? talk.lineDone : undefined} />
                  </li>
                );
              })}
            </ol>
          ) : null}
          {/* Each line once, whole, for screen readers: the typing is only for the eyes. */}
          <p className="visually-hidden" aria-live="polite">
            {talk.skipped || !lines[talk.at] ? "" : `${nameOf(lines[talk.at]!.who)}: ${lines[talk.at]!.text}`}
          </p>
          {talk.playing ? (
            <div className={styles.skipRow}>
              <Button variant="ghost" size="sm" onClick={talk.skip}>
                Skip
              </Button>
            </div>
          ) : (
            <>
              <section className={`px-panel ${styles.spec}`} aria-labelledby="spec-title">
                <h2 id="spec-title" className={styles.specTitle}>
                  Project spec
                </h2>
                <Prose html={step.specHtml} className={styles.specText} />
                {step.example ? (
                  <div className={styles.example}>
                    <p className="label">Example run</p>
                    <pre className="code-dark" tabIndex={0} role="group" aria-label="Example run">
                      {step.example}
                    </pre>
                  </div>
                ) : null}
                <div className={styles.meta}>
                  <span className={styles.metaItem}>
                    <Icon name="clock" size={16} />
                    About {duration(job.estimatedMinutes)}
                  </span>
                  {job.conceptsIntroduced.length ? (
                    <div className={styles.metaItem}>
                      <span>New in this project:</span>
                      <ul className={styles.chips}>
                        {job.conceptsIntroduced.map((c) => (
                          <li key={c}>{conceptTitles[c] ?? c}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>
              {preview ? (
                <div className={styles.actions}>
                  <Track event="view-paywall" />
                  <LinkButton href="/pricing/checkout?plan=pro-yearly" variant="primary">
                    Get Pro
                  </LinkButton>
                  <LinkButton href="/map" variant="ghost">
                    Not now
                  </LinkButton>
                  <p className={styles.note}>This project is part of Pro. The ask is a free preview.</p>
                </div>
              ) : (
                <div className={styles.actions}>
                  <Button variant="primary" icon="next" onClick={() => void start()}>
                    Start building
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
