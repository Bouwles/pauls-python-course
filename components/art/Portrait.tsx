import { castColour } from "@/lib/cast";
import { Art, hasFinalArt } from "./Art";
import { bodyId, portraitId, type Expression, type Pose } from "./spec";
import styles from "./Portrait.module.css";

export type { Expression, Pose } from "./spec";

const initial = (name: string) => name.trim().charAt(0).toUpperCase();

/** The portrait to show: the expression asked for, else their neutral one, else none yet. */
function portraitArt(who: string, expression: Expression): string | null {
  const id = portraitId(who, expression);
  if (hasFinalArt(id)) return id;
  const neutral = portraitId(who, "neutral");
  return hasFinalArt(neutral) ? neutral : null;
}

/**
 * A character's portrait in a circle (REDESIGN-2.md 4.4 and 8.5): the coach, name tags, the
 * class. With the illustrator's art, the half-body portrait in the expression asked for, cut to
 * a circle on the character's colour. Until then a circle in their colour with their initial.
 */
export function Portrait({ who, name, size = 64, expression = "neutral", className, onClick, label }: { who: string; name: string; size?: number; expression?: Expression; className?: string; onClick?: () => void; label?: string }) {
  const c = castColour(who);
  const art = portraitArt(who, expression);
  const style = { width: size, height: size, background: c.face, color: c.ink, fontSize: Math.round(size * 0.46) } as React.CSSProperties;
  const inner = art ? (
    <Art id={art} size={size} alt="" className={styles.art} />
  ) : (
    <span className={styles.initial} aria-hidden="true">
      {initial(name)}
    </span>
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
 * The large illustration slot (Ask, Ship, "Meet the class"): a half-body portrait in an
 * expression, or a full-body pose. With the illustrator's art, the drawing itself at `height`;
 * until then a rounded rectangle in the character's colour, their initial large, and their name.
 */
export function Figure({ who, name, height = 360, className, caption, expression = "neutral", pose }: { who: string; name: string; height?: number; className?: string; caption?: string; expression?: Expression; pose?: Pose }) {
  const id = pose ? bodyId(who, pose) : portraitArt(who, expression);
  const c = castColour(who);
  if (id && hasFinalArt(id)) {
    const width = pose ? Math.round(height / 2) : height;
    return (
      <figure className={[styles.figureArt, className].filter(Boolean).join(" ")} style={{ minHeight: height }}>
        <Art id={id} size={width} alt={caption ?? name} />
      </figure>
    );
  }
  return (
    <figure className={[styles.figure, className].filter(Boolean).join(" ")} style={{ minHeight: height, background: c.face, color: c.ink }} aria-label={caption ?? name}>
      <span className={styles.figureInitial} aria-hidden="true">
        {initial(name)}
      </span>
      <figcaption className={styles.figureName}>{name}</figcaption>
    </figure>
  );
}
