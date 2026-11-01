import { floorFor } from "@/lib/cast";
import { Portrait } from "../art/Portrait";
import { PixelClock } from "./PixelClock";
import styles from "./FloorResident.module.css";

/**
 * Who runs a floor of the Clocktower, as a 76 px pixel tile: the resident's head on their colour
 * (a second resident, as in the Arcade, on its corner a size down), or the stuck clock for the
 * roof, which is everyone's. Used by the landing page's floor directory and the syllabus.
 */
export function FloorResident({ act, names, className }: { act: number; names: Record<string, string>; className?: string }) {
  const floor = floorFor(act);
  if (!floor) return null;
  const name = (id: string) => names[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
  return (
    <span className={[styles.who, className].filter(Boolean).join(" ")}>
      {floor.residents.length > 2 ? (
        <span className={styles.roof} role="img" aria-label="Everyone's floor: the clock, stuck at 3:14">
          <PixelClock scale={3} />
        </span>
      ) : (
        floor.residents.map((id, i) => <Portrait key={id} who={id} name={name(id)} size={i ? 44 : 76} crop="head" animate={false} className={i ? styles.second : undefined} label={`Run by ${name(id)}`} />)
      )}
    </span>
  );
}
