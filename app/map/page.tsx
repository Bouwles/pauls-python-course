import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { MapView } from "@/components/map/MapView";

export const metadata: Metadata = { title: `The map of ${BRAND.townName}` };

export default function MapPage() {
  const index = getIndex();
  return (
    <Page wide>
      <MapView acts={index.acts} characters={index.characters} placements={index.placements ?? []} />
    </Page>
  );
}
