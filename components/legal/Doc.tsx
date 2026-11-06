import { Icon } from "../ui/Icon";
import styles from "./Doc.module.css";

/** A plain page to read (credits, privacy, terms): a title, then the text at reading size. */
export function Doc({ title, lede, draft = false, children }: { title: string; lede?: string; draft?: boolean; children: React.ReactNode }) {
  return (
    <article className={styles.doc}>
      <header className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
      </header>
      {draft ? (
        <p className={styles.draft}>
          <Icon name="warning" />
          <span>This is a draft, not a final legal document.</span>
        </p>
      ) : null}
      <div className={`prose ${styles.body}`}>{children}</div>
    </article>
  );
}
