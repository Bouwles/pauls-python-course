import type { Metadata } from "next";
import { BRAND, siteUrl } from "@/lib/brand";
import { getConcepts, getIndex } from "@/lib/content/server";
import { handbookPath } from "@/lib/handbook";
import { Page } from "@/components/site/Page";
import { ConceptIndex } from "@/components/concepts/ConceptIndex";

export const metadata: Metadata = {
  title: "Python Handbook",
  description: `Python, from print() to transformers, with examples you can run in the page. From ${BRAND.name}.`,
  alternates: { canonical: `${siteUrl()}${handbookPath()}` },
};

/** The public Python Handbook: every concept in the course, free and crawlable. */
export default function HandbookPage() {
  const index = getIndex();
  const jobs = Object.fromEntries(index.acts.flatMap((a) => a.jobs).map((j) => [j.id, { title: j.title, act: j.actNumber, number: j.number }]));
  const acts = index.acts.map((a) => ({ number: a.number, title: a.title }));
  const concepts = Object.values(getConcepts()).map((c) => ({ id: c.id, title: c.title, summaryHtml: c.summaryHtml, introducedIn: c.introducedIn }));
  return (
    <Page>
      <ConceptIndex concepts={concepts} jobs={jobs} acts={acts} />
    </Page>
  );
}
