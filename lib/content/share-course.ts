// What the pages that show someone else's shipped project need to know about each project that can
// be on a Shelf: its name, who it's for, its Act, how it runs, and which step's files are the
// shipped program. Read at build time, from the content (server components only).
import { getIndex, getJob } from "./server";

export interface ShareCourseItem {
  name: string;
  clientId: string;
  client: string;
  act: number;
  actName: string;
  entry: string;
  /** Whether it has data files to fetch (app/share/data). */
  data: boolean;
  /** The step whose code is the shipped program, and its files. */
  shipsFrom: string | null;
  files: string[];
}

export type ShareCourse = Record<string, ShareCourseItem>;

export function shareCourse(): ShareCourse {
  const index = getIndex();
  const course: ShareCourse = {};
  for (const act of index.acts) {
    for (const j of act.jobs) {
      if (j.status !== "written" || !j.shelf) continue;
      const job = getJob(j.id);
      const ship = job?.steps.find((s) => s.type === "ship");
      const shipsFrom = ship && ship.type === "ship" ? ship.shipsFrom : null;
      const from = shipsFrom ? job?.steps.find((s) => s.id === shipsFrom) : undefined;
      const entry = from && "entry" in from ? from.entry : "main.py";
      course[j.id] = {
        name: j.projectName || j.title,
        clientId: j.client,
        client: index.characters[j.client]?.name ?? j.client,
        act: act.number,
        actName: act.subject || act.title,
        entry,
        data: Object.keys(job?.data ?? {}).length > 0,
        shipsFrom,
        files: from && "files" in from && Array.isArray(from.files) ? from.files : [entry],
      };
    }
  }
  return course;
}
