import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import { Workbench } from "@/components/workbench/Workbench";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/job/[jobId]">): Promise<Metadata> {
  const { jobId } = await props.params;
  const job = getJob(jobId);
  return { title: job ? job.title : "Not found" };
}

export default async function JobPage(props: PageProps<"/job/[jobId]">) {
  const { jobId } = await props.params;
  const job = getJob(jobId);
  if (!job || job.status !== "written") notFound();
  const index = getIndex();
  const act = index.acts.find((a) => a.id === job.act);
  // Every project is open to everyone.
  // "Project 2 of 13" in the header, and the next project to offer when this one ships.
  const numbered = act?.jobs.filter((j) => !j.sidequest && !j.placementFor) ?? [];
  const at = numbered.findIndex((j) => j.id === job.id);
  const next = at >= 0 ? numbered.slice(at + 1).find((j) => j.status === "written") : undefined;
  const concepts = getConcepts();
  const conceptTitles = Object.fromEntries(Object.values(concepts).map((c) => [c.id, c.title]));
  return (
    <Suspense>
      <Workbench
        job={job}
        characters={index.characters}
        conceptTitles={conceptTitles}
        actTitle={act?.title ?? ""}
        actProjects={numbered.length || undefined}
        nextJob={next ? { id: next.id, title: next.title } : null}
      />
    </Suspense>
  );
}
