"use client";

// The Arcade League (Section 13.5): a weekly race on the Arcade course for policies trained in
// Act 8, run by the classmates who live on the Arcade floor (Aaesha and Caitlin). They host it in
// person: they introduce the race, one after the other, and react to where your entry finished.
// Opt-in by entering; the table shows display names and scores only. Every race is seeded, so the
// replay here is the race that was scored.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { baselinePolicy, courseJson, hash, MAX_STEPS, race, RACES, readEntry, SLIP_POOL, SLIP_SAND, type Policy } from "@/lib/league/course";
import { download } from "@/lib/export";
import type { Expression, Pose } from "@/lib/pixel/people";
import { useMedia } from "@/lib/useMedia";
import { Portrait } from "../art/Portrait";
import { Speech } from "../art/Speech";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { CodeBlock } from "../workbench/CodeBlock";
import { CourseGrid, CourseKey } from "./CourseGrid";
import styles from "./League.module.css";

interface Row {
  place: number;
  name: string;
  score: number;
  finished: number;
  mine: boolean;
}

interface Table {
  week: string;
  current: string;
  table: Row[];
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
  aaesha: { text: "Every entry races the same seeds, so luck can't pick the winner. Only the policy can.", face: "neutral", gesture: "point" },
};
const HELLO_ANYONE: Line = { text: "New race every Monday. Enter as often as you like; your newest entry counts.", face: "pleased", gesture: "wave" };

/** How the hosts take your place on this week's table. */
function verdict(place: number, of: number): { host: number; line: Line } {
  if (place === 1) return { host: 1, line: { text: of > 1 ? "Top of the table. I'm writing your name on the cabinet." : "First entry this week, so you're top. Someone will come for that.", face: "laughing", gesture: "cheer" } };
  if (place <= 3) return { host: 1, line: { text: `Place ${place}. That's a podium.`, face: "pleased", gesture: "thumbs" } };
  return { host: 0, line: { text: `Place ${place} of ${of}. Train it for longer and enter again. Your newest entry counts.`, face: "thinking", gesture: "think" } };
}

/** The hosts, side by side: the first speaks, then the second answers. */
function Hosts({ hosts, said }: { hosts: { id: string; name: string }[]; said: { host: number; line: Line } | null }) {
  const phone = useMedia("(max-width: 720px)");
  const [turn, setTurn] = useState(0);
  const size = phone ? 72 : 108;
  return (
    <div className={styles.hosts}>
      {hosts.slice(0, 2).map((h, i) => {
        const line = said ? (said.host === i ? said.line : null) : (HELLO[h.id] ?? HELLO_ANYONE);
        // Whoever isn't speaking listens: there, but quiet, until it's their turn.
        if (!line || (!said && i > turn))
          return (
            <div key={h.id} className={styles.host}>
              <Portrait who={h.id} name={h.name} size={size} crop={size >= 96 ? "bust" : "head"} expression={said ? "pleased" : "neutral"} />
            </div>
          );
        return <Speech key={`${h.id}-${line.text}`} who={h.id} name={h.name} text={line.text} face={line.face} gesture={line.gesture} size={size} onDone={() => setTurn((t) => Math.max(t, i + 1))} className={styles.host} />;
      })}
    </div>
  );
}

const together = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : (names[0] ?? ""));

export function League({ hosts }: { hosts: { id: string; name: string }[] }) {
  const { user, ready, store } = useSession();
  const [data, setData] = useState<Table | null>(null);
  const [week, setWeek] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<{ job: string; content: string }[]>([]);
  const hostIds = hosts.map((h) => h.id);

  const load = useCallback(async (w: string | null) => {
    const res = await fetch(`/api/league${w ? `?week=${w}` : ""}`);
    if (res.ok) setData((await res.json()) as Table);
  }, []);

  useEffect(() => void load(week), [load, week]);

  // league.json files the learner's own programs wrote in the Workbench.
  useEffect(() => {
    if (!store || !ready) return;
    void store.all("code_files").then((rows) => setSaved(rows.filter((r) => r.stepId === "_files" && r.filename.endsWith("league.json")).map((r) => ({ job: r.jobId, content: r.content }))));
  }, [store, ready]);

  const enter = async (text: string) => {
    setMessage(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setMessage("That file isn't JSON. Save it with json.dump, as above.");
      return;
    }
    const check = readEntry(parsed);
    if ("error" in check) {
      setMessage(check.error);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/league", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entry: parsed }) });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) setMessage(body.error ?? "That didn't go through.");
      else {
        setWeek(null);
        await load(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const viewing = data?.week ?? null;
  const isCurrent = data && data.week === data.current;
  const myPolicy = data?.mine?.policy?.policy ?? null;
  const replay = useMemo(() => (myPolicy && viewing ? race(myPolicy, hash(`${viewing}/0`)).path : null), [myPolicy, viewing]);
  const baseline = useMemo(() => race(baselinePolicy(), hash("baseline/0")).steps, []);
  const myRow = isCurrent ? data?.table.find((r) => r.mine) : undefined;
  const said = myRow && data ? verdict(myRow.place, data.table.length) : null;

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>The Arcade League</h1>
        <p className={styles.lede}>
          {together(hosts.map((h) => h.name))} run a race every week on the Arcade course, for the policies you train in Act 8. Entering is the only way onto the table, and the table shows display names and scores. Nothing else.
        </p>
      </header>

      {hosts.length ? <Hosts hosts={hosts} said={said} /> : null}

      <div className={styles.columns}>
        <section className={`px-panel ${styles.block}`} aria-labelledby="course-title">
          <h2 id="course-title" className={styles.h2}>
            The course
          </h2>
          <CourseGrid hosts={hostIds} label="The Arcade course, 7 rows by 9 columns. The crab starts top left and the finish is bottom right, with rocks and rock pools between." />
          <CourseKey hosts={hostIds} />
          <p className={styles.meta}>
            Start top left, finish bottom right. Rocks can&apos;t be crossed. On sand the crab slips sideways {Math.round(SLIP_SAND * 100)}% of the time, and in a rock pool {Math.round(SLIP_POOL * 100)}%. Each race is {RACES} runs of at most {MAX_STEPS} moves; your score is the average number of moves, and lower is better. The plain shortest path takes {baseline} moves when nothing slips.
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
          {!ready ? null : !user ? (
            <p className={styles.meta}>
              Entering needs an account, so your entry has a name. <Link href="/login?next=/league">Log in</Link> or <Link href="/signup">sign up</Link>.
            </p>
          ) : (
            <>
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
              {message ? (
                <p className={styles.error} role="alert">
                  <Icon name="cross" />
                  <span>{message}</span>
                </p>
              ) : null}
              {data?.mine && isCurrent ? (
                <div className={styles.mine} role="status">
                  <p>
                    <strong>Your entry:</strong> {data.mine.score.toFixed(2)} moves on average, {data.mine.finished} of {RACES} finished.
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => void fetch("/api/league", { method: "DELETE" }).then(() => load(null))}>
                    Withdraw
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      {replay ? (
        <section className={`px-panel ${styles.block}`} aria-labelledby="replay-title">
          <h2 id="replay-title" className={styles.h2}>
            Your first race this week
          </h2>
          <p className={styles.meta}>Run in your browser with the same seed the score used, so this is the race that was counted.</p>
          <CourseGrid hosts={hostIds} path={replay} policy={myPolicy} label="Your first race this week, on the Arcade course. The arrows show your policy's move on each tile." />
        </section>
      ) : null}

      <section className={`px-panel ${styles.block}`} aria-labelledby="table-title">
        <div className={styles.tableHead}>
          <h2 id="table-title" className={styles.h2}>
            {!viewing || isCurrent ? "This week" : `Week ${Number(viewing.split("-W")[1])}, ${viewing.split("-W")[0]}`}
          </h2>
          {data ? (
            <Button size="sm" variant="ghost" onClick={() => setWeek(isCurrent ? previousWeek(data.current) : null)}>
              {isCurrent ? "Last week" : "This week"}
            </Button>
          ) : null}
        </div>
        {!data ? null : data.table.length === 0 ? (
          <p className={styles.meta}>No entries yet{isCurrent ? ". The first one sets the time to beat." : "."}</p>
        ) : (
          <div className={styles.tableWrap} role="region" aria-labelledby="table-title" tabIndex={0}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Place</th>
                  <th scope="col">Name</th>
                  <th scope="col" className={styles.num}>
                    Average moves
                  </th>
                  <th scope="col" className={styles.num}>
                    Finished
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.table.map((r) => (
                  <tr key={`${r.place}-${r.name}`} className={r.mine ? styles.me : undefined}>
                    <td className={styles.place}>
                      <span className={styles.placeInner}>
                        {r.place === 1 ? <Icon name="trophy" size={24} className={styles.trophy} /> : null}
                        {r.place}
                      </span>
                    </td>
                    <td>
                      {r.name}
                      {r.mine ? <span className={styles.you}> (you)</span> : null}
                    </td>
                    <td className={styles.num}>{r.score.toFixed(2)}</td>
                    <td className={styles.num}>
                      {r.finished} of {RACES}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function previousWeek(week: string): string {
  const [y, w] = week.split("-W").map(Number) as [number, number];
  if (w > 1) return `${y}-W${String(w - 1).padStart(2, "0")}`;
  // The last ISO week of the previous year is the one containing 28 December.
  const dec28 = new Date(Date.UTC(y - 1, 11, 28));
  const day = dec28.getUTCDay() || 7;
  dec28.setUTCDate(dec28.getUTCDate() + 4 - day);
  const start = new Date(Date.UTC(dec28.getUTCFullYear(), 0, 1));
  const last = Math.ceil(((dec28.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `${y - 1}-W${String(last).padStart(2, "0")}`;
}
