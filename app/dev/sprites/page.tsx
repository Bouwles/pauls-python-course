import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { SpriteReview } from "@/components/dev/SpriteReview";

export const metadata: Metadata = { title: "Sprite review" };

// Development only (REDESIGN.md 6.2): every sprite and expression at 1x, 3x and as a
// silhouette, on night and day, for reviewing the art.
export default function SpritesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Page wide>
      <SpriteReview />
    </Page>
  );
}
