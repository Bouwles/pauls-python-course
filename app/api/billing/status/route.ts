import { getProvider, providerName } from "@/lib/payments";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { FREE, getAccess } from "@/lib/server/entitlements";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** This learner's plan, for Settings, the pricing page and the thank-you page. */
export async function GET() {
  const user = await getSessionUser().catch(() => null);
  const access = user ? await getAccess(await getDb(), user.id) : FREE;
  const provider = getProvider();
  return json({ signedIn: Boolean(user), access, provider: providerName(), onSale: Boolean(provider?.configured()) });
}
