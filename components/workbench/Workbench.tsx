"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Character, Job, Line, Step } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import { blankStep, getJob, logEvent as saveEvent, setLocation, updateJob, updateStep as saveStep } from "@/lib/store/progress";
import type { JobProgressRow, StepProgressRow } from "@/lib/store/types";
import { addCardsForJob } from "@/lib/review/deck";
import { ERROR_TAGS, HINT_TAGS, PASS_TAGS, firstTime, pickLine, reactionLook } from "@/lib/reactions";
import type { GestureTag } from "@/lib/pixel/gestures";
import { speakerFor } from "@/lib/cast";
import { track } from "@/lib/track";
import { WorkbenchContext, type CoachKind, type Utterance, type WorkbenchContextValue, type Zone } from "./context";
import { classmateOf, isSpoken, nextId, usesEditor, utterancesFor } from "./labels";
import { useRunner } from "./useRunner";
import { StepBar } from "./StepPath";
import { Hud } from "./Hud";
import { StepView } from "./StepView";
import styles from "./Workbench.module.css";

interface Props {
  job: Job;
  characters: Record<string, Character>;
  conceptTitles: Record<string, string>;
  actTitle: string;
  /** How many numbered projects the Act has, for "Project 2 of 13". */
  actProjects?: number;
  /** The next project in the Act, offered when this one ships. */
  nextJob?: { id: string; title: string } | null;
  landing?: boolean;
}

const TICK_SECONDS = 5;
const COMPACT_AT = 860;
const PANEL_KEY = "ppc-panel-width";
const PANEL_FOLD_KEY = "ppc-panel-collapsed";
export const PANEL_MIN = 340;
export const PANEL_MAX = 520;
const PANEL_DEFAULT = 400;

// "Less talk" (Settings) keeps the coach for hints and errors only.
const HINT_EVENTS = new Set(["third-hint", "solution-seen", "after-explain"]);
function kindOf(event: string): CoachKind {
  if (HINT_EVENTS.has(event)) return "hint";
  if (event === "run-error" || event.startsWith("error-") || event === "check-failed" || event === "third-fail") return "error";
  if (event === "check-passed" || event.startsWith("pass-") || event === "fixed-by-learner") return "pass";
  return "react";
}

/** What a line from `say` is for, when it names no gesture: a pass approves or celebrates, an error worries or explains, a hint explains. */
const KIND_TAGS: Partial<Record<CoachKind, GestureTag[]>> = { pass: PASS_TAGS, error: ERROR_TAGS, hint: HINT_TAGS };

// Away this long and Paul (and the client) say where you'd got to. Never guilt.
const RECAP_AFTER_MS = 4 * 60 * 60 * 1000;
const LAST_SEEN = "last-seen";
const IDLE_AFTER_MS = 60_000;
const NUDGE_AFTER_MS = 4 * 60_000;

export function isComplete(row: StepProgressRow | undefined) {
  return row?.status === "passed" || row?.status === "seen-solution";
}

export function Workbench({ job, characters, conceptTitles, actTitle, actProjects, nextJob = null, landing = false }: Props) {
  const { store, ready, user, profile, syncStatus } = useSession();
  const runner = useRunner();
  const router = useRouter();
  const params = useSearchParams();
  const root = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<Record<string, StepProgressRow>>({});
  const [jobProgress, setJobProgress] = useState<JobProgressRow | null>(null);
  const [stepId, setStepId] = useState<string | null>(null);
  const [coach, setCoach] = useState<{ said: Utterance[]; index: number }>({ said: [], index: 0 });
  const saidThisStep = useRef<Set<string>>(new Set());
  const [zone, setZone] = useState<Zone>("brief");
  const [markedLine, setMarkedLine] = useState<number | null>(null);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [duckOpen, setDuckOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const [panelCollapsed, setCollapsed] = useState(false);
  const [compact, setCompact] = useState(false);
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
  const classmate = classmateOf(step);
  const nameOf = useCallback((who: string) => characters[who]?.name ?? (who ? who.charAt(0).toUpperCase() + who.slice(1) : ""), [characters]);

  // Narrow Workbench (a phone, or the landing page's frame): the three-tab layout.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCompact(el.clientWidth <= COMPACT_AT));
    ro.observe(el);
    setCompact(el.clientWidth <= COMPACT_AT);
    return () => ro.disconnect();
  }, []);

  // The instructions panel keeps its width and fold across projects.
  useEffect(() => {
    try {
      const w = Number(localStorage.getItem(PANEL_KEY));
      if (w >= PANEL_MIN && w <= PANEL_MAX) setPanelWidth(w);
      setCollapsed(localStorage.getItem(PANEL_FOLD_KEY) === "1");
    } catch {
      // Private windows can refuse storage; the defaults are fine.
    }
  }, []);
  const setPanelCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(PANEL_FOLD_KEY, value ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);
  const savePanelWidth = useCallback((w: number) => {
    const clamped = Math.round(Math.max(PANEL_MIN, Math.min(PANEL_MAX, w)));
    setPanelWidth(clamped);
    try {
      localStorage.setItem(PANEL_KEY, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  // Remember where the learner is, keep the URL shareable, and start the step's coach lines.
  useEffect(() => {
    if (!store || !step) return;
    void setLocation(store, { jobId: job.id, stepId: step.id });
    if (!landing) {
      const url = `/job/${job.id}?step=${step.id}`;
      if (window.location.pathname + window.location.search !== url) router.replace(url, { scroll: false });
    }
    setMarkedLine(null);
    // Each step starts with a clean console: the learner's program still running from the last one stops.
    if (runner.state.phase !== "idle") runner.stop();
    runner.clear();
    saidThisStep.current = new Set();
    // The Ask and the Ship panels show their own lines; everywhere else the coach opens with the step's.
    const own = step.type === "ask" || step.type === "ship" || lessTalk ? [] : utterancesFor(step.dialogue);
    setCoach({ said: own, index: 0 });
    setHintsOpen(false);
    setDuckOpen(false);
    lastActivity.current = Date.now();
    // Keyed on the step's id, not the object: a fresh server render after router.replace hands
    // over an equal job, and that mustn't wipe the coach, the checks and the hints mid-step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, step?.id, job.id, landing]);

  // Escape puts the duck away; other parts of the app can call it up.
  useEffect(() => {
    const open = () => setDuckOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !(e.target as HTMLElement | null)?.closest?.("[role='menu'], dialog")) setDuckOpen(false);
    };
    window.addEventListener("ppc:duck", open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ppc:duck", open);
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

  // The coach: new lines go on the end of this step's list, and the first of them is the one showing.
  const push = useCallback((...u: Utterance[]) => setCoach((c) => ({ said: [...c.said, ...u], index: c.said.length })), []);
  const allowed = useCallback((kind: CoachKind) => !lessTalk || kind === "hint" || kind === "error", [lessTalk]);

  const say = useCallback<WorkbenchContextValue["say"]>(
    (who, text, opts = {}) => {
      const kind = opts.kind ?? "react";
      if (!allowed(kind) || !isSpoken(who)) return;
      const lines = (Array.isArray(text) ? text : [text]).slice(0, 2).map((t) => (typeof t === "string" ? { text: t } : t));
      // The first line is the reaction (a pass, a hint); any after it go by their own words.
      push(...lines.map((l, i) => ({ id: nextId(), who, text: l.text, face: l.face ?? opts.face, gesture: l.gesture ?? opts.gesture, tags: opts.tags ?? (i === 0 ? KIND_TAGS[kind] : undefined), kind })));
    },
    [allowed, push],
  );

  const react = useCallback<WorkbenchContextValue["react"]>(
    async (event, opts = {}) => {
      const kind = opts.kind ?? kindOf(event);
      if (!allowed(kind)) return;
      const who = speakerFor(event, { classmate, client: job.client });
      const text = await pickLine(store, characters, who, event, opts.vars);
      if (text) push({ id: nextId(), who, text, ...reactionLook(event), kind });
    },
    [allowed, classmate, job.client, store, characters, push],
  );

  // Reactions to the learner's code: the first cue that has something fresh to say wins.
  const cue = useCallback<WorkbenchContextValue["cue"]>(
    async (cues, forceKind) => {
      for (const c of cues) {
        const kind = forceKind ?? kindOf(c.event);
        if (!allowed(kind)) continue;
        // A cue made without this step's classmate or client gets them filled in here.
        const who = c.who === speakerFor(c.event) ? speakerFor(c.event, { classmate, client: job.client }) : c.who;
        const key = `${who}:${c.event}`;
        if (c.perStep && saidThisStep.current.has(key)) continue;
        if (c.once && !(await firstTime(store, key))) continue;
        const text = await pickLine(store, characters, who, c.event, c.vars);
        if (!text) continue;
        saidThisStep.current.add(key);
        push({ id: nextId(), who, text, ...reactionLook(c.event), kind });
        return;
      }
    },
    [allowed, classmate, job.client, store, characters, push],
  );

  const coachTo = useCallback((i: number) => setCoach((c) => ({ ...c, index: Math.max(0, Math.min(c.said.length - 1, i)) })), []);

  // Back after a break: one line from Paul, one from the client about where you'd got to.
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
      const back = await pickLine(store, characters, speakerFor("returning"), "returning");
      if (back) push({ id: nextId(), who: speakerFor("returning"), text: back, ...reactionLook("returning"), kind: "react" });
      const who = speakerFor("recap", { client: job.client });
      const where = await pickLine(store, characters, who, "recap", { step: here?.title ?? "it", job: job.title });
      if (where) push({ id: nextId(), who, text: where, ...reactionLook("recap"), kind: "react" });
    })();
    const beat = setInterval(() => void store.kvSet(LAST_SEEN, Date.now()), 60_000);
    return () => clearInterval(beat);
    // Once per visit, after progress has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, stepId]);

  const goTo = useCallback((id: string) => {
    setStepId(id);
    setZone("brief");
    document.getElementById("wb-body")?.scrollTo?.({ top: 0 });
  }, []);

  const goNext = useCallback(() => {
    if (nextStep) goTo(nextStep.id);
  }, [nextStep, goTo]);

  const shipJob = useCallback(async (): Promise<boolean> => {
    if (!store) return false;
    const current = await getJob(store, job.id);
    if (current.status === "shipped" || current.status === "shipped-stretch") {
      setJobProgress(current);
      return false;
    }
    const shipStep = job.steps.find((s) => s.type === "ship");
    const next = await updateJob(store, job.id, { status: "shipped", shippedAt: Date.now() });
    setJobProgress(next);
    if (shipStep?.type === "ship") await addCardsForJob(store, shipStep.cards);
    // A placement pass marks the Act's projects as placed, and its ideas still come up in review.
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
    // Funnel steps: the first and fifth project shipped.
    const shippedCount = (await store.all("job_progress")).filter((r) => r.status === "shipped" || r.status === "shipped-stretch").length;
    if (shippedCount >= 1) track("ship-1");
    if (shippedCount >= 5) track("ship-5");
    return true;
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
        void react("idle");
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
    if (ready && !user) track("guest-start");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  // Warm Python up as soon as the Workbench opens. On the landing page it waits a few seconds,
  // or until someone touches the project, so the page itself loads first.
  useEffect(() => {
    if (!landing) {
      runner.preload();
      return;
    }
    const start = () => runner.preload();
    const timer = setTimeout(start, 4000);
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areas = useMemo(() => ({ panel: styles.panel!, stage: styles.stage!, full: styles.full! }), []);
  const usesCode = usesEditor(step);

  const value: WorkbenchContextValue = {
    job,
    characters,
    conceptTitles,
    actTitle,
    store,
    runner,
    areas,
    progress,
    jobProgress,
    landing,
    nextJob,
    guest: !user,
    lessTalk,
    compact,
    step,
    classmate,
    nameOf,
    updateStep,
    markPassed,
    react,
    say,
    cue,
    coach,
    coachTo,
    goTo,
    goNext,
    nextStep,
    zone,
    showZone: setZone,
    markLine: setMarkedLine,
    markedLine,
    shipJob,
    logEvent,
    hintsOpen,
    setHintsOpen,
    duckOpen,
    setDuckOpen,
    panelCollapsed,
    setPanelCollapsed,
  };

  const Body = landing ? "div" : "main";
  const zones: { id: Zone; label: string }[] = [
    { id: "brief", label: "Instructions" },
    { id: "code", label: "Code" },
    { id: "output", label: "Output" },
  ];

  return (
    <WorkbenchContext.Provider value={value}>
      <div ref={root} className={[styles.wb, landing ? styles.landing : ""].join(" ")} style={{ ["--panel-w" as string]: `${panelCollapsed ? 56 : panelWidth}px` }}>
        <div className={styles.frame} data-zone={zone} data-code={usesCode || undefined} data-collapsed={panelCollapsed || undefined}>
          {landing ? null : <Hud job={job} actTitle={actTitle} actProjects={actProjects} syncStatus={syncStatus} guest={!user} secondsSpent={jobProgress?.timeSpent ?? 0} />}
          <StepBar steps={job.steps} current={stepId} progress={progress} onSelect={goTo} />
          <Body id={landing ? undefined : "main"} className={styles.body}>
            {usesCode ? (
              <div className={styles.zoneTabs} role="tablist" aria-label="Workbench">
                {zones.map((z, i) => (
                  <button
                    key={z.id}
                    role="tab"
                    aria-selected={zone === z.id}
                    tabIndex={zone === z.id ? 0 : -1}
                    className={styles.zoneTab}
                    onClick={() => setZone(z.id)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                      const next = zones[(i + (e.key === "ArrowRight" ? 1 : zones.length - 1)) % zones.length]!;
                      setZone(next.id);
                      (e.currentTarget.parentElement?.children[zones.indexOf(next)] as HTMLElement | undefined)?.focus();
                    }}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div id="wb-body" className={styles.bodyGrid}>
              {step && store ? <StepView key={step.id} step={step} row={progress[step.id] ?? blankStep(job.id, step.id)} /> : <p className={styles.loading}>Opening your project.</p>}
              {step && store && !panelCollapsed ? <PanelHandle width={panelWidth} onResize={setPanelWidth} onDone={savePanelWidth} /> : null}
            </div>
          </Body>
        </div>
      </div>
    </WorkbenchContext.Provider>
  );
}

/** The drag handle on the instructions panel's right edge: 340 to 520 px, keyboard arrows too. */
function PanelHandle({ width, onResize, onDone }: { width: number; onResize: (w: number) => void; onDone: (w: number) => void }) {
  const latest = useRef(width);
  latest.current = width;
  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const x0 = e.clientX;
    const w0 = width;
    target.setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    const move = (ev: PointerEvent) => onResize(Math.max(PANEL_MIN, Math.min(PANEL_MAX, w0 + ev.clientX - x0)));
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      document.body.style.cursor = "";
      onDone(latest.current);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };
  return (
    <div
      className={styles.handle}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the instructions"
      aria-valuemin={PANEL_MIN}
      aria-valuemax={PANEL_MAX}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={start}
      onDoubleClick={() => onDone(PANEL_DEFAULT)}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 60 : 20;
        if (e.key === "ArrowLeft") onDone(width - step);
        else if (e.key === "ArrowRight") onDone(width + step);
        else if (e.key === "Home") onDone(PANEL_MIN);
        else if (e.key === "End") onDone(PANEL_MAX);
        else return;
        e.preventDefault();
      }}
    />
  );
}
