// What is open: districts (Acts) and buildings, from what the learner has shipped.
import type { ActSummary, JobSummary, PlacementSummary } from "./content/types";
import type { JobProgressRow } from "./store/types";

export const isShipped = (row: JobProgressRow | undefined) => row?.status === "shipped" || row?.status === "shipped-stretch";
/** Shipped, or passed by placement test: either way the Job counts for what opens next. */
export const isDone = (row: JobProgressRow | undefined) => isShipped(row) || row?.status === "placed";

/** Acts the learner has placed past by passing that Act's placement section. */
export function placedActs(placements: PlacementSummary[], progress: Record<string, JobProgressRow>): Set<string> {
  return new Set(placements.filter((p) => isShipped(progress[p.jobId])).map((p) => p.act));
}

/**
 * Act I is open from the start. Each later Act opens when the one before has its
 * last written Job shipped (or placed), or when the learner passed that Act's
 * placement section. Outline Jobs and sidequests never hold a door shut.
 */
export function openActs(acts: ActSummary[], progress: Record<string, JobProgressRow>, placements: PlacementSummary[] = []): Set<string> {
  const open = new Set<string>();
  const placed = placedActs(placements, progress);
  const sorted = [...acts].sort((a, b) => a.number - b.number);
  sorted.forEach((act, i) => {
    if (i === 0) {
      open.add(act.id);
      return;
    }
    const prev = sorted[i - 1]!;
    const finalJob = [...prev.jobs].reverse().find((j) => j.status === "written" && !j.sidequest);
    if (open.has(prev.id) && (placed.has(prev.id) || (finalJob && isDone(progress[finalJob.id])))) open.add(act.id);
  });
  return open;
}

export function openBuildings(acts: ActSummary[], progress: Record<string, JobProgressRow>): Set<string> {
  const open = new Set<string>(["workshop"]);
  for (const act of acts) for (const j of act.jobs) if (isDone(progress[j.id])) open.add(j.building);
  return open;
}

/** The job to suggest next: the first unshipped, written job in the first open Act that has one. */
export function nextJob(acts: ActSummary[], progress: Record<string, JobProgressRow>, placements: PlacementSummary[] = []): JobSummary | null {
  const open = openActs(acts, progress, placements);
  for (const act of [...acts].sort((a, b) => a.number - b.number)) {
    if (!open.has(act.id)) continue;
    const j = act.jobs.find((x) => x.status === "written" && !x.sidequest && !isDone(progress[x.id]));
    if (j) return j;
  }
  return null;
}
