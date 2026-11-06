"use client";

// The cast outside the Workbench: who's who, and which line they say.
// Morning Rounds has Paul; the Drills have Yahya; their stand-ins when you're playing as them
// (lib/playas.ts). They speak through <Speech> (components/art);
// who speaks comes from lib/cast.ts, the line from their pool in content/characters/.
import { useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/content/types";
import { pickLine } from "@/lib/reactions";
import { useSession } from "@/lib/store/session";

/** A character's name from content, or their id written as a name. */
export function nameOf(characters: Record<string, Character>, id: string): string {
  return characters[id]?.name ?? id.charAt(0).toUpperCase() + id.slice(1);
}

/**
 * One line from `who`'s pool for `event`, picked once when `when` turns true. The pool is
 * shared with the rest of the course, so a line said lately isn't said again; when the pool
 * is empty or used up, the fallback is said instead. `by` is who says it, when that's a
 * stand-in for `who`.
 */
export function useLine(characters: Record<string, Character>, who: string, event: string, fallback: string, when = true, by?: string): string | null {
  const { store, ready } = useSession();
  const [line, setLine] = useState<string | null>(null);
  const picked = useRef<string | null>(null);
  useEffect(() => {
    if (!when || !ready) return;
    const key = `${who}/${event}/${by ?? ""}`;
    if (picked.current === key) return;
    picked.current = key;
    let live = true;
    void pickLine(store, characters, who, event, {}, { by })
      .catch(() => null)
      .then((l) => {
        if (live) setLine(l ?? fallback);
      });
    return () => {
      live = false;
      picked.current = null;
    };
  }, [store, ready, characters, who, event, fallback, when, by]);
  return when ? line : null;
}
