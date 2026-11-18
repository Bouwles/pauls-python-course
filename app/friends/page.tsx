import { Suspense } from "react";
import type { Metadata } from "next";
import { castNames } from "@/lib/classes/course";
import { shareCourse } from "@/lib/content/share-course";
import { Page } from "@/components/site/Page";
import { Friends } from "@/components/friends/Friends";

export const metadata: Metadata = { title: "Friends", robots: { index: false, follow: false } };

// Friends live in Supabase (lib/friends.ts), so this is one plain page read in the browser:
// /friends, /friends?u=<username> for a friend's Shelf, and &p=<project> for one of their projects.
export default function FriendsPage() {
  return (
    <Page>
      <Suspense>
        <Friends course={shareCourse()} names={castNames()} />
      </Suspense>
    </Page>
  );
}
