"use client";

// A capstone milestone (Act IX): the learner writes their own test plan,
// shows their work, and goes through Paul's checklist. Paul's review is the
// checklist: anything not yet true comes back with why it matters.
import { useEffect, useRef, useState } from "react";
import type { MilestoneStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { PROFESSOR } from "@/lib/cast";
import { Button } from "../../ui/Button";
import { Instructions } from "../Instructions";
import { useWorkbench } from "../context";
import { NextRow } from "./common";
import styles from "./steps.module.css";
import th from "./TakeHome.module.css";

const PLAN_MIN_LINES = 3;

interface Saved {
  checks?: Record<string, boolean>;
  plan?: string;
  link?: string;
  reviewedAt?: number;
}

export function MilestoneStepView({ step, row }: { step: MilestoneStep; row: StepProgressRow }) {
  const { areas, job, updateStep, markPassed, guest, landing, say, nameOf, speaker } = useWorkbench();
  const paul = nameOf(speaker(PROFESSOR));
  const saved = row.data as Saved;
  const [checks, setChecks] = useState<Record<string, boolean>>(saved.checks ?? {});
  const [plan, setPlan] = useState(saved.plan ?? "");
  const [link, setLink] = useState(saved.link ?? "");
  const [review, setReview] = useState<{ missing: { id: string; textHtml: string; whyHtml: string }[]; notes: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const zipInput = useRef<HTMLInputElement>(null);
  const done = row.status === "passed";

  // Keep drafts as they are typed (debounced), so nothing is lost between visits.
  useEffect(() => {
    const t = setTimeout(() => void updateStep(step.id, (r) => ({ data: { ...r.data, checks, plan, link } })), 800);
    return () => clearTimeout(t);
  }, [checks, plan, link, step.id, updateStep]);

  const planLines = plan.split("\n").filter((l) => l.trim().length > 3).length;

  const ask = async () => {
    setError(null);
    const missing = step.checklist.filter((c) => !checks[c.id]);
    const notes: string[] = [];
    if (step.testPlan && planLines < PLAN_MIN_LINES) notes.push(`Your test plan has ${planLines} ${planLines === 1 ? "test" : "tests"}. Write at least ${PLAN_MIN_LINES}: what you'll check, and what result tells you it works.`);
    const hasZip = Boolean(zipInput.current?.files?.length);
    if (step.evidence === "link" && !/^https:\/\/\S+$/.test(link.trim())) notes.push(`${paul} needs to see it: a link to the repository or the running project, starting with https://.`);
    if (step.evidence === "zip" && !hasZip && !saved.reviewedAt) notes.push(`${paul} needs to see it: add the project as a zip.`);
    setReview({ missing, notes });
    if (missing.length || notes.length) return;
    if (!guest && !landing) {
      setBusy(true);
      const data = new FormData();
      data.set("jobId", job.id);
      data.set("stepId", step.id);
      data.set("checks", JSON.stringify(checks));
      data.set("plan", plan);
      data.set("link", link.trim());
      const file = zipInput.current?.files?.[0];
      if (file) data.set("project", file);
      try {
        const res = await fetch("/api/milestone", { method: "POST", body: data });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setError(body.error ?? "That didn't go through. Try again.");
          return;
        }
      } catch {
        setError("Couldn't reach the server. Check your connection.");
        return;
      } finally {
        setBusy(false);
      }
    }
    await markPassed(step.id, { data: { ...row.data, checks, plan, link, reviewedAt: Date.now() } });
    say(PROFESSOR, step.testPlan ? "Signed off. Keep the test plan; you'll want it at the next milestone." : "Signed off.", { kind: "pass", face: "pleased" });
  };

  return (
    <>
      <Instructions step={step} footer={<NextRow row={row} />}>
        {step.testPlan ? (
          <section className={th.section} aria-labelledby="ms-plan">
            <h2 id="ms-plan" className="label">
              Your test plan
            </h2>
            <p className={th.small}>One test per line: what you&apos;ll do, and what you expect to see if it works. {paul} reads it before the code.</p>
            <label className={th.field}>
              <span className="visually-hidden">Test plan</span>
              <textarea value={plan} onChange={(e) => setPlan(e.target.value)} placeholder={"Load the sample file: 214 rows, no errors.\nAsk for a city that isn't there: a clear message, not a crash."} />
            </label>
          </section>
        ) : null}
        {step.evidence !== "none" ? (
          <section className={th.section} aria-labelledby="ms-evidence">
            <h2 id="ms-evidence" className="label">
              Show {paul}
            </h2>
            {step.evidence === "link" ? (
              <label className={th.field}>
                <span>A link to the repository or the running project</span>
                <input type="text" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://github.com/..." autoComplete="off" spellCheck={false} />
              </label>
            ) : (
              <label className={th.field}>
                <span>The project as a zip (leave out .venv and large data)</span>
                <input ref={zipInput} type="file" accept=".zip,application/zip" />
              </label>
            )}
          </section>
        ) : null}
      </Instructions>
      <div className={areas.stage}>
        <div className={styles.stagePad}>
          <div className={th.guide}>
            <p className="label">{paul}&apos;s checklist</p>
            <ul className={th.checklist}>
              {step.checklist.map((c) => (
                <li key={c.id} className={th.check}>
                  <label>
                    <input type="checkbox" checked={Boolean(checks[c.id])} onChange={(e) => setChecks((x) => ({ ...x, [c.id]: e.target.checked }))} />
                    <span dangerouslySetInnerHTML={{ __html: c.textHtml }} />
                  </label>
                  <details>
                    <summary>Why {paul} asks</summary>
                    <span dangerouslySetInnerHTML={{ __html: c.whyHtml }} />
                  </details>
                </li>
              ))}
            </ul>
            <p className={th.small}>Tick only what is true of your project now. Nobody checks the ticks but you; the checklist is for finding what isn&apos;t done yet.</p>
            {done ? (
              <div className={th.review} role="status">
                <p>
                  <strong>Signed off</strong>
                  {saved.reviewedAt ? ` on ${new Date(saved.reviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}.
                </p>
              </div>
            ) : (
              <div className={styles.row}>
                <Button variant="primary" onClick={() => void ask()} disabled={busy}>
                  {busy ? "Sending" : `Ask ${paul} to review`}
                </Button>
              </div>
            )}
            {review && !done && (review.missing.length || review.notes.length) ? (
              <div className={th.review} role="status">
                <p>
                  <strong>{paul}:</strong> Not yet. {review.missing.length ? `${review.missing.length} on the list ${review.missing.length === 1 ? "isn't" : "aren't"} true yet.` : ""}
                </p>
                <ul>
                  {review.missing.map((m) => (
                    <li key={m.id}>
                      <span dangerouslySetInnerHTML={{ __html: m.textHtml }} /> <span className={th.small} dangerouslySetInnerHTML={{ __html: m.whyHtml }} />
                    </li>
                  ))}
                  {review.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {error ? (
              <p className={th.message} role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
