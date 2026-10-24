// Sending email that isn't sign-in (Supabase sends those): the weekly note from Moss.
// Local development: the dev mailbox (/dev/mailbox). Production: Resend, when
// RESEND_API_KEY is set; otherwise nothing is sent and the caller is told so.
import { getDb } from "./db";
import { supabaseEnabled } from "./auth";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  link?: string;
}

export type MailResult = "sent" | "mailbox" | "no-provider";

export async function sendMail(mail: Mail): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM ?? "Moss <moss@example.org>", to: [mail.to], subject: mail.subject, text: mail.link ? `${mail.text}\n\n${mail.link}` : mail.text }),
    });
    if (!res.ok) throw new Error(`Resend: ${res.status} ${await res.text()}`);
    return "sent";
  }
  if (!supabaseEnabled()) {
    const db = await getDb();
    await db.asService((q) => q("insert into local_auth.mailbox (to_email, subject, body, link) values ($1, $2, $3, $4)", [mail.to, mail.subject, mail.text, mail.link ?? null]));
    return "mailbox";
  }
  return "no-provider";
}
