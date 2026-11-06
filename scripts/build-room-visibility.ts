// Works out, for every room, cast member and gesture, whether the gesture shows over the desk, and
// writes the answers to lib/pixel/shown.generated.ts so pages look them up instead of drawing to
// find out. Run after changing a gesture, a room or a look; tests/unit/shown.test.ts says when.
//   npx tsx scripts/build-room-visibility.ts
import fs from "node:fs";
import path from "node:path";
import { computeShows } from "../lib/pixel/shown";
import { allGestures, gesturesFor } from "../lib/pixel/gestures";
import { CAST_LOOKS } from "../lib/pixel/looks";

export function table(): { known: string[]; hidden: string[] } {
  const hidden: string[] = [];
  for (let act = 1; act <= 9; act++)
    for (const who of Object.keys(CAST_LOOKS))
      for (const g of gesturesFor(who)) if (g.id !== "idle" && !computeShows(act, who, g.id)) hidden.push(`${act}|${who}|${g.id}`);
  return { known: allGestures().map((g) => g.id).sort(), hidden: hidden.sort() };
}

export function render({ known, hidden }: { known: string[]; hidden: string[] }): string {
  return [
    "// Made by scripts/build-room-visibility.ts. Don't edit: run it again after changing a gesture, a room or a look.",
    "// The gestures it knows about, and which of them a desk hides, as \"act|who|gesture\".",
    `export const KNOWN: ReadonlySet<string> = new Set(${JSON.stringify(known)});`,
    `export const HIDDEN: ReadonlySet<string> = new Set(${JSON.stringify(hidden)});`,
    "",
  ].join("\n");
}

if (process.argv[1]?.endsWith("build-room-visibility.ts")) {
  const out = path.join(process.cwd(), "lib/pixel/shown.generated.ts");
  const t = table();
  fs.writeFileSync(out, render(t));
  console.log(`lib/pixel/shown.generated.ts: ${t.known.length} gestures, ${t.hidden.length} hidden by a desk`);
}
