// Shareable project pages (REDESIGN.md 9.2): a shipped project on a learner's public profile
// gets its own page with their character, the project's name and their code, plus a share card
// drawn from the pixel art. Only for learners who switched their public profile on.
import fs from "node:fs";
import path from "node:path";
import { BRAND } from "../brand";
import { getJob } from "../content/server";
import type { Job } from "../content/types";
import { composeLearner, defaultLook, LEARNER_H, LEARNER_W, type LearnerData } from "../pixel/learner";
import { decodePng, type Bitmap } from "../pixel/decode";
import { Raster } from "../pixel/raster";
import type { CharacterLook } from "../store/types";
import type { Files } from "../python/protocol";
import { validSlug } from "./classes";
import type { Db } from "./db";

export interface SharedProject {
  name: string;
  character: CharacterLook;
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
    return { name: p.display_name?.trim() || "An apprentice", character: p.character ?? defaultLook(), job, files: Object.fromEntries(code.map((c) => [c.filename, c.content])), entry, shippedAt };
  });
}

const SPRITES = () => path.join(process.cwd(), "public", "sprites");
const cache = new Map<string, Bitmap>();
function bitmap(file: string): Bitmap | null {
  if (cache.has(file)) return cache.get(file)!;
  try {
    const b = decodePng(fs.readFileSync(path.join(SPRITES(), file)));
    cache.set(file, b);
    return b;
  } catch {
    return null;
  }
}

/** The share card, 1200x630: the harbour at dusk, the learner's character, the object they made, and one line. */
export function drawShareCard(p: SharedProject): Raster {
  const W = 1200;
  const H = 630;
  const r = new Raster(W, H, "G");
  const scene = bitmap("scene-harbour-dusk.png");
  if (scene) r.blit(scene, 0, 0, scene.w, scene.h, Math.floor((W - scene.w * 3) / 2), Math.floor((H - scene.h * 3) / 2), 3);
  // A dark band for the words, low on the card.
  r.rect(0, H - 210, W, 210, "G");
  r.rect(0, H - 214, W, 4, "J");
  // The learner, standing on the band's edge, at 5x.
  try {
    const data = JSON.parse(fs.readFileSync(path.join(SPRITES(), "learner.json"), "utf8")) as LearnerData;
    const px = composeLearner(data, p.character, "stand-1", "open");
    r.blit({ w: LEARNER_W, h: LEARNER_H, rgba: px }, 0, 0, LEARNER_W, LEARNER_H, 72, H - 214 - LEARNER_H * 5, 5);
  } catch {
    // No learner parts built: the card works without the character.
  }
  // The object on the Shelf, at 6x, beside them.
  const shelf = p.job.shelf ? bitmap(`shelf-${p.job.shelf.object}.png`) : null;
  if (shelf) r.blit(shelf, 0, 0, Math.min(16, shelf.w), Math.min(16, shelf.h), 250, H - 214 - 96, 6);
  const species = p.character.species ?? "apprentice";
  const who = p.name === "An apprentice" ? species[0]!.toUpperCase() + species.slice(1) : p.name;
  r.text(`${who} shipped`.slice(0, 34), 72, H - 180, 5, "M", "1");
  r.text(`a ${p.job.projectName}`.slice(0, 34), 72, H - 130, 5, "N", "1");
  r.text(`in ${BRAND.name}`, 72, H - 80, 4, "L", "1");
  return r;
}
