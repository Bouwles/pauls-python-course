// Act certificates: for anyone who's shipped every main project in an Act. One per learner per
// Act, with a verification page. The picture of it (PNG and PDF) is drawn by
// components/certificates/CertificateImage.tsx.
import { randomBytes } from "node:crypto";
import { getIndex } from "../content/server";
import type { Db } from "./db";

export interface Certificate {
  id: string;
  userId: string;
  actId: string;
  actNumber: number;
  actTitle: string;
  name: string;
  projects: number;
  issuedAt: string;
}

const fromRow = (r: Record<string, unknown>): Certificate => ({
  id: r.id as string,
  userId: r.user_id as string,
  actId: r.act_id as string,
  actNumber: r.act_number as number,
  actTitle: r.act_title as string,
  name: r.name as string,
  projects: r.projects as number,
  issuedAt: new Date(r.issued_at as string).toISOString(),
});

export async function getCertificate(db: Db, id: string): Promise<Certificate | null> {
  if (!/^[a-z0-9]{12}$/.test(id)) return null;
  const [row] = await db.asService((q) => q("select * from public.certificates where id = $1", [id]));
  return row ? fromRow(row) : null;
}

export async function myCertificates(db: Db, userId: string): Promise<Certificate[]> {
  const rows = await db.asService((q) => q("select * from public.certificates where user_id = $1 order by act_number", [userId]));
  return rows.map(fromRow);
}

export type IssueResult = { ok: true; certificate: Certificate } | { ok: false; reason: "not-finished" | "no-act" };

export async function issueCertificate(db: Db, userId: string, actId: string, name: string): Promise<IssueResult> {
  const act = getIndex().acts.find((a) => a.id === actId);
  if (!act) return { ok: false, reason: "no-act" };
  const main = act.jobs.filter((j) => !j.sidequest && !j.placementFor && j.status === "written").map((j) => j.id);
  const shipped = await db.asService((q) => q<{ job_id: string }>("select job_id from public.job_progress where user_id = $1 and status in ('shipped', 'shipped-stretch', 'placed')", [userId]));
  const done = new Set(shipped.map((r) => r.job_id));
  if (!main.length || !main.every((id) => done.has(id))) return { ok: false, reason: "not-finished" };
  const id = randomBytes(9).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").padEnd(12, "0").slice(0, 12);
  const clean = name.trim().slice(0, 60) || "A learner";
  const [row] = await db.asService((q) =>
    q(
      `insert into public.certificates (id, user_id, act_id, act_number, act_title, name, projects) values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (user_id, act_id) do update set name = excluded.name returning *`,
      [id, userId, act.id, act.number, act.title, clean, main.length],
    ),
  );
  return { ok: true, certificate: fromRow(row!) };
}
