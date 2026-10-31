"use client";

import { useEffect, useState } from "react";
import type { AskStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { duration, prefersReducedMotion } from "@/lib/display";
import { Track } from "@/lib/track";
import { Figure } from "../../art/Portrait";
import { Button, LinkButton } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { SpeechBubble } from "../../ui/SpeechBubble";
import { Prose } from "../Instructions";
import { useWorkbench } from "../context";
import { isSpoken } from "../labels";
import styles from "./ask.module.css";

const BEAT_MS = 1100;

/**
 * The Ask (REDESIGN-2.md 4.6): the whole Workbench given over to whoever needs the program.
 * Their illustration on the left; on the right their request, a line at a time, then the
 * project spec and "Start building". Skippable, and replayable from the spec later.
 */
export function AskStepView({ step, row }: { step: AskStep; row: StepProgressRow }) {
  const { job, areas, conceptTitles, markPassed, goNext, preview, nameOf } = useWorkbench();
  const lines = step.dialogue.filter((l) => isSpoken(l.who));
  const [shown, setShown] = useState(() => (prefersReducedMotion() || lines.length < 2 ? lines.length : 1));
  const playing = shown < lines.length;
  const clientName = nameOf(job.client);

  // The request arrives a line at a time (all at once with reduced motion).
  useEffect(() => {
    if (prefersReducedMotion() || lines.length < 2) return;
    const t = setInterval(() => setShown((n) => (n >= lines.length ? n : n + 1)), BEAT_MS);
    return () => clearInterval(t);
    // Once per visit to the Ask.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (row.status !== "passed") await markPassed(step.id);
    goNext();
  };

  return (
    <div className={areas.full}>
      <div className={styles.ask}>
        <div className={styles.figureWrap}>
          <Figure who={job.client} name={clientName} height={420} className={styles.figure} caption={`${clientName}, who needs the ${job.title.toLowerCase()}`} />
        </div>
        <div className={styles.side}>
          <header className={styles.head}>
            <p className={styles.kicker}>A new project for {clientName}</p>
            <h1 className={styles.title}>{job.title}</h1>
          </header>
          {lines.length ? (
            <ol className={styles.bubbles} aria-label={`What ${clientName} asks for`} aria-live="polite">
              {lines.slice(0, shown).map((l, i) => (
                <li key={i} className={[styles.bubbleItem, i > 0 && lines[i - 1]!.who === l.who ? styles.same : ""].join(" ")}>
                  <SpeechBubble who={l.who} name={i > 0 && lines[i - 1]!.who === l.who ? undefined : nameOf(l.who)} tail="left">
                    <p>{l.text}</p>
                  </SpeechBubble>
                </li>
              ))}
            </ol>
          ) : null}
          {playing ? (
            <div>
              <Button variant="ghost" size="sm" onClick={() => setShown(lines.length)}>
                Skip
              </Button>
            </div>
          ) : (
            <>
              <section className={styles.spec} aria-labelledby="spec-title">
                <h2 id="spec-title" className={styles.specTitle}>
                  Project spec
                </h2>
                <Prose html={step.specHtml} className={styles.specText} />
                {step.example ? (
                  <div className={styles.example}>
                    <p className="label">Example run</p>
                    <pre className="code-dark">{step.example}</pre>
                  </div>
                ) : null}
                <div className={styles.meta}>
                  <span className={styles.metaItem}>
                    <Icon name="clock" size={18} />
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
