"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import type { ReviewCardRow } from "@/lib/store/types";
import { STRENGTH_LABEL, strengthOf } from "@/lib/review/strength";
import { Button } from "../ui/Button";
import { RunIcon, StopIcon } from "../ui/Icons";
import { Editor } from "../workbench/Editor";
import { Console } from "../workbench/Console";
import { useRunner } from "../workbench/useRunner";
import styles from "./Concepts.module.css";

interface Props {
  concept: { id: string; title: string; summaryHtml: string; example: string; exampleInputs: string[]; drill: boolean };
  jobsUsing: { id: string; title: string; status: string }[];
  misconceptions: string[];
  related: { id: string; title: string }[];
}

export function ConceptPage({ concept, jobsUsing, misconceptions, related }: Props) {
  const { store } = useSession();
  const runner = useRunner();
  const [code, setCode] = useState(concept.example);
  const [card, setCard] = useState<ReviewCardRow | undefined>(undefined);
  useEffect(() => {
    if (store) void store.get("review_cards", concept.id).then(setCard);
  }, [store, concept.id]);
  const s = strengthOf(card);
  const running = runner.state.phase === "running" || runner.state.phase === "starting";
  return (
    <article className={styles.page}>
      <p className="label">
        <Link href="/concepts">Concepts</Link>
      </p>
      <h1 className={styles.title}>{concept.title}</h1>
      <p className={[styles.strength, styles[s]].join(" ")}>
        {STRENGTH_LABEL[s]}
        {card && card.reps > 0 ? `, reviewed ${card.reps} ${card.reps === 1 ? "time" : "times"}` : ""}
        {card ? `, next due ${new Date(card.due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
      </p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: concept.summaryHtml }} />
      <section className={styles.example} aria-labelledby="ex-title">
        <div className={styles.exampleBar}>
          <h2 id="ex-title" className="label">
            Try it
          </h2>
          {running ? (
            <Button size="sm" variant="danger" icon={<StopIcon />} onClick={runner.stop}>
              Stop
            </Button>
          ) : (
            <Button size="sm" variant="primary" icon={<RunIcon />} onClick={() => void runner.run({ "main.py": code })}>
              Run
            </Button>
          )}
          {concept.exampleInputs.length ? <span className={styles.hint}>Try typing {concept.exampleInputs.map((i) => `"${i}"`).join(", ")}.</span> : null}
        </div>
        <div className={styles.editor}>
          <Editor docKey={concept.id} value={code} onChange={(v) => setCode(v)} label={`Example for ${concept.title}`} onRun={() => void runner.run({ "main.py": code })} />
        </div>
        <div className={styles.console}>
          <Console state={runner.state} source={code} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
        </div>
      </section>
      {misconceptions.length ? (
        <section>
          <h2 className={styles.h2}>Easy to get wrong</h2>
          <ul className={styles.bullets}>
            {misconceptions.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {jobsUsing.length ? (
        <section>
          <h2 className={styles.h2}>Where it comes up</h2>
          <ul className={styles.bullets}>
            {jobsUsing.map((j) => (
              <li key={j.id}>{j.status === "written" ? <Link href={`/job/${j.id}`}>{j.title}</Link> : j.title}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {related.length ? (
        <p className={styles.hint}>
          See also: {related.map((r, i) => (
            <span key={r.id}>
              {i ? ", " : ""}
              <Link href={`/concepts/${r.id}`}>{r.title}</Link>
            </span>
          ))}
        </p>
      ) : null}
      {concept.drill && card && card.reps > 0 ? (
        <p>
          <Link href={`/drills?concept=${concept.id}`}>Drill it for speed</Link>
        </p>
      ) : null}
    </article>
  );
}
