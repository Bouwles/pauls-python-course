import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Clocktower } from "@/components/clocktower/Clocktower";
import { towerData } from "@/components/clocktower/data";

export const metadata: Metadata = { title: "The Clocktower" };

export default function ClocktowerPage() {
  const { acts, placements, names, steps } = towerData();
  return (
    <Page>
      <Clocktower acts={acts} placements={placements} names={names} steps={steps} />
    </Page>
  );
}
