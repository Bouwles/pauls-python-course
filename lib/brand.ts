// Every brand string lives here. Nothing else may hard-code the name.

export const BRAND = {
  name: "Paul's Python Course",
  shortName: "PPC",
  tagline: "Python with the class, in the Clocktower.",
  description: "Paul's Python class for his friends, with projects that take you from a first print() to machine learning alongside Paul, Neil and the rest of the class.",
  domain: "paulspythoncourse.com",
  supportEmail: "hello@paulspythoncourse.example",
  creditName: "Paul Nercessian",
  /** Set to a URL to make the credit name a link. */
  creditUrl: null as string | null,
};

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;
