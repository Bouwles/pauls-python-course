import type { Metadata } from "next";
import { castNames, courseActs } from "@/lib/classes/course";
import { Page } from "@/components/site/Page";
import { CoTeach } from "@/components/classes/CoTeach";

export const metadata: Metadata = { title: "Help teach a class" };

// A co-teacher link: /class/teach/#<the class and its register>.
export default function CoTeachPage() {
  return (
    <Page>
      <CoTeach acts={courseActs()} names={castNames()} />
    </Page>
  );
}
