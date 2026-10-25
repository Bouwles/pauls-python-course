import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Doc } from "@/components/legal/Doc";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <Page narrow>
      <Doc title="Terms" draft>
        <h2>The course</h2>
        <p>{BRAND.name} is free to use while it is being built. Things may change, break or be rewritten as it grows.</p>
        <h2>Your work is yours</h2>
        <p>The programs you write belong to you. You can export them at any time and use them however you like.</p>
        <h2>Using it fairly</h2>
        <p>Please don&apos;t try to break the service, get at other people&apos;s data, or use it to run anything harmful. Code runs in your own browser, so the main person you can affect is you.</p>
        <h2>Accounts</h2>
        <p>Keep your password to yourself. You can delete your account at any time from Settings.</p>
        <h2>No guarantees</h2>
        <p>We work hard to keep the course accurate and your work safe, but the service is provided as it is, without warranties. Keep an export of anything you can&apos;t bear to lose.</p>
      </Doc>
    </Page>
  );
}
