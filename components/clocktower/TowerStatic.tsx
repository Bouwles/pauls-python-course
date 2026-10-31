import { getIndex } from "@/lib/content/server";
import type { FloorState } from "./floors";
import { TowerOverview } from "./TowerOverview";

// The Clocktower overview for the landing page (REDESIGN-2.md 6): all nine floors, each in its
// resident's colour with the room, the Act's subject and the room's icon. A server component:
// it reads the Act subjects from the content index. In a client component, use TowerOverview
// and pass the subjects in.
export function TowerStatic({ state = "open", className }: { state?: FloorState; className?: string } = {}) {
  const index = getIndex();
  const subjects = Object.fromEntries(index.acts.map((a) => [a.number, a.subject]));
  const names = Object.fromEntries(Object.values(index.characters).map((c) => [c.id, c.name]));
  return <TowerOverview subjects={subjects} names={names} state={state} className={className} />;
}
