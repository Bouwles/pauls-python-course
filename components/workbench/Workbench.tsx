"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Character, Job, Line, Step } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import { blankStep, getJob, logEvent as saveEvent, setLocation, updateJob, updateStep as saveStep } from "@/lib/store/progress";
import type { JobProgressRow, StepProgressRow } from "@/lib/store/types";
import { addCardsForJob } from "@/lib/review/deck";
import { pickLine } from "@/lib/reactions";
import { WorkbenchContext, type WorkbenchContextValue } from "./context";
import { useRunner } from "./useRunner";
import { StepNav } from "./StepNav";
import { SceneStrip } from "./SceneStrip";
import { TopBar } from "./TopBar";
import { StepView } from "./StepView";
import styles from "./Workbench.module.css";

interface Props {
  job: Job;
  characters: Record<string, Character>;
  conceptTitles: Record<string, string>;
  actTitle: string;
  landing?: boolean;
}

const TICK_SECONDS = 5;
const IDLE_AFTER_MS = 60_000;
const NUDGE_AFTER_MS = 4 * 60_000;

export function isComplete(row: StepProgressRow | undefined) {
  return row?.status === "passed" || row?.status === "seen-solution";
}

export function Workbench({ job, characters, conceptTitles, actTitle, landing = false }: Props) {
  const { store, ready, user, profile, syncStatus } = useSession();
  const runner = useRunner();
  const router = useRouter();
  const params = useSearchParams();
  const [progress, setProgress] = useState<Record<string, StepProgressRow>>({});
  const [jobProgress, setJobProgress] = useState<JobProgressRow | null>(null);
  const [stepId, setStepId] = useState<string | null>(null);
  const [reaction, setReaction] = useState<(Line & { id: number }) | null>(null);
  const [zone, setZone] = useState<"brief" | "code" | "output">("brief");
  const [markedLine, setMarkedLine] = useState<number | null>(null);
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
    lastActivity.current = Date.now();
  }, [store, step, job.id, landing, router]);

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
      if (text) setReaction({ who, text, id: Date.now() });
    },
    [store, characters, lessTalk],
  );

  const sayLine = useCallback((who: string, text: string) => setReaction({ who, text, id: Date.now() }), []);

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
  }, [store, job, logEvent]);

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
    guest: !user,
    lessTalk,
    updateStep,
    markPassed,
    react,
    sayLine,
    goTo,
    goNext,
    nextStep,
    showZone: setZone,
    markLine: setMarkedLine,
    markedLine,
    shipJob,
    logEvent,
  };

  const usesCode = step ? !["ask", "ship", "reading", "concept", "git", "takehome", "milestone"].includes(step.type) : false;

  return (
    <WorkbenchContext.Provider value={value}>
      <div className={[styles.wb, landing ? styles.landing : ""].join(" ")} data-zone={zone} data-code={usesCode || undefined}>
        {landing ? null : <TopBar job={job} actTitle={actTitle} syncStatus={syncStatus} guest={!user} secondsSpent={jobProgress?.timeSpent ?? 0} />}
        <nav className={styles.nav} aria-label="Steps in this job">
          <StepNav steps={job.steps} current={stepId} progress={progress} onSelect={goTo} job={job} jobProgress={jobProgress} />
        </nav>
        <div className={styles.scene}>
          {step ? <SceneStrip step={step} reaction={reaction} onDismissReaction={() => setReaction(null)} /> : null}
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Workbench zones">
          {(["brief", "code", "output"] as const).map((z) =>
            z !== "brief" && !usesCode ? null : (
              <button key={z} role="tab" aria-selected={zone === z} className={styles.tab} onClick={() => setZone(z)}>
                {z === "brief" ? "Brief" : z === "code" ? "Code" : "Output"}
              </button>
            ),
          )}
        </div>
        <main id="main" className={styles.main}>
          {step && store ? <StepView key={step.id} step={step} row={progress[step.id] ?? blankStep(job.id, step.id)} /> : <p className={styles.loading}>Opening the workshop.</p>}
        </main>
      </div>
    </WorkbenchContext.Provider>
  );
}
