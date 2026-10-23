import styles from "./Doc.module.css";

export function Doc({ title, draft = false, children }: { title: string; draft?: boolean; children: React.ReactNode }) {
  return (
    <article className={styles.doc}>
      <h1 className={styles.title}>{title}</h1>
      {draft ? <p className={styles.draft}>Draft for the owner to review before launch. It is not yet a final legal document.</p> : null}
      <div className="prose">{children}</div>
    </article>
  );
}
