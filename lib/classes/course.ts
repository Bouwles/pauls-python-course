// The course as the class pages need it: each Act's written projects with their step count and
// main Build step (the step the project ships from). Server only: it reads the content bundle,
// at build time on GitHub Pages.
import { getIndex, getJob } from "../content/server";
import type { CourseAct } from "./types";

let cached: { version: string; acts: CourseAct[] } | null = null;

export function courseActs(): CourseAct[] {
  const index = getIndex();
  if (cached && cached.version === index.version) return cached.acts;
  const acts: CourseAct[] = index.acts
    .map((act) => ({
      number: act.number,
      label: `Act ${act.number}: ${act.subject || act.title}`,
      jobs: act.jobs
        .filter((j) => j.status === "written" && !j.placementFor)
        .map((j) => {
          const ship = getJob(j.id)?.steps.find((s) => s.type === "ship");
          return {
            id: j.id,
            name: j.projectName || j.title,
            title: j.title,
            act: act.number,
            number: j.number,
            total: j.stepCount,
            build: ship && ship.type === "ship" ? ship.shipsFrom : null,
          };
        }),
    }))
    .filter((a) => a.jobs.length > 0);
  cached = { version: index.version, acts };
  return acts;
}

/** The cast's names, for the lines on the class pages. */
export function castNames(): Record<string, string> {
  return Object.fromEntries(Object.values(getIndex().characters).map((c) => [c.id, c.name]));
}
