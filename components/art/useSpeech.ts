"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mouthFor, pauseAfter } from "@/lib/mood";
import { prefersReducedMotion } from "@/lib/display";

// Talking (REDESIGN3_PLAN.md): a line appears a letter at a time, about 35 a second, with a beat
// at commas and a longer one at full stops, and the speaker's mouth opens on the vowels it's
// saying and closes on spaces and stops. Click or press to finish the line at once. With reduced
// motion the whole line is there straight away and nobody's mouth moves.

const PER_CHAR = 28;

export interface Speech {
  /** The part of the line said so far. */
  shown: string;
  /** How open the mouth is right now: 0 shut, 1 a little, 2 wide. */
  open: 0 | 1 | 2;
  /** Still talking. */
  talking: boolean;
  /** Finish the line now. */
  skip: () => void;
}

export function useSpeech(text: string, { start = true, onDone }: { start?: boolean; onDone?: () => void } = {}): Speech {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState<0 | 1 | 2>(0);
  const done = useRef(onDone);
  done.current = onDone;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setCount(text.length);
    setOpen(0);
    done.current?.();
  }, [text]);

  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion() || !text) {
      setCount(text.length);
      setOpen(0);
      done.current?.();
      return;
    }
    setCount(0);
    let i = 0;
    const step = () => {
      i++;
      setCount(i);
      const ch = text[i - 1];
      setOpen(mouthFor(ch));
      if (i >= text.length) {
        setOpen(0);
        done.current?.();
        return;
      }
      timer.current = setTimeout(step, PER_CHAR + pauseAfter(ch));
    };
    timer.current = setTimeout(step, 180);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, start]);

  return { shown: text.slice(0, count), open, talking: count < text.length, skip: finish };
}
