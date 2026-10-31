import { floorFor } from "@/lib/cast";
import { FloorFace } from "../clocktower/Tower";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";
import styles from "./ProGate.module.css";

/**
 * The paywall gate's card (REDESIGN-2.md 6): the locked floor's illustration slot (for now its
 * placeholder, the resident's colour and the room's icon), then what's locked, a short
 * explanation, and the two choices. The floor is drawn with its lights on, so you see the room
 * you'd get, and the lock beside its name says it's shut. Shared by the locked-project page and the gate after Act I.
 */
export function GateCard({ act, subject, kicker, title, titleId, children, actions, as: As = "section", h = "h1" }: { act: number; subject: string; kicker: string; title: string; titleId: string; children: React.ReactNode; actions: React.ReactNode; as?: "section" | "div"; h?: "h1" | "h2" }) {
  const floor = floorFor(act);
  const H = h;
  return (
    <As className={styles.card} aria-labelledby={titleId}>
      {floor ? (
        <div className={styles.art}>
          <FloorFace
            act={act}
            state="open"
            room={floor.room}
            sub={`${floor.label}: ${subject}`}
            badges={
              <span className={styles.lock}>
                <Icon name="lock" size={16} label="Locked" />
              </span>
            }
          />
        </div>
      ) : null}
      <div className={styles.body}>
        <p className={styles.kicker}>
          <Badge tone="pro">Pro</Badge>
          <span>{kicker}</span>
        </p>
        <H id={titleId} className={styles.title}>
          {title}
        </H>
        <div className={styles.text}>{children}</div>
        <div className={styles.row}>{actions}</div>
      </div>
    </As>
  );
}
