import { json, limited, originOf } from "@/lib/server/http";
import { startDeviceFlow } from "@/lib/server/tokens";

export const dynamic = "force-dynamic";

/** Step 1 of the ppc CLI's sign-in: a code for the terminal to show. */
export async function POST(req: Request) {
  const tooMany = limited(req, "device-code", 10, 60_000);
  if (tooMany) return tooMany;
  const { deviceCode, userCode, expiresIn } = await startDeviceFlow();
  const site = originOf(req);
  return json({ device_code: deviceCode, user_code: userCode, verification_uri: `${site}/device`, verification_uri_complete: `${site}/device?code=${userCode}`, expires_in: expiresIn, interval: 5 });
}
