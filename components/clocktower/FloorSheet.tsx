"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { ActSummary, JobSummary, PlacementSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { duration } from "@/lib/display";
import { isDone } from "@/lib/progress-rules";
import { FREE_ACTS } from "@/lib/plans";
import { Button, LinkButton } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";
import { Portrait } from "../art/Portrait";
import { ShelfObject } from "../art/ShelfObject";
import { CertificateButton } from "../certificates/CertificateButton";
import { FloorArt } from "./FloorArt";
import { floorName, jobBadge, mainJobs, type Floor } from "./floors";
import type { FloorInfo } from "./Clocktower";
import styles from "./FloorSheet.module.css";

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/** "Caitlin's floor", "Aaesha and Neil's floor", "Everyone's floor". */
export function residentsLine(floor: Floor, names: Record<string, string>): string {
  const n = floor.residents.map((r) => names[r] ?? cap(r));
  if (n.length > 2) return "Everyone's floor";
  return `${n.join(" and ")}'s floor`;
}

/** The project that opens a floor: the last written, numbered project on the floor below. */
export function opener(acts: ActSummary[], act: ActSummary): JobSummary | null {
  const below = acts.find((a) => a.number === act.number - 1);
  if (!below) return null;
  return [...below.jobs].reverse().find((j) => j.status === "written" && !j.sidequest) ?? null;
}

/**
 * The side sheet for one floor (REDESIGN-2.md 5.2): the floor's art, who lives there, and its
 * projects as cards. Pro floors list every project with a "Pro" badge and "Get Pro" at the foot.
 * A native modal dialog: focus moves in and comes back, Escape and the backdrop close it.
 */
export function FloorSheet({ info, progress, names, acts, placements, onClose }: { info: FloorInfo | null; progress: Record<string, JobProgressRow>; names: Record<string, string>; acts: ActSummary[]; placements: PlacementSummary[]; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (info && !d.open) {
      d.showModal();
      // Start on Close rather than on the scrolling list.
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!info && d.open) d.close();
  }, [info]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-labelledby="floor-sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {info ? <SheetBody info={info} progress={progress} names={names} acts={acts} placements={placements} onClose={close} /> : null}
    </dialog>
  );
}

function SheetBody({ info, progress, names, acts, placements, onClose }: { info: FloorInfo; progress: Record<string, JobProgressRow>; names: Record<string, string>; acts: ActSummary[]; placements: PlacementSummary[]; onClose: () => void }) {
  const { floor, act, stats, state, open, pro } = info;
  const first = opener(acts, act);
  const canPlace = placements.some((p) => p.act === acts.find((a) => a.number === act.number - 1)?.id);
  const allDone = mainJobs(act).filter((j) => j.status === "written").every((j) => isDone(progress[j.id]));
  return (
    <div className={styles.inner}>
      <div className={styles.top}>
        <FloorArt act={floor.act} state={state} names={names} bare className={styles.banner} />
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <div className={styles.headRow}>
            <p className="label">{floorName(floor, act.subject)}</p>
            <Button variant="ghost" size="sm" icon="close" aria-label="Close" className={styles.close} onClick={onClose} data-autofocus />
          </div>
          <h2 id="floor-sheet-title" className={styles.title}>
            {floor.room}
          </h2>
          <p className={styles.residents}>
            <span className={styles.faces} aria-hidden="true">
              {floor.residents.map((r) => (
                <Portrait key={r} who={r} name={names[r] ?? cap(r)} size={28} className={styles.face} />
              ))}
            </span>
            <span>
              {residentsLine(floor, names)}. {stats.shipped} of {stats.total} shipped.
            </span>
          </p>
        </div>

        {!open ? (
          <div className={styles.note}>
            <Icon name="lock" />
            <p>
              {act.lockedLine}
              {first ? ` Opens when you ship ${first.title}.` : ""}
              {canPlace ? (
                <>
                  {" "}
                  Or <Link href="/placement">take the placement test</Link>.
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        {!FREE_ACTS.has(act.id) && stats.written > 0 && allDone ? (
          <div className={styles.note}>
            <Icon name="medal" />
            <p>Every project on this floor is shipped.</p>
            <CertificateButton actId={act.id} />
          </div>
        ) : null}

        <ul className={styles.cards} aria-label="Projects on this floor">
          {act.jobs.map((j) => (
            <ProjectCard key={j.id} j={j} row={progress[j.id]} open={open} pro={pro} />
          ))}
        </ul>
      </div>

      {pro ? (
        <div className={styles.foot}>
          <p>Part of Pro. The first project&apos;s Ask is a free preview.</p>
          <LinkButton href="/pricing" variant="primary">
            Get Pro
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}

/** A project card: its Shelf object, name, one line on what it does, time and status. */
function ProjectCard({ j, row, open, pro }: { j: JobSummary; row: JobProgressRow | undefined; open: boolean; pro: boolean }) {
  const playable = open && j.status === "written";
  const status = jobBadge(row, j);
  const showStatus = !(pro && status.text === "Not started");
  const inner = (
    <>
      <ShelfObject jobId={j.id} title={j.title} client={j.client} size={44} />
      <span className={styles.cardText}>
        <span className={styles.cardName}>{j.title}</span>
        <span className={styles.cardLine}>{j.summary}</span>
        <span className={styles.cardMeta}>
          {pro ? <Badge tone="pro">Pro</Badge> : null}
          {!open && !pro ? (
            <Badge tone="neutral">
              <Icon name="lock" size={14} />
              Locked
            </Badge>
          ) : showStatus ? (
            <Badge tone={status.tone}>{status.text}</Badge>
          ) : null}
          {j.sidequest ? <span>Sidequest</span> : null}
          {j.status === "written" ? <span>About {duration(j.estimatedMinutes)}</span> : null}
        </span>
      </span>
    </>
  );
  return (
    <li>
      {playable ? (
        <Link href={`/job/${j.id}`} className={[styles.card, styles.cardLink].join(" ")}>
          {inner}
        </Link>
      ) : (
        <div className={styles.card} data-dim={!open || undefined}>
          {inner}
        </div>
      )}
    </li>
  );
}
