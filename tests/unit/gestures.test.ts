import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allGestures } from "../../lib/pixel/gestures";

// Every gesture id is defined once across the gesture files, and none moves the whole person
// (the owner asked for no bouncing: only arms, hands and props move).
describe("gestures", () => {
  const dir = path.join(process.cwd(), "lib/pixel/gestures");
  const ids = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && f !== "registry.ts" && f !== "index.ts")
    .flatMap((f) => [...fs.readFileSync(path.join(dir, f), "utf8").matchAll(/^\s*id: "([a-z0-9-]+)"/gm)].map((m) => m[1]!));

  it("defines each id once", () => {
    const seen = new Set<string>();
    const twice = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(twice).toEqual([]);
  });

  it("registers every id it defines", () => {
    expect(allGestures().map((g) => g.id).sort()).toEqual([...new Set(ids)].sort());
  });

  it("never lifts the body", () => {
    for (const g of allGestures()) expect(Object.keys(g)).not.toContain("lift");
  });
});
