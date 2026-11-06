import { getJob } from "@/lib/content/server";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** One project's content (steps, starters, the brief). Every project is open to everyone. */
export async function GET(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await ctx.params;
  const job = getJob(jobId);
  if (!job || job.status !== "written") return json({ error: "No such project." }, 404);
  return json({ job });
}
