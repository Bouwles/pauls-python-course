"use client";

// A learner's public page (/u/<address>): their character, their name, and the Shelf, by Act.
// Same shelves as components/shelf, but nothing to open: no code, no dates, no times.
import { BRAND } from "@/lib/brand";
import { defaultLook } from "@/lib/pixel/learner";
import type { CharacterLook } from "@/lib/store/types";
import { LearnerSprite } from "../world/LearnerSprite";
import { ShelfObject } from "../shelf/ShelfObject";
import { usePerShelf } from "../shelf/Shelf";
import shelf from "../shelf/Shelf.module.css";
import styles from "./PublicShelf.module.css";

export interface PublicAct {
  id: string;
  label: string;
  title: string;
  items: { jobId: string; title: string; object: string; label: string }[];
}

export function PublicShelf({ name, character, shipped, acts, slug }: { name: string; character: CharacterLook | null; shipped: number; acts: PublicAct[]; slug?: string }) {
  const { wall, per } = usePerShelf(true);
  return (
    <div className={styles.layout}>
      <header className={`frame-panel ${styles.who}`}>
        <div className={styles.stage}>
          <LearnerSprite look={character ?? defaultLook()} scale={4} label={`${name}'s character`} />
        </div>
        <div className={styles.text}>
          <h1 className={styles.name}>{name}</h1>
          <p className={styles.line}>Apprentice at Moss&apos;s repair shop, {BRAND.townName}.</p>
          <p className={styles.meta}>{shipped === 0 ? "Nothing shipped yet." : `${shipped} ${shipped === 1 ? "Job" : "Jobs"} shipped.`}</p>
        </div>
      </header>

      <section className={styles.shelf} aria-labelledby="shelf-title" ref={wall}>
        <h2 id="shelf-title" className={styles.h2}>
          The Shelf
        </h2>
        {acts.length === 0 ? (
          <p className={styles.meta}>Nothing on the shelf yet.</p>
        ) : (
          acts.map((act) => {
            const rows: PublicAct["items"][] = [];
            for (let i = 0; i < act.items.length; i += per) rows.push(act.items.slice(i, i + per));
            return (
              <section key={act.id} className={styles.act} aria-labelledby={`act-${act.id}`}>
                <h3 id={`act-${act.id}`} className={styles.actTitle}>
                  <span className={styles.actNo}>{act.label}</span> {act.title}
                </h3>
                <div className={shelf.wall}>
                  {rows.map((row, r) => (
                    <ul key={r} className={shelf.board} style={{ "--per": per } as React.CSSProperties} aria-label={rows.length > 1 ? `${act.title}, shelf ${r + 1}` : act.title}>
                      {row.map((i) => (
                        <li key={i.jobId} className={shelf.slot}>
                          {/* Each project has its own page, with the code to run (REDESIGN.md 9.2). */}
                          <a href={slug ? `/u/${slug}/${i.jobId}` : undefined} className={[shelf.object, shelf.still].join(" ")}>
                            <span className={shelf.art}>
                              <ShelfObject id={i.object} scale={4} />
                            </span>
                            <span className={`frame-paper ${shelf.tag}`}>
                              {i.label}
                              <span className={styles.job}>{i.title}</span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </section>
    </div>
  );
}
