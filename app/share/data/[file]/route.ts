import { getIndex, getJob } from "@/lib/content/server";

// The data files a shared project's program reads (a CSV, a word list), one JSON file per project:
// /share/data/<jobId>.json. Written at build time, so on GitHub Pages they're plain files beside
// the share page, and a shared project runs there just as it ran for whoever made it.
export const dynamic = "force-static";
export const dynamicParams = false;

const withData = () =>
  getIndex()
    .acts.flatMap((a) => a.jobs)
    .filter((j) => j.status === "written" && j.shelf)
    .map((j) => getJob(j.id))
    .filter((j) => j && Object.keys(j.data ?? {}).length > 0);

export function generateStaticParams() {
  return withData().map((j) => ({ file: `${j!.id}.json` }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const job = getJob(file.replace(/\.json$/, ""));
  if (!job || !file.endsWith(".json") || !Object.keys(job.data ?? {}).length) return new Response("Not found", { status: 404 });
  return Response.json(job.data);
}
