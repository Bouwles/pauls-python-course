// Where the public Python Handbook lives (REDESIGN.md 9.1). One place, so the sitemap, the
// links from projects and the pages themselves agree.
export const HANDBOOK = "/handbook";

export function handbookPath(conceptId?: string): string {
  return conceptId ? `${HANDBOOK}/${conceptId}` : HANDBOOK;
}
