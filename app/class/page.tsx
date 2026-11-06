import type { Metadata } from "next";
import { castNames, courseActs } from "@/lib/classes/course";
import { Page } from "@/components/site/Page";
import { ClassHome } from "@/components/classes/ClassHome";

export const metadata: Metadata = { title: "Your class" };

// Classes work by link and live in the browser (lib/classes), so this page is the same plain file
// on GitHub Pages as in the local version. The server only adds the course's projects to choose from.
export default function ClassPage() {
  return (
    <Page>
      <ClassHome acts={courseActs()} names={castNames()} />
    </Page>
  );
}
