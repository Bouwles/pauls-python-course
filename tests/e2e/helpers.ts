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
  // "Who's playing?": someone of their own, so the avatar, the name and the question follow.
  await page.getByRole("button", { name: "Play as someone else" }).click();
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

/** Play the first project, Course Sign, from the brief to the Ship, with the answers from the content. */
export async function completeJobOne(page: Page) {
  const id = "shop-sign";
  const j = job(id);
  // The brief: skip the walk-in if it's playing, then start.
  const skip = page.getByRole("button", { name: "Skip", exact: true });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.getByRole("button", { name: "Start building" }).click();

  // Every step in order, whatever kinds the project has.
  for (const s of j.steps) {
    if (s.type === "ask" || s.type === "ship") continue;
    if (s.type === "learn") {
      if (s.code) {
        await page.getByRole("button", { name: "Run", exact: true }).click();
        await expect(page.getByRole("log", { name: "Output" })).not.toBeEmpty({ timeout: 60_000 });
      }
      await page.getByRole("button", { name: "Got it" }).click();
    } else if (s.type === "predict") {
      // The correct option, by position (two options can read alike).
      const right = s.options!.findIndex((o) => o.correct);
      await page.getByRole("radio").nth(right).check({ force: true });
      await page.getByRole("button", { name: "Lock in my answer" }).click();
      await page.getByRole("button", { name: "Run", exact: true }).click();
      await expect(page.getByRole("log", { name: "Output" })).not.toBeEmpty({ timeout: 60_000 });
    } else if (s.type === "investigate") {
      // Each written answer, then any change to the code.
      let answer = 0;
      for (const t of s.tasks) {
        if (t.kind === "answer") {
          // Each answer box in turn; a finished task drops its Check answer button, so press Enter.
          const field = page.getByLabel("Your answer").nth(answer);
          await field.fill(t.accept[0]!);
          await field.press("Enter");
          answer++;
        } else if (t.kind === "run") {
          await typeCode(page, solution(`${id}/${s.id}/${t.id}`));
          await page.getByRole("button", { name: "Check my change" }).click();
        }
      }
    } else if (s.type === "worked") {
      await page.getByPlaceholder("In your own words.").fill("Because the text has double quotes inside it.");
      await page.getByRole("button", { name: "Show Paul's answer" }).click();
      await page.getByRole("button", { name: "I had that" }).click();
    } else if (s.type === "pips" || s.type === "make" || s.type === "fix" || s.type === "modify") {
      // The classmate's code and the Build: the reference solutions.
      await typeCode(page, solution(`${id}/${s.id}`));
      await page.getByRole("button", { name: "Check", exact: true }).click();
      await expect(page.getByText(/^All \d+ checks passed$/)).toBeVisible({ timeout: 60_000 });
    } else {
      throw new Error(`completeJobOne doesn't know how to play a ${s.type} step`);
    }
    await expect(page.getByRole("button", { name: "Next step" }).first()).toBeVisible({ timeout: 60_000 });
    await page.getByRole("button", { name: "Next step" }).first().click();
  }

  // Ship: it goes on the Shelf when the learner says so.
  await page.getByRole("button", { name: "Add to my Shelf" }).click();
  await expect(page.getByRole("heading", { name: /shipped/i })).toBeVisible();
}
