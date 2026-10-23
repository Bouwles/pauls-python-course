import { getDb } from "@/lib/server/db";
import { json, limited, readJson, requireUser, sameOrigin } from "@/lib/server/http";
import { isoWeek, league, readEntry } from "@/lib/league/course";

export const dynamic = "force-dynamic";

const WEEK = /^\d{4}-W\d{2}$/;

/** This week's table (display names and scores only), and the signed-in learner's own entry. */
export async function GET(req: Request) {
  const asked = new URL(req.url).searchParams.get("week");
  const week = asked && WEEK.test(asked) ? asked : isoWeek();
  const user = await requireUser();
  const db = await getDb();
  type Row = { place: string; display_name: string; score: string; finished: number; entered_at: string; mine: boolean };
  const run = <T,>(fn: (q: Parameters<Parameters<typeof db.asService>[0]>[0]) => Promise<T>) => (user instanceof Response ? db.asService(fn) : db.asUser(user.id, fn));
  const rows = await run((q) => q<Row>("select * from public.league_table($1)", [week]));
  let mine: { policy: unknown; score: number; finished: number } | null = null;
  if (!(user instanceof Response)) {
    const own = await db.asUser(user.id, (q) => q<{ policy: unknown; score: string; finished: number }>("select policy, score, finished from public.league_entries where week = $1", [week]));
    if (own[0]) mine = { policy: own[0].policy, score: Number(own[0].score), finished: own[0].finished };
  }
  return json({
    week,
    current: isoWeek(),
    table: rows.map((r) => ({ place: Number(r.place), name: r.display_name, score: Number(r.score), finished: r.finished, mine: r.mine })),
    mine,
  });
}

/** Enter (or re-enter) this week: the server races the entry and keeps the score. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "league", 20, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ entry?: unknown }>(req, 100_000);
  if (!body?.entry) return json({ error: "Send the entry: the contents of your league.json." }, 400);
  const read = readEntry(body.entry);
  if ("error" in read) return json({ error: read.error }, 400);
  const db = await getDb();
  const profile = await db.asUser(user.id, (q) => q<{ display_name: string }>("select display_name from public.profiles where id = $1", [user.id]));
  const name = profile[0]?.display_name?.trim();
  if (!name) return json({ error: "Set a display name in Settings first: it's the only thing the table shows." }, 400);
  const week = isoWeek();
  const result = league(read.policy, week);
  // Entries are written by the server only, so nobody can post a score they didn't race.
  await db.asService((q) =>
    q(
      `insert into public.league_entries (user_id, week, display_name, policy, score, finished, results)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (user_id, week) do update set display_name = excluded.display_name, policy = excluded.policy, score = excluded.score, finished = excluded.finished, results = excluded.results, created_at = now()`,
      [user.id, week, name.slice(0, 40), JSON.stringify({ format: "ppc-league-1", policy: read.policy }), result.score, result.finished, JSON.stringify(result)],
    ),
  );
  return json({ ok: true, week, ...result });
}

/** Withdraw this week's entry. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const db = await getDb();
  await db.asUser(user.id, (q) => q("delete from public.league_entries where week = $1", [isoWeek()]));
  return json({ ok: true });
}
