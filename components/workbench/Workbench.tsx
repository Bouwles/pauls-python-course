"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Character, Job, Line, Step } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import { blankStep, getJob, logEvent as saveEvent, setLocation, updateJob, updateStep as saveStep } from "@/lib/store/progress";
import type { JobProgressRow, StepProgressRow } from "@/lib/store/types";
import { addCardsForJob } from "@/lib/review/deck";
import { firstTime, pickLine, type Cue } from "@/lib/reactions";
import { track } from "@/lib/track";
import { WorkbenchContext, type GateAct, type WorkbenchContextValue } from "./context";
import { useRunner } from "./useRunner";
import { StepPath } from "./StepPath";
import { DialogueBox } from "./DialogueBox";
import { Hud } from "./Hud";
import { StepView } from "./StepView";
import { Button } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { SpriteFrame } from "../world/SpriteFrame";
import styles from "./Workbench.module.css";

interface Props {
  job: Job;
  characters: Record<string, Character>;
  conceptTitles: Record<string, string>;
  actTitle: string;
  landing?: boolean;
  /** A Pro project shown to someone without Pro: only its Ask is here, as a preview. */
  preview?: boolean;
  /** Set on the free Act's last project: the Acts to offer in the gate scene after it ships. */
  gateActs?: GateAct[];
}

const TICK_SECONDS = 5;
const FOLD_KEY = "fixwick-ticket-folded";
const CODE_STEPS = ["pips", "fix", "modify", "make"];

// The portrait expression for each kind of reaction (REDESIGN.md 6.2).
const FACE: Record<string, string> = {
  "check-passed": "pleased",
  "check-failed": "confused",
  "run-error": "squinting",
  "stopped-loop": "surprised",
  "third-hint": "worried",
  "solution-seen": "neutral",
  idle: "neutral",
  returning: "pleased",
  recap: "neutral",
  "error-name": "squinting",
  "error-text-number": "squinting",
  "error-zero": "surprised",
  "error-index": "squinting",
  "error-int-text": "squinting",
  "error-indent": "laughing",
  "ran-nothing": "confused",
  "loop-never-runs": "confused",
  "first-fstring": "pleased",
  "converts-input": "pleased",
  "first-function": "proud",
  "nested-loop": "surprised",
  "good-name": "pleased",
  "letter-name": "annoyed",
  "long-function": "annoyed",
  "long-line": "squinting",
  "long-no-loop": "laughing",
  "pass-first-try": "proud",
  "pass-after-many": "proud",
  "pass-no-hints": "pleased",
  "third-fail": "worried",
  "one-left": "pleased",
  "shorter-than-pip": "annoyed",
};

// Away this long and Moss (and the client) say where you'd got to (REDESIGN.md 6.5).
const RECAP_AFTER_MS = 4 * 60 * 60 * 1000;
const LAST_SEEN = "last-seen";
const IDLE_AFTER_MS = 60_000;
const NUDGE_AFTER_MS = 4 * 60_000;

export function isComplete(row: StepProgressRow | undefined) {
  return row?.status === "passed" || row?.status === "seen-solution";
}

export function Workbench({ job, characters, conceptTitles, actTitle, landing = false, preview = false, gateActs }: Props) {
  const { store, ready, user, profile, syncStatus } = useSession();
  const runner = useRunner();
  const router = useRouter();
  const params = useSearchParams();
  const [progress, setProgress] = useState<Record<string, StepProgressRow>>({});
  const [jobProgress, setJobProgress] = useState<JobProgressRow | null>(null);
  const [stepId, setStepId] = useState<string | null>(null);
  const [talk, setTalk] = useState<(Line & { id: number })[]>([]);
  const reaction = talk[0] ?? null;
  const setReaction = useCallback((line: (Line & { id: number }) | null) => setTalk(line ? [line] : []), []);
  const saidThisStep = useRef<Set<string>>(new Set());
  const [zone, setZone] = useState<"brief" | "code" | "output">("brief");
  const [markedLine, setMarkedLine] = useState<number | null>(null);
  const [ticketFolded, setFolded] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [dennisOpen, setDennisOpen] = useState(false);
  const [hintSlot, setHintSlot] = useState<HTMLElement | null>(null);
  const [drawerSlot, setDrawerSlot] = useState<HTMLElement | null>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  const lastActivity = useRef(Date.now());
  const pendingSeconds = useRef(0);
  const nudged = useRef<Set<string>>(new Set());
  const lessTalk = profile.settings.dialogue === "less";

  // Load saved progress and pick the step to show.
  useEffect(() => {
    if (!store || !ready) return;
    let cancelled = false;
    (async () => {
      const rows = await store.prefixed("step_progress", `${job.id}/`);
      const map: Record<string, StepProgressRow> = {};
      for (const r of rows) map[r.stepId] = r;
      const jp = await getJob(store, job.id);
      if (cancelled) return;
      setProgress(map);
      setJobProgress(jp);
      const fromUrl = params.get("step");
      const last = profile.lastLocation?.jobId === job.id ? profile.lastLocation.stepId : null;
      const firstOpen = job.steps.find((s) => !isComplete(map[s.id]))?.id ?? job.steps[job.steps.length - 1]!.id;
      const pick = [fromUrl, last, firstOpen].find((id) => id && job.steps.some((s) => s.id === id)) ?? job.steps[0]!.id;
      setStepId(pick);
    })();
    return () => {
      cancelled = true;
    };
    // Progress is loaded once per job; later changes are applied locally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, ready, job.id]);

  const index = job.steps.findIndex((s) => s.id === stepId);
  const step: Step | null = index >= 0 ? job.steps[index]! : null;
  const nextStep = index >= 0 && index < job.steps.length - 1 ? job.steps[index + 1]! : null;

  // Remember where the learner is, and keep the URL shareable.
  useEffect(() => {
    if (!store || !step) return;
    void setLocation(store, { jobId: job.id, stepId: step.id });
    if (!landing) {
      const url = `/job/${job.id}?step=${step.id}`;
      if (window.location.pathname + window.location.search !== url) router.replace(url, { scroll: false });
    }
    setMarkedLine(null);
    setReaction(null);
    saidThisStep.current = new Set();
    setHintsOpen(false);
    setDennisOpen(false);
    lastActivity.current = Date.now();
  }, [store, step, job.id, landing, router]);

  // The ticket stays folded or open across jobs.
  useEffect(() => {
    try {
      setFolded(localStorage.getItem(FOLD_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);
  const setTicketFolded = useCallback((folded: boolean) => {
    setFolded(folded);
    try {
      localStorage.setItem(FOLD_KEY, folded ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  // Dennis can be called from anywhere (a hotspot in a scene, the Keys sheet). Escape sends him off.
  useEffect(() => {
    const open = () => setDennisOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDennisOpen(false);
    };
    window.addEventListener("ppc:dennis", open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ppc:dennis", open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const updateStep = useCallback<WorkbenchContextValue["updateStep"]>(
    async (id, patch) => {
      if (!store) return null;
      const row = await saveStep(store, job.id, id, patch);
      setProgress((p) => ({ ...p, [id]: row }));
      if (!jobProgress || jobProgress.status === "not-started") setJobProgress(await updateJob(store, job.id, {}));
      return row;
    },
    [store, job.id, jobProgress],
  );

  const markPassed = useCallback<WorkbenchContextValue["markPassed"]>(
    async (id, patch = {}) => {
      await updateStep(id, (r) => ({ ...patch, status: r.status === "seen-solution" ? "seen-solution" : "passed" }));
    },
    [updateStep],
  );

  const logEvent = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => {
      if (store) void saveEvent(store, type, { jobId: job.id, stepId, ...payload });
    },
    [store, job.id, stepId],
  );

  const react = useCallback(
    async (who: string, event: string) => {
      if (lessTalk) return;
      const text = await pickLine(store, characters, who, event);
      if (text) setReaction({ who, text, face: FACE[event], id: Date.now() });
    },
    [store, characters, lessTalk],
  );

  const sayLine = useCallback((who: string, text: string, face?: string) => setReaction({ who, text, face, id: Date.now() }), [setReaction]);

  // Reactions to the learner's code: the first cue that has something fresh to say wins.
  const cue = useCallback<WorkbenchContextValue["cue"]>(
    async (cues, opts = {}) => {
      if (lessTalk) return;
      for (const c of cues) {
        const key = `${c.who}:${c.event}`;
        if (c.perStep && saidThisStep.current.has(key)) continue;
        if (c.once && !(await firstTime(store, key))) continue;
        const text = await pickLine(store, characters, c.who, c.event, c.vars);
        if (!text) continue;
        saidThisStep.current.add(key);
        const line = { who: c.who, text, face: FACE[c.event], id: Date.now() };
        setTalk((t) => (opts.after && t.length ? [...t.slice(0, 1), line] : [line]));
        return;
      }
    },
    [store, characters, lessTalk],
  );

  // Back after a break: one line from Moss, one from the client about where you'd got to. Never guilt.
  const recapped = useRef(false);
  useEffect(() => {
    if (!store || !stepId || recapped.current || landing) return;
    recapped.current = true;
    void (async () => {
      const last = (await store.kvGet<number>(LAST_SEEN)) ?? 0;
      await store.kvSet(LAST_SEEN, Date.now());
      const started = Object.values(progress).some((r) => r.status !== "not-started" || r.timeSpent > 0);
      if (lessTalk || !last || Date.now() - last < RECAP_AFTER_MS || !started) return;
      const here = job.steps.find((s) => s.id === stepId);
      const lines: (Line & { id: number })[] = [];
      const moss = await pickLine(store, characters, "moss", "returning");
      if (moss) lines.push({ who: "moss", text: moss, face: "pleased", id: Date.now() });
      const who = job.client !== "moss" && characters[job.client]?.pools.recap ? job.client : "moss";
      const where = await pickLine(store, characters, who, "recap", { step: here?.title ?? "it", job: job.title });
      if (where) lines.push({ who, text: where, face: "neutral", id: Date.now() + 1 });
      if (lines.length) setTalk(lines);
    })();
    const beat = setInterval(() => void store.kvSet(LAST_SEEN, Date.now()), 60_000);
    return () => clearInterval(beat);
    // Once per visit, after progress has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, stepId]);

  // Opening the drawer puts the cursor in Dennis's first question.
  useEffect(() => {
    if (!dennisOpen) return;
    const t = setTimeout(() => (drawerSlot?.querySelector<HTMLElement>("textarea, select") ?? drawerClose.current)?.focus(), 130);
    return () => clearTimeout(t);
  }, [dennisOpen, drawerSlot]);

  const goTo = useCallback((id: string) => {
    setStepId(id);
    setZone("brief");
    document.getElementById("main")?.scrollTo?.({ top: 0 });
  }, []);

  const goNext = useCallback(() => {
    if (nextStep) goTo(nextStep.id);
  }, [nextStep, goTo]);

  const shipJob = useCallback(async () => {
    if (!store) return;
    const current = await getJob(store, job.id);
    if (current.status === "shipped" || current.status === "shipped-stretch") {
      setJobProgress(current);
      return;
    }
    const shipStep = job.steps.find((s) => s.type === "ship");
    const next = await updateJob(store, job.id, { status: "shipped", shippedAt: Date.now() });
    setJobProgress(next);
    if (shipStep?.type === "ship") await addCardsForJob(store, shipStep.cards);
    // A placement pass marks the Act's Jobs as placed, and its ideas still come up in review.
    if (shipStep?.type === "ship" && shipStep.places) {
      for (const id of shipStep.places.jobs) {
        const row = await getJob(store, id);
        if (row.status === "not-started" || row.status === "in-progress") await updateJob(store, id, { status: "placed" });
      }
      await addCardsForJob(store, shipStep.places.concepts);
      logEvent("placement-passed", { act: shipStep.places.act });
    }
    const { setFlag } = await import("@/lib/store/progress");
    if (job.storyNote) await setFlag(store, "story_flags", job.storyNote);
    if (shipStep?.type === "ship") for (const award of shipStep.awards) await setFlag(store, "collectibles", award);
    window.dispatchEvent(new CustomEvent("ppc:flags-changed"));
    logEvent("job-shipped");
    // Funnel steps: the first and fifth project shipped, and the free Act's capstone.
    const shippedCount = (await store.all("job_progress")).filter((r) => r.status === "shipped" || r.status === "shipped-stretch").length;
    if (shippedCount >= 1) track("ship-1");
    if (shippedCount >= 5) track("ship-5");
    if (gateActs) track("ship-capstone");
  }, [store, job, logEvent, gateActs]);

  // Time on step: counted in 5-second ticks while the tab is visible and the learner is active.
  useEffect(() => {
    if (!store || !step) return;
    const onActivity = () => {
      lastActivity.current = Date.now();
    };
    window.addEventListener("keydown", onActivity);
    window.addEventListener("pointerdown", onActivity);
    const flushTime = () => {
      const secs = pendingSeconds.current;
      if (secs <= 0) return;
      pendingSeconds.current = 0;
      void updateStep(step.id, (r) => ({ timeSpent: r.timeSpent + secs }));
      void updateJob(store, job.id, {}).then((jp) => saveJobTime(jp, secs));
    };
    const saveJobTime = (jp: JobProgressRow, secs: number) => {
      void updateJob(store, job.id, { timeSpent: jp.timeSpent + secs }).then(setJobProgress);
    };
    const tick = setInterval(() => {
      if (document.hidden) return;
      const idle = Date.now() - lastActivity.current;
      if (idle < IDLE_AFTER_MS) pendingSeconds.current += TICK_SECONDS;
      if (pendingSeconds.current >= 15) flushTime();
      const checkable = ["pips", "fix", "modify", "make"].includes(step.type);
      if (checkable && idle > NUDGE_AFTER_MS && !nudged.current.has(step.id) && !isComplete(progress[step.id])) {
        nudged.current.add(step.id);
        void react("moss", "idle");
      }
    }, TICK_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      flushTime();
    };
    // progress is read for the idle nudge only; it doesn't need to restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, step?.id, job.id, updateStep, react]);

  // The funnel: a guest opening the first project.
  useEffect(() => {
    if (ready && !user && !preview) track("guest-start");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  // Warm Python up as soon as the Workbench opens.
  useEffect(() => {
    runner.preload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areas = useMemo(() => ({ brief: styles.brief!, stage: styles.stage!, output: styles.output!, side: styles.side! }), []);

  const value: WorkbenchContextValue = {
    job,
    characters,
    conceptTitles,
    store,
    runner,
    areas,
    progress,
    jobProgress,
    landing,
    preview,
    gateActs: gateActs ?? null,
    guest: !user,
    lessTalk,
    updateStep,
    markPassed,
    react,
    sayLine,
    cue,
    goTo,
    goNext,
    nextStep,
    showZone: setZone,
    markLine: setMarkedLine,
    markedLine,
    shipJob,
    logEvent,
    ticketFolded,
    setTicketFolded,
    hintsOpen,
    setHintsOpen,
    hintSlot,
    dennisOpen,
    setDennisOpen,
    drawerSlot,
  };

  const usesCode = step ? !["ask", "ship", "reading", "concept", "git", "takehome", "milestone"].includes(step.type) : false;
  const hasHints = Boolean(step && "hints" in step && step.hints);
  const hasDennis = Boolean(step && CODE_STEPS.includes(step.type));

  const tools = (
    <>
      {hasHints ? (
        <Button size="sm" variant={hintsOpen ? "primary" : "quiet"} pixelIcon="hint" aria-pressed={hintsOpen} onClick={() => setHintsOpen(!hintsOpen)} title="Moss's hints">
          Hint
        </Button>
      ) : null}
      {hasDennis ? (
        <button className={styles.duck} aria-pressed={dennisOpen} onClick={() => setDennisOpen(!dennisOpen)} title="Explain it to Dennis">
          <PixelIcon name="duck" />
          <span className="visually-hidden">Explain it to Dennis</span>
        </button>
      ) : null}
    </>
  );

  return (
    <WorkbenchContext.Provider value={value}>
      <div
        className={[styles.wb, landing ? styles.landing : ""].join(" ")}
        data-zone={zone}
        data-code={usesCode || undefined}
        data-ticket={ticketFolded ? "folded" : undefined}
      >
        {landing ? null : <Hud job={job} actTitle={actTitle} syncStatus={syncStatus} guest={!user} secondsSpent={jobProgress?.timeSpent ?? 0} />}
        <nav className={styles.path} aria-label="Steps in this job">
          <StepPath steps={job.steps} current={stepId} progress={progress} onSelect={goTo} tools={tools} />
        </nav>
        {step ? (
          <div className={styles.talk}>
            <DialogueBox step={step} reaction={reaction} onDismissReaction={() => setTalk((t) => t.slice(1))} hintsOpen={hintsOpen} onCloseHints={() => setHintsOpen(false)} hintSlotRef={setHintSlot} />
          </div>
        ) : null}
        <div className={styles.tabs} role="tablist" aria-label="Workbench">
          {(["brief", "code", "output"] as const).map((z) =>
            z !== "brief" && !usesCode ? null : (
              <button key={z} role="tab" aria-selected={zone === z} className={styles.tab} onClick={() => setZone(z)}>
                {z === "brief" ? "Ticket" : z === "code" ? "Code" : "Output"}
              </button>
            ),
          )}
        </div>
        <main id="main" className={styles.main}>
          {step && store ? <StepView key={step.id} step={step} row={progress[step.id] ?? blankStep(job.id, step.id)} /> : <p className={styles.loading}>Opening the workshop.</p>}
        </main>
        <aside className={`frame-panel float ${styles.drawer}`} data-open={dennisOpen || undefined} aria-labelledby="dennis-title" inert={!dennisOpen}>
          <header className={styles.drawerHead}>
            <SpriteFrame sprite="dennis" scale={3} />
            <h2 id="dennis-title" className={styles.drawerTitle}>
              Explain it to Dennis
            </h2>
            <button ref={drawerClose} className={styles.drawerClose} onClick={() => setDennisOpen(false)}>
              <PixelIcon name="cross" />
              <span className="visually-hidden">Close</span>
            </button>
          </header>
          <div ref={setDrawerSlot} className={styles.drawerBody} />
        </aside>
      </div>
    </WorkbenchContext.Provider>
  );
}
