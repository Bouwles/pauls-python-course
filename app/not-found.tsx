import type { Metadata } from "next";
import { getIndex } from "@/lib/content/server";
import { ASSISTANT } from "@/lib/cast";
import { Page } from "@/components/site/Page";
import { PixelClock } from "@/components/site/PixelClock";
import { VisitSpeech } from "@/components/site/VisitSpeech";
import { NotFoundScene } from "@/components/site/NotFoundScene";
import { LinkButton } from "@/components/ui/Button";
import styles from "@/components/site/NotFound.module.css";

export const metadata: Metadata = { title: "Not found" };

/**
 * A page that isn't there (REDESIGN3_PLAN.md P3): the Clocktower's clock, stuck at 3:14 as it has
 * been for years, and Neil, who helps when you're stuck, as puzzled as you are: he walks into an
 * empty room, looks round, and says so (with a different gesture each visit).
 */
export default function NotFound() {
  const neil = getIndex().characters[ASSISTANT]?.name ?? "Neil";
  return (
    <Page narrow>
      <div className={styles.wrap}>
        <PixelClock scale={4} className={styles.clock} />
        <h1 className={styles.title}>This page isn&apos;t here</h1>
        <NotFoundScene who={ASSISTANT} />
        <VisitSpeech place="404" who={ASSISTANT} name={neil} text="Okay. What did you expect to find here? Because this room's empty." face="confused" gesture="think" size={112} className={styles.speech} />
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
