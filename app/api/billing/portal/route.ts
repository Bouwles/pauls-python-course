import { getProvider } from "@/lib/payments";
import { ProviderError } from "@/lib/payments/types";
import { getDb } from "@/lib/server/db";
import { json, originOf, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** "Manage billing": the provider's own page for the card, invoices and cancelling. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const db = await getDb();
  const [row] = await db.asService((q) => q<{ provider: string; provider_customer_id: string | null }>("select provider, provider_customer_id from public.entitlements where user_id = $1", [user.id]));
  if (!row) return json({ error: "There's no subscription on this account." }, 404);
  const provider = getProvider(row.provider);
  if (!provider) return json({ error: "Billing isn't available right now." }, 503);
  try {
    return json(await provider.createPortalSession({ userId: user.id, customerId: row.provider_customer_id, returnUrl: `${originOf(req)}/settings#billing` }));
  } catch (e) {
    return json({ error: e instanceof ProviderError ? e.message : "Billing didn't open. Try again in a minute." }, 502);
  }
}
