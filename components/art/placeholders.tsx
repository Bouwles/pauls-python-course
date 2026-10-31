// The placeholders (REDESIGN-2.md 8.5), shown by <Art> until the illustrator's file arrives.
// Deliberately simple: flat shapes in a character's colour, their initial in the display face,
// a Phosphor icon for things. Expressions aren't faked; the speech bubble carries the feeling.
import { CAST_IDS, castColour, FLOORS, type Floor } from "@/lib/cast";
import { shelfIcon } from "@/lib/shelf-icons";
import { Icon } from "../ui/Icon";
import styles from "./Art.module.css";

export const castName = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
const initial = (name: string) => name.trim().charAt(0).toUpperCase();
const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

/** An image with words for a screen reader, or a decoration with none. */
const named = (alt: string) => (alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true as const });

type Colours = React.CSSProperties & { "--tint"?: string; "--tint-ink"?: string };
const colours = (who: string): Colours => {
  const c = castColour(who);
  return { "--tint": c.face, "--tint-ink": c.ink };
};

/** A portrait: a circle in the character's colour with their initial. */
export function PortraitPlaceholder({ who, name, size, alt, className }: { who: string; name: string; size: number; alt: string; className?: string }) {
  return (
    <span className={cx(styles.circle, className)} style={{ ...colours(who), width: size, height: size, fontSize: Math.round(size * 0.46) }} {...named(alt)}>
      <span className={styles.initial} aria-hidden="true">
        {initial(name)}
      </span>
    </span>
  );
}

/** A full-body pose: a rounded rectangle twice as tall as it's wide, the initial, the name. */
export function BodyPlaceholder({ who, name, size, alt, className }: { who: string; name: string; size: number; alt: string; className?: string }) {
  return (
    <span className={cx(styles.block, styles.body, className)} style={{ ...colours(who), width: size, fontSize: Math.round(size * 0.5) }} {...named(alt)}>
      <span className={styles.initial} aria-hidden="true">
        {initial(name)}
      </span>
      <span className={styles.blockName} style={{ fontSize: Math.max(14, Math.round(size * 0.09)) }} aria-hidden="true">
        {name}
      </span>
    </span>
  );
}

/** The class together: six portrait circles in a row on a quiet panel. */
export function GroupPlaceholder({ size, alt, className }: { size: number; alt: string; className?: string }) {
  const dot = Math.round(size / 9);
  return (
    <span className={cx(styles.block, styles.group, className)} style={{ width: size }} {...named(alt)}>
      <span className={styles.row} style={{ gap: Math.round(dot / 4) }} aria-hidden="true">
        {CAST_IDS.map((who) => (
          <PortraitPlaceholder key={who} who={who} name={castName(who)} size={dot} alt="" />
        ))}
      </span>
      <span className={styles.groupName} style={{ fontSize: Math.max(14, Math.round(size * 0.035)) }} aria-hidden="true">
        The class
      </span>
    </span>
  );
}

/** The building around the floors: a column of the nine floors in their colours, the clock on top. */
export function TowerPlaceholder({ size, alt, className }: { size: number; alt: string; className?: string }) {
  return (
    <span className={cx(styles.block, styles.tower, className)} style={{ width: size }} {...named(alt)}>
      <span className={styles.clock} aria-hidden="true">
        <Icon name="clock" size={Math.round(size * 0.2)} />
      </span>
      <span className={styles.stack} aria-hidden="true">
        {[...FLOORS].reverse().map((f) => (
          <span key={f.act} className={styles.band} style={colours(f.residents[0] ?? "")} />
        ))}
      </span>
    </span>
  );
}

/**
 * One floor of the Clocktower (REDESIGN-2.md 5.3): a band in the resident's colour with the room's
 * icon and name. Locked is muted with a padlock, open is in full colour, busy adds the residents.
 */
export function FloorPlaceholder({ floor, state, size, alt, className }: { floor: Floor; state: string; size: number; alt: string; className?: string }) {
  const roof = floor.act === FLOORS.length;
  // Everything inside scales with a floor's height (the roof is just taller).
  const unit = Math.max(48, Math.round(size / 6));
  const locked = state === "locked";
  return (
    <span
      className={cx(styles.floor, locked ? styles.locked : styles.lit, className)}
      style={{ ...colours(floor.residents[0] ?? ""), width: size, aspectRatio: roof ? "3 / 1" : "6 / 1", ["--u" as string]: `${unit}px` }}
      data-state={state}
      {...named(alt)}
    >
      <Icon name={floor.icon} size={Math.round(unit * 0.4)} className={styles.floorIcon} />
      <span className={styles.floorText} aria-hidden="true">
        <span className={styles.floorRoom}>{floor.room}</span>
        <span className={styles.floorLabel}>
          {locked ? <span className={styles.swatch} /> : null}
          {floor.label}
        </span>
      </span>
      {locked ? (
        <span className={styles.floorLock} aria-hidden="true">
          <Icon name="lock" size={Math.round(unit * 0.26)} />
        </span>
      ) : null}
      {state === "busy" ? (
        <span className={styles.residents} aria-hidden="true">
          {floor.residents.map((who) => (
            <PortraitPlaceholder key={who} who={who} name={castName(who)} size={Math.round(unit * 0.44)} alt="" className={styles.resident} />
          ))}
        </span>
      ) : null}
    </span>
  );
}

/** A project's Shelf object: a Phosphor icon that matches the program, on a tile in the client's colour. */
export function ShelfPlaceholder({ jobId, title, who, size, alt, className }: { jobId: string; title?: string; who?: string; size: number; alt: string; className?: string }) {
  return (
    <span className={cx(styles.tile, className)} style={{ ...colours(who ?? ""), width: size, height: size }} {...named(alt)}>
      <Icon name={shelfIcon(jobId, title)} size={Math.round(size * 0.52)} />
    </span>
  );
}

/** The duck: the drawn duck icon in the sun colour. */
export function DuckPlaceholder({ size, alt, className }: { size: number; alt: string; className?: string }) {
  return (
    <span className={cx(styles.duck, className)} style={{ width: size, height: size }} {...named(alt)}>
      <Icon name="duck" size={size} />
    </span>
  );
}
