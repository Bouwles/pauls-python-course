"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import type { CharacterLook } from "@/lib/store/types";
import type { Files } from "@/lib/python/protocol";
import { Button, LinkButton } from "../ui/Button";
import { Editor } from "../workbench/Editor";
import { Console } from "../workbench/Console";
import { useRunner } from "../workbench/useRunner";
import { LearnerSprite } from "../world/LearnerSprite";
import { SpriteFrame } from "../world/SpriteFrame";
import styles from "./SharedProject.module.css";

/** A learner's shipped project, runnable in the page. Read only: it's theirs. */
export function SharedProjectView(props: {
  slug: string;
  name: string;
  character: CharacterLook;
  projectName: string;
  client: string;
  actLabel: string;
  shelfObject: string | null;
  files: Files;
  entry: string;
  data: Files;
  shippedAt: string | null;
}) {
  const runner = useRunner();
  const names = Object.keys(props.files);
  const [active, setActive] = useState(names.includes(props.entry) ? props.entry : (names[0] ?? props.entry));
  const running = runner.state.phase === "running" || runner.state.phase === "starting";
  const run = () => void runner.run({ ...props.data, ...props.files }, props.entry);
  const date = props.shippedAt ? new Date(props.shippedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <article className={styles.page}>
      <header className={styles.head}>
        <div className={styles.stage} aria-hidden="true">
          <LearnerSprite look={props.character} scale={4} />
          {props.shelfObject ? <SpriteFrame sprite={`shelf-${props.shelfObject}`} scale={4} /> : null}
        </div>
        <div className={styles.titles}>
          <h1 className={styles.title}>{props.projectName}</h1>
          <p className={styles.meta}>
            By <Link href={`/u/${props.slug}`}>{props.name}</Link>, for {props.client}. {props.actLabel}
            {date ? `. Shipped ${date}.` : "."}
          </p>
        </div>
      </header>
      <section className={`frame-panel ${styles.code}`} aria-label="The code">
        <div className={styles.bar}>
          <div className={styles.tabs} role="tablist" aria-label="Files">
            {names.map((f) => (
              <button key={f} role="tab" aria-selected={f === active} className={styles.tab} onClick={() => setActive(f)}>
                {f}
              </button>
            ))}
          </div>
          {running ? (
            <Button variant="danger" pixelIcon="stop" onClick={runner.stop}>
              Stop
            </Button>
          ) : (
            <Button variant="go" pixelIcon="run" onClick={run}>
              Run
            </Button>
          )}
        </div>
        <div className={styles.well}>
          <div className={styles.editor}>
            <Editor docKey={`${props.slug}/${active}`} value={props.files[active] ?? ""} readOnly label={`${props.projectName}, ${active}`} onRun={run} />
          </div>
          <div className={styles.console}>
            <Console state={runner.state} source={props.files[props.entry] ?? ""} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
          </div>
        </div>
      </section>
      <p className={styles.made}>
        Made in {BRAND.name}, a Python course built as a game.{" "}
        <LinkButton href="/" variant="quiet" size="sm">
          Start the first project
        </LinkButton>
      </p>
    </article>
  );
}
