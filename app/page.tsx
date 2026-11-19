import type { Metadata } from "next";
import { BRAND, siteUrl } from "@/lib/brand";
import { Page } from "@/components/site/Page";
import { Clocktower } from "@/components/clocktower/Clocktower";
import { towerData } from "@/components/clocktower/data";
import { HomeSwitch } from "@/components/landing/HomeSwitch";
import { Landing } from "@/components/landing/Landing";
import { landingData } from "@/components/landing/data";
import { ACCOUNTS } from "@/lib/supabase/project";

// What search results show for the home page: the name first, then what it is.
export const metadata: Metadata = {
  title: { absolute: `${BRAND.name} · Learn Python free in your browser` },
  description: BRAND.description,
  alternates: { canonical: "/" },
};

/**
 * Structured data for search engines: the site's name (so a search for it shows the name, not
 * the address) and the course itself, free and in English.
 */
function structuredData() {
  const url = `${siteUrl()}/`;
  const by = { "@type": "Person", name: BRAND.creditName };
  return [
    { "@context": "https://schema.org", "@type": "WebSite", name: BRAND.name, alternateName: [BRAND.shortName, "Pauls Python Course"], url },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: BRAND.name,
      description: BRAND.description,
      url,
      provider: { "@type": "Organization", name: BRAND.name, url, founder: by },
      creator: by,
      inLanguage: "en-GB",
      isAccessibleForFree: true,
      educationalLevel: "Beginner",
      teaches: ["Python", "Algorithms and data structures", "Data science", "Machine learning", "Deep learning", "Reinforcement learning"],
      offers: { "@type": "Offer", price: 0, priceCurrency: "GBP", category: "Free" },
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT400H" },
    },
  ];
}

// Home is the Clocktower. On GitHub Pages with accounts, learning needs an account, so anyone
// signed out gets the landing page here instead (it's also at /about for everyone). Without
// accounts, everyone goes straight in, with their progress kept in the browser.
export default function Home() {
  const { acts, placements, names, steps } = towerData();
  const tower = <Clocktower acts={acts} placements={placements} names={names} steps={steps} />;
  return (
    <Page>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c") }} />
      {ACCOUNTS ? <HomeSwitch landing={<Landing data={landingData()} />} tower={tower} /> : tower}
    </Page>
  );
}
