import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NodePython } from "@/lib/python/node/runner";

let py: NodePython;
beforeAll(() => {
  py = new NodePython();
});
afterAll(async () => {
  await py.close();
});

const run = (code: string) => py.run({ files: { "main.py": code } });

describe("the workshop module (Living Visualisations)", () => {
  it("records grid frames with policies, Q-values and Sir Reginald", async () => {
    const r = await run(`from workshop import show_grid
show_grid([[0, 1], [2, None]], policy=[["up", 3], [">", None]], crab=(0, 1), walls=[(1, 1)], goal=(0, 0), q={(0, 0): [1, 2, 3, 4]}, title="sweep 1")
`);
    expect(r.status).toBe("ok");
    const f = r.visuals!.frames[0]!;
    expect(f).toMatchObject({ kind: "grid", values: [[0, 1], [2, null]], policy: [["^", ">"], [">", null]], crab: [0, 1], walls: [[1, 1]], goal: [[0, 0]], title: "sweep 1" });
    expect(f.kind === "grid" && f.q?.[0]?.[0]).toEqual([1, 2, 3, 4]);
  });

  it("keeps at most 400 frames of each kind, spread over the run, with the last one always kept", async () => {
    const r = await run(`from workshop import show_grid, show_hill
for i in range(1000):
    show_grid([[i]])
for i in range(10):
    show_hill(i, i * i, curve=lambda x: x * x)
`);
    const frames = r.visuals!.frames;
    const grids = frames.filter((f) => f.kind === "grid");
    expect(grids.length).toBeLessThanOrEqual(401);
    expect(grids.at(-1)).toMatchObject({ values: [[999]] });
    expect(frames.filter((f) => f.kind === "hill")).toHaveLength(10);
    expect(r.visuals!.total).toBe(1010);
    expect(r.visuals!.curve?.length).toBe(81);
  });

  it("draws graphs from neighbour dicts or weighted edges", async () => {
    const r = await run(`from workshop import show_graph
show_graph({"bakery": {"pub": 3}, "pub": ["lighthouse"]}, visited=["bakery"], current="pub", distances={"bakery": 0, "pub": 3})
`);
    expect(r.visuals!.frames[0]).toMatchObject({ kind: "graph", edges: [["bakery", "pub", 3], ["pub", "lighthouse", null]], visited: ["bakery"], current: "pub" });
  });

  it("explains bad arguments in plain words, and sends nothing when unused", async () => {
    const bad = await run("from workshop import show_grid\nshow_grid(5)\n");
    expect(bad.error?.type).toBe("TypeError");
    expect(bad.error?.message).toMatch(/list of rows/);
    expect((await run("print(1)")).visuals).toBeUndefined();
  });
});

describe("the ppc CLI", () => {
  const cli = fs.readFileSync(path.join(process.cwd(), "cli", "src", "ppc", "cli.py"), "utf8");
  const files = {
    "ppc/__init__.py": '__version__ = "0.1.0"\n',
    "ppc/_site.py": 'DEFAULT_SITE = "http://localhost:3000"\n',
    "ppc/cli.py": cli,
  };

  it("reads pytest's JUnit report", async () => {
    const r = await py.run({
      files: {
        ...files,
        "main.py": `from ppc.cli import parse_junit, summary_line
xml = '''<?xml version="1.0"?><testsuites><testsuite name="pytest" tests="3">
<testcase classname="tests.test_hello" name="test_greeting" time="0.01"/>
<testcase classname="tests.test_hello" name="test_spaces"><failure message="assert 'Morning,  Tom.' == 'Morning, Tom.'">long</failure></testcase>
<testcase classname="tests.test_hello" name="test_local"><skipped message="local"/></testcase>
</testsuite></testsuites>'''
cases = parse_junit(xml)
print([c["outcome"] for c in cases])
print(cases[1]["name"])
print(summary_line(cases))
`,
      },
    });
    expect(r.error).toBeNull();
    expect(r.printed).toBe("['passed', 'failed', 'skipped']\ntests.test_hello::test_spaces\n1 passed, 1 failed, 1 skipped\n");
  });

  it("zips a project without its virtual environment or caches", async () => {
    const r = await py.run({
      files: {
        ...files,
        "proj/hello.py": "print('hi')\n",
        "proj/.venv/lib/site.py": "x = 1\n",
        "proj/__pycache__/hello.cpython.pyc": "x",
        "proj/tests/test_hello.py": "def test_x():\n    assert True\n",
        "main.py": `import io, zipfile
from pathlib import Path
from ppc.cli import zip_project
data = zip_project(Path("proj"))
print(sorted(zipfile.ZipFile(io.BytesIO(data)).namelist()))
`,
      },
    });
    expect(r.error).toBeNull();
    expect(r.printed).toBe("['proj/hello.py', 'proj/tests/test_hello.py']\n");
  });
});
