import { describe, expect, it } from "vitest";
import { looseMatches, normaliseAnswer, outputMatches } from "@/lib/content/answers";

describe("answers", () => {
  it("ignores trailing spaces and blank lines at either end", () => {
    expect(normaliseAnswer("\n33  \n\n")).toBe("33");
    expect(outputMatches("Mind the step \nRing the bell\n", ["Mind the step\nRing the bell"])).toBe(true);
  });

  it("keeps blank lines in the middle", () => {
    expect(outputMatches("A\nB", ["A\n\nB"])).toBe(false);
  });

  it("forgives case, quotes and a full stop for short answers", () => {
    expect(looseMatches("`Str`.", ["str"])).toBe(true);
    expect(looseMatches("<class 'str'>", ["<class 'str'>"])).toBe(true);
    expect(looseMatches("", ["str"])).toBe(false);
    expect(looseMatches("int", ["str"])).toBe(false);
  });
});
