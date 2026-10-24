import { getIndex } from "@/lib/content/server";
import { getDb } from "@/lib/server/db";
import { json, originOf } from "@/lib/server/http";
import { sendMail } from "@/lib/server/mailer";
import { weeklyNote } from "@/lib/weekly";

export const dynamic = "force-dynamic";

/**
 * The weekly note from Moss, for learners who switched it on in Settings.
 * Run by a weekly cron (vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const local = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!(secret ? req.headers.get("authorization") === `Bearer ${secret}` : local)) return json({ error: "Not allowed." }, 401);

  const titles = Object.fromEntries(getIndex().acts.flatMap((a) => a.jobs.map((j) => [j.id, j.title])));
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const db = await getDb();
  const learners = await db.asService((q) =>
    q<{ id: string; email: string }>(
      "select u.id, u.email from public.profiles p join auth.users u on u.id = p.id where coalesce((p.settings ->> 'weeklyEmail')::boolean, false)",
    ),
  );
  let sent = 0;
  for (const learner of learners) {
    const [shipped, due] = await db.asService(async (q) => [
      await q<{ job_id: string }>("select job_id from public.job_progress where user_id = $1 and status in ('shipped', 'shipped-stretch') and shipped_at >= $2 order by shipped_at", [learner.id, weekAgo]),
      await q<{ n: number }>("select count(*)::int as n from public.review_cards where user_id = $1 and due <= $2", [learner.id, Date.now()]),
    ]);
    const note = weeklyNote({ shipped: (shipped as { job_id: string }[]).map((r) => titles[r.job_id] ?? r.job_id), dueCards: (due as { n: number }[])[0]?.n ?? 0 });
    if (!note) continue;
    const result = await sendMail({ to: learner.email, subject: note.subject, text: `${note.lines.join("\n")}\n\n(You asked for this in Settings. Switch it off there any time: ${originOf(req)}/settings)` });
    if (result !== "no-provider") sent++;
  }
  return json({ ok: true, learners: learners.length, sent });
}
