import { notFound } from "next/navigation";
import type { Metadata } from "next";
import manifest from "@/art/manifest.json";
import type { Manifest } from "@/components/art/spec";
import { Page } from "@/components/site/Page";
import { ArtReview } from "./ArtReview";

export const metadata: Metadata = { title: "Art review", robots: { index: false, follow: false } };

// Development only: every image in art/manifest.json, its status, and how
// it looks at every size the app shows it, on the dark and the light theme.
export default function ArtPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Page wide>
      <ArtReview manifest={manifest as Manifest} />
    </Page>
  );
}
