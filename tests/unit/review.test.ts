import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NodePython } from "@/lib/python/node/runner";

let py: NodePython;
beforeAll(() => {
  py = new NodePython();
});
afterAll(async () => {
  await py.close();
});

const rules = async (code: string) => (await py.review({ "main.py": code }, 20)).notes.map((n) => n.rule);

describe("Moss's style review", () => {
  it("says nothing about tidy code", async () => {
    const r = await py.review({ "main.py": 'def total_price(loaves, price=240):\n    """Pence."""\n    return loaves * price\n\n\nprint(total_price(3))\n' });
    expect(r.notes).toEqual([]);
  });

  it("notices the common habits, with a reason for each", async () => {
    const code = [
      "import math",
      "list = [1, 2]",
      "totalPrice = 3",
      "def GetPrice(x, items=[]):",
      "    if x == None:",
      "        return 0",
      "    try:",
      "        return x * 2",
      "    except:",
      "        return 0",
      "class bakery_order:",
      "    pass",
      "done = True",
      "if done == True: print('yes'); print('again')",
    ].join("\n");
    const found = await rules(code);
    for (const r of ["shadowed-builtin", "variable-name", "function-name", "class-name", "compare-none", "compare-bool", "bare-except", "mutable-default", "unused-import", "semicolon"]) expect(found, r).toContain(r);
    const notes = (await py.review({ "main.py": code }, 20)).notes;
    expect(notes.find((n) => n.rule === "variable-name")?.message).toMatch(/total_price/);
    expect(notes.find((n) => n.rule === "class-name")?.message).toMatch(/BakeryOrder/);
  });

  it("shows the first of each kind, most useful first, and leaves test files alone", async () => {
    const r = await py.review({ "main.py": "list = 1\ndict = 2\nfooBar = 3\n", "test_main.py": "list = 1\n" }, 3);
    expect(r.notes.map((n) => n.rule)).toEqual(["shadowed-builtin", "variable-name"]);
    expect(r.notes[0]!.count).toBe(2);
    expect(r.total).toBe(3);
  });

  it("ignores code that doesn't parse", async () => {
    expect((await py.review({ "main.py": "def broken(:\n" })).notes).toEqual([]);
  });
});
