// Server-side gating (REDESIGN.md 8.3): Pro projects' steps, tests, starters and solutions
// reach a browser only when that learner may open the project. Every content route asks here.
import { getIndex, getJobSummary } from "../content/server";
import { getDb } from "./db";
import { jobAccess, type JobAccess } from "./entitlements";

export async function accessToJob(jobId: string, userId: string | null): Promise<JobAccess | "missing"> {
  const job = getJobSummary(jobId);
  if (!job) return "missing";
  const act = getIndex().acts.find((a) => a.id === job.act);
  const first = act?.jobs.find((j) => !j.sidequest && !j.placementFor)?.id === job.id;
  // The placement tests check what someone already knows, so they stay open to everyone.
  if (job.placementFor) return { open: true };
  return jobAccess(await getDb(), userId, job, first);
}

/** The id of the project a tests or solution key belongs to: "job/step" or "job/stretch-x". */
export function jobOfKey(key: string): string {
  return key.split("/")[0] ?? "";
}
