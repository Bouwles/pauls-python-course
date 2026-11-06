"use client";

import Link from "next/link";
import type { JobProgressRow } from "@/lib/store/types";
import { duration } from "@/lib/display";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";
import { PixelRoom } from "../art/PixelRoom";
import { jobBadge } from "./floors";
import type { FloorInfo } from "./Clocktower";
import styles from "./TowerList.module.css";

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/**
 * The list view (REDESIGN-2.md 5.2): every Act and its projects as plain tables, ground floor
 * first, each Act a pixel panel with its room beside its name. Open floors start expanded;
 * locked ones fold away but still list everything.
 */
export function TowerList({ floors, progress, names }: { floors: FloorInfo[]; progress: Record<string, JobProgressRow>; names: Record<string, string> }) {
  return (
    <div className={styles.list}>
      {floors.map(({ floor, act, stats, state, open }) => (
        <details key={act.id} className={styles.act} open={state !== "locked"}>
          <summary className={styles.summary}>
            <span className={styles.thumb}>
              <PixelRoom act={floor.act} state={state} scale={1} animate={false} />
            </span>
            <h2 className={styles.actTitle}>
              <span className={styles.actNo}>Act {act.number}</span> {act.subject}
            </h2>
            <span className={styles.actRoom}>
              {floor.label}, {floor.room}
            </span>
            <span className={styles.actState}>
              {state === "locked" ? (
                <Badge tone="neutral">
                  <Icon name="lock" size={14} />
                  Locked
                </Badge>
              ) : null}
              <span>
                {stats.shipped} of {stats.total} shipped
              </span>
            </span>
            <Icon name="caretDown" className={styles.caret} />
          </summary>
          <table className={styles.table}>
            <caption className="visually-hidden">
              Projects in Act {act.number}, {act.subject}
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.num}>
                  No.
                </th>
                <th scope="col">Project</th>
                <th scope="col" className={styles.wideOnly}>
                  For
                </th>
                <th scope="col" className={styles.wideOnly}>
                  Time
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {act.jobs.map((j) => {
                const playable = open && j.status === "written";
                const badge = jobBadge(progress[j.id], j);
                const time = j.status === "written" ? duration(j.estimatedMinutes) : "Being written";
                return (
                  <tr key={j.id}>
                    <td className={styles.num}>{j.sidequest ? "" : j.number}</td>
                    <td>
                      {playable ? (
                        <Link href={`/job/${j.id}`} className={styles.project}>
                          {j.title}
                        </Link>
                      ) : (
                        <span className={styles.project} data-dim>
                          {j.title}
                        </span>
                      )}
                      {j.sidequest ? <span className={styles.aside}>Sidequest</span> : null}
                      <span className={styles.narrowOnly}>{time}</span>
                    </td>
                    <td className={styles.wideOnly}>{names[j.client] ?? cap(j.client)}</td>
                    <td className={styles.wideOnly}>{time}</td>
                    <td>
                      {!open ? (
                        <span className={styles.muted}>Locked</span>
                      ) : badge.tone === "neutral" ? (
                        <span className={styles.muted}>{badge.text}</span>
                      ) : (
                        <Badge tone={badge.tone}>{badge.text}</Badge>
                      )}
                    </td>
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
