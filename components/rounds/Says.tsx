"use client";

// A one-line dialogue strip: the speaker's head, a name plate in their colour, and the line
// in the pixel face. Moss sends you on the Rounds; Pip heckles at the speed bench.
import { castColour } from "@/lib/cast";
import { Head } from "../world/CharacterPortrait";
import styles from "./Says.module.css";

export function Says({ id, name, sprite, children, live = false }: { id: string; name: string; sprite?: string; children: React.ReactNode; live?: boolean }) {
  const colour = castColour(id);
  return (
    <div className={["frame-dialogue", styles.says].join(" ")}>
      <span className={styles.head}>
        <Head id={id} sprite={sprite ?? id} scale={2} />
      </span>
      <p className={styles.line} aria-live={live ? "polite" : undefined}>
        <span className={styles.plate} style={{ background: colour.face, color: colour.ink }}>
          {name}
        </span>
        <span className="visually-hidden">: </span>
        <span className={styles.text}>{children}</span>
      </p>
    </div>
  );
}
