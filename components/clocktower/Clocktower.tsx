"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActSummary, PlacementSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { useSession } from "@/lib/store/session";
import { dueCards } from "@/lib/review/deck";
import { isDone, isShipped, openActs } from "@/lib/progress-rules";
import { usePlan } from "@/lib/usePlan";
import { FREE_ACTS } from "@/lib/plans";
import { Tabs } from "../ui/Tabs";
import { Icon } from "../ui/Icon";
import { FloorFace, STUCK_CLOCK, TowerFrame, towerStyles } from "./Tower";
import { FLOORS_TOP_DOWN, floorLine, floorState, floorStats, mainJobs, type Floor, type FloorState, type FloorStats } from "./floors";
import { FloorSheet } from "./FloorSheet";
import { TowerList } from "./TowerList";
import { DeskCards } from "./DeskCards";
import styles from "./Clocktower.module.css";

const VIEW_KEY = "ppc-clocktower-view";
type View = "tower" | "list";

/** Everything the tower, the sheet and the list need to know about one floor. */
export interface FloorInfo {
  floor: Floor;
  act: ActSummary;
  stats: FloorStats;
  state: FloorState;
  /** Open by progress: the Act before it is done, or placed past. */
  open: boolean;
  /** Needs Pro, and the learner doesn't have it. */
  pro: boolean;
}

export function Clocktower({ acts, placements, names, steps }: { acts: ActSummary[]; placements: PlacementSummary[]; names: Record<string, string>; steps: Record<string, [string, string][]> }) {
  const { store, ready, synced, user, profile } = useSession();
  const router = useRouter();
  const { status: plan } = usePlan();
  const [progress, setProgress] = useState<Record<string, JobProgressRow>>({});
  const [due, setDue] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [view, setView] = useState<View>("tower");

  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_KEY) === "list") setView("list");
    } catch {
      // Storage can be refused; the tower is the default.
    }
  }, []);
  const pickView = (v: string) => {
    const next: View = v === "list" ? "list" : "tower";
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Only once the server's copy is here: on a new device an onboarded learner's profile arrives with the first pull.
    if (ready && user && synced && !profile.onboarded) router.replace("/welcome");
  }, [ready, user, synced, profile.onboarded, router]);

  useEffect(() => {
    if (!store) return;
    const load = async () => {
      const rows = await store.all("job_progress");
      setProgress(Object.fromEntries(rows.map((r) => [r.jobId, r])));
      setDue((await dueCards(store)).length);
    };
    void load();
    const un1 = store.subscribe("job_progress", () => void load());
    const un2 = store.subscribe("review_cards", () => void load());
    return () => {
      un1();
      un2();
    };
  }, [store]);

  const open = useMemo(() => openActs(acts, progress, placements), [acts, progress, placements]);
  // Pro floors keep their lock until the learner has Pro (REDESIGN.md 8.4); until the plan
  // has loaded nothing is marked, so a Pro learner never sees a flash of locks.
  const noPro = plan ? !plan.access.pro : false;

  const floors: FloorInfo[] = useMemo(
    () =>
      FLOORS_TOP_DOWN.flatMap((floor) => {
        const act = acts.find((a) => a.number === floor.act);
        if (!act) return [];
        const stats = floorStats(act, progress);
        const isOpen = open.has(act.id);
        const pro = noPro && !FREE_ACTS.has(act.id);
        return [{ floor, act, stats, open: isOpen, pro, state: floorState({ open: isOpen, proLocked: pro, stats }) }];
      }),
    [acts, progress, open, noPro],
  );

  const shipped = acts.flatMap((a) => a.jobs).filter((j) => isShipped(progress[j.id])).length;
  const floorsOpen = floors.filter((f) => f.state !== "locked").length;
  const roof = floors.find((f) => f.floor.act === 9);
  const clockRuns = Boolean(roof && roof.stats.written > 0 && mainJobs(roof.act).filter((j) => j.status === "written").every((j) => isDone(progress[j.id])));
  const clock = useClock(clockRuns);
  const current = selected === null ? null : (floors.find((f) => f.floor.act === selected) ?? null);

  return (
    <div className={styles.layout}>
      <header className={styles.head}>
        <h1 className={styles.title}>The Clocktower</h1>
        <p className={styles.progress}>
          {shipped === 0 ? "No projects shipped yet." : `${shipped} ${shipped === 1 ? "project" : "projects"} shipped.`} {floorsOpen} {floorsOpen === 1 ? "floor" : "floors"} open.
        </p>
        <Tabs
          className={styles.views}
          label="View"
          idPrefix="view"
          value={view}
          onChange={pickView}
          items={[
            { id: "tower", label: "Tower" },
            { id: "list", label: "List" },
          ]}
        />
      </header>

      <section className={styles.main} id={`view-${view}-panel`} role="tabpanel" aria-labelledby={`view-${view}`}>
        {view === "tower" ? (
          <>
            <TowerFrame label="Floors of the Clocktower, top floor first" clock={clock}>
              {floors.map((f) => (
                <FloorButton key={f.floor.act} info={f} names={names} selected={selected === f.floor.act} onOpen={() => setSelected(f.floor.act)} />
              ))}
            </TowerFrame>
            <p className={styles.hint}>Choose a floor to see its projects.</p>
          </>
        ) : (
          <TowerList floors={[...floors].reverse()} progress={progress} names={names} />
        )}
      </section>

      <DeskCards className={styles.side} acts={acts} placements={placements} progress={progress} steps={steps} names={names} due={due} shipped={shipped} open={open} />

      <FloorSheet info={current} progress={progress} names={names} acts={acts} placements={placements} onClose={() => setSelected(null)} />
    </div>
  );
}

/** One floor as a button: the art and label, a lock or Pro badge, and the hover label. */
function FloorButton({ info, names, selected, onOpen }: { info: FloorInfo; names: Record<string, string>; selected: boolean; onOpen: () => void }) {
  const { floor, act, stats, state, pro } = info;
  const line = floorLine(floor, act.subject, stats);
  const locked = state === "locked";
  // The button's name is its visible words ("The Workshop", "Foundations"), so voice control
  // finds it, then the rest for screen readers.
  const more = [`, ${floor.label.toLowerCase()}.`, `${stats.shipped} of ${stats.total} shipped.`, locked ? (pro ? "Locked, part of Pro." : "Locked.") : ""].filter(Boolean).join(" ");
  return (
    <li className={[towerStyles.floor, styles.floor].join(" ")}>
      <button type="button" className={styles.floorButton} onClick={onOpen} aria-haspopup="dialog" aria-expanded={selected} data-selected={selected || undefined}>
        <FloorFace
          act={floor.act}
          state={state}
          room={floor.room}
          names={names}
          sub={act.subject}
          badges={
            locked ? (
              <span className={styles.lock}>
                <Icon name="lock" size={14} />
              </span>
            ) : null
          }
        />
        <span className="visually-hidden">{more}</span>
      </button>
      <span className={styles.tip} aria-hidden="true">
        {line}
      </span>
    </li>
  );
}

/** The clock is stuck at 3:14 until the roof's projects are all shipped. Then it runs. */
function useClock(runs: boolean) {
  const [now, setNow] = useState<{ h: number; m: number } | null>(null);
  useEffect(() => {
    if (!runs) return;
    const tick = () => {
      const d = new Date();
      setNow({ h: d.getHours(), m: d.getMinutes() });
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [runs]);
  return runs && now ? now : STUCK_CLOCK;
}
