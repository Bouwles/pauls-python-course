import type { Metadata } from "next";
import { castNames, courseActs } from "@/lib/classes/course";
import { Page } from "@/components/site/Page";
import { ReportView } from "@/components/classes/ReportView";

export const metadata: Metadata = { title: "Progress" };

// A progress link: /class/report/#<a student's progress>, opened by their teacher.
export default function ReportPage() {
  return (
    <Page>
      <ReportView acts={courseActs()} names={castNames()} />
    </Page>
  );
}
