import { castColour } from "@/lib/cast";
import type { Pose as Gesture } from "@/lib/pixel/people";
import { PixelPerson } from "./PixelPerson";
import type { Expression, Pose } from "./spec";
import styles from "./Portrait.module.css";

export type { Expression, Pose } from "./spec";
export type { Gesture };

/** Fit a person's crop into `inner` pixels: whole-number scales when there's room, else shrink. */
function fit(inner: number, cropWidth: number): number {
  return inner >= cropWidth ? Math.floor(inner / cropWidth) : inner / cropWidth;
}

/**
 * A character's portrait (REDESIGN3_PLAN.md P1): their pixel self, head and shoulders, on a square
 * tile in their colour with a pixel edge. Alive: they blink and breathe, and their mouth moves
 * while `talking`. Used for the coach, name tags, the class and the Clocktower's residents.
 */
export function Portrait({
  who,
  name,
  size = 64,
  expression = "neutral",
  gesture = "idle",
  talking = false,
  mouthOpen,
  crop,
  animate = true,
  className,
  onClick,
  label,
}: {
  who: string;
  name: string;
  size?: number;
  expression?: Expression;
  /** Shown when the crop is the bust (from 96 px up, or asked for). */
  gesture?: Gesture;
  talking?: boolean;
  mouthOpen?: boolean | 0 | 1 | 2;
  crop?: "head" | "bust";
  animate?: boolean;
  className?: string;
  onClick?: () => void;
  label?: string;
}) {
  const c = castColour(who);
  const style = { width: size, height: size, background: c.face } as React.CSSProperties;
  const shown = crop ?? (size >= 96 ? "bust" : "head");
  const inner = (
    <PixelPerson
      who={who}
      expression={expression}
      pose={shown === "bust" ? gesture : "idle"}
      talking={talking}
      mouthOpen={mouthOpen}
      animate={animate}
      crop={shown}
      scale={fit(size - 4, shown === "bust" ? 48 : 32)}
      className={styles.person}
    />
  );
  if (onClick)
    return (
      <button type="button" className={[styles.portrait, styles.button, className].filter(Boolean).join(" ")} style={style} onClick={onClick} aria-label={label ?? name} data-expression={expression}>
        {inner}
      </button>
    );
  return (
    <span className={[styles.portrait, className].filter(Boolean).join(" ")} style={style} role="img" aria-label={label ?? name} data-expression={expression}>
      {inner}
    </span>
  );
}

/**
 * The large slot (Ask, Ship, "Meet the class"): the character's pixel self from the waist up on a
 * tile in their colour, their name below. They can talk and gesture (wave, cheer, think...).
 */
export function Figure({
  who,
  name,
  height = 360,
  className,
  caption,
  expression = "neutral",
  gesture = "idle",
  talking = false,
  mouthOpen,
}: {
  who: string;
  name: string;
  height?: number;
  className?: string;
  caption?: string;
  expression?: Expression;
  /** Older name for a pose from the illustration plan; pixel people use `gesture`. */
  pose?: Pose;
  gesture?: Gesture;
  talking?: boolean;
  mouthOpen?: boolean | 0 | 1 | 2;
}) {
  const c = castColour(who);
  const k = Math.max(2, Math.floor((height - 64) / 52));
  return (
    <figure className={[styles.figure, className].filter(Boolean).join(" ")} style={{ minHeight: height, background: c.face }} aria-label={caption ?? name}>
      <PixelPerson who={who} expression={expression} pose={gesture} talking={talking} mouthOpen={mouthOpen} scale={k} className={styles.figurePerson} />
      <figcaption className={styles.figureName} style={{ background: c.face, color: c.ink }}>
        {name}
      </figcaption>
    </figure>
  );
}
