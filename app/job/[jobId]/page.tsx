import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import { Workbench } from "@/components/workbench/Workbench";

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
  const concepts = getConcepts();
  const conceptTitles = Object.fromEntries(Object.values(concepts).map((c) => [c.id, c.title]));
  const act = index.acts.find((a) => a.id === job.act);
  return (
    <Suspense>
      <Workbench job={job} characters={index.characters} conceptTitles={conceptTitles} actTitle={act?.title ?? ""} />
    </Suspense>
  );
}
