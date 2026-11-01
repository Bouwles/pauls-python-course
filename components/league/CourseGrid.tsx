"use client";

// The Arcade course as square pixel cells (REDESIGN-2.md 6, REDESIGN3_PLAN.md): sand, rocks in one host's colour, rock pools
// in the other's, the finish in sun, and the crab. With a race's path it becomes a replay.
import { useEffect, useMemo, useState } from "react";
import { course, type Policy } from "@/lib/league/course";
import { castColour } from "@/lib/cast";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import styles from "./League.module.css";

const ARROW = { up: "↑", down: "↓", left: "←", right: "→" } as const;
const STEP_MS = 160;

export function CourseGrid({ hosts, path, policy, label }: { hosts: string[]; path?: [number, number][]; policy?: Policy | null; label: string }) {
  const c = useMemo(() => course(), []);
  const [at, setAt] = useState(path ? path.length - 1 : 0);
  const [playing, setPlaying] = useState(false);
  const last = path ? path.length - 1 : 0;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setAt((i) => {
        if (i >= last) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, STEP_MS);
    return () => clearInterval(t);
  }, [playing, last]);

  const is = (cells: [number, number][], r: number, col: number) => cells.some(([a, b]) => a === r && b === col);
  const visits = useMemo(() => {
    const v = new Map<string, number>();
    for (const [r, col] of (path ?? []).slice(0, at + 1)) v.set(`${r}-${col}`, (v.get(`${r}-${col}`) ?? 0) + 1);
    return v;
  }, [path, at]);
  const crab = path ? path[at]! : c.start;
  const finished = path ? crab[0] === c.finish[0] && crab[1] === c.finish[1] : false;
  const vars = { "--rock": castColour(hosts[0] ?? "").face, "--pool": castColour(hosts[1] ?? hosts[0] ?? "").face } as React.CSSProperties;

  return (
    <div className={styles.course} style={vars}>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${c.cols}, minmax(0, 1fr))` }} role="img" aria-label={label}>
        {Array.from({ length: c.rows }, (_, r) =>
          Array.from({ length: c.cols }, (_, col) => {
            const rock = is(c.rocks, r, col);
            const pool = is(c.pools, r, col);
            const finish = r === c.finish[0] && col === c.finish[1];
            const start = r === c.start[0] && col === c.start[1];
            const here = crab[0] === r && crab[1] === col;
            const visited = (visits.get(`${r}-${col}`) ?? 0) > 0;
            const move = policy && !rock && !finish ? policy[r]?.[col] : undefined;
            return (
              <span
                key={`${r}-${col}`}
                className={[styles.cell, rock ? styles.rock : pool ? styles.pool : finish ? styles.finish : styles.sand, visited && !rock && !finish ? styles.visited : ""].join(" ")}
              >
                {finish && !here ? <Icon name="flag" size={24} /> : null}
                {start && !here && !visited ? <span className={styles.startMark}>S</span> : null}
                {move && !here ? <span className={styles.arrow}>{ARROW[move]}</span> : null}
                {here ? (
                  <span className={styles.crab}>
                    <Icon name="crab" size={24} />
                  </span>
                ) : null}
              </span>
            );
          }),
        )}
      </div>
      {path ? (
        <div className={styles.player}>
          <Button
            variant="secondary"
            size="sm"
            icon={playing ? "pause" : at >= last ? "reset" : "run"}
            onClick={() => {
              if (playing) return setPlaying(false);
              if (at >= last) setAt(0);
              setPlaying(true);
            }}
          >
            {playing ? "Pause" : at >= last ? "Replay" : "Play"}
          </Button>
          <input className={styles.scrub} type="range" min={0} max={last} value={at} onChange={(e) => {
              setPlaying(false);
              setAt(Number(e.target.value));
            }} aria-label="Move" aria-valuetext={`Move ${at} of ${last}`} />
          <span className={styles.moveCount} aria-live="off">
            {at} / {last}
          </span>
        </div>
      ) : null}
      {path ? (
        <p className={styles.meta} role="status">
          {at === last ? (finished ? `Finished in ${last} moves.` : `Still racing after ${last} moves.`) : `Move ${at}. The crab is at row ${crab[0]}, column ${crab[1]}.`}
        </p>
      ) : null}
    </div>
  );
}

/** The key under the course. */
export function CourseKey({ hosts }: { hosts: string[] }) {
  const vars = { "--rock": castColour(hosts[0] ?? "").face, "--pool": castColour(hosts[1] ?? hosts[0] ?? "").face } as React.CSSProperties;
  return (
    <ul className={styles.key} style={vars} aria-label="Key">
      <li>
        <span className={[styles.swatch, styles.sand].join(" ")} aria-hidden="true" />
        Sand
      </li>
      <li>
        <span className={[styles.swatch, styles.rock].join(" ")} aria-hidden="true" />
        Rock
      </li>
      <li>
        <span className={[styles.swatch, styles.pool].join(" ")} aria-hidden="true" />
        Rock pool
      </li>
      <li>
        <span className={[styles.swatch, styles.finish].join(" ")} aria-hidden="true">
          <Icon name="flag" size={16} />
        </span>
        Finish
      </li>
      <li>
        <span className={[styles.swatch, styles.crabKey].join(" ")} aria-hidden="true">
          <Icon name="crab" size={16} />
        </span>
        The crab
      </li>
    </ul>
  );
}
