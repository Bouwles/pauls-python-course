import type { Metadata } from "next";
import { getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { MapView } from "@/components/map/MapView";

export const metadata: Metadata = { title: "Saltmarsh" };

export default function MapPage() {
  const index = getIndex();
  return (
    <Page>
      <MapView acts={index.acts} characters={index.characters} placements={index.placements ?? []} />
    </Page>
  );
}
