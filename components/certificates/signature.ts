// Paul's signature, in one go of the pen: down the P's stem and round its bowl, along into a, u
// and a looped l, then back under the whole word. The points are the middle of the stroke, written by
// hand and slanted afterwards. The stroke is thin going up and thick coming down, as a pen is, and
// comes to a point at both ends. It's a filled outline, so the SVG and the canvas draw it the same.

/** The middle of the stroke, before the slant. y goes down; the baseline is at 200. */
const STROKE: [number, number][] = [
  // The P: down the stem, a hook at its foot, up and round the bowl, back to the stem.
  [100, 34], [90, 90], [76, 150], [62, 210], [46, 252], [30, 262], [28, 244], [48, 190], [78, 110], [106, 42], [142, 12], [194, 8], [234, 40], [226, 84], [178, 114], [122, 124], [86, 118],
  // A small turn round the stem, and along under the bowl to the top of the a.
  [60, 118], [48, 134], [62, 152], [100, 162], [140, 160], [178, 144], [206, 128],
  // Over the a, back round it, up to its top, down and out.
  [236, 122], [262, 134], [236, 127], [206, 138], [190, 168], [200, 198], [230, 192], [256, 158], [264, 136], [258, 176], [272, 202], [298, 190], [326, 150], [338, 136],
  // The u: down, up, down, and out.
  [330, 178], [344, 203], [370, 190], [394, 138], [388, 180], [402, 204], [432, 190],
  // The l: up the right of the loop, over, down the left, and out.
  [484, 122], [520, 58], [534, 22], [518, 8], [498, 34], [482, 100], [472, 170], [486, 203], [524, 196], [570, 164],
  // The flourish: up and over, then back under the word and away.
  [604, 138], [624, 142], [614, 174], [566, 216], [470, 250], [330, 270], [170, 276], [76, 266], [66, 254], [140, 247], [320, 240], [520, 230], [620, 222],
];

const SLANT = 0.3;
const THIN = 2.2;
const THICK = 13;

/** Points along a smooth curve through the stroke (Catmull-Rom), a couple of units apart. */
function along(points: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    const steps = Math.max(4, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 3));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[points.length - 1]!);
  return out;
}

/** The stroke's outline: the left side forwards, the right side back. */
function outline(): [number, number][] {
  const slanted = along(STROKE).map(([x, y]): [number, number] => [x + (200 - y) * SLANT, y]);
  const n = slanted.length;
  // Coming down presses harder: how far each bit of the stroke is heading down the page.
  const press = slanted.map((p, i) => {
    const a = slanted[Math.max(0, i - 2)]!;
    const b = slanted[Math.min(n - 1, i + 2)]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const down = (b[1] - a[1]) / len;
    return Math.max(0, down) ** 1.4;
  });
  // The hand doesn't change pressure at once.
  const smooth = press.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 7); j <= Math.min(n - 1, i + 7); j++) {
      sum += press[j]!;
      count++;
    }
    return sum / count;
  });
  const width = (i: number) => {
    const ends = Math.min(1, i / 14, (n - 1 - i) / 40);
    return (THIN + (THICK - THIN) * smooth[i]!) * (0.25 + 0.75 * ends);
  };
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  slanted.forEach((p, i) => {
    const a = slanted[Math.max(0, i - 1)]!;
    const b = slanted[Math.min(n - 1, i + 1)]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const w = width(i) / 2;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  });
  return [...left, ...right.reverse()];
}

const OUTLINE = outline();
const xs = OUTLINE.map((p) => p[0]);
const ys = OUTLINE.map((p) => p[1]);
const minX = Math.min(...xs);
const minY = Math.min(...ys);

/** How big the signature is at scale 1. */
export const SIGNATURE = { width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };

/** The signature as path data, with its top left at (x, y). */
export function signaturePath(x: number, y: number, scale = 1): string {
  const at = OUTLINE.map(([px, py]) => `${((px - minX) * scale + x).toFixed(1)} ${((py - minY) * scale + y).toFixed(1)}`);
  return `M${at.join("L")}Z`;
}
