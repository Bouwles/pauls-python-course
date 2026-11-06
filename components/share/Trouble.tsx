import Link from "next/link";
import { SHARE_PATH, type ShareKind, type ShareProblem } from "@/lib/share-links";
import styles from "./Share.module.css";

const KIND_NAME: Record<ShareKind, string> = { cert: "a certificate link", project: "a shared project", shelf: "a shared Shelf" };

/** What to say about a certificate or share link that doesn't read. */
export function ShareTrouble({ problem, kind, hash, what }: { problem: ShareProblem; kind?: ShareKind; hash: string; what: string }) {
  const [title, text] =
    problem === "empty"
      ? ["This link has nothing after the #", `The part that holds the ${what} didn't come through. Ask for the link again, and copy all of it.`]
      : problem === "newer"
        ? ["This link was made by a newer version of the course", "Reload this page and open the link again. If it still won't open, this copy of the course hasn't caught up yet."]
        : problem === "too-long"
          ? ["This link is far longer than any the course makes", "It may have been joined to something else when it was pasted. Ask for it again."]
          : problem === "wrong-kind" && kind
            ? [`This is ${KIND_NAME[kind]}`, "It opens on another page."]
            : ["This link didn't come through whole", "It may have been cut short or changed when it was copied. Ask for it again, and copy all of it."];
  return (
    <section className={`px-panel ${styles.trouble}`} aria-labelledby="trouble-title">
      <h1 id="trouble-title" className={styles.troubleTitle}>
        {title}
      </h1>
      <p className={styles.quiet}>{text}</p>
      <div className={styles.row}>
        {problem === "wrong-kind" && kind ? (
          <Link href={`${SHARE_PATH[kind]}#${hash}`} className={styles.back}>
            Open it there
          </Link>
        ) : null}
        <Link href="/" className={styles.back}>
          Go to the Clocktower
        </Link>
      </div>
    </section>
  );
}
