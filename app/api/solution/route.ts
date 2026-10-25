import { getJob, getSolution } from "@/lib/content/server";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { json, readJson, sameOrigin } from "@/lib/server/http";
import { accessToJob } from "@/lib/server/gate";

export const dynamic = "force-dynamic";

// Section 3.5: the full solution only after the step is passed, or after all
// three hints and a minimum time on the step.
const MIN_SECONDS = Number(process.env.SOLUTION_MIN_SECONDS ?? 480);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const body = await readJson<{ jobId?: string; stepId?: string; hintsUsed?: number; timeSpent?: number; passed?: boolean }>(req, 10_000);
  if (!body?.jobId || !body.stepId) return json({ error: "Bad request." }, 400);
  const job = getJob(body.jobId);
  const step = job?.steps.find((s) => s.id === body.stepId);
  if (!job || !step || !["pips", "fix", "modify", "make"].includes(step.type)) return json({ error: "No solution for that step." }, 404);
  // The placement test checks what the learner already knows: no solutions, signed in or not.
  if (job.placementFor) return json({ error: "The placement test has no solutions to show." }, 404);
  const viewer = await getSessionUser();
  const access = await accessToJob(job.id, viewer?.id ?? null);
  if (access === "missing" || !access.open) return json({ error: "This project is part of Pro." }, 403);

  let hints = Number(body.hintsUsed ?? 0);
  let seconds = Number(body.timeSpent ?? 0);
  let passed = Boolean(body.passed);
  const user = await getSessionUser();
  if (user) {
    // For a signed-in learner, trust the synced record rather than the request.
    const db = await getDb();
    const rows = await db.asUser(user.id, (q) =>
      q<{ hints_used: number; time_spent_seconds: number; status: string }>(
        "select hints_used, time_spent_seconds, status from public.step_progress where job_id = $1 and step_id = $2",
        [body.jobId, body.stepId],
      ),
    );
    const row = rows[0];
    hints = row?.hints_used ?? 0;
    seconds = row?.time_spent_seconds ?? 0;
    passed = row?.status === "passed";
  }
  if (!passed && (hints < 3 || seconds < MIN_SECONDS)) {
    return json({ error: "Not yet.", hintsNeeded: Math.max(0, 3 - hints), secondsNeeded: Math.max(0, MIN_SECONDS - seconds) }, 403);
  }
  const files = getSolution(`${body.jobId}/${body.stepId}`);
  return files ? json({ files }) : json({ error: "No solution for that step." }, 404);
}
