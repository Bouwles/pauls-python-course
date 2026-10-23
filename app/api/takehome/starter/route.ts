import { zipSync, strToU8 } from "fflate";
import { getJob } from "@/lib/content/server";
import { originOf } from "@/lib/server/http";
import { starterFiles } from "@/lib/takehome";

export const dynamic = "force-dynamic";

/** The starter zip for a Take It Home step, for `ppc get` (the Job page builds the same zip itself). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const job = getJob(url.searchParams.get("jobId") ?? "");
  const stepId = url.searchParams.get("stepId");
  const step = job?.steps.find((s) => s.type === "takehome" && (!stepId || s.id === stepId));
  if (!job || !step || step.type !== "takehome") return new Response("No such Take It Home step.", { status: 404 });
  const files = starterFiles(job, step, originOf(req));
  const data = zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)])));
  return new Response(data, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${step.folder}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
