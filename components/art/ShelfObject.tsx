import { castColour } from "@/lib/cast";
import { shelfIcon } from "@/lib/shelf-icons";
import { Icon, type IconName } from "../ui/Icon";
import { Art, hasFinalArt } from "./Art";
import { shelfId } from "./spec";
import styles from "./ShelfObject.module.css";

/** Draws an object from cells on the icons' 24 grid, given as [x, y, width] runs. */
function cells(runs: [number, number, number][]) {
  const d = runs.map(([x, y, w]) => `M${x} ${y}h${w}v1h-${w}z`).join("");
  return function Drawn({ size }: { size: number }) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" focusable="false" aria-hidden="true" style={{ display: "block", flex: "none", shapeRendering: "crispEdges" }}>
        <path d={d} />
      </svg>
    );
  };
}

// Objects the icon set has nothing close to, drawn on its grid in its line weight.
const DRAWN: Partial<Record<IconName, ReturnType<typeof cells>>> = {
  // A ruler, for the unit converter: an outline with marks along the top, every third one long.
  ruler: cells([
    [2, 8, 20],
    [2, 9, 1], [5, 9, 1], [8, 9, 1], [11, 9, 1], [14, 9, 1], [17, 9, 1], [21, 9, 1],
    [2, 10, 1], [5, 10, 1], [8, 10, 1], [11, 10, 1], [14, 10, 1], [17, 10, 1], [21, 10, 1],
    [2, 11, 1], [8, 11, 1], [14, 11, 1], [21, 11, 1],
    [2, 12, 1], [21, 12, 1],
    [2, 13, 1], [21, 13, 1],
    [2, 14, 1], [21, 14, 1],
    [2, 15, 20],
  ]),
};

/**
 * A pixel tile for anything on the Shelf: the object (a pixel icon, or a drawn one where no icon
 * fits) on a square in the client's colour, with the pixel edge every tile has. The icon is drawn
 * at 24 or 48 so it stays crisp.
 */
export function ShelfTile({ jobId, title, who, size, alt = "", className }: { jobId: string; title?: string; who?: string; size: number; alt?: string; className?: string }) {
  const c = castColour(who ?? "");
  const name = shelfIcon(jobId, title);
  const icon = size >= 72 ? 48 : size >= 28 ? 24 : 16;
  const Drawn = DRAWN[name];
  return (
    <span
      className={[styles.tile, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, background: c.face, color: c.ink }}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true as const })}
    >
      {Drawn ? <Drawn size={icon} /> : <Icon name={name} size={icon} />}
    </span>
  );
}

/**
 * A project's Shelf object. With the illustrator's drawing, that; until then
 * the pixel tile. Decoration: the project's name always sits beside it.
 */
export function ShelfObject({ jobId, title, client, size = 48, className }: { jobId: string; title?: string; client?: string; size?: number; className?: string }) {
  const id = shelfId(jobId);
  if (hasFinalArt(id)) return <Art id={id} size={size} alt="" className={className} />;
  return <ShelfTile jobId={jobId} title={title} who={client} size={size} className={className} />;
}
