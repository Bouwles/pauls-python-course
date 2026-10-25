"use client";

import { useEffect, useState } from "react";
import { duration, jobLabel } from "@/lib/display";
import { Head } from "../world/CharacterPortrait";
import { SpriteFrame } from "../world/SpriteFrame";
import { useWorkbench } from "./context";
import styles from "./Ticket.module.css";

const SPEC_KEY = "fixwick-ticket-spec";

/** The drawing-pin from the interface kit, pinned through the paper's top edge. */
function Tack() {
  return <SpriteFrame sprite="tack" scale={2} className={styles.tack} />;
}

/**
 * The job ticket (REDESIGN.md 5.1): the brief on a pinned paper ticket in the left column.
 * The top half is the job (who it's for, what it does, an example run); below the torn edge
 * is this step. Every step renders its brief inside one of these.
 */
export function Ticket({
  children,
  full = false,
  pinIn = false,
  stamp = null,
  thud = false,
}: {
  children: React.ReactNode;
  /** The Ask: the whole job, always open. */
  full?: boolean;
  /** Slide in and pin itself (the end of the Ask cutscene). */
  pinIn?: boolean;
  /** A rubber stamp across the ticket once the job ships. */
  stamp?: string | null;
  /** Stamp it now, with the thud and the dust (otherwise it's just there). */
  thud?: boolean;
}) {
  const { job, areas, characters, ticketFolded, setTicketFolded } = useWorkbench();
  const ask = job.steps.find((s) => s.type === "ask");
  const client = job.client !== "moss" ? (characters[job.client]?.name ?? job.client) : null;
  const [specOpen, setSpecOpen] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(SPEC_KEY) === "closed") setSpecOpen(false);
    } catch {
      // ignore
    }
  }, []);

  const toggleSpec = (open: boolean) => {
    setSpecOpen(open);
    try {
      localStorage.setItem(SPEC_KEY, open ? "open" : "closed");
    } catch {
      // ignore
    }
  };

  return (
    <div className={areas.brief}>
      {ticketFolded ? (
        <button className={styles.unfold} onClick={() => setTicketFolded(false)} aria-expanded="false" title="Show the job ticket">
          <span className={styles.unfoldLabel}>Ticket</span>
        </button>
      ) : null}
      <article className={["frame-paper", styles.ticket, pinIn ? styles.pinIn : ""].join(" ")} aria-labelledby="ticket-title" hidden={ticketFolded}>
        <Tack />
        {stamp ? (
          <p className={[styles.stamp, thud ? styles.thud : ""].join(" ")} role="status">
            {stamp}
            {thud ? <span className={styles.dust} aria-hidden="true" /> : null}
          </p>
        ) : null}
        <header className={styles.head}>
          <h1 id="ticket-title" className={styles.title}>
            {job.title}
          </h1>
          <button className={styles.fold} onClick={() => setTicketFolded(true)} aria-expanded="true" title="Fold the ticket away">
            <span aria-hidden="true">&lt;</span>
            <span className="visually-hidden">Fold the ticket away</span>
          </button>
        </header>
        <p className={styles.meta}>
          {client ? (
            <span className={styles.client}>
              <Head id={job.client} sprite={characters[job.client]?.sprite} scale={2} />
              <span>For {client}</span>
            </span>
          ) : (
            <span className={styles.client}>
              <Head id="moss" sprite="moss" scale={2} />
              <span>For Moss</span>
            </span>
          )}
          <span>
            {jobLabel(job)}, about {duration(job.estimatedMinutes)}
          </span>
        </p>
        {ask && ask.type === "ask" ? (
          full ? (
            <Spec html={ask.specHtml} example={ask.example} />
          ) : (
            <details className={styles.spec} open={specOpen} onToggle={(e) => toggleSpec((e.currentTarget as HTMLDetailsElement).open)}>
              <summary>What it does</summary>
              <Spec html={ask.specHtml} example={ask.example} />
            </details>
          )
        ) : null}
        <hr className={styles.torn} />
        <div className={styles.step}>{children}</div>
      </article>
    </div>
  );
}

function Spec({ html, example }: { html: string; example: string | null }) {
  return (
    <div className={styles.specBody}>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      {example ? (
        <>
          <h3 className={styles.sub}>Example run</h3>
          <pre className={styles.example}>{example}</pre>
        </>
      ) : null}
    </div>
  );
}
