import { FLOORS } from "@/lib/cast";
import type { ActSummary } from "@/lib/content/types";
import { FloorResident } from "../site/FloorResident";
import styles from "./FloorDirectory.module.css";

// Beside the tower, the floors as a building's directory lists them, top floor first: who runs
// the room (their pixel self on their colour; the Arcade's two side by side), the room, the Act,
// and what it teaches. The roof is everyone's, so it shows the stuck clock instead.

const TEACHES: Record<number, string> = {
  1: "Printing, numbers, input, decisions, loops, lists, strings, functions, dictionaries and errors.",
  2: "Files, JSON, comprehensions, classes, tests, generators, decorators, the command line and Git.",
  3: "Web APIs, scraping, automation, games, and a Flask web app you put online.",
  4: "How long code takes, searching, sorting, recursion, hash maps, graphs and routes.",
  5: "NumPy, pandas, charts, statistics, and the maths machine learning leans on.",
  6: "Regression, classification, trees, clustering and PCA, from scratch and with scikit-learn.",
  7: "Neural networks from the chain rule up, then PyTorch, and a tiny GPT.",
  8: "Bandits, Q-learning, DQN, policy gradients and PPO, and the Arcade League.",
  9: "Two capstones of your choice, a portfolio, a timed paper and practice interviews.",
};

export function FloorDirectory({ acts, names }: { acts: Pick<ActSummary, "id" | "number" | "subject" | "jobs">[]; names: Record<string, string> }) {
  const floors = [...FLOORS].sort((a, b) => b.act - a.act);
  return (
    <ol className={styles.list} aria-label="What each floor teaches, top floor first">
      {floors.map((f) => {
        const act = acts.find((a) => a.number === f.act);
        const projects = act?.jobs.filter((j) => !j.sidequest && !j.placementFor).length ?? 0;
        return (
          <li key={f.act} className={styles.floor}>
            <FloorResident act={f.act} names={names} />
            <div className={styles.text}>
              <p className={styles.where}>
                <span className={styles.room}>{f.room}</span>
                <span className={styles.label}>
                  {f.label}, Act {f.act}
                </span>
              </p>
              <p className={styles.subject}>
                {act?.subject ?? ""}
                {projects ? <span className={styles.count}>{projects} projects</span> : null}
              </p>
              <p className={styles.teaches}>{TEACHES[f.act]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
