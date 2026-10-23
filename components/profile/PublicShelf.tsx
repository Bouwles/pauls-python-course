// A learner's public page (/u/<address>): their character, their name, and the Shelf, by Act.
// Same shelves as components/shelf, but nothing to open: no code, no dates, no times.
import { defaultLook } from "@/lib/pixel/learner";
import type { CharacterLook } from "@/lib/store/types";
import { LearnerSprite } from "../world/LearnerSprite";
import { ShelfObject } from "../shelf/ShelfObject";
import shelf from "../shelf/Shelf.module.css";
import styles from "./PublicShelf.module.css";

export interface PublicAct {
  id: string;
  label: string;
  title: string;
  items: { jobId: string; title: string; object: string; label: string }[];
}

const PER_SHELF = 6;

export function PublicShelf({ name, character, shipped, acts }: { name: string; character: CharacterLook | null; shipped: number; acts: PublicAct[] }) {
  return (
    <div className={styles.layout}>
      <header className={styles.who}>
        <div className={styles.sprite}>
          <LearnerSprite look={character ?? defaultLook()} scale={4} label={`${name}'s character`} />
        </div>
        <div className={styles.text}>
          <h1 className={styles.name}>{name}</h1>
          <p className={styles.line}>Apprentice at Moss&apos;s repair shop, Saltmarsh.</p>
          <p className={styles.meta}>{shipped === 0 ? "Nothing shipped yet." : `${shipped} ${shipped === 1 ? "Job" : "Jobs"} shipped.`}</p>
        </div>
      </header>

      <section className={styles.shelf} aria-labelledby="shelf-title">
        <h2 id="shelf-title" className={styles.h2}>
          The Shelf
        </h2>
        {acts.length === 0 ? (
          <p className={styles.meta}>Nothing on the shelf yet.</p>
        ) : (
          acts.map((act) => {
            const rows: PublicAct["items"][] = [];
            for (let i = 0; i < act.items.length; i += PER_SHELF) rows.push(act.items.slice(i, i + PER_SHELF));
            return (
              <section key={act.id} className={styles.act} aria-labelledby={`act-${act.id}`}>
                <h3 id={`act-${act.id}`} className={styles.actTitle}>
                  <span className={styles.actNo}>{act.label}</span> {act.title}
                </h3>
                <div className={shelf.unit}>
                  {rows.map((row, r) => (
                    <ul key={r} className={shelf.board} aria-label={rows.length > 1 ? `${act.title}, shelf ${r + 1}` : act.title}>
                      {row.map((i) => (
                        <li key={i.jobId} className={styles.item}>
                          <ShelfObject id={i.object} />
                          <span className={shelf.objectLabel}>{i.label}</span>
                          <span className={[shelf.objectLabel, styles.job].join(" ")}>{i.title}</span>
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
