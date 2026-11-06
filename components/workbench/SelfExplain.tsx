"use client";

import { useState } from "react";
import type { SelfRating, StepProgressRow } from "@/lib/store/types";
import { applySelfRating } from "@/lib/review/deck";
import { PROFESSOR } from "@/lib/cast";
import { Button } from "../ui/Button";
import { useWorkbench } from "./context";
import styles from "./SelfExplain.module.css";

/** A short answer in your own words, then Paul's answer, then an honest self-rating (Section 9.5). */
export function SelfExplain({ stepId, promptHtml, answer, concept, row }: { stepId: string; promptHtml: string; answer: string; concept: string | null; row: StepProgressRow }) {
  const { updateStep, markPassed, store, logEvent, nameOf, speaker } = useWorkbench();
  const [text, setText] = useState(row.selfExplanation ?? "");
  const [revealed, setRevealed] = useState(Boolean(row.selfRating));
  const rating = row.selfRating;
  // Paul's answer, or Neil's when you're Paul.
  const paul = nameOf(speaker(PROFESSOR));

  const rate = async (r: SelfRating) => {
    await updateStep(stepId, { selfExplanation: text, selfRating: r });
    if (store && concept) await applySelfRating(store, concept, r);
    await markPassed(stepId);
    logEvent("self-rating", { rating: r });
  };

  return (
    <div className={styles.box}>
      <label className={styles.prompt} htmlFor={`explain-${stepId}`}>
        <span dangerouslySetInnerHTML={{ __html: promptHtml }} />
      </label>
      <textarea
        id={`explain-${stepId}`}
        className={styles.input}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => void updateStep(stepId, { selfExplanation: text })}
        placeholder="In your own words."
      />
      {!revealed ? (
        <Button variant="secondary" disabled={text.trim().length < 3} onClick={() => setRevealed(true)}>
          Show {paul}&apos;s answer
        </Button>
      ) : (
        <div className={styles.answer}>
          <p className="label">{paul}&apos;s answer</p>
          <p className={styles.answerText} dangerouslySetInnerHTML={{ __html: answer }} />
          <fieldset className={styles.rating}>
            <legend>How close were you?</legend>
            <div className={styles.ratingButtons}>
              {(
                [
                  ["had", "I had that"],
                  ["partly", "Partly"],
                  ["missed", "Missed it"],
                ] as const
              ).map(([value, label]) => (
                <Button key={value} size="sm" variant={rating === value ? "primary" : "secondary"} aria-pressed={rating === value} onClick={() => void rate(value)}>
                  {label}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
