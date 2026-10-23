import type { Metadata } from "next";
import { Suspense } from "react";
import { getConcepts } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { Drills } from "@/components/drills/Drills";

export const metadata: Metadata = { title: "Drills" };

export default function DrillsPage() {
  const concepts = Object.values(getConcepts()).filter((c) => c.drill && c.introducedIn);
  return (
    <Page narrow>
      <Suspense>
        <Drills concepts={concepts} />
      </Suspense>
    </Page>
  );
}
