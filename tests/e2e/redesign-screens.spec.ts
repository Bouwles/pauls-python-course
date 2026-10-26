import fs from "node:fs";
import { test, type Browser } from "@playwright/test";

// REDESIGN.md 5 and 11: every screen at 1440x900 and 390x844, night and day, after the
// redesign, named like the "before" set in tests/screenshots/redesign/before/ so the two
// can be compared side by side. File names keep "dark" for night and "light" for day.
//   PPC_SCREENSHOTS=1 npx playwright test redesign-screens
// PPC_LEARNER_ONLY=1 takes only the signed-in screens.
const OUT = "tests/screenshots/redesign/after";

// Seen signed out: the pages a visitor sees, and the Workbench as a guest.
const GUEST: [string, string][] = process.env.PPC_LEARNER_ONLY ? [] : [
  ["landing", "/"],
  ["signup", "/signup"],
  ["login", "/login"],
  ["pricing", "/pricing"],
  ["job-ask", "/job/shop-sign?step=ask"],
  ["job-predict", "/job/shop-sign?step=predict"],
  ["job-worked", "/job/shop-sign?step=worked"],
  ["job-pips", "/job/bill-splitter?step=pips"],
  ["job-make", "/job/bill-splitter?step=make"],
  ["job-ship", "/job/shop-sign?step=ship"],
  ["job-takehome", "/job/python-at-home?step=at-home"],
  ["job-investigate-late", "/job/the-lamp-room?step=ask-it-something-hard"],
  ["job-lamp-room", "/job/the-lamp-room?step=ask"],
  ["job-milestone", "/job/capstone-investigation"],
  ["concepts", "/handbook"],
  ["concept", "/handbook/input-returns-text"],
  ["syllabus", "/syllabus"],
  ["credits", "/credits"],
  ["privacy", "/privacy"],
  ["not-found", "/no-such-page"],
];

// Seen as the demo learner (npm run seed:demo), who has half of Act I done.
const LEARNER: [string, string][] = [
  ["map", "/map"],
  ["welcome", "/welcome"],
  ["rounds", "/rounds"],
  ["shelf", "/shelf"],
  ["drills", "/drills"],
  ["settings", "/settings"],
  ["placement", "/placement"],
  ["league", "/league"],
  ["device", "/device"],
];

test.skip(!process.env.PPC_SCREENSHOTS, "set PPC_SCREENSHOTS=1 to capture");

async function capture(browser: Browser, theme: "dark" | "light", w: number, h: number, screens: [string, string][], signIn: boolean) {
  fs.mkdirSync(OUT, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme });
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
    const res = await page.request.post("/api/auth/login", { data: { email: "demo@fixwick.test", password: "demo-harbour-1987" }, headers: { Origin: origin } });
    if (!res.ok()) throw new Error("Sign in as the demo learner failed: run npm run seed:demo first.");
  }
  for (const [name, path] of screens) {
    await page.goto(path, { waitUntil: "load" });
    await page.locator("#main").first().waitFor({ timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${name}-${w}-${theme}.png`, fullPage: w < 600 });
  }
  await ctx.close();
}

for (const theme of ["dark", "light"] as const) {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`after screens ${theme} ${w}`, async ({ browser }) => {
      test.setTimeout(900_000);
      await capture(browser, theme, w, h, GUEST, false);
      await capture(browser, theme, w, h, LEARNER, true);
    });
  }
}
