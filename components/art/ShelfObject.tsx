import { Art, hasFinalArt } from "./Art";
import { ShelfPlaceholder } from "./placeholders";
import { shelfId } from "./spec";

/**
 * A project's Shelf object (REDESIGN-2.md 8.5). With the illustrator's drawing, that; until then
 * a Phosphor icon that matches the program, on a tile in the client's colour. Decoration: the
 * project's name always sits beside it.
 */
export function ShelfObject({ jobId, title, client, size = 48, className }: { jobId: string; title?: string; client?: string; size?: number; className?: string }) {
  const id = shelfId(jobId);
  if (hasFinalArt(id)) return <Art id={id} size={size} alt="" className={className} />;
  return <ShelfPlaceholder jobId={jobId} title={title} who={client} size={size} alt="" className={className} />;
}
