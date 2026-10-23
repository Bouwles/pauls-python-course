// Ad hoc page inspection: node scripts/eval.mjs <url> "<js expression>"
import { chromium } from "playwright-core";
const [, , url, expr, width = "1440"] = process.argv;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: Number(width), height: 900 } })).newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("response", (r) => { if (r.status() >= 400) console.log("HTTP", r.status(), r.url()); });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
console.log(JSON.stringify(await page.evaluate(expr), null, 1));
await browser.close();
