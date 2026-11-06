import type { Metadata } from "next";
import { getIndex, getJob } from "@/lib/content/server";
import { castNames } from "@/lib/classes/course";
import { Page } from "@/components/site/Page";
import { ShareView, type ShareCourse } from "@/components/share/ShareView";

// A shared project carries a name and someone's code, so it stays out of search engines.
export const metadata: Metadata = { title: "Shared", robots: { index: false, follow: false } };

// /share/#<a project, or a whole Shelf>: read from its link in the browser, so it's the same plain
// file on GitHub Pages as in the local version. The course adds what each project is called, who
// it's for and how it runs; its data files are fetched only when it runs (app/share/data).
export default function SharePage() {
  const index = getIndex();
  const course: ShareCourse = {};
  for (const act of index.acts) {
    for (const j of act.jobs) {
      if (j.status !== "written" || !j.shelf) continue;
      const job = getJob(j.id);
      const ship = job?.steps.find((s) => s.type === "ship");
      const from = ship && ship.type === "ship" ? job?.steps.find((s) => s.id === ship.shipsFrom) : undefined;
      course[j.id] = {
        name: j.projectName || j.title,
        clientId: j.client,
        client: index.characters[j.client]?.name ?? j.client,
        act: act.number,
        actName: act.subject || act.title,
        entry: from && "entry" in from ? from.entry : "main.py",
        data: Object.keys(job?.data ?? {}).length > 0,
      };
    }
  }
  return (
    <Page>
      <ShareView course={course} names={castNames()} />
    </Page>
  );
}
