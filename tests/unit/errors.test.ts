import { describe, expect, it } from "vitest";
import { explainError } from "@/lib/errors";
import type { PyError } from "@/lib/python/protocol";

const err = (type: string, message: string, line: number | null = 1): PyError => ({ type, message, file: "main.py", line, column: null, text: null, frames: [], traceback: "" });

describe("error explanations", () => {
  it("explains text from input() when it meets arithmetic", () => {
    const src = 'qty = input("How many? ")\ntotal = qty * 2.40\n';
    const e = explainError(err("TypeError", "can't multiply sequence by non-int of type 'float'", 2), src)!;
    expect(e.title).toBe("A number is still text.");
    expect(e.body).toContain("qty holds text");
  });

  it("explains joining text and a number without input", () => {
    const e = explainError(err("TypeError", 'can only concatenate str (not "int") to str', 2), 'day = 14\nprint("March " + day)\n')!;
    expect(e.title).toContain("joining text to a number");
  });

  it("uses Python's suggestion for a NameError", () => {
    const e = explainError(err("NameError", "name 'low_watter' is not defined. Did you mean: 'low_water'?"), "")!;
    expect(e.body).toContain("low_water");
  });

  it("knows a missing bracket and a decimal given to int()", () => {
    expect(explainError(err("SyntaxError", "'(' was never closed"), "print(\"a\"")!.title).toContain("bracket");
    expect(explainError(err("ValueError", "invalid literal for int() with base 10: '4.5'"), "")!.body).toContain("float()");
  });

  it("has something for every common error type", () => {
    for (const t of ["ZeroDivisionError", "IndexError", "KeyError", "RecursionError", "IndentationError"]) {
      expect(explainError(err(t, "x"), "")).not.toBeNull();
    }
  });
});
