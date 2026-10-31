import type { Metadata } from "next";
import { Suspense } from "react";
import { getConcepts, getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { Drills, type DrillAct } from "@/components/drills/Drills";

export const metadata: Metadata = { title: "Drills" };

export default function DrillsPage() {
  const index = getIndex();
  const concepts = Object.values(getConcepts()).filter((c) => c.drill && c.introducedIn);
  const actOf = new Map(index.acts.flatMap((a) => a.jobs.map((j) => [j.id, a] as const)));
  // Each drill sits under the Act that first uses the idea, in course order.
  const order = new Map(index.acts.flatMap((a) => a.jobs).map((j, i) => [j.id, i]));
  const acts: DrillAct[] = index.acts
    .map((a) => ({
      number: a.number,
      title: a.subject || a.title,
      concepts: concepts.filter((c) => actOf.get(c.introducedIn!)?.id === a.id).sort((x, y) => (order.get(x.introducedIn!) ?? 0) - (order.get(y.introducedIn!) ?? 0)),
    }))
    .filter((a) => a.concepts.length > 0);
  return (
    <Page>
      <Suspense>
        <Drills acts={acts} characters={index.characters} />
      </Suspense>
    </Page>
  );
}
