// Every brand string lives here (REDESIGN.md 1.2): the owner may still change the
// name before buying a domain. Nothing else may hard-code it; content files use
// {{town}}, which the content compiler replaces with BRAND.townName.

export const BRAND = {
  name: "Fixwick",
  townName: "Fixwick",
  tagline: "Learn Python by fixing a town.",
  description:
    "Fixwick is a Python course built as a game. Townsfolk bring you real programs to build, from a bill splitter to a spam filter to a game-playing AI. You write real code in your browser, and everything you build is yours to keep.",
  domain: "fixwick.example", // the owner will replace this
  supportEmail: "hello@fixwick.example",
  creditName: "Paul Nercessian",
  /** Set to a URL to make the credit name a link. */
  creditUrl: null as string | null,
};

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;
