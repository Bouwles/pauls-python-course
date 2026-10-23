import Link from "next/link";
import { Page } from "@/components/site/Page";
import { LostPip } from "@/components/site/LostPip";

export default function NotFound() {
  return (
    <Page narrow>
      <div style={{ display: "grid", gap: 24, justifyItems: "start" }}>
        <LostPip />
        <h1 style={{ fontSize: "var(--step-4)" }}>Pip took a wrong turn. So did this link.</h1>
        <p style={{ fontFamily: "var(--font-prose)", fontSize: "var(--prose-size)", color: "var(--ink-2)" }}>The page you asked for isn&apos;t here. It may never have been.</p>
        <Link href="/map">Back to the map</Link>
      </div>
    </Page>
  );
}
