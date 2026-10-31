import styles from "./BrowserFrame.module.css";

/** A clean browser window around a picture of the product, or the product itself. */
export function BrowserFrame({ address, children, className, label }: { address: string; children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div className={[styles.frame, className].filter(Boolean).join(" ")} role={label ? "group" : undefined} aria-label={label}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.address}>{address}</span>
        <span className={styles.spacer} />
      </div>
      <div className={styles.view}>{children}</div>
    </div>
  );
}
