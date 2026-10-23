// Server-side access to the compiled content bundle (generated/content).
import fs from "node:fs";
import path from "node:path";
import type { Concept, ContentIndex, Job, JobSummary } from "./types";
import type { Files } from "../python/protocol";

const dir = () => path.join(process.cwd(), "generated", "content");

interface Cached<T> {
  mtime: number;
  value: T;
}
const cache = new Map<string, Cached<unknown>>();

function readCached<T>(file: string): T | null {
  const full = path.join(dir(), file);
  let stat: fs.Stats;
  try {
    stat = fs.statSync(full);
  } catch {
    return null;
  }
  const hit = cache.get(full) as Cached<T> | undefined;
  if (hit && hit.mtime === stat.mtimeMs) return hit.value;
  const value = JSON.parse(fs.readFileSync(full, "utf8")) as T;
  cache.set(full, { mtime: stat.mtimeMs, value });
  return value;
}

export function getIndex(): ContentIndex {
  const index = readCached<ContentIndex>("index.json");
  if (!index) throw new Error("Content bundle missing. Run npm run content.");
  return index;
}

export function getJob(id: string): Job | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  return readCached<Job>(path.join("jobs", `${id}.json`));
}

export function getJobSummary(id: string): JobSummary | null {
  for (const act of getIndex().acts) for (const j of act.jobs) if (j.id === id) return j;
  return null;
}

export function allJobSummaries(): JobSummary[] {
  return getIndex().acts.flatMap((a) => a.jobs);
}

export function getConcepts(): Record<string, Concept> {
  return readCached<Record<string, Concept>>("concepts.json") ?? {};
}

export function getTests(key: string): string | null {
  return readCached<Record<string, string>>(path.join("server", "tests.json"))?.[key] ?? null;
}

export function getSolution(key: string): Files | null {
  return readCached<Record<string, Files>>(path.join("server", "solutions.json"))?.[key] ?? null;
}
