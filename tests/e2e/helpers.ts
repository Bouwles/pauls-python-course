import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import type { Job } from "../../lib/content/types";

// The compiled content: the tests read the right answers and reference solutions from it, so
// they keep working when the words of a project change.
const CONTENT = path.join(process.cwd(), "generated", "content");
export const job = (id: string): Job => JSON.parse(fs.readFileSync(path.join(CONTENT, "jobs", `${id}.json`), "utf8"));
const solutions = () => JSON.parse(fs.readFileSync(path.join(CONTENT, "server", "solutions.json"), "utf8")) as Record<string, Record<string, string>>;
export const solution = (key: string, file = "main.py") => solutions()[key]?.[file] ?? "";

export const uniqueEmail = () => `learner-${Date.now()}-${Math.floor(Math.random() * 1e6)}@ppc.test`;
export const PASSWORD = "harbour-lights-1987";

/** Replace everything in the CodeMirror editor by typing, as a learner would. */
export async function typeCode(page: Page, code: string) {
  const editor = page.locator(".cm-content").first();
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  // One line at a time; the editor indents after a colon by itself.
  const lines = code.split("\n");
  for (const [i, line] of lines.entries()) {
    await page.keyboard.type(line.trimStart(), { delay: 2 });
    if (i < lines.length - 1) {
      await page.keyboard.press("Enter");
      // Dedent when the next line is less indented than the editor guessed.
      const want = (lines[i + 1]!.match(/^ */)?.[0].length ?? 0) / 4;
      const have = (line.match(/^ */)?.[0].length ?? 0) / 4 + (line.trimEnd().endsWith(":") ? 1 : 0);
      for (let d = 0; d < have - want; d++) await page.keyboard.press("Shift+Tab");
    }
  }
}

export async function signUp(page: Page, email: string, name = "Ruth") {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByLabel("I'm 13 or older.").check();
  await page.getByRole("button", { name: "Make the account" }).click();
  await page.waitForURL("**/welcome");
  // The avatar is in tabs: Colour, Face, Hair, Clothes and Extras.
  await page.getByRole("tab", { name: "Hair" }).click();
  await page.getByText("Curly, medium length", { exact: true }).first().click();
  await page.getByRole("tab", { name: "Extras" }).click();
  await page.getByText("Headphones", { exact: true }).first().click();
  await page.getByLabel("What should we call you?").fill(name);
  await page.getByText("No, never").click();
  await page.getByRole("button", { name: "Save and start" }).click();
  await page.waitForURL("**/job/**");
}

export async function logIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/map");
}

export async function step(page: Page, name: RegExp) {
  await page.getByRole("navigation", { name: "Steps in this project" }).getByRole("button", { name }).click();
}

/** Play the first project, Course Sign, from the Ask to the Ship, with the answers from the content. */
export async function completeJobOne(page: Page) {
  const j = job("shop-sign");
  // The Ask: skip the walk-in if it's playing, then start.
  const skip = page.getByRole("button", { name: "Skip", exact: true });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.getByRole("button", { name: "Start building" }).click();

  // Predict: the correct option, by position (two options can read alike).
  const predict = j.steps.find((s) => s.type === "predict")!;
  const right = predict.type === "predict" ? predict.options!.findIndex((o) => o.correct) : 0;
  await page.getByRole("radio").nth(right).check({ force: true });
  await page.getByRole("button", { name: "Lock in my answer" }).click();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByRole("log", { name: "Output" })).not.toBeEmpty({ timeout: 60_000 });
  await page.getByRole("button", { name: "Next step" }).click();

  // Investigate: each written answer, then the change to the code.
  const investigate = j.steps.find((s) => s.type === "investigate")!;
  if (investigate.type === "investigate") {
    let answer = 0;
    for (const t of investigate.tasks) {
      if (t.kind === "answer") {
        await page.getByLabel("Your answer").nth(answer).fill(t.accept[0]!);
        await page.getByRole("button", { name: "Check answer" }).nth(answer).click();
        answer++;
      } else if (t.kind === "run") {
        await typeCode(page, solution(`shop-sign/investigate/${t.id}`));
        await page.getByRole("button", { name: "Check my change" }).click();
      }
    }
  }
  await expect(page.getByRole("button", { name: "Next step" })).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Next step" }).click();

  // Worked example
  await page.getByPlaceholder("In your own words.").fill("Because the text has double quotes inside it.");
  await page.getByRole("button", { name: "Show Paul's answer" }).click();
  await page.getByRole("button", { name: "I had that" }).click();
  await page.getByRole("button", { name: "Next step" }).click();

  // The classmate's version, then Build: the reference solutions.
  for (const key of ["shop-sign/pips", "shop-sign/make"]) {
    await typeCode(page, solution(key));
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(page.getByText(/^All \d+ checks passed$/)).toBeVisible({ timeout: 60_000 });
    await page.getByRole("button", { name: "Next step" }).click();
  }

  // Ship: it goes on the Shelf when the learner says so.
  await page.getByRole("button", { name: "Add to my Shelf" }).click();
  await expect(page.getByRole("heading", { name: /shipped/i })).toBeVisible();
}
