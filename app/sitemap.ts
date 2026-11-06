import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";
import { getConcepts } from "@/lib/content/server";
import { handbookPath } from "@/lib/handbook";

// The same for every visitor, so it can be a plain file (and is, on GitHub Pages).
export const dynamic = "force-static";

// Every public page, for search engines (REDESIGN.md 9.1): the landing page, pricing and
// syllabus, and one Handbook page per concept.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/syllabus`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}${handbookPath()}`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/credits`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  const concepts = Object.values(getConcepts()).map((c) => ({ url: `${base}${handbookPath(c.id)}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 }));
  return [...fixed, ...concepts];
}
