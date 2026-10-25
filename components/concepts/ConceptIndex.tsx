"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import type { ReviewCardRow } from "@/lib/store/types";
import { strengthOf } from "@/lib/review/strength";
import { Strength } from "./Strength";
import styles from "./Concepts.module.css";

interface Item {
  id: string;
  title: string;
  summaryHtml: string;
  introducedIn: string | null;
}

interface Group {
  key: string;
  label: string | null;
  title: string;
  items: Item[];
}

export function ConceptIndex({ concepts, jobs, acts }: { concepts: Item[]; jobs: Record<string, { title: string; act: number; number: number }>; acts: { number: number; title: string }[] }) {
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

  // One panel per Act, in course order; ideas no written job meets yet go last.
  const groups = useMemo(() => {
    const byAct = new Map<string, Group>();
    for (const a of acts) byAct.set(`act-${a.number}`, { key: `act-${a.number}`, label: `Act ${a.number}`, title: a.title, items: [] });
    const later: Group = { key: "later", label: null, title: "Later in the course", items: [] };
    for (const c of shown) {
      const job = c.introducedIn ? jobs[c.introducedIn] : null;
      (job ? byAct.get(`act-${job.act}`) ?? later : later).items.push(c);
    }
    return [...byAct.values(), later].filter((g) => g.items.length > 0);
  }, [shown, acts, jobs]);

  return (
    <div className={styles.index}>
      <header className={styles.head}>
        <h1 className={styles.title}>Python Handbook</h1>
        <p className={styles.lede}>Every idea in the course, in the order the jobs meet them. Each page has a plain explanation and an example you can run, and shows how well the idea is holding for you.</p>
      </header>
      <div className={styles.controls}>
        <label className={styles.search}>
          <span className="visually-hidden">Search the Handbook</span>
          <input type="search" placeholder="Search: lists, f-strings, ValueError" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
          <span>Only ones I&apos;ve met</span>
        </label>
        <p className={styles.count} aria-live="polite">
          {shown.length} {shown.length === 1 ? "entry" : "entries"}
        </p>
      </div>
      <div className={styles.columns}>
        {groups.length > 1 ? (
          <nav className={`frame-panel ${styles.contents}`} aria-label="Handbook sections">
            <p className={styles.contentsTitle}>Contents</p>
            <ol className={styles.contentsList}>
              {groups.map((g) => (
                <li key={g.key}>
                  <a href={`#${g.key}`}>
                    {g.label ? <span className={styles.actNo}>{g.label}</span> : null}
                    <span className={styles.contentsName}>{g.title}</span>
                    <span className={styles.contentsCount}>{g.items.length}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className={styles.groups}>
          {groups.length === 0 ? <p className={`frame-panel ${styles.empty}`}>Nothing in the Handbook matches that. Try a shorter word.</p> : null}
          {groups.map((g) => (
            <section key={g.key} id={g.key} className={`frame-panel ${styles.group}`} aria-labelledby={`${g.key}-title`}>
              <h2 id={`${g.key}-title`} className={styles.groupTitle}>
                {g.label ? <span className={styles.actNo}>{g.label}</span> : null} {g.title}
              </h2>
              <ul className={styles.list}>
                {g.items.map((c) => {
                  const job = c.introducedIn ? jobs[c.introducedIn] : null;
                  return (
                    <li key={c.id} className={styles.item}>
                      <Link href={`/handbook/${c.id}`} className={styles.itemTitle}>
                        {c.title}
                      </Link>
                      <span className={styles.itemMeta}>{job ? `Job ${job.number}, ${job.title}` : "Coming in a later job"}</span>
                      <Strength level={strengthOf(cards[c.id])} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
