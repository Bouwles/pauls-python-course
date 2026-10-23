import { getJob } from "@/lib/content/server";
import { getDb } from "@/lib/server/db";
import { json, limited, sameOrigin } from "@/lib/server/http";
import { putFile } from "@/lib/server/storage";
import { requestUser } from "@/lib/server/tokens";

export const dynamic = "force-dynamic";

const MAX_ZIP = 10 * 1024 * 1024;

/** A capstone milestone handed in: the checklist, the learner's test plan, and a link or a zip. Kept so a teacher can see it. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "milestone", 20, 60_000);
  if (tooMany) return tooMany;
  const user = await requestUser(req);
  if (!user) return json({ error: "Sign in to hand work in." }, 401);
  const form = await req.formData();
  const jobId = String(form.get("jobId") ?? "");
  const stepId = String(form.get("stepId") ?? "");
  const step = getJob(jobId)?.steps.find((s) => s.id === stepId);
  if (!step || step.type !== "milestone") return json({ error: "No such milestone." }, 404);
  const link = String(form.get("link") ?? "").trim().slice(0, 500);
  if (link && !/^https:\/\/\S+$/.test(link)) return json({ error: "The link should start with https://" }, 400);
  const plan = String(form.get("plan") ?? "").slice(0, 10_000);
  let checks: Record<string, boolean> = {};
  try {
    checks = JSON.parse(String(form.get("checks") ?? "{}"));
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  let projectKey: string | null = null;
  const p = form.get("project");
  if (p instanceof Blob && p.size > 0) {
    if (p.size > MAX_ZIP) return json({ error: "That zip is over 10 MB." }, 413);
    const data = new Uint8Array(await p.arrayBuffer());
    if (!(data[0] === 0x50 && data[1] === 0x4b)) return json({ error: "The project should be a .zip file." }, 400);
    projectKey = await putFile(user.id, `${jobId}/${stepId}/${Date.now()}.zip`, data);
  }
  const db = await getDb();
  await db.asUser(user.id, (q) =>
    q("insert into public.submissions (user_id, job_id, step_id, kind, results, storage_path) values ($1, $2, $3, 'upload', $4, $5)", [
      user.id,
      jobId,
      stepId,
      JSON.stringify({ milestone: true, checks: Object.fromEntries(step.checklist.map((c) => [c.id, Boolean(checks[c.id])])), plan, link: link || null }),
      projectKey,
    ]),
  );
  return json({ ok: true });
}
