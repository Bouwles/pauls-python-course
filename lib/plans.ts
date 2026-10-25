// Plans and prices (REDESIGN.md 8.2). The one place prices live in the app: the payment
// provider's dashboard holds the real ones, and these must match it. Owner action: set the
// final prices and the founder offer here and in the provider's dashboard.

export type PlanId = "free" | "pro-monthly" | "pro-yearly" | "classroom" | "founder";

export interface Plan {
  id: PlanId;
  name: string;
  /** Whole currency units. null when the owner hasn't set it yet. */
  price: number | null;
  currency: string;
  interval: "month" | "year" | "seat-year" | "once" | null;
  /** The provider's price id, from .env, used by checkout. */
  providerPrice?: string;
}

export const CURRENCY = "USD";

export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", name: "Free", price: 0, currency: CURRENCY, interval: null },
  "pro-monthly": { id: "pro-monthly", name: "Pro", price: 9, currency: CURRENCY, interval: "month", providerPrice: process.env.NEXT_PUBLIC_PRICE_PRO_MONTHLY },
  "pro-yearly": { id: "pro-yearly", name: "Pro", price: 72, currency: CURRENCY, interval: "year", providerPrice: process.env.NEXT_PUBLIC_PRICE_PRO_YEARLY },
  classroom: { id: "classroom", name: "Classroom", price: null, currency: CURRENCY, interval: "seat-year", providerPrice: process.env.NEXT_PUBLIC_PRICE_CLASSROOM_SEAT },
  founder: { id: "founder", name: "Founding member", price: 149, currency: CURRENCY, interval: "once", providerPrice: process.env.NEXT_PUBLIC_PRICE_FOUNDER },
};

/** Days of Pro before the first charge. 0: the free Act I is the trial. */
export const TRIAL_DAYS = Number(process.env.NEXT_PUBLIC_TRIAL_DAYS ?? 0);

/** The founding member lifetime offer, off until the owner switches it on at launch. */
export const FOUNDER_LIFETIME = process.env.NEXT_PUBLIC_FOUNDER_LIFETIME === "on";

/** Student discount coupons, off by default. */
export const STUDENT_DISCOUNT = process.env.NEXT_PUBLIC_STUDENT_DISCOUNT === "on";

/** The free Act. Everything after it needs Pro. */
export const FREE_ACTS = new Set(["harbour-front"]);

export function money(amount: number, currency = CURRENCY): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
}
