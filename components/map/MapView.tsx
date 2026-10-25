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
import { Head } from "../world/CharacterPortrait";
import { Button, LinkButton } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { BRAND } from "@/lib/brand";
import { useMedia } from "@/lib/useMedia";
import { usePlan } from "@/lib/usePlan";
import { FREE_ACTS } from "@/lib/plans";
import { Assignments } from "./Assignments";
import { CertificateButton } from "../certificates/CertificateButton";
import styles from "./MapView.module.css";

const VIEW_KEY = "fixwick-map-view";

/** The status stamp on a project ticket: none, in progress, SHIPPED, SHIPPED+ for stretch done. */
function stampOf(row: JobProgressRow | undefined): { text: string; label: string; kind: "none" | "progress" | "shipped" } {
  if (!row || row.status === "not-started") return { text: "", label: "Not started", kind: "none" };
  if (row.status === "in-progress") return { text: "IN PROGRESS", label: "In progress", kind: "progress" };
  if (row.status === "shipped-stretch") return { text: "SHIPPED+", label: "Shipped, with stretch", kind: "shipped" };
  if (row.status === "placed") return { text: "PLACED", label: "Placed", kind: "shipped" };
  return { text: "SHIPPED", label: "Shipped", kind: "shipped" };
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
  const [view, setView] = useState<"map" | "logbook">("map");
  const [zoom, setZoom] = useState(3);
  const phone = useMedia("(max-width: 900px)");
  const { status: plan } = usePlan();
  // Districts that need Pro keep a padlock on the map until the learner has it (REDESIGN.md 8.4).
  const proLocked = useMemo(() => (plan && !plan.access.pro ? new Set(acts.filter((a) => !FREE_ACTS.has(a.id)).map((a) => a.id)) : new Set<string>()), [plan, acts]);

  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_KEY) === "logbook") setView("logbook");
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    if (phone) setZoom(2);
  }, [phone]);
  const pickView = (v: "map" | "logbook") => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // ignore
    }
  };

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
  const mapLabel = `A map of ${BRAND.townName}. ${open.size} of ${acts.length} districts open. ${shipped} projects shipped.`;
  const latestOpen = Math.max(...[...open].map((id) => acts.find((a) => a.id === id)?.number ?? 1));

  return (
    <div className={styles.layout}>
      <section className={styles.mapCol} aria-labelledby="map-title">
        <div className={styles.titleRow}>
          <h1 id="map-title" className={styles.title}>
            {BRAND.townName}
          </h1>
          <p className={styles.meta}>
            {shipped === 0 ? "Nothing fixed yet. The workshop is open." : `${shipped} shipped. ${lit.size} ${lit.size === 1 ? "building" : "buildings"} lit.`}
          </p>
          <div className={styles.tools}>
            <div className={styles.toggle} role="radiogroup" aria-label="View">
              <button role="radio" aria-checked={view === "map"} onClick={() => pickView("map")}>
                <PixelIcon name="map" /> Map
              </button>
              <button role="radio" aria-checked={view === "logbook"} onClick={() => pickView("logbook")}>
                <PixelIcon name="shelf" /> Logbook
              </button>
            </div>
            {view === "map" ? (
              <div className={styles.zoom} role="group" aria-label="Zoom">
                <button onClick={() => setZoom((z) => Math.max(2, z - 1))} disabled={zoom <= 2} aria-label="Zoom out">
                  -
                </button>
                <span aria-live="polite">{zoom}x</span>
                <button onClick={() => setZoom((z) => Math.min(4, z + 1))} disabled={zoom >= 4} aria-label="Zoom in">
                  +
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {view === "map" ? (
          <>
            <div className={styles.sea}>
              <TownMap
                openBuildings={lit}
                openActs={open}
                selected={selected}
                onSelect={(b: Building) => setSelected(b.id)}
                foundDennises={found}
                onFindDennis={(id) => void findDennis(id)}
                night={night}
                label={mapLabel}
                zoom={zoom}
                lockedActs={proLocked}
              />
            </div>
            {note ? (
              <p className={styles.note} role="status">
                {note}
              </p>
            ) : null}
            <p className={styles.hint}>Click a building to see its projects. Drag to look around. The Logbook lists everything.</p>
          </>
        ) : (
          <Logbook acts={acts} open={open} progress={progress} characters={characters} latestOpen={latestOpen} />
        )}
      </section>

      <aside className={styles.side} aria-label={building ? building.name : "Today"}>
        {building ? (
          <section className={`frame-panel ${styles.sheet}`} aria-live="polite">
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle}>{building.name}</h2>
              <Button size="sm" variant="quiet" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
            {proLocked.has(building.act) ? (
              <div className={styles.proNote}>
                <p className={styles.locked}>
                  <PixelIcon name="lock" /> Part of Pro. The first project&apos;s Ask is a free preview.
                </p>
                <LinkButton href="/pricing" variant="primary" size="sm">
                  See Pro
                </LinkButton>
              </div>
            ) : !open.has(building.act) ? (
              <p className={styles.locked}>
                <PixelIcon name="lock" /> {acts.find((a) => a.id === building.act)?.lockedLine}
              </p>
            ) : null}
            {jobsHere.length === 0 ? <p className={styles.panelMeta}>No projects here.</p> : null}
            <ul className={styles.tickets}>
              {jobsHere.map((j) => (
                <ProjectTicket key={j.id} j={j} row={progress[j.id]} open={open.has(j.act)} characters={characters} actNumber={actOf(j).number} pro={proLocked.has(j.act)} />
              ))}
            </ul>
          </section>
        ) : (
          <>
            {lastJob && !isShipped(progress[lastJob.id]) ? (
              <section className={`frame-panel ${styles.panel}`}>
                <h2 className={styles.panelHead}>Continue</h2>
                <p className={styles.panelTitle}>{lastJob.title}</p>
                <LinkButton variant="primary" href={`/job/${lastJob.id}?step=${last!.stepId}`}>
                  Back to your desk
                </LinkButton>
              </section>
            ) : next ? (
              <section className={`frame-panel ${styles.panel}`}>
                <h2 className={styles.panelHead}>Next project</h2>
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
            <section className={`frame-panel ${styles.panel}`}>
              <h2 className={styles.panelHead}>Morning Rounds</h2>
              {due === null ? null : due === 0 ? (
                <p className={styles.panelMeta}>No repairs to check on today.</p>
              ) : (
                <>
                  <p className={styles.panelMeta}>
                    {due} old {due === 1 ? "repair" : "repairs"} to check on. About {Math.max(2, Math.round(Math.min(due, 10) * 0.7))} minutes.
                  </p>
                  <LinkButton variant="quiet" href="/rounds">
                    Start the rounds
                  </LinkButton>
                </>
              )}
            </section>
            <section className={`frame-panel ${styles.panel}`}>
              <h2 className={styles.panelHead}>Shelf</h2>
              <p className={styles.panelMeta}>{shipped === 0 ? "Nothing on the shelf yet." : `${shipped} ${shipped === 1 ? "thing" : "things"} you've made.`}</p>
              {shipped > 0 ? (
                <LinkButton variant="quiet" href="/shelf">
                  Open the Shelf
                </LinkButton>
              ) : null}
            </section>
          </>
        )}
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
          <blockquote className={`frame-paper ${styles.mossNote}`}>
            <p>Twelve. I put them out one at a time, over a good many years, to see who&apos;d notice. Most people don&apos;t. Noticing is most of the job.</p>
            <footer>M.</footer>
          </blockquote>
        ) : null}
      </aside>
    </div>
  );
}

/** A project as a small paper ticket: title, the client's head, time, and a status stamp. */
function ProjectTicket({ j, row, open, characters, actNumber, pro = false }: { j: JobSummary; row: JobProgressRow | undefined; open: boolean; characters: Record<string, Character>; actNumber: number; pro?: boolean }) {
  const playable = open && j.status === "written";
  const client = characters[j.client];
  const stamp = stampOf(row);
  const inner = (
    <>
      <span className={styles.ticketTop}>
        <Head id={j.client} sprite={client?.sprite} scale={2} />
        <span className={styles.ticketTitle}>{j.title}</span>
      </span>
      <span className={styles.ticketMeta}>
        {pro ? <span className={styles.proTag}>Pro</span> : null}
        {j.sidequest ? "Sidequest. " : ""}For {client?.name ?? j.client}. {j.status === "written" ? `About ${duration(j.estimatedMinutes)}.` : "Being written."} Act {actNumber}.
      </span>
      {stamp.text ? (
        <span className={[styles.stamp, stamp.kind === "progress" ? styles.stampProgress : ""].join(" ")} aria-hidden="true">
          {stamp.text}
        </span>
      ) : null}
      <span className="visually-hidden">{stamp.label}.</span>
    </>
  );
  return (
    <li className={`frame-paper ${styles.ticket}`}>
      {playable ? (
        <Link href={`/job/${j.id}`} className={styles.ticketLink}>
          {inner}
        </Link>
      ) : (
        <span className={[styles.ticketLink, styles.dim].join(" ")}>
          {!open ? <PixelIcon name="lock" /> : null}
          {inner}
        </span>
      )}
    </li>
  );
}

/** The list view, styled as a logbook: every district and project, in ruled columns. */
function Logbook({ acts, open, progress, characters, latestOpen }: { acts: ActSummary[]; open: Set<string>; progress: Record<string, JobProgressRow>; characters: Record<string, Character>; latestOpen: number }) {
  return (
    <div className={`frame-paper ${styles.logbook}`}>
      <h2 className={styles.logTitle}>Logbook</h2>
      {acts.map((act) => (
        <details key={act.id} className={styles.district} open={open.has(act.id) && act.number === latestOpen}>
          <summary className={styles.districtHead}>
            <span className={styles.actNo}>Act {act.number}</span>
            <span className={styles.actTitle}>{act.title}</span>
            <span className={styles.actState}>
              {open.has(act.id) ? `${act.jobs.filter((j) => isShipped(progress[j.id])).length} of ${act.jobs.length} shipped` : "Not open yet"}
            </span>
          </summary>
          <p className={styles.actSubject}>{act.subject}.</p>
          {!FREE_ACTS.has(act.id) && act.jobs.filter((j) => !j.sidequest && !j.placementFor && j.status === "written").every((j) => isDone(progress[j.id])) ? (
            <p className={styles.actSubject}>
              Every project shipped. <CertificateButton actId={act.id} />
            </p>
          ) : null}
          {!open.has(act.id) ? <p className={styles.lockedLine}>{act.lockedLine}</p> : null}
          <table className={styles.log}>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Project</th>
                <th scope="col">For</th>
                <th scope="col">Time</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {act.jobs.map((j, i) => {
                const playable = open.has(act.id) && j.status === "written";
                const row = progress[j.id];
                return (
                  <tr key={j.id}>
                    <td>{j.sidequest ? "-" : i + 1}</td>
                    <td>{playable ? <Link href={`/job/${j.id}`}>{j.title}</Link> : <span className={styles.dim}>{j.title}</span>}</td>
                    <td>{characters[j.client]?.name ?? j.client}</td>
                    <td>{j.status === "written" ? duration(j.estimatedMinutes) : "Being written"}</td>
                    <td>{isDone(row) ? <span className={styles.logStamp}>{stampOf(row).text}</span> : stampOf(row).label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>
      ))}
    </div>
  );
}
