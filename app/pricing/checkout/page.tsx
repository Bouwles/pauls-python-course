import type { Metadata } from "next";
import { Suspense } from "react";
import { Page } from "@/components/site/Page";
import { Checkout } from "@/components/pricing/Checkout";

export const metadata: Metadata = { title: "Get Pro" };

export default function CheckoutPage() {
  return (
    <Page narrow>
      <Suspense>
        <Checkout />
      </Suspense>
    </Page>
  );
}
