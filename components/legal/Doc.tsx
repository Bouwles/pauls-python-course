import { PixelIcon } from "../ui/PixelIcon";
import styles from "./Doc.module.css";

/** A plain page to read (credits, privacy, terms): a pixel title, and the text on a panel. */
export function Doc({ title, lede, draft = false, children }: { title: string; lede?: string; draft?: boolean; children: React.ReactNode }) {
  return (
    <article className={styles.doc}>
      <header className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
      </header>
      {draft ? (
        <p className={styles.draft}>
          <PixelIcon name="hint" />
          <span>Draft for the owner to review before launch. It is not yet a final legal document.</span>
        </p>
      ) : null}
      <div className={`frame-panel ${styles.body}`}>
        <div className="prose">{children}</div>
      </div>
    </article>
  );
}
