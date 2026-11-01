// The Clocktower's clock in pixels (REDESIGN-2.md 7.2): stuck at 3:14, as it has been for years.
// Drawn cell by cell on a 21-pixel grid: a brass rim with a dark outline, four marks, and the two
// hands. Shown at whole-number scales only (21, 42, 63, 84 px...), so it stays crisp.

const N = 21;
const C = 10;

function draw(h: number, m: number) {
  const grid: string[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => "."));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x - C, y - C);
      if (d <= 7.6) grid[y]![x] = "f";
      else if (d <= 9.2) grid[y]![x] = "r";
      else if (d <= 10.3) grid[y]![x] = "o";
    }
  // The marks at twelve, three, six and nine.
  for (const [x, y] of [
    [C, 3],
    [C, 4],
    [17, C],
    [16, C],
    [C, 17],
    [C, 16],
    [3, C],
    [4, C],
  ])
    grid[y!]![x!] = "k";
  const hand = (deg: number, len: number) => {
    const a = (deg * Math.PI) / 180;
    for (let t = 0; t <= len; t += 0.25) grid[Math.round(C - Math.cos(a) * t)]![Math.round(C + Math.sin(a) * t)] = "k";
  };
  hand(((h % 12) + m / 60) * 30, 4.6);
  hand(m * 6, 6.6);
  grid[C]![C] = "p";
  return grid;
}

const FILL: Record<string, string> = { o: "var(--px-outline)", r: "var(--sun)", f: "var(--surface-1)", k: "var(--text)", p: "var(--sun)" };

function paths(h: number, m: number) {
  const g = draw(h, m);
  const runs: Record<string, string> = {};
  g.forEach((row, y) => {
    for (let x = 0; x < N; ) {
      const c = row[x]!;
      let n = 1;
      while (x + n < N && row[x + n] === c) n++;
      if (c !== ".") runs[c] = (runs[c] ?? "") + `M${x} ${y}h${n}v1h-${n}z`;
      x += n;
    }
  });
  return ["o", "r", "f", "k", "p"].filter((c) => runs[c]).map((c) => ({ key: c, fill: FILL[c]!, d: runs[c]! }));
}

const STUCK = paths(3, 14);

/** The stuck clock. `scale` is screen pixels per clock pixel. */
export function PixelClock({ scale = 3, className, label }: { scale?: number; className?: string; label?: string }) {
  return (
    <svg
      className={className}
      width={N * scale}
      height={N * scale}
      viewBox={`0 0 ${N} ${N}`}
      shapeRendering="crispEdges"
      focusable="false"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: "block", flex: "none" }}
    >
      {STUCK.map((p) => (
        <path key={p.key} d={p.d} style={{ fill: p.fill }} />
      ))}
    </svg>
  );
}

export const CLOCK_GRID = N;
