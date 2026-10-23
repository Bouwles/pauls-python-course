// Formatting for teacher and class mode, shared by server pages and client components.
import type { JobStatus } from "./store/types";

/** "3 Nov", or "3 Nov 2027" outside this year. Due dates are stored at midday UTC, so read them in UTC. */
export function shortDate(ms: number, now = Date.now(), timeZone: string | undefined = undefined): string {
  const sameYear = new Date(ms).getUTCFullYear() === new Date(now).getUTCFullYear();
  return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: sameYear ? undefined : "numeric", timeZone });
}

export const dueDate = (ms: number, now = Date.now()) => shortDate(ms, now, "UTC");

/** For a date input's value. */
export const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** "0 min", "25 min", "3 h 5 min". */
export function duration(seconds: number): string {
  if (seconds <= 0) return "0 min";
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** "Today", "Yesterday", "4 days ago", then the date. */
export function lastActive(ms: number | null, now = Date.now()): string {
  if (!ms) return "Not yet";
  const startOfDay = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOfDay(now) - startOfDay(ms)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return shortDate(ms, now);
}

export function statusLabel(status: JobStatus): string {
  switch (status) {
    case "shipped":
      return "Shipped";
    case "shipped-stretch":
      return "Shipped, with stretch";
    case "placed":
      return "Placed by test";
    case "in-progress":
      return "In progress";
    default:
      return "Not started";
  }
}
