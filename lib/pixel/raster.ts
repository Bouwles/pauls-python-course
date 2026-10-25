// Pixel images drawn on the server (certificates, share cards): palette colours only, whole
// pixels only, text in the 5x7 world font. Node only.
import data from "@/generated/pixel-data.json";
import { ICONS } from "@/generated/icons";
import { encodePng } from "./png";

const COLOURS = data.colours as unknown as Record<string, [number, number, number]>;
const FONT = data.font as unknown as { w: number; h: number; glyphs: Record<string, string[]> };
const NAMES: Record<string, string> = { " ": "space", ".": "period", ",": "comma", "'": "apostrophe", "-": "hyphen", ":": "colon", "&": "ampersand", "?": "question", "/": "slash" };

export class Raster {
  readonly rgba: Uint8Array;
  constructor(
    readonly w: number,
    readonly h: number,
    background: string,
  ) {
    this.rgba = new Uint8Array(w * h * 4);
    this.rect(0, 0, w, h, background);
  }

  private plot(x: number, y: number, c: [number, number, number]) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.rgba[i] = c[0];
    this.rgba[i + 1] = c[1];
    this.rgba[i + 2] = c[2];
    this.rgba[i + 3] = 255;
  }

  /** A filled rectangle in a palette colour (its key in palette.json). */
  rect(x: number, y: number, w: number, h: number, colour: string) {
    const c = COLOURS[colour];
    if (!c) throw new Error(`no palette colour ${colour}`);
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.plot(xx, yy, c);
  }

  /** The width `text` takes at scale k. */
  static measure(text: string, k: number): number {
    return text.length * (FONT.w + 1) * k - k;
  }

  text(text: string, x: number, y: number, k: number, colour: string, shadow?: string) {
    let cx = x;
    for (const ch of text.toUpperCase()) {
      const g = FONT.glyphs[NAMES[ch] ?? ch];
      if (g) {
        if (shadow) this.glyph(g, cx + k, y + k, k, shadow);
        this.glyph(g, cx, y, k, colour);
      }
      cx += (FONT.w + 1) * k;
    }
  }

  /** Centred on `cx`. */
  textCentred(text: string, cx: number, y: number, k: number, colour: string, shadow?: string) {
    this.text(text, Math.round(cx - Raster.measure(text, k) / 2), y, k, colour, shadow);
  }

  private glyph(rows: string[], x: number, y: number, k: number, colour: string) {
    const c = COLOURS[colour]!;
    rows.forEach((row, gy) => {
      for (let gx = 0; gx < row.length; gx++) if (row[gx] !== ".") for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) this.plot(x + gx * k + dx, y + gy * k + dy, c);
    });
  }

  /** Copies part of a bitmap (a sprite frame, a scene) at a whole-number scale; transparent pixels are skipped. */
  blit(src: { w: number; h: number; rgba: Uint8Array | Uint8ClampedArray }, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, k: number) {
    for (let y = 0; y < sh; y++)
      for (let x = 0; x < sw; x++) {
        const i = ((sy + y) * src.w + sx + x) * 4;
        if (src.rgba[i + 3]! < 128) continue;
        const c: [number, number, number] = [src.rgba[i]!, src.rgba[i + 1]!, src.rgba[i + 2]!];
        for (let yy = 0; yy < k; yy++) for (let xx = 0; xx < k; xx++) this.plot(dx + x * k + xx, dy + y * k + yy, c);
      }
  }

  /** A pixel icon from the interface kit. Chalk pixels take `colour`; the rest keep their own. */
  icon(name: string, x: number, y: number, k: number, colour = "M") {
    const icon = ICONS[name];
    if (!icon) return;
    const paths = Object.values(icon.frames)[0]!;
    for (const p of paths) {
      const c = p.fill === "currentColor" ? COLOURS[colour]! : ([1, 3, 5].map((i) => parseInt(p.fill.slice(i, i + 2), 16)) as [number, number, number]);
      for (const m of p.d.matchAll(/M(\d+) (\d+)h(\d+)/g)) {
        const [px, py, run] = [Number(m[1]), Number(m[2]), Number(m[3])];
        for (let r = 0; r < run; r++) for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) this.plot(x + (px + r) * k + dx, y + py * k + dy, c);
      }
    }
  }

  png(): Buffer {
    return encodePng(this.w, this.h, this.rgba);
  }

  /** Packed RGB with no alpha, for embedding in a PDF. */
  rgb(): Buffer {
    const out = Buffer.alloc(this.w * this.h * 3);
    for (let i = 0, j = 0; i < this.rgba.length; i += 4, j += 3) {
      out[j] = this.rgba[i]!;
      out[j + 1] = this.rgba[i + 1]!;
      out[j + 2] = this.rgba[i + 2]!;
    }
    return out;
  }
}
