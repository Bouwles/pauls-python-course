import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { BRAND } from "@/lib/brand";
import { getIndex } from "@/lib/content/server";
import { getDb } from "@/lib/server/db";
import { sharedProject } from "@/lib/server/share";
import { Page } from "@/components/site/Page";
import { SharedProjectView } from "@/components/share/SharedProject";

export const dynamic = "force-dynamic";

const load = cache(async (slug: string, jobId: string) => sharedProject(await getDb(), slug, jobId));

export async function generateMetadata(props: { params: Promise<{ slug: string; jobId: string }> }): Promise<Metadata> {
  const { slug, jobId } = await props.params;
  const p = await load(slug, jobId);
  if (!p) return { title: "Not found", robots: { index: false, follow: false } };
  const title = `${p.name} shipped a ${p.job.projectName} in ${BRAND.name}`;
  return {
    title,
    description: `${p.job.projectName}: a real Python program, written by ${p.name}. Run it in the page.`,
    openGraph: { title, images: [{ url: `/u/${slug}/${jobId}/card`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, images: [`/u/${slug}/${jobId}/card`] },
    // Opted in to a page, not to search engines.
    robots: { index: false, follow: false },
  };
}

/** A shipped project's public page (REDESIGN.md 9.2): opt-in, through the learner's public profile. */
export default async function SharedProjectPage(props: { params: Promise<{ slug: string; jobId: string }> }) {
  const { slug, jobId } = await props.params;
  const p = await load(slug, jobId);
  if (!p) notFound();
  const act = getIndex().acts.find((a) => a.id === p.job.act);
  const client = getIndex().characters[p.job.client]?.name ?? p.job.client;
  return (
    <Page>
      <SharedProjectView
        slug={slug}
        name={p.name}
        character={p.character}
        projectName={p.job.projectName}
        client={client}
        actLabel={act ? `Act ${act.number}, ${act.title}` : ""}
        shelfObject={p.job.shelf?.object ?? null}
        files={p.files}
        entry={p.entry}
        data={p.job.data}
        shippedAt={p.shippedAt}
      />
    </Page>
  );
}
