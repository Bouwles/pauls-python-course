"use client";

// Morning Rounds (REDESIGN-2.md 6, REDESIGN3_PLAN.md): up to ten review cards, one at a time,
// centred. Paul runs them: he says his rounds-start line as they begin, and stays at the top of the
// page reacting to each answer with a face and a gesture that fit it, then sends you off at the end.
// Each card shows the project its idea came from. His gestures are chosen per card and per visit
// (lib/pixel/variety.ts), never the same twice running; when the rounds are done he celebrates in
// person, head to toe (lib/pixel/figures.ts), with a dance, a cheer or a clap.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Card, Character, Concept, JobSummary } from "@/lib/content/types";
import type { Expression, Pose } from "@/lib/pixel/people";
import type { GestureTag } from "@/lib/pixel/gestures";
import { pickGesture } from "@/lib/pixel/variety";
import { pickAction } from "@/lib/moments";
import { useVisit } from "@/lib/useVisit";
import { PixelFigure } from "../art/PixelFigure";
import { speakerFor } from "@/lib/cast";
import { useSession } from "@/lib/store/session";
import { useMedia } from "@/lib/useMedia";
import { dueCards, gradeFor, pickVariant, review } from "@/lib/review/deck";
import { recordMisconception } from "@/lib/store/progress";
import { ShelfObject } from "../art/ShelfObject";
import { Speech } from "../art/Speech";
import { Button, LinkButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { useRunner } from "../workbench/useRunner";
import { nameOf, useLine } from "./Coach";
import { ReviewCard, type CardOutcome } from "./ReviewCard";
import styles from "./Rounds.module.css";

const MAX = 10;
const OPENING = "Ten quick ones before anything new.";
const CLOSING = "That's the lot. Your desk is waiting.";
const NOTHING_DUE = "Nothing due today. Go and build something new.";

interface Planned {
  concept: Concept;
  card: Card;
  job: JobSummary | null;
}

interface Said {
  text: string;
  face: Expression;
  gesture: Pose;
}

/** How Paul takes each answer: a face, what his gesture is for, and a few short lines to choose between. */
const REACTIONS: Record<"right" | "second" | "retry" | "missed", { face: Expression; tags: GestureTag[]; lines: string[] }> = {
  right: { face: "pleased", tags: ["approve", "celebrate"], lines: ["Straight from memory. Good.", "That one's stuck.", "Right, and no hesitating.", "You didn't even need to think about that one."] },
  second: { face: "pleased", tags: ["approve", "encourage"], lines: ["Got there. It'll come back a little sooner.", "Second go counts. It's nearly stuck.", "There it is. Slower than you'd like, but there."] },
  retry: { face: "thinking", tags: ["encourage", "think"], lines: ["Not quite. Slow down and try once more.", "Read it again, the way Python would. Line by line.", "Look at it one more time. It's in there."] },
  missed: { face: "thinking", tags: ["encourage", "listen"], lines: ["No harm done. That one comes round again soon.", "That's what Rounds are for. You'll see it again tomorrow.", "Read the answer once. It'll be back before long."] },
};

export function Rounds({ concepts, jobs, characters }: { concepts: Record<string, Concept>; jobs: Record<string, JobSummary>; characters: Record<string, Character> }) {
  const { store, ready } = useSession();
  const runner = useRunner();
  const [plan, setPlan] = useState<Planned[] | null>(null);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<(CardOutcome & { concept: string })[]>([]);
  const [answered, setAnswered] = useState(false);
  const [reaction, setReaction] = useState<Said | null>(null);
  const [said, setSaid] = useState(0);
  const phone = useMedia("(max-width: 720px)");
  const visit = useVisit();
  const coach = speakerFor("rounds-start");
  const coachName = nameOf(characters, coach);
  const finished = plan !== null && index >= plan.length;
  const opening = useLine(characters, coach, "rounds-start", OPENING, Boolean(plan && plan.length > 0));
  const closing = useLine(characters, speakerFor("rounds-done"), "rounds-done", CLOSING, finished);

  useEffect(() => {
    if (!store || !ready) return;
    void (async () => {
      const due = (await dueCards(store)).filter((c) => concepts[c.conceptId]).slice(0, MAX);
      // Interleave: shuffle so related ideas don't sit together.
      const shuffled = due.map((c) => ({ c, r: Math.random() })).sort((a, b) => a.r - b.r).map((x) => x.c);
      const planned: Planned[] = [];
      for (const row of shuffled) {
        const concept = concepts[row.conceptId]!;
        const variantId = await pickVariant(store, concept.id, concept.cards.map((c) => c.id));
        planned.push({ concept, card: concept.cards.find((c) => c.id === variantId)!, job: concept.introducedIn ? (jobs[concept.introducedIn] ?? null) : null });
      }
      setPlan(planned);
      runner.preload();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, ready]);

  const current = plan?.[index];

  /** Paul reacts to every go: a new line, a new face, a new gesture. The lines take turns so none repeats twice running. */
  const react = (kind: keyof typeof REACTIONS) => {
    const r = REACTIONS[kind];
    const gesture = pickGesture({ who: coach, tags: r.tags, face: r.face, seed: `rounds|${visit}|${index}|${said}`, avoid: [reaction?.gesture], small: phone });
    setReaction({ text: r.lines[said % r.lines.length]!, face: r.face, gesture });
    setSaid((n) => n + 1);
  };
  /** A gesture for one of his own lines (hello, goodbye, well done), this visit's. */
  const gestureFor = (tags: GestureTag[], key: string) => pickGesture({ who: coach, tags, seed: `rounds|${visit}|${key}`, small: phone });

  const onAttempt = (correct: boolean, attempt: number) => {
    if (correct) react(attempt === 1 ? "right" : "second");
    else react(attempt >= 2 ? "missed" : "retry");
  };

  const onAnswered = async (o: CardOutcome) => {
    if (!store || !current) return;
    setAnswered(true);
    await review(store, current.concept.id, current.card.id, gradeFor(o.correct, o.attempts));
    if (o.misconception) await recordMisconception(store, o.misconception);
    setOutcomes((x) => [...x, { ...o, concept: current.concept.id }]);
  };

  const shaky = useMemo(() => outcomes.filter((o) => !o.correct || o.attempts > 1), [outcomes]);
  const size = phone ? 72 : 108;

  if (plan === null)
    return (
      <div className={styles.rounds}>
        <h1 className={styles.title}>Morning Rounds</h1>
        <p className={styles.quiet} role="status">
          Getting today&apos;s cards ready.
        </p>
      </div>
    );

  if (plan.length === 0) {
    return (
      <div className={styles.rounds}>
        <h1 className={styles.title}>Morning Rounds</h1>
        <Speech who={coach} name={coachName} text={NOTHING_DUE} face="pleased" gesture={gestureFor(["greet", "bye"], "nothing")} size={size} className={styles.host} />
        <div className={`px-panel ${styles.emptyCard}`}>
          <p className={styles.quiet}>Each idea comes back a day or two after you first use it, then less and less often as it sticks.</p>
          <LinkButton href="/map" variant="primary">
            Back to the Clocktower
          </LinkButton>
        </div>
      </div>
    );
  }

  if (finished) {
    const firstTime = outcomes.filter((o) => o.correct && o.attempts === 1).length;
    const held = shaky.length === 0;
    const doneBy = speakerFor("rounds-done");
    // Every one held: a dance or a cheer. Otherwise a cheer or a clap. This visit's.
    const party = pickAction({ who: doneBy, tags: ["celebrate"], seed: `rounds-done|${visit}`, only: held ? ["dance", "cheer"] : ["cheer", "clap"] });
    return (
      <div className={styles.rounds}>
        <h1 className={styles.title}>Rounds done</h1>
        {closing ? (
          <Speech
            who={doneBy}
            name={nameOf(characters, doneBy)}
            text={closing}
            face={held ? "proud" : "pleased"}
            gesture={pickGesture({ who: doneBy, tags: held ? ["celebrate", "approve"] : ["approve", "encourage", "bye"], seed: `rounds|${visit}|closing`, small: phone })}
            size={size}
            className={styles.host}
          />
        ) : null}
        <div className={`px-panel ${styles.score}`}>
          <div className={styles.scoreBody}>
            <p className={styles.scoreBig}>
              {firstTime}
              <span className={styles.scoreOf}> of {outcomes.length}</span>
            </p>
            <p className={styles.scoreText}>right first time. {held ? "Every one held." : `${shaky.length} needed a second look.`}</p>
            <ol className={styles.tally} aria-hidden="true">
              {outcomes.map((o, i) => (
                <li key={i} className={o.correct && o.attempts === 1 ? styles.tallyRight : o.correct ? styles.tallySecond : styles.tallyMissed} />
              ))}
            </ol>
          </div>
          <PixelFigure who={doneBy} action={party} scale={2} className={styles.scoreFigure} />
        </div>
        {shaky.length ? (
          <section className={`px-panel ${styles.shaky}`} aria-labelledby="shaky-title">
            <h2 id="shaky-title" className={styles.h2}>
              Worth another look
            </h2>
            <ul className={styles.shakyList}>
              {[...new Set(shaky.map((s) => s.concept))].map((id) => {
                const c = concepts[id]!;
                const job = c.introducedIn ? jobs[c.introducedIn] : null;
                return (
                  <li key={id}>
                    {job ? <ShelfObject jobId={job.id} title={job.title} client={job.client} size={32} /> : <span className={styles.dot} aria-hidden="true" />}
                    <span className={styles.shakyText}>
                      <span className={styles.conceptName}>{c.title}</span>
                      {job ? <span className={styles.quiet}> from {job.projectName || job.title}</span> : null}
                    </span>
                    <Link href={`/handbook/${id}`} className={styles.shakyLink}>
                      Read the Handbook page<span className="visually-hidden"> on {c.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className={styles.quiet}>These come back sooner. The ones that held come back later.</p>
          </section>
        ) : null}
        <div className={styles.end}>
          <LinkButton href="/map" variant="primary">
            On to new work
          </LinkButton>
        </div>
      </div>
    );
  }

  const job = current!.job;
  const done = index + (answered ? 1 : 0);
  const line: Said | null = reaction ?? (opening ? { text: opening, face: "pleased", gesture: gestureFor(["greet"], "opening") } : null);
  return (
    <div className={styles.rounds}>
      <header className={styles.head}>
        <h1 className={styles.title}>Morning Rounds</h1>
        <div className={styles.progress}>
          <p className={styles.count}>
            {index + 1} of {plan.length}
          </p>
          <div className={styles.bar} role="progressbar" aria-label="Cards done" aria-valuemin={0} aria-valuemax={plan.length} aria-valuenow={done}>
            {plan.map((_, i) => (
              <span key={i} className={i < done ? styles.blockDone : i === index ? styles.blockNow : undefined} />
            ))}
          </div>
          <LinkButton href="/map" variant="ghost" size="sm" className={styles.skip}>
            Skip the rounds
          </LinkButton>
        </div>
      </header>
      {line ? <Speech who={coach} name={coachName} text={line.text} face={line.face} gesture={line.gesture} size={size} className={styles.host} /> : <div className={styles.hostSpace} aria-hidden="true" />}
      <ReviewCard
        key={`${index}-${current!.card.id}`}
        card={current!.card}
        runner={runner}
        onAttempt={onAttempt}
        onAnswered={(o) => void onAnswered(o)}
        label={`Card ${index + 1} of ${plan.length}`}
        head={
          <header className={styles.cardHead}>
            {job ? (
              <ShelfObject jobId={job.id} title={job.title} client={job.client} size={40} />
            ) : (
              <span className={styles.looseTile} aria-hidden="true">
                <Icon name="star" />
              </span>
            )}
            <div className={styles.cardWho}>
              <h2 className={styles.project}>{job ? job.projectName || job.title : "From earlier"}</h2>
              {/* Not the idea's name: on a "which error is it?" card, that would be the answer. */}
              <p className={styles.cardMeta}>{job ? `For ${nameOf(characters, job.client)}, Act ${job.actNumber}` : "A review card"}</p>
            </div>
          </header>
        }
      >
        {answered ? (
          <Button
            variant="primary"
            onClick={() => {
              setAnswered(false);
              setIndex((i) => i + 1);
            }}
          >
            {index + 1 < plan.length ? "Next card" : "Finish the rounds"}
          </Button>
        ) : null}
      </ReviewCard>
    </div>
  );
}
