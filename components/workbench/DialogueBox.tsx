"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Line, Step } from "@/lib/content/types";
import { castColour, hasNamePlate } from "@/lib/cast";
import { prefersReducedMotion } from "@/lib/display";
import { useMedia } from "@/lib/useMedia";
import { useSession } from "@/lib/store/session";
import { playSound } from "@/lib/sound";
import { Button } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { CharacterPortrait, Head } from "../world/CharacterPortrait";
import { useWorkbench } from "./context";
import styles from "./DialogueBox.module.css";

const FOLD_KEY = "fixwick-dialogue-folded";
const CHARS_PER_TICK = 2;
const TICK_MS = 30;
const HINT_INTRO: Line = { who: "moss", text: "Stuck? Pick how much help you want. Each one gives a little more away.", face: "neutral" };
const QUIET: Line = { who: "narrator", text: "Rain on the window. Moss is somewhere inside the radio." };

function stepLines(step: Step, lessTalk: boolean): Line[] {
  const lines = step.dialogue;
  if (!lessTalk) return lines;
  return step.type === "ask" || step.type === "ship" ? lines.slice(0, 1) : [];
}

/** Is this key press for the page, not for a field or a button? Space advances the dialogue only then. */
function isFreeTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || el === document.body) return true;
  if (el.closest(".cm-editor, input, textarea, select, button, a, [contenteditable='true'], [role='dialog']")) return false;
  return Boolean(el.closest("[data-dialogue]")) || el === document.documentElement;
}

/**
 * The dialogue box (REDESIGN.md 5.1): a big portrait, a name plate in the speaker's colour,
 * the line typing out in the pixel font, and a bobbing arrow. Click it or press Space to go on.
 * Moss's hints open here too: steps put them in `hintSlot` while the Hint button is down.
 */
export function DialogueBox({
  step,
  reaction,
  onDismissReaction,
  hintsOpen,
  onCloseHints,
  hintSlotRef,
}: {
  step: Step;
  reaction: (Line & { id: number }) | null;
  onDismissReaction: () => void;
  hintsOpen: boolean;
  onCloseHints: () => void;
  hintSlotRef: (el: HTMLDivElement | null) => void;
}) {
  const { characters, lessTalk } = useWorkbench();
  const { profile } = useSession();
  const phone = useMedia("(max-width: 900px)");
  const lines = useMemo(() => stepLines(step, lessTalk), [step, lessTalk]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [folded, setFolded] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      setFolded(localStorage.getItem(FOLD_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [step.id]);

  // "Watch again" on the Ask replays the client's lines from the top.
  useEffect(() => {
    const replay = () => setIndex(0);
    window.addEventListener("fixwick:replay-dialogue", replay);
    return () => window.removeEventListener("fixwick:replay-dialogue", replay);
  }, []);

  const showing: Line = hintsOpen ? (reaction ?? HINT_INTRO) : (reaction ?? lines[index] ?? QUIET);
  const quiet = showing === QUIET;
  const lineKey = hintsOpen ? `hints-${reaction?.id ?? 0}` : reaction ? `r-${reaction.id}` : `${step.id}-${index}`;
  const full = showing.text.length;

  // Typewriter reveal. Instant with reduced motion, and for the quiet line.
  useEffect(() => {
    if (quiet || prefersReducedMotion()) {
      setRevealed(Number.MAX_SAFE_INTEGER);
      return;
    }
    setRevealed(0);
    const t = setInterval(() => {
      setRevealed((n) => {
        if (n >= full) {
          clearInterval(t);
          return n;
        }
        return n + CHARS_PER_TICK;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [lineKey, full, quiet]);

  // A soft blip when a new line starts, if sound is on.
  useEffect(() => {
    if (!quiet) playSound("blip", profile.settings.sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineKey]);

  const typing = revealed < full;
  const more = !hintsOpen && !reaction && index < lines.length - 1;
  const canAdvance = typing || more || Boolean(reaction);
  const finished = !reaction && !hintsOpen && lines.length > 1 && index === lines.length - 1;

  const advance = useCallback(() => {
    if (typing) setRevealed(Number.MAX_SAFE_INTEGER);
    else if (reaction) onDismissReaction();
    else if (more) setIndex((i) => i + 1);
  }, [typing, reaction, more, onDismissReaction]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!isFreeTarget(e.target)) return;
      if (!canAdvance) return;
      e.preventDefault();
      advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, canAdvance]);

  const oneLine = hintsOpen ? false : phone ? !phoneOpen : folded || lessTalk || quiet;
  const fold = (value: boolean) => {
    setFolded(value);
    try {
      localStorage.setItem(FOLD_KEY, value ? "1" : "0");
    } catch {
      // ignore
    }
  };

  const who = showing.who;
  const character = characters[who];
  const name = hasNamePlate(who) ? (character?.name ?? who) : "";
  const colour = castColour(who);
  // Clients are delighted when their job ships, unless the line says otherwise.
  const face = showing.face ?? (step.type === "ship" && !reaction ? (who === "moss" || who === "pip" ? "pleased" : "delighted") : "neutral");
  const shown = typing ? showing.text.slice(0, revealed) : showing.text;

  return (
    <section
      ref={box}
      className={[styles.talk, oneLine ? styles.oneLine : "", hintsOpen ? styles.hints : "", quiet ? styles.quiet : ""].join(" ")}
      aria-label="Dialogue"
      data-dialogue
    >
      {name ? (
        <p className={styles.plate} style={{ background: colour.face, color: colour.ink }}>
          {name}
        </p>
      ) : null}
      <div className={`frame-dialogue ${styles.box}`}>
        {quiet ? null : oneLine ? (
          <div className={styles.head}>
            <Head id={who} sprite={character?.sprite} scale={3} />
          </div>
        ) : (
          <div className={styles.portrait}>
            <CharacterPortrait id={who} sprite={character?.sprite} face={face} talking={typing} scale={phone ? 1 : 3} height={phone ? 64 : 128} />
          </div>
        )}
        <div className={styles.body}>
          <div
            className={styles.line}
            onClick={() => {
              if (phone && oneLine) setPhoneOpen(true);
              else if (canAdvance) advance();
            }}
          >
            <p className={styles.text} aria-hidden="true">
              {shown}
              {/* Keeps the box from jumping as the line types out. */}
              {typing ? <span className={styles.ghost}>{showing.text.slice(revealed)}</span> : null}
            </p>
            <p className="visually-hidden" aria-live="polite">
              {name ? `${name}: ` : ""}
              {showing.text}
            </p>
            {!typing && canAdvance && !oneLine ? (
              <span className={styles.next} aria-hidden="true">
                <PixelIcon name="next" />
              </span>
            ) : null}
          </div>
          {hintsOpen ? <div className={styles.hintSlot} ref={hintSlotRef} /> : null}
        </div>
        <div className={styles.controls}>
          {canAdvance && !oneLine ? (
            <Button size="sm" variant="quiet" onClick={advance}>
              {typing ? "Show all" : reaction ? (hintsOpen ? "OK" : lines.length ? "Back" : "OK") : "Next"}
            </Button>
          ) : null}
          {more && !oneLine ? (
            <Button size="sm" variant="quiet" onClick={() => setIndex(lines.length - 1)}>
              Skip
            </Button>
          ) : null}
          {finished && !oneLine ? (
            <Button size="sm" variant="quiet" onClick={() => setIndex(0)}>
              Replay
            </Button>
          ) : null}
          {hintsOpen ? (
            <Button size="sm" variant="quiet" onClick={onCloseHints}>
              Close hints
            </Button>
          ) : phone ? (
            !quiet ? (
              <Button size="sm" variant="quiet" onClick={() => setPhoneOpen((o) => !o)} aria-expanded={!oneLine}>
                {oneLine ? "Open" : "Fold"}
              </Button>
            ) : null
          ) : !lessTalk && !quiet ? (
            <Button size="sm" variant="quiet" onClick={() => fold(!folded)} aria-expanded={!folded}>
              {folded ? "Open" : "Fold"}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
