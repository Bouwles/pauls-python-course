// The Clocktower's rules (REDESIGN-2.md 5): which floors are open, which are busy, and how a
// floor is named. Pure functions, shared by the tower, the side sheet, the list view and the
// visitors' overview on the landing page.
import { FLOORS, type Floor } from "@/lib/cast";
import { isDone, isShipped } from "@/lib/progress-rules";
import type { ActSummary, JobSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";

/** A floor's art has three states: covered and dark, lights on, and lived in. */
export type FloorState = "locked" | "open" | "busy";

export { FLOORS, type Floor };

/** The projects a floor counts: sidequests and placement tests don't. */
export function mainJobs(act: Pick<ActSummary, "jobs">): JobSummary[] {
  return act.jobs.filter((j) => !j.sidequest && !j.placementFor);
}

export interface FloorStats {
  total: number;
  shipped: number;
  written: number;
}

export function floorStats(act: Pick<ActSummary, "jobs">, progress: Record<string, JobProgressRow>): FloorStats {
  const jobs = mainJobs(act);
  return {
    total: jobs.length,
    shipped: jobs.filter((j) => isDone(progress[j.id])).length,
    written: jobs.filter((j) => j.status === "written").length,
  };
}

/**
 * Locked until the floor is open and, for Pro floors, the learner has Pro. Busy once about
 * half the floor's written projects are shipped (REDESIGN-2.md 5.2).
 */
export function floorState({ open, proLocked, stats }: { open: boolean; proLocked: boolean; stats: FloorStats }): FloorState {
  if (!open || proLocked) return "locked";
  const half = Math.max(1, Math.ceil(stats.written / 2));
  return stats.shipped >= half ? "busy" : "open";
}

/** "Floor 2: Real-World Python". */
export function floorName(floor: Floor, subject: string): string {
  return `${floor.label}: ${subject}`;
}

/** "Floor 2: Real-World Python. 3 of 10 shipped." */
export function floorLine(floor: Floor, subject: string, stats: FloorStats): string {
  return `${floorName(floor, subject)}. ${stats.shipped} of ${stats.total} shipped.`;
}

/** Floors from the top of the tower down, the order they're drawn in. */
export const FLOORS_TOP_DOWN: Floor[] = [...FLOORS].sort((a, b) => b.act - a.act);

/** A project's status as a badge: its words and its tone. */
export function jobBadge(row: JobProgressRow | undefined, j: Pick<JobSummary, "status">): { text: string; tone: "shipped" | "progress" | "neutral" } {
  if (j.status !== "written") return { text: "Being written", tone: "neutral" };
  if (row?.status === "shipped-stretch") return { text: "Shipped with stretch", tone: "shipped" };
  if (row?.status === "placed") return { text: "Placed", tone: "shipped" };
  if (isShipped(row)) return { text: "Shipped", tone: "shipped" };
  if (row?.status === "in-progress") return { text: "In progress", tone: "progress" };
  return { text: "Not started", tone: "neutral" };
}
