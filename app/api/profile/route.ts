import { getDb } from "@/lib/server/db";
import { profileFlags, setPublicSlug, setTeacher } from "@/lib/server/classes";
import { json, limited, readJson, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** The two profile fields that don't sync from the device: teaching, and the public address. */
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(await profileFlags(await getDb(), user.id));
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "profile", 30, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ teacher?: unknown; slug?: unknown }>(req, 2_000);
  if (!body) return json({ error: "Bad request." }, 400);
  const db = await getDb();
  if (typeof body.teacher === "boolean") await setTeacher(db, user.id, body.teacher);
  if (body.slug !== undefined) {
    const slug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : null;
    const result = await setPublicSlug(db, user.id, slug);
    if (result === "taken") return json({ error: "That address is taken." }, 409);
    if (result === "invalid") return json({ error: "Use lower-case letters, digits and single hyphens, 3 to 30 characters." }, 400);
  }
  return json(await profileFlags(db, user.id));
}
