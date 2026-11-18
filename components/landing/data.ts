// What the landing page reads from the content at build time: the Acts with their counts and a
// few project names each, the totals, the first project, and the cast's names. Server only (it
// reads generated/content); the page passes the result to <Landing> as props.
import { getIndex } from "@/lib/content/server";

export interface LandingAct {
  number: number;
  /** The room: "The Workshop". */
  room: string;
  /** What it teaches: "Foundations". */
  subject: string;
  hours: number;
  projects: number;
  /** A few of the programs you build there, by their plain names. */
  examples: string[];
}

export interface LandingData {
  acts: LandingAct[];
  /** Every project in the syllabus, written or still being written. */
  totalProjects: number;
  /** The ones you can play today. */
  writtenProjects: number;
  totalHours: number;
  firstProject: { title: string; minutes: number };
  names: Record<string, string>;
}

// The README's examples for each floor, looked up in the content so a renamed or dropped project
// falls out instead of being shown. A floor left with fewer than three is filled from its own list.
const PICKS: Record<number, string[]> = {
  1: ["Bill Splitter", "To-Do List", "Rock Paper Scissors"],
  2: ["Quiz App", "Bank Account System", "Text Adventure Engine"],
  3: ["Weather App", "Snake", "Flask Web App", "Chat Bot"],
  4: ["Hash Map from Scratch", "Maze Solver", "Sudoku Solver"],
  5: ["Census Explorer", "Earth Data Map", "Data Story"],
  6: ["Spam Filter", "Movie Recommender", "Fishing Forecast"],
  7: ["Neural Network from Scratch", "Tiny Autograd Engine", "Tiny GPT"],
  8: ["Q-Learning Crab", "Snake AI", "CartPole with DQN"],
  9: ["Paper Reproduction", "Your Own Project"],
};

export function landingData(): LandingData {
  const index = getIndex();
  const acts = index.acts.map((a): LandingAct => {
    const jobs = a.jobs.filter((j) => !j.placementFor);
    const names = jobs.filter((j) => !j.sidequest).map((j) => j.projectName || j.title);
    const examples = (PICKS[a.number] ?? []).filter((p) => names.includes(p)).slice(0, 3);
    for (const n of [...names].reverse()) if (examples.length < 2 && !examples.includes(n)) examples.push(n);
    return { number: a.number, room: a.title, subject: a.subject, hours: a.hours, projects: jobs.length, examples };
  });
  // Counted the way the syllabus counts them: everything but the placement tests.
  const numbered = index.acts.flatMap((a) => a.jobs.filter((j) => !j.placementFor));
  const first = index.acts[0]?.jobs[0];
  return {
    acts,
    totalProjects: numbered.length,
    writtenProjects: numbered.filter((j) => j.status === "written").length,
    totalHours: index.acts.reduce((n, a) => n + a.hours, 0),
    firstProject: { title: first?.title ?? "Course Sign", minutes: first?.estimatedMinutes ?? 20 },
    names: Object.fromEntries(Object.values(index.characters).map((c) => [c.id, c.name])),
  };
}
