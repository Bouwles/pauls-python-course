// How well a concept is holding, in words (never colour alone).
import type { ReviewCardRow } from "../store/types";

export type Strength = "unseen" | "new" | "shaky" | "fresh" | "steady" | "strong";

export const STRENGTH_LABEL: Record<Strength, string> = {
  unseen: "Not met yet",
  new: "In your deck",
  shaky: "Shaky",
  fresh: "Fresh",
  steady: "Steady",
  strong: "Strong",
};

export function strengthOf(row: ReviewCardRow | undefined): Strength {
  if (!row) return "unseen";
  if (row.reps === 0) return "new";
  if (row.lapses >= 2 && row.stability < 10) return "shaky";
  if (row.stability >= 21) return "strong";
  if (row.stability >= 6) return "steady";
  return "fresh";
}
