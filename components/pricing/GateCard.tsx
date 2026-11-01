import { floorFor } from "@/lib/cast";
import { FloorFace } from "../clocktower/Tower";
import { Speech } from "../art/Speech";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";
import styles from "./ProGate.module.css";

// Who greets you at each locked floor, and what they say about it: the floor's resident, in
// their own voice (the Arcade is Caitlin's half; the roof is Paul's to show off).
const RESIDENT: Record<number, { who: string; text: string; face: string; gesture: string }> = {
  2: { who: "caitlin", text: "The Studio's up here. Files, classes, tests: the bits that make code last. Coming up?", face: "pleased", gesture: "wave" },
  3: { who: "riya", text: "This is the Makerspace. We make real things for real people up here, and some art.", face: "pleased", gesture: "wave" },
  4: { who: "neil", text: "Welcome to the Puzzle Room. Algorithms all day, and a racing sim for the breaks.", face: "laughing", gesture: "point" },
  5: { who: "yahya", text: "The Archive. Real datasets, and I've already timed my answers. Want to try beating them?", face: "proud", gesture: "thumbs" },
  6: { who: "paul", text: "The Model Room. We teach machines to learn, then check what they actually learned.", face: "pleased", gesture: "point" },
  7: { who: "aaesha", text: "The Engine Room. Neural networks from the chain rule up. How will you know yours learned?", face: "thinking", gesture: "think" },
  8: { who: "caitlin", text: "The Arcade. Your code learns to play the games, and yes, there's a high score.", face: "laughing", gesture: "cheer" },
  9: { who: "paul", text: "The roof. Two capstones of your choice, and the view is worth the stairs.", face: "pleased", gesture: "wave" },
};

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/**
 * The paywall gate's card (REDESIGN-2.md 6): the locked floor's room (its pixel art with the
 * lights on, so you see the room you'd get, and a lock beside its name), the floor's resident
 * saying what's up there, then what's locked, a short explanation, and the two choices. Shared by
 * the locked-project page and the gate after Act I.
 */
export function GateCard({ act, subject, kicker, title, titleId, children, actions, as: As = "section", h = "h1" }: { act: number; subject: string; kicker: string; title: string; titleId: string; children: React.ReactNode; actions: React.ReactNode; as?: "section" | "div"; h?: "h1" | "h2" }) {
  const floor = floorFor(act);
  const resident = RESIDENT[act];
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
        {resident ? <Speech who={resident.who} name={cap(resident.who)} text={resident.text} face={resident.face} gesture={resident.gesture} size={112} className={styles.resident} /> : null}
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
