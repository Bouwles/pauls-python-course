// Shareable project pages: a shipped project on a learner's public profile
// gets its own page with their character, the project's name and their code, plus a share card
// (drawn by app/u/[slug]/[jobId]/card/ShareCard.tsx). Only for learners who switched their
// public profile on.
import { getJob } from "../content/server";
import type { Job } from "../content/types";
import { readAvatar, type AvatarLook } from "../avatar";
import type { CharacterLook } from "../store/types";
import type { Files } from "../python/protocol";
import { validSlug } from "./classes";
import type { Db } from "./db";

export interface SharedProject {
  name: string;
  character: AvatarLook;
  job: Job;
  files: Files;
  entry: string;
  shippedAt: string | null;
}

export async function sharedProject(db: Db, slug: string, jobId: string): Promise<SharedProject | null> {
  if (!validSlug(slug) || !/^[a-z0-9-]+$/.test(jobId)) return null;
  const job = getJob(jobId);
  const ship = job?.steps.find((s) => s.type === "ship");
  if (!job || !ship || ship.type !== "ship") return null;
  return db.asService(async (q) => {
    const [p] = await q<{ id: string; display_name: string | null; character: CharacterLook | null }>(
      "select id, display_name, character from public.profiles where public_slug = $1 and coalesce((settings ->> 'publicProfile')::boolean, false)",
      [slug],
    );
    if (!p) return null;
    const [row] = await q<{ shipped_at: string | null }>("select shipped_at from public.job_progress where user_id = $1 and job_id = $2 and status in ('shipped', 'shipped-stretch')", [p.id, jobId]);
    if (!row) return null;
    const from = job.steps.find((s) => s.id === ship.shipsFrom);
    const entry = from && "entry" in from ? from.entry : "main.py";
    const code = ship.shipsFrom ? await q<{ filename: string; content: string }>("select filename, content from public.code_files where user_id = $1 and job_id = $2 and step_id = $3", [p.id, jobId, ship.shipsFrom]) : [];
    const shippedAt = row.shipped_at ? new Date(Number(row.shipped_at) || row.shipped_at).toISOString() : null;
    return { name: p.display_name?.trim() || "A learner", character: readAvatar(p.character), job, files: Object.fromEntries(code.map((c) => [c.filename, c.content])), entry, shippedAt };
  });
}
