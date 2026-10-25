import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import { FREE_ACTS } from "@/lib/plans";
import { getSessionUser } from "@/lib/server/auth";
import { accessToJob } from "@/lib/server/gate";
import { Workbench } from "@/components/workbench/Workbench";
import { LockedProject } from "@/components/pricing/LockedProject";

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
  // Server-side gating (REDESIGN.md 8.3): a Pro project's steps never reach a browser that
  // can't open it. The first project of a Pro Act shows its Ask as a preview.
  const user = await getSessionUser().catch(() => null);
  const access = await accessToJob(job.id, user?.id ?? null);
  if (access === "missing") notFound();
  if (!access.open && !access.preview) return <LockedProject title={job.title} actTitle={act?.title ?? ""} actNumber={act?.number ?? 0} />;
  const shown = access.open ? job : { ...job, steps: job.steps.filter((s) => s.type === "ask"), stretch: [], data: {} };
  // The last project of the free Act ends with the gate scene for anyone without Pro.
  const freeAct = index.acts.find((a) => FREE_ACTS.has(a.id));
  const capstone = freeAct?.jobs.filter((j) => !j.sidequest && !j.placementFor).at(-1)?.id === job.id;
  const gateActs = capstone ? index.acts.map((a) => ({ id: a.id, number: a.number, title: a.title, subject: a.subject })) : undefined;
  const concepts = getConcepts();
  const conceptTitles = Object.fromEntries(Object.values(concepts).map((c) => [c.id, c.title]));
  return (
    <Suspense>
      <Workbench job={shown} characters={index.characters} conceptTitles={conceptTitles} actTitle={act?.title ?? ""} preview={!access.open} gateActs={gateActs} />
    </Suspense>
  );
}
