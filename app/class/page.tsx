import { Suspense } from "react";
import type { Metadata } from "next";
import { castNames, courseActs, courseSteps } from "@/lib/classes/course";
import { ACCOUNTS } from "@/lib/supabase/project";
import { Page } from "@/components/site/Page";
import { ClassHome } from "@/components/classes/ClassHome";
import { AccountClasses } from "@/components/classes/AccountClasses";

export const metadata: Metadata = { title: "Your class" };

// With accounts (GitHub Pages and Supabase), classes are kept with them: join with a code, and a
// teacher sees their students' progress and code (AccountClasses). Without accounts, classes work
// by link and live in the browser (lib/classes), the same on GitHub Pages as in the local version.
export default function ClassPage() {
  return (
    <Page>
      {ACCOUNTS ? (
        <Suspense>
          <AccountClasses acts={courseActs()} names={castNames()} steps={courseSteps()} />
        </Suspense>
      ) : (
        <ClassHome acts={courseActs()} names={castNames()} />
      )}
    </Page>
  );
}
