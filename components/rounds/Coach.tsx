"use client";

// The coach outside the Workbench (REDESIGN-2.md 4.4, 6): a character's portrait and one line in
// a speech bubble. Morning Rounds has Paul at the start; the Drills have Yahya at the bench.
// Who speaks comes from lib/cast.ts, the line from their pool in content/characters/.
import { useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/content/types";
import { pickLine } from "@/lib/reactions";
import { useSession } from "@/lib/store/session";
import { Portrait } from "../art/Portrait";
import { SpeechBubble } from "../ui/SpeechBubble";
import styles from "./Coach.module.css";

/** A character's name from content, or their id written as a name. */
export function nameOf(characters: Record<string, Character>, id: string): string {
  return characters[id]?.name ?? id.charAt(0).toUpperCase() + id.slice(1);
}

export function Coach({ who, name, children, live = false, size = 56 }: { who: string; name: string; children: React.ReactNode; live?: boolean; size?: number }) {
  return (
    <div className={styles.coach}>
      <span className={styles.face} aria-hidden="true">
        <Portrait who={who} name={name} size={size} />
      </span>
      <div className={styles.say} aria-live={live ? "polite" : undefined}>
        <SpeechBubble who={who} name={name} tail="left">
          <p>
            <span className="visually-hidden">{name}: </span>
            {children}
          </p>
        </SpeechBubble>
      </div>
    </div>
  );
}

/**
 * One line from `who`'s pool for `event`, picked once when `when` turns true. The pool is
 * shared with the rest of the course, so a line said lately isn't said again; when the pool
 * is empty or used up, the fallback is said instead.
 */
export function useLine(characters: Record<string, Character>, who: string, event: string, fallback: string, when = true): string | null {
  const { store, ready } = useSession();
  const [line, setLine] = useState<string | null>(null);
  const picked = useRef<string | null>(null);
  useEffect(() => {
    if (!when || !ready) return;
    const key = `${who}/${event}`;
    if (picked.current === key) return;
    picked.current = key;
    let live = true;
    void pickLine(store, characters, who, event)
      .catch(() => null)
      .then((l) => {
        if (live) setLine(l ?? fallback);
      });
    return () => {
      live = false;
      picked.current = null;
    };
  }, [store, ready, characters, who, event, fallback, when]);
  return when ? line : null;
}
