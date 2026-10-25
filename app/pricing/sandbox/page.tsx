import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { sandboxAllowed } from "@/lib/payments/sandbox";
import { Page } from "@/components/site/Page";
import { SandboxCheckout } from "@/components/pricing/SandboxCheckout";

export const metadata: Metadata = { title: "Test checkout" };
export const dynamic = "force-dynamic";

// The sandbox payments provider's "checkout" and "portal" (development and tests only).
export default function SandboxPage() {
  if (!sandboxAllowed()) notFound();
  return (
    <Page narrow>
      <Suspense>
        <SandboxCheckout />
      </Suspense>
    </Page>
  );
}
