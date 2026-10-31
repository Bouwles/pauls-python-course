import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { LinkButton } from "@/components/ui/Button";
import styles from "@/components/site/NotFound.module.css";

export const metadata: Metadata = { title: "Not found" };

/** The Clocktower's clock, stuck at 3:14 as it has been for years (REDESIGN-2.md 7.2). */
function StuckClock() {
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);
  // 3:14: the hour hand a little past three, the minute hand on fourteen.
  const hour = (3 + 14 / 60) * 30;
  const minute = 14 * 6;
  return (
    <svg className={styles.clock} viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="56" className={styles.face} />
      {ticks.map((a) => (
        <line key={a} x1="60" y1="12" x2="60" y2={a % 90 === 0 ? 22 : 18} className={styles.tick} transform={`rotate(${a} 60 60)`} />
      ))}
      <line x1="60" y1="60" x2="60" y2="34" className={styles.hand} transform={`rotate(${hour} 60 60)`} />
      <line x1="60" y1="60" x2="60" y2="22" className={styles.hand} transform={`rotate(${minute} 60 60)`} />
      <circle cx="60" cy="60" r="5" className={styles.pin} />
    </svg>
  );
}

export default function NotFound() {
  return (
    <Page narrow>
      <div className={styles.wrap}>
        <StuckClock />
        <h1 className={styles.title}>This page isn&apos;t here</h1>
        <p className={styles.text}>The link may be old or mistyped. The clock on the tower has said 3:14 for years, so you&apos;re in good company.</p>
        <div className={styles.row}>
          <LinkButton href="/" variant="primary">
            Go to the home page
          </LinkButton>
          <LinkButton href="/syllabus" variant="secondary">
            See the syllabus
          </LinkButton>
        </div>
      </div>
    </Page>
  );
}
