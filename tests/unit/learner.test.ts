import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { composeLearner, LEARNER_H, LEARNER_W, SPECIES, type LearnerData } from "@/lib/pixel/learner";
import { splitArgs } from "@/components/workbench/CodeWorkspace";

describe("learner character", () => {
  const file = path.join(process.cwd(), "public", "sprites", "learner.json");
  it.skipIf(!fs.existsSync(file))("draws every species, recoloured, inside the frame", () => {
    const data = JSON.parse(fs.readFileSync(file, "utf8")) as LearnerData;
    for (const species of SPECIES) {
      const a = composeLearner(data, { species, coat: "chestnut", jumper: "brick", accessory: "scarf" }, "stand-1");
      const b = composeLearner(data, { species, coat: "soot", jumper: "sea", accessory: "scarf" }, "stand-1");
      expect(a.length).toBe(LEARNER_W * LEARNER_H * 4);
      expect(a.some((v, i) => i % 4 === 3 && v === 255)).toBe(true);
      expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
    }
  });
});

describe("command-line arguments", () => {
  it("splits like a shell, near enough", () => {
    expect(splitArgs(`add "Fix the gate" --urgent`)).toEqual(["add", "Fix the gate", "--urgent"]);
    expect(splitArgs("")).toEqual([]);
  });
});
