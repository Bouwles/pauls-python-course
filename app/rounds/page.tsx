import type { Metadata } from "next";
import { getConcepts, getIndex } from "@/lib/content/server";
import { BUILDINGS } from "@/lib/world/map";
import { Page } from "@/components/site/Page";
import { Rounds } from "@/components/rounds/Rounds";

export const metadata: Metadata = { title: "Morning Rounds" };

export default function RoundsPage() {
  const index = getIndex();
  const jobs = Object.fromEntries(index.acts.flatMap((a) => a.jobs).map((j) => [j.id, j]));
  const buildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, b.name.replace(/^The /, "the ")]));
  return (
    <Page narrow>
      <Rounds concepts={getConcepts()} jobs={jobs} characters={index.characters} buildings={buildings} />
    </Page>
  );
}
