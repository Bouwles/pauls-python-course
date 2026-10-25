import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Thanks } from "@/components/pricing/Thanks";

export const metadata: Metadata = { title: "Welcome to Pro" };

export default function ThanksPage() {
  return (
    <Page narrow>
      <Thanks />
    </Page>
  );
}
