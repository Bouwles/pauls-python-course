import type { Metadata } from "next";
import { getIndex } from "@/lib/content/server";
import { castNames } from "@/lib/classes/course";
import { Page } from "@/components/site/Page";
import { CertificateView, type CertificateAct } from "@/components/certificates/CertificateView";

// A certificate carries a name, so it stays out of search engines.
export const metadata: Metadata = { title: "Certificate", robots: { index: false, follow: false } };

// /certificate/#<the certificate>: drawn in the browser from its link, so it's the same plain
// file on GitHub Pages as in the local version. The course only adds each Act's name.
export default function CertificatePage() {
  const acts: CertificateAct[] = getIndex().acts.map((a) => ({
    number: a.number,
    name: a.subject || a.title,
    projects: a.jobs.filter((j) => !j.sidequest && !j.placementFor && j.status === "written").length,
  }));
  return (
    <Page>
      <CertificateView acts={acts} names={castNames()} />
    </Page>
  );
}
