"use client";

// Drills: five quick tasks against the clock, for speed once
// an idea is understood. A grid of topic cards under Act headings, each with the learner's best
// time and the rival's. The rival (RIVAL in lib/cast.ts, Yahya) is there in person: he sets the
// time, races you down the track, and takes the result the way he would: proud when he wins,
// unimpressed or surprised when you beat him. His time moves as the learner gets quicker.
// The race is run by full-body figures (lib/pixel/figures.ts): you and him, side on, him with his
// stopwatch. He warms up before the start and waits at the flag if he's there first; at the end
// the winner cheers and the other shrugs or claps. What each of them does, and the gestures he
// says his lines with, change from visit to visit (lib/pixel/variety.ts). When you're playing as
// Yahya, his stand-in races you instead (lib/playas.ts), and you run as Yahya.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Card, Character, Concept } from "@/lib/content/types";
import type { Expression, Pose } from "@/lib/pixel/people";
import { castColour, floorFor, ownerFor, speakerFor } from "@/lib/cast";
import { useMe } from "@/lib/useMe";
import { useSession } from "@/lib/store/session";
import { useMedia } from "@/lib/useMedia";
import type { DrillBestRow, JobProgressRow } from "@/lib/store/types";
import { isShipped } from "@/lib/progress-rules";
import type { View } from "@/lib/pixel/figures";
import { moodOf } from "@/lib/mood";
import { oneOf, pickAction } from "@/lib/moments";
import { useVisit } from "@/lib/useVisit";
import { PixelFigure } from "../art/PixelFigure";
import { Portrait } from "../art/Portrait";
import { Speech } from "../art/Speech";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { useRunner } from "../workbench/useRunner";
import { ReviewCard, type CardOutcome } from "../rounds/ReviewCard";
import { nameOf, useLine } from "../rounds/Coach";
import styles from "./Drills.module.css";

const ROUND = 5;
const MISS_PENALTY_MS = 10_000;
const RIVAL_START_MS = 150_000;
const START_LINE = "Mine runs in 0.02 seconds. Yours?";
const BEATEN_LINE = "Fine. Rematch tomorrow.";
const INTRO_LINE = "Every card has my time on it. Pick one and try to beat it.";
const NOTHING_LINE = "Nothing to race yet. Ship a project and I'll set you a time.";
const MY_TIME_LINE = "That's my time. Finish anyway, it still counts.";
/** When the rival wins: he's proud of it, and a good sport. */
const WON_LINES = ["Still mine. Go again whenever you like.", "My time stands. For now.", "Close. Not close enough, but close."];

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
  const { store, ready, profile } = useSession();
  const params = useSearchParams();
  const [shipped, setShipped] = useState<Set<string> | null>(null);
  const [bests, setBests] = useState<Record<string, DrillBestRow>>({});
  const [active, setActive] = useState<Concept | null>(null);
  const phone = useMedia("(max-width: 720px)");
  const rival = speakerFor("drill-start", { playAs: profile.settings.playAs });
  const rivalName = nameOf(characters, rival);
  const visit = useVisit();

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
          Five quick tasks against the clock. Each one opens when you ship the project that first uses it. {rivalName} sets the time to beat.
        </p>
      </header>

      <Speech
        who={rival}
        name={rivalName}
        text={unlocked.length ? INTRO_LINE : NOTHING_LINE}
        face={unlocked.length ? "proud" : "neutral"}
        gesture={moodOf(unlocked.length ? INTRO_LINE : NOTHING_LINE, { face: unlocked.length ? "proud" : "neutral", gesture: unlocked.length ? "point" : undefined }, { who: rival, seed: `drills|${visit}`, small: phone }).gesture}
        size={phone ? 72 : 108}
        className={styles.host}
      />

      {unlocked.length === 0 ? null : (
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
                  <li key={c.id} className={`px-panel ${styles.card}`}>
                    <h3 className={styles.topic}>{c.title}</h3>
                    <dl className={styles.times}>
                      <div className={styles.time}>
                        <dt>Your best</dt>
                        <dd className={best === null ? styles.noTime : undefined}>{best === null ? "No time yet" : fmt(best)}</dd>
                      </div>
                      <div className={[styles.time, styles.rivalCell].join(" ")}>
                        <dt>
                          <span className={styles.rivalFace} aria-hidden="true">
                            <Portrait who={rival} name={rivalName} size={36} crop="head" />
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
        <details className={`px-panel ${styles.locked}`}>
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

/** A runner on the track: their whole pixel self, moved along by `at` (0 to 1), doing `action`. */
function Runner({ at, who, avatar, action, facing }: { at: number; who?: string; avatar?: unknown; action: string; facing: View }) {
  return (
    <span className={styles.runner} style={{ ["--at" as string]: String(Math.min(1, Math.max(0, at))) }} data-action={action}>
      <PixelFigure who={who} avatar={avatar} action={action} facing={facing} scale={2} />
    </span>
  );
}

/** Before the start, he warms up; first to the flag, he waits for you; at the end, the loser takes it well. */
const WARM_UP = ["stretch", "stand", "drink", "think"] as const;
const AT_THE_FLAG = ["drink", "phone", "stand", "think"] as const;
const GOOD_LOSER = ["shrug", "clap"] as const;

function DrillRun({ concept, best, characters, rival, onDone }: { concept: Concept; best: number | null; characters: Record<string, Character>; rival: string; onDone: () => void }) {
  const { store, profile } = useSession();
  const me = useMe();
  const runner = useRunner();
  const phone = useMedia("(max-width: 720px)");
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
  const loser = speakerFor("drill-beaten", { playAs: profile.settings.playAs });
  // His lines, whoever's racing you: the stand-in says Yahya's when you're Yahya.
  const startLine = useLine(characters, ownerFor("drill-start"), "drill-start", START_LINE, true, rival);
  const beatenLine = useLine(characters, ownerFor("drill-beaten"), "drill-beaten", BEATEN_LINE, Boolean(result?.beat), loser);
  const wonLine = useMemo(() => WON_LINES[Math.floor(Math.random() * WON_LINES.length)]!, []);

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
  const youAt = tasksDone / ROUND;
  const rivalDone = elapsed >= target;

  // The runners: you run when a task's done and you move up the track, and think while you're on
  // one; he sprints with his stopwatch the whole way. What they do either side of the race is this
  // visit's.
  const visit = useVisit();
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    if (!tasksDone) return;
    setMoving(true);
    const t = setTimeout(() => setMoving(false), 900);
    return () => clearTimeout(t);
  }, [tasksDone]);
  const youWon = Boolean(result?.beat);
  const you: { action: string; facing: View } = result
    ? // Playing as one of the class, you celebrate in a way of theirs (Caitlin's guitar).
      { action: youWon ? (me.who ? pickAction({ who: me.who, tags: ["celebrate"], seed: `you-won|${visit}` }) : "cheer") : oneOf(GOOD_LOSER, `you|${visit}`), facing: "front" }
    : !started
      ? { action: "stand", facing: "right" }
      : { action: moving ? "run" : "think", facing: "right" };
  const him: { action: string; facing: View } = result
    ? { action: youWon ? oneOf(GOOD_LOSER, `him|${visit}`) : "cheer", facing: "front" }
    : !started
      ? { action: oneOf(WARM_UP, `warm|${visit}`), facing: "front" }
      : rivalDone
        ? { action: oneOf(AT_THE_FLAG, `flag|${visit}`), facing: "left" }
        : { action: "stopwatch", facing: "right" };

  // What the rival says, and how he looks saying it. He watches the race as it goes.
  let say: { who: string; text: string; face: Expression; gesture: Pose } | null = null;
  if (result?.beat) {
    // Beaten by a lot: he didn't see it coming. Beaten narrowly: he's not impressed. Either way, fair.
    const margin = (target - result.ms) / target;
    if (beatenLine) say = { who: loser, text: beatenLine, face: margin > 0.15 ? "surprised" : "unimpressed", gesture: margin > 0.15 ? "thumbs" : "idle" };
  } else if (result) say = { who: rival, text: wonLine, face: "proud", gesture: "cheer" };
  else if (started && rivalDone) say = { who: rival, text: MY_TIME_LINE, face: "proud", gesture: "point" };
  else if (startLine) say = { who: rival, text: startLine, face: !started ? "proud" : youAt > rivalAt + 0.1 ? "surprised" : youAt + 0.25 < rivalAt ? "pleased" : "thinking", gesture: !started ? "point" : "idle" };

  return (
    <div className={styles.run}>
      <div className={styles.runTop}>
        <Button variant="ghost" size="sm" icon="caretLeft" onClick={onDone}>
          All drills
        </Button>
      </div>
      <header className={styles.runHead}>
        <h1 className={styles.runTitle}>{concept.title}</h1>
        <p className={styles.quiet}>
          {ROUND} tasks. Each miss adds {MISS_PENALTY_MS / 1000} seconds.
        </p>
      </header>

      <section className={`px-panel ${styles.race}`} aria-label="The race">
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
        <div className={styles.lanes} aria-hidden="true">
          <div className={styles.lane}>
            <span className={styles.laneName}>You</span>
            <div className={styles.track}>
              <ol className={styles.segments}>
                {Array.from({ length: ROUND }, (_, i) => (
                  <li key={i} className={i < tasksDone ? styles.segDone : started && !result && i === index ? styles.segNow : undefined} />
                ))}
              </ol>
              <Runner at={youAt} who={me.who} avatar={me.avatar} action={you.action} facing={you.facing} />
              <Icon name="flag" size={24} className={styles.flag} />
            </div>
          </div>
          <div className={styles.lane}>
            <span className={styles.laneName}>{rivalName}</span>
            <div className={styles.track}>
              <span className={styles.trackFill} style={{ width: `calc(${rivalAt} * (100% - 38px))`, background: castColour(rival).face }} />
              <Runner at={rivalAt} who={rival} action={him.action} facing={him.facing} />
              <Icon name="flag" size={24} className={styles.flag} />
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
                ? `${rivalName}'s runner shows his pace.`
                : `${rivalName} takes ${fmt(target)}.`}
        </p>
      </section>

      {say ? (
        <Speech
          who={say.who}
          name={nameOf(characters, say.who)}
          text={say.text}
          face={say.face}
          gesture={say.gesture === "idle" ? "idle" : moodOf(say.text, { face: say.face, gesture: say.gesture }, { who: say.who, seed: `race|${visit}`, small: phone }).gesture}
          size={phone ? 72 : 108}
          className={styles.host}
        />
      ) : null}

      {!started ? (
        <div className={styles.start}>
          <Button variant="primary" icon="timer" onClick={() => setStarted(Date.now())}>
            Start the clock
          </Button>
          {best ? <p className={styles.quiet}>Your best is {fmt(best)}.</p> : null}
        </div>
      ) : result ? (
        <div className={`px-panel ${styles.result}`} role="status">
          <div className={styles.resultTop}>
            <p className={styles.resultTime}>{fmt(result.ms)}</p>
            {result.newBest ? <Badge tone="shipped">New best</Badge> : null}
          </div>
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
