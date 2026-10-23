import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NodePython } from "@/lib/python/node/runner";

let py: NodePython;
beforeAll(() => {
  py = new NodePython();
});
afterAll(async () => {
  await py.close();
});

const check = (code: string, tests: string, files: Record<string, string> = {}) => py.check({ files: { "main.py": code, ...files }, tests });

describe("test harness", () => {
  it("passes a correct program and reports a failing one with expected and actual", async () => {
    const tests = 'TESTS = [output("Doubles", inputs=["4"], expect="8")]';
    expect((await check("n = int(input())\nprint(n * 2)\n", tests)).results[0]!.passed).toBe(true);
    const bad = (await check("n = input()\nprint(n * 2)\n", tests)).results[0]!;
    expect(bad.passed).toBe(false);
    expect(bad.actual).toBe("44\n");
    expect(bad.message).toMatch(/text repeated/);
  });

  it("only suspects repeated text when the program read input", async () => {
    // Act V: a degree of 11 where 2 was expected is a wrong answer, not "1" * 2.
    const r = (await check("print(11)\n", 'TESTS = [output("Degree", expect="2")]')).results[0]!;
    expect(r.passed).toBe(false);
    expect(r.message ?? "").not.toMatch(/text repeated/);
  });

  it("supports the match modes", async () => {
    const out = "Total: 7.20\n";
    for (const [match, expect_] of [["contains", "7.20"], ["last_line", "Total: 7.20"], ["regex", "^Total: \\\\d+\\\\.\\\\d{2}$"], ["numbers", "7.2"]]) {
      const r = await check(`print("${out.trim()}")`, `TESTS = [output("m", expect="${expect_}", match="${match}")]`);
      expect(r.results[0]!.passed, match).toBe(true);
    }
  });

  it("changes top-level values with set_vars, and says so when the variable is missing", async () => {
    const tests = 'TESTS = [output("Five", set_vars={"loaves": 5}, expect="1200")]';
    expect((await check("loaves = 3\nprint(loaves * 240)\n", tests)).results[0]!.passed).toBe(true);
    const r = (await check("print(3 * 240)\n", tests)).results[0]!;
    expect(r.passed).toBe(false);
    expect(r.message).toMatch(/Set loaves near the top/);
  });

  it("swaps lists and text with set_vars too", async () => {
    const r = await check('order = ["bun", "bread"]\nprint(sorted(order))\n', 'TESTS = [output("Other", set_vars={"order": ["cake", "anchovy"]}, expect="[\'anchovy\', \'cake\']")]');
    expect(r.results[0]!.passed).toBe(true);
  });

  it("calls functions without running the main block", async () => {
    const code = 'def price(n):\n    return n * 2.4\n\nif __name__ == "__main__":\n    input()\n';
    const r = await check(code, 'TESTS = [function("Three", call="price", args=(3,), expect=7.2, tol=0.001)]');
    expect(r.results[0]!.passed).toBe(true);
    const missing = await check("x = 1\n", 'TESTS = [function("p", call="price", args=(1,), expect=2)]');
    expect(missing.results[0]!.message).toMatch(/no function called price/);
  });

  it("explains a function that prints instead of returning", async () => {
    const r = await check("def price(n):\n    print(n * 2)\n", 'TESTS = [function("p", call="price", args=(2,), expect=4)]');
    expect(r.results[0]!.message).toMatch(/gave back None/);
  });

  it("runs structure checks", async () => {
    const tests = 'TESTS = [structure("Loop", requires=["For"]), structure("No eval", forbids_calls=["eval"])]';
    const r = await check("for i in range(2):\n    print(eval('1'))\n", tests);
    expect(r.results.map((x) => x.passed)).toEqual([true, false]);
  });

  it("reports a syntax error once, without running checks", async () => {
    const r = await check("print('a'\n", 'TESTS = [output("a", expect="a")]');
    expect(r.status).toBe("syntax-error");
    expect(r.syntaxError?.message).toMatch(/never closed/);
  });

  it("stops a check that runs forever and moves on", async () => {
    const r = await check("while True:\n    pass\n", 'TESTS = [output("t", expect="", timeout=1), output("u", expect="", timeout=1)]');
    expect(r.results[0]!.timedOut).toBe(true);
    expect(r.results).toHaveLength(2);
  });

  it("passes command-line arguments and checks exit codes", async () => {
    const code = "import sys\nif len(sys.argv) < 2:\n    sys.exit('usage: add NAME')\nprint('Added', sys.argv[1])\n";
    const r = await check(code, 'TESTS = [output("add", argv=["gate"], expect="Added gate", exit_code=0), output("none", expect="", exit_code=1)]');
    expect(r.results.map((x) => x.passed)).toEqual([true, true]);
  });

  it("says when the program asks for more input than the check gives", async () => {
    const r = await check("a = input()\nb = input()\n", 'TESTS = [output("one", inputs=["x"], expect="")]');
    expect(r.results[0]!.message).toMatch(/asked for input 2 times/);
  });

  it("points at the one line that differs", async () => {
    const r = await check('print("a")\nprint("x")\nprint("c")\n', 'TESTS = [output("abc", expect="a\\nb\\nc")]');
    expect(r.results[0]!.message).toMatch(/second line/);
  });

  it("traces a program step by step", async () => {
    const t = await py.trace({ files: { "main.py": "xs = [1]\nxs.append(2)\nfor x in xs:\n    print(x)\n" } });
    expect(t.status).toBe("ok");
    expect(t.loops[0]).toMatchObject({ line: 3, kind: "for" });
    const last = t.steps[t.steps.length - 1]!;
    const ref = last.stack[0]!.vars.find(([n]) => n === "xs")![1];
    expect(ref.k).toBe("ref");
  });

  it("restarts the worker when a test is stuck inside one C call, and keeps working", async () => {
    const stuck = py.check({ files: { "main.py": "def slow():\n    return sum(range(10 ** 12))\n" }, tests: 'TESTS = [function("Slow", call="slow", expect=0, timeout=1)]' });
    const started = Date.now();
    await expect(stuck).rejects.toThrow(/restarted/);
    expect(Date.now() - started).toBeLessThan(15_000);
    const after = await py.run({ files: { "main.py": "print(6 * 7)" } });
    expect(after.printed).toBe("42\n");
  });
});
