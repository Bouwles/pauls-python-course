import { changePassword, deleteAccount } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { removeUserFiles } from "@/lib/server/storage";
import { json, limited, readJson, requireUser, sameOrigin } from "@/lib/server/http";

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ confirm?: string }>(req, 10_000);
  const db = await getDb();
  const rows = await db.asUser(user.id, (q) => q<{ display_name: string }>("select display_name from public.profiles where id = $1", [user.id]));
  const expected = rows[0]?.display_name || user.email;
  if ((body?.confirm ?? "").trim() !== expected.trim()) return json({ error: "That doesn't match." }, 400);
  // Stored files first: once the account row is gone nothing points at them.
  await removeUserFiles(user.id);
  await deleteAccount(user);
  return json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "password", 5, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ current?: string; next?: string }>(req, 10_000);
  if (!body?.next) return json({ error: "A new password, please." }, 400);
  const result = await changePassword(user, body.current ?? "", body.next);
  return result.ok ? json({ ok: true }) : json({ error: result.error }, 400);
}
