import { describe, expect, it } from "vitest";
import { allActions, actionOf, drawFigure, FH, FW, viewFor, VIEWS, type FigureGrid } from "../../lib/pixel/figures";
import { avatarToLook, CAST_LOOKS } from "../../lib/pixel/looks";
import { defaultAvatar } from "../../lib/avatar";
import { CAST_IDS } from "../../lib/cast";
import { errandsOf, residentsOf } from "../../lib/pixel/rooms";

// The full-body figures (lib/pixel/figures.ts): every action draws for every one of the cast and
// for a learner's default avatar, in every view it lists and on every frame of its loop, without
// throwing and never empty. And nobody bobs: the top of the head stays on the same row all the
// way through a loop.

const LOOKS = [...CAST_IDS.map((id) => [id, CAST_LOOKS[id]!] as const), ["a default avatar", avatarToLook(defaultAvatar())] as const];

const filled = (g: FigureGrid) => g.c.filter(Boolean).length;
/** The highest row with hair or a hat on it, or with skin when there's neither (a shaved head). */
function headTop(g: FigureGrid): number {
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (["hair", "cap", "accessory"].includes(g.get(x, y) ?? "")) return y;
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (g.get(x, y) === "skin") return y;
  return -1;
}

describe("figures", () => {
  it("has the cast's six looks to draw", () => {
    expect(LOOKS.length).toBe(7);
    for (const [, look] of LOOKS) expect(look).toBeTruthy();
  });

  it("has at least the 26 actions, each with a view, a label and a loop", () => {
    const all = allActions();
    expect(all.length).toBeGreaterThanOrEqual(26);
    for (const a of all) {
      expect(a.views.length, a.id).toBeGreaterThan(0);
      expect(a.label, a.id).toMatch(/^[a-z]/);
      expect(a.frames, a.id).toBeGreaterThan(0);
      expect(a.ms, a.id).toBeGreaterThan(0);
    }
  });

  for (const a of allActions())
    describe(a.id, () => {
      for (const [who, look] of LOOKS)
        it(`draws for ${who} in every view and frame, never empty, never bobbing`, () => {
          for (const view of a.views) {
            const tops = new Set<number>();
            for (let frame = 0; frame < a.frames; frame++) {
              let g: FigureGrid | undefined;
              expect(() => (g = drawFigure(look, { action: a.id, view, frame })), `${view} ${frame}`).not.toThrow();
              expect(filled(g!), `${view} frame ${frame} is empty`).toBeGreaterThan(80);
              tops.add(headTop(g!));
            }
            expect([...tops], `${view}: the head moves up or down`).toHaveLength(1);
          }
        });
    });

  it("turns an action to the nearest view it has", () => {
    for (const a of allActions()) for (const v of VIEWS) expect(a.views).toContain(viewFor(a, v));
  });

  it("stands for an unknown action", () => {
    expect(actionOf("no-such-action").id).toBe("stand");
  });

  it("only sends residents on errands in their own rooms, to things they can do", () => {
    for (let act = 1; act <= 9; act++) {
      const here = residentsOf(act).map((s) => s.who);
      for (const e of errandsOf(act)) {
        expect(here, `act ${act}: ${e.who}`).toContain(e.who);
        for (const id of [e.via, e.back, ...(e.then ?? []).map((t) => t.action)].filter(Boolean)) expect(actionOf(id).id, `act ${act}: ${id}`).toBe(id);
        if (e.via) expect(actionOf(e.via).travel, `${e.via} travels`).toBeGreaterThan(0);
        if (e.back) expect(actionOf(e.back).travel, `${e.back} travels`).toBeGreaterThan(0);
      }
    }
  });
});
