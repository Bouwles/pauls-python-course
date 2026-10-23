import { getDb } from "@/lib/server/db";
import { removeStudent } from "@/lib/server/classes";
import { json, requireUser, sameOrigin } from "@/lib/server/http";

/** Remove a student from the class. Their work stays theirs; the teacher stops seeing it. */
export async function DELETE(req: Request, ctx: RouteContext<"/api/teach/classes/[classId]/students/[studentId]">) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { classId, studentId } = await ctx.params;
  const ok = await removeStudent(await getDb(), user.id, classId, studentId);
  return ok ? json({ ok: true }) : json({ error: "That student isn't in this class." }, 404);
}
