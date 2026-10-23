import type { Metadata } from "next";
import { getConcepts, getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { ConceptIndex } from "@/components/concepts/ConceptIndex";

export const metadata: Metadata = { title: "Concepts" };

export default function ConceptsPage() {
  const index = getIndex();
  const jobs = Object.fromEntries(index.acts.flatMap((a) => a.jobs).map((j) => [j.id, { title: j.title, act: j.actNumber, number: j.number }]));
  const concepts = Object.values(getConcepts()).map((c) => ({ id: c.id, title: c.title, summaryHtml: c.summaryHtml, introducedIn: c.introducedIn }));
  return (
    <Page>
      <ConceptIndex concepts={concepts} jobs={jobs} />
    </Page>
  );
}
