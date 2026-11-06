"use client";

import { moodOf } from "@/lib/mood";
import type { Expression, Pose } from "@/lib/pixel/people";
import { SpeechBubble } from "../ui/SpeechBubble";
import { Figure, Portrait } from "./Portrait";
import { useSpeech } from "./useSpeech";
import styles from "./Speech.module.css";

// A character saying a line (REDESIGN3_PLAN.md): their pixel self with the face and gesture the
// line calls for, the words typing out in a bubble, and the mouth moving with them. Click the
// bubble to finish the line. `face` and `gesture` come from content (`- riya.pleased.wave:`);
// without them the words choose the face (lib/mood.ts). The gesture is chosen for the speaker and
// the moment (lib/pixel/variety.ts): one content names exactly is kept, and one of the first six
// ("wave", "point"...) or none becomes a fitting variety of their own. Pass `seed` to make the
// moment differ from others with the same words, and `avoid` with the gesture just before. The
// button is named by its contents (the speaker's name and the whole line), not an aria-label, so
// the name always holds what's visible.

export function Speech({
  who,
  name,
  text,
  face,
  gesture,
  mood: chosen,
  seed,
  avoid,
  mode,
  size = 96,
  big = false,
  start = true,
  onDone,
  className,
  bubbleClassName,
}: {
  who: string;
  name: string;
  text: string;
  face?: string;
  gesture?: string;
  /** The face and gesture, already chosen for this moment (the coach chooses its lines' in order). */
  mood?: { face: Expression; gesture: Pose };
  /** What makes this moment differ from others with the same words (the step, the line's place, the visit). */
  seed?: string;
  /** Gestures not to pick: the one just before, so nothing comes twice in a row. */
  avoid?: (string | undefined)[];
  /** "talk" (a line, the default) or "moment" (a celebration, a greeting of their own). */
  mode?: "talk" | "moment";
  /** The portrait's size; `big` shows the large figure instead. */
  size?: number;
  big?: boolean;
  start?: boolean;
  onDone?: () => void;
  className?: string;
  /** On the bubble alone, for an entrance that leaves the speaker standing still. */
  bubbleClassName?: string;
}) {
  // A head-and-shoulders portrait (under 96 px) has no room for a prop that reaches past the head.
  const mood = chosen ?? moodOf(text, { face, gesture }, { who, seed, avoid, mode, small: !big && size < 96 });
  const speech = useSpeech(text, { start, onDone });
  const person = big ? (
    <Figure who={who} name={name} height={size} expression={mood.face} gesture={mood.gesture} mouthOpen={speech.open} />
  ) : (
    <Portrait who={who} name={name} size={size} expression={mood.face} gesture={mood.gesture} mouthOpen={speech.open} crop={size >= 96 ? "bust" : "head"} />
  );
  return (
    <div className={[styles.speech, big ? styles.big : "", className].filter(Boolean).join(" ")}>
      {person}
      <button type="button" className={[styles.bubbleButton, bubbleClassName].filter(Boolean).join(" ")} onClick={speech.skip} title={speech.talking ? "Show the whole line" : undefined} tabIndex={speech.talking ? 0 : -1}>
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
