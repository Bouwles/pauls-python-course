import { getDb } from "@/lib/server/db";
import { json, readJson, requireUser, sameOrigin } from "@/lib/server/http";
import { MAX_CHANGES, pullAll, pushChanges, type Change } from "@/lib/server/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const rows = await pullAll(await getDb(), user.id);
  return json({ rows, serverTime: Date.now() });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ changes?: Change[] }>(req, 5_000_000);
  const changes = body?.changes;
  if (!Array.isArray(changes) || changes.length > MAX_CHANGES) return json({ error: "Bad request." }, 400);
  const { conflicts, rejected } = await pushChanges(await getDb(), user.id, changes);
  return json({ ok: true, conflicts, rejected, serverTime: Date.now() });
}
