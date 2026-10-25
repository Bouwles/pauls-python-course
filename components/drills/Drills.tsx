"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Card, Concept } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import type { DrillBestRow, JobProgressRow } from "@/lib/store/types";
import { isShipped } from "@/lib/progress-rules";
import { Button } from "../ui/Button";
import { Head } from "../world/CharacterPortrait";
import { useRunner } from "../workbench/useRunner";
import { ReviewCard, type CardOutcome } from "../rounds/ReviewCard";
import { Says } from "../rounds/Says";
import { Stopwatch } from "./Stopwatch";
import styles from "./Drills.module.css";

const ROUND = 5;
const MISS_PENALTY_MS = 10_000;
const PIP_START_MS = 150_000;

/** Pip's time: a fair target that moves as you get quicker. */
function pipTime(best: number | null) {
  if (best === null) return PIP_START_MS;
  return Math.max(20_000, Math.round(best * 0.92));
}

function fmt(ms: number) {
  const s = Math.round(ms / 100) / 10;
  return s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${s.toFixed(1)}s`;
}

export function Drills({ concepts }: { concepts: Concept[] }) {
  const { store, ready } = useSession();
  const params = useSearchParams();
  const [shipped, setShipped] = useState<Set<string>>(new Set());
  const [bests, setBests] = useState<Record<string, DrillBestRow>>({});
  const [active, setActive] = useState<Concept | null>(null);

  useEffect(() => {
    if (!store) return;
    void (async () => {
      const rows = await store.all("job_progress");
      setShipped(new Set(rows.filter((r: JobProgressRow) => isShipped(r)).map((r) => r.jobId)));
      setBests(Object.fromEntries((await store.all("drill_bests")).map((b) => [b.key, b])));
    })();
  }, [store, active]);

  const unlocked = concepts.filter((c) => c.introducedIn && shipped.has(c.introducedIn));
  const locked = concepts.filter((c) => !unlocked.includes(c));

  useEffect(() => {
    const want = params.get("concept");
    if (want && !active) {
      const c = unlocked.find((x) => x.id === want);
      if (c) setActive(c);
    }
  }, [params, unlocked, active]);

  if (!ready) return null;
  if (active) return <DrillRun concept={active} best={bests[active.id]?.bestMs ?? null} onDone={() => setActive(null)} />;

  return (
    <div className={styles.drills}>
      <header className={styles.head}>
        <Stopwatch scale={3} />
        <div className={styles.headText}>
          <h1 className={styles.title}>Drills</h1>
          <p className={styles.lede}>Five quick tasks against the clock, for speed once you understand something. A concept joins the list once you have used it in a Make step.</p>
        </div>
      </header>
      <section className={["frame-panel", styles.bench].join(" ")} aria-labelledby="bench-title">
        <h2 id="bench-title" className={styles.benchTitle}>
          The speed bench
        </h2>
        {unlocked.length === 0 ? (
          <p className={styles.empty}>Nothing to drill yet. Ship your first job and its ideas turn up here.</p>
        ) : (
          <ul className={styles.list}>
            {unlocked.map((c) => (
              <li key={c.id} className={styles.item}>
                <span className={styles.name}>{c.title}</span>
                <span className={styles.times}>
                  <span className={styles.best}>{bests[c.id] ? `Best ${fmt(bests[c.id]!.bestMs)}` : "No time yet"}</span>
                  <span className={styles.pipTime}>
                    <Head id="pip" sprite="pip" scale={1} />
                    <span>
                      <span className="visually-hidden">Pip&apos;s time: </span>
                      {fmt(pipTime(bests[c.id]?.bestMs ?? null))}
                    </span>
                  </span>
                </span>
                <Button size="sm" variant="quiet" onClick={() => setActive(c)} aria-label={`Drill ${c.title}`}>
                  Drill
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {locked.length ? (
        <details className={styles.locked}>
          <summary>Not yet ({locked.length})</summary>
          <p className={styles.quiet}>{locked.map((c) => c.title).join(", ")}</p>
        </details>
      ) : null}
    </div>
  );
}

function DrillRun({ concept, best, onDone }: { concept: Concept; best: number | null; onDone: () => void }) {
  const { store } = useSession();
  const runner = useRunner();
  const tasks: Card[] = useMemo(() => {
    const pool = concept.cards.filter((c) => c.type !== "choice");
    const pick = (pool.length ? pool : concept.cards).map((c) => ({ c, r: Math.random() })).sort((a, b) => a.r - b.r).map((x) => x.c);
    return Array.from({ length: ROUND }, (_, i) => pick[i % pick.length]!);
  }, [concept]);
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<{ ms: number; newBest: boolean; beatPip: boolean } | null>(null);
  const [pipLine, setPipLine] = useState<string | null>(null);
  const pip = pipTime(best);
  const done = useRef(false);

  useEffect(() => {
    runner.preload();
    setPipLine(["Bet I'm faster.", "Ready when you are. I've been ready for ages."][Math.floor(Math.random() * 2)]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started || result) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [started, result]);

  const answered = async (o: CardOutcome) => {
    if (!o.correct) setMisses((m) => m + 1);
    if (index + 1 < ROUND) {
      setTimeout(() => setIndex((i) => i + 1), 500);
      return;
    }
    if (done.current || !started) return;
    done.current = true;
    const ms = Date.now() - started + (misses + (o.correct ? 0 : 1)) * MISS_PENALTY_MS;
    const newBest = best === null || ms < best;
    if (newBest && store) await store.put("drill_bests", { key: concept.id, bestMs: ms, achievedAt: Date.now(), updatedAt: Date.now() });
    setResult({ ms, newBest, beatPip: ms < pip });
  };

  const elapsed = started ? (result ? result.ms : now - started + misses * MISS_PENALTY_MS) : 0;
  // Pip's ghost runs the whole course in his time; your lamp segments fill as you finish tasks.
  const pipAt = Math.min(1, elapsed / pip);
  const tasksDone = result ? ROUND : started ? index : 0;
  const pipDone = elapsed >= pip;

  return (
    <div className={styles.run}>
      <section className={["frame-panel", styles.bench, styles.runBench].join(" ")} aria-labelledby="drill-title">
        <div className={styles.runHead}>
          <div className={styles.runWhat}>
            <h1 id="drill-title" className={styles.runTitle}>
              {concept.title}
            </h1>
            <p className={styles.quietOn}>
              {ROUND} tasks. Each miss adds {MISS_PENALTY_MS / 1000} seconds.
            </p>
          </div>
          <div className={styles.clock} aria-live="off">
            <Stopwatch scale={4} step={Math.floor(elapsed / 1000)} />
            <div className={styles.readout}>
              <span className={styles.time}>{fmt(elapsed)}</span>
              <span className={styles.vs}>Pip {fmt(pip)}</span>
            </div>
          </div>
        </div>
        <div className={styles.race}>
          <div className={styles.track} style={{ "--p": pipAt } as React.CSSProperties}>
            <span className={styles.ghost}>
              <Head id="pip" sprite="pip" scale={2} />
            </span>
            <ol className={styles.lanes} aria-hidden="true">
              {Array.from({ length: ROUND }, (_, i) => (
                <li key={i} className={i < tasksDone ? styles.laneDone : started && !result && i === index ? styles.laneNow : undefined} />
              ))}
            </ol>
            <span className={styles.flag} aria-hidden="true" />
          </div>
          <p className={styles.raceNote}>
            {tasksDone} of {ROUND} done.{" "}
            {result ? (result.beatPip ? `You beat Pip by ${fmt(pip - result.ms)}.` : `Pip finished in ${fmt(pip)}.`) : pipDone ? `Pip finished in ${fmt(pip)}.` : started ? "Pip's head shows his pace." : `Pip takes ${fmt(pip)}.`}
          </p>
        </div>
      </section>
      <Says id="pip" name="Pip" live>
        {result ? (result.beatPip ? "Fine. Rematch tomorrow." : "Told you. I was warming up, mind.") : pipLine}
      </Says>
      {!started ? (
        <div className={styles.start}>
          {best ? <p className={styles.quiet}>Your best is {fmt(best)}.</p> : null}
          <Button variant="primary" onClick={() => setStarted(Date.now())}>
            Start the clock
          </Button>
        </div>
      ) : result ? (
        <div className={["frame-paper", styles.result].join(" ")} role="status">
          <p className={styles.resultTime}>{fmt(result.ms)}</p>
          <p className={styles.resultText}>
            {result.newBest ? "A new best." : `Your best is still ${fmt(best!)}.`} {misses ? `${misses} ${misses === 1 ? "miss" : "misses"}.` : "No misses."}
          </p>
          {result.newBest ? <p className={styles.stamp}>New best</p> : null}
          <div className={styles.row}>
            <Button variant="primary" onClick={onDone}>
              Back to drills
            </Button>
            <Link href={`/handbook/${concept.id}`}>Read about {concept.title}</Link>
          </div>
        </div>
      ) : (
        <ReviewCard
          key={`${index}-${tasks[index]!.id}`}
          card={tasks[index]!}
          runner={runner}
          onAnswered={(o) => void answered(o)}
          label={`Task ${index + 1} of ${ROUND}`}
          head={
            <header className={styles.taskHead}>
              <h2 className={styles.taskTitle}>
                Task {index + 1} of {ROUND}
              </h2>
            </header>
          }
        />
      )}
    </div>
  );
}
