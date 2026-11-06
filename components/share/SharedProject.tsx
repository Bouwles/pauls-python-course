"use client";

// A learner's shipped project, runnable in the page. Read only: it's theirs.
// The classmate it was made for stands at the top, celebrating it in a way of their own (a
// different one each visit, lib/pixel/variety.ts); the learner signs it, drawn as themselves or as
// the classmate they play as. It opens from a share link (/share/#..., ShareView.tsx) or, on the
// local version, from a public profile (/u/<address>/<project>).
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

const isCastId = (id: string | null | undefined): id is string => Boolean(id && (CAST_IDS as readonly string[]).includes(id));

export function SharedProjectView(props: {
  /** Their public profile's address, on the local version: their name links to it. */
  slug?: string;
  name: string;
  character: unknown;
  /** The classmate they play as, drawn in their place. */
  playAs?: string | null;
  /** "Playing as Neil", beside their name. */
  playingAs?: string | null;
  jobId: string;
  projectName: string;
  clientId: string;
  client: string;
  actLabel: string;
  files: Files;
  entry: string;
  /** The project's data files; null while they load. */
  data: Files | null;
  shippedAt: string | number | null;
  /** A line under the code, such as code cut short for the link. */
  note?: string | null;
  /** Something above the title, such as the way back to their Shelf. */
  back?: React.ReactNode;
}) {
  const runner = useRunner();
  const visit = useVisit();
  // A plain cheer until the visit's seed arrives, so the page hydrates as it was sent.
  const cheer = visit ? pickGesture({ who: props.clientId, tags: ["celebrate", "approve"], seed: `share|${visit}|${props.jobId}`, mode: "moment" }) : "cheer";
  const names = Object.keys(props.files);
  const [active, setActive] = useState(names.includes(props.entry) ? props.entry : (names[0] ?? props.entry));
  const running = runner.state.phase === "running" || runner.state.phase === "starting";
  const ready = props.data !== null;
  const run = () => {
    if (ready) void runner.run({ ...props.data, ...props.files }, props.entry);
  };
  const date = props.shippedAt ? new Date(props.shippedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  const cast = isCastId(props.playAs) ? props.playAs : null;
  return (
    <article className={styles.page}>
      {props.back}
      <header className={styles.head}>
        {isCastId(props.clientId) ? (
          <span className={`px-panel ${styles.client}`} style={{ background: castColour(props.clientId).face }}>
            <PixelPerson who={props.clientId} crop="bust" scale={2} expression="pleased" pose={cheer} label={`${props.client} ${gestureLabel(cheer)}`} />
          </span>
        ) : (
          <ShelfObject jobId={props.jobId} title={props.projectName} client={props.clientId} size={64} />
        )}
        <div className={styles.titles}>
          <h1 className={styles.title}>{props.projectName}</h1>
          <p className={styles.by}>
            <span className={styles.maker} style={{ background: cast ? castColour(cast).face : avatarBackground(props.character) }} aria-hidden="true">
              <PixelPerson who={cast ?? undefined} avatar={cast ? undefined : props.character} crop="head" scale={1} />
            </span>
            <span>
              By {props.slug ? <Link href={`/u/${props.slug}`}>{props.name}</Link> : props.name}, for {props.client}.{props.playingAs ? ` ${props.playingAs}.` : ""}
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
            <Button variant="run" onClick={run} disabled={!ready}>
              {ready ? "Run it" : "Getting its files"}
            </Button>
          )}
        </div>
        <div className={styles.well}>
          <div className={styles.editor}>
            <Editor docKey={`share/${props.jobId}/${props.name}/${active}`} value={props.files[active] ?? ""} readOnly label={`${props.projectName}, ${active}`} onRun={run} />
          </div>
          <div className={styles.console}>
            <Console state={runner.state} source={props.files[props.entry] ?? ""} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
          </div>
        </div>
      </section>
      {props.note ? <p className={styles.meta}>{props.note}</p> : null}

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
