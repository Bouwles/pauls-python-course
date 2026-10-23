"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import type { ReviewCardRow } from "@/lib/store/types";
import { STRENGTH_LABEL, strengthOf } from "@/lib/review/strength";
import styles from "./Concepts.module.css";

interface Item {
  id: string;
  title: string;
  summaryHtml: string;
  introducedIn: string | null;
}

export function ConceptIndex({ concepts, jobs }: { concepts: Item[]; jobs: Record<string, { title: string; act: number; number: number }> }) {
  const { store } = useSession();
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Record<string, ReviewCardRow>>({});
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(() => {
    if (!store) return;
    void store.all("review_cards").then((rows) => setCards(Object.fromEntries(rows.map((r) => [r.conceptId, r]))));
  }, [store]);

  const ordered = useMemo(() => {
    const pos = (c: Item) => (c.introducedIn && jobs[c.introducedIn] ? jobs[c.introducedIn]!.act * 100 + jobs[c.introducedIn]!.number : 9999);
    return [...concepts].sort((a, b) => pos(a) - pos(b) || a.title.localeCompare(b.title));
  }, [concepts, jobs]);

  const q = query.trim().toLowerCase();
  const shown = ordered.filter((c) => (!q || c.title.toLowerCase().includes(q) || c.id.includes(q) || c.summaryHtml.toLowerCase().includes(q)) && (!onlyMine || cards[c.id]));

  return (
    <div className={styles.index}>
      <header className={styles.head}>
        <h1 className={styles.title}>Concepts</h1>
        <p className={styles.lede}>Every idea in the course, in the order the jobs meet them. Your own Python handbook, with how well each one is holding.</p>
      </header>
      <div className={styles.controls}>
        <label className={styles.search}>
          <span className="visually-hidden">Search concepts</span>
          <input type="search" placeholder="Search: lists, f-strings, ValueError" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
          Only ones I&apos;ve met
        </label>
      </div>
      <p className={styles.count} aria-live="polite">
        {shown.length} {shown.length === 1 ? "concept" : "concepts"}
      </p>
      <ul className={styles.list}>
        {shown.map((c) => {
          const s = strengthOf(cards[c.id]);
          const job = c.introducedIn ? jobs[c.introducedIn] : null;
          return (
            <li key={c.id} className={styles.item}>
              <Link href={`/concepts/${c.id}`} className={styles.itemTitle}>
                {c.title}
              </Link>
              <span className={styles.itemMeta}>{job ? `Act ${job.act}, ${job.title}` : "Coming in a later job"}</span>
              <span className={[styles.strength, styles[s]].join(" ")}>{STRENGTH_LABEL[s]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
