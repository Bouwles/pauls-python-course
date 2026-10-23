import { signUp } from "@/lib/server/auth";
import { json, limited, originOf, readJson, sameOrigin } from "@/lib/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "signup", 8, 60_000);
  if (tooMany) return tooMany;
  const body = await readJson<{ email?: string; password?: string; ageConfirmed?: boolean }>(req, 10_000);
  if (!body?.email || !body.password) return json({ error: "Email and password, please." }, 400);
  if (!body.ageConfirmed) return json({ error: "You need to be 13 or older to make an account." }, 400);
  const result = await signUp(body.email, body.password, originOf(req));
  return result.ok ? json({ user: result.user }) : json({ error: result.error }, 400);
}
