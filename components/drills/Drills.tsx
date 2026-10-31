"use client";

// Drills (REDESIGN-2.md 6): five quick tasks against the clock, for speed once an idea is
// understood. A grid of topic cards under Act headings, each with the learner's best time and
// the rival's. The rival (RIVAL in lib/cast.ts, Yahya) has a time that moves as the learner gets quicker.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Card, Character, Concept } from "@/lib/content/types";
import { castColour, floorFor, speakerFor } from "@/lib/cast";
import { useSession } from "@/lib/store/session";
import type { DrillBestRow, JobProgressRow } from "@/lib/store/types";
import { isShipped } from "@/lib/progress-rules";
import { Portrait } from "../art/Portrait";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { useRunner } from "../workbench/useRunner";
import { ReviewCard, type CardOutcome } from "../rounds/ReviewCard";
import { Coach, nameOf, useLine } from "../rounds/Coach";
import styles from "./Drills.module.css";

const ROUND = 5;
const MISS_PENALTY_MS = 10_000;
const RIVAL_START_MS = 150_000;
const START_LINE = "Mine runs in 0.02 seconds. Yours?";
const BEATEN_LINE = "Fine. Rematch tomorrow.";

export interface DrillAct {
  number: number;
  title: string;
  concepts: Concept[];
}

/** The rival's time: a fair target that moves as you get quicker. */
function rivalTime(best: number | null) {
  if (best === null) return RIVAL_START_MS;
  return Math.max(20_000, Math.round(best * 0.92));
}

function fmt(ms: number) {
  const s = Math.round(ms / 100) / 10;
  return s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${s.toFixed(1)}s`;
}

export function Drills({ acts, characters }: { acts: DrillAct[]; characters: Record<string, Character> }) {
  const { store, ready } = useSession();
  const params = useSearchParams();
  const [shipped, setShipped] = useState<Set<string> | null>(null);
  const [bests, setBests] = useState<Record<string, DrillBestRow>>({});
  const [active, setActive] = useState<Concept | null>(null);
  const rival = speakerFor("drill-start");
  const rivalName = nameOf(characters, rival);

  useEffect(() => {
    if (!store) return;
    void (async () => {
      const rows = await store.all("job_progress");
      setShipped(new Set(rows.filter((r: JobProgressRow) => isShipped(r)).map((r) => r.jobId)));
      setBests(Object.fromEntries((await store.all("drill_bests")).map((b) => [b.key, b])));
    })();
  }, [store, active]);

  const open = (c: Concept) => Boolean(shipped && c.introducedIn && shipped.has(c.introducedIn));
  const unlocked = acts.map((a) => ({ ...a, concepts: a.concepts.filter(open) })).filter((a) => a.concepts.length);
  const locked = acts.map((a) => ({ ...a, concepts: a.concepts.filter((c) => !open(c)) })).filter((a) => a.concepts.length);
  const lockedCount = locked.reduce((n, a) => n + a.concepts.length, 0);

  useEffect(() => {
    const want = params.get("concept");
    if (!want || active || !shipped) return;
    const c = acts.flatMap((a) => a.concepts).find((x) => x.id === want);
    if (c && open(c)) setActive(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, shipped, active]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [active]);

  if (!ready || shipped === null) return null;
  if (active)
    return <DrillRun concept={active} best={bests[active.id]?.bestMs ?? null} characters={characters} rival={rival} onDone={() => setActive(null)} />;

  return (
    <div className={styles.drills}>
      <header className={styles.head}>
        <h1 className={styles.title}>Drills</h1>
        <p className={styles.lede}>
          Five quick tasks against the clock, for speed once you understand an idea. Each one opens when you ship the project that first uses it. {rivalName} sets the time to beat.
        </p>
      </header>

      {unlocked.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="timer" size={32} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Nothing to drill yet.</p>
          <p className={styles.quiet}>Ship your first project and its ideas turn up here.</p>
        </div>
      ) : (
        unlocked.map((act) => (
          <section key={act.number} className={styles.act} aria-labelledby={`act-${act.number}`}>
            <h2 id={`act-${act.number}`} className={styles.actTitle}>
              <span className={styles.marker} style={{ background: castColour(floorFor(act.number)?.residents[0] ?? "").face }} aria-hidden="true" />
              Act {act.number}: {act.title}
            </h2>
            <ul className={styles.grid}>
              {act.concepts.map((c) => {
                const best = bests[c.id]?.bestMs ?? null;
                return (
                  <li key={c.id} className={styles.card}>
                    <h3 className={styles.topic}>{c.title}</h3>
                    <dl className={styles.times}>
                      <div className={styles.time}>
                        <dt>Your best</dt>
                        <dd className={best === null ? styles.noTime : undefined}>{best === null ? "No time yet" : fmt(best)}</dd>
                      </div>
                      <div className={styles.time}>
                        <dt>
                          <span aria-hidden="true">
                            <Portrait who={rival} name={rivalName} size={20} />
                          </span>
                          {rivalName}
                        </dt>
                        <dd>{fmt(rivalTime(best))}</dd>
                      </div>
                    </dl>
                    <Button size="sm" variant="secondary" icon="timer" onClick={() => setActive(c)} aria-label={`Start ${c.title}`}>
                      Start
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      {lockedCount ? (
        <details className={styles.locked}>
          <summary>
            <Icon name="caretRight" className={styles.caret} />
            Not unlocked yet ({lockedCount})
          </summary>
          <div className={styles.lockedBody}>
            {locked.map((act) => (
              <div key={act.number} className={styles.lockedAct}>
                <p className="label">
                  Act {act.number}: {act.title}
                </p>
                <ul className={styles.lockedList}>
                  {act.concepts.map((c) => (
                    <li key={c.id}>{c.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function DrillRun({ concept, best, characters, rival, onDone }: { concept: Concept; best: number | null; characters: Record<string, Character>; rival: string; onDone: () => void }) {
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
  const [result, setResult] = useState<{ ms: number; newBest: boolean; beat: boolean } | null>(null);
  const target = rivalTime(best);
  const done = useRef(false);
  const rivalName = nameOf(characters, rival);
  const startLine = useLine(characters, rival, "drill-start", START_LINE);
  const beatenLine = useLine(characters, speakerFor("drill-beaten"), "drill-beaten", BEATEN_LINE, Boolean(result?.beat));

  useEffect(() => {
    runner.preload();
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
    setResult({ ms, newBest, beat: ms < target });
  };

  const elapsed = started ? (result ? result.ms : now - started + misses * MISS_PENALTY_MS) : 0;
  // The rival runs the whole course in his time; your segments fill as you finish tasks.
  const rivalAt = Math.min(1, elapsed / target);
  const tasksDone = result ? ROUND : started ? index : 0;
  const rivalDone = elapsed >= target;
  const line = result ? (result.beat ? beatenLine : null) : startLine;

  return (
    <div className={styles.run}>
      <div className={styles.runTop}>
        <Button variant="ghost" size="sm" onClick={onDone}>
          All drills
        </Button>
      </div>
      <header className={styles.runHead}>
        <h1 className={styles.runTitle}>{concept.title}</h1>
        <p className={styles.quiet}>
          {ROUND} tasks. Each miss adds {MISS_PENALTY_MS / 1000} seconds.
        </p>
      </header>

      <section className={styles.race} aria-label="The race">
        <div className={styles.clocks} aria-live="off">
          <div className={styles.clock}>
            <span className="label">You</span>
            <span className={styles.bigTime}>{fmt(elapsed)}</span>
          </div>
          <div className={[styles.clock, styles.clockRival].join(" ")}>
            <span className="label">{rivalName}</span>
            <span className={styles.rivalTime}>{fmt(target)}</span>
          </div>
        </div>
        <div className={styles.lanes}>
          <div className={styles.lane}>
            <span className={styles.laneName}>You</span>
            <ol className={styles.segments} aria-hidden="true">
              {Array.from({ length: ROUND }, (_, i) => (
                <li key={i} className={i < tasksDone ? styles.segDone : started && !result && i === index ? styles.segNow : undefined} />
              ))}
            </ol>
          </div>
          <div className={styles.lane}>
            <span className={styles.laneName}>{rivalName}</span>
            <div className={styles.track} aria-hidden="true">
              <span className={styles.trackFill} style={{ width: `${rivalAt * 100}%`, background: castColour(rival).face }} />
            </div>
          </div>
        </div>
        <p className={styles.raceNote} role="status">
          {tasksDone} of {ROUND} done.{" "}
          {result
            ? result.beat
              ? `You beat ${rivalName} by ${fmt(target - result.ms)}.`
              : `${rivalName} finished in ${fmt(target)}.`
            : rivalDone
              ? `${rivalName} finished in ${fmt(target)}.`
              : started
                ? `${rivalName}'s bar shows his pace.`
                : `${rivalName} takes ${fmt(target)}.`}
        </p>
      </section>

      {line ? (
        <Coach who={result?.beat ? speakerFor("drill-beaten") : rival} name={result?.beat ? nameOf(characters, speakerFor("drill-beaten")) : rivalName} live>
          {line}
        </Coach>
      ) : null}

      {!started ? (
        <div className={styles.start}>
          <Button variant="primary" icon="timer" onClick={() => setStarted(Date.now())}>
            Start the clock
          </Button>
          {best ? <p className={styles.quiet}>Your best is {fmt(best)}.</p> : null}
        </div>
      ) : result ? (
        <div className={styles.result} role="status">
          <p className={styles.resultTime}>{fmt(result.ms)}</p>
          {result.newBest ? <Badge tone="shipped">New best</Badge> : null}
          <p className={styles.resultText}>
            {result.newBest ? "Your fastest yet." : `Your best is still ${fmt(best!)}.`} {misses ? `${misses} ${misses === 1 ? "miss" : "misses"}.` : "No misses."}
          </p>
          <div className={styles.resultActions}>
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

