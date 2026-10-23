import fs from "node:fs";
import { test } from "@playwright/test";

// Section 21: every screen at 1440 and 390, light and dark, saved for review.
const SCREENS: [string, string][] = [
  ["landing", "/"],
  ["signup", "/signup"],
  ["login", "/login"],
  ["welcome", "/welcome"],
  ["map", "/map"],
  ["job-ask", "/job/sign-on-the-door?step=ask"],
  ["job-predict", "/job/sign-on-the-door?step=predict"],
  ["job-worked", "/job/sign-on-the-door?step=worked"],
  ["job-pips", "/job/beas-till-2?step=pips"],
  ["job-make", "/job/beas-till-2?step=make"],
  ["job-ship", "/job/sign-on-the-door?step=ship"],
  ["job-takehome", "/job/python-at-home?step=at-home"],
  ["job-investigate-late", "/job/the-lamp-room?step=ask-it-something-hard"],
  ["job-lamp-room", "/job/the-lamp-room?step=ask"],
  ["job-milestone", "/job/capstone-investigation"],
  ["placement", "/placement"],
  ["league", "/league"],
  ["device", "/device"],
  ["rounds", "/rounds"],
  ["shelf", "/shelf"],
  ["concepts", "/concepts"],
  ["concept", "/concepts/input-returns-text"],
  ["drills", "/drills"],
  ["settings", "/settings"],
  ["syllabus", "/syllabus"],
  ["credits", "/credits"],
  ["privacy", "/privacy"],
  ["not-found", "/no-such-page"],
];

test.skip(!process.env.PPC_SCREENSHOTS, "set PPC_SCREENSHOTS=1 to capture");

for (const scheme of ["light", "dark"] as const) {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`screens ${scheme} ${w}`, async ({ browser }) => {
      fs.mkdirSync("tests/screenshots", { recursive: true });
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
      const page = await ctx.newPage();
      for (const [name, path] of SCREENS) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `tests/screenshots/${name}-${w}-${scheme}.png`, fullPage: w < 600 });
      }
      await ctx.close();
    });
  }
}
