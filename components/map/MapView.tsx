"use client";

import { duration } from "@/lib/display";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ActSummary, Character, JobSummary, PlacementSummary } from "@/lib/content/types";
import { useSession } from "@/lib/store/session";
import type { JobProgressRow } from "@/lib/store/types";
import { setFlag } from "@/lib/store/progress";
import { dueCards } from "@/lib/review/deck";
import { isDone, isShipped, nextJob, openActs, openBuildings } from "@/lib/progress-rules";
import { BUILDINGS, type Building } from "@/lib/world/map";
import { TownMap, HIDDEN_DENNISES, visibleDennis } from "../world/TownMap";
import { useNight } from "../world/useNight";
import { Portrait } from "../world/Portrait";
import { LinkButton } from "../ui/Button";
import { PassIcon, DotIcon } from "../ui/Icons";
import { Assignments } from "./Assignments";
import styles from "./MapView.module.css";

function statusOf(row: JobProgressRow | undefined): string {
  if (!row || row.status === "not-started") return "Not started";
  if (row.status === "in-progress") return "In progress";
  if (row.status === "shipped-stretch") return "Shipped, with stretch";
  if (row.status === "placed") return "Placed";
  return "Shipped";
}

export function MapView({ acts, characters, placements = [] }: { acts: ActSummary[]; characters: Record<string, Character>; placements?: PlacementSummary[] }) {
  const { store, ready, synced, user, profile } = useSession();
  const router = useRouter();
  const night = useNight();
  const [progress, setProgress] = useState<Record<string, JobProgressRow>>({});
  const [due, setDue] = useState<number | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    // Only once the server's copy is here: on a new device an onboarded learner's profile arrives with the first pull.
    if (ready && user && synced && !profile.onboarded) router.replace("/welcome");
  }, [ready, user, synced, profile.onboarded, router]);

  useEffect(() => {
    if (!store) return;
    const load = async () => {
      const rows = await store.all("job_progress");
      setProgress(Object.fromEntries(rows.map((r) => [r.jobId, r])));
      setDue((await dueCards(store)).length);
      setFound(new Set((await store.all("collectibles")).map((c) => c.key)));
    };
    void load();
    const un1 = store.subscribe("job_progress", () => void load());
    const un2 = store.subscribe("review_cards", () => void load());
    return () => {
      un1();
      un2();
    };
  }, [store]);

  const open = useMemo(() => openActs(acts, progress, placements), [acts, progress, placements]);
  const lit = useMemo(() => openBuildings(acts, progress), [acts, progress]);
  const next = useMemo(() => nextJob(acts, progress, placements), [acts, progress, placements]);
  const allJobs = useMemo(() => acts.flatMap((a) => a.jobs), [acts]);
  const building = BUILDINGS.find((b) => b.id === selected) ?? null;
  const jobsHere = building ? allJobs.filter((j) => j.building === building.id || (building.id === "high-street" && j.building === "high-street")) : [];
  const actOf = (j: JobSummary) => acts.find((a) => a.id === j.act)!;
  const last = profile.lastLocation;
  const lastJob = last ? allJobs.find((j) => j.id === last.jobId) : null;

  const findDennis = async (id: string) => {
    if (!store) return;
    await setFlag(store, "collectibles", id);
    const n = found.size + 1;
    setFound(new Set([...found, id]));
    setNote(n === 1 ? "A rubber duck. It looks a lot like Dennis." : n === HIDDEN_DENNISES.length ? "The twelfth. There's a note from Moss under it." : `Another Dennis. That's ${n} of twelve.`);
  };

  const shipped = allJobs.filter((j) => isShipped(progress[j.id])).length;
  const mapLabel = `A map of Saltmarsh. ${open.size} of ${acts.length} districts open. ${shipped} jobs shipped.`;

  return (
    <div className={styles.layout}>
      <section className={styles.mapCol} aria-labelledby="map-title">
        <div className={styles.titleRow}>
          <h1 id="map-title" className={styles.title}>
            Saltmarsh
          </h1>
          <p className={styles.meta}>
            {shipped === 0 ? "Nothing fixed yet. The workshop is open." : `${shipped} ${shipped === 1 ? "job" : "jobs"} shipped. ${lit.size} ${lit.size === 1 ? "building" : "buildings"} lit.`}
          </p>
        </div>
        <TownMap openBuildings={lit} openActs={open} selected={selected} onSelect={(b: Building) => setSelected(b.id)} foundDennises={found} onFindDennis={(id) => void findDennis(id)} night={night} label={mapLabel} />
        {note ? (
          <p className={styles.note} role="status">
            {note}
          </p>
        ) : null}
        <p className={styles.hint}>Click a building to see its jobs. The list below has everything too.</p>
      </section>

      <aside className={styles.side} aria-label="Today">
        {lastJob && !isShipped(progress[lastJob.id]) ? (
          <section className={styles.panel}>
            <h2 className="label">Continue</h2>
            <p className={styles.panelTitle}>{lastJob.title}</p>
            <LinkButton variant="primary" href={`/job/${lastJob.id}?step=${last!.stepId}`}>
              Back to your desk
            </LinkButton>
          </section>
        ) : next ? (
          <section className={styles.panel}>
            <h2 className="label">Next job</h2>
            <p className={styles.panelTitle}>{next.title}</p>
            <p className={styles.panelMeta}>
              For {characters[next.client]?.name ?? next.client}, about {duration(next.estimatedMinutes)}.
            </p>
            <LinkButton variant="primary" href={`/job/${next.id}`}>
              Start
            </LinkButton>
          </section>
        ) : null}
        <Assignments jobs={allJobs} progress={progress} />
        <section className={styles.panel}>
          <h2 className="label">Morning Rounds</h2>
          {due === null ? null : due === 0 ? (
            <p className={styles.panelMeta}>No repairs to check on today.</p>
          ) : (
            <>
              <p className={styles.panelMeta}>
                {due} old {due === 1 ? "repair" : "repairs"} to check on. About {Math.max(2, Math.round(Math.min(due, 10) * 0.7))} minutes.
              </p>
              <LinkButton variant="secondary" href="/rounds">
                Start the rounds
              </LinkButton>
            </>
          )}
        </section>
        <section className={styles.panel}>
          <h2 className="label">Shelf</h2>
          <p className={styles.panelMeta}>{shipped === 0 ? "Nothing on the shelf yet. Bea's till is first." : `${shipped} ${shipped === 1 ? "thing" : "things"} you've made.`}</p>
          {shipped > 0 ? <Link href="/shelf">Open the Shelf</Link> : null}
        </section>
        {building ? (
          <section className={[styles.panel, styles.building].join(" ")} aria-live="polite">
            <h2 className={styles.buildingName}>{building.name}</h2>
            {!open.has(building.act) ? <p className={styles.panelMeta}>{acts.find((a) => a.id === building.act)?.lockedLine}</p> : null}
            {jobsHere.length === 0 ? <p className={styles.panelMeta}>No jobs here.</p> : null}
            <ul className={styles.jobs}>
              {jobsHere.map((j) => (
                <JobRow key={j.id} j={j} act={actOf(j)} row={progress[j.id]} open={open.has(j.act)} characters={characters} />
              ))}
            </ul>
          </section>
        ) : null}
        {found.size > 0 ? (
          <p className={styles.panelMeta}>
            Dennises found: {found.size} of {HIDDEN_DENNISES.length}.
            {found.size < HIDDEN_DENNISES.length && HIDDEN_DENNISES.filter((d) => visibleDennis(d, open)).every((d) => found.has(d.id)) ? " The rest turn up as the town opens." : ""}
          </p>
        ) : null}
        {open.has("crab-club") ? (
          <p className={styles.panelMeta}>
            <Link href="/league">The Crab League</Link>: this week&apos;s races on the Club Course.
          </p>
        ) : null}
        {profile.experience && profile.experience !== "none" && !open.has("high-street") ? (
          <p className={styles.panelMeta}>
            Written Python before? <Link href="/placement">The placement test</Link> opens the Acts you already know.
          </p>
        ) : null}
        {found.size === HIDDEN_DENNISES.length ? (
          <blockquote className={styles.mossNote}>
            <p>Twelve. I put them out one at a time, over a good many years, to see who&apos;d notice. Most people don&apos;t. Noticing is most of the job.</p>
            <footer>M.</footer>
          </blockquote>
        ) : null}
      </aside>

      <section className={styles.list} aria-labelledby="list-title">
        <h2 id="list-title" className={styles.listTitle}>
          Every district
        </h2>
        {acts.map((act) => (
          <details key={act.id} className={styles.district} open={open.has(act.id) && act.number === Math.max(...[...open].map((id) => acts.find((a) => a.id === id)?.number ?? 1))}>
            <summary className={styles.districtHead}>
              <span className={styles.actNo}>Act {act.number}</span>
              <span className={styles.actTitle}>{act.title}</span>
              <span className={styles.actSubject}>{act.subject}</span>
              <span className={styles.actState}>{open.has(act.id) ? `${act.jobs.filter((j) => isShipped(progress[j.id])).length} of ${act.jobs.length} shipped` : "Not open yet"}</span>
            </summary>
            {!open.has(act.id) ? <p className={styles.locked}>{act.lockedLine}</p> : null}
            <ol className={styles.jobs}>
              {act.jobs.map((j) => (
                <JobRow key={j.id} j={j} act={act} row={progress[j.id]} open={open.has(act.id)} characters={characters} />
              ))}
            </ol>
          </details>
        ))}
      </section>
    </div>
  );
}

function JobRow({ j, act, row, open, characters }: { j: JobSummary; act: ActSummary; row: JobProgressRow | undefined; open: boolean; characters: Record<string, Character> }) {
  const shipped = isDone(row);
  const playable = open && j.status === "written";
  const client = characters[j.client];
  return (
    <li className={styles.job}>
      <span className={styles.jobPortrait}>{client ? <Portrait sprite={client.sprite} size={32} /> : null}</span>
      <span className={styles.jobMain}>
        {playable ? (
          <Link href={`/job/${j.id}`} className={styles.jobTitle}>
            {j.title}
          </Link>
        ) : (
          <span className={[styles.jobTitle, styles.dim].join(" ")}>{j.title}</span>
        )}
        <span className={styles.jobMeta}>
          {j.sidequest ? "Sidequest, optional. " : ""}
          {client?.name ?? j.client}. {j.status === "written" ? `About ${duration(j.estimatedMinutes)}.` : "Being written."}
        </span>
      </span>
      <span className={styles.jobState}>
        {shipped ? (
          <span className={styles.shipped}>
            <PassIcon /> {statusOf(row)}
          </span>
        ) : row?.status === "in-progress" ? (
          <span className={styles.progress}>
            <DotIcon /> In progress
          </span>
        ) : null}
      </span>
    </li>
  );
}
