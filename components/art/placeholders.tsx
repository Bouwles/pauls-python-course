// The placeholders, shown by <Art> until the illustrator's file arrives:
// the pixel cast (lib/pixel/people.ts), the pixel rooms and tower (lib/pixel/rooms.ts), and a
// pixel tile with an icon for things.
import { CAST_IDS, castColour, type Floor } from "@/lib/cast";
import { Icon } from "../ui/Icon";
import { PixelPerson } from "./PixelPerson";
import { PixelRoom, PixelTowerPicture } from "./PixelRoom";
import { ShelfTile } from "./ShelfObject";
import { Portrait } from "./Portrait";
import styles from "./Art.module.css";

export const castName = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

/** An image with words for a screen reader, or a decoration with none. */
const named = (alt: string) => (alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true as const });

type Colours = React.CSSProperties & { "--tint"?: string; "--tint-ink"?: string };
const colours = (who: string): Colours => {
  const c = castColour(who);
  return { "--tint": c.face, "--tint-ink": c.ink };
};

/** A portrait: the character's pixel self, head and shoulders, on a tile in their colour. */
export function PortraitPlaceholder({ who, name, size, alt, className }: { who: string; name: string; size: number; alt: string; className?: string }) {
  return <Portrait who={who} name={name} size={size} className={className} label={alt || name} />;
}

/** A full-body slot: the character from the waist up, waving, on a tile in their colour. */
export function BodyPlaceholder({ who, name, size, alt, className }: { who: string; name: string; size: number; alt: string; className?: string }) {
  return (
    <span className={cx(styles.block, styles.body, className)} style={{ ...colours(who), width: size }} {...named(alt)}>
      <PixelPerson who={who} pose="wave" expression="pleased" size={size} />
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

/** The building around the floors: the pixel Clocktower, every floor lit, nobody in. */
export function TowerPlaceholder({ size, alt, className }: { size: number; alt: string; className?: string }) {
  return <PixelTowerPicture size={size} state="open" label={alt || undefined} className={className} />;
}

/**
 * One floor of the Clocktower: its pixel room in the state, at the biggest
 * whole-number scale that fits `size`. Locked is dark under dust sheets, open has the lights on,
 * busy has the residents in.
 */
export function FloorPlaceholder({ floor, state, size, alt, className }: { floor: Floor; state: string; size: number; alt: string; className?: string }) {
  const s = state === "locked" || state === "busy" ? state : "open";
  return <PixelRoom act={floor.act} state={s} size={size} label={alt || undefined} className={className} />;
}

/** A project's Shelf object: the pixel tile, its object on the client's colour. */
export function ShelfPlaceholder({ jobId, title, who, size, alt, className }: { jobId: string; title?: string; who?: string; size: number; alt: string; className?: string }) {
  return <ShelfTile jobId={jobId} title={title} who={who} size={size} alt={alt} className={className} />;
}

/** The duck: the drawn duck icon in the sun colour. */
export function DuckPlaceholder({ size, alt, className }: { size: number; alt: string; className?: string }) {
  return (
    <span className={cx(styles.duck, className)} style={{ width: size, height: size }} {...named(alt)}>
      <Icon name="duck" size={size} />
    </span>
  );
}
