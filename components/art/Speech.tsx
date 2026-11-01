"use client";

import { moodOf } from "@/lib/mood";
import { SpeechBubble } from "../ui/SpeechBubble";
import { Figure, Portrait } from "./Portrait";
import { useSpeech } from "./useSpeech";
import styles from "./Speech.module.css";

// A character saying a line (REDESIGN3_PLAN.md): their pixel self with the face and gesture the
// line calls for, the words typing out in a bubble, and the mouth moving with them. Click the
// bubble to finish the line. `face` and `gesture` come from content (`- riya.pleased.wave:`);
// without them the words choose the face (lib/mood.ts). The button is named by its contents (the
// speaker's name and the whole line), not an aria-label, so the name always holds what's visible.

export function Speech({
  who,
  name,
  text,
  face,
  gesture,
  size = 96,
  big = false,
  start = true,
  onDone,
  className,
}: {
  who: string;
  name: string;
  text: string;
  face?: string;
  gesture?: string;
  /** The portrait's size; `big` shows the large figure instead. */
  size?: number;
  big?: boolean;
  start?: boolean;
  onDone?: () => void;
  className?: string;
}) {
  const mood = moodOf(text, { face, gesture });
  const speech = useSpeech(text, { start, onDone });
  const person = big ? (
    <Figure who={who} name={name} height={size} expression={mood.face} gesture={mood.gesture} mouthOpen={speech.open} />
  ) : (
    <Portrait who={who} name={name} size={size} expression={mood.face} gesture={mood.gesture} mouthOpen={speech.open} crop={size >= 96 ? "bust" : "head"} />
  );
  return (
    <div className={[styles.speech, big ? styles.big : "", className].filter(Boolean).join(" ")}>
      {person}
      <button type="button" className={styles.bubbleButton} onClick={speech.skip} title={speech.talking ? "Show the whole line" : undefined} tabIndex={speech.talking ? 0 : -1}>
        <SpeechBubble who={who} name={name} tail={big ? "top" : "left"}>
          {/* The whole line holds the bubble's size; the typed part sits on top of it. Screen
              readers get the whole line at once, never the letters as they arrive. */}
          <span className={styles.line}>
            <span className={styles.ghost} aria-hidden="true">
              {text}
            </span>
            <span className={styles.typed} aria-hidden={speech.talking ? true : undefined}>
              {speech.shown}
            </span>
            {speech.talking ? <span className="visually-hidden">{text}</span> : null}
          </span>
        </SpeechBubble>
      </button>
    </div>
  );
}
