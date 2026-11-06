// The logo's snake, curled into a P, drawn once here and used by the site
// (components/site/Brand.tsx), the server-drawn images (components/certificates/og.tsx) and the
// favicons and OG image (scripts/build-brand.tsx).

// The snake, 14 by 14: # body, s its shaded side, e the eye, t the tongue. The outline is worked
// out around it, so the whole mark is 16 by 16.
export const SNAKE = [
  "...#######....",
  "..#########...",
  "..##.....s##..",
  "..##......s#..",
  "..##......s#..",
  "..##.....s##..",
  "..##..#####...",
  "..##.#e###s...",
  "..##t#####....",
  "..##..sss.....",
  "..#s..........",
  "..#s..........",
  ".##s..........",
  "#ss...........",
];
export const MARK_GRID = SNAKE.length + 2;

/** o the outline, # the body, s its shaded side, e the eye, t the tongue. */
export type MarkPart = "o" | "#" | "s" | "e" | "t";

/** The parts' colours as hex, for places with no CSS (the values of the tokens in tokens.css). */
export const MARK_HEX: Record<MarkPart, string> = { o: "#050608", "#": "#FFB627", s: "#F0A410", e: "#2A1E00", t: "#F2545B" };

/** The whole 16 by 16 mark, cell by cell: a part, or "." for clear. */
export const MARK_CELLS: (MarkPart | ".")[][] = (() => {
  const at = (x: number, y: number) => SNAKE[y - 1]?.[x - 1] ?? ".";
  const cell = (x: number, y: number): MarkPart | "." => {
    const c = at(x, y);
    if (c !== ".") return c as MarkPart;
    const body = (dx: number, dy: number) => !".t".includes(at(x + dx, y + dy));
    return body(1, 0) || body(-1, 0) || body(0, 1) || body(0, -1) ? "o" : ".";
  };
  return Array.from({ length: MARK_GRID }, (_, y) => Array.from({ length: MARK_GRID }, (_, x) => cell(x, y)));
})();

/** One path per part, each a list of one-pixel-high runs, outline first. */
export const MARK_PATHS: { part: MarkPart; d: string }[] = (() => {
  const runs: Record<string, string> = {};
  MARK_CELLS.forEach((row, y) => {
    let x = 0;
    while (x < MARK_GRID) {
      const c = row[x]!;
      let n = 1;
      while (x + n < MARK_GRID && row[x + n] === c) n++;
      if (c !== ".") runs[c] = (runs[c] ?? "") + `M${x} ${y}h${n}v1h-${n}z`;
      x += n;
    }
  });
  return (["o", "#", "s", "e", "t"] as MarkPart[]).filter((c) => runs[c]).map((part) => ({ part, d: runs[part]! }));
})();

/** The mark as an SVG document, `px` square (a multiple of 16 keeps every edge crisp). */
export function markSvg(px: number, fill: Record<MarkPart, string> = MARK_HEX): string {
  const paths = MARK_PATHS.map((p) => `<path d="${p.d}" fill="${fill[p.part]}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${MARK_GRID} ${MARK_GRID}" shape-rendering="crispEdges"><title>Paul's Python Course</title>${paths}</svg>`;
}
