// The funnel's steps, in order (REDESIGN.md 9.3). Shared by the browser, the server and the
// owner's metrics page.
export const FUNNEL = [
  ["visit-landing", "Visited the landing page"],
  ["guest-start", "Started the first project as a guest"],
  ["sign-up", "Signed up"],
  ["ship-1", "Shipped project 1"],
  ["ship-5", "Shipped project 5"],
  ["ship-capstone", "Shipped the Act I capstone"],
  ["view-paywall", "Saw the paywall"],
  ["start-checkout", "Started checkout"],
  ["subscribe", "Subscribed"],
  ["cancel", "Cancelled"],
] as const;

export type FunnelEvent = (typeof FUNNEL)[number][0];

export const FUNNEL_EVENTS = new Set<string>(FUNNEL.map(([e]) => e));
