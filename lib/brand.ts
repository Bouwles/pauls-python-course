// Every brand string lives here (REDESIGN-2.md 1). Nothing else may hard-code the name.

export const BRAND = {
  name: "Paul's Python Course",
  shortName: "PPC",
  tagline: "Learn Python by building real things.",
  description:
    "Paul's Python Course takes you from your first line of Python to machine learning and reinforcement learning, one real project at a time. A bill splitter, a to-do app, a weather app, a Flask website, a spam filter, a game-playing AI. You write real code in your browser, and everything you build is yours to keep.",
  domain: "paulspythoncourse.example", // the owner will replace this
  supportEmail: "hello@paulspythoncourse.example",
  creditName: "Paul Nercessian",
  /** Set to a URL to make the credit name a link. */
  creditUrl: null as string | null,
};

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;
