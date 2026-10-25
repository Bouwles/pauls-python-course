// Act certificates (REDESIGN.md 9.2): for Pro learners who've shipped every main project in an
// Act. One per learner per Act, with a public verification page. Act I is free and so isn't
// certified; the certificate is part of Pro.
import { randomBytes } from "node:crypto";
import { BRAND } from "../brand";
import { getIndex } from "../content/server";
import { FREE_ACTS } from "../plans";
import { Raster } from "../pixel/raster";
import type { Db } from "./db";
import { getAccess } from "./entitlements";

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

export type IssueResult = { ok: true; certificate: Certificate } | { ok: false; reason: "not-pro" | "free-act" | "not-finished" | "no-act" };

export async function issueCertificate(db: Db, userId: string, actId: string, name: string): Promise<IssueResult> {
  const act = getIndex().acts.find((a) => a.id === actId);
  if (!act) return { ok: false, reason: "no-act" };
  if (FREE_ACTS.has(act.id)) return { ok: false, reason: "free-act" };
  if (!(await getAccess(db, userId)).pro) return { ok: false, reason: "not-pro" };
  const main = act.jobs.filter((j) => !j.sidequest && !j.placementFor && j.status === "written").map((j) => j.id);
  const shipped = await db.asService((q) => q<{ job_id: string }>("select job_id from public.job_progress where user_id = $1 and status in ('shipped', 'shipped-stretch', 'placed')", [userId]));
  const done = new Set(shipped.map((r) => r.job_id));
  if (!main.length || !main.every((id) => done.has(id))) return { ok: false, reason: "not-finished" };
  const id = randomBytes(9).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").padEnd(12, "0").slice(0, 12);
  const clean = name.trim().slice(0, 60) || "An apprentice";
  const [row] = await db.asService((q) =>
    q(
      `insert into public.certificates (id, user_id, act_id, act_number, act_title, name, projects) values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (user_id, act_id) do update set name = excluded.name returning *`,
      [id, userId, act.id, act.number, act.title, clean, main.length],
    ),
  );
  return { ok: true, certificate: fromRow(row!) };
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** The certificate as pixel art: 960x680, every pixel on the palette. */
export function drawCertificate(c: Certificate, siteUrl: string): Raster {
  const W = 960;
  const H = 680;
  const r = new Raster(W, H, "G");
  // The paper, with a stepped border: dark edge, brass rule, paper.
  r.rect(24, 24, W - 48, H - 48, "e");
  r.rect(32, 32, W - 64, H - 64, "h");
  r.rect(40, 40, W - 80, H - 80, "M");
  r.rect(56, 56, W - 112, 4, "q");
  r.rect(56, H - 60, W - 112, 4, "q");
  // Corner rivets.
  for (const [x, y] of [[48, 48], [W - 56, 48], [48, H - 56], [W - 56, H - 56]] as const) r.rect(x, y, 8, 8, "h");
  r.icon("mark", W / 2 - 32, 84, 4);
  r.textCentred(BRAND.name, W / 2, 168, 5, "G");
  r.textCentred("Certificate of completion", W / 2, 222, 3, "2");
  r.textCentred(c.name, W / 2, 290, 6, "u");
  r.textCentred(`Completed Act ${ROMAN[c.actNumber] ?? c.actNumber}: ${c.actTitle}`, W / 2, 372, 3, "G");
  r.textCentred(`${c.projects} projects shipped`, W / 2, 410, 3, "2");
  const date = new Date(c.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  r.textCentred(date, W / 2, 470, 3, "G");
  // The seal: a stepped red disc with ribbon tails and the heart in the middle.
  const sx = W - 164;
  const sy = H - 196;
  const disc = (radius: number, colour: string) => {
    for (let dy = -radius; dy < radius; dy += 4) {
      const half = Math.round(Math.sqrt(radius * radius - (dy + 2) * (dy + 2)) / 4) * 4;
      r.rect(sx - half, sy + dy, half * 2, 4, colour);
    }
  };
  r.rect(sx - 28, sy + 20, 16, 52, "j");
  r.rect(sx + 12, sy + 20, 16, 52, "j");
  r.rect(sx - 28, sy + 64, 8, 8, "M");
  r.rect(sx + 20, sy + 64, 8, 8, "M");
  disc(44, "j");
  disc(40, "k");
  disc(28, "j");
  r.icon("heart", sx - 16, sy - 14, 4);
  r.textCentred(`Verify: ${siteUrl.replace(/^https?:\/\//, "")}/certificates/${c.id}`, W / 2, H - 100, 2, "2");
  return r;
}
