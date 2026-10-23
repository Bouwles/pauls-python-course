import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseEnabled } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { Page } from "@/components/site/Page";

export const metadata: Metadata = { title: "Development mailbox" };
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
      <h1 style={{ fontSize: "var(--step-3)", marginBottom: 16 }}>Development mailbox</h1>
      <p style={{ color: "var(--ink-2)", marginBottom: 24 }}>No email service is configured, so sign-in links land here instead.</p>
      {mail.length === 0 ? <p>Nothing yet.</p> : null}
      <ol style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
        {mail.map((m) => (
          <li key={m.id} style={{ border: "1px solid var(--rule)", padding: 16, borderRadius: 4 }}>
            <p style={{ fontSize: "var(--step--1)", color: "var(--ink-2)" }}>
              To {m.to_email}, {new Date(m.created_at).toLocaleString("en-GB")}
            </p>
            <p style={{ fontWeight: 600, margin: "4px 0" }}>{m.subject}</p>
            <p>{m.body}</p>
            {m.link ? (
              <p style={{ marginTop: 8 }}>
                <a href={m.link}>Open the link</a>
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </Page>
  );
}
