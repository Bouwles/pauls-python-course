import type { Metadata } from "next";
import { getConcepts, getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { Rounds } from "@/components/rounds/Rounds";

export const metadata: Metadata = { title: "Morning Rounds" };

export default function RoundsPage() {
  const index = getIndex();
  const jobs = Object.fromEntries(index.acts.flatMap((a) => a.jobs).map((j) => [j.id, j]));
  return (
    <Page narrow>
      <Rounds concepts={getConcepts()} jobs={jobs} characters={index.characters} />
    </Page>
  );
}
