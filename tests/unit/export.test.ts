import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { withWorkshopStub } from "@/lib/export";

describe("downloads that draw with the workshop module", () => {
  it("get a stand-in beside the program that imports it, and only then", () => {
    const files = withWorkshopStub({ "act-08/q-crab/crab.py": "from workshop import show_grid\nshow_grid([[1]])\n", "act-01/sign/main.py": 'print("hi")\n' });
    expect(Object.keys(files).sort()).toEqual(["act-01/sign/main.py", "act-08/q-crab/crab.py", "act-08/q-crab/workshop.py"]);
  });

  it("leaves a real workshop.py alone", () => {
    expect(withWorkshopStub({ "a.py": "import workshop\n", "workshop.py": "# mine\n" })["workshop.py"]).toBe("# mine\n");
  });

  it("lets the program run outside the browser", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fixwick-stub-"));
    const files = withWorkshopStub({ "main.py": "from workshop import show_grid, show_hill\nshow_grid([[0, 1]], title='x')\nshow_hill(1, 2)\nprint('done')\n" });
    for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), content);
    const out = execFileSync("python3", ["main.py"], { cwd: dir, encoding: "utf8" });
    expect(out).toBe("(The workshop drawings only show in the browser editor.)\ndone\n");
  });
});
