// The funnel's steps, in order. Shared by the browser, the server and the
// metrics page.
export const FUNNEL = [
  ["visit-landing", "Visited the landing page"],
  ["guest-start", "Started the first project as a guest"],
  ["sign-up", "Signed up"],
  ["ship-1", "Shipped project 1"],
  ["ship-5", "Shipped project 5"],
] as const;

export type FunnelEvent = (typeof FUNNEL)[number][0];

export const FUNNEL_EVENTS = new Set<string>(FUNNEL.map(([e]) => e));
