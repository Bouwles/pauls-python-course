// Seeds a demo learner with progress through half of Act I (Section 13.3),
// through the app's own API, so it works against the local backend or Supabase.
// Needs the server running:  npx tsx scripts/seed-demo.ts [base-url]
import fs from "node:fs";
import path from "node:path";
import type { ContentIndex, Job } from "../lib/content/types";
import { newCardRow } from "../lib/review/deck";

const base = process.argv[2] ?? "http://localhost:3000";
const email = "demo@saltmarsh.test";
const password = "demo-harbour-1987";
const content = path.join(process.cwd(), "generated", "content");
const index = JSON.parse(fs.readFileSync(path.join(content, "index.json"), "utf8")) as ContentIndex;
const solutions = JSON.parse(fs.readFileSync(path.join(content, "server", "solutions.json"), "utf8")) as Record<string, Record<string, string>>;

async function call(p: string, body: unknown, cookie = "") {
  return fetch(`${base}${p}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie }, body: JSON.stringify(body) });
}

let res = await call("/api/auth/signup", { email, password, ageConfirmed: true });
if (!res.ok) res = await call("/api/auth/login", { email, password });
if (!res.ok) throw new Error(`could not sign in the demo learner: ${await res.text()}`);
const cookie = (res.headers.get("set-cookie") ?? "").split(";")[0]!;

const DAY = 86_400_000;
const now = Date.now();
const harbour = index.acts[0]!;
const half = harbour.jobs.slice(0, Math.ceil(harbour.jobs.length / 2)).filter((j) => j.status === "written");
const changes: { table: string; row: Record<string, unknown> }[] = [];

changes.push({
  table: "profile",
  row: {
    key: "me",
    displayName: "Demo",
    character: { species: "otter", coat: "chestnut", jumper: "sea", accessory: "scarf" },
    settings: {},
    experience: "none",
    lastLocation: { jobId: harbour.jobs[half.length]?.id ?? half[half.length - 1]!.id, stepId: "ask" },
    onboarded: true,
    updatedAt: now,
  },
});

half.forEach((summary, n) => {
  const job = JSON.parse(fs.readFileSync(path.join(content, "jobs", `${summary.id}.json`), "utf8")) as Job;
  const shippedAt = now - (half.length - n) * DAY;
  changes.push({ table: "job_progress", row: { key: job.id, jobId: job.id, status: "shipped", startedAt: shippedAt - 3600_000, shippedAt, stretchDone: [], timeSpent: job.estimatedMinutes * 60, updatedAt: shippedAt } });
  for (const step of job.steps) {
    changes.push({
      table: "step_progress",
      row: { key: `${job.id}/${step.id}`, jobId: job.id, stepId: step.id, status: "passed", attempts: 1, hintsUsed: 0, seenSolution: false, predictChoice: null, selfExplanation: null, selfRating: null, timeSpent: 120, data: {}, updatedAt: shippedAt },
    });
    const files = solutions[`${job.id}/${step.id}`];
    if (files && "files" in step) {
      for (const [filename, content] of Object.entries(files)) {
        changes.push({ table: "code_files", row: { key: `${job.id}/${step.id}/${filename}`, jobId: job.id, stepId: step.id, filename, content, cursor: 0, updatedAt: shippedAt } });
      }
    }
  }
  for (const concept of job.conceptsIntroduced) {
    const card = newCardRow(concept, shippedAt);
    // Older jobs' concepts are due now, so Morning Rounds has something in it.
    changes.push({ table: "review_cards", row: { ...card, due: n < 2 ? now - DAY : card.due } });
  }
});

for (let i = 0; i < changes.length; i += 400) {
  const r = await call("/api/sync", { changes: changes.slice(i, i + 400) }, cookie);
  if (!r.ok) throw new Error(`sync failed: ${await r.text()}`);
}
console.log(`Demo learner ready: ${email} / ${password}. ${half.length} jobs shipped, ${changes.length} rows.`);
