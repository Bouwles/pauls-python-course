import { describe, expect, it } from "vitest";
import { asksForAChange, lintText, stripCode } from "@/lib/content/lint";

describe("copy lint", () => {
  it("catches em dashes, emoji and banned phrases", () => {
    expect(lintText("Fix the till — now")).toContain("contains an em dash");
    expect(lintText("Nice one \u{1F680}")).toContain("contains an emoji");
    expect(lintText("Let's dive in")).toContainEqual(expect.stringContaining("dive in"));
    expect(lintText("Unlock your potential")).toContainEqual(expect.stringContaining("unlock"));
  });

  it("forbids exclamation marks in UI copy but not in code", () => {
    expect(lintText("Saved!", { ui: true })).toContain("has an exclamation mark");
    expect(lintText("Use `x != 3` here", { ui: true })).toEqual([]);
    expect(lintText("Saved!", { ui: false })).toEqual([]);
  });

  it("asks for British spelling outside code", () => {
    expect(lintText("Pick a color")).toContainEqual(expect.stringContaining("colour"));
    expect(lintText("Use `color` as a name")).toEqual([]);
  });

  it("strips code before checking", () => {
    expect(stripCode("a `b` ```\nc\n``` {d}")).not.toMatch(/[bcd]/);
  });

  it("tells text that asks for a change to the code from text that explains", () => {
    // A Learn step's example is read only unless the step says the learner changes it.
    expect(asksForAChange("Change line 1 to `count = 5` and run it.")).toBe(true);
    expect(asksForAChange("It prints `Passed.` Change `Morning` to `Hello` on line 2 and run it: the `assert` fails.")).toBe(true);
    expect(asksForAChange('Try `tasks.remove("brushes")` on line 2.')).toBe(true);
    expect(asksForAChange("Add `print(pile)` after the loop to see.")).toBe(true);
    expect(asksForAChange("Change the last line to `slices_each(3, 0)` and it does crash.")).toBe(true);
    expect(asksForAChange("Put `import math` at the top of the file. Run it a few times.")).toBe(false);
    expect(asksForAChange("Add up those lost chances and you get the test's regret.")).toBe(false);
    expect(asksForAChange("Change it, and you've run a different experiment.")).toBe(false);
    expect(asksForAChange("Which function would you change? Run it and read the last line.")).toBe(false);
  });
});
