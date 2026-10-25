import { expect, test } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

test("a teacher makes a class, a learner joins with the code, and sees the Job set for them", async ({ browser }) => {
  // Two accounts, each signed up through the Workbench: twice the usual budget.
  test.setTimeout(360_000);
  const className = `Year 10, ${Date.now() % 100000}`;
  const due = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);

  // The teacher switches on teaching in Settings and makes a class.
  const teacherCtx = await browser.newContext();
  const teacher = await teacherCtx.newPage();
  await signUp(teacher, uniqueEmail(), "Ms Penrose");
  await teacher.goto("/settings");
  await teacher.getByRole("radio", { name: "I teach a class" }).check();
  await teacher.getByRole("link", { name: "Your classes" }).click();
  await teacher.waitForURL("**/teach");
  await teacher.getByLabel("Class name").fill(className);
  await teacher.getByRole("button", { name: "Make the class" }).click();
  await expect(teacher.getByRole("status").filter({ hasText: `Made ${className}.` })).toBeVisible();
  const row = teacher.getByRole("row").filter({ hasText: className });
  const code = (await row.locator("code").textContent())!.trim();
  expect(code).toMatch(/^[BCDFGHJKLMNPQRSTVWXZ2-9]{6}$/);

  // A learner joins with the code, typed in lower case.
  const learnerCtx = await browser.newContext();
  const learner = await learnerCtx.newPage();
  await signUp(learner, uniqueEmail(), "Ruth");
  await learner.goto("/settings");
  await expect(learner.getByText("Your teacher can see your progress, test results, time and code")).toBeVisible();
  await learner.getByLabel("Class code").fill(code.toLowerCase());
  await learner.getByRole("button", { name: "Join", exact: true }).click();
  await expect(learner.getByRole("status").filter({ hasText: `Joined ${className}.` })).toBeVisible();
  await expect(learner.getByRole("list", { name: "Your classes" })).toContainText(className);

  // The teacher sees the learner, and sets a Job with a due date.
  await teacher.getByRole("link", { name: className }).click();
  await expect(teacher.getByRole("heading", { level: 1, name: className })).toBeVisible();
  await expect(teacher.getByRole("link", { name: "Ruth" })).toBeVisible();
  await teacher.getByLabel("Job", { exact: true }).selectOption("bill-splitter");
  await teacher.getByLabel("Due, if any").fill(due);
  await teacher.getByRole("button", { name: "Set the Job" }).click();
  await expect(teacher.getByRole("status").filter({ hasText: "Set Bea's Till, part 2." })).toBeVisible();
  await expect(teacher.getByRole("row").filter({ hasText: "Bill Splitter" })).toContainText("0 of 1");

  // The teacher can open the learner's page.
  await teacher.getByRole("link", { name: "Ruth" }).click();
  await expect(teacher.getByRole("heading", { level: 1, name: "Ruth" })).toBeVisible();
  await expect(teacher.getByRole("heading", { name: "Jobs", exact: true })).toBeVisible();
  await expect(teacher.getByRole("button", { name: `Remove from ${className}` })).toBeVisible();

  // The learner sees it on the map, quietly, linking to the Job.
  await learner.goto("/map");
  const assigned = learner.getByRole("list", { name: "Jobs set by your class" });
  await expect(assigned).toContainText(`Assigned by ${className}:`);
  await expect(assigned.getByRole("link", { name: "Bill Splitter" })).toHaveAttribute("href", "/job/bill-splitter");

  await teacherCtx.close();
  await learnerCtx.close();
});
