import { getProvider } from "@/lib/payments";
import { applyEvents } from "@/lib/payments/apply";
import { SignatureError } from "@/lib/payments/types";
import { getDb } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * Webhooks from the payments provider: the source of truth for who has Pro (REDESIGN.md 8.3).
 * The signature is checked on the raw body before anything is read, and each event is applied
 * once however many times it's delivered.
 */
export async function POST(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await ctx.params;
  const provider = getProvider(name);
  if (!provider) return json({ error: "Unknown provider." }, 404);
  const raw = await req.text();
  if (raw.length > 1_000_000) return json({ error: "Too big." }, 413);
  try {
    const events = await provider.handleWebhook(raw, req.headers);
    const result = await applyEvents(await getDb(), provider.name, events);
    return json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof SignatureError) return json({ error: "Bad signature." }, 400);
    console.error("[billing] webhook failed", e);
    // A 500 makes the provider retry later, which is what we want if the database blinked.
    return json({ error: "Webhook failed." }, 500);
  }
}
