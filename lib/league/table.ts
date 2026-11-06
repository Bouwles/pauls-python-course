// A League table from wherever its rows come from: the cast (lib/league/cast.ts), your own entry
// (lib/league/local.ts), a class's register or a shared table (lib/classes/league.ts), and in
// the local version the server's entrants. The same order as the server's table: fewest moves
// first, and on a tie, whoever entered first. Tied scores share a place.

export interface TableRow {
  /** Unique in the table: "cast:aaesha", "student:<id>", "server:<n>" or "me". */
  key: string;
  name: string;
  score: number;
  finished: number;
  races: number;
  /** When the entry went in (ms), for ties; 0 when nobody knows. */
  enteredAt: number;
  /** Your own row. */
  mine: boolean;
}

export interface PlacedRow extends TableRow {
  place: number;
}

const order = (a: TableRow, b: TableRow) => a.score - b.score || a.enteredAt - b.enteredAt || a.name.localeCompare(b.name);

/** The rows in order, each with its place. Each key appears once: the first row with it wins. */
export function rankRows(rows: TableRow[]): PlacedRow[] {
  const seen = new Set<string>();
  const unique = rows.filter((r) => (seen.has(r.key) ? false : (seen.add(r.key), true)));
  const sorted = [...unique].sort(order);
  return sorted.map((r) => ({ ...r, place: 1 + sorted.filter((o) => o.score < r.score).length }));
}

/** Where a score would come among some rows: 1 is top. */
export const placeAmong = (rows: TableRow[], score: number) => 1 + rows.filter((r) => r.score < score).length;

/** "1st", "2nd", "3rd", "11th". */
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}
