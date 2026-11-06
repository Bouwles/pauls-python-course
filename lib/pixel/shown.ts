// Whether a gesture shows from where someone sits in a room: the desk in front hides hands and
// props held at chest height, so a celebration there would be lost. Worked out once, ahead of time,
// for every room, cast member and gesture (scripts/build-room-visibility.ts writes
// shown.generated.ts), so pages only look the answer up. Anything newer than the table (a gesture
// added since) is worked out the slow way and remembered.
import { drawRoom, residentsOf } from "./rooms";
import { drawPerson, H as PERSON_H, W as PERSON_W, type Grid } from "./people";
import { CAST_LOOKS } from "./looks";
import { gestureOf } from "./gestures";
import { HIDDEN, KNOWN } from "./shown.generated";

const FRONTS = new Map<number, ReturnType<typeof drawRoom>["front"]>();
const RESTING = new Map<string, Grid>();
const SHOWN = new Map<string, boolean>();

/**
 * Work it out: count the pixels the gesture changes from standing still that the room's front layer
 * leaves in view, at a few of its beats. About a hand and a bit of what it holds is enough.
 */
export function computeShows(act: number, who: string, gesture: string): boolean {
  const look = CAST_LOOKS[who];
  const spots = residentsOf(act);
  const seat = spots.find((s) => s.who === who) ?? spots[0];
  if (!look || !seat) return true;
  let front = FRONTS.get(act);
  if (!front) {
    front = drawRoom(act, "open").front;
    FRONTS.set(act, front);
  }
  let rest = RESTING.get(who);
  if (!rest) {
    rest = drawPerson(look, { pose: "idle" });
    RESTING.set(who, rest);
  }
  const g = gestureOf(gesture);
  let most = 0;
  for (let beat = 0; beat < g.beats; beat += Math.max(1, Math.ceil(g.beats / 3))) {
    const d = drawPerson(look, { pose: gesture, beat });
    let n = 0;
    for (let y = 0; y < PERSON_H; y++)
      for (let x = 0; x < PERSON_W; x++) {
        if (d.c[y]?.[x] === rest.c[y]?.[x]) continue;
        const rx = seat.x + x;
        const ry = seat.y + y;
        if (rx >= 0 && ry >= 0 && rx < front.w && ry < front.h && !front.c[ry * front.w + rx]) n++;
      }
    most = Math.max(most, n);
  }
  return most >= 45;
}

/** Whether enough of `gesture` shows from where `who` sits in Act `act`'s room. */
export function showsInRoom(act: number, who: string | undefined, gesture: string): boolean {
  if (!who || gesture === "idle") return true;
  const key = `${act}|${who}|${gesture}`;
  if (KNOWN.has(gesture) && CAST_LOOKS[who] && act >= 1 && act <= 9) return !HIDDEN.has(key);
  const known = SHOWN.get(key);
  if (known !== undefined) return known;
  const ok = computeShows(act, who, gesture);
  SHOWN.set(key, ok);
  return ok;
}
