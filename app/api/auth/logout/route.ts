import { signOut } from "@/lib/server/auth";
import { json, sameOrigin } from "@/lib/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  await signOut();
  return json({ ok: true });
}
