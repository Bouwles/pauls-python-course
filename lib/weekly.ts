// The weekly note from Paul (Section 16): opt-in, three lines, what you shipped,
// what is due for review, nothing else. No streaks, no guilt.

export interface WeeklyFacts {
  shipped: string[]; // Job titles shipped in the last seven days
  dueCards: number; // review cards due now
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

const NUMBER = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** Null when there's nothing to say: a quiet week with nothing due gets no email at all. */
export function weeklyNote(facts: WeeklyFacts): { subject: string; lines: string[] } | null {
  if (facts.shipped.length === 0 && facts.dueCards === 0) return null;
  const shipped = facts.shipped.length ? `This week you shipped ${list(facts.shipped.slice(0, 4))}${facts.shipped.length > 4 ? `, and ${facts.shipped.length - 4} more` : ""}.` : "Nothing shipped this week. Your desk is where you left it.";
  const due = facts.dueCards === 0 ? "Nothing due in Morning Rounds." : `${facts.dueCards <= 10 ? NUMBER[facts.dueCards] : facts.dueCards} ${facts.dueCards === 1 ? "card is" : "cards are"} due in Morning Rounds.`;
  return { subject: "From the Workshop", lines: [shipped, due, "Paul"] };
}
