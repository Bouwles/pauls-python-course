import { getDb } from "@/lib/server/db";
import { json, requireUser } from "@/lib/server/http";
import { TABLE_SPECS, dbToRow } from "@/lib/server/tables";
import { TABLES } from "@/lib/store/types";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

// Everything we hold about the learner, as JSON.
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const db = await getDb();
  const data = await db.asUser(user.id, async (q) => {
    const out: Record<string, unknown> = { account: { id: user.id, email: user.email }, exportedAt: new Date().toISOString() };
    out.profile = (await q("select * from public.profiles where id = $1", [user.id]))[0] ?? null;
    for (const table of TABLES) {
      if (table === "profile") continue;
      const spec = TABLE_SPECS[table];
      out[table] = (await q<Record<string, unknown>>(`select * from public.${spec.sql} where user_id = $1`, [user.id])).map((r) => dbToRow(spec, r));
    }
    out.submissions = await q("select id, job_id, step_id, kind, results, created_at from public.submissions where user_id = $1", [user.id]);
    return out;
  });
  return json(data, 200, { "Content-Disposition": `attachment; filename="${BRAND.name.toLowerCase()}-export.json"` });
}
