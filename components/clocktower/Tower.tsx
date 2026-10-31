import { FloorArt, floorPalette, floorVars } from "./FloorArt";
import type { FloorState } from "./floors";
import styles from "./Tower.module.css";

// The Clocktower drawn as a cross-section (REDESIGN-2.md 5): a spire and the clock on top,
// nine floors stacked inside the walls, the plinth at the bottom. The floors are passed in as
// list items, top floor first, so the same frame serves the learner's tower and the visitors'
// overview.

/** The clock has said 3:14 for years. Paul keeps promising to fix it. */
export const STUCK_CLOCK = { h: 3, m: 14 };

export function TowerFrame({ children, label, clock = STUCK_CLOCK, className }: { children: React.ReactNode; label: string; clock?: { h: number; m: number }; className?: string }) {
  return (
    <div className={[styles.tower, className].filter(Boolean).join(" ")}>
      <div className={styles.top} aria-hidden="true">
        <svg className={styles.spire} viewBox="0 0 100 40" preserveAspectRatio="none" focusable="false">
          <path d="M0 40L50 0l50 40z" />
        </svg>
        <div className={styles.turret}>
          <Clock {...clock} />
        </div>
      </div>
      <div className={styles.cornice} aria-hidden="true" />
      <ol className={styles.floors} aria-label={label}>
        {children}
      </ol>
      <div className={styles.plinth} aria-hidden="true" />
    </div>
  );
}

/** A clock face with twelve marks and two hands. */
function Clock({ h, m }: { h: number; m: number }) {
  const hour = ((h % 12) + m / 60) * 30;
  const minute = m * 6;
  return (
    <svg className={styles.clock} viewBox="0 0 100 100" focusable="false">
      <circle cx="50" cy="50" r="46" className={styles.clockFace} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="50" y1={i % 3 === 0 ? 10 : 12} x2="50" y2="17" transform={`rotate(${i * 30} 50 50)`} className={styles.tick} />
      ))}
      <line x1="50" y1="50" x2="50" y2="28" transform={`rotate(${hour} 50 50)`} className={styles.hourHand} />
      <line x1="50" y1="50" x2="50" y2="18" transform={`rotate(${minute} 50 50)`} className={styles.minuteHand} />
      <circle cx="50" cy="50" r="4" className={styles.pin} />
    </svg>
  );
}

/**
 * What a floor shows: its art layer, and over it the room's name and a line under it. `badges`
 * sit beside the name (the lock, "Pro").
 */
export function FloorFace({ act, state, room, sub, badges, names }: { act: number; state: FloorState; room: string; sub: React.ReactNode; badges?: React.ReactNode; names?: Record<string, string> }) {
  return (
    <span className={[floorPalette, styles.face].join(" ")} data-state={state} style={floorVars(act)}>
      <FloorArt act={act} state={state} names={names} />
      <span className={styles.label}>
        <span className={styles.room}>
          <span className={styles.roomName}>{room}</span>
          {badges}
        </span>
        <span className={styles.sub}>{sub}</span>
      </span>
    </span>
  );
}

export { styles as towerStyles };
