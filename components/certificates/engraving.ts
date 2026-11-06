// The engraved ornament on the certificate, worked out rather than drawn, as a banknote's is: bands
// and rosettes of guilloche (phase-shifted waves laid over each other), and a vignette of the
// Clocktower in hatched lines. Everything here is path data, so the SVG and the canvas agree.

const n = (v: number) => String(Math.round(v * 10) / 10);
const at = (x: number, y: number) => `${n(x)} ${n(y)}`;
const line = (points: [number, number][], close = false) => `M${points.map(([x, y]) => at(x, y)).join("L")}${close ? "Z" : ""}`;

/** A band of guilloche along a straight line: waves out of step, swelling slowly as they go. */
export function guillocheBand(x0: number, y0: number, x1: number, y1: number, half: number, period: number, waves = 8): string {
  const length = Math.hypot(x1 - x0, y1 - y0);
  const ax = (x1 - x0) / length;
  const ay = (y1 - y0) / length;
  // Whole waves, so the band meets its corners the same way at both ends.
  const cycles = Math.round(length / period);
  const swell = Math.round(cycles / 6) || 1;
  let d = "";
  for (let k = 0; k < waves; k++) {
    const points: [number, number][] = [];
    const steps = Math.ceil(length / 6);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = half * (0.74 + 0.26 * Math.cos(2 * Math.PI * swell * t)) * Math.sin(2 * Math.PI * (cycles * t + k / waves));
      points.push([x0 + ax * length * t - ay * a, y0 + ay * length * t + ax * a]);
    }
    d += line(points);
  }
  return d;
}

/** A guilloche rosette: closed waves round a centre, each a little out of step with the last. */
export function rosette(cx: number, cy: number, inner: number, outer: number, lobes: number, waves: number, steps = 180, wobble = 0): string {
  let d = "";
  for (let k = 0; k < waves; k++) {
    const points: [number, number][] = [];
    for (let i = 0; i < steps; i++) {
      const a = (2 * Math.PI * i) / steps;
      const wave = 0.5 + 0.5 * Math.cos(lobes * a + (2 * Math.PI * k) / waves);
      const r = inner + (outer - inner) * wave * (1 - wobble * (0.5 + 0.5 * Math.cos(3 * lobes * a)));
      points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    d += line(points, true);
  }
  return d;
}

/** A circle as path data. */
export const circle = (cx: number, cy: number, r: number) => `M${at(cx - r, cy)}A${n(r)} ${n(r)} 0 1 0 ${at(cx + r, cy)}A${n(r)} ${n(r)} 0 1 0 ${at(cx - r, cy)}Z`;

/** The seal's scalloped edge: a circle with `points` rounded bumps. */
export function scallop(cx: number, cy: number, r: number, depth: number, points: number): string {
  const out: [number, number][] = [];
  const steps = points * 8;
  for (let i = 0; i < steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    const edge = r + depth * Math.abs(Math.sin((points * a) / 2));
    out.push([cx + edge * Math.cos(a), cy + edge * Math.sin(a)]);
  }
  return line(out, true);
}

/** The vignette's parts, back to front: the engraver's fine lines, stronger lines, and paper to hide what's behind. */
export interface Vignette {
  rays: string;
  /** Paper-coloured: the tower, hiding the rays behind it. */
  mask: string;
  fine: string;
  strong: string;
  /** Solid ink: the door, the clock's hands. */
  solid: string;
}

/** The Clocktower as a banknote would show it: rays behind, hatched stone, the clock saying 3:14. */
export function clocktower(cx: number, ground: number): Vignette {
  const fine: string[] = [];
  const strong: string[] = [];
  const mask: string[] = [];
  const solid: string[] = [];
  const hline = (x0: number, x1: number, y: number) => `M${at(x0, y)}L${at(x1, y)}`;
  const vline = (x: number, y0: number, y1: number) => `M${at(x, y0)}L${at(x, y1)}`;

  const bodyW = 50;
  const bodyTop = ground - 74;
  const headW = 60;
  const headTop = bodyTop - 100;
  const clockY = headTop + 50;
  const clockR = 40;
  const apex = headTop - 48;

  // Rays from behind the clock, wider than they're tall, every other one shorter, trailing off
  // unevenly as an engraved sky does. They start a little below level, down towards the ground.
  let rays = "";
  const count = 190;
  const low = 0.3;
  for (let i = 0; i < count; i++) {
    const a = Math.PI - low + ((Math.PI + 2 * low) * i) / (count - 1);
    const reach = (i % 2 ? 1 : 0.86) * (0.9 + 0.06 * Math.sin(i * 0.37) + 0.04 * Math.sin(i * 1.1));
    rays += `M${at(cx + (clockR + 14) * Math.cos(a), clockY + (clockR + 14) * Math.sin(a))}L${at(cx + 330 * reach * Math.cos(a), clockY + 104 * reach * Math.sin(a))}`;
  }

  // The body: courses of stone, darker down its right side, and the door.
  mask.push(line([[cx - bodyW, ground], [cx - bodyW, bodyTop], [cx + bodyW, bodyTop], [cx + bodyW, ground]], true));
  strong.push(`M${at(cx - bodyW, ground)}L${at(cx - bodyW, bodyTop)}M${at(cx + bodyW, bodyTop)}L${at(cx + bodyW, ground)}`);
  for (let y = bodyTop + 6, row = 0; y < ground; y += 6, row++) {
    fine.push(hline(cx - bodyW, cx + bodyW, y));
    for (let x = cx - bodyW + (row % 2 ? 8 : 20); x < cx + bodyW; x += 24) fine.push(vline(x, y - 6, y));
  }
  for (let x = cx + bodyW - 22; x < cx + bodyW; x += 3) fine.push(vline(x, bodyTop, ground));
  solid.push(`M${at(cx - 15, ground)}L${at(cx - 15, ground - 30)}A15 15 0 0 1 ${at(cx + 15, ground - 30)}L${at(cx + 15, ground)}Z`);

  // The head that holds the clock, with its mouldings.
  mask.push(line([[cx - headW, bodyTop], [cx - headW, headTop], [cx + headW, headTop], [cx + headW, bodyTop]], true));
  strong.push(`M${at(cx - headW, bodyTop)}L${at(cx - headW, headTop)}L${at(cx + headW, headTop)}L${at(cx + headW, bodyTop)}Z`);
  for (const y of [headTop + 6, bodyTop - 6]) strong.push(hline(cx - headW - 5, cx + headW + 5, y));
  strong.push(hline(cx - headW - 7, cx + headW + 7, headTop), hline(cx - headW - 7, cx + headW + 7, bodyTop));
  for (let y = headTop + 10; y < bodyTop - 8; y += 4) {
    fine.push(hline(cx + headW - 16, cx + headW, y));
    if (y % 8 < 4) fine.push(hline(cx - headW, cx - headW + 6, y));
  }

  // The roof, hatched down one side.
  mask.push(line([[cx - headW - 7, headTop], [cx, apex], [cx + headW + 7, headTop]], true));
  strong.push(`M${at(cx - headW - 7, headTop)}L${at(cx, apex)}L${at(cx + headW + 7, headTop)}`);
  const slope = (headW + 7) / (headTop - apex);
  for (let y = apex + 5; y < headTop; y += 4) {
    const half = (y - apex) * slope;
    fine.push(hline(cx + half * 0.12, cx + half, y));
    if (y % 8 < 4) fine.push(hline(cx - half, cx - half * 0.72, y));
  }
  strong.push(vline(cx, apex, apex - 7));
  solid.push(circle(cx, apex - 8, 2.5));

  // The clock. It has said 3:14 for years.
  mask.push(circle(cx, clockY, clockR));
  strong.push(circle(cx, clockY, clockR), circle(cx, clockY, clockR - 5));
  for (let i = 0; i < 12; i++) {
    const a = (2 * Math.PI * i) / 12;
    const r0 = clockR - (i % 3 ? 10 : 14);
    strong.push(`M${at(cx + r0 * Math.sin(a), clockY - r0 * Math.cos(a))}L${at(cx + (clockR - 6) * Math.sin(a), clockY - (clockR - 6) * Math.cos(a))}`);
  }
  const hand = (degrees: number, length: number, width: number) => {
    const a = (degrees * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    return line([[cx - dy * width, clockY + dx * width], [cx + dx * length, clockY + dy * length], [cx + dy * width, clockY - dx * width], [cx - dx * 5, clockY - dy * 5]], true);
  };
  solid.push(hand(97, 19, 2.6), hand(84, 29, 1.8), circle(cx, clockY, 3));

  // The ground it stands on, in lines that run out at each end.
  for (let i = 1; i < 4; i++) fine.push(hline(cx - 300 + i * 62, cx + 300 - i * 62, ground + i * 4));
  strong.push(hline(cx - 300, cx + 300, ground));

  return { rays, mask: mask.join(""), fine: fine.join(""), strong: strong.join(""), solid: solid.join("") };
}
