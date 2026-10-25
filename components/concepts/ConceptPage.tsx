"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import type { ReviewCardRow } from "@/lib/store/types";
import { strengthOf } from "@/lib/review/strength";
import { Button, LinkButton } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { Editor } from "../workbench/Editor";
import { Console } from "../workbench/Console";
import { useRunner } from "../workbench/useRunner";
import { Strength } from "./Strength";
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
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/handbook">
          <span aria-hidden="true">&lt; </span>Python Handbook
        </Link>
      </nav>
      <header className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{concept.title}</h1>
        <Strength level={s}>
          {card && card.reps > 0 ? `, reviewed ${card.reps} ${card.reps === 1 ? "time" : "times"}` : ""}
          {card ? `, next due ${new Date(card.due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
        </Strength>
      </header>
      <div className={`prose ${styles.summary}`} dangerouslySetInnerHTML={{ __html: concept.summaryHtml }} />
      <section className={`frame-panel ${styles.example}`} aria-labelledby="ex-title">
        <div className={styles.exampleBar}>
          <h2 id="ex-title" className={styles.exampleTitle}>
            Try it
          </h2>
          {running ? (
            <Button variant="danger" pixelIcon="stop" onClick={runner.stop}>
              Stop
            </Button>
          ) : (
            <Button variant="go" pixelIcon="run" onClick={() => void runner.run({ "main.py": code })}>
              Run
            </Button>
          )}
        </div>
        {concept.exampleInputs.length ? <p className={styles.hint}>When it asks, try typing {concept.exampleInputs.map((i) => `"${i}"`).join(", ")}.</p> : null}
        <div className={styles.well}>
          <div className={styles.editor}>
            <Editor docKey={concept.id} value={code} onChange={(v) => setCode(v)} label={`Example for ${concept.title}`} onRun={() => void runner.run({ "main.py": code })} />
          </div>
          <div className={styles.console}>
            <Console state={runner.state} source={code} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
          </div>
        </div>
      </section>
      {misconceptions.length ? (
        <section className={styles.section} aria-labelledby="wrong-title">
          <h2 id="wrong-title" className={styles.h2}>
            Easy to get wrong
          </h2>
          <ul className={styles.wrong}>
            {misconceptions.map((m) => (
              <li key={m}>
                <span className={styles.wrongMark}>
                  <PixelIcon name="cross" />
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {jobsUsing.length ? (
        <section className={styles.section} aria-labelledby="where-title">
          <h2 id="where-title" className={styles.h2}>
            Where it comes up
          </h2>
          <ul className={styles.bullets}>
            {jobsUsing.map((j) => (
              <li key={j.id}>{j.status === "written" ? <Link href={`/job/${j.id}`}>{j.title}</Link> : <span>{j.title}, being written</span>}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {related.length ? (
        <section className={styles.section} aria-labelledby="related-title">
          <h2 id="related-title" className={styles.h2}>
            See also
          </h2>
          <ul className={styles.related}>
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/handbook/${r.id}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {concept.drill && card && card.reps > 0 ? (
        <p>
          <LinkButton href={`/drills?concept=${concept.id}`} variant="quiet">
            Drill it for speed
          </LinkButton>
        </p>
      ) : null}
    </article>
  );
}
