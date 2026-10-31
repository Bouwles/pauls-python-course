// What the Clocktower page sends to the browser: the Acts with only the fields the tower,
// the side sheet and the list read, the cast's names, and each project's step titles (for
// the Continue card's "Step 4 of 12: Poke at the sums"). Server only.
import { getIndex, getJob } from "@/lib/content/server";
import type { ActSummary, PlacementSummary } from "@/lib/content/types";

export interface TowerData {
  acts: ActSummary[];
  placements: PlacementSummary[];
  names: Record<string, string>;
  /** jobId to [stepId, step title] in order. */
  steps: Record<string, [string, string][]>;
}

let cached: { version: string; data: TowerData } | null = null;

export function towerData(): TowerData {
  const index = getIndex();
  if (cached && cached.version === index.version) return cached.data;
  // The heavy lists (concepts, datasets, Act intros) stay on the server.
  const acts: ActSummary[] = index.acts.map((a) => ({
    ...a,
    intro: [],
    jobs: a.jobs.map((j) => ({ ...j, conceptsIntroduced: [], conceptsReviewed: [], datasets: [] })),
  }));
  const steps: TowerData["steps"] = {};
  for (const a of index.acts)
    for (const j of a.jobs) {
      if (j.status !== "written") continue;
      const job = getJob(j.id);
      if (job) steps[j.id] = job.steps.map((s) => [s.id, s.title]);
    }
  const names = Object.fromEntries(Object.values(index.characters).map((c) => [c.id, c.name]));
  const data = { acts, placements: index.placements ?? [], names, steps };
  cached = { version: index.version, data };
  return data;
}
