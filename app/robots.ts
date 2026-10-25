import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

// Public pages are crawlable; the learner's own pages, the APIs and the owner's pages are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dev/", "/settings", "/map", "/rounds", "/shelf", "/drills", "/welcome", "/pricing/checkout", "/pricing/sandbox", "/pricing/thanks", "/teach"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
