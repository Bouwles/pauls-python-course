"use client";

// The Arcade League (Section 13.5): a weekly race on the Arcade course for policies trained in
// Act 8, run by the classmates who live on the Arcade floor (Aaesha and Caitlin). They host it in
// person: they introduce the race, one after the other, and react to where your entry finished.
// The hosts' gestures, and how the one not talking listens, are chosen per line and per visit
// (lib/pixel/variety.ts). When you're playing as one of the hosts, someone else hosts in your
// place with your lines (lib/playas.ts).
//
// It needs no server, so it's the same on GitHub Pages as in the local version:
// - Entering races your league.json here and then, on the week's seeds, and keeps it in this
//   browser (lib/league/local.ts). Every race is seeded, so the replay is the race that was scored.
// - The Arcade's table has the cast's entries too (lib/league/cast.ts), so there's always a time
//   to beat. Whoever you play as races as you, not twice.
// - With a class, the table becomes the class's: the table your teacher shared, or for a class
//   you teach, the register (lib/classes/league.ts). A League table link (/league/#...) shows a
//   class's standings, and where you stand on it.
// - In the local version, a signed-in learner's entry also goes to the server, as before, and
//   everyone the server has raced this week joins the Arcade's table.
import { useCallback, useEffect, useMemo, useState } from "react";
import { STATIC } from "@/lib/static";
import { useSession } from "@/lib/store/session";
import { isCast, speakersOf } from "@/lib/playas";
import { baselinePolicy, courseJson, hash, isoWeek, MAX_STEPS, movesWithoutSlips, previousWeek, race, RACES, SLIP_POOL, SLIP_SAND, weekName, weekStart, type Policy } from "@/lib/league/course";
import { castRows } from "@/lib/league/cast";
import { dropEntry, entryFor, loadEntries, putEntry, raceEntry, saveEntries, scoreOf, useMyEntries } from "@/lib/league/local";
import { ordinal, placeAmong, rankRows, type PlacedRow, type TableRow } from "@/lib/league/table";
import { joinedRows, registerRows, sharedRows } from "@/lib/classes/league";
import { decodeTable } from "@/lib/classes/link";
import { loadBook, putTable, saveBook, useClassBook } from "@/lib/classes/store";
import type { JoinedClass, SharedTable, TaughtClass } from "@/lib/classes/types";
import { download } from "@/lib/export";
import type { Expression, Pose } from "@/lib/pixel/people";
import { shortDate } from "@/lib/teaching";
import { useMedia } from "@/lib/useMedia";
import { moodOf } from "@/lib/mood";
import { pickGesture } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import { Portrait } from "../art/Portrait";
import { Speech } from "../art/Speech";
import { LinkTrouble, useHash } from "../classes/shared";
import { ShareTable } from "../classes/ClassLeague";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Tabs } from "../ui/Tabs";
import { CodeBlock } from "../workbench/CodeBlock";
import { CourseGrid, CourseKey } from "./CourseGrid";
import { LeagueTable } from "./LeagueTable";
import styles from "./League.module.css";

/** The local version's table (app/api/league): everyone the server raced, names and scores only. */
interface ServerTable {
  week: string;
  table: { place: number; name: string; score: number; finished: number; mine: boolean }[];
  mine: { policy: { policy?: Policy }; score: number; finished: number } | null;
}

const SAVE_SNIPPET = `import json

# policy: 7 rows of 9 moves ("up", "down", "left", "right"),
# or swap "policy" for "q" and give Q.tolist() (7 x 9 x 4).
entry = {"format": "ppc-league-1", "policy": policy}
with open("league.json", "w") as f:
    json.dump(entry, f)
`;

interface Line {
  text: string;
  face: Expression;
  gesture: Pose;
}

/** What each host says to open the page, in their own voice; anyone else hosting gets a plain line. */
const HELLO: Record<string, Line> = {
  caitlin: { text: "Can it have a high score? It already does. Lowest average wins.", face: "pleased", gesture: "wave" },
  aaesha: { text: "Every entry races the same seeds, so luck doesn't come into it.", face: "neutral", gesture: "point" },
};
const HELLO_ANYONE: Line = { text: "New race every Monday. Enter as often as you like; your newest entry counts.", face: "pleased", gesture: "wave" };

/** How the hosts take your place on a table. */
function verdict(place: number, of: number): { host: number; line: Line } {
  if (place === 1) return { host: 1, line: { text: of > 1 ? "Top of the table. I'm writing your name on the cabinet." : "First entry this week, so you're top. Someone will come for that.", face: "laughing", gesture: "cheer" } };
  if (place <= 3) return { host: 1, line: { text: `Place ${place}. That's a podium.`, face: "pleased", gesture: "thumbs" } };
  return { host: 0, line: { text: `Place ${place} of ${of}. Train it for longer and enter again. Your newest entry counts.`, face: "thinking", gesture: "think" } };
}

/** A host: who's there (`id`), and whose lines they say (`owner`, the Arcade's resident they stand in for). */
interface Host {
  id: string;
  owner: string;
  name: string;
}

/** The hosts, side by side: the first speaks, then the second answers. */
function Hosts({ hosts, said }: { hosts: Host[]; said: { host: number; line: Line } | null }) {
  const phone = useMedia("(max-width: 720px)");
  const visit = useVisit();
  const [turn, setTurn] = useState(0);
  const size = phone ? 72 : 108;
  return (
    <div className={styles.hosts}>
      {hosts.slice(0, 2).map((h, i) => {
        const line = said ? (said.host === i ? said.line : null) : (HELLO[h.owner] ?? HELLO_ANYONE);
        // Whoever isn't speaking listens: there, but quiet, until it's their turn.
        if (!line || (!said && i > turn))
          return (
            <div key={h.id} className={styles.host}>
              <Portrait
                who={h.id}
                name={h.name}
                size={size}
                crop={size >= 96 ? "bust" : "head"}
                expression={said ? "pleased" : "neutral"}
                gesture={visit ? pickGesture({ who: h.id, tags: ["listen", "idle"], seed: `league|${visit}|${said?.line.text ?? "hello"}`, small: phone }) : "idle"}
              />
            </div>
          );
        const gesture = visit ? moodOf(line.text, { face: line.face, gesture: line.gesture }, { who: h.id, seed: `league|${visit}`, small: phone }).gesture : line.gesture;
        return <Speech key={`${h.id}-${line.text}`} who={h.id} name={h.name} text={line.text} face={line.face} gesture={gesture} size={size} onDone={() => setTurn((t) => Math.max(t, i + 1))} className={styles.host} />;
      })}
    </div>
  );
}

const together = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : (names[0] ?? ""));
const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
const scoreLine = (s: { score: number; finished: number; races: number }) => `${s.score.toFixed(2)} moves on average, ${s.finished} of ${s.races} finished`;

type View = { id: "arcade"; label: string } | { id: string; label: string; joined: JoinedClass } | { id: string; label: string; taught: TaughtClass };

export function League({ hosts: residents, names = {} }: { hosts: { id: string; name: string }[]; names?: Record<string, string> }) {
  const { user, ready, store, profile } = useSession();
  const playAs = profile.settings.playAs;
  const stand = speakersOf(
    residents.map((h) => h.id),
    playAs,
  );
  const hosts: Host[] = residents.map((h, i) => {
    const id = stand[i] ?? h.id;
    return { id, owner: h.id, name: id === h.id ? h.name : (names[id] ?? cap(id)) };
  });
  // The course keeps the Arcade's colours, whoever is hosting.
  const hostIds = residents.map((h) => h.id);

  const entries = useMyEntries();
  const book = useClassBook();
  const linkHash = useHash();
  // The week is the browser's, so it's worked out once the page is in the browser (a page built
  // for GitHub Pages was built in some other week).
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => setCurrent(isoWeek()), []);
  const [lastWeek, setLastWeek] = useState(false);
  const viewing = current ? (lastWeek ? previousWeek(current) : current) : null;

  const [tab, setTab] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [pasted, setPasted] = useState("");
  const [saved, setSaved] = useState<{ job: string; content: string }[]>([]);
  const [server, setServer] = useState<ServerTable | null>(null);
  // The local version: a signed-in learner's entry goes to the server as well.
  const toServer = !STATIC && Boolean(user);

  const loadServer = useCallback(async (week: string) => {
    if (STATIC) return;
    try {
      const res = await fetch(`/api/league?week=${week}`);
      if (res.ok) setServer((await res.json()) as ServerTable);
    } catch {
      // The Arcade's table works without it.
    }
  }, []);
  useEffect(() => {
    if (viewing && ready) void loadServer(viewing);
  }, [viewing, ready, user, loadServer]);

  // league.json files the learner's own programs wrote in the Workbench.
  useEffect(() => {
    if (!store || !ready) return;
    void store.all("code_files").then((rows) => setSaved(rows.filter((r) => r.stepId === "_files" && r.filename.endsWith("league.json")).map((r) => ({ job: r.jobId, content: r.content }))));
  }, [store, ready]);

  // A League table link: shown at the top, and kept with the class if this browser has joined it.
  const link = useMemo(() => (linkHash ? decodeTable(linkHash) : null), [linkHash]);
  useEffect(() => {
    if (!link?.ok) return;
    const { book: next, result } = putTable(loadBook(), link.value);
    if (result === "kept") saveBook(next);
  }, [link]);

  const myName = profile.displayName.trim() || (isCast(playAs) ? (names[playAs] ?? cap(playAs)) : "") || "You";

  /** Your row for a week: your entry in this browser, or the server's copy of it. */
  const myRow = useCallback(
    (week: string): TableRow | null => {
      const e = entryFor(entries, week);
      if (e) return { key: "me", name: myName, ...scoreOf(e.policy, week), enteredAt: e.enteredAt, mine: true };
      const m = toServer && server?.week === week ? server.mine : null;
      return m ? { key: "me", name: myName, score: m.score, finished: m.finished, races: RACES, enteredAt: weekStart(week), mine: true } : null;
    },
    [entries, myName, toServer, server],
  );

  /** The Arcade's table for a week: the cast (except whoever you're playing as), the server's entrants, and you. */
  const arcade = useCallback(
    (week: string): PlacedRow[] => {
      const cast = castRows(week, playAs, names);
      const others =
        server && server.week === week
          ? server.table.filter((r) => !r.mine).map((r, i): TableRow => ({ key: `server:${i}`, name: r.name, score: r.score, finished: r.finished, races: RACES, enteredAt: weekStart(week) + 86400000 + i, mine: false }))
          : [];
      const me = myRow(week);
      return rankRows([...cast, ...others, ...(me ? [me] : [])]);
    },
    [playAs, names, server, myRow],
  );

  // The tables to choose between: each class first (with a class, the table is the class's), then the Arcade's.
  const views: View[] = [
    ...book.teaching.map((t): View => ({ id: t.id, label: t.name, taught: t })),
    ...book.joined.filter((j) => !book.teaching.some((t) => t.id === j.id)).map((j): View => ({ id: j.id, label: j.name, joined: j })),
    { id: "arcade", label: "The Arcade" },
  ];
  const view = views.find((v) => v.id === tab) ?? views[0]!;

  const rowsFor = (v: View, week: string): PlacedRow[] => {
    if ("taught" in v) return rankRows(registerRows(v.taught, week));
    if ("joined" in v) return rankRows(joinedRows(v.joined, week, book.me, myRow(week)));
    return arcade(week);
  };
  const rows = viewing ? rowsFor(view, viewing) : [];
  const isCurrent = viewing !== null && viewing === current;

  // The table from a link, as it was shared.
  const shared: SharedTable | null = link?.ok ? link.value : null;
  const sharedPlaced = shared ? rankRows(sharedRows(shared, book.me)) : [];
  const sharedMine = sharedPlaced.find((r) => r.mine);
  const myForShared = shared ? myRow(shared.week) : null;
  const inSharedClass = Boolean(shared && book.joined.some((j) => j.id === shared.classId));

  const mineNow = current ? myRow(current) : null;
  const myPolicy = viewing ? (entryFor(entries, viewing)?.policy ?? (toServer && server?.week === viewing ? (server.mine?.policy?.policy ?? null) : null)) : null;
  const replay = useMemo(() => (myPolicy && viewing ? race(myPolicy, hash(`${viewing}/0`)).path : null), [myPolicy, viewing]);
  const par = useMemo(() => movesWithoutSlips(baselinePolicy()) ?? 0, []);

  const viewMine = isCurrent ? rows.find((r) => r.mine) : undefined;
  const said = shared && sharedMine && shared.week === current ? verdict(sharedMine.place, sharedPlaced.length) : viewMine ? verdict(viewMine.place, rows.length) : null;

  // Which classes your entry goes to with your progress link.
  const teachers = [...new Set(book.joined.map((j) => j.teacher))];

  const enter = async (text: string) => {
    setMessage(null);
    setNote("");
    const got = raceEntry(text);
    if (!got.ok) {
      setMessage(got.error);
      return;
    }
    const kept = saveEntries(putEntry(loadEntries(), got.entry));
    setLastWeek(false);
    if (!kept) setMessage("This browser wouldn't keep it. It may be a private window, or site data may be switched off.");
    const place = placeAmong(
      arcade(got.entry.week).filter((r) => !r.mine),
      got.result.score,
    );
    setNote(`Raced: ${scoreLine(got.result)}. That's ${ordinal(place)} at the Arcade this week.`);
    if (!toServer) return;
    setBusy(true);
    try {
      const res = await fetch("/api/league", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entry: JSON.parse(text) as unknown }) });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) setMessage(`It's kept in this browser, but the server's table didn't take it: ${body.error ?? "that didn't go through."}`);
      await loadServer(got.entry.week);
    } catch {
      setMessage("It's kept in this browser, but the server's table couldn't be reached.");
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!current) return;
    setMessage(null);
    if (!saveEntries(dropEntry(loadEntries(), current))) setMessage("This browser wouldn't change it. It may be a private window, or site data may be switched off.");
    setNote("Withdrawn. Enter again whenever you like.");
    if (toServer) {
      await fetch("/api/league", { method: "DELETE" }).catch(() => null);
      await loadServer(current);
    }
  };

  const panelId = `league-${view.id}-panel`;
  const tabbed = views.length > 1;

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>The Arcade League</h1>
        <p className={styles.lede}>
          {together(hosts.map((h) => h.name))} run a race every week on the Arcade course, for the crabs you train in Act 8.
        </p>
      </header>

      {hosts.length ? <Hosts hosts={hosts} said={said} /> : null}

      {link && !link.ok ? <LinkTrouble problem={link.problem} kind={link.kind} hash={linkHash ?? ""} level={2} /> : null}

      {shared ? (
        <section className={`px-panel ${styles.block} ${styles.shared}`} aria-labelledby="shared-title">
          <div>
            <h2 id="shared-title" className={styles.h2}>
              {shared.className}&apos;s table
            </h2>
            <p className={styles.meta}>
              {weekName(shared.week)}. Shared by {shared.teacher} on {shortDate(shared.sentAt)}.
            </p>
          </div>
          {sharedPlaced.length ? (
            <LeagueTable rows={sharedPlaced} labelledBy="shared-title" caption={`${shared.className}'s table for ${weekName(shared.week)}, as ${shared.teacher} shared it.`} />
          ) : (
            <p className={styles.meta}>Nobody&apos;s entry was in when this was shared.</p>
          )}
          <p className={styles.standing}>
            {sharedMine
              ? myForShared && myForShared.score !== sharedMine.score
                ? `You're ${ordinal(sharedMine.place)} of ${sharedPlaced.length} here. Your newest entry, ${myForShared.score.toFixed(2)}, would come ${ordinal(placeAmong(sharedPlaced.filter((r) => !r.mine), myForShared.score))}. Send ${shared.teacher} your progress to update it.`
                : `You're ${ordinal(sharedMine.place)} of ${sharedPlaced.length}.`
              : inSharedClass
                ? myForShared
                  ? `You're not on this one yet. Your entry, ${myForShared.score.toFixed(2)}, would come ${ordinal(placeAmong(sharedPlaced, myForShared.score))}. Send ${shared.teacher} your progress and you'll be on the next.`
                  : `You're not on this one yet. Enter, then send ${shared.teacher} your progress.`
                : myForShared
                  ? `Your own entry, ${myForShared.score.toFixed(2)}, would come ${ordinal(placeAmong(sharedPlaced, myForShared.score))} here.`
                  : "Standings only: names and scores, as the class's teacher had them."}
          </p>
        </section>
      ) : null}

      <div className={styles.columns}>
        <section className={`px-panel ${styles.block}`} aria-labelledby="course-title">
          <h2 id="course-title" className={styles.h2}>
            The course
          </h2>
          <CourseGrid hosts={hostIds} label="The Arcade course, 7 rows by 9 columns. The crab starts top left and the finish is bottom right, with rocks and rock pools between." />
          <CourseKey hosts={hostIds} />
          <p className={styles.meta}>
            Start top left, finish bottom right. Rocks can&apos;t be crossed. On sand the crab slips sideways {Math.round(SLIP_SAND * 100)}% of the time, and in a rock pool {Math.round(SLIP_POOL * 100)}%. Each race is {RACES} runs of at most {MAX_STEPS} moves; your score is the average number of moves, and lower is better. The plain shortest path takes {par} moves when nothing slips.
          </p>
          <div className={styles.row}>
            <Button variant="secondary" icon="download" onClick={() => download("arcade-course.json", JSON.stringify(courseJson(), null, 2), "application/json")}>
              Download the course
            </Button>
          </div>
        </section>

        <section className={`px-panel ${styles.block}`} aria-labelledby="enter-title">
          <h2 id="enter-title" className={styles.h2}>
            Enter this week
          </h2>
          <p className={styles.meta}>Save your policy from Python as league.json:</p>
          <CodeBlock code={SAVE_SNIPPET} />
          {saved.length ? (
            <div className={styles.row}>
              {saved.map((s) => (
                <Button key={s.job} variant="primary" disabled={busy} onClick={() => void enter(s.content)}>
                  Enter league.json from {s.job}
                </Button>
              ))}
            </div>
          ) : null}
          <label className={styles.field}>
            <span className="label">{saved.length ? "Or upload one" : "Upload league.json"}</span>
            <input
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void f.text().then(enter);
                e.target.value = "";
              }}
            />
          </label>
          <div className={styles.field}>
            <label htmlFor="league-paste" className="label">
              Or paste what&apos;s in it
            </label>
            <textarea id="league-paste" className={styles.paste} value={pasted} onChange={(e) => setPasted(e.target.value)} spellCheck={false} rows={4} placeholder='{"format": "ppc-league-1", "policy": [...]}' />
            <div className={styles.row}>
              <Button
                variant={saved.length ? "secondary" : "primary"}
                icon="run"
                disabled={busy || !pasted.trim()}
                onClick={() => {
                  void enter(pasted);
                  setPasted("");
                }}
              >
                Race it
              </Button>
            </div>
          </div>
          {message ? (
            <p className={styles.error} role="alert">
              <Icon name="cross" />
              <span>{message}</span>
            </p>
          ) : null}
          <p className={styles.status} role="status" aria-live="polite">
            {note}
          </p>
          {mineNow ? (
            <div className={styles.mine}>
              <p>
                <strong>Your entry:</strong> {scoreLine(mineNow)}. Kept in this browser
                {teachers.length ? `, and it goes to ${together(teachers)} with your progress link` : ""}.
              </p>
              <Button size="sm" variant="secondary" onClick={() => void withdraw()}>
                Withdraw
              </Button>
            </div>
          ) : null}
        </section>
      </div>

      {replay && viewing ? (
        <section className={`px-panel ${styles.block}`} aria-labelledby="replay-title">
          <h2 id="replay-title" className={styles.h2}>
            {isCurrent ? "Your first race this week" : `Your first race in ${weekName(viewing).toLowerCase()}`}
          </h2>
          <p className={styles.meta}>The race that was counted, on the same seed.</p>
          <CourseGrid key={`${viewing}-${replay.length}`} hosts={hostIds} path={replay} policy={myPolicy} label="Your first race, on the Arcade course. The arrows show your policy's move on each tile." />
        </section>
      ) : null}

      <section className={`px-panel ${styles.block}`} aria-labelledby="table-title">
        <div className={styles.tableHead}>
          <h2 id="table-title" className={styles.h2}>
            {!viewing || isCurrent ? "This week" : weekName(viewing)}
          </h2>
          {current ? (
            <Button size="sm" variant="ghost" onClick={() => setLastWeek(!lastWeek)}>
              {lastWeek ? "This week" : "Last week"}
            </Button>
          ) : null}
        </div>
        {tabbed ? <Tabs className={styles.tabs} label="Which table" idPrefix="league" value={view.id} onChange={setTab} items={views.map((v) => ({ id: v.id, label: v.label }))} /> : null}
        <div className={styles.panel} role={tabbed ? "tabpanel" : undefined} id={tabbed ? panelId : undefined} aria-labelledby={tabbed ? `league-${view.id}` : undefined}>
          {viewing ? <TableNote view={view} week={viewing} isCurrent={isCurrent} hasMine={Boolean(myRow(viewing))} /> : null}
          {!viewing ? null : rows.length ? (
            <LeagueTable rows={rows} labelledBy="table-title" caption={`${view.id === "arcade" ? "The Arcade's" : `${view.label}'s`} table for ${weekName(viewing)}.`} />
          ) : (
            <p className={styles.meta}>{"taught" in view ? `No entries for ${isCurrent ? "this week" : "that week"} yet. Each student's entry comes with their progress link.` : `Nothing here for ${isCurrent ? "this week" : "that week"} yet.`}</p>
          )}
          {"taught" in view && viewing ? <ShareTable cls={view.taught} week={viewing} disabled={rows.length === 0} /> : null}
        </div>
      </section>
    </div>
  );
}

/** A line over the table saying whose it is and where it came from. */
function TableNote({ view, week, isCurrent, hasMine }: { view: View; week: string; isCurrent: boolean; hasMine: boolean }) {
  const when = isCurrent ? "this week's" : "that week's";
  let text: string;
  if ("taught" in view) text = "From the register.";
  else if ("joined" in view) {
    const t = view.joined.table;
    text =
      t && t.week === week
        ? `${view.joined.teacher} shared this on ${shortDate(t.sentAt)}.${hasMine ? " Your row is your newest entry in this browser." : ""}`
        : `${view.joined.teacher} hasn't shared ${when} table yet.${isCurrent ? " Your entry goes to them with your progress link." : ""}`;
  } else text = STATIC ? "Everyone at the Clocktower races too, so there's always a time to beat." : "Everyone at the Clocktower races too, with anyone here who entered with an account.";
  return <p className={styles.meta}>{text}</p>;
}
