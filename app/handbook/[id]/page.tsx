import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND, siteUrl } from "@/lib/brand";
import { getConcepts, getIndex } from "@/lib/content/server";
import { handbookPath } from "@/lib/handbook";
import { Page } from "@/components/site/Page";
import { ConceptPage } from "@/components/concepts/ConceptPage";

const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const describe = (html: string) => {
  const text = plain(html);
  return text.length > 155 ? `${text.slice(0, 152).replace(/\s+\S*$/, "")}...` : text;
};

/** Every concept is a static page: fast, and crawlable without running any script. */
export function generateStaticParams() {
  return Object.keys(getConcepts()).map((id) => ({ id }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const c = getConcepts()[id];
  if (!c) return { title: "Python Handbook" };
  const url = `${siteUrl()}${handbookPath(id)}`;
  const title = c.handbookTitle ?? `${c.title}: Python Handbook`;
  return {
    title,
    description: describe(c.summaryHtml),
    alternates: { canonical: url },
    openGraph: { title, description: describe(c.summaryHtml), url, type: "article" },
  };
}

export default async function HandbookEntry(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const concepts = getConcepts();
  const c = concepts[id];
  if (!c) notFound();
  const index = getIndex();
  const jobs = Object.fromEntries(index.acts.flatMap((a) => a.jobs).map((j) => [j.id, { id: j.id, title: j.title, status: j.status }]));
  const misconceptions = c.misconceptions.map((m) => index.misconceptions[m]).filter(Boolean).map((m) => m!.description);
  const related = c.related.map((r) => concepts[r]).filter(Boolean).map((r) => ({ id: r!.id, title: r!.title }));
  // Structured data (REDESIGN.md 9.1), so search engines know what the page teaches.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: c.handbookTitle ?? c.title,
    description: describe(c.summaryHtml),
    url: `${siteUrl()}${handbookPath(id)}`,
    inLanguage: "en-GB",
    isAccessibleForFree: true,
    learningResourceType: "Explanation",
    educationalLevel: "Beginner to intermediate",
    teaches: c.title,
    about: { "@type": "Thing", name: "Python (programming language)" },
    isPartOf: { "@type": "CreativeWorkSeries", name: "Python Handbook", url: `${siteUrl()}${handbookPath()}` },
    publisher: { "@type": "Organization", name: BRAND.name, url: siteUrl() },
  };
  return (
    <Page narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ConceptPage
        concept={{ id: c.id, title: c.title, summaryHtml: c.summaryHtml, example: c.example, exampleInputs: c.exampleInputs, drill: c.drill }}
        jobsUsing={[c.introducedIn, ...c.usedIn].filter((j, i, a): j is string => Boolean(j) && a.indexOf(j) === i).map((j) => jobs[j]!).filter(Boolean)}
        misconceptions={misconceptions}
        related={related}
      />
      {c.handbookHtml ? (
        <section className="prose" aria-label="In more depth" style={{ marginTop: 48 }} dangerouslySetInnerHTML={{ __html: c.handbookHtml }} />
      ) : null}
    </Page>
  );
}
