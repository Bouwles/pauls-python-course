"use client";

// Take It Home: set Python up, download the project, run its
// pytest suite on your own computer, and hand the results in, with the ppc
// tool or by uploading pytest's report. Signed in on the local version, they go
// to the server (app/api/takehome). Without an account (always, on GitHub
// Pages) they're kept in this browser: paste what ppc test or pytest printed,
// or choose report.xml, and it's read here (lib/takehome.ts). It counts as done
// like any other step, and goes to the teacher in the class progress link
// (lib/classes/report.ts).
import { useCallback, useEffect, useRef, useState } from "react";
import type { TakeHomeStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { download, zip } from "@/lib/export";
import { parseReport, reportPasses, starterFiles, type TestReport } from "@/lib/takehome";
import { Button } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { Instructions, Prose } from "../Instructions";
import { useWorkbench } from "../context";
import { NextRow } from "./common";
import styles from "./steps.module.css";
import { BASE, STATIC } from "@/lib/static";
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
  const { areas, job, markPassed, updateStep, guest, landing } = useWorkbench();
  const [os, setOs] = useState<Os>("mac");
  const [route, setRoute] = useState<"ppc" | "upload">("ppc");
  const [report, setReport] = useState<TestReport | null>((row.data.report as TestReport | undefined) ?? null);
  const [reportAt, setReportAt] = useState<number | null>((row.data.reportAt as number | undefined) ?? null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const done = row.status === "passed";
  // The course's address, with its base path on GitHub Pages.
  const site = typeof window !== "undefined" ? `${window.location.origin}${BASE}` : "";
  // No account to hand in to (always, on GitHub Pages): results are kept in this browser.
  const here = STATIC || guest;
  const reportFile = useRef<HTMLInputElement>(null);

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
      if (guest || STATIC) return;
      setBusy(true);
      if (!quiet) setMessage(null);
      try {
        const res = await fetch(`/api/takehome?jobId=${encodeURIComponent(job.id)}&stepId=${encodeURIComponent(step.id)}`);
        const body = (await res.json()) as { report: TestReport | null; passes?: boolean; at?: number };
        if (body.report) await take(body.report, Boolean(body.passes), body.at ?? Date.now());
        else if (!quiet) setMessage("Nothing handed in yet. Run ppc check in the project folder, then look again.");
      } catch {
        if (!quiet) setMessage("Couldn't reach the server. Check your connection.");
      } finally {
        setBusy(false);
      }
    },
    [guest, job.id, step.id, take],
  );

  // Results sent by the ppc tool turn up when the learner comes back to this tab.
  useEffect(() => {
    if (done || guest || STATIC) return;
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
      setMessage("Couldn't reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  /** Read what was pasted or chosen, here in the browser, and keep it with the step. */
  const handInHere = async () => {
    setMessage(null);
    let text = pasted;
    const file = reportFile.current?.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage("That file is over 2 MB, which is far bigger than a pytest report. Choose report.xml, or paste the results instead.");
        return;
      }
      text = await file.text();
    }
    if (!text.trim()) {
      setMessage(route === "ppc" ? "Paste the line ppc test printed first." : "Paste what pytest printed first, or choose report.xml.");
      return;
    }
    const r = parseReport(text);
    if (!r) {
      setMessage("That doesn't look like test results. Paste the line starting ppc-result, or the last line pytest prints (it ends like 12 passed in 0.84s).");
      return;
    }
    if (r.for && (r.for.job !== job.id || r.for.step !== step.id)) {
      setMessage(`Those results are for another project (${r.for.job}). Run ppc test in this project's folder, ${step.folder}.`);
      return;
    }
    const passes = reportPasses(r, step);
    // Handed in already: a later run with failures doesn't undo it.
    if (done && !passes) {
      setMessage(`That run has ${r.passed} of ${r.total} passing, which isn't enough to finish it. The results you handed in before still count.`);
      return;
    }
    const at = Date.now();
    setReport(r);
    setReportAt(at);
    setPasted("");
    if (reportFile.current) reportFile.current.value = "";
    if (passes) await markPassed(step.id, { data: { ...row.data, report: r, reportAt: at, keptHere: true } });
    else await updateStep(step.id, (current) => ({ data: { ...current.data, report: r, reportAt: at, keptHere: true } }));
  };

  const failing = report?.cases.filter((c) => c.outcome === "failed" || c.outcome === "error") ?? [];

  return (
    <>
      <Instructions step={step} footer={<NextRow row={row} allowSkip />}>
        <section className={th.section} aria-labelledby="th-get">
          <h2 id="th-get" className="label">
            Get the project
          </h2>
          <p className={th.small}>
            A folder with the brief, the starter files, requirements.txt and {step.testCount} pytest {step.testCount === 1 ? "test" : "tests"}.
          </p>
          <div className={styles.row}>
            <Button variant="primary" icon="download" onClick={() => download(`${step.folder}.zip`, zip(starterFiles(job, step, site, { paste: here })), "application/zip")}>
              Download {step.folder}.zip
            </Button>
          </div>
        </section>
        <section className={th.section} aria-labelledby="th-run">
          <h2 id="th-run" className="label">
            Set it up and run it
          </h2>
          <p className={th.small}>The steps for your computer are alongside. You only set Python up once; after that, each project is the last four lines.</p>
          {step.setupHtml ? <Prose html={step.setupHtml} /> : null}
        </section>
        <section className={th.section} aria-labelledby="th-hand">
          <h2 id="th-hand" className="label">
            Hand it in
          </h2>
          {landing ? (
            <p className={th.small}>Open the project on its own page to hand it in.</p>
          ) : here ? (
            <>
              <div className={th.tabs} role="tablist" aria-label="How to hand it in">
                <button role="tab" aria-selected={route === "ppc"} className={th.tab} onClick={() => setRoute("ppc")}>
                  With the ppc tool
                </button>
                <button role="tab" aria-selected={route === "upload"} className={th.tab} onClick={() => setRoute("upload")}>
                  With pytest
                </button>
              </div>
              <form
                className={th.panel}
                role="tabpanel"
                aria-label={route === "ppc" ? "With the ppc tool" : "With pytest"}
                onSubmit={(e) => {
                  e.preventDefault();
                  void handInHere();
                }}
              >
                {route === "ppc" ? (
                  <>
                    <p className={th.small}>Install it once (with the virtual environment switched on, or anywhere you keep tools):</p>
                    <Command text={`pip install ${site}/ppc.zip`} />
                    <p className={th.small}>Then, in the project folder, run the tests. It needs no account: it prints a line starting ppc-result to paste here.</p>
                    <Command text="ppc test" />
                  </>
                ) : (
                  <>
                    <p className={th.small}>In the project folder, run the tests:</p>
                    <Command text="pytest" />
                    <p className={th.small}>Then paste what it printed (the last line is enough). For each test by name, run pytest --junitxml=report.xml and choose report.xml instead.</p>
                    <label className={th.field}>
                      <span>report.xml (optional)</span>
                      <input ref={reportFile} type="file" accept=".xml,.txt,text/xml" />
                    </label>
                  </>
                )}
                <label className={th.field}>
                  <span>{route === "ppc" ? "Paste what ppc test printed" : "Paste what pytest printed"}</span>
                  <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={route === "ppc" ? "ppc-result 1 ..." : "===== 12 passed in 0.84s ====="} autoComplete="off" spellCheck={false} />
                </label>
                <div className={styles.row}>
                  <Button variant="primary" type="submit">
                    Hand it in
                  </Button>
                </div>
                <p className={th.small}>It&apos;s kept in this browser and counts as done here. If you&apos;re in a class, it goes to your teacher with your progress link.</p>
              </form>
              {message ? (
                <p className={th.message} role="status">
                  {message}
                </p>
              ) : null}
            </>
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
                {done ? <Icon name="tick" /> : null} {report.passed} of {report.total} {report.total === 1 ? "test" : "tests"} passed
                {reportAt ? ` on ${new Date(reportAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}.
              </p>
              {done ? (
                <p className={th.small}>
                  {row.data.keptHere ? "Handed in, and kept in this browser. " : "Handed in. "}
                  {step.heavy ? "This one needs packages the browser can't run, so nothing here can re-run it; the report is taken as it is." : "The results come from your computer; checking them again here isn't switched on yet, so they're taken on trust."}
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
      </Instructions>
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
