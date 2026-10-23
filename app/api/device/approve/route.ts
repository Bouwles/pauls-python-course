import { json, limited, readJson, requireUser, sameOrigin } from "@/lib/server/http";
import { approveDeviceCode } from "@/lib/server/tokens";

export const dynamic = "force-dynamic";

/** Step 2: the learner, signed in, types the code from their terminal. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "device-approve", 10, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ code?: string }>(req, 1_000);
  if (!body?.code) return json({ error: "Type the code from your terminal." }, 400);
  const ok = await approveDeviceCode(user.id, body.code);
  return ok ? json({ ok: true }) : json({ error: "That code doesn't match, or it has expired. Run ppc login again for a new one." }, 400);
}
