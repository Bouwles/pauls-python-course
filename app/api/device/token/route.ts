import { json, limited, readJson } from "@/lib/server/http";
import { pollDeviceCode } from "@/lib/server/tokens";

export const dynamic = "force-dynamic";

/** Step 3: the CLI polls until the learner has approved the code on /device. */
export async function POST(req: Request) {
  const tooMany = limited(req, "device-token", 30, 60_000);
  if (tooMany) return tooMany;
  const body = await readJson<{ device_code?: string }>(req, 2_000);
  if (!body?.device_code) return json({ error: "invalid_request" }, 400);
  const r = await pollDeviceCode(body.device_code);
  if (r.status === "ok") return json({ access_token: r.token, token_type: "Bearer" });
  const error = r.status === "pending" ? "authorization_pending" : r.status === "expired" ? "expired_token" : "invalid_grant";
  return json({ error }, 400);
}
