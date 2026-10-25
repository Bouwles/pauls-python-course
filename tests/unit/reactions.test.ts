import { describe, expect, it } from "vitest";
import { cuesFromCheck, cuesFromRun, firstTime, pickLine } from "@/lib/reactions";
import type { Character } from "@/lib/content/types";
import type { LocalStore } from "@/lib/store/local";
import type { CheckReport, RunResult } from "@/lib/python/protocol";

function memoryStore(): LocalStore {
  const kv = new Map<string, unknown>();
  return { kvGet: async (k: string) => kv.get(k), kvSet: async (k: string, v: unknown) => void kv.set(k, v) } as unknown as LocalStore;
}

const run = (over: Partial<RunResult>): RunResult => ({ status: "ok", error: null, exitCode: 0, filesOut: {}, output: "", printed: "1\n", inputsRequested: 0, ...over });
const moss: Record<string, Character> = {
  moss: { id: "moss", name: "Moss", role: "mentor", sprite: "moss", pools: { "good-name": ["`{name}`. Good."], many: Array.from({ length: 40 }, (_, i) => `line ${i}`) } },
};

describe("reactions", () => {
  it("fills in names from the learner's code", async () => {
    expect(await pickLine(memoryStore(), moss, "moss", "good-name", { name: "total_price" })).toBe("`total_price`. Good.");
  });

  it("never repeats one of the last 30 lines", async () => {
    const store = memoryStore();
    const said: string[] = [];
    for (let i = 0; i < 30; i++) said.push((await pickLine(store, moss, "moss", "many"))!);
    expect(new Set(said).size).toBe(30);
  });

  it("says nothing rather than repeat a recent line", async () => {
    const store = memoryStore();
    expect(await pickLine(store, moss, "moss", "good-name", { name: "x" })).not.toBeNull();
    expect(await pickLine(store, moss, "moss", "good-name", { name: "x" })).toBeNull();
  });

  it("remembers first times", async () => {
    const store = memoryStore();
    expect(await firstTime(store, "moss:first-fstring")).toBe(true);
    expect(await firstTime(store, "moss:first-fstring")).toBe(false);
  });

  it("puts errors before style", () => {
    const cues = cuesFromRun(run({ status: "error", error: { type: "TypeError", message: 'can only concatenate str (not "int") to str', line: 3, traceback: "" } as RunResult["error"], events: [{ event: "fstring" }] }));
    expect(cues.map((c) => c.event)).toEqual(["error-text-number", "first-fstring"]);
  });

  it("notices a loop that never runs and a program that prints nothing", () => {
    const cues = cuesFromRun(run({ printed: "", events: [{ event: "loop-never-runs" }] }));
    expect(cues.map((c) => c.event)).toEqual(["ran-nothing", "loop-never-runs"]);
  });

  it("reacts to the third miss and to a first-try pass", () => {
    const report = { status: "ok", results: [{ passed: false, stretch: false }, { passed: true, stretch: false }] } as unknown as CheckReport;
    expect(cuesFromCheck(report, 2, false, { pipsStep: false, shorterThanPip: false, hintsUsed: 0 }).map((c) => c.event)).toContain("third-fail");
    const pass = { status: "ok", results: [{ passed: true, stretch: false }] } as unknown as CheckReport;
    expect(cuesFromCheck(pass, 0, true, { pipsStep: true, shorterThanPip: true, hintsUsed: 0 }).map((c) => c.event).slice(0, 2)).toEqual(["shorter-than-pip", "pass-first-try"]);
  });
});
