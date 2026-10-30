"use client";

// The Arcade League (Section 13.5): a weekly race on the Club Course for policies
// trained in Act VIII. Opt-in by entering; the table shows display names and
// scores only. Every race is seeded, so the replay here is the race that was scored.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { baselinePolicy, course, courseJson, hash, MAX_STEPS, RACES, raceFrames, readEntry, SLIP_POOL, SLIP_SAND, type Policy } from "@/lib/league/course";
import type { GridFrame } from "@/lib/python/protocol";
import { download } from "@/lib/export";
import { Button } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { LivingPlayer } from "../workbench/LivingPlayer";
import { CodeBlock } from "../workbench/CodeBlock";
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

function courseFrame(): GridFrame {
  const c = course();
  return {
    kind: "grid",
    values: Array.from({ length: c.rows }, (_, r) => Array.from({ length: c.cols }, (_, col) => (c.rocks.some(([a, b]) => a === r && b === col) ? null : c.pools.some(([a, b]) => a === r && b === col) ? -0.3 : 0))),
    crab: c.start,
    walls: c.rocks,
    goal: [c.finish],
    numbers: false,
    title: "The Club Course",
  };
}

export function League() {
  const { user, ready, store } = useSession();
  const [data, setData] = useState<Table | null>(null);
  const [week, setWeek] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<{ job: string; content: string }[]>([]);

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
      setMessage("That file isn't JSON. Save it with json.dump, as below.");
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
  const replay = useMemo(() => (myPolicy && viewing ? { frames: raceFrames(myPolicy, hash(`${viewing}/0`)), total: 0 } : null), [myPolicy, viewing]);
  const preview = useMemo(() => ({ frames: [courseFrame()], total: 1 }), []);
  const baseline = useMemo(() => {
    const frames = raceFrames(baselinePolicy(), hash("baseline/0"));
    return frames.length - 1;
  }, []);

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>The Arcade League</h1>
        <p className={styles.lede}>The Crab Racing Club runs a race every week on the Club Course, for the policies you train in Act VIII. Entering is the only way onto the table, and the table shows display names and scores. Nothing else.</p>
      </header>

      <div className={styles.columns}>
        <section className={`frame-panel ${styles.block}`} aria-labelledby="course-title">
          <h2 id="course-title" className={styles.h2}>
            The course
          </h2>
          <LivingPlayer visuals={preview} />
          <p className={styles.meta}>
            Start top left, finish bottom right. Rocks are hatched; the brick-tinted tiles are rock pools, where Sir Reginald slips sideways {Math.round(SLIP_POOL * 100)}% of the time ({Math.round(SLIP_SAND * 100)}% on sand). Each race is {RACES} runs of at most {MAX_STEPS} moves; your score is the average number of moves, lower is better. The plain shortest path takes {baseline} moves when nothing slips.
          </p>
          <div className={styles.row}>
            <Button variant="quiet" onClick={() => download("club-course.json", JSON.stringify(courseJson(), null, 2), "application/json")}>
              Download the course
            </Button>
          </div>
        </section>

        <section className={`frame-panel ${styles.block}`} aria-labelledby="enter-title">
          <h2 id="enter-title" className={styles.h2}>
            Enter this week
          </h2>
          {!ready ? null : !user ? (
            <p className={styles.meta}>
              Entering needs an account, so your entry has a name. <Link href="/login?next=/league">Log in</Link> or <Link href="/signup">make one</Link>.
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
                <span>{saved.length ? "Or upload one" : "Upload league.json"}</span>
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
                  <PixelIcon name="cross" />
                  <span>{message}</span>
                </p>
              ) : null}
              {data?.mine && isCurrent ? (
                <div className={styles.mine} role="status">
                  <p>
                    <strong>Your entry:</strong> {data.mine.score.toFixed(2)} moves on average; {data.mine.finished} of {RACES} finished.
                  </p>
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => void fetch("/api/league", { method: "DELETE" }).then(() => load(null))}
                  >
                    Withdraw
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      {replay ? (
        <section className={`frame-panel ${styles.block}`} aria-labelledby="replay-title">
          <h2 id="replay-title" className={styles.h2}>
            Your first race this week
          </h2>
          <p className={styles.meta}>Run in your browser with the same seed the score used, so this is the race that was counted.</p>
          <LivingPlayer visuals={replay} />
        </section>
      ) : null}

      <section className={`frame-panel ${styles.block}`} aria-labelledby="table-title">
        <div className={styles.tableHead}>
          <h2 id="table-title" className={styles.h2}>
            {!viewing || isCurrent ? "This week" : `Week ${Number(viewing.split("-W")[1])}, ${viewing.split("-W")[0]}`}
          </h2>
          {data ? (
            <Button size="sm" variant="quiet" onClick={() => setWeek(isCurrent ? previousWeek(data.current) : null)}>
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
                <th scope="col">Finished</th>
              </tr>
            </thead>
            <tbody>
              {data.table.map((r) => (
                <tr key={`${r.place}-${r.name}`} className={r.mine ? styles.me : undefined}>
                  <td className={styles.place}>{r.place}</td>
                  <td>
                    {r.name}
                    {r.mine ? <span className="visually-hidden"> (you)</span> : null}
                  </td>
                  <td className={styles.num}>{r.score.toFixed(2)}</td>
                  <td>
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
