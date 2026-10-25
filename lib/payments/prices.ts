// Plan <-> provider price ids. The ids live in .env (owner action: copy them from the
// provider's dashboard); the amounts shown on the site live in lib/plans.ts.
import { PLANS, type PlanId } from "../plans";

type PaidPlan = Exclude<PlanId, "free">;

export function priceFor(plan: PaidPlan): string | undefined {
  return PLANS[plan].providerPrice || undefined;
}

export function planForPrice(priceId: string | undefined | null): PaidPlan | null {
  if (!priceId) return null;
  for (const id of Object.keys(PLANS) as PlanId[]) if (id !== "free" && PLANS[id].providerPrice === priceId) return id as PaidPlan;
  return null;
}

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && value in PLANS && value !== "free";
}
