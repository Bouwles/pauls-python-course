import { getDb } from "@/lib/server/db";
import { createClass } from "@/lib/server/classes";
import { json, limited, readJson, requireUser, sameOrigin } from "@/lib/server/http";

/** Make a class. The server picks the join code. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "make-class", 20, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ name?: unknown }>(req, 2_000);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return json({ error: "The class needs a name." }, 400);
  if (name.length > 80) return json({ error: "Keep the name under 80 characters." }, 400);
  const made = await createClass(await getDb(), user.id, name);
  if (made === "not-teacher") return json({ error: "Switch on \"I teach a class\" in Settings first." }, 403);
  return json({ class: made });
}
