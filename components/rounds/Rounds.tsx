"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Card, Character, Concept, JobSummary } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import { dueCards, gradeFor, pickVariant, review } from "@/lib/review/deck";
import { recordMisconception } from "@/lib/store/progress";
import { Button, LinkButton } from "../ui/Button";
import { Head } from "../world/CharacterPortrait";
import { useRunner } from "../workbench/useRunner";
import { ReviewCard, type CardOutcome } from "./ReviewCard";
import { Says } from "./Says";
import styles from "./Rounds.module.css";

const MAX = 10;

/** How Moss names a client: "Bea" for Bea Hollis, but "Captain Ferro" and "Old Tom" in full. */
function callName(name: string) {
  return /^(Mr|Mrs|Ms|Dr|Captain|Professor|Old|The)\b/.test(name) ? name : (name.split(" ")[0] ?? name);
}

/** "Bea's till", "Captain Ferro's ferry fare machine": the thing that's acting up. */
function thingFor(title: string, client: string) {
  const what = title.replace(/, part \d+$/, "").replace(/^The /, "");
  const owned = /^([A-Z][a-z]+'s) (.+)$/.exec(what);
  return owned ? `${owned[1]} ${owned[2]!.toLowerCase()}` : `${callName(client)}'s ${what.toLowerCase()}`;
}

interface Planned {
  concept: Concept;
  card: Card;
  job: JobSummary | null;
}

export function Rounds({ concepts, jobs, characters, buildings }: { concepts: Record<string, Concept>; jobs: Record<string, JobSummary>; characters: Record<string, Character>; buildings: Record<string, string> }) {
  const { store, ready } = useSession();
  const runner = useRunner();
  const [plan, setPlan] = useState<Planned[] | null>(null);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<(CardOutcome & { concept: string })[]>([]);
  const [answered, setAnswered] = useState(false);
  const [intro, setIntro] = useState<string | null>(null);

  useEffect(() => {
    if (!store || !ready) return;
    void (async () => {
      const due = (await dueCards(store)).filter((c) => concepts[c.conceptId]).slice(0, MAX);
      // Interleave: shuffle so related concepts don't sit together.
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

  useEffect(() => {
    const first = plan?.[0]?.job;
    // Framed as Moss sending you round town to check on old repairs (Section 3.4).
    if (!first) return;
    // Moss's own jobs were lessons, not repairs for someone: he asks for a look back instead.
    if (first.client === "moss") setIntro(`Before anything new, a look back at ${first.title.replace(/, part \d+$/, "")}.`);
    else setIntro(`${thingFor(first.title, characters[first.client]?.name ?? "someone")} is acting up again. Have a look before anything new.`);
  }, [plan, characters]);

  const current = plan?.[index];
  const finished = plan !== null && index >= plan.length;

  const onAnswered = async (o: CardOutcome) => {
    if (!store || !current) return;
    setAnswered(true);
    await review(store, current.concept.id, current.card.id, gradeFor(o.correct, o.attempts));
    if (o.misconception) await recordMisconception(store, o.misconception);
    setOutcomes((x) => [...x, { ...o, concept: current.concept.id }]);
  };

  const shaky = useMemo(() => outcomes.filter((o) => !o.correct || o.attempts > 1), [outcomes]);

  if (plan === null)
    return (
      <p className={styles.quiet} role="status">
        Getting the round ready.
      </p>
    );

  if (plan.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.title}>Morning Rounds</h1>
        <Says id="moss" name="Moss">
          No repairs to check on today. Everything you&apos;ve fixed is holding.
        </Says>
        <div className={styles.next}>
          <LinkButton href="/map" variant="primary">
            Back to the map
          </LinkButton>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className={styles.summary}>
        <h1 className={styles.title}>Rounds done</h1>
        <p className={styles.lede}>
          {outcomes.length} {outcomes.length === 1 ? "repair" : "repairs"} checked. {shaky.length === 0 ? "All of them held." : `${shaky.length} needed a second look.`}
        </p>
        {shaky.length ? (
          <section className={["frame-paper", styles.shaky].join(" ")} aria-labelledby="shaky-title">
            <h2 id="shaky-title" className={styles.slipTitle}>
              Worth another look
            </h2>
            <ul>
              {[...new Set(shaky.map((s) => s.concept))].map((id) => {
                const c = concepts[id]!;
                const job = c.introducedIn ? jobs[c.introducedIn] : null;
                return (
                  <li key={id}>
                    <span className={styles.conceptName}>{c.title}</span>
                    {job ? (
                      <>
                        {" "}
                        from <Link href={`/job/${job.id}`}>{job.title}</Link>
                      </>
                    ) : null}
                    . <Link href={`/handbook/${id}`}>The handbook entry</Link>
                  </li>
                );
              })}
            </ul>
            <p className={styles.quiet}>These come back sooner. The ones that held come back later.</p>
          </section>
        ) : null}
        <div className={styles.next}>
          <LinkButton href="/map" variant="primary">
            On to new work
          </LinkButton>
        </div>
      </div>
    );
  }

  const job = current!.job;
  const clientId = job ? job.client : "moss";
  const building = job ? (buildings[job.building] ?? job.building) : null;
  return (
    <div className={styles.rounds}>
      <header className={styles.head}>
        <h1 className={styles.title}>Morning Rounds</h1>
        <div className={styles.headRight}>
          <p className={styles.count}>
            {index + 1} of {plan.length}
          </p>
          <LinkButton href="/map" variant="quiet" size="sm">
            Skip the rounds
          </LinkButton>
        </div>
      </header>
      {/* One pip per slip in today's round: checked, this one, still to come. */}
      <ol className={styles.pips} aria-hidden="true">
        {plan.map((p, i) => (
          <li key={`${p.card.id}-${i}`} className={i < index ? styles.pipDone : i === index ? styles.pipNow : undefined} />
        ))}
      </ol>
      {index === 0 && intro ? <Says id="moss" name="Moss">{intro}</Says> : null}
      <ReviewCard
        key={current!.card.id}
        card={current!.card}
        runner={runner}
        onAnswered={(o) => void onAnswered(o)}
        label={`Repair slip ${index + 1} of ${plan.length}`}
        head={
          <header className={styles.slipHead}>
            <span className={styles.slipFace}>
              <Head id={clientId} sprite={characters[clientId]?.sprite} scale={2} />
            </span>
            <div className={styles.slipWho}>
              <h2 className={styles.slipTitle}>{job ? job.title : "A loose end"}</h2>
              {building ? <p className={styles.slipMeta}>{building}</p> : null}
            </div>
            <p className={styles.tag}>
              <span className="visually-hidden">About: </span>
              {current!.concept.title}
            </p>
          </header>
        }
      >
        {answered ? (
          <div className={styles.next}>
            <Button
              variant="primary"
              onClick={() => {
                setAnswered(false);
                setIndex((i) => i + 1);
              }}
            >
              {index + 1 < plan.length ? "Next repair" : "Finish the rounds"}
            </Button>
          </div>
        ) : null}
      </ReviewCard>
    </div>
  );
}
