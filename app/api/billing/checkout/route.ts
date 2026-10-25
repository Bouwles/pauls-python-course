import { FOUNDER_LIFETIME, PLANS } from "@/lib/plans";
import { getProvider } from "@/lib/payments";
import { isPaidPlan } from "@/lib/payments/prices";
import { ProviderError } from "@/lib/payments/types";
import { getDb } from "@/lib/server/db";
import { getAccess } from "@/lib/server/entitlements";
import { recordFunnel } from "@/lib/server/funnel";
import { json, limited, originOf, readJson, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * Starts a checkout with the payments provider and returns its link. Buying needs the buyer to
 * be 18 or over, or to have a parent's or guardian's permission (REDESIGN.md 8.3), and that
 * answer is kept with the purchase.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "checkout", 10, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ plan?: unknown; confirmed?: unknown; seats?: unknown; classId?: unknown }>(req, 4_000);
  const plan = body?.plan;
  if (!isPaidPlan(plan)) return json({ error: "Pick a plan." }, 400);
  if (plan === "founder" && !FOUNDER_LIFETIME) return json({ error: "The founding member offer isn't open." }, 400);
  if (body?.confirmed !== "adult" && body?.confirmed !== "guardian") return json({ error: "Say whether you're 18 or over, or have a parent's or guardian's permission." }, 400);
  let seats: number | undefined;
  let classId: string | null = null;
  const db = await getDb();
  if (plan === "classroom") {
    seats = Number(body?.seats);
    if (!Number.isInteger(seats) || seats < 5 || seats > 500) return json({ error: "Classroom seats come in 5 to 500." }, 400);
    classId = typeof body?.classId === "string" ? body.classId : null;
    const [me] = await db.asService((q) => q<{ role: string | null }>("select role from public.profiles where id = $1", [user.id]));
    if (me?.role !== "teacher") return json({ error: "Classroom seats are for teachers. Switch on \"I teach a class\" in Settings first." }, 403);
    if (!PLANS.classroom.price) return json({ error: "Classroom pricing isn't set yet." }, 400);
  } else if ((await getAccess(db, user.id)).pro) {
    return json({ error: "You already have Pro. Manage billing is in Settings." }, 400);
  }
  const provider = getProvider();
  if (!provider || !provider.configured()) return json({ error: "Pro isn't on sale yet." }, 503);
  await db.asService((q) => q("insert into public.checkout_consents (user_id, plan, confirmed) values ($1, $2, $3)", [user.id, plan, body.confirmed]));
  await recordFunnel(db, "start-checkout", { userId: user.id });
  const origin = originOf(req);
  try {
    const { url } = await provider.createCheckout({
      userId: user.id,
      email: user.email ?? "",
      plan,
      seats,
      classId,
      successUrl: `${origin}/pricing/thanks?plan=${plan}`,
      cancelUrl: `${origin}/pricing`,
    });
    return json({ url });
  } catch (e) {
    return json({ error: e instanceof ProviderError ? e.message : "Checkout didn't start. Try again in a minute." }, 502);
  }
}
