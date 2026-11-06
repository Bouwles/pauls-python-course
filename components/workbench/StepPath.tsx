"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Step } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Icon, type IconName } from "../ui/Icon";
import { useWorkbench } from "./context";
import { stepLabel } from "./labels";
import styles from "./StepPath.module.css";

function isDone(row: StepProgressRow | undefined) {
  return row?.status === "passed" || row?.status === "seen-solution";
}

/** Each kind of step's mark on the track. */
const MARK: Record<Step["type"], IconName> = {
  ask: "chat",
  learn: "handbook",
  predict: "question",
  investigate: "search",
  worked: "chalkboard",
  pips: "bug",
  fix: "bug",
  parsons: "sort",
  modify: "code",
  make: "wrench",
  ship: "flag",
  concept: "image",
  reading: "article",
  explain: "duck",
  git: "terminal",
  takehome: "house",
  milestone: "medal",
};

/** The landmarks keep their names on the track: the brief, Build it (and Stretch), Ship it. */
const LANDMARKS = new Set<Step["type"]>(["ask", "make", "ship"]);

/**
 * The step bar (REDESIGN-2.md 4.2, REDESIGN3_PLAN.md P2): a compact track with one pixel block
 * per step, so a project of twenty-odd steps fits across the screen. Each block carries its
 * kind's mark (a book for Learn, a question for a Quick check, a bug for a fix...), and the
 * brief, Build it and Ship it keep their names as landmarks. Done blocks are filled green, the
 * current one is a raised sun plate (green once it passes), and the ones ahead wait in outline.
 * Beside the track: "Step 3 of 20 · Learn: Repeat while it's true", which follows the pointer or
 * keyboard focus to say what any block is. A step can be opened once it has been reached. On a
 * phone the line sits above the track, and the track scrolls with the current step in the middle.
 */
export function StepBar({ steps, current, progress, onSelect }: { steps: Step[]; current: string | null; progress: Record<string, StepProgressRow>; onSelect: (id: string) => void }) {
  const { characters, compact, playAs } = useWorkbench();
  const list = useRef<HTMLOListElement>(null);

  const at = steps.findIndex((s) => s.id === current);
  let furthest = at;
  steps.forEach((s, i) => {
    if (progress[s.id] && i > furthest) furthest = i;
  });

  // When the track scrolls (a phone, a narrow window), keep the current step in the middle,
  // without scrolling the page.
  const centre = useCallback(() => {
    const box = list.current;
    const el = box?.querySelector<HTMLElement>("[aria-current='step']");
    if (!box || !el || box.scrollWidth <= box.clientWidth) return;
    const a = box.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    box.scrollLeft += b.left - a.left - box.clientWidth / 2 + b.width / 2;
  }, []);

  useEffect(() => {
    const box = list.current;
    if (!box) return;
    const ro = new ResizeObserver(centre);
    ro.observe(box);
    return () => ro.disconnect();
  }, [centre]);

  useEffect(() => {
    centre();
    const t = setTimeout(centre, 300);
    return () => clearTimeout(t);
  }, [current, compact, centre]);

  return (
    <nav className={[styles.bar, compact ? styles.compact : ""].join(" ")} aria-label="Steps in this project">
      <ol ref={list} className={styles.track}>
        {steps.map((s, i) => {
          const row = progress[s.id];
          const done = isDone(row);
          const isCurrent = i === at;
          const reachable = i <= furthest || done;
          const label = stepLabel(s, characters, playAs);
          const landmark = LANDMARKS.has(s.type) && !compact;
          const state = isCurrent ? (done ? styles.passed : styles.current) : done ? styles.done : reachable ? styles.ahead : styles.locked;
          const status = done ? (row?.status === "seen-solution" ? ", done, solution seen" : ", done") : reachable || isCurrent ? "" : ", not reached yet";
          return (
            <li key={s.id} className={[styles.item, i > 0 ? styles.joined : "", i > 0 && isDone(progress[steps[i - 1]!.id]) ? styles.joinedDone : ""].join(" ")}>
              <button
                type="button"
                className={[styles.block, state, landmark ? styles.landmark : ""].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
                aria-disabled={!reachable || undefined}
                title={`${label}: ${s.title}`}
                onClick={() => {
                  if (reachable) onSelect(s.id);
                }}
              >
                <Icon name={MARK[s.type] ?? "dash"} size={20} />
                {landmark ? (
                  <span className={styles.name} aria-hidden="true">
                    {label}
                  </span>
                ) : null}
                <span className="visually-hidden">
                  {label}: {s.title}
                  {status}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
