import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import styles from "./Page.module.css";

/** Chrome for every page that isn't the Workbench. */
export function Page({ children, narrow = false, wide = false, footer = true }: { children: React.ReactNode; narrow?: boolean; wide?: boolean; footer?: boolean }) {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main" className={[styles.main, narrow ? styles.narrow : "", wide ? styles.wide : ""].join(" ")}>
        {children}
      </main>
      {footer ? <SiteFooter /> : null}
    </div>
  );
}
