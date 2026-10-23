// Characters react to real events with lines from small pools (Section 6.3).
// Recently used lines are remembered so the same one rarely comes twice in a row.
import type { Character } from "./content/types";
import type { LocalStore } from "./store/local";

const KEY = "recent-lines";
const REMEMBER = 24;

export async function pickLine(store: LocalStore | null, characters: Record<string, Character>, who: string, event: string): Promise<string | null> {
  const pool = characters[who]?.pools[event];
  if (!pool || pool.length === 0) return null;
  const recent = ((store ? await store.kvGet<string[]>(KEY) : null) ?? []).slice(-REMEMBER);
  const fresh = pool.filter((l) => !recent.includes(l));
  const choices = fresh.length ? fresh : pool;
  const line = choices[Math.floor(Math.random() * choices.length)]!;
  if (store) await store.kvSet(KEY, [...recent, line].slice(-REMEMBER));
  return line;
}
