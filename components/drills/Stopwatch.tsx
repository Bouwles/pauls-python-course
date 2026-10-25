// A brass pixel stopwatch, 15x18, drawn as whole-pixel rects at a whole-number scale.
// The hand points one of eight ways and steps round once a second while the clock runs.

const W = 15;
const H = 18;
const CX = 7.5;
const CY = 10.5;

type Px = [number, number];

const inDisc = (r: number) => (x: number, y: number) => (x + 0.5 - CX) ** 2 + (y + 0.5 - CY) ** 2 <= r * r;

/** Pixels to one path of 1-pixel-high runs, so the SVG stays a handful of rects. */
function toPath(px: Px[]): string {
  const rows = new Map<number, number[]>();
  for (const [x, y] of px) rows.set(y, [...(rows.get(y) ?? []), x]);
  let d = "";
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let start = xs[0]!;
    let prev = start;
    for (const x of [...xs.slice(1), Infinity]) {
      if (x === prev + 1) {
        prev = x;
        continue;
      }
      d += `M${start} ${y}h${prev - start + 1}v1h${-(prev - start + 1)}z`;
      start = x;
      prev = x;
    }
  }
  return d;
}

function ring(outer: (x: number, y: number) => boolean, inner: (x: number, y: number) => boolean): Px[] {
  const out: Px[] = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (outer(x, y) && !inner(x, y)) out.push([x, y]);
  return out;
}

const none = () => false;
const OUTLINE = ring(inDisc(7.6), inDisc(6.6));
const CASE = ring(inDisc(6.6), inDisc(5.6));
const BEZEL = ring(inDisc(5.6), inDisc(4.9));
const FACE = ring(inDisc(4.9), none);

// The crown on top, the pusher at one o'clock, a glint on the brass.
const CROWN: Px[] = [[5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [13, 2], [14, 2], [14, 3]];
const NECK: Px[] = [[6, 1], [7, 1], [8, 1], [7, 2], [12, 4], [13, 3]];
const GLINT: Px[] = [[5, 4], [6, 4], [3, 6]];
const TICKS: Px[] = [[7, 6], [11, 10], [7, 14], [3, 10]];
const HUB: Px[] = [[7, 10]];

/** The hand for each of eight directions, from twelve o'clock clockwise. */
const HANDS: Px[][] = [
  [[7, 9], [7, 8], [7, 7]],
  [[8, 9], [9, 8], [10, 7]],
  [[8, 10], [9, 10], [10, 10]],
  [[8, 11], [9, 12], [10, 13]],
  [[7, 11], [7, 12], [7, 13]],
  [[6, 11], [5, 12], [4, 13]],
  [[6, 10], [5, 10], [4, 10]],
  [[6, 9], [5, 8], [4, 7]],
];

const LAYERS: [string, string][] = [
  ["var(--night-0)", toPath(OUTLINE)],
  ["var(--lamp)", toPath([...CASE, ...CROWN])],
  ["var(--lamp-dark)", toPath([...BEZEL, ...NECK])],
  ["var(--art-lamp-glow)", toPath(GLINT)],
  ["var(--chalk)", toPath(FACE)],
  ["var(--fog)", toPath(TICKS)],
];
const HAND_PATHS = HANDS.map(toPath);
const HUB_PATH = toPath(HUB);

export function Stopwatch({ step = 0, scale = 4, className }: { step?: number; scale?: number; className?: string }) {
  const k = Math.max(1, Math.round(scale));
  return (
    <svg className={className} width={W * k} height={H * k} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false" style={{ display: "block", flex: "none" }}>
      {LAYERS.map(([fill, d]) => (
        <path key={fill} d={d} fill={fill} />
      ))}
      <path d={HAND_PATHS[((step % 8) + 8) % 8]} fill="var(--brick)" />
      <path d={HUB_PATH} fill="var(--night-0)" />
    </svg>
  );
}
