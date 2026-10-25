// Ad hoc screenshots with the installed Chrome: node scripts/shot.mjs <url> <out.png> [width] [height] [light|dark] [actions.json]
import { chromium } from "playwright-core";
import fs from "node:fs";
const [, , url, out, width = "1440", height = "900", scheme = "light", actionsFile] = process.argv;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: Number(width), height: Number(height) }, colorScheme: scheme, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`); });
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
// LOGIN=1 signs in as the demo learner first (npm run seed:demo makes it).
if (process.env.LOGIN === "1") {
  const origin = new URL(url).origin;
  const r = await page.request.post(`${origin}/api/auth/login`, { data: { email: "demo@fixwick.test", password: "demo-harbour-1987" }, headers: { Origin: origin } });
  if (!r.ok()) console.log("login failed:", r.status());
}
await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 }).catch(() => page.waitForTimeout(3000));
await page.waitForTimeout(1500);
if (actionsFile) {
  for (const a of JSON.parse(fs.readFileSync(actionsFile, "utf8"))) {
    if (a.goto) await page.goto(new URL(a.goto, url).toString(), { waitUntil: "networkidle" });
    if (a.click) await page.getByRole(a.role ?? "button", { name: a.click, exact: a.exact ?? false }).first().click();
    if (a.clickText) await page.getByText(a.clickText, { exact: a.exact ?? false }).first().click();
    if (a.fill) await page.locator(a.fill).fill(a.value);
    if (a.type) await page.keyboard.type(a.type, { delay: 5 });
    if (a.press) await page.keyboard.press(a.press);
    if (a.focus) await page.locator(a.focus).first().click();
    if (a.scroll !== undefined) await page.evaluate((y) => window.scrollTo(0, y), a.scroll);
    if (a.selector) await page.locator(a.selector).first().scrollIntoViewIfNeeded();
    if (a.wait) await page.waitForTimeout(a.wait);
    if (a.shot) await page.screenshot({ path: a.shot });
  }
}
console.log("isolated:", await page.evaluate(() => crossOriginIsolated));
await page.screenshot({ path: out, fullPage: process.env.FULL === "1" });
if (logs.length) console.log(logs.slice(0, 20).join("\n"));
await browser.close();
