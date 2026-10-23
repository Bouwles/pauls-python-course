import { describe, expect, it } from "vitest";
import { lintText, stripCode } from "@/lib/content/lint";

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
});
