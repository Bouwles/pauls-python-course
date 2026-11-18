import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { asset } from "@/lib/static";
import { Page } from "@/components/site/Page";
import { Landing } from "@/components/landing/Landing";
import { landingData } from "@/components/landing/data";

const TITLE = "About the course";
const DESCRIPTION =
  "A free Python course that runs in your browser, with nothing to install. Real programs for real people, from a first print() to machine learning, deep learning and a tiny GPT.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  // The page's own Open Graph replaces the layout's whole, so the picture is named again here.
  openGraph: {
    type: "website",
    url: "/about",
    siteName: BRAND.name,
    title: `${TITLE} · ${BRAND.name}`,
    description: DESCRIPTION,
    images: [{ url: asset("/og.png"), width: 1200, height: 630, alt: BRAND.name }],
  },
};

export default function About() {
  return (
    <Page>
      <Landing data={landingData()} />
    </Page>
  );
}
