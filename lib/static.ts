// The GitHub Pages build (scripts/build-pages.ts) is the course as plain files: no server, so no
// accounts, syncing or classes; everyone is a guest whose progress lives in their browser, and the
// checks and solutions are read from files instead of asked for. This says which build this is.

/** True in the GitHub Pages build. */
export const STATIC = process.env.NEXT_PUBLIC_PPC_STATIC === "1";

/** Where the site lives under its domain: "" locally, "/pauls-python-course" on GitHub Pages. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** A file in public/ by its path from the root, with the base in front ("/pyodide/x" works anywhere). */
export const asset = (path: string) => `${BASE}${path}`;
