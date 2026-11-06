import { getIndex } from "@/lib/content/server";
import type { FloorState } from "./floors";
import { TowerOverview } from "./TowerOverview";

// The Clocktower for the landing page: all nine floors as pixel rooms, the
// whole class at work in them, each room's name on its sign and the Act's subject for screen
// readers. A server component: it reads the Act subjects from the content index. In a client
// component, use TowerOverview and pass the subjects in.
export function TowerStatic({ state = "busy", className }: { state?: FloorState | Record<number, FloorState>; className?: string } = {}) {
  const index = getIndex();
  const subjects = Object.fromEntries(index.acts.map((a) => [a.number, a.subject]));
  return <TowerOverview subjects={subjects} state={state} className={className} />;
}
