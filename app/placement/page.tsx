import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Placement } from "@/components/placement/Placement";
import { getIndex } from "@/lib/content/server";

export const metadata: Metadata = { title: "Placement test" };

export default function PlacementPage() {
  const index = getIndex();
  return (
    <Page narrow>
      <Placement acts={index.acts} placements={index.placements ?? []} />
    </Page>
  );
}
