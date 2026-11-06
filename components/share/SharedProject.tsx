"use client";

// A learner's shipped project, runnable in the page (REDESIGN.md 9.2). Read only: it's theirs.
// The classmate it was made for stands at the top, celebrating it in a way of their own (a
// different one each visit, lib/pixel/variety.ts); the learner's pixel avatar signs it.
import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import type { Files } from "@/lib/python/protocol";
import { CAST_IDS, castColour } from "@/lib/cast";
import { avatarBackground } from "@/lib/pixel/looks";
import { gestureLabel, pickGesture } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import { PixelPerson } from "../art/PixelPerson";
import { ShelfObject } from "../art/ShelfObject";
import { Button, LinkButton } from "../ui/Button";
import { Editor } from "../workbench/Editor";
import { Console } from "../workbench/Console";
import { useRunner } from "../workbench/useRunner";
import styles from "./SharedProject.module.css";

export function SharedProjectView(props: {
  slug: string;
  name: string;
  character: unknown;
  jobId: string;
  projectName: string;
  clientId: string;
  client: string;
  actLabel: string;
  files: Files;
  entry: string;
  data: Files;
  shippedAt: string | null;
}) {
  const runner = useRunner();
  const visit = useVisit();
  // A plain cheer until the visit's seed arrives, so the page hydrates as it was sent.
  const cheer = visit ? pickGesture({ who: props.clientId, tags: ["celebrate", "approve"], seed: `share|${visit}|${props.jobId}`, mode: "moment" }) : "cheer";
  const names = Object.keys(props.files);
  const [active, setActive] = useState(names.includes(props.entry) ? props.entry : (names[0] ?? props.entry));
  const running = runner.state.phase === "running" || runner.state.phase === "starting";
  const run = () => void runner.run({ ...props.data, ...props.files }, props.entry);
  const date = props.shippedAt ? new Date(props.shippedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <article className={styles.page}>
      <header className={styles.head}>
        {(CAST_IDS as readonly string[]).includes(props.clientId) ? (
          <span className={`px-panel ${styles.client}`} style={{ background: castColour(props.clientId).face }}>
            <PixelPerson who={props.clientId} crop="bust" scale={2} expression="pleased" pose={cheer} label={`${props.client} ${gestureLabel(cheer)}`} />
          </span>
        ) : (
          <ShelfObject jobId={props.jobId} title={props.projectName} client={props.clientId} size={64} />
        )}
        <div className={styles.titles}>
          <h1 className={styles.title}>{props.projectName}</h1>
          <p className={styles.by}>
            <span className={styles.maker} style={{ background: avatarBackground(props.character) }} aria-hidden="true">
              <PixelPerson avatar={props.character} crop="head" scale={1} />
            </span>
            <span>
              By <Link href={`/u/${props.slug}`}>{props.name}</Link>, for {props.client}.
            </span>
          </p>
          <p className={styles.meta}>
            {props.actLabel}
            {date ? `. Shipped ${date}.` : "."}
          </p>
        </div>
      </header>

      <section className={`px-panel ${styles.code}`} aria-label="The code">
        <div className={styles.bar}>
          {names.length > 1 ? (
            <div className={styles.tabs} role="tablist" aria-label="Files">
              {names.map((f) => (
                <button key={f} type="button" role="tab" aria-selected={f === active} className={styles.tab} onClick={() => setActive(f)}>
                  {f}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.fileName}>{active}</p>
          )}
          {running ? (
            <Button variant="danger" icon="stop" onClick={runner.stop}>
              Stop
            </Button>
          ) : (
            <Button variant="run" onClick={run}>
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

      <footer className={styles.made}>
        <p>
          Made in {BRAND.name}. {BRAND.tagline}
        </p>
        <LinkButton href="/" variant="secondary" size="sm">
          Start the first project
        </LinkButton>
      </footer>
    </article>
  );
}
