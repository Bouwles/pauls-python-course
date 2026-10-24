import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/signup", "/login", "/syllabus", "/privacy", "/terms", "/credits", "/map", "/welcome", "/concepts", "/concepts/print", "/rounds", "/shelf", "/drills", "/settings", "/job/sign-on-the-door", "/job/beas-till-2?step=pips", "/no-such-page", "/teach", "/u/no-such-learner", "/placement", "/league", "/device", "/job/python-at-home?step=at-home", "/job/the-lamp-room?step=tests-for-the-hill", "/job/mosss-radio?step=the-dial"];

for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}
