import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { League } from "@/components/league/League";

export const metadata: Metadata = { title: "The Arcade League" };

export default function LeaguePage() {
  return (
    <Page>
      <League />
    </Page>
  );
}
