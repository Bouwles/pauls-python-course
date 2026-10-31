import type { Metadata } from "next";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import type { ShelfItem } from "@/lib/export";
import { Page } from "@/components/site/Page";
import { Shelf, type ShelfCard } from "@/components/shelf/Shelf";

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

/** Projects whose programs draw a chart: the preview waits for the learner's own run to show it. */
const DRAWS = /import matplotlib|from matplotlib|plt\.(plot|bar|hist|scatter|show|savefig)/;

export default function ShelfPage() {
  const index = getIndex();
  const concepts = getConcepts();
  const cards: ShelfCard[] = [];
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
      const starter = from && "starter" in from ? Object.values(from.starter).join("\n") : "";
      const item: ShelfItem = {
        jobId: job.id,
        title: job.title,
        actNumber: act.number,
        actTitle: act.subject || act.title,
        actId: act.id,
        number: job.number,
        client: index.characters[job.client]?.name ?? job.client,
        // The old town place names aren't shown anywhere any more.
        building: "",
        shelf: ship.shelf,
        shipsFrom: ship.shipsFrom,
        files,
        entry,
        spec: ask && ask.type === "ask" ? strip(ask.specHtml) : job.summary,
        learned: job.conceptsIntroduced.map((c) => concepts[c]?.title ?? c),
        data: job.data,
        portfolioReadme: job.portfolioReadme ?? null,
      };
      cards.push({
        item,
        name: job.projectName || job.title,
        clientId: job.client,
        example: ask && ask.type === "ask" ? ask.example : null,
        draws: DRAWS.test(starter) || job.conceptsIntroduced.some((c) => /matplotlib|plot|chart/.test(c)),
      });
    }
  }
  return (
    <Page>
      <Shelf cards={cards} />
    </Page>
  );
}
