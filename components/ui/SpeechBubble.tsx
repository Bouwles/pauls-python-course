import { castColour } from "@/lib/cast";
import styles from "./SpeechBubble.module.css";

// The speech bubble (REDESIGN-2.md 3, 4.4): surface-2, 8 px corners, a small tail pointing at
// the character, and a name tag in their colour above the text. No coloured left edge.
export function SpeechBubble({ who, name, tail = "left", children, className }: { who: string; name?: string; tail?: "left" | "top" | "bottom" | "none"; children: React.ReactNode; className?: string }) {
  const c = castColour(who);
  return (
    <div className={[styles.bubble, styles[`tail-${tail}`], className].filter(Boolean).join(" ")}>
      {name ? (
        <span className={styles.name} style={{ background: c.face, color: c.ink }}>
          {name}
        </span>
      ) : null}
      <div className={styles.text}>{children}</div>
    </div>
  );
}
