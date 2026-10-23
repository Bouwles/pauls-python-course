"use client";

// Take It Home (Section 10.5): set Python up, download the project, run its
// pytest suite on your own computer, and hand the results in, with the ppc
// tool or by uploading pytest's report.
import { useCallback, useEffect, useState } from "react";
import type { TakeHomeStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { download, zip } from "@/lib/export";
import { starterFiles, type TestReport } from "@/lib/takehome";
import { Button } from "../../ui/Button";
import { PassIcon } from "../../ui/Icons";
import { useWorkbench } from "../context";
import { JobSummary, NextRow, Prose, StepHeading } from "./common";
import styles from "./steps.module.css";
import th from "./TakeHome.module.css";

type Os = "mac" | "windows" | "linux";
const OS_LABEL: Record<Os, string> = { mac: "macOS", windows: "Windows", linux: "Linux" };

interface Line {
  say: string;
  run?: string;
}

function guide(os: Os, step: TakeHomeStep): Line[] {
  const folder = step.folder;
  const install: Line[] =
    os === "mac"
      ? [{ say: `Install Python ${step.python} or newer with the macOS installer from python.org. Then check it in Terminal:`, run: "python3 --version" }]
      : os === "windows"
        ? [{ say: `Install Python ${step.python} or newer from python.org. On the first screen, tick "Add python.exe to PATH". Then check it in PowerShell:`, run: "py --version" }]
        : [{ say: "Install Python and its venv module with your package manager (on Debian and Ubuntu, this):", run: "sudo apt install python3 python3-venv python3-pip" }];
  const py = os === "windows" ? "py" : "python3";
  const cd = os === "windows" ? `cd $HOME\\Downloads\\${folder}` : `cd ~/Downloads/${folder}`;
  const activate = os === "windows" ? ".venv\\Scripts\\Activate.ps1" : "source .venv/bin/activate";
  return [
    ...install,
    { say: "Unzip the project, then go into its folder:", run: cd },
    { say: "Make a virtual environment, so this project's packages stay in this project:", run: `${py} -m venv .venv` },
    {
      say: os === "windows" ? 'Switch it on. (If PowerShell refuses, run "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned" once, then try again.)' : "Switch it on. Your prompt now starts with (.venv):",
      run: activate,
    },
    { say: "Install what the project needs:", run: "pip install -r requirements.txt" },
    { say: "Run the tests. Most fail until you've done the work; that's the point:", run: "pytest" },
  ];
}

function detectOs(): Os {
  if (typeof navigator === "undefined") return "mac";
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "windows";
  if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "mac";
}

function Command({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={th.command}>
      <code>{text}</code>
      <button
        type="button"
        className={th.copy}
        onClick={() => {
          void navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        aria-label={`Copy ${text}`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function TakeHomeStepView({ step, row }: { step: TakeHomeStep; row: StepProgressRow }) {
  const { areas, job, markPassed, guest, landing } = useWorkbench();
  const [os, setOs] = useState<Os>("mac");
  const [route, setRoute] = useState<"ppc" | "upload">("ppc");
  const [report, setReport] = useState<TestReport | null>((row.data.report as TestReport | undefined) ?? null);
  const [reportAt, setReportAt] = useState<number | null>((row.data.reportAt as number | undefined) ?? null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const done = row.status === "passed";
  const site = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => setOs(detectOs()), []);

  const take = useCallback(
    async (r: TestReport, passes: boolean, at: number) => {
      setReport(r);
      setReportAt(at);
      if (passes) await markPassed(step.id, { data: { ...row.data, report: r, reportAt: at } });
    },
    [markPassed, step.id, row.data],
  );

  const fetchLatest = useCallback(
    async (quiet = false) => {
      if (guest) return;
      setBusy(true);
      if (!quiet) setMessage(null);
      try {
        const res = await fetch(`/api/takehome?jobId=${encodeURIComponent(job.id)}&stepId=${encodeURIComponent(step.id)}`);
        const body = (await res.json()) as { report: TestReport | null; passes?: boolean; at?: number };
        if (body.report) await take(body.report, Boolean(body.passes), body.at ?? Date.now());
        else if (!quiet) setMessage("Nothing handed in yet. Run ppc check in the project folder, then look again.");
      } catch {
        if (!quiet) setMessage("Couldn't reach the workshop. Check your connection.");
      } finally {
        setBusy(false);
      }
    },
    [guest, job.id, step.id, take],
  );

  // Results sent by the ppc tool turn up when the learner comes back to this tab.
  useEffect(() => {
    if (done || guest) return;
    void fetchLatest(true);
    const onFocus = () => void fetchLatest(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [done, guest, fetchLatest]);

  const upload = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    data.set("jobId", job.id);
    data.set("stepId", step.id);
    const file = data.get("report");
    if (!(file instanceof File) || file.size === 0) {
      if (pasted.trim()) data.set("report", pasted);
      else {
        setMessage("Choose report.xml, or paste the last line pytest printed.");
        return;
      }
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/takehome", { method: "POST", body: data });
      const body = (await res.json()) as { report?: TestReport; passes?: boolean; error?: string };
      if (!res.ok || !body.report) setMessage(body.error ?? "That didn't go through. Try again.");
      else await take(body.report, Boolean(body.passes), Date.now());
    } catch {
      setMessage("Couldn't reach the workshop. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const failing = report?.cases.filter((c) => c.outcome === "failed" || c.outcome === "error") ?? [];

  return (
    <>
      <div className={areas.brief}>
        <JobSummary />
        <StepHeading step={step} />
        <Prose html={step.html} />
        <section className={th.section} aria-labelledby="th-get">
          <h3 id="th-get" className="label">
            1. Get the project
          </h3>
          <p className={th.small}>
            A folder with the brief, the starter files, requirements.txt and {step.testCount} pytest {step.testCount === 1 ? "test" : "tests"}.
          </p>
          <div className={styles.row}>
            <Button variant="primary" onClick={() => download(`${step.folder}.zip`, zip(starterFiles(job, step, site)), "application/zip")}>
              Download {step.folder}.zip
            </Button>
          </div>
        </section>
        <section className={th.section} aria-labelledby="th-run">
          <h3 id="th-run" className="label">
            2. Set up and run it
          </h3>
          <p className={th.small}>The steps for your computer are alongside. You only set Python up once; after that, each project is the last four lines.</p>
          {step.setupHtml ? <Prose html={step.setupHtml} /> : null}
        </section>
        <section className={th.section} aria-labelledby="th-hand">
          <h3 id="th-hand" className="label">
            3. Hand it in
          </h3>
          {landing || guest ? (
            <p className={th.small}>
              Handing in needs an account, so the result is kept. <a href="/signup?keep=1">Make one</a>; your progress comes with you.
            </p>
          ) : (
            <>
              <div className={th.tabs} role="tablist" aria-label="How to hand it in">
                <button role="tab" aria-selected={route === "ppc"} className={th.tab} onClick={() => setRoute("ppc")}>
                  With the ppc tool
                </button>
                <button role="tab" aria-selected={route === "upload"} className={th.tab} onClick={() => setRoute("upload")}>
                  Upload pytest&apos;s report
                </button>
              </div>
              {route === "ppc" ? (
                <div className={th.panel} role="tabpanel">
                  <p className={th.small}>Install it once (with the virtual environment switched on, or anywhere you keep tools):</p>
                  <Command text={`pip install ${site}/ppc.zip`} />
                  <p className={th.small}>Sign it in to your account. It shows a code to type at {site}/device:</p>
                  <Command text="ppc login" />
                  <p className={th.small}>Then, in the project folder, run the tests and send the results:</p>
                  <Command text="ppc check" />
                  <div className={styles.row}>
                    <Button variant="secondary" onClick={() => void fetchLatest()} disabled={busy}>
                      {busy ? "Looking" : "Look for results"}
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  className={th.panel}
                  role="tabpanel"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void upload(e.currentTarget);
                  }}
                >
                  <p className={th.small}>In the project folder, run:</p>
                  <Command text="pytest --junitxml=report.xml" />
                  <label className={th.field}>
                    <span>report.xml</span>
                    <input type="file" name="report" accept=".xml,.txt,text/xml" />
                  </label>
                  <label className={th.field}>
                    <span>Or paste the last line pytest printed</span>
                    <input type="text" value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="===== 12 passed in 0.84s =====" autoComplete="off" spellCheck={false} />
                  </label>
                  <label className={th.field}>
                    <span>The project as a zip (optional; leave out .venv)</span>
                    <input type="file" name="project" accept=".zip,application/zip" />
                  </label>
                  <div className={styles.row}>
                    <Button variant="primary" type="submit" disabled={busy}>
                      {busy ? "Sending" : "Hand it in"}
                    </Button>
                  </div>
                </form>
              )}
              {message ? (
                <p className={th.message} role="status">
                  {message}
                </p>
              ) : null}
            </>
          )}
          {report ? (
            <div className={[th.result, done ? th.resultGood : ""].join(" ")} role="status">
              <p className={th.resultTitle}>
                {done ? <PassIcon /> : null} {report.passed} of {report.total} {report.total === 1 ? "test" : "tests"} passed
                {reportAt ? ` on ${new Date(reportAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}.
              </p>
              {done ? (
                <p className={th.small}>
                  Handed in. {step.heavy ? "This one needs packages the browser can't run, so nothing here can re-run it; the report is taken as it is." : "The results come from your computer; checking them again here isn't switched on yet, so they're taken on trust."}
                </p>
              ) : (
                <p className={th.small}>
                  {report.failed + report.errors > 0
                    ? `${report.failed + report.errors} still failing. ${step.minPassed < step.testCount ? `It needs ${step.minPassed} passing and none failing.` : "It needs every test passing."}`
                    : `It needs ${step.minPassed} passing.`}
                </p>
              )}
              {failing.length ? (
                <ul className={th.failing}>
                  {failing.slice(0, 6).map((c) => (
                    <li key={c.name}>
                      <code>{c.name.split("::").pop()}</code>
                      {c.message ? <span>{c.message.split("\n")[0]}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
        <NextRow row={row} allowSkip />
      </div>
      <div className={areas.stage}>
        <div className={styles.stagePad}>
          <div className={th.guide}>
            <div className={th.tabs} role="tablist" aria-label="Your computer">
              {(Object.keys(OS_LABEL) as Os[]).map((o) => (
                <button key={o} role="tab" aria-selected={os === o} className={th.tab} onClick={() => setOs(o)}>
                  {OS_LABEL[o]}
                </button>
              ))}
            </div>
            <div role="tabpanel" aria-label={`Setting up on ${OS_LABEL[os]}`}>
              <ol className={th.steps}>
                {guide(os, step).map((l, i) => (
                  <li key={i}>
                    <p>{l.say}</p>
                    {l.run ? <Command text={l.run} /> : null}
                  </li>
                ))}
              </ol>
            </div>
            {step.requirements.length > 1 ? <p className={th.small}>requirements.txt: {step.requirements.join(", ")}.</p> : null}
            <p className={th.small}>A virtual environment is a folder (.venv) holding this project&apos;s own Python packages. Switch it on each time you open a new terminal for the project.</p>
          </div>
        </div>
      </div>
    </>
  );
}
