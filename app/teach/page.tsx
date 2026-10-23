import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { listClasses, profileFlags } from "@/lib/server/classes";
import { shortDate } from "@/lib/teaching";
import { Page } from "@/components/site/Page";
import { TeachHome } from "@/components/teach/TeachHome";

export const metadata: Metadata = { title: "Your classes" };

export default async function TeachPage() {
  const user = await getSessionUser().catch(() => null);
  if (!user) redirect("/login");
  const db = await getDb();
  const flags = await profileFlags(db, user.id);
  const classes = await listClasses(db, user.id);
  const now = Date.now();
  return (
    <Page>
      <TeachHome teacher={flags.teacher} classes={classes.map((c) => ({ ...c, made: shortDate(c.createdAt, now) }))} />
    </Page>
  );
}
