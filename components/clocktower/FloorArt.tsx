import { castColour, floorFor, CAST_IDS } from "@/lib/cast";
import { Icon } from "../ui/Icon";
import { Portrait } from "../art/Portrait";
import { Art, hasFinalArt } from "../art/Art";
import { floorId } from "../art/spec";
import type { FloorState } from "./floors";
import styles from "./FloorArt.module.css";

// One floor of the Clocktower as an image layer (REDESIGN-2.md 5.2 and 5.3). Each floor has
// three states: locked (dark, furniture under dust sheets), open (lights on) and busy (the
// resident in, more props). Until the illustrator's floors arrive this draws the placeholder:
// a clean rectangle in the resident's colour, the room's line icon, windows lit at night and
// pale by day, and the residents' portraits when the floor is busy.
//
// When the illustrator's floor for this state arrives (art id clocktower.floor2.open and so on,
// with an optional .day version), <Art> shows it instead, cropped to the slot from the right.
// Everything else in the tower stays the same.

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/** The colour variables a floor and its label read: the resident's colour and the ink on it. */
export function floorVars(act: number): React.CSSProperties {
  const floor = floorFor(act);
  const [lead = "paul", second] = floor?.residents ?? [];
  return {
    "--face": `var(--c-${lead}, ${castColour(lead).face})`,
    "--face-ink": castColour(lead).ink,
    ...(second && floor && floor.residents.length === 2 ? { "--face-2": `var(--c-${second}, ${castColour(second).face})`, "--face-2-ink": castColour(second).ink } : {}),
  } as React.CSSProperties;
}

/** The class that turns a floor's colour and state into fills for the current theme. */
export const floorPalette = styles.palette;

/** `bare`: no label sits over the art (the side sheet's banner), so narrow art keeps its windows. */
export function FloorArt({ act, state, names = {}, bare = false, className }: { act: number; state: FloorState; names?: Record<string, string>; bare?: boolean; className?: string }) {
  const floor = floorFor(act);
  if (!floor) return null;
  const id = floorId(act, state);
  if (hasFinalArt(id))
    return (
      <span className={[styles.palette, styles.art, styles.final, className].filter(Boolean).join(" ")} data-state={state} style={floorVars(act)} aria-hidden="true">
        <Art id={id} size={720} alt="" className={styles.finalImage} />
      </span>
    );
  const shared = floor.residents.length === 2;
  const roof = floor.residents.length > 2;
  return (
    <span className={[styles.palette, styles.art, bare ? styles.bare : "", className].filter(Boolean).join(" ")} data-state={state} style={floorVars(act)} aria-hidden="true">
      {shared ? <span className={styles.annex} /> : null}
      {roof ? (
        <span className={styles.lights} data-lights>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={styles.bulb} style={{ "--bulb": `var(--c-${CAST_IDS[i % CAST_IDS.length]})` } as React.CSSProperties} />
          ))}
        </span>
      ) : null}
      <span className={styles.room}>{state === "locked" ? <DustSheet /> : <Icon name={floor.icon} size={32} />}</span>
      <span className={styles.props}>
        {state === "busy" ? (
          <span className={styles.people}>
            {floor.residents.map((r) => (
              <Portrait key={r} who={r} name={names[r] ?? cap(r)} size={roof ? 22 : 28} className={styles.person} />
            ))}
            {roof ? null : (
              <span className={styles.plant}>
                <Icon name="plant" size={24} />
              </span>
            )}
          </span>
        ) : null}
        {roof ? null : (
          <span className={styles.windows}>
            <span className={styles.window} />
            <span className={styles.window} />
            <span className={styles.window} />
          </span>
        )}
      </span>
    </span>
  );
}

/** Furniture under a dust sheet: a draped shape with one fold, drawn on Phosphor's grid. */
function DustSheet() {
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" className={styles.sheet} focusable="false">
      <path d="M2 30c3-3 4-9 5-15S11 4 17 4h6c6 0 9 5 10 11s2 12 5 15z" className={styles.sheetCloth} />
      <path d="M20 6c-1 8-2 16-4 24" className={styles.sheetFold} />
    </svg>
  );
}
