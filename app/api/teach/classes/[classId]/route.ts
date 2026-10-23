import { getDb } from "@/lib/server/db";
import { deleteClass, getClass } from "@/lib/server/classes";
import { json, readJson, requireUser, sameOrigin } from "@/lib/server/http";

/** Delete a class: its members leave and its assignments go. Needs the class name typed out. */
export async function DELETE(req: Request, ctx: RouteContext<"/api/teach/classes/[classId]">) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { classId } = await ctx.params;
  const body = await readJson<{ confirm?: unknown }>(req, 2_000);
  const db = await getDb();
  const cls = await getClass(db, user.id, classId);
  if (!cls) return json({ error: "No such class." }, 404);
  if (typeof body?.confirm !== "string" || body.confirm.trim() !== cls.name.trim()) return json({ error: "That doesn't match the class name." }, 400);
  await deleteClass(db, user.id, classId);
  return json({ ok: true });
}
