"use client";

// A League table: place, name, average moves and races finished, with your own row marked. The
// rows come ranked from lib/league/table.ts, whoever they're from: the cast, a class or a link.
import type { PlacedRow } from "@/lib/league/table";
import { Icon } from "../ui/Icon";
import styles from "./League.module.css";

export function LeagueTable({ rows, labelledBy, caption }: { rows: PlacedRow[]; labelledBy: string; caption: string }) {
  return (
    <div className={styles.tableWrap} role="region" aria-labelledby={labelledBy} tabIndex={0}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
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
          {rows.map((r) => (
            <tr key={r.key} className={r.mine ? styles.me : undefined} aria-current={r.mine ? "true" : undefined}>
              <td className={styles.place}>
                <span className={styles.placeInner}>
                  {r.place === 1 ? <Icon name="trophy" size={24} className={styles.trophy} /> : null}
                  {r.place}
                </span>
              </td>
              <td>
                {r.name}
                {/* Someone with no name of their own is just "You" already. */}
                {r.mine && r.name !== "You" ? <span className={styles.you}> (you)</span> : null}
              </td>
              <td className={styles.num}>{r.score.toFixed(2)}</td>
              <td className={styles.num}>
                {r.finished} of {r.races}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
