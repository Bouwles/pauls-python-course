// Every brand string lives here (REDESIGN-2.md 1). Nothing else may hard-code the name.

export const BRAND = {
  name: "Paul's Python Course",
  shortName: "PPC",
  tagline: "Python with the class, in the Clocktower.",
  description: "Paul's Python class for friends: projects in Python, from a first print() to machine learning, with Paul, Neil and the class.",
  domain: "paulspythoncourse.example", // the owner will replace this
  supportEmail: "hello@paulspythoncourse.example",
  creditName: "Paul Nercessian",
  /** Set to a URL to make the credit name a link. */
  creditUrl: null as string | null,
};

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;
