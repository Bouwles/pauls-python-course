// Take It Home and milestone hand-ins kept in the browser (no account, and always on GitHub
// Pages): the results pasted from pytest or ppc test are read here (lib/takehome.ts), and they go
// to the teacher in a progress link (lib/classes/link.ts, report.ts) beside the projects, so a
// link without them, or from before them, reads as it always did.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { deflateSync, strToU8 } from "fflate";
import { decodeReport, encodeReport, fitReport, pack, toBase64Url, unpack } from "@/lib/classes/link";
import { handInOf } from "@/lib/classes/report";
import type { Report } from "@/lib/classes/types";
import type { StepProgressRow } from "@/lib/store/types";
import { parsePpcResult, parseReport, reportPasses, starterFiles } from "@/lib/takehome";
import { getJob } from "@/lib/content/server";
import type { TakeHomeStep } from "@/lib/content/types";

/** What `ppc test` printed for a project with one test passing and one failing (cli/src/ppc/cli.py). */
const FROM_PPC = "ppc-result 1 bY7BCsIwDIZfJeTiwa5MlIGFHRQFj97nkKLVVbZmtMUh4rubVdCLh8D3__kgeeINFfaP2JDLdMwa6gwKDFz-0glVVWE0IR6v3pioVGJy47LXIZgzA9bijxQH4t1F2zZJK5Z9tOS23pNXoFOGyc60LQlY0wTKkqNNfHAA42TwKUaewtfFuhZo-NV9-h_mcikLYNhoP1gH2nfFgo_eWcnlTOb4egM";

describe("results pasted from the learner's computer", () => {
  it("read the line ppc test prints, with each test by name", () => {
    const r = parsePpcResult(`1 failed, 1 passed in 0.03s\n\nTo hand it in, copy the line below:\n\n${FROM_PPC}\n`)!;
    expect(r).toMatchObject({ passed: 1, failed: 1, errors: 0, total: 2, source: "ppc", for: { job: "python-at-home", step: "at-home" } });
    expect(r.environment).toMatch(/^Python 3/);
    expect(r.cases.map((c) => [c.name, c.outcome])).toEqual([["test_greet::test_one", "passed"], ["test_greet::test_two", "failed"]]);
  });

  it("read it when an email has wrapped it over lines", () => {
    const [head, data] = [FROM_PPC.slice(0, 40), FROM_PPC.slice(40)];
    const wrapped = `${head}\n${data.slice(0, 50)}\n${data.slice(50)}\n\nThanks, Ruth`;
    expect(parsePpcResult(wrapped)?.total).toBe(2);
  });

  it("read pytest's own last line, and JUnit XML", () => {
    expect(parseReport("===== 2 failed, 9 passed in 0.31s =====")).toMatchObject({ passed: 9, failed: 2, total: 11, source: "text" });
    expect(parseReport('<testsuites><testsuite><testcase classname="t" name="a"/><testcase classname="t" name="b"><failure message="no"/></testcase></testsuite></testsuites>')).toMatchObject({ passed: 1, failed: 1, source: "junit" });
  });

  it("refuse anything that isn't results", () => {
    for (const bad of ["", "hello", "ppc-result 2 abc", "ppc-result 1 !!!", `ppc-result 1 ${toBase64Url(deflateSync(strToU8("not json")))}`, `ppc-result 1 ${toBase64Url(deflateSync(strToU8(JSON.stringify({ c: [["t", "exploded", ""]] }))))}`]) expect(parseReport(bad)).toBeNull();
  });

  it("are what ppc itself makes, read the same way (when Python is here to ask)", () => {
    let out = "";
    try {
      out = execFileSync("python3", ["-I", "-c", "import sys; sys.path.insert(0, sys.argv[1]); from ppc.cli import result_line; print(result_line({'job': 'shop-sign', 'step': 'make'}, [{'name': 'tests::t1', 'outcome': 'passed', 'message': None}, {'name': 'tests::t2', 'outcome': 'error', 'message': 'NameError: name x is not defined'}]))", path.join(process.cwd(), "cli", "src")], { encoding: "utf8" });
    } catch {
      return;
    }
    expect(parsePpcResult(out)).toMatchObject({ passed: 1, errors: 1, total: 2, for: { job: "shop-sign", step: "make" } });
    expect(parsePpcResult(out)!.cases[1]!.message).toBe("NameError: name x is not defined");
  });

  it("finish the step only with enough passing and none failing", () => {
    expect(reportPasses(parseReport("== 6 passed in 1s ==")!, { minPassed: 6 })).toBe(true);
    expect(reportPasses(parseReport("== 5 passed in 1s ==")!, { minPassed: 6 })).toBe(false);
    expect(reportPasses(parsePpcResult(FROM_PPC)!, { minPassed: 1 })).toBe(false);
  });

  it("are explained in the starter project's README the way this copy of the course takes them", () => {
    const job = getJob("python-at-home")!;
    const step = job.steps.find((s): s is TakeHomeStep => s.type === "takehome")!;
    const readme = (paste: boolean) => starterFiles(job, step, "https://bouwles.github.io/pauls-python-course", { paste })[`${step.folder}/README.md`]!;
    expect(readme(true)).toContain("ppc test");
    expect(readme(true)).toContain("https://bouwles.github.io/pauls-python-course/job/python-at-home/");
    expect(readme(true)).not.toContain("ppc check");
    expect(readme(false)).toContain("ppc check");
    expect(JSON.parse(starterFiles(job, step, "https://bouwles.github.io/pauls-python-course")[`${step.folder}/.ppc.json`]!).site).toBe("https://bouwles.github.io/pauls-python-course");
  });
});

const row = (over: Partial<StepProgressRow>): StepProgressRow => ({ key: "j/s", jobId: "python-at-home", stepId: "at-home", status: "in-progress", attempts: 0, hintsUsed: 0, seenSolution: false, predictChoice: null, selfExplanation: null, selfRating: null, timeSpent: 0, data: {}, updatedAt: 1_762_400_000_000, ...over });

describe("hand-ins in a progress link", () => {
  it("are read from the step's saved state: Take It Home results, and milestones once signed off", () => {
    expect(handInOf(row({ status: "passed", data: { report: { passed: 6, total: 6 }, reportAt: 1_762_450_000_000 } }))).toEqual({ stepId: "at-home", kind: "tests", done: true, passed: 6, total: 6, link: null, at: 1_762_450_000_000 });
    expect(handInOf(row({ data: { report: { passed: 4, total: 6 } } }))).toMatchObject({ kind: "tests", done: false, passed: 4 });
    expect(handInOf(row({ stepId: "own-story", status: "passed", data: { checks: { a: true }, link: " https://github.com/ruth/story ", results: { passed: 4, total: 4 }, reviewedAt: 1_762_460_000_000 } }))).toEqual({ stepId: "own-story", kind: "milestone", done: true, passed: 4, total: 4, link: "https://github.com/ruth/story", at: 1_762_460_000_000 });
    // A milestone still being drafted, a plain step, and a link that isn't https.
    expect(handInOf(row({ data: { checks: { a: true }, link: "https://x.org" } }))).toBeNull();
    expect(handInOf(row({ status: "passed", data: {} }))).toBeNull();
    expect(handInOf(row({ status: "passed", data: { reviewedAt: 1, link: "javascript:alert(1)" } }))?.link).toBeNull();
  });

  const report: Report = {
    classId: "Th3Cl4ssXyz12345",
    className: "Thursday Python",
    teacher: "Paul",
    student: { id: "Ruth0000student1", name: "Ruth", character: null, playAs: null },
    sentAt: 1_762_500_000_000,
    shipped: 3,
    projects: [
      { jobId: "python-at-home", status: "in-progress", passed: 7, seen: 0, total: 8, hints: 0, seconds: 600, lastWorked: null, code: [], codeLeftOut: false, handIns: [{ stepId: "at-home", kind: "tests", done: true, passed: 6, total: 6, link: null, at: 1_762_450_000_000 }] },
      { jobId: "town-weather-report", status: "in-progress", passed: 17, seen: 0, total: 18, hints: 1, seconds: 9000, lastWorked: null, code: [], codeLeftOut: false, handIns: [{ stepId: "own-story", kind: "milestone", done: true, passed: null, total: null, link: "https://github.com/ruth/story", at: 1_762_460_000_000 }] },
      { jobId: "shop-sign", status: "shipped", passed: 10, seen: 0, total: 10, hints: 0, seconds: 900, lastWorked: null, code: [], codeLeftOut: false },
    ],
  };

  it("travel with the progress and read back on the teacher's side", () => {
    const got = decodeReport(fitReport(report).hash);
    expect(got.ok && got.value.projects.map((p) => p.handIns)).toEqual([report.projects[0]!.handIns, report.projects[1]!.handIns, undefined]);
  });

  it("leave a link without them exactly as it was", () => {
    const plain = { ...report, projects: report.projects.map(({ handIns: _, ...p }) => p) };
    const sent = unpack(encodeReport(plain));
    expect(sent.ok && (sent.value as { r: Record<string, unknown> }).r.hi).toBeUndefined();
    const got = decodeReport(encodeReport(plain));
    expect(got.ok && got.value.projects.every((p) => p.handIns === undefined)).toBe(true);
  });

  it("drop hand-ins that don't read, without spoiling the rest of the link", () => {
    const wire = JSON.parse(JSON.stringify({ k: "report", r: { c: report.classId, cn: "Thursday Python", t: "Paul", s: ["Ruth0000student1", "Ruth", 0, 0], at: report.sentAt, sh: 3, p: [["python-at-home", "in-progress", 7, 0, 8, 0, 600, null, 0, []]] } }));
    wire.r.hi = [["python-at-home", "at-home", "t", 1, 6, 6, 1_762_450_000_000, 0], ["python-at-home", "x", "z", 1, 0, 0, 0, 0], ["not-a-set-project", "a", "t", 1, 1, 1, 0, 0], ["python-at-home", "own", "m", 1, -1, -1, 0, "javascript:alert(1)"], "junk"];
    const got = decodeReport(pack(wire));
    expect(got.ok && got.value.projects[0]!.handIns).toEqual([
      { stepId: "at-home", kind: "tests", done: true, passed: 6, total: 6, link: null, at: 1_762_450_000_000 },
      { stepId: "own", kind: "milestone", done: true, passed: null, total: null, link: null, at: null },
    ]);
  });

  it("still read a version 1 link, from before them", () => {
    const v1 = `1.${toBase64Url(deflateSync(strToU8(JSON.stringify({ k: "report", r: { c: report.classId, cn: "Thursday Python", t: "Paul", s: ["Ruth0000student1", "Ruth", 0, 0], at: report.sentAt, sh: 3, p: [["shop-sign", "shipped", 10, 0, 10, 0, 900, null, 0, []]] } }))))}`;
    const got = decodeReport(v1);
    expect(got.ok && got.value.projects[0]!.handIns).toBeUndefined();
  });
});
