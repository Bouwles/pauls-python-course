// A learner's public page (/u/<address>): their pixel avatar, waving hello, their name, and what
// they've shipped, by Act, each with the classmate it was made for, pleased with it. Nothing
// private: no code here, no dates, no times. Each project links to its own page.
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { CAST_IDS, castColour, floorFor } from "@/lib/cast";
import { avatarBackground } from "@/lib/pixel/looks";
import { PixelPerson } from "../art/PixelPerson";
import { ShelfObject } from "../art/ShelfObject";
import styles from "./PublicShelf.module.css";

export interface PublicAct {
  id: string;
  number: number;
  title: string;
  items: { jobId: string; name: string; client: string; clientName: string }[];
}

export function PublicShelf({ name, character, shipped, acts, slug }: { name: string; character: unknown; shipped: number; acts: PublicAct[]; slug?: string }) {
  return (
    <div className={styles.layout}>
      <header className={styles.who}>
        <span className={`px-panel ${styles.avatar}`} style={{ background: avatarBackground(character) }}>
          <PixelPerson avatar={character} crop="bust" scale={3} expression="pleased" pose="wave" label={`${name}'s avatar`} />
        </span>
        <div className={styles.text}>
          <h1 className={styles.name}>{name}</h1>
          <p className={styles.line}>
            Learning Python at {BRAND.name}. {shipped === 0 ? "Nothing shipped yet." : `${shipped} ${shipped === 1 ? "project" : "projects"} shipped.`}
          </p>
        </div>
      </header>

      {acts.length === 0 ? (
        <p className={styles.meta}>Nothing shipped yet. Projects appear here as they're finished.</p>
      ) : (
        acts.map((act) => (
          <section key={act.id} className={styles.act} aria-labelledby={`act-${act.id}`}>
            <h2 id={`act-${act.id}`} className={styles.actTitle}>
              <span className={styles.marker} style={{ background: castColour(floorFor(act.number)?.residents[0] ?? "").face }} aria-hidden="true" />
              Act {act.number}: {act.title}
            </h2>
            <ul className={styles.grid}>
              {act.items.map((i) => {
                const inner = (
                  <>
                    {(CAST_IDS as readonly string[]).includes(i.client) ? (
                      <span className={styles.client} style={{ background: castColour(i.client).face }} aria-hidden="true">
                        <PixelPerson who={i.client} crop="head" scale={2} expression="pleased" />
                      </span>
                    ) : (
                      <ShelfObject jobId={i.jobId} title={i.name} client={i.client} size={64} />
                    )}
                    <span className={styles.cardText}>
                      <span className={styles.project}>{i.name}</span>
                      <span className={styles.meta}>For {i.clientName}</span>
                    </span>
                  </>
                );
                return (
                  <li key={i.jobId}>
                    {slug ? (
                      <Link href={`/u/${slug}/${i.jobId}`} className={["px-panel", styles.card, styles.link].join(" ")}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={`px-panel ${styles.card}`}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      <footer className={styles.foot}>
        <p className={styles.meta}>{BRAND.tagline}</p>
        <Link href="/">Start the first project, free</Link>
      </footer>
    </div>
  );
}
