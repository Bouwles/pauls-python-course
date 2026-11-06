import type { Metadata } from "next";
import { castNames, courseActs } from "@/lib/classes/course";
import { Page } from "@/components/site/Page";
import { JoinClass } from "@/components/classes/JoinClass";

export const metadata: Metadata = { title: "Join a class" };

// A join link: /class/join/#<the class>. One page for every class, read in the browser, since a
// static export can't have a page per class.
export default function JoinPage() {
  return (
    <Page>
      <JoinClass acts={courseActs()} names={castNames()} />
    </Page>
  );
}
