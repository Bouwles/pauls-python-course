import { floorFor } from "@/lib/cast";
import { FloorFace } from "./Tower";
import type { FloorState } from "./floors";

// One floor of the Clocktower as a picture: its pixel room in its state,
// set in the tower's brick. Locked is dark with the furniture under dust sheets, open has the
// lights on, busy has the residents in. The side sheet's banner and anything else that shows a
// floor on its own use this; the tower itself lays the rooms out in TowerFrame.

/** `bare`: no sign on the room (the side sheet's banner, under the room's name as a title). */
export function FloorArt({ act, state, bare = false, className }: { act: number; state: FloorState; names?: Record<string, string>; bare?: boolean; className?: string }) {
  const floor = floorFor(act);
  if (!floor) return null;
  return <FloorFace act={act} state={state} room={floor.room} bare={bare} className={className} />;
}
