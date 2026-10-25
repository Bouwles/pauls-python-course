import { getJob } from "@/lib/content/server";
import { getSessionUser } from "@/lib/server/auth";
import { accessToJob } from "@/lib/server/gate";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * One project's content (steps, starters, the brief). Free projects for anyone; Pro projects
 * only for learners with Pro (or who started them while they had it). A free learner gets the
 * first Pro project of each Act as a preview: its Ask, nothing else.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await ctx.params;
  const job = getJob(jobId);
  if (!job || job.status !== "written") return json({ error: "No such project." }, 404);
  const access = await accessToJob(job.id, (await getSessionUser().catch(() => null))?.id ?? null);
  if (access === "missing") return json({ error: "No such project." }, 404);
  if (access.open) return json({ job });
  if (access.preview) return json({ job: { ...job, steps: job.steps.filter((s) => s.type === "ask"), stretch: [], data: {} }, preview: true }, 200);
  return json({ error: "This project is part of Pro." }, 403);
}
