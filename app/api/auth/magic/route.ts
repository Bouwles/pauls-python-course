import { sendMagicLink } from "@/lib/server/auth";
import { json, limited, originOf, readJson, sameOrigin } from "@/lib/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "magic", 5, 60_000);
  if (tooMany) return tooMany;
  const body = await readJson<{ email?: string }>(req, 10_000);
  if (!body?.email) return json({ error: "An email address, please." }, 400);
  const result = await sendMagicLink(body.email, originOf(req));
  return result.ok ? json({ ok: true }) : json({ error: result.error }, 400);
}
