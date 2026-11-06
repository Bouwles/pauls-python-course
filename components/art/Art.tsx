import Image from "next/image";
import { FINAL } from "./final.generated";
import { BodyPlaceholder, DuckPlaceholder, FloorPlaceholder, GroupPlaceholder, PortraitPlaceholder, ShelfPlaceholder, TowerPlaceholder, castName } from "./placeholders";
import { canvasFor, parseArtId } from "./spec";
import styles from "./Art.module.css";

// One illustration from the art pipeline, by its id in art/manifest.json:
//   <Art id="paul.portrait.pleased" size={64} alt="Paul, pleased" />
// When the manifest marks the image final (scripts/check-art.ts keeps final.generated.ts in
// step with it), the artist's PNG from art/final/ is shown through Next.js image optimisation:
// resized to the display width and its double, as AVIF or WebP when the browser takes them,
// with a matching srcset. Until then, the placeholder for that kind of slot. Avatar parts have
// no placeholder: the learner's avatar stays an initials circle until its parts arrive.

export interface ArtProps {
  id: string;
  /** The display width in CSS pixels (a portrait's diameter). It shrinks to fit a narrower box. */
  size: number;
  /** What it shows, for screen readers; "" when it's decoration beside words that say it. */
  alt: string;
  /** The character's name, for a placeholder's initial and caption. Defaults to the id's. */
  name?: string;
  /** Whose colour a placeholder takes, for things (a Shelf object takes its client's). */
  who?: string;
  /** A project's title, for picking its placeholder icon. */
  title?: string;
  className?: string;
  /** Load it early: only for an illustration that's the largest thing on the first screen. */
  preload?: boolean;
}

/** Whether the illustrator's image for `id` has arrived. */
export function hasFinalArt(id: string): boolean {
  return Object.hasOwn(FINAL, id);
}

export function Art({ id, size, alt, name, who, title, className, preload }: ArtProps) {
  const art = parseArtId(id);
  const canvas = canvasFor(id);
  if (!art || !canvas) return null;
  const width = Math.round(size);
  const height = Math.round((size * canvas.height) / canvas.width);
  const final = FINAL[id];
  if (final) {
    // The Clocktower follows the theme when there's a daylight version too; otherwise night in both.
    const day = (art.kind === "floor" || art.kind === "tower") && !art.day ? FINAL[`${id}.day`] : undefined;
    const image = (src: typeof final, time?: string) => (
      <Image src={src} alt={alt} width={width} height={height} preload={preload} className={[styles.image, time, className].filter(Boolean).join(" ")} />
    );
    return day ? (
      <>
        {image(final, styles.night)}
        {image(day, styles.day)}
      </>
    ) : (
      image(final)
    );
  }
  const character = art.who ?? "";
  const label = name ?? castName(character);
  switch (art.kind) {
    case "portrait":
      return <PortraitPlaceholder who={who ?? character} name={label} size={width} alt={alt} className={className} />;
    case "body":
      return <BodyPlaceholder who={who ?? character} name={label} size={width} alt={alt} className={className} />;
    case "group":
      return <GroupPlaceholder size={width} alt={alt} className={className} />;
    case "tower":
      return <TowerPlaceholder size={width} alt={alt} className={className} />;
    case "floor":
      return art.floor ? <FloorPlaceholder floor={art.floor} state={art.state ?? "open"} size={width} alt={alt} className={className} /> : null;
    case "shelf":
      return <ShelfPlaceholder jobId={art.project ?? ""} title={title} who={who} size={width} alt={alt} className={className} />;
    case "duck":
      return <DuckPlaceholder size={width} alt={alt} className={className} />;
    case "avatar":
      return null;
  }
}
