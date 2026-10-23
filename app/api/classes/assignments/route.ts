import { getDb } from "@/lib/server/db";
import { myAssignments } from "@/lib/server/classes";
import { json, requireUser } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Jobs set by the classes this learner is in, for the map. */
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ assignments: await myAssignments(await getDb(), user.id) });
}
