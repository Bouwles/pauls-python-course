import { getDb } from "@/lib/server/db";
import { json, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** The ppc tools signed in to this account. */
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const db = await getDb();
  const rows = await db.asUser(user.id, (q) =>
    q<{ id: string; label: string; created_at: string; last_used_at: string | null }>("select id, label, created_at, last_used_at from public.api_tokens order by created_at desc"),
  );
  return json({ tokens: rows.map((r) => ({ id: r.id, label: r.label, createdAt: new Date(r.created_at).getTime(), lastUsedAt: r.last_used_at ? new Date(r.last_used_at).getTime() : null })) });
}

/** Disconnect one. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return json({ error: "Bad request." }, 400);
  const db = await getDb();
  await db.asUser(user.id, (q) => q("delete from public.api_tokens where id = $1", [id]));
  return json({ ok: true });
}
