"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import type { ReviewCardRow } from "@/lib/store/types";
import { strengthOf } from "@/lib/review/strength";
import { castColour, floorFor } from "@/lib/cast";
import { Icon } from "../ui/Icon";
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
  act: number | null;
  title: string;
  items: Item[];
}

function square(act: number): React.CSSProperties {
  const who = floorFor(act)?.residents[0] ?? "paul";
  return { background: `var(--c-${who}, ${castColour(who).face})` };
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

  // One group per Act, in course order; ideas no written project meets yet go last.
  const groups = useMemo(() => {
    const byAct = new Map<string, Group>();
    for (const a of acts) byAct.set(`act-${a.number}`, { key: `act-${a.number}`, act: a.number, title: a.title, items: [] });
    const later: Group = { key: "later", act: null, title: "Later in the course", items: [] };
    for (const c of shown) {
      const job = c.introducedIn ? jobs[c.introducedIn] : null;
      (job ? (byAct.get(`act-${job.act}`) ?? later) : later).items.push(c);
    }
    return [...byAct.values(), later].filter((g) => g.items.length > 0);
  }, [shown, acts, jobs]);

  return (
    <div className={styles.index}>
      <header className={styles.head}>
        <h1 className={styles.title}>Python Handbook</h1>
        <p className={styles.lede}>Every idea in the course, in the order the projects use them.</p>
      </header>
      <div className={styles.controls}>
        <label className={styles.search}>
          <Icon name="search" />
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
          <nav className={styles.contents} aria-label="Handbook sections">
            <ol className={styles.contentsList}>
              {groups.map((g) => (
                <li key={g.key}>
                  <a href={`#${g.key}`}>
                    {g.act ? <span className={styles.square} style={square(g.act)} aria-hidden="true" /> : <span className={styles.squareEmpty} aria-hidden="true" />}
                    <span className={styles.contentsName}>
                      {g.act ? `Act ${g.act}, ` : ""}
                      {g.title}
                    </span>
                    <span className={styles.contentsCount}>{g.items.length}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className={styles.groups}>
          {groups.length === 0 ? <p className={styles.empty}>Nothing in the Handbook matches that. Try a shorter word.</p> : null}
          {groups.map((g) => (
            <section key={g.key} id={g.key} className={styles.group} aria-labelledby={`${g.key}-title`}>
              <h2 id={`${g.key}-title`} className={styles.groupTitle}>
                {g.act ? (
                  <span className={styles.groupAct}>
                    <span className={styles.square} style={square(g.act)} aria-hidden="true" />
                    Act {g.act}
                  </span>
                ) : null}
                <span className={styles.groupName}>{g.title}</span>
              </h2>
              <ul className={styles.list}>
                {g.items.map((c) => {
                  const job = c.introducedIn ? jobs[c.introducedIn] : null;
                  const level = strengthOf(cards[c.id]);
                  return (
                    <li key={c.id} className={styles.item}>
                      <Link href={`/handbook/${c.id}`} className={styles.itemTitle}>
                        {c.title}
                      </Link>
                      <span className={styles.itemMeta}>{job ? (job.number ? `Project ${job.number}, ${job.title}` : job.title) : "Coming in a later project"}</span>
                      {level !== "unseen" ? <Strength level={level} className={styles.itemStrength} /> : null}
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
