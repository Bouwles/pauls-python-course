import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { classAssignments, getClass, roster } from "@/lib/server/classes";
import { getIndex, getJobSummary } from "@/lib/content/server";
import { dueDate, duration, lastActive } from "@/lib/teaching";
import { Page } from "@/components/site/Page";
import { ClassView, type AssignmentItem, type JobGroup, type StudentItem } from "@/components/teach/ClassView";

async function load(classId: string) {
  const user = await getSessionUser().catch(() => null);
  if (!user) return null;
  return { user, cls: await getClass(await getDb(), user.id, classId) };
}

export async function generateMetadata(props: PageProps<"/teach/[classId]">): Promise<Metadata> {
  const { classId } = await props.params;
  const found = await load(classId);
  return { title: found?.cls?.name ?? "Class" };
}

export default async function ClassPage(props: PageProps<"/teach/[classId]">) {
  const { classId } = await props.params;
  const found = await load(classId);
  if (!found) redirect("/login");
  const { user, cls } = found;
  if (!cls) notFound();
  const db = await getDb();
  const now = Date.now();
  const title = (id: string) => getJobSummary(id)?.title ?? id;

  const students: StudentItem[] = (await roster(db, user.id, classId, now)).map((s) => ({
    id: s.id,
    name: s.name,
    character: s.character,
    shipped: s.shipped,
    current: s.currentJobId ? title(s.currentJobId) : null,
    week: s.weekSeconds,
    weekText: duration(s.weekSeconds),
    total: s.totalSeconds,
    totalText: duration(s.totalSeconds),
    lastActive: s.lastActive ?? 0,
    lastActiveText: lastActive(s.lastActive, now),
  }));

  const assignments: AssignmentItem[] = (await classAssignments(db, user.id, classId)).map((a) => {
    const job = getJobSummary(a.jobId);
    return {
      id: a.id,
      jobId: a.jobId,
      title: job?.title ?? a.jobId,
      act: job ? `Act ${job.actNumber}, project ${job.number}` : "",
      due: a.dueAt ? dueDate(a.dueAt, now) : null,
      shipped: a.shipped,
    };
  });

  const groups: JobGroup[] = getIndex()
    .acts.map((act) => ({
      label: `Act ${act.number}: ${act.subject || act.title}`,
      jobs: act.jobs.filter((j) => j.status === "written" && !j.placementFor).map((j) => ({ id: j.id, title: `${j.number}. ${j.projectName || j.title}` })),
    }))
    .filter((g) => g.jobs.length > 0);

  return (
    <Page>
      <ClassView cls={{ id: cls.id, name: cls.name, joinCode: cls.joinCode }} students={students} assignments={assignments} groups={groups} />
    </Page>
  );
}
