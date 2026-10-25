import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FUNNEL } from "@/lib/funnel";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { totalFunnel, weeklyFunnel } from "@/lib/server/funnel";
import { isOwner } from "@/lib/server/owner";
import { Page } from "@/components/site/Page";
import styles from "@/components/admin/Metrics.module.css";

export const metadata: Metadata = { title: "Metrics", robots: { index: false } };
export const dynamic = "force-dynamic";

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "");

// Owner only (REDESIGN.md 9.3): weekly counts of each funnel step, and conversion from one
// step to the next. Counts are distinct people. Our own events only, no trackers.
export default async function Metrics() {
  const user = await getSessionUser().catch(() => null);
  if (!isOwner(user)) notFound();
  const db = await getDb();
  const [weeks, total] = await Promise.all([weeklyFunnel(db, 8), totalFunnel(db)]);
  return (
    <Page wide>
      <div className={styles.page}>
        <h1 className={styles.title}>Metrics</h1>
        <section className="frame-panel" aria-labelledby="all-time">
          <h2 id="all-time" className={styles.h2}>
            The funnel, all time
          </h2>
          <ol className={styles.funnel}>
            {FUNNEL.map(([event, label], i) => {
              const n = total[event] ?? 0;
              const prev = i > 0 ? (total[FUNNEL[i - 1]![0]] ?? 0) : 0;
              return (
                <li key={event}>
                  <span className={styles.label}>{label}</span>
                  <span className={styles.count}>{n}</span>
                  <span className={styles.conv}>{i > 0 && event !== "cancel" ? pct(n, prev) : ""}</span>
                </li>
              );
            })}
          </ol>
        </section>
        <section className="frame-panel" aria-labelledby="weekly">
          <h2 id="weekly" className={styles.h2}>
            By week
          </h2>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Week of</th>
                  {FUNNEL.map(([event, label]) => (
                    <th key={event} scope="col" title={label}>
                      {event}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.length === 0 ? (
                  <tr>
                    <td colSpan={FUNNEL.length + 1}>No events yet.</td>
                  </tr>
                ) : (
                  weeks.map((w) => (
                    <tr key={w.week}>
                      <th scope="row">{w.week}</th>
                      {FUNNEL.map(([event]) => (
                        <td key={event}>{w.counts[event] ?? 0}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Page>
  );
}
