import { ASSISTANT, CLASSMATES, PROFESSOR } from "@/lib/cast";
import { Portrait } from "../art/Portrait";
import { SpeechBubble } from "../ui/SpeechBubble";
import styles from "./MeetTheClass.module.css";

// "Meet the class" (REDESIGN-2.md 6 and 7): the six people in the Clocktower, each with a
// portrait (a placeholder until the illustrations arrive), their role, and one line in their
// own voice. The two teachers first, then the four classmates.

const ROLE: Record<string, string> = {
  paul: "The professor. Runs the course, gives the worked examples and reviews your code.",
  neil: "The teaching assistant. Hints when you're stuck, and every error explained.",
  aaesha: "Classmate. Data and tests.",
  caitlin: "Classmate. Games, web apps and making things.",
  riya: "Classmate. Practical projects and machine learning.",
  yahya: "Classmate. Algorithms, speed and the Arcade.",
};

const LINE: Record<string, string> = {
  paul: "Build it ugly first. Then make it good.",
  neil: "Okay. What did you expect it to print? What did it actually print?",
  aaesha: "Before you run it, how will you know it worked?",
  caitlin: "It works. It's ugly. Shipping it.",
  riya: "My model's 99% accurate. Wait. That's suspicious.",
  yahya: "Mine runs in 0.02 seconds. Yours?",
};

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

function Person({ id, name, lead }: { id: string; name: string; lead?: boolean }) {
  return (
    <li className={lead ? styles.lead : styles.mate}>
      <div className={styles.who}>
        <Portrait who={id} name={name} size={lead ? 88 : 64} />
        <div className={styles.text}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.role}>{ROLE[id]}</p>
        </div>
      </div>
      <SpeechBubble who={id} tail="top" className={styles.bubble}>
        <p>{LINE[id]}</p>
      </SpeechBubble>
    </li>
  );
}

export function MeetTheClass({ names }: { names: Record<string, string> }) {
  const n = (id: string) => names[id] ?? cap(id);
  return (
    <div className={styles.wrap}>
      <ul className={styles.teachers}>
        {[PROFESSOR, ASSISTANT].map((id) => (
          <Person key={id} id={id} name={n(id)} lead />
        ))}
      </ul>
      <ul className={styles.classmates}>
        {CLASSMATES.map((id) => (
          <Person key={id} id={id} name={n(id)} />
        ))}
      </ul>
    </div>
  );
}
