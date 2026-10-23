import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConcepts, getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { ConceptPage } from "@/components/concepts/ConceptPage";

export async function generateMetadata(props: PageProps<"/concepts/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: getConcepts()[id]?.title ?? "Concept" };
}

export default async function Concept(props: PageProps<"/concepts/[id]">) {
  const { id } = await props.params;
  const concepts = getConcepts();
  const c = concepts[id];
  if (!c) notFound();
  const index = getIndex();
  const jobs = Object.fromEntries(index.acts.flatMap((a) => a.jobs).map((j) => [j.id, { id: j.id, title: j.title, status: j.status }]));
  const misconceptions = c.misconceptions.map((m) => index.misconceptions[m]).filter(Boolean).map((m) => m!.description);
  const related = c.related.map((r) => concepts[r]).filter(Boolean).map((r) => ({ id: r!.id, title: r!.title }));
  return (
    <Page narrow>
      <ConceptPage
        concept={{ id: c.id, title: c.title, summaryHtml: c.summaryHtml, example: c.example, exampleInputs: c.exampleInputs, drill: c.drill }}
        jobsUsing={[c.introducedIn, ...c.usedIn].filter((j, i, a): j is string => Boolean(j) && a.indexOf(j) === i).map((j) => jobs[j]!).filter(Boolean)}
        misconceptions={misconceptions}
        related={related}
      />
    </Page>
  );
}
