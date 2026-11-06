// The Arcade League in a class (lib/league): with a class, the League's table becomes the class's.
// - A student's progress link carries their entry for the week it was made (score, finished, and
//   the policy, which the teacher's browser races again).
// - The teacher's table for a week is the register: each student whose latest progress link has
//   an entry for that week.
// - "Share the table" makes a League table link with names and scores only. Anyone can open it on
//   the League page; a student who has joined the class keeps it (lib/classes/store.ts putTable)
//   and finds their own row by their student id.
import { isoWeek } from "../league/course";
import { entryFor, scoreOf, type MyEntry } from "../league/local";
import { rankRows, type TableRow } from "../league/table";
import type { JoinedClass, LeagueEntryReport, Report, SharedTable, TaughtClass } from "./types";

/** This week's entry, as a progress link carries it; undefined when there isn't one. */
export function leagueForReport(entries: MyEntry[], now = Date.now()): LeagueEntryReport | undefined {
  const week = isoWeek(new Date(now));
  const e = entryFor(entries, week);
  return e ? { week, ...scoreOf(e.policy, week), enteredAt: e.enteredAt, policy: e.policy, checked: true } : undefined;
}

const studentRow = (r: Report): TableRow | null =>
  r.league ? { key: `student:${r.student.id}`, name: r.student.name, score: r.league.score, finished: r.league.finished, races: r.league.races, enteredAt: r.league.enteredAt, mine: false } : null;

/** A taught class's table for a week, from the register. */
export function registerRows(cls: TaughtClass, week: string): TableRow[] {
  return cls.register.filter((r) => r.league?.week === week).map(studentRow).filter((r): r is TableRow => r !== null);
}

/** The table to share for a week: the register's entries in order. */
export function tableToShare(cls: TaughtClass, week: string, now = Date.now()): SharedTable {
  const byKey = new Map(cls.register.map((r) => [`student:${r.student.id}`, r.student.id]));
  return {
    classId: cls.id,
    className: cls.name,
    teacher: cls.teacher,
    week,
    sentAt: now,
    rows: rankRows(registerRows(cls, week)).map((r) => ({ id: byKey.get(r.key)!, name: r.name, score: r.score, finished: r.finished, races: r.races })),
  };
}

/** A shared table's rows, with yours marked: `me` is this browser's student id. */
export function sharedRows(table: SharedTable, me: string): TableRow[] {
  return table.rows.map((r, i) => ({ key: `student:${r.id}`, name: r.name, score: r.score, finished: r.finished, races: r.races, enteredAt: i, mine: Boolean(me) && r.id === me }));
}

/**
 * A joined class's table for a week, as you see it: the teacher's shared table if it's for that
 * week, with your own row swapped for `mine` (your newest entry in this browser) when you have one.
 */
export function joinedRows(cls: JoinedClass, week: string, me: string, mine: TableRow | null): TableRow[] {
  const shared = cls.table && cls.table.week === week ? sharedRows(cls.table, me) : [];
  if (!mine) return shared;
  const name = shared.find((r) => r.mine)?.name ?? mine.name;
  return [...shared.filter((r) => !r.mine), { ...mine, name }];
}
