import { describe, expect, it } from "vitest";
import { weeklyNote } from "@/lib/weekly";

describe("the weekly note from Moss", () => {
  it("says what shipped and what's due, in three lines", () => {
    const note = weeklyNote({ shipped: ["The Fog Horn", "Guess the Catch"], dueCards: 4 })!;
    expect(note.lines).toEqual(["This week you shipped The Fog Horn and Guess the Catch.", "Four old repairs are due a look in Morning Rounds.", "M."]);
  });

  it("stays quiet in a quiet week", () => {
    expect(weeklyNote({ shipped: [], dueCards: 0 })).toBeNull();
  });

  it("never scolds a week without shipping", () => {
    const note = weeklyNote({ shipped: [], dueCards: 1 })!;
    expect(note.lines[0]).toBe("Nothing shipped this week. The desk keeps.");
    expect(note.lines[1]).toBe("One old repair is due a look in Morning Rounds.");
  });
});
