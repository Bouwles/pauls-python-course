import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseEnabled } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { Page } from "@/components/site/Page";
import styles from "./Mailbox.module.css";

export const metadata: Metadata = { title: "Development mailbox", robots: { index: false } };
export const dynamic = "force-dynamic";

// Local development only: emails the built-in auth would have sent.
export default async function Mailbox() {
  if (supabaseEnabled() || process.env.NODE_ENV === "production") notFound();
  const db = await getDb();
  const mail = await db.asService((q) =>
    q<{ id: number; to_email: string; subject: string; body: string; link: string | null; created_at: string }>("select * from local_auth.mailbox order by id desc limit 20"),
  );
  return (
    <Page narrow>
      <div className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>Development mailbox</h1>
          <p className={styles.lede}>No email service is configured, so sign-in links land here instead. The newest is first.</p>
        </header>
        {mail.length === 0 ? <p className={styles.meta}>Nothing yet.</p> : null}
        <ol className={styles.list}>
          {mail.map((m) => (
            <li key={m.id} className={styles.mail}>
              <p className={styles.meta}>
                To {m.to_email}, {new Date(m.created_at).toLocaleString("en-GB")}
              </p>
              <p className={styles.subject}>{m.subject}</p>
              <p className={styles.body}>{m.body}</p>
              {m.link ? (
                <p>
                  <a href={m.link}>Open the link</a>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}
