"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import type { ReviewCardRow } from "@/lib/store/types";
import { strengthOf } from "@/lib/review/strength";
import { Button, LinkButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Editor, type EditorHandle } from "../workbench/Editor";
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

/** A Handbook page: the title, the explanation, a runnable example in an editor card. */
export function ConceptPage({ concept, jobsUsing, misconceptions, related }: Props) {
  const { store } = useSession();
  const runner = useRunner();
  const editor = useRef<EditorHandle | null>(null);
  const [code, setCode] = useState(concept.example);
  const [card, setCard] = useState<ReviewCardRow | undefined>(undefined);
  useEffect(() => {
    if (store) void store.get("review_cards", concept.id).then(setCard);
  }, [store, concept.id]);
  const level = strengthOf(card);
  const running = runner.state.phase === "running" || runner.state.phase === "starting";
  const run = () => void runner.run({ "main.py": code });
  const ran = runner.state.phase !== "idle" || runner.state.output.length > 0 || Boolean(runner.state.result);
  const detail = [card && card.reps > 0 ? `Reviewed ${card.reps} ${card.reps === 1 ? "time" : "times"}` : null, card ? `next due ${new Date(card.due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : null].filter(Boolean).join(", ");
  return (
    <article className={styles.page}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/handbook">Python Handbook</Link>
      </nav>
      <header className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{concept.title}</h1>
        <p className={styles.standing}>
          <Strength level={level} />
          {detail ? <span>{detail.charAt(0).toUpperCase() + detail.slice(1)}.</span> : null}
        </p>
      </header>
      <div className={`prose ${styles.explain}`} dangerouslySetInnerHTML={{ __html: concept.summaryHtml }} />
      <section className={styles.example} aria-labelledby="ex-title">
        <div className={styles.exampleBar}>
          <div className={styles.exampleName}>
            <h2 id="ex-title" className={styles.exampleTitle}>
              Try it
            </h2>
            <span className={styles.file}>main.py</span>
          </div>
          {running ? (
            <Button variant="danger" size="sm" icon="stop" onClick={runner.stop}>
              Stop
            </Button>
          ) : (
            <Button variant="run" size="sm" onClick={run} keys="Control+Enter Meta+Enter">
              Run
            </Button>
          )}
        </div>
        {concept.exampleInputs.length ? <p className={styles.hint}>When it asks, try typing {concept.exampleInputs.map((i) => `"${i}"`).join(", ")}.</p> : null}
        <div className={styles.editor}>
          <Editor docKey={concept.id} value={code} onChange={(v) => setCode(v)} label={`Example for ${concept.title}`} onRun={run} handleRef={editor} />
        </div>
        <div className={styles.console} data-ran={ran || undefined}>
          <p className={styles.consoleLabel}>Output</p>
          <Console state={runner.state} source={code} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} onShowLine={(line) => editor.current?.goToLine(line)} />
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
                <Icon name="warning" className={styles.wrongMark} />
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
          <LinkButton href={`/drills?concept=${concept.id}`} variant="secondary" icon="timer">
            Drill it for speed
          </LinkButton>
        </p>
      ) : null}
    </article>
  );
}
