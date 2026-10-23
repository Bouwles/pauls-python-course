import { getDb } from "@/lib/server/db";
import { assign, getClass, unassign } from "@/lib/server/classes";
import { getJobSummary } from "@/lib/content/server";
import { json, readJson, requireUser, sameOrigin } from "@/lib/server/http";

/** Assign a written Job, with an optional due date (YYYY-MM-DD). Assigning it again changes the date. */
export async function POST(req: Request, ctx: RouteContext<"/api/teach/classes/[classId]/assignments">) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { classId } = await ctx.params;
  const body = await readJson<{ jobId?: unknown; due?: unknown }>(req, 2_000);
  const jobId = typeof body?.jobId === "string" ? body.jobId : "";
  const job = getJobSummary(jobId);
  if (!job || job.status !== "written") return json({ error: "Pick a Job from the list." }, 400);
  let dueAt: number | null = null;
  if (typeof body?.due === "string" && body.due) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.due)) return json({ error: "That date doesn't look right." }, 400);
    // Midday UTC, so the date reads the same in every time zone near ours.
    dueAt = Date.parse(`${body.due}T12:00:00Z`);
    if (Number.isNaN(dueAt)) return json({ error: "That date doesn't look right." }, 400);
  }
  const db = await getDb();
  if (!(await getClass(db, user.id, classId))) return json({ error: "No such class." }, 404);
  const ok = await assign(db, user.id, classId, jobId, dueAt);
  return ok ? json({ ok: true }) : json({ error: "That didn't save." }, 400);
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/teach/classes/[classId]/assignments">) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { classId } = await ctx.params;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const ok = await unassign(await getDb(), user.id, classId, id);
  return ok ? json({ ok: true }) : json({ error: "No such assignment." }, 404);
}
