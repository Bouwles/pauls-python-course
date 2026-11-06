import { describe, expect, it } from "vitest";
import { CAST_IDS, STAND_IN, castJob, castTitle, displayName, isYou, speakerOf, speakersOf, voiceFor } from "@/lib/playas";
import { isOwnWork, ownerFor, speakerFor } from "@/lib/cast";
import { pickLine } from "@/lib/reactions";
import type { Character, Job, Step } from "@/lib/content/types";
import type { LocalStore } from "@/lib/store/local";

const NAMES = { paul: "Paul", neil: "Neil", aaesha: "Aaesha", caitlin: "Caitlin", riya: "Riya", yahya: "Yahya" };

describe("speakerOf", () => {
  it("leaves every line alone for someone of your own", () => {
    for (const who of [...CAST_IDS, "narrator"]) {
      expect(speakerOf(who, null)).toBe(who);
      expect(speakerOf(who, undefined, "self")).toBe(who);
      expect(speakerOf(who, "someone-else")).toBe(who);
    }
  });

  it("leaves other people's lines with them", () => {
    expect(speakerOf("paul", "neil")).toBe("paul");
    expect(speakerOf("riya", "caitlin", "self")).toBe("riya");
  });

  it("gives your character's lines to their stand-in, except in your own moments", () => {
    expect(speakerOf("neil", "neil")).toBe("paul");
    expect(speakerOf("paul", "paul")).toBe("neil");
    expect(speakerOf("caitlin", "caitlin")).toBe("aaesha");
    expect(speakerOf("yahya", "yahya")).toBe("neil");
    for (const id of CAST_IDS) {
      expect(speakerOf(id, id, "self")).toBe(id);
      expect(speakerOf(id, id, "other")).toBe(STAND_IN[id]);
    }
  });

  it("never stands someone in for themselves", () => {
    for (const id of CAST_IDS) expect(STAND_IN[id]).not.toBe(id);
  });

  it("calls you You, and nobody else", () => {
    expect(isYou("caitlin", "caitlin")).toBe(true);
    expect(isYou("caitlin", null)).toBe(false);
    expect(displayName("caitlin", "Caitlin", "caitlin")).toBe("You");
    expect(displayName("riya", "Riya", "caitlin")).toBe("Riya");
  });

  it("finds a second League host when your stand-in is already hosting", () => {
    expect(speakersOf(["aaesha", "caitlin"], null)).toEqual(["aaesha", "caitlin"]);
    expect(speakersOf(["aaesha", "caitlin"], "paul")).toEqual(["aaesha", "caitlin"]);
    const asAaesha = speakersOf(["aaesha", "caitlin"], "aaesha");
    const asCaitlin = speakersOf(["aaesha", "caitlin"], "caitlin");
    for (const [hosts, me] of [
      [asAaesha, "aaesha"],
      [asCaitlin, "caitlin"],
    ] as const) {
      expect(hosts).not.toContain(me);
      expect(new Set(hosts).size).toBe(2);
    }
  });
});

describe("the reaction table, through the stand-ins", () => {
  it("routes each event's owner through speakerOf", () => {
    expect(ownerFor("check-failed")).toBe("neil");
    expect(speakerFor("check-failed")).toBe("neil");
    expect(speakerFor("check-failed", { playAs: "neil" })).toBe("paul");
    expect(speakerFor("check-passed", { playAs: "paul" })).toBe("neil");
    expect(speakerFor("drill-start", { playAs: "yahya" })).toBe("neil");
    expect(speakerFor("drill-start", { playAs: "riya" })).toBe("yahya");
  });

  it("keeps quiet about your own work, which nobody else can speak for", () => {
    expect(isOwnWork("fixed-by-learner", { classmate: "caitlin", playAs: "caitlin" })).toBe(true);
    expect(isOwnWork("recap", { client: "caitlin", playAs: "caitlin" })).toBe(true);
    expect(isOwnWork("recap", { client: "riya", playAs: "caitlin" })).toBe(false);
    expect(isOwnWork("check-failed", { playAs: "neil" })).toBe(false);
  });

  it("lets a stand-in say the owner's line, but not one that names them", async () => {
    const kv = new Map<string, unknown>();
    const store = { kvGet: async (k: string) => kv.get(k), kvSet: async (k: string, v: unknown) => void kv.set(k, v) } as unknown as LocalStore;
    const cast: Record<string, Character> = {
      neil: { id: "neil", name: "Neil", role: "", colour: "", floor: 4, sprite: "", pools: { "check-failed": ["Every programmer has written this exact bug. Including Paul."] } },
      paul: { id: "paul", name: "Paul", role: "", colour: "", floor: 1, sprite: "", pools: {} },
    };
    expect(await pickLine(store, cast, "neil", "check-failed", {}, { by: "paul" })).toBeNull();
    cast.neil!.pools["check-failed"]!.push("Close. Look at line 4 again.");
    expect(await pickLine(store, cast, "neil", "check-failed", {}, { by: "paul" })).toBe("Close. Look at line 4 again.");
  });
});

describe("a project, as it reads to you", () => {
  const line = (who: string, text = "A line.") => ({ who, text });
  const base = { html: "", files: ["main.py"], entry: "main.py", starter: {}, visibleTests: [], requiredCount: 1, stretchCount: 0, hints: null, timeoutMs: 1000, starterFrom: null, argvField: false };
  const steps: Step[] = [
    { id: "ask", type: "ask", title: "The brief", html: "", specHtml: "", example: null, dialogue: [line("caitlin", "Class dinner on Friday."), line("paul")] },
    { id: "worked", type: "worked", title: "How Paul would do it", html: "", language: "python", code: "", inputs: [], subgoals: [], explain: { promptHtml: "", answer: "", concept: null }, dialogue: [line("paul"), line("caitlin")] },
    { ...base, id: "pips", type: "pips", title: "Fix Caitlin's version", dialogue: [line("caitlin", "Can you look at mine?")], dialogueAfter: [line("caitlin", "Oh. That's what it was.")], onPass: null },
    { ...base, id: "make", type: "make", title: "Build it", stretch: false, dialogue: [line("caitlin")], onPass: line("caitlin", "Sorted.") },
    { id: "ship", type: "ship", title: "Ship it", html: "", shelf: null, cards: [], awards: [], shipsFrom: "make", requires: [], places: null, dialogue: [line("caitlin", "Sorted before pudding.")] },
  ];
  const job = { id: "bill-splitter", client: "caitlin", steps } as unknown as Job;
  const at = (j: Job, id: string) => j.steps.find((s) => s.id === id)!;

  it("is unchanged for someone of your own", () => {
    expect(castJob(job, null, NAMES)).toBe(job);
  });

  it("knows your own moments: your brief, your Ship and your old code", () => {
    expect(voiceFor(at(job, "ask"), job, "caitlin")).toBe("self");
    expect(voiceFor(at(job, "ship"), job, "caitlin")).toBe("self");
    expect(voiceFor(at(job, "pips"), job, "caitlin")).toBe("self");
    expect(voiceFor(at(job, "make"), job, "caitlin")).toBe("other");
    expect(voiceFor(at(job, "ask"), job, "riya")).toBe("other");
  });

  it("keeps your lines in your own moments and gives the rest to your stand-in", () => {
    const mine = castJob(job, "caitlin", NAMES);
    expect(at(mine, "ask").dialogue.map((l) => l.who)).toEqual(["caitlin", "paul"]);
    expect(at(mine, "ship").dialogue.map((l) => l.who)).toEqual(["caitlin"]);
    expect(at(mine, "pips").dialogue.map((l) => l.who)).toEqual(["caitlin"]);
    const pips = at(mine, "pips");
    expect(pips.type === "pips" && pips.dialogueAfter[0]!.who).toBe("caitlin");
    expect(at(mine, "worked").dialogue.map((l) => l.who)).toEqual(["paul", "aaesha"]);
    const make = at(mine, "make");
    expect(make.dialogue[0]!.who).toBe("aaesha");
    expect(make.type === "make" && make.onPass?.who).toBe("aaesha");
    // The words, and the steps, are the same.
    expect(mine.steps.map((s) => s.id)).toEqual(job.steps.map((s) => s.id));
    expect(at(mine, "ask").dialogue[0]!.text).toBe("Class dinner on Friday.");
  });

  it("moves Paul's teaching to Neil when you're Paul", () => {
    const asPaul = castJob(job, "paul", NAMES);
    expect(at(asPaul, "worked").dialogue.map((l) => l.who)).toEqual(["neil", "caitlin"]);
    expect(at(asPaul, "worked").title).toBe("How Neil would do it");
    expect(at(asPaul, "ask").dialogue.map((l) => l.who)).toEqual(["caitlin", "neil"]);
  });

  it("makes titles that name you read right, and leaves the rest", () => {
    expect(castTitle("Fix Caitlin's version", "caitlin", NAMES)).toBe("Fix your old version");
    expect(castTitle("Fix Caitlin's code", "caitlin", NAMES)).toBe("Fix your old code");
    expect(castTitle("Fix Caitlin's version", "riya", NAMES)).toBe("Fix Caitlin's version");
    expect(castTitle("How Paul would do it", "paul", NAMES)).toBe("How Neil would do it");
    expect(castTitle("How Paul would sort it", "paul", NAMES)).toBe("How Neil would sort it");
    expect(castTitle("How Paul would do it", "neil", NAMES)).toBe("How Paul would do it");
    expect(castTitle("Build it", "caitlin", NAMES)).toBe("Build it");
  });
});
