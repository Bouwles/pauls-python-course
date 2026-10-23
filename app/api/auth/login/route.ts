import { signIn } from "@/lib/server/auth";
import { json, limited, readJson, sameOrigin } from "@/lib/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "login", 10, 60_000);
  if (tooMany) return tooMany;
  const body = await readJson<{ email?: string; password?: string }>(req, 10_000);
  if (!body?.email || !body.password) return json({ error: "Email and password, please." }, 400);
  const result = await signIn(body.email, body.password);
  return result.ok ? json({ user: result.user }) : json({ error: result.error }, 401);
}
