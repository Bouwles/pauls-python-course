// The real artefacts on the landing page's "What you'll build" (REDESIGN-2.md 6): what the
// projects' reference solutions actually print and serve, read from the compiled content at
// render time, so they follow the content when it changes. Each has a fallback that matches the
// reference solution as it stood when this was written, in case a project moves.
import { getIndex, getJob, getSolution } from "@/lib/content/server";
import type { JobSummary } from "@/lib/content/types";

export interface Project {
  id: string;
  title: string;
  act: number;
  /** Who it's for, by id, for their colour. */
  client: string;
  free: boolean;
}

function project(id: string, fallback: Omit<Project, "id" | "free">): Project {
  const index = getIndex();
  for (const act of index.acts) {
    const j: JobSummary | undefined = act.jobs.find((x) => x.id === id);
    if (j) return { id, title: j.title, act: act.number, client: j.client, free: act.number === index.acts[0]?.number };
  }
  return { id, ...fallback, free: fallback.act === 1 };
}

/** A project's example run, from its Ask (the reference solution prints exactly this). */
function example(id: string): string | null {
  const ask = getJob(id)?.steps.find((s) => s.type === "ask");
  return ask && ask.type === "ask" && ask.example ? ask.example.trimEnd() : null;
}

/** One line of a terminal: what the program printed, and what the person typed after a prompt. */
export interface TermLine {
  out: string;
  typed?: string;
}

/** Splits "Bill? 41.40" into the prompt and the answer typed after it. */
function terminal(text: string, prompts: RegExp): TermLine[] {
  return text.split("\n").map((line) => {
    const m = line.match(prompts);
    return m ? { out: m[1]!, typed: m[2]! } : { out: line };
  });
}

// ---- Bill Splitter (Act I) ----------------------------------------------------------------

const BILL_FALLBACK = "Bill? 41.40\nPeople? 6\nTip (%)? 10\nTotal with tip: 45.54\nEach pays: 7.59";

export function billSplitter() {
  return {
    project: project("bill-splitter", { title: "Bill Splitter", act: 1, client: "riya" }),
    run: terminal(example("bill-splitter") ?? BILL_FALLBACK, /^([^:]*\? )(.+)$/),
  };
}

// ---- Weather App (Act III) ----------------------------------------------------------------

const WEATHER_FALLBACK = [
  "Where? Penzance",
  "Penzance, England, United Kingdom",
  "Sun 25 Oct: Light drizzle, 10 to 13°C, 90% chance of rain, wind up to 37 km/h",
  "Mon 26 Oct: Rain, 12 to 16°C, 100% chance of rain, wind up to 46 km/h",
  "Tue 27 Oct: Rain, 10 to 16°C, 96% chance of rain, wind up to 45 km/h",
  "Weather data by Open-Meteo.com",
].join("\n");

export function weatherApp() {
  return {
    project: project("weather-app", { title: "Weather App", act: 3, client: "riya" }),
    run: terminal(example("weather-app") ?? WEATHER_FALLBACK, /^(Where\? )(.+)$/),
  };
}

// ---- The Flask web app (the Act IX capstone: the course's Flask app with a reference) ------

export interface FlaskPage {
  heading: string;
  booked: string | null;
  night: string;
  nightIso: string;
  rows: { berth: string; longest: string; who: string }[];
}

const BERTHS_FALLBACK = [
  { id: 1, name: "Pontoon A", max: 8.0 },
  { id: 2, name: "Pontoon B", max: 10.0 },
  { id: 3, name: "Pontoon C", max: 10.0 },
  { id: 4, name: "North Quay", max: 15.0 },
  { id: 5, name: "Harbour Wall", max: 24.0 },
];

/**
 * The front page the Berth Booking app serves, the night of the booking in its example run:
 * the heading from its template, the berths from berths.py, and the booking the example makes.
 */
export function flaskApp(): { project: Project; page: FlaskPage } {
  const files = getSolution("capstone-web-app/harbour-app") ?? {};
  const template = files["templates/index.html"] ?? "";
  // The heading as the template writes it; anything Jinja would fill in is left out.
  const heading = (template.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "").replace(/\{[{%][\s\S]*?[}%]\}/g, "").replace(/\s+/g, " ").trim() || "Visitor berths";
  const berths = [...(files["berths.py"] ?? "").matchAll(/"id":\s*(\d+),\s*"name":\s*"([^"]+)",\s*"max_length":\s*([\d.]+)/g)].map((m) => ({ id: Number(m[1]), name: m[2]!, max: Number(m[3]) }));
  const json = (example("capstone-web-app") ?? "").split("\n").reverse().find((l) => l.trim().startsWith("{"));
  let booking = { id: 1, boat: "Kittiwake", berth: 2, date: "2027-04-10", nights: 2 };
  try {
    if (json) booking = { ...booking, ...(JSON.parse(json) as Partial<typeof booking>) };
  } catch {
    // Keep the fallback booking.
  }
  const night = new Date(`${booking.date}T12:00:00Z`);
  const nightText = Number.isNaN(night.getTime()) ? booking.date : night.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
  const list = berths.length ? berths : BERTHS_FALLBACK;
  return {
    project: project("capstone-web-app", { title: "Berth Booking Web App", act: 9, client: "paul" }),
    page: {
      heading: heading.charAt(0).toUpperCase() + heading.slice(1),
      booked: `Booking ${booking.id}: ${booking.boat}, ${booking.nights} night${booking.nights === 1 ? "" : "s"} from ${booking.date}.`,
      night: nightText,
      nightIso: booking.date,
      rows: list.map((b) => ({ berth: b.name, longest: `${b.max.toFixed(1)} m`, who: b.id === booking.berth ? booking.boat : "free" })),
    },
  };
}

// ---- Spam Filter (Act VI) -----------------------------------------------------------------

/**
 * The spam filter's confusion matrix. The project has no reference solution yet, so these are
 * from a Naive Bayes written from scratch as the project describes it (word counts per class, log
 * probabilities, add-one smoothing), trained on four fifths of the SMS Spam Collection (UCI,
 * CC BY 4.0, 5,574 messages, shuffled with seed 42) and tested on the other 1,115. Replace them
 * with the reference solution's numbers when it's written.
 */
export function spamFilter() {
  return {
    project: project("spam-filter", { title: "Spam Filter", act: 6, client: "riya" }),
    matrix: { spamAsSpam: 150, spamAsHam: 9, hamAsSpam: 16, hamAsHam: 940 },
  };
}

// ---- Snake (Act III) ----------------------------------------------------------------------

export function snake() {
  return { project: project("snake", { title: "Snake", act: 3, client: "caitlin" }) };
}
