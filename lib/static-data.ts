// On GitHub Pages there's no server to ask for a step's checks or its solution, so the Pages build
// (scripts/build-pages.ts) writes them as files under /data, and these read them. The solution
// keeps the same rule as the server (app/api/solution): passed, or all three hints and 8 minutes.
import type { Files } from "./python/protocol";
import { BASE } from "./static";

/** "bill-splitter/make" is the file "bill-splitter__make.json". */
export const dataFile = (key: string) => `${key.replace(/\//g, "__")}.json`;

export const MIN_SECONDS = 480;

export async function staticTests(key: string): Promise<Response> {
  return fetch(`${BASE}/data/tests/${dataFile(key)}`);
}

export async function staticSolution(jobId: string, stepId: string, hintsUsed: number, timeSpent: number, passed: boolean): Promise<{ files?: Files; hintsNeeded?: number; secondsNeeded?: number }> {
  if (!passed && (hintsUsed < 3 || timeSpent < MIN_SECONDS)) return { hintsNeeded: Math.max(0, 3 - hintsUsed), secondsNeeded: Math.max(0, MIN_SECONDS - timeSpent) };
  const res = await fetch(`${BASE}/data/solutions/${dataFile(`${jobId}/${stepId}`)}`);
  return res.ok ? { files: (await res.json()) as Files } : {};
}
