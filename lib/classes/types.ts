// Classes that work through links (app/class): no server, no accounts. A teacher makes a class in
// their browser and sends a join link; a student joins from it and later sends back a progress
// link; the teacher opens that and adds it to the class's register. Everything here lives in the
// browser that made or opened it (lib/classes/store.ts), and travels in links (lib/classes/link.ts).
import type { AvatarLook } from "../avatar";
import type { Policy } from "../league/course";
import type { CastId } from "../playas";
import type { JobStatus } from "../store/types";

/** A project set for the class. */
export interface Assignment {
  jobId: string;
  /** The day it's due, "2026-11-20", or null for no date. */
  due: string | null;
  /** A line from the teacher about it, or "". */
  note: string;
}

/** What a join link carries: the class and what's set. */
export interface ClassInfo {
  id: string;
  name: string;
  /** The teacher's name as the students see it ("Paul"). */
  teacher: string;
  assignments: Assignment[];
  /** When the projects were last changed, so the newer copy of a class wins. */
  updatedAt: number;
}

export interface CodeFile {
  name: string;
  content: string;
}

/** One set project in a student's progress. */
export interface ProjectReport {
  jobId: string;
  status: JobStatus;
  /** Steps passed, and steps where the solution was seen. */
  passed: number;
  seen: number;
  total: number;
  hints: number;
  seconds: number;
  lastWorked: number | null;
  /** The student's code for the project's main Build step. */
  code: CodeFile[];
  /** The code was there but left out to keep the link short. */
  codeLeftOut: boolean;
  /** Work done on the learner's own computer: Take It Home results and capstone milestones (links from before these have none). */
  handIns?: HandIn[];
}

/**
 * Something handed in from the learner's own computer, kept in their browser: a Take It Home
 * step's test results (pasted from pytest or ppc test), or a capstone milestone signed off, with
 * the link they showed and any test results.
 */
export interface HandIn {
  stepId: string;
  kind: "tests" | "milestone";
  /** It counts: the step is passed. */
  done: boolean;
  /** Tests passed, of how many, when there were results. */
  passed: number | null;
  total: number | null;
  /** The https link they showed, for a milestone. */
  link: string | null;
  at: number | null;
}

export interface Student {
  /** Made once in the student's browser, so a newer report replaces the one before. */
  id: string;
  name: string;
  character: AvatarLook | null;
  /** Who they play as: a cast id, or null for someone of their own (lib/playas.ts). */
  playAs: CastId | null;
}

/** A student's Arcade League entry for the week their progress link was made (lib/league). */
export interface LeagueEntryReport {
  week: string;
  /** Average moves over the week's races (lower is better), and how many of them finished. */
  score: number;
  finished: number;
  races: number;
  enteredAt: number;
  /** The policy, so the teacher's browser can race it again and replay it. Null when it was left out. */
  policy: Policy | null;
  /** True when the score was raced again from the policy where the link was opened, not taken as sent. */
  checked: boolean;
}

/** What a progress link carries. */
export interface Report {
  classId: string;
  className: string;
  teacher: string;
  student: Student;
  sentAt: number;
  /** Projects shipped in all, set or not. */
  shipped: number;
  projects: ProjectReport[];
  /** Their League entry this week, if they entered (links from before the League have none). */
  league?: LeagueEntryReport;
}

/** One row of a shared League table: who, and their score. Names and scores only. */
export interface SharedRow {
  /** The student's id, so they can find themselves on it. */
  id: string;
  name: string;
  score: number;
  finished: number;
  races: number;
}

/** What a League table link carries: a class's standings for one week, from its register. */
export interface SharedTable {
  classId: string;
  className: string;
  teacher: string;
  week: string;
  sentAt: number;
  rows: SharedRow[];
}

/** A class this browser teaches: made here, or added from a co-teacher link. */
export interface TaughtClass extends ClassInfo {
  role: "teacher" | "co-teacher";
  createdAt: number;
  /** The latest report from each student. */
  register: Report[];
}

/** A class this browser has joined. */
export interface JoinedClass extends ClassInfo {
  joinedAt: number;
  /** Each set project's main Build step, from the course this browser has (jobId to step id). */
  build: Record<string, string>;
  /** The newest League table the teacher shared, opened in this browser. */
  table?: SharedTable;
}

export interface ClassBook {
  /** This browser's student id, made the first time it's needed. */
  me: string;
  teaching: TaughtClass[];
  joined: JoinedClass[];
}

/** A project in the course, as the class pages need it. Built on the server (lib/classes/course.ts). */
export interface CourseJob {
  id: string;
  /** "Bill Splitter". */
  name: string;
  title: string;
  act: number;
  number: number;
  /** Steps in the project. */
  total: number;
  /** The main Build step: the one the project ships from. */
  build: string | null;
}

export interface CourseAct {
  number: number;
  label: string;
  jobs: CourseJob[];
}
