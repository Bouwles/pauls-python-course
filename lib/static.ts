// The GitHub Pages build (scripts/build-pages.ts) is the course as plain files: no server, so no
// accounts, syncing or classes; everyone is a guest whose progress lives in their browser, and the
// checks and solutions are read from files instead of asked for. This says which build this is.

/** True in the GitHub Pages build. */
export const STATIC = process.env.NEXT_PUBLIC_PPC_STATIC === "1";

/** Where the site lives under its domain: "" locally, "/pauls-python-course" on GitHub Pages. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** A file in public/ by its path from the root, with the base in front ("/pyodide/x" works anywhere). */
export const asset = (path: string) => `${BASE}${path}`;

/**
 * A page of the course by its path from the root, for a plain link ("/job/bill-splitter"). Links
 * made with next/link get all this from Next; a plain <a>, or a link in HTML made from Markdown,
 * gets it here: the base in front, and on GitHub Pages the closing slash every page's folder has
 * there. Without it the link leaves the course ("github.io/job/...") for GitHub's own 404 page.
 * Anything that isn't a path from the root (another site, "#top", "mailto:") comes back as it is.
 */
export function page(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) return path;
  const [, pathname = "", rest = ""] = /^([^?#]*)(.*)$/.exec(path) ?? [];
  const isFile = /\.[A-Za-z0-9]+$/.test(pathname);
  const slash = STATIC && !isFile && !pathname.endsWith("/") ? "/" : "";
  return `${BASE}${pathname}${slash}${rest}`;
}
