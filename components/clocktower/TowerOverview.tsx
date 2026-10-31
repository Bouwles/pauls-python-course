import { FLOORS_TOP_DOWN, type FloorState } from "./floors";
import { FloorFace, TowerFrame, towerStyles } from "./Tower";

// The whole Clocktower for visitors: every floor lit in its resident's colour, with the room,
// what that Act teaches and the room's icon, the ground floor at the bottom. No progress and
// nothing to click. Pure, so it renders on the server or in a client component.
export function TowerOverview({ subjects, names, state = "open", className }: { subjects: Record<number, string>; names?: Record<string, string>; state?: FloorState; className?: string }) {
  return (
    <TowerFrame label="The Clocktower, top floor first" className={className}>
      {FLOORS_TOP_DOWN.map((f) => (
        <li key={f.act} className={towerStyles.floor}>
          <FloorFace act={f.act} state={state} room={f.room} sub={subjects[f.act] ?? f.label} names={names} />
        </li>
      ))}
    </TowerFrame>
  );
}
