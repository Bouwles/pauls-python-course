import { expect, type Page } from "@playwright/test";

export const uniqueEmail = () => `learner-${Date.now()}-${Math.floor(Math.random() * 1e6)}@fixwick.test`;
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
  await page.getByText("Hare", { exact: true }).click();
  await page.getByText("Sea", { exact: true }).click();
  await page.getByText("Scarf", { exact: true }).click();
  await page.getByLabel("What should Moss call you?").fill(name);
  await page.getByText("No, never").click();
  await page.getByRole("button", { name: "Take the desk" }).click();
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
  await page.getByRole("navigation", { name: "Steps in this job" }).getByRole("button", { name }).click();
}

/** Play Job 1 from the Ask to the Ship. */
export async function completeJobOne(page: Page) {
  await page.getByRole("button", { name: "Start the job" }).click();

  // Predict
  await page.getByRole("radio", { name: "Two lines: Mind the step, then Ring the bell" }).check();
  await page.getByRole("button", { name: "Commit to this answer" }).click();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByRole("log", { name: "Output" })).toContainText("Ring the bell", { timeout: 60_000 });
  await page.getByRole("button", { name: "Next step" }).click();

  // Investigate
  await page.getByLabel("Your answer").first().fill("2");
  await page.getByRole("button", { name: "Check answer" }).first().click();
  await page.getByLabel("Your answer").nth(1).fill("SyntaxError");
  await page.getByRole("button", { name: "Check answer" }).first().click();
  await typeCode(page, '# The sign for Bea\'s window\nprint("Fresh bread")\nprint("Closed Mondays")\nprint("Ring the bell")');
  await page.getByRole("button", { name: "Check my change" }).click();
  await expect(page.getByRole("button", { name: "Next step" })).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Next step" }).click();

  // Worked example
  await page.getByPlaceholder("In your own words.").fill("Because the text has double quotes inside it.");
  await page.getByRole("button", { name: "Show Moss's answer" }).click();
  await page.getByRole("button", { name: "I had that" }).click();
  await page.getByRole("button", { name: "Next step" }).click();

  // Pip's Version
  await typeCode(page, 'print("HOLLIS BAKERY")\nprint("Bread, buns and Bea\'s lardy cake")\nprint("Open from 7")');
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/^All \d+ checks passed$/)).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Next step" }).click();

  // Make
  await typeCode(page, '# The workshop sign\nprint("MOSS\'S WORKSHOP")\nprint("Repairs of all kinds")\nprint("Open Tuesday to Saturday, 9 till 5")\nprint("Closed when the radio is on")');
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/^All \d+ checks passed$/)).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Next step" }).click();

  // Ship
  await expect(page.getByRole("heading", { name: /shipped|shipping/i })).toBeVisible();
}
