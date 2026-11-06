"use client";

// /share/#<link>: one shipped project, or someone's whole Shelf, from a link they sent
// (lib/share-links.ts). A project opens read only with "Run it", in the same editor and console
// as everywhere else; its data files come from this site (app/share/data). A Shelf lists what
// they've shipped, by Act, and each project whose code came with the link opens in the page.
import { useEffect, useMemo, useRef, useState } from "react";
import { BASE } from "@/lib/static";
import type { Files } from "@/lib/python/protocol";
import { decodeShare, playingAsLine, type Maker, type ProjectLink, type ShelfEntry, type ShelfLink } from "@/lib/share-links";
import { CAST_IDS, castColour, floorFor } from "@/lib/cast";
import { avatarBackground } from "@/lib/pixel/looks";
import { oneOf } from "@/lib/moments";
import type { Expression } from "@/lib/pixel/people";
import { PixelPerson } from "../art/PixelPerson";
import { ShelfObject } from "../art/ShelfObject";
import { Button } from "../ui/Button";
import { useHash } from "../classes/shared";
import { SharedProjectView } from "./SharedProject";
import { ShareTrouble } from "./Trouble";
import shelf from "../profile/PublicShelf.module.css";
import styles from "./Share.module.css";

/** What the page needs to know about each project that can be on a Shelf. */
export type ShareCourse = Record<string, { name: string; clientId: string; client: string; act: number; actName: string; entry: string; data: boolean }>;

const isCastId = (id: string | null | undefined): id is string => Boolean(id && (CAST_IDS as readonly string[]).includes(id));
const PLEASED: Expression[] = ["pleased", "laughing", "proud", "excited", "relieved"];

/** The project's data files, fetched once it's open; an empty set when it has none. */
function useData(jobId: string, has: boolean): { data: Files | null; failed: boolean } {
  const [got, setGot] = useState<{ id: string; data: Files | null; failed: boolean }>({ id: jobId, data: has ? null : {}, failed: false });
  useEffect(() => {
    if (!has) {
      setGot({ id: jobId, data: {}, failed: false });
      return;
    }
    let gone = false;
    setGot({ id: jobId, data: null, failed: false });
    fetch(`${BASE}/share/data/${jobId}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Files>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => !gone && setGot({ id: jobId, data, failed: false }))
      .catch(() => !gone && setGot({ id: jobId, data: {}, failed: true }));
    return () => {
      gone = true;
    };
  }, [jobId, has]);
  return got.id === jobId ? got : { data: has ? null : {}, failed: false };
}

export function ShareView({ course, names }: { course: ShareCourse; names: Record<string, string> }) {
  const hash = useHash();
  const decoded = useMemo(() => (hash === null ? null : decodeShare(hash, ["project", "shelf"])), [hash]);
  if (!decoded) return <p className={styles.quiet}>Reading the link.</p>;
  if (!decoded.ok) return <ShareTrouble problem={decoded.problem} kind={decoded.kind} hash={hash ?? ""} what="project" />;
  const shared = decoded.value;
  if (shared.kind === "project") return <OneProject key={hash} link={shared.value} course={course} names={names} />;
  if (shared.kind === "shelf") return <SharedShelf key={hash} link={shared.value} course={course} names={names} />;
  return null;
}

function OneProject({ link, course, names, back }: { link: ProjectLink | (ShelfEntry & { maker: Maker; cut?: boolean }); course: ShareCourse; names: Record<string, string>; back?: React.ReactNode }) {
  const info = course[link.jobId];
  const { data, failed } = useData(link.jobId, Boolean(info?.data));
  const files: Files = Object.fromEntries((link.files ?? []).map((f) => [f.name, f.content]));
  const entry = info?.entry && files[info.entry] !== undefined ? info.entry : (Object.keys(files)[0] ?? "main.py");
  const notes = [
    "cut" in link && link.cut ? "Some of the code was cut short to keep the link a sensible length, so it may not run as it did for them." : null,
    failed ? "Its data files didn't load, so it may stop where it reads them. Reload the page to try again." : null,
    info ? null : "This project isn't in this version of the course, so it runs without any data files it needs.",
    Object.keys(files).length ? null : "There's no code in this link: this one was built on their own computer.",
  ].filter(Boolean);
  return (
    <SharedProjectView
      name={link.maker.name}
      character={link.maker.look}
      playAs={link.maker.playAs}
      playingAs={playingAsLine(link.maker, names)}
      jobId={link.jobId}
      projectName={info?.name ?? link.jobId}
      clientId={info?.clientId ?? ""}
      client={info?.client ?? "a classmate"}
      actLabel={info ? `Act ${info.act}, ${info.actName}` : "A project from another version of the course"}
      files={files}
      entry={entry}
      data={data}
      shippedAt={link.shippedAt}
      note={notes.join(" ") || null}
      back={back}
    />
  );
}

/** The maker at the top of their Shelf: drawn as themselves, or as the classmate they play as. */
function MakerFace({ maker }: { maker: Maker }) {
  const cast = isCastId(maker.playAs) ? maker.playAs : null;
  return (
    <span className={`px-panel ${shelf.avatar}`} style={{ background: cast ? castColour(cast).face : avatarBackground(maker.look) }}>
      <PixelPerson who={cast ?? undefined} avatar={cast ? undefined : maker.look} crop="bust" scale={3} expression="pleased" label={`${maker.name}'s look`} />
    </span>
  );
}

function SharedShelf({ link, course, names }: { link: ShelfLink; course: ShareCourse; names: Record<string, string> }) {
  const [open, setOpen] = useState<string | null>(null);
  const { maker } = link;
  const playing = playingAsLine(maker, names);
  const acts = useMemo(() => {
    const byAct = new Map<number, { number: number; title: string; items: ShelfEntry[] }>();
    for (const i of link.items) {
      const info = course[i.jobId];
      const n = info?.act ?? 0;
      if (!byAct.has(n)) byAct.set(n, { number: n, title: info ? info.actName : "From another version of the course", items: [] });
      byAct.get(n)!.items.push(i);
    }
    return [...byAct.values()].sort((a, b) => (a.number || 99) - (b.number || 99));
  }, [link.items, course]);

  // A project opened from the Shelf: back is the Shelf, where it was.
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (open) {
      last.current = open;
      window.scrollTo({ top: 0 });
    } else if (last.current) document.getElementById(`shared-${last.current}`)?.focus();
  }, [open]);

  const opened = link.items.find((i) => i.jobId === open && i.files);
  if (opened)
    return (
      <OneProject
        link={{ ...opened, maker }}
        course={course}
        names={names}
        back={
          <div>
            <Button variant="ghost" size="sm" icon="caretLeft" onClick={() => setOpen(null)}>
              Back to {maker.name}&apos;s Shelf
            </Button>
          </div>
        }
      />
    );

  const withCode = link.items.filter((i) => i.files).length;
  return (
    <div className={shelf.layout}>
      <header className={shelf.who}>
        <MakerFace maker={maker} />
        <div className={shelf.text}>
          <h1 className={shelf.name}>{maker.name}&apos;s Shelf</h1>
          <p className={shelf.line}>
            {link.items.length} {link.items.length === 1 ? "project" : "projects"} shipped{playing ? `. ${playing}` : ""}.
          </p>
          {link.items.length ? (
            <p className={styles.shelfNote}>
              {withCode === link.items.length ? "Open any of them to read the code and run it." : withCode ? "Open the ones with their code here to read it and run it." : "The code didn't fit in this link. Ask them to share a project on its own to see it run."}
            </p>
          ) : null}
        </div>
      </header>

      {acts.map((act) => (
        <section key={act.number} className={shelf.act} aria-labelledby={`act-${act.number}`}>
          <h2 id={`act-${act.number}`} className={shelf.actTitle}>
            <span className={shelf.marker} style={{ background: castColour(floorFor(act.number)?.residents[0] ?? "").face }} aria-hidden="true" />
            {act.number ? `Act ${act.number}: ${act.title}` : act.title}
          </h2>
          <ul className={shelf.grid}>
            {act.items.map((i) => {
              const info = course[i.jobId];
              const name = info?.name ?? i.jobId;
              const inner = (
                <>
                  {info && isCastId(info.clientId) ? (
                    <span className={shelf.client} style={{ background: castColour(info.clientId).face }} aria-hidden="true">
                      <PixelPerson who={info.clientId} crop="head" scale={2} expression={oneOf(PLEASED, `${maker.name}|${i.jobId}`)} />
                    </span>
                  ) : (
                    <ShelfObject jobId={i.jobId} title={name} client={info?.clientId ?? ""} size={64} />
                  )}
                  <span className={shelf.cardText}>
                    <span className={i.files ? styles.openName : shelf.project}>{name}</span>
                    <span className={shelf.meta}>
                      {info ? `For ${info.client}` : "Not in this version of the course"}
                      {i.files ? "" : ". Code not in this link"}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={i.jobId}>
                  {i.files ? (
                    <button type="button" id={`shared-${i.jobId}`} className={["px-panel", shelf.card, styles.open].join(" ")} onClick={() => setOpen(i.jobId)}>
                      {inner}
                    </button>
                  ) : (
                    <div className={`px-panel ${shelf.card}`}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
