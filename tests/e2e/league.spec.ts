import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { bestPolicy } from "../../lib/league/cast";
import { baselinePolicy, isoWeek, league, MOVES, weekName } from "../../lib/league/course";

// The Arcade League with no server: entering races league.json in the browser, the cast are on
// the table, and a class's table travels by link. LEAGUE_SHOTS=<folder> also takes screenshots.
const SHOTS = process.env.LEAGUE_SHOTS;
const shot = async (page: Page, name: string, full = true) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: full });
};

const week = isoWeek();
const named = weekName(week);
const entryJson = (policy = baselinePolicy()) => JSON.stringify({ format: "ppc-league-1", policy });
const fresh = (browser: Browser) => browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });

/** Nothing serious or critical for axe, with the page as it is now (a table, tabs, a link box). */
async function axe(page: Page) {
  await page.waitForTimeout(1500);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
}

async function paste(page: Page, json: string) {
  await page.getByLabel("Or paste what's in it").fill(json);
  await page.getByRole("button", { name: "Race it" }).click();
}

test("enter a league.json in the browser, as a guest, and race the cast", async ({ browser }) => {
  const context = await fresh(browser);
  const page = await context.newPage();
  await page.goto("/league");
  const table = page.getByRole("table", { name: `The Arcade's table for ${named}.` });
  // A table for one: the cast are on it before anyone enters (with anyone the local version's server raced).
  for (const name of ["Aaesha", "Caitlin", "Paul", "Neil", "Riya", "Yahya"]) await expect(table.getByRole("cell", { name, exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const before = await table.getByRole("row").count();

  // Pasting: raced there and then, on this week's seeds.
  const shortest = league(baselinePolicy(), week);
  await paste(page, entryJson());
  await expect(page.getByRole("status").filter({ hasText: "Raced:" })).toContainText(`${shortest.score.toFixed(2)} moves on average, ${shortest.finished} of 50 finished`);
  const me = table.locator(`tr[aria-current="true"]`);
  await expect(me).toContainText(shortest.score.toFixed(2));
  await expect(table.getByRole("row")).toHaveCount(before + 1);
  await expect(page.getByRole("heading", { name: "Your first race this week" })).toBeVisible();
  await shot(page, "solo-entered");
  await axe(page);

  // Uploading a Q-table: the newest entry counts.
  const best = league(bestPolicy(), week);
  const q = bestPolicy().map((row) => row.map((m) => MOVES.map((a) => (a === m ? 1 : 0))));
  await page.getByLabel("Upload league.json").setInputFiles({ name: "league.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ format: "ppc-league-1", q })) });
  await expect(page.getByRole("status").filter({ hasText: "Raced:" })).toContainText(best.score.toFixed(2));
  await expect(me).toContainText(best.score.toFixed(2));

  // Kept in this browser.
  await page.reload();
  await expect(page.getByText("Your entry:")).toBeVisible();
  await expect(table.locator(`tr[aria-current="true"]`)).toContainText(best.score.toFixed(2));

  // A file that isn't an entry says why.
  await paste(page, '{"policy": [["up"]]}');
  await expect(page.getByRole("region", { name: "Enter this week" }).getByRole("alert")).toContainText("7 rows of 9");

  await page.getByRole("button", { name: "Withdraw" }).click();
  await expect(table.locator(`tr[aria-current="true"]`)).toHaveCount(0);
  await context.close();
});

test("a class's League table through links: the progress link carries the entry, and the shared table shows where you stand", async ({ browser }) => {
  const className = `League Night ${Date.now() % 100000}`;
  const teacher = await (await fresh(browser)).newPage();
  const student = await (await fresh(browser)).newPage();

  // The teacher makes a class and copies its join link.
  await teacher.goto("/class");
  await teacher.getByLabel("Class name").fill(className);
  await teacher.getByLabel("Your name, as students see it").fill("Paul");
  await teacher.getByRole("button", { name: "Make the class" }).click();
  await teacher.getByRole("button", { name: "Copy the join link" }).click();
  const joinUrl = await teacher.getByLabel(`Join link for ${className}`).inputValue();

  // The student joins, enters the League and sends their progress.
  await student.goto(joinUrl);
  await student.getByLabel("Your name, so Paul knows who you are").fill("Ruth");
  await student.getByRole("button", { name: `Join ${className}` }).click();
  await expect(student.getByRole("heading", { name: "You're in" })).toBeVisible();
  await student.goto("/league");
  const score = league(baselinePolicy(), week).score.toFixed(2);
  await paste(student, entryJson());
  await expect(student.locator("p").filter({ hasText: "Your entry:" })).toContainText("it goes to Paul with your progress link");
  // With a class, the table is the class's.
  await expect(student.getByRole("tab", { name: className })).toHaveAttribute("aria-selected", "true");
  await expect(student.getByText("Paul hasn't shared this week's table yet.")).toBeVisible();
  await student.goto("/class");
  await student.getByRole("button", { name: "Send Paul my progress" }).click();
  const box = student.getByLabel("Your progress link for Paul");
  await expect(student.getByText("Your Arcade League entry this week goes too")).toBeVisible();
  const reportUrl = await box.inputValue();

  // The teacher opens it: the entry, raced again from the policy, then into the register.
  await teacher.goto(reportUrl);
  await expect(teacher.getByRole("heading", { name: "The Arcade League" })).toBeVisible();
  await expect(teacher.getByText(`This week: ${score} moves on average`)).toBeVisible();
  await expect(teacher.getByText(/Raced again in this browser/)).toBeVisible();
  await teacher.getByRole("button", { name: `Add to ${className}` }).click();
  await expect(teacher.getByRole("status").filter({ hasText: "Ruth is in the register now" })).toBeVisible();

  // The class page: the register's League column, and the class's table.
  await teacher.goto("/class");
  const classTable = teacher.getByRole("table", { name: `${className}'s Arcade League table, ${named}.` });
  await expect(classTable.getByRole("row").filter({ hasText: "Ruth" })).toContainText(score);
  await expect(teacher.getByRole("table", { name: `Each student's latest progress in ${className}, by set project.` })).toContainText(score);
  await teacher.getByRole("button", { name: "Share the table" }).click();
  const tableUrl = await teacher.getByLabel(`League table link for ${className}`).inputValue();
  expect(tableUrl).toMatch(/\/league\/#2\./);
  await shot(teacher, "teacher-class-table");
  await axe(teacher);

  // The student opens the shared table: where they stand, and it stays with the class.
  await student.goto(tableUrl);
  const shared = student.getByRole("table", { name: `${className}'s table for ${named}, as Paul shared it.` });
  await expect(shared.locator(`tr[aria-current="true"]`)).toContainText(score);
  await expect(student.getByText("You're 1st of 1.")).toBeVisible();
  await shot(student, "student-shared-table");
  await axe(student);
  await student.goto("/league");
  await expect(student.getByText(/Paul shared this on/)).toBeVisible();
  await expect(student.getByRole("table", { name: `${className}'s table for ${named}.` }).locator(`tr[aria-current="true"]`)).toContainText(score);

  // Anyone else can open it too, and sees the standings.
  const other = await (await fresh(browser)).newPage();
  await other.goto(tableUrl);
  await expect(other.getByRole("table", { name: `${className}'s table for ${named}, as Paul shared it.` })).toContainText("Ruth");
  await expect(other.getByText("Standings only: names and scores, as the class's teacher had them.")).toBeVisible();
  await shot(other, "anyone-shared-table");
});
