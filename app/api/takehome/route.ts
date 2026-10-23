import { getJob } from "@/lib/content/server";
import type { TakeHomeStep } from "@/lib/content/types";
import { getDb } from "@/lib/server/db";
import { json, limited, sameOrigin } from "@/lib/server/http";
import { verifySubmission } from "@/lib/server/sandbox";
import { putFile } from "@/lib/server/storage";
import { requestUser } from "@/lib/server/tokens";
import { parseReport, reportPasses, summarise, type TestReport } from "@/lib/takehome";

export const dynamic = "force-dynamic";

const MAX_ZIP = 10 * 1024 * 1024;
const MAX_REPORT = 2 * 1024 * 1024;

function takeHomeStep(jobId: string | null, stepId: string | null): TakeHomeStep | null {
  if (!jobId || !stepId) return null;
  const step = getJob(jobId)?.steps.find((s) => s.id === stepId);
  return step?.type === "takehome" ? step : null;
}

/** The latest result handed in for a Take It Home step. */
export async function GET(req: Request) {
  const user = await requestUser(req);
  if (!user) return json({ error: "Not signed in." }, 401);
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");
  const stepId = url.searchParams.get("stepId");
  const step = takeHomeStep(jobId, stepId);
  if (!step) return json({ error: "No such Take It Home step." }, 404);
  const db = await getDb();
  const rows = await db.asUser(user.id, (q) =>
    q<{ results: { report: TestReport; passes: boolean }; kind: string; created_at: string }>(
      "select results, kind, created_at from public.submissions where job_id = $1 and step_id = $2 order by created_at desc limit 1",
      [jobId, stepId],
    ),
  );
  const row = rows[0];
  return json(row ? { report: row.results.report, passes: row.results.passes, kind: row.kind, at: new Date(row.created_at).getTime() } : { report: null });
}

/**
 * Hand in a Take It Home step. From the Job page: multipart form with `report`
 * (JUnit XML or pytest's output) and optionally `project` (a zip). From the ppc
 * CLI: JSON { jobId, stepId, report: TestReport, project?: base64 zip }.
 */
export async function POST(req: Request) {
  const tooMany = limited(req, "takehome", 30, 60_000);
  if (tooMany) return tooMany;
  const user = await requestUser(req);
  if (!user) return json({ error: "Sign in to hand work in." }, 401);
  const fromCli = /^Bearer /.test(req.headers.get("authorization") ?? "");
  if (!fromCli && !sameOrigin(req)) return json({ error: "Bad origin." }, 403);

  let jobId: string | null = null;
  let stepId: string | null = null;
  let report: TestReport | null = null;
  let project: Uint8Array | null = null;

  if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
    const form = await req.formData();
    jobId = String(form.get("jobId") ?? "");
    stepId = String(form.get("stepId") ?? "");
    const r = form.get("report");
    const text = typeof r === "string" ? r : r instanceof Blob ? (r.size > MAX_REPORT ? "" : await r.text()) : "";
    report = parseReport(text);
    const p = form.get("project");
    if (p instanceof Blob && p.size > 0) {
      if (p.size > MAX_ZIP) return json({ error: "That zip is over 10 MB. Leave out .venv and any data files." }, 413);
      project = new Uint8Array(await p.arrayBuffer());
    }
  } else {
    const text = await req.text();
    if (text.length > MAX_ZIP * 1.4) return json({ error: "Too big." }, 413);
    let body: { jobId?: string; stepId?: string; report?: Partial<TestReport>; project?: string; environment?: string };
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: "Bad request." }, 400);
    }
    jobId = body.jobId ?? null;
    stepId = body.stepId ?? null;
    const cases = Array.isArray(body.report?.cases) ? body.report!.cases.slice(0, 500) : [];
    report = cases.length
      ? { ...summarise(cases.map((c) => ({ name: String(c.name).slice(0, 300), outcome: (["passed", "failed", "error", "skipped"].includes(c.outcome) ? c.outcome : "error") as TestReport["cases"][number]["outcome"], message: c.message ? String(c.message).slice(0, 500) : null })), "ppc"), environment: body.environment?.slice(0, 120) }
      : null;
    if (body.project) project = Buffer.from(body.project, "base64");
    if (project && project.length > MAX_ZIP) return json({ error: "That project is over 10 MB." }, 413);
  }

  const step = takeHomeStep(jobId, stepId);
  if (!step) return json({ error: "No such Take It Home step." }, 404);
  if (!report) return json({ error: "That doesn't look like a pytest report. Run pytest --junitxml=report.xml and upload report.xml." }, 400);
  if (project && !(project[0] === 0x50 && project[1] === 0x4b)) return json({ error: "The project should be a .zip file." }, 400);

  const projectKey = project ? await putFile(user.id, `${jobId}/${stepId}/${Date.now()}.zip`, project) : null;
  const sandbox = await verifySubmission({ userId: user.id, jobId: jobId!, stepId: stepId!, projectKey });
  const passes = reportPasses(report, step);
  const db = await getDb();
  await db.asUser(user.id, (q) =>
    q("insert into public.submissions (user_id, job_id, step_id, kind, results, storage_path) values ($1, $2, $3, $4, $5, $6)", [
      user.id,
      jobId,
      stepId,
      fromCli ? "local" : "upload",
      JSON.stringify({ report, passes, sandbox }),
      projectKey,
    ]),
  );
  return json({ ok: true, report, passes, trusted: sandbox.status === "not-run" });
}
