import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { render, table } from "../../scripts/build-room-visibility";

// Pages look up whether a gesture shows over a desk in lib/pixel/shown.generated.ts. When a
// gesture, a room or a look changes, the table must be made again.
describe("room visibility table", () => {
  it("is up to date (run npx tsx scripts/build-room-visibility.ts)", () => {
    const now = fs.readFileSync(path.join(process.cwd(), "lib/pixel/shown.generated.ts"), "utf8");
    expect(now).toBe(render(table()));
  }, 120_000);
});
