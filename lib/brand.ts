// Every brand string lives here. Nothing else may hard-code the name.

export const BRAND = {
  name: "Paul's Python Course",
  shortName: "PPC",
  tagline: "Python with the class, in the Clocktower.",
  description: "A free Python course in your browser, with nothing to install. Build real projects from your first print() to machine learning, neural networks and a tiny GPT, alongside Paul, Neil and the rest of the class.",
  domain: "paulspythoncourse.com",
  supportEmail: "hello@paulspythoncourse.example",
  creditName: "Paul Nercessian",
  /** Set to a URL to make the credit name a link. */
  creditUrl: null as string | null,
};

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;
