// The logo: a snake curled into a P, drawn pixel by pixel on a 16-pixel
// grid with a dark outline like the cast's, and the wordmark "Paul's Python Course" in the pixel
// face beside it. Both are drawn at whole-pixel scales only (the mark at 16, 32, 48 or 64 px, the
// name at 16, 24, 32 or 40 px), so every edge stays crisp. The snake itself is in lib/pixel/mark.ts,
// shared with the favicons and the server-drawn images.
import { BRAND } from "@/lib/brand";
import { MARK_GRID, MARK_PATHS, type MarkPart } from "@/lib/pixel/mark";
import styles from "./Brand.module.css";

const GRID = MARK_GRID;
const FILL: Record<MarkPart, string> = { "#": "var(--sun)", s: "var(--sun-press)", e: "var(--sun-ink)", t: "var(--fail)", o: "var(--px-outline)" };

/** The nearest whole-pixel scale for a mark about `size` px tall. */
export const markScale = (size: number) => Math.max(1, Math.round(size / GRID));

export function Mark({ size = 32, title }: { size?: number; title?: string }) {
  const px = markScale(size) * GRID;
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${GRID} ${GRID}`}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={styles.mark}
    >
      {MARK_PATHS.map((p) => (
        <path key={p.part} d={p.d} style={{ fill: FILL[p.part] }} />
      ))}
    </svg>
  );
}

/** The mark and the name. `size` is the mark's height (it snaps to 16, 32, 48 or 64). */
export function Wordmark({ size = 32, short = false, className }: { size?: number; short?: boolean; className?: string }) {
  const k = markScale(size);
  return (
    <span className={[styles.wordmark, className].filter(Boolean).join(" ")} style={{ ["--mark" as string]: `${k * GRID}px`, ["--wordmark-size" as string]: `${8 * (k + 1)}px` }}>
      <Mark size={size} />
      <span className={styles.name}>{short ? BRAND.shortName : BRAND.name}</span>
    </span>
  );
}
