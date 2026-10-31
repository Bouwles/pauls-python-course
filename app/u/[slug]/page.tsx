import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/server/db";
import { validSlug } from "@/lib/server/classes";
import { getIndex } from "@/lib/content/server";
import { BRAND } from "@/lib/brand";
import { Page } from "@/components/site/Page";
import { PublicShelf, type PublicAct } from "@/components/profile/PublicShelf";

interface PublicProfile {
  displayName: string;
  /** The learner's avatar (lib/avatar.ts), or an older look: read it with readAvatar(). */
  character: unknown;
  slug: string;
  shipped: { jobId: string; status: string }[];
}

/**
 * public_profile() is a security definer function that returns nothing unless the learner
 * has switched their profile on, and only the fields a public page shows.
 */
const load = cache(async (slug: string): Promise<PublicProfile | null> => {
  if (!validSlug(slug)) return null;
  const db = await getDb();
  const rows = await db.asService((q) => q<{ p: PublicProfile | null }>("select public.public_profile($1) as p", [slug]));
  return rows[0]?.p ?? null;
});

const nameOf = (p: PublicProfile) => p.displayName.trim() || "A learner";

export async function generateMetadata(props: PageProps<"/u/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await load(slug);
  if (!p) return { title: "Not found", robots: { index: false, follow: false } };
  const n = p.shipped.length;
  return {
    title: `${nameOf(p)}'s projects`,
    description: `${nameOf(p)} is learning Python at ${BRAND.name}, with ${n} ${n === 1 ? "project" : "projects"} shipped.`,
    // Opted in to a page, not to search engines.
    robots: { index: false, follow: false },
  };
}

export default async function PublicProfilePage(props: PageProps<"/u/[slug]">) {
  const { slug } = await props.params;
  const p = await load(slug);
  if (!p) notFound();
  const shipped = new Set(p.shipped.map((s) => s.jobId));
  const index = getIndex();
  const acts: PublicAct[] = index.acts
    .map((act) => ({
      id: act.id,
      number: act.number,
      title: act.subject || act.title,
      items: act.jobs
        .filter((j) => shipped.has(j.id) && j.shelf)
        .map((j) => ({ jobId: j.id, name: j.projectName || j.title, client: j.client, clientName: index.characters[j.client]?.name ?? j.client })),
    }))
    .filter((a) => a.items.length > 0);
  return (
    <Page>
      <PublicShelf name={nameOf(p)} character={p.character} shipped={p.shipped.length} acts={acts} slug={slug} />
    </Page>
  );
}
