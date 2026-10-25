// Applies display settings to <html> and remembers them for the next first paint
// (the inline script in app/layout.tsx reads the same localStorage key).
import type { Settings } from "./store/types";

export function applyDisplaySettings(s: Settings) {
  if (typeof document === "undefined") return;
  const d = document.documentElement;
  // Night is the default; "system" lets the CSS follow the device (light devices get day).
  d.dataset.theme = s.theme;
  if (s.prose === "hyperlegible") d.dataset.prose = "hyperlegible";
  else delete d.dataset.prose;
  if (s.motion === "reduced") d.dataset.motion = "reduced";
  else delete d.dataset.motion;
  d.style.setProperty("--editor-font-size", `${s.editorFontSize}px`);
  try {
    localStorage.setItem("ppc-display", JSON.stringify({ theme: s.theme, prose: s.prose, motion: s.motion, editorFontSize: s.editorFontSize }));
  } catch {
    // Private windows can refuse storage; the settings still apply for this visit.
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.dataset.motion === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** "Job 3", or "Sidequest" and "Placement" for the unnumbered kinds. */
export function jobLabel(job: { number: number; sidequest?: boolean; placementFor?: string | null }): string {
  if (job.placementFor) return "Placement";
  if (job.sidequest) return "Sidequest";
  return `Job ${job.number}`;
}

/** "45 minutes", "an hour and a half", "20 hours": estimates read the way people say them. */
export function duration(minutes: number): string {
  if (minutes < 75) return `${minutes} minutes`;
  if (minutes < 105) return "an hour and a half";
  const hours = Math.round(minutes / 60);
  return `${hours} hours`;
}
