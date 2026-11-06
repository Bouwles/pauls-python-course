import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { completeJobOne, job, logIn, signUp, solution, typeCode, uniqueEmail } from "./helpers";

test("sign up, make an avatar, finish the first project, and find it all on another device", async ({ browser }) => {
  const email = uniqueEmail();
  const first = await browser.newContext();
  const page = await first.newPage();
  await signUp(page, email, "Ruth");
  await completeJobOne(page);
  // Leave some unfinished work in the second project to come back to.
  await page.goto("/job/bill-splitter?step=make");
  await typeCode(page, "loaves = 3\n# half done");
  // The save status is an icon; its words are in the tooltip.
  await expect(page.getByTitle("Saving", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTitle("Saved", { exact: true })).toBeVisible({ timeout: 30_000 });
  await first.close();

  // A fresh browser, as if on another device.
  const second = await browser.newContext();
  const again = await second.newPage();
  await logIn(again, email);
  await expect(again.getByText("1 project shipped.", { exact: false })).toBeVisible();
  await expect(again.getByRole("link", { name: "Back to your desk" })).toBeVisible();
  await again.getByRole("link", { name: "Back to your desk" }).click();
  await again.waitForURL("**/job/bill-splitter?step=make");
  await expect(again.locator(".cm-content")).toContainText("# half done");
  await again.goto("/shelf");
  await expect(again.getByRole("button", { name: `Run ${job("shop-sign").title}` })).toBeVisible();
  await second.close();
});

test("answer input() in the console, and stop a loop that never ends", async ({ page }) => {
  // Yahya's tip program asks two questions; the answers are typed straight into the console.
  await page.goto("/job/bill-splitter?step=pips");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const field = page.locator("#console-input");
  await field.waitFor({ timeout: 60_000 });
  await field.fill("20");
  await field.press("Enter");
  await page.locator("#console-input").fill("10");
  await page.locator("#console-input").press("Enter");
  await expect(page.getByRole("log", { name: "Output" })).toContainText("Total with tip: 20.10", { timeout: 30_000 });
  // Text that isn't a number: Neil explains the error under the traceback.
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.locator("#console-input").waitFor({ timeout: 30_000 });
  await page.locator("#console-input").fill("bread");
  await page.locator("#console-input").press("Enter");
  await expect(page.getByText("float() can't read that text", { exact: true })).toBeVisible({ timeout: 30_000 });

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
  // The first project, then up to ten review cards that each run Python: twice the usual budget.
  test.setTimeout(360_000);
  const email = uniqueEmail();
  await signUp(page, email, "Delete Me");
  await completeJobOne(page);

  // Tomorrow morning: the concepts from the first project are due.
  await page.clock.install({ time: new Date(Date.now() + 26 * 3600_000) });
  await page.goto("/rounds");
  await expect(page.getByRole("heading", { name: "Morning Rounds" })).toBeVisible();
  // Answer whatever comes up (badly is fine); each card ends after two goes.
  for (let card = 0; card < 10; card++) {
    if (await page.getByRole("heading", { name: "Rounds done" }).isVisible()) break;
    for (let go = 0; go < 4; go++) {
      const next = page.getByRole("button", { name: /Next card|Finish the rounds/ });
      if (await next.isVisible()) break;
      const textarea = page.getByLabel("What it prints");
      if (await textarea.isVisible()) await textarea.fill("nothing");
      const radio = page.getByRole("radio").first();
      // Review options are labels over real radios, like Settings: click as a person would.
      if (await radio.count()) await radio.check({ force: true });
      const check = page.getByRole("button", { name: /^(Check|Try again)$/ });
      if (await check.isVisible()) await check.click();
      await page.waitForTimeout(1500);
    }
    await page.getByRole("button", { name: /Next card|Finish the rounds/ }).click({ timeout: 60_000 });
  }
  await expect(page.getByRole("heading", { name: "Rounds done" })).toBeVisible();

  await page.goto("/shelf");
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

test("play as Neil: Paul gives the hints, you look like Neil, and Neil's projects are your own", async ({ page }) => {
  // Anyone new starts at "Who's playing?", account or not.
  await page.goto("/");
  await page.waitForURL("**/welcome");
  await page.getByRole("button", { name: "Play as Neil" }).click();
  await page.waitForURL((url) => url.pathname === "/");

  // The header avatar is Neil, under his name.
  await expect(page.getByRole("link", { name: "Settings, Neil" })).toBeVisible();
  await expect(page.locator("header [data-who='neil']")).toBeVisible();

  // Neil can't give himself a hint: Paul, his stand-in, does.
  await page.goto("/job/bill-splitter?step=make");
  await expect(page.locator("header [data-who='neil']")).toBeVisible();
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Hints from Paul" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Coach" }).getByText("Paul", { exact: true })).toBeVisible();

  // Neil's own project: the brief is his, and his lines are said as "You".
  await page.goto("/job/unit-converter?step=ask");
  await expect(page.getByText("Your own project", { exact: true })).toBeVisible();
  const skip = page.getByRole("button", { name: "Skip", exact: true });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await expect(page.getByRole("list", { name: "What you need" }).getByText("You", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("list", { name: "What you need" }).getByText("Neil", { exact: true })).toHaveCount(0);
});

// ---------------------------------------------------------------- without a server
// Certificates, sharing, Take It Home hand-ins and pushing to GitHub all work in the browser alone
// (as they must on GitHub Pages). The progress they need is put straight into this browser's store.

const INDEX = () => JSON.parse(fs.readFileSync(path.join(process.cwd(), "generated", "content", "index.json"), "utf8")) as { acts: { number: number; jobs: { id: string; status: string; sidequest: boolean; placementFor: string | null }[] }[] };
const actOne = () => INDEX().acts.find((a) => a.number === 1)!.jobs.filter((j) => !j.sidequest && !j.placementFor && j.status === "written").map((j) => j.id);

/** A guest who has shipped `jobs`, with each one's Build code from the reference solutions. */
async function seedGuest(page: import("@playwright/test").Page, jobs: string[], name = "Ruth Okafor", playAs: string | null = null) {
  const at = Date.UTC(2026, 10, 6, 12);
  const data: Record<string, unknown[]> = { profile: [], job_progress: [], step_progress: [], code_files: [] };
  data.profile!.push({ key: "me", displayName: name, character: null, settings: { dialogue: "less", sound: false, theme: "dark", motion: "reduced", prose: "serif", editorFontSize: 14, dailyGoalMinutes: null, streaks: false, weeklyEmail: false, publicProfile: false, playAs }, experience: "none", lastLocation: null, onboarded: true, updatedAt: at });
  for (const id of jobs) {
    const j = job(id);
    data.job_progress!.push({ key: id, jobId: id, status: "shipped", startedAt: at - 3_600_000, shippedAt: at, stretchDone: [], timeSpent: 600, updatedAt: at });
    for (const s of j.steps) data.step_progress!.push({ key: `${id}/${s.id}`, jobId: id, stepId: s.id, status: "passed", attempts: 1, hintsUsed: 0, seenSolution: false, predictChoice: null, selfExplanation: null, selfRating: null, timeSpent: 30, data: {}, updatedAt: at });
    const ship = j.steps.find((s) => s.type === "ship");
    const from = ship && ship.type === "ship" ? j.steps.find((s) => s.id === ship.shipsFrom) : undefined;
    if (from && "entry" in from) for (const f of from.files) data.code_files!.push({ key: `${id}/${from.id}/${f}`, jobId: id, stepId: from.id, filename: f, content: solution(`${id}/${from.id}`, f), cursor: null, baseUpdatedAt: null, conflictNote: false, updatedAt: at });
  }
  await page.goto("/credits");
  await expect.poll(() => page.evaluate(async () => (await indexedDB.databases()).some((d) => d.name === "ppc:guest"))).toBe(true);
  await page.evaluate(async (rows) => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open("ppc:guest");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tx = db.transaction(Object.keys(rows), "readwrite");
    for (const [store, list] of Object.entries(rows)) for (const row of list) tx.objectStore(store).put(row);
    await new Promise((res, rej) => {
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    db.close();
  }, data);
}

test("a finished Act's certificate, drawn in the browser: as a picture, and printed on one A4 page", async ({ page }) => {
  await seedGuest(page, actOne(), "Ruth Okafor", "neil");
  await page.goto("/");
  await page.getByRole("button", { name: /The Workshop/ }).first().click();
  await page.getByRole("button", { name: "Get the certificate" }).click();
  await page.waitForURL(/\/certificate\/?#1\./);
  await expect(page.getByRole("heading", { name: "Ruth Okafor" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Ruth Okafor completed Act I, Foundations, with \d+ projects shipped\. Completed 6 November 2026\. Playing as Neil\./ })).toBeVisible();
  // It says what it is: a link, not a signed proof.
  await expect(page.getByText(/Nothing signs the link/)).toBeVisible();

  // Save as a picture: a PNG, 2000 by 1414.
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Save as a picture" }).click()]);
  expect(download.suggestedFilename()).toBe("pauls-python-course-certificate-act-1.png");
  const png = fs.readFileSync((await download.path())!);
  expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([2000, 1414]);

  // Printed: one A4 landscape page with the certificate alone.
  const pdf = (await page.pdf({ preferCSSPageSize: true })).toString("latin1");
  expect(pdf.match(/\/Type\s*\/Page[^s]/g)).toHaveLength(1);
  const box = /\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/.exec(pdf)!;
  expect([Math.round(Number(box[1])), Math.round(Number(box[2]))]).toEqual([842, 595]);
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { name: "Ruth Okafor" })).toBeHidden();
  await page.emulateMedia({ media: "screen" });

  // The same link opens anywhere, for anyone.
  const friend = await page.context().browser()!.newPage();
  await friend.goto(page.url());
  await expect(friend.getByRole("heading", { name: "Ruth Okafor" })).toBeVisible();
  await friend.close();
});

test("share a project and the whole Shelf: a friend opens the link and runs it", async ({ page, browser }) => {
  await seedGuest(page, ["shop-sign", "bill-splitter"]);
  await page.goto("/shelf");
  await page.getByRole("button", { name: "Share Course Sign" }).click();
  const link = await page.getByRole("dialog").getByLabel("The link").inputValue();
  expect(link).toMatch(/\/share\/#1\./);
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Share my Shelf" }).click();
  const shelfLink = await page.getByRole("dialog").getByLabel("The link").inputValue();

  const friend = await (await browser.newContext()).newPage();
  await friend.goto(link);
  await expect(friend.getByRole("heading", { name: "Course Sign" })).toBeVisible();
  await expect(friend.getByText("By Ruth Okafor, for Paul.")).toBeVisible();
  await friend.getByRole("button", { name: "Run it" }).click();
  await expect(friend.getByRole("log", { name: "Output" })).toContainText("Ignore the clock. It says 3:14.", { timeout: 60_000 });

  await friend.goto(shelfLink);
  await expect(friend.getByRole("heading", { name: "Ruth Okafor's Shelf" })).toBeVisible();
  await friend.getByRole("button", { name: /Bill Splitter/ }).click();
  await expect(friend.getByRole("heading", { name: "Bill Splitter" })).toBeVisible();
  await friend.getByRole("button", { name: /Back to Ruth Okafor's Shelf/ }).click();
  await expect(friend.getByRole("button", { name: /Bill Splitter/ })).toBeFocused();
});

test("Take It Home without an account: paste the results, and it counts", async ({ page }) => {
  await seedGuest(page, []);
  await page.goto("/job/python-at-home?step=at-home");
  // The Pages way: ppc test, with no sign-in.
  await expect(page.getByText("ppc test", { exact: true })).toBeVisible();
  await expect(page.getByText("ppc login", { exact: true })).toHaveCount(0);
  await page.getByRole("tab", { name: "With pytest" }).click();
  await page.getByLabel("Paste what pytest printed").fill("=========== 2 failed, 4 passed in 0.20s ===========");
  await page.getByRole("button", { name: "Hand it in" }).click();
  await expect(page.getByText("2 still failing.", { exact: false })).toBeVisible();
  await page.getByLabel("Paste what pytest printed").fill("=========== 6 passed in 0.21s ===========");
  await page.getByRole("button", { name: "Hand it in" }).click();
  await expect(page.getByText(/Handed in, and kept in this browser/)).toBeVisible();
  // Done for good: it's still handed in after a reload.
  await page.reload();
  await expect(page.getByText(/6 of 6 tests passed/)).toBeVisible();
});

test("push to GitHub from the browser with a token kept only here", async ({ page }) => {
  let made = false;
  const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, PUT, PATCH", "content-type": "application/json" };
  await page.route("https://api.github.com/**", async (route) => {
    const r = route.request();
    if (r.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    const p = new URL(r.url()).pathname;
    const send = (status: number, body: unknown) => route.fulfill({ status, headers: cors, body: JSON.stringify(body) });
    const repo = { name: "shop-sign", owner: { login: "ruth" }, default_branch: "main", html_url: "https://github.com/ruth/shop-sign" };
    if (p === "/user") return send(200, { login: "ruth" });
    if (p === "/repos/ruth/shop-sign") return made ? send(200, repo) : send(404, {});
    if (p === "/user/repos") return send(403, { message: "Resource not accessible by personal access token" });
    if (p.endsWith("/git/ref/heads/main")) return send(200, { object: { sha: "c1" } });
    if (p.endsWith("/git/commits/c1")) return send(200, { tree: { sha: "t1" } });
    if (p.endsWith("/git/trees")) return send(201, { sha: "t2" });
    if (p.endsWith("/git/commits")) return send(201, { sha: "c2" });
    if (p.endsWith("/git/refs/heads/main")) return send(200, {});
    return send(500, {});
  });
  await seedGuest(page, ["shop-sign"]);
  await page.goto("/shelf");
  await page.getByRole("button", { name: "Push Course Sign to GitHub" }).click();
  const dialog = page.getByRole("dialog", { name: "Push Course Sign to GitHub" });
  await expect(dialog.getByText(/set Contents to Read and write/)).toBeVisible();
  await dialog.getByLabel("Your token").fill("github_pat_test");
  await dialog.getByRole("button", { name: "Keep it in this browser" }).click();
  await expect(dialog.getByText("Pushing as ruth, with the token kept in this browser.")).toBeVisible();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem("ppc-github-token")))!)).toEqual({ token: "github_pat_test", login: "ruth" });
  await dialog.getByRole("button", { name: "Push", exact: true }).click();
  await expect(dialog.getByRole("link", { name: "Make shop-sign on GitHub" })).toHaveAttribute("href", /github\.com\/new\?name=shop-sign/);
  made = true;
  await dialog.getByRole("button", { name: "Push", exact: true }).click();
  await expect(dialog.getByRole("link", { name: "github.com/ruth/shop-sign" })).toBeVisible();
  await dialog.getByRole("button", { name: "Forget the token" }).click();
  expect(await page.evaluate(() => localStorage.getItem("ppc-github-token"))).toBeNull();
});
