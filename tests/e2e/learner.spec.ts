import { expect, test } from "@playwright/test";
import { completeJobOne, logIn, signUp, step, typeCode, uniqueEmail } from "./helpers";

test("sign up, make a character, finish Job 1, and find it all on another device", async ({ browser }) => {
  const email = uniqueEmail();
  const first = await browser.newContext();
  const page = await first.newPage();
  await signUp(page, email, "Ruth");
  await completeJobOne(page);
  // Leave some unfinished work in Job 2 to come back to.
  await page.goto("/job/bill-splitter?step=make");
  await typeCode(page, "loaves = 3\n# half done");
  await expect(page.getByText("Saving", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 30_000 });
  await first.close();

  // A fresh browser, as if on another device.
  const second = await browser.newContext();
  const again = await second.newPage();
  await logIn(again, email);
  await expect(again.getByText("1 job shipped.", { exact: false })).toBeVisible();
  await expect(again.getByRole("link", { name: "Back to your desk" })).toBeVisible();
  await again.getByRole("link", { name: "Back to your desk" }).click();
  await again.waitForURL("**/job/bill-splitter?step=make");
  await expect(again.locator(".cm-content")).toContainText("# half done");
  await again.goto("/shelf");
  await expect(again.getByRole("button", { name: /The workshop sign/ })).toBeVisible();
  await second.close();
});

test("answer input() in the console, and stop a loop that never ends", async ({ page }) => {
  await page.goto("/job/bill-splitter?step=pips");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const field = page.locator("#console-input");
  await field.waitFor({ timeout: 60_000 });
  await field.fill("bread");
  await field.press("Enter");
  await page.locator("#console-input").fill("3");
  await page.locator("#console-input").press("Enter");
  await expect(page.getByText("A number is still text.")).toBeVisible();

  await page.goto("/job/shop-sign?step=make");
  await typeCode(page, "while True:\n    pass");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click({ timeout: 30_000 });
  await expect(page.getByRole("log", { name: "Output" }).getByText(/^Stopped\./)).toBeVisible({ timeout: 10_000 });
  // Python is still usable afterwards.
  await typeCode(page, 'print("still here")');
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByRole("log", { name: "Output" })).toContainText("still here", { timeout: 30_000 });
});

test("guest work moves into a new account", async ({ page }) => {
  await page.goto("/job/shop-sign?step=make");
  await typeCode(page, '# from before I had an account\nprint("MOSS\'S WORKSHOP")');
  await page.waitForTimeout(1200);
  await signUp(page, uniqueEmail(), "Guest Ruth");
  await page.goto("/job/shop-sign?step=make");
  await expect(page.locator(".cm-content")).toContainText("from before I had an account");
});

test("a review round, the Shelf export, and deleting the account", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email, "Delete Me");
  await completeJobOne(page);

  // Tomorrow morning: the concepts from Job 1 are due.
  await page.clock.install({ time: new Date(Date.now() + 26 * 3600_000) });
  await page.goto("/rounds");
  await expect(page.getByRole("heading", { name: "Morning Rounds" })).toBeVisible();
  // Answer whatever comes up (badly is fine); each card ends after two goes.
  for (let card = 0; card < 10; card++) {
    if (await page.getByRole("heading", { name: "Rounds done" }).isVisible()) break;
    for (let go = 0; go < 4; go++) {
      const next = page.getByRole("button", { name: /Next repair|Finish the rounds/ });
      if (await next.isVisible()) break;
      const textarea = page.getByLabel("What it prints");
      if (await textarea.isVisible()) await textarea.fill("nothing");
      const radio = page.getByRole("radio").first();
      if (await radio.isVisible()) await radio.check();
      const check = page.getByRole("button", { name: /^(Check|Try again)$/ });
      if (await check.isVisible()) await check.click();
      await page.waitForTimeout(1500);
    }
    await page.getByRole("button", { name: /Next repair|Finish the rounds/ }).click({ timeout: 60_000 });
  }
  await expect(page.getByRole("heading", { name: "Rounds done" })).toBeVisible();

  await page.goto("/shelf");
  await page.getByRole("button", { name: /The workshop sign/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export everything as a repository" }).click();
  expect((await download).suggestedFilename()).toMatch(/python-projects\.zip$/);

  await page.goto("/settings");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await page.getByLabel(/Type Delete Me to confirm/).fill("Delete Me");
  await page.getByRole("button", { name: "Delete everything" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("harbour-lights-1987");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("That email and password don't match.")).toBeVisible();
});
