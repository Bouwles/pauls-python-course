import { FLOORS_TOP_DOWN, type FloorState } from "./floors";
import { FloorRoom, Sign, TowerFrame, towerStyles } from "./Tower";

// The whole Clocktower for visitors: every floor's pixel room, each with its name on a sign, the
// ground floor at the bottom. No progress and nothing to click. `state` is every floor's state,
// or one per Act.
export function TowerOverview({ subjects, state = "busy", className }: { subjects: Record<number, string>; names?: Record<string, string>; state?: FloorState | Record<number, FloorState>; className?: string }) {
  return (
    <TowerFrame label="The Clocktower, top floor first" className={className}>
      {FLOORS_TOP_DOWN.map((f) => {
        const s = typeof state === "string" ? state : (state[f.act] ?? "open");
        return (
          <li key={f.act} className={towerStyles.floor}>
            <FloorRoom act={f.act} state={s} sign={<Sign room={f.room} />} />
            <span className="visually-hidden">
              , {f.label.toLowerCase()}: {subjects[f.act] ?? f.label}
            </span>
          </li>
        );
      })}
    </TowerFrame>
  );
}
