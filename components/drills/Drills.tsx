"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Card, Concept } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import type { DrillBestRow, JobProgressRow } from "@/lib/store/types";
import { isShipped } from "@/lib/progress-rules";
import { Button } from "../ui/Button";
import { Portrait } from "../world/Portrait";
import { useRunner } from "../workbench/useRunner";
import { ReviewCard, type CardOutcome } from "../rounds/ReviewCard";
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
      <h1 className={styles.title}>Drills</h1>
      <p className={styles.lede}>Five quick tasks against the clock, for speed once you understand something. A concept joins the list once you have used it in a Make step.</p>
      {unlocked.length === 0 ? <p className={styles.quiet}>Nothing to drill yet. Ship your first job and its ideas turn up here.</p> : null}
      <ul className={styles.list}>
        {unlocked.map((c) => (
          <li key={c.id} className={styles.item}>
            <span className={styles.name}>{c.title}</span>
            <span className={styles.best}>{bests[c.id] ? `Best ${fmt(bests[c.id]!.bestMs)}` : "No time yet"}</span>
            <Button size="sm" variant="secondary" onClick={() => setActive(c)}>
              Drill
            </Button>
          </li>
        ))}
      </ul>
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

  return (
    <div className={styles.run}>
      <header className={styles.runHead}>
        <div>
          <p className="label">Drill</p>
          <h1 className={styles.runTitle}>{concept.title}</h1>
        </div>
        <div className={styles.clock} aria-live="off">
          <span className={styles.time}>{fmt(elapsed)}</span>
          <span className={styles.vs}>Pip: {fmt(pip)}</span>
        </div>
      </header>
      <div className={styles.pip}>
        <Portrait sprite="pip" size={48} />
        <p>{result ? (result.beatPip ? "Fine. Rematch tomorrow." : "Told you. I was warming up, mind.") : pipLine}</p>
      </div>
      {!started ? (
        <div className={styles.start}>
          <p className={styles.quiet}>
            {ROUND} tasks. Each miss adds {MISS_PENALTY_MS / 1000} seconds. {best ? `Your best is ${fmt(best)}.` : ""}
          </p>
          <Button variant="primary" onClick={() => setStarted(Date.now())}>
            Start the clock
          </Button>
        </div>
      ) : result ? (
        <div className={styles.result} role="status">
          <p className={styles.resultTime}>{fmt(result.ms)}</p>
          <p>
            {result.newBest ? "A new best." : `Your best is still ${fmt(best!)}.`} {misses ? `${misses} ${misses === 1 ? "miss" : "misses"}.` : "No misses."}
          </p>
          <div className={styles.row}>
            <Button variant="primary" onClick={onDone}>
              Back to drills
            </Button>
            <Link href={`/concepts/${concept.id}`}>Read about {concept.title}</Link>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.quiet}>
            Task {index + 1} of {ROUND}
          </p>
          <ReviewCard key={`${index}-${tasks[index]!.id}`} card={tasks[index]!} runner={runner} onAnswered={(o) => void answered(o)} />
        </>
      )}
    </div>
  );
}
