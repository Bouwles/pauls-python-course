// The art pipeline: the manifest is complete and follows the naming rule,
// and scripts/check-art.ts passes good art, fails art with the wrong size or an opaque
// background where one must be transparent, and keeps the manifest's statuses in step.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { decodePng, encodePng, pngInfo } from "@/components/art/png";
import { canvasFor, fileFor, idForFile, parseArtId, type Manifest, type ManifestEntry } from "@/components/art/spec";
import { HAIR_STYLES } from "@/lib/avatar";
import { CAST_IDS, FLOORS } from "@/lib/cast";
import { checkImage, generatedModule, syncManifest, transparency } from "@/scripts/check-art";
import { actOneProjects, buildEntries } from "@/scripts/build-art-manifest";

const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), "art", "manifest.json"), "utf8")) as Manifest;
const entry = (id: string) => manifest.entries.find((e) => e.id === id)!;

/** A test image: a disc in the middle on a background that's clear, or (`opaque`) white. */
function image(width: number, height: number, { opaque = false } = {}) {
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const inside = (x - width / 2) ** 2 + (y - height / 2) ** 2 < (Math.min(width, height) / 3) ** 2;
      if (inside) rgba.set([255, 182, 39, 255], i);
      else if (opaque) rgba.set([255, 255, 255, 255], i);
    }
  return { width, height, rgba };
}

const portrait = { size: { width: 64, height: 64 }, transparent: true };
const floor = { size: { width: 96, height: 16 }, transparent: false };

describe("the PNG reader", () => {
  it("reads back what it writes, with and without alpha", () => {
    const img = image(13, 9);
    const back = decodePng(encodePng(img));
    expect(back.width).toBe(13);
    expect(Buffer.from(back.rgba).equals(Buffer.from(img.rgba))).toBe(true);
    const info = pngInfo(encodePng(img, { alpha: false }));
    expect(info).toMatchObject({ width: 13, height: 9, colourType: 2, hasAlpha: false });
  });

  it("refuses a file that isn't a PNG", () => {
    expect(() => pngInfo(Buffer.from("GIF89a, not a PNG at all, honestly"))).toThrow(/not a PNG/);
  });
});

describe("check-art's checks", () => {
  it("measures a transparent background", () => {
    expect(transparency(image(64, 64)).cornersClear).toBe(true);
    expect(transparency(image(64, 64)).clear).toBeGreaterThan(0.5);
    expect(transparency(image(64, 64, { opaque: true }))).toEqual({ cornersClear: false, clear: 0 });
  });

  it("passes a transparent image at the right size", () => {
    expect(checkImage(portrait, encodePng(image(64, 64)))).toEqual([]);
  });

  it("fails the wrong size", () => {
    expect(checkImage(portrait, encodePng(image(60, 64)))).toEqual(["is 60x64 pixels; it should be 64x64"]);
  });

  it("fails an opaque background where transparency is required", () => {
    expect(checkImage(portrait, encodePng(image(64, 64, { opaque: true })))).toEqual(["has a background; the top corners should be fully transparent"]);
    expect(checkImage(portrait, encodePng(image(64, 64, { opaque: true }), { alpha: false }))).toEqual(["has no transparency; export it as a PNG with a transparent background"]);
  });

  it("fails an image that's clear at the corners but nowhere else", () => {
    const img = image(64, 64, { opaque: true });
    for (const [x, y] of [[0, 0], [63, 0]] as const)
      for (let dy = 0; dy < 8; dy++) for (let dx = 0; dx < 8; dx++) img.rgba[((y + dy) * 64 + Math.abs(x - dx)) * 4 + 3] = 0;
    expect(checkImage(portrait, encodePng(img))[0]).toMatch(/% opaque/);
  });

  it("lets an opaque image through where transparency isn't required", () => {
    expect(checkImage(floor, encodePng(image(96, 16, { opaque: true }), { alpha: false }))).toEqual([]);
  });

  it("fails something that isn't a PNG", () => {
    expect(checkImage(portrait, Buffer.from("not an image"))[0]).toMatch(/can't be read as a PNG/);
  });
});

describe("check-art's sync", () => {
  // A small manifest whose sizes are shrunk to test sizes: its "out of date" problems are expected.
  const small: Manifest = {
    about: "",
    naming: "",
    entries: [
      { ...entry("paul.portrait.pleased"), size: { width: 64, height: 64 } },
      { ...entry("clocktower.floor3.open"), size: { width: 96, height: 16 }, status: "final" },
    ],
  };
  const real = (problems: string[]) => problems.filter((p) => !p.includes("manifest is out of date"));

  it("marks a good file final, and a missing one a placeholder", () => {
    const { manifest: next, problems, changes } = syncManifest(small, new Map([["paul_portrait_pleased.png", encodePng(image(64, 64))]]));
    expect(real(problems)).toEqual([]);
    expect(next.entries.map((e) => e.status)).toEqual(["final", "placeholder"]);
    expect(changes).toEqual(["paul.portrait.pleased: placeholder -> final", "clocktower.floor3.open: final -> placeholder"]);
  });

  it("keeps a bad file a placeholder and says why", () => {
    const { manifest: next, problems } = syncManifest(small, new Map([["paul_portrait_pleased.png", encodePng(image(64, 64, { opaque: true }))]]));
    expect(next.entries[0]!.status).toBe("placeholder");
    expect(real(problems)).toEqual(["art/final/paul_portrait_pleased.png has a background; the top corners should be fully transparent"]);
  });

  it("names files that don't belong", () => {
    const { problems } = syncManifest(small, new Map<string, Uint8Array>([["Paul_Portrait_Pleased.png", new Uint8Array()], ["paul.psd", new Uint8Array()]]));
    expect(real(problems)).toEqual([
      "art/final/Paul_Portrait_Pleased.png: no image in the manifest has this name; did you mean paul_portrait_pleased.png? (see the naming rule in art/README.md)",
      "art/final/paul.psd: only the PNG exports go in art/final/ (keep the layered sources elsewhere)",
    ]);
  });

  it("writes a static import for every final image", () => {
    const finals = [{ ...entry("duck"), status: "final" }, { ...entry("paul.portrait.pleased"), status: "final" }] as ManifestEntry[];
    const code = generatedModule(finals);
    expect(code).toContain('import img0 from "@/art/final/duck.png";');
    expect(code).toContain('"paul.portrait.pleased": img1,');
    expect(generatedModule([])).toContain("export const FINAL: Readonly<Record<string, StaticImageData>> = {};");
  });
});

describe("art/manifest.json", () => {
  it("is up to date with the cast, the floors, the avatar options and Act I", () => {
    expect(manifest.entries.map((e) => e.id)).toEqual(buildEntries(actOneProjects()).map((e) => e.id));
    const { problems } = syncManifest(manifest, new Map());
    expect(problems).toEqual([]);
  });

  it("names every file by the rule, and every id parses", () => {
    for (const e of manifest.entries) {
      expect(e.file).toBe(fileFor(e.id));
      expect(idForFile(e.file)).toBe(e.id);
      expect(parseArtId(e.id)?.kind).toBe(e.kind);
      expect(canvasFor(e.id)).toEqual(e.size);
    }
  });

  it("lists everything the artist brief promises", () => {
    const of = (kind: string, required = true) => manifest.entries.filter((e) => e.kind === kind && e.required === required).length;
    expect(of("portrait")).toBe(CAST_IDS.length * 10 + 1);
    expect(of("body")).toBe(CAST_IDS.length * 2);
    expect(of("group")).toBe(1);
    expect(of("floor")).toBe(FLOORS.length * 3);
    expect(of("floor", false)).toBe(FLOORS.length * 3);
    expect(of("shelf")).toBe(13);
    expect(of("duck")).toBe(1);
    for (const h of HAIR_STYLES) expect(entry(`avatar.hair.${h.id}`)).toBeTruthy();
    expect(entry("avatar.hair.hijab").transparent).toBe(true);
    expect(entry("clocktower.roof.busy").size).toEqual({ width: 2400, height: 800 });
  });
});
