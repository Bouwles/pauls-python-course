import type { Metadata } from "next";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import { BUILDINGS } from "@/lib/world/map";
import type { ShelfItem } from "@/lib/export";
import { Page } from "@/components/site/Page";
import { PenhallowNotes } from "@/components/shelf/PenhallowNotes";
import { Shelf } from "@/components/shelf/Shelf";

export const metadata: Metadata = { title: "The Shelf" };

const strip = (html: string) =>
  html
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export default function ShelfPage() {
  const index = getIndex();
  const concepts = getConcepts();
  const items: ShelfItem[] = [];
  for (const act of index.acts) {
    for (const summary of act.jobs) {
      if (summary.status !== "written") continue;
      const job = getJob(summary.id);
      const ship = job?.steps.find((s) => s.type === "ship");
      if (!job || !ship || ship.type !== "ship" || !ship.shelf) continue;
      const from = job.steps.find((s) => s.id === ship.shipsFrom);
      const ask = job.steps.find((s) => s.type === "ask");
      const files = from && "entry" in from ? from.files : ["main.py"];
      const entry = from && "entry" in from ? from.entry : "main.py";
      items.push({
        jobId: job.id,
        title: job.title,
        actNumber: act.number,
        actTitle: act.title,
        actId: act.id,
        number: job.number,
        client: index.characters[job.client]?.name ?? job.client,
        building: BUILDINGS.find((b) => b.id === job.building)?.name ?? job.building,
        shelf: ship.shelf,
        shipsFrom: ship.shipsFrom,
        files,
        entry,
        spec: ask && ask.type === "ask" ? strip(ask.specHtml) : job.summary,
        learned: job.conceptsIntroduced.map((c) => concepts[c]?.title ?? c),
        data: job.data,
      });
    }
  }
  // Notes in the order the course finds them.
  const order = index.acts.flatMap((a) => a.jobs.map((j) => j.id));
  const orderedNotes = [...index.story].sort((a, b) => order.indexOf(a.job) - order.indexOf(b.job));
  const jobTitles = Object.fromEntries(index.acts.flatMap((a) => a.jobs.map((j) => [j.id, j.title])));
  return (
    <Page>
      <Shelf items={items} />
      <PenhallowNotes notes={orderedNotes} jobTitles={jobTitles} />
    </Page>
  );
}
