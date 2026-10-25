import { getDb } from "@/lib/server/db";
import { joinClass, leaveClass, myClasses } from "@/lib/server/classes";
import { claimSeat } from "@/lib/payments/apply";
import { json, limited, readJson, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** The classes this learner is in. */
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ classes: await myClasses(await getDb(), user.id) });
}

/** Join a class with its code. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  // Codes are guessable only by brute force; keep that slow.
  const tooMany = limited(req, "join-class", 10, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ code?: unknown }>(req, 1_000);
  const code = typeof body?.code === "string" ? body.code : "";
  const db = await getDb();
  const joined = await joinClass(db, user.id, code);
  if (!joined) return json({ error: "No class has that code. Check it with your teacher." }, 404);
  // If the teacher bought Classroom seats for this class, joining takes one: Pro for the learner.
  const seat = await claimSeat(db, user.id, joined.classId);
  return json({ class: joined, seat });
}

/** Leave one. The teacher stops seeing this learner's work straight away. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const left = await leaveClass(await getDb(), user.id, id);
  return left ? json({ ok: true }) : json({ error: "You're not in that class." }, 404);
}
