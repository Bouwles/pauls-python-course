import fs from "node:fs";
import { test, type Browser } from "@playwright/test";

// REDESIGN-2.md 10: twenty screenshots that between them show the whole app after the
// redesign, at 1440x900 and 390x844, dark and light. Named like the "before" set in
// tests/screenshots/redesign-2/before/.
//   PPC_SCREENSHOTS=1 npx playwright test redesign-screens
// The signed-in screens use the demo learner (npm run seed:demo), who has half of Act I done.
const OUT = process.env.PPC_SHOTS_OUT ?? "tests/screenshots/redesign-2/after";

type Theme = "dark" | "light";
interface Shot {
  name: string;
  path: string;
  theme: Theme;
  width: 1440 | 390;
  signedIn?: boolean;
}

const SHOTS: Shot[] = [
  // A visitor: the landing page, the first job as a guest, and the public pages.
  { name: "landing", path: "/", theme: "dark", width: 1440 },
  { name: "landing", path: "/", theme: "dark", width: 390 },
  { name: "job-ask", path: "/job/shop-sign?step=ask", theme: "dark", width: 1440 },
  { name: "job-predict", path: "/job/shop-sign?step=predict", theme: "light", width: 1440 },
  { name: "job-make", path: "/job/bill-splitter?step=make", theme: "dark", width: 1440 },
  { name: "job-make", path: "/job/bill-splitter?step=make", theme: "light", width: 1440 },
  { name: "job-make", path: "/job/bill-splitter?step=make", theme: "light", width: 390 },
  { name: "job-ship", path: "/job/shop-sign?step=ship", theme: "dark", width: 1440 },
  { name: "job-lamp-room", path: "/job/the-lamp-room?step=ask", theme: "dark", width: 1440 },
  { name: "handbook", path: "/handbook", theme: "dark", width: 1440 },
  { name: "syllabus", path: "/syllabus", theme: "dark", width: 1440 },
  { name: "concept", path: "/handbook/input-returns-text", theme: "light", width: 1440 },
  // The demo learner: the character, the town, and everything around the jobs.
  { name: "welcome", path: "/welcome", theme: "dark", width: 1440, signedIn: true },
  { name: "map", path: "/map", theme: "dark", width: 1440, signedIn: true },
  { name: "map", path: "/map", theme: "light", width: 390, signedIn: true },
  { name: "shelf", path: "/shelf", theme: "light", width: 1440, signedIn: true },
  { name: "rounds", path: "/rounds", theme: "dark", width: 1440, signedIn: true },
  { name: "drills", path: "/drills", theme: "dark", width: 390, signedIn: true },
  { name: "league", path: "/league", theme: "dark", width: 1440, signedIn: true },
  { name: "settings", path: "/settings", theme: "dark", width: 1440, signedIn: true },
];

test.skip(!process.env.PPC_SCREENSHOTS, "set PPC_SCREENSHOTS=1 to capture");

async function capture(browser: Browser, theme: Theme, width: number, shots: Shot[], signIn: boolean) {
  fs.mkdirSync(OUT, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, colorScheme: theme });
  // Hold the theme for the whole visit: the saved profile would otherwise put night back.
  // The script runs before <html> exists, so it watches the whole document.
  await ctx.addInitScript((wanted) => {
    const hold = () => {
      const d = document.documentElement;
      if (d && d.dataset.theme !== wanted) d.dataset.theme = wanted;
    };
    new MutationObserver(hold).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-theme"] });
    hold();
  }, theme);
  const page = await ctx.newPage();
  if (signIn) {
    const origin = new URL(test.info().project.use.baseURL ?? "http://localhost:3000").origin;
    const res = await page.request.post("/api/auth/login", { data: { email: "demo@ppc.test", password: "demo-harbour-1987" }, headers: { Origin: origin } });
    if (!res.ok()) throw new Error("Sign in as the demo learner failed: run npm run seed:demo first.");
  }
  for (const s of shots) {
    await page.goto(s.path, { waitUntil: "load" });
    await page.locator("#main").first().waitFor({ timeout: 30_000 }).catch(() => {});
    // Long enough for scenes to load and cutscenes to settle, below the fold too.
    await page.waitForTimeout(width < 600 ? 6000 : 3000);
    await page.screenshot({ path: `${OUT}/${s.name}-${width}-${theme}.png`, fullPage: width < 600 });
  }
  await ctx.close();
}

// One browser context per theme, width and sign-in, in the order the shots are listed.
const groups = new Map<string, Shot[]>();
for (const s of SHOTS) {
  const key = `${s.theme} ${s.width}${s.signedIn ? " signed in" : ""}`;
  groups.set(key, [...(groups.get(key) ?? []), s]);
}

for (const [key, shots] of groups) {
  test(`after screens: ${key}`, async ({ browser }) => {
    test.setTimeout(300_000);
    const { theme, width, signedIn } = shots[0]!;
    await capture(browser, theme, width, shots, !!signedIn);
  });
}
