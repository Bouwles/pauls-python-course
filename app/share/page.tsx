import type { Metadata } from "next";
import { castNames } from "@/lib/classes/course";
import { shareCourse } from "@/lib/content/share-course";
import { Page } from "@/components/site/Page";
import { ShareView } from "@/components/share/ShareView";

// A shared project carries a name and someone's code, so it stays out of search engines.
export const metadata: Metadata = { title: "Shared", robots: { index: false, follow: false } };

// /share/#<a project, or a whole Shelf>: read from its link in the browser, so it's the same plain
// file on GitHub Pages as in the local version. The course adds what each project is called, who
// it's for and how it runs; its data files are fetched only when it runs (app/share/data).
export default function SharePage() {
  return (
    <Page>
      <ShareView course={shareCourse()} names={castNames()} />
    </Page>
  );
}
