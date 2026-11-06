// Every project is open to everyone: the course runs locally for the owner and their friends,
// with no payments. Content routes still ask here, so a project that doesn't exist is a 404.
import { getJobSummary } from "../content/server";

export async function jobExists(jobId: string): Promise<boolean> {
  return Boolean(getJobSummary(jobId));
}

/** The id of the project a tests or solution key belongs to: "job/step" or "job/stretch-x". */
export function jobOfKey(key: string): string {
  return key.split("/")[0] ?? "";
}
