// Captures the real screenshots used in "How a job goes" on the landing page.
// Needs the dev server running: node scripts/capture-how.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const base = process.env.PPC_BASE_URL ?? "http://localhost:3000";
const out = "public/how";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: "light" });
const page = await ctx.newPage();
const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });

async function typeCode(code) {
  await page.locator(".cm-content").first().click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  const lines = code.split("\n");
  for (const [i, line] of lines.entries()) {
    await page.keyboard.type(line.trimStart(), { delay: 1 });
    if (i < lines.length - 1) {
      await page.keyboard.press("Enter");
      // The editor indents after a colon; undo it where the next line is less indented.
      const want = (lines[i + 1].match(/^ */)[0].length) / 4;
      const have = (line.match(/^ */)[0].length) / 4 + (line.trimEnd().endsWith(":") ? 1 : 0);
      for (let d = 0; d < have - want; d++) await page.keyboard.press("Shift+Tab");
    }
  }
}

// A learner of our own, so the Shelf has something on it.
const email = `how-${Date.now()}@fixwick.test`;
await page.goto(`${base}/signup`);
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password").fill("harbour-lights-1987");
await page.getByLabel("I'm 13 or older.").check();
await page.getByRole("button", { name: "Make the account" }).click();
await page.waitForURL("**/welcome");
await page.getByText("Fox", { exact: true }).click();
await page.getByText("Navy", { exact: true }).click();
await page.getByText("Scarf", { exact: true }).click();
await page.getByLabel("What should Moss call you?").fill("Sam");
await page.getByText("No, never").click();
await page.getByRole("button", { name: "Take the desk" }).click();
await page.waitForURL("**/job/**");

// 1. The Ask, with Bea in the doorway.
await page.goto(`${base}/job/bill-splitter?step=ask`);
await page.waitForTimeout(2500);
await shot("ask");

// 2. Predict: a wrong answer and the feedback written for that mistake.
await page.goto(`${base}/job/bill-splitter?step=predict`);
await page.waitForTimeout(1500);
await page.getByRole("radio", { name: "One line: 6" }).check();
await page.getByRole("button", { name: "Commit to this answer" }).click();
await page.waitForTimeout(800);
await shot("predict");

// 3. Pip's Version: run it, type the order, read what went wrong.
await page.goto(`${base}/job/bill-splitter?step=pips`);
await page.waitForTimeout(1500);
await page.getByRole("button", { name: "Run", exact: true }).click();
await page.locator("#console-input").waitFor({ timeout: 60000 });
await page.locator("#console-input").fill("bread");
await page.locator("#console-input").press("Enter");
await page.locator("#console-input").fill("3");
await page.locator("#console-input").press("Enter");
await page.getByText("A number is still text.").waitFor();
await page.waitForTimeout(800);
await shot("pips");

// 4. Make: nearly there, with the one failing check explained.
await page.goto(`${base}/job/bill-splitter?step=make`);
await page.waitForTimeout(1500);
await typeCode('item = input("Item? ")\nqty = int(input("How many? "))\nif item == "bread":\n    price = 2.40\nelse:\n    price = 0.85\nprint(f"That\'s {qty * price}, please.")');
await page.getByRole("button", { name: "Check", exact: true }).click();
await page.getByText(/checks passed/).waitFor({ timeout: 60000 });
await page.waitForTimeout(800);
await shot("make");

// 5. The Shelf, after shipping the first job.
await page.goto(`${base}/job/shop-sign?step=make`);
await page.waitForTimeout(1500);
await typeCode('# The workshop sign\nprint("MOSS\'S WORKSHOP")\nprint("Repairs of all kinds")\nprint("Open Tuesday to Saturday, 9 till 5")\nprint("Closed when the radio is on")');
await page.getByRole("button", { name: "Check", exact: true }).click();
await page.getByText("All checks passed.").waitFor({ timeout: 60000 });
await page.goto(`${base}/job/shop-sign?step=ship`);
await page.waitForTimeout(2000);
await page.goto(`${base}/shelf`);
await page.getByRole("button", { name: /The workshop sign/ }).click();
await page.getByRole("button", { name: "Run it again" }).click();
await page.getByRole("log", { name: "Output" }).getByText("MOSS'S WORKSHOP").waitFor({ timeout: 60000 });
await page.waitForTimeout(500);
await shot("shelf");

await browser.close();
console.log("wrote", fs.readdirSync(out).join(", "));
