// Comparing typed answers. Shared by the Workbench, review cards and content tests.

/** Trailing spaces on each line and blank lines at either end never matter. */
export function normaliseAnswer(text: string): string {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  while (lines.length && lines[0] === "") lines.shift();
  return lines.join("\n");
}

/** Exact output answers: what the program prints, compared line by line. */
export function outputMatches(given: string, expected: string[]): boolean {
  const g = normaliseAnswer(given);
  return expected.some((e) => normaliseAnswer(e) === g);
}

/**
 * Short free answers ("What type is count?"): case, surrounding quotes or
 * backticks, and a trailing full stop are forgiven.
 */
export function looseMatches(given: string, accepted: string[]): boolean {
  const clean = (s: string) =>
    s
      .trim()
      .replace(/\.$/, "")
      .replace(/^[`'"]+|[`'"]+$/g, "")
      .replace(/\.$/, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
  const g = clean(given);
  return g.length > 0 && accepted.some((a) => clean(a) === g);
}
