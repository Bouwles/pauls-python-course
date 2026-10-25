import { FUNNEL_EVENTS, type FunnelEvent } from "@/lib/funnel";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { recordFunnel } from "@/lib/server/funnel";
import { json, limited, readJson, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

// Events the browser may report. Sign-ups, checkouts and subscriptions are recorded by the
// server where they happen, so they can't be faked from here.
const FROM_BROWSER = new Set<string>(["visit-landing", "guest-start", "ship-1", "ship-5", "ship-capstone", "view-paywall"]);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "funnel", 60, 60_000);
  if (tooMany) return tooMany;
  const body = await readJson<{ event?: unknown; visitor?: unknown }>(req, 500);
  const event = typeof body?.event === "string" ? body.event : "";
  if (!FUNNEL_EVENTS.has(event) || !FROM_BROWSER.has(event)) return json({ error: "Unknown event." }, 400);
  const visitor = typeof body?.visitor === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(body.visitor) ? body.visitor : null;
  const user = await getSessionUser().catch(() => null);
  await recordFunnel(await getDb(), event as FunnelEvent, { userId: user?.id ?? null, visitor });
  return json({ ok: true });
}
