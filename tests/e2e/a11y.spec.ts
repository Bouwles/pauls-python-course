import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/signup", "/login", "/syllabus", "/pricing", "/handbook/f-strings", "/privacy", "/terms", "/credits", "/map", "/welcome", "/handbook", "/handbook/print", "/rounds", "/shelf", "/drills", "/settings", "/job/shop-sign", "/job/bill-splitter?step=pips", "/no-such-page", "/teach", "/u/no-such-learner", "/placement", "/league", "/device", "/job/python-at-home?step=at-home", "/job/the-lamp-room?step=tests-for-the-hill", "/job/radio-station-finder?step=the-dial"];

for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    // Wait for the page to load and settle rather than for network idle: Python preloads in the
    // background on the Workbench and the landing page, so the network is rarely idle there.
    await page.goto(path, { waitUntil: "load" });
    await page.locator("#main").first().waitFor({ timeout: 30_000 });
    await page.waitForTimeout(2500);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}
