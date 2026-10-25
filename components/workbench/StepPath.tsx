"use client";

import { useEffect, useRef } from "react";
import type { Step } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { PixelIcon } from "../ui/PixelIcon";
import styles from "./StepPath.module.css";

const KIND: Record<Step["type"], string> = {
  ask: "The Ask",
  predict: "Predict",
  investigate: "Investigate",
  worked: "Worked example",
  pips: "Pip's Version",
  parsons: "Arrange",
  modify: "Modify",
  make: "Make",
  fix: "Fix",
  ship: "Ship it",
  concept: "Picture it",
  reading: "Read",
  explain: "Explain",
  git: "Terminal",
  takehome: "Take It Home",
  milestone: "Milestone",
};

export function stepKind(s: Step): string {
  if (s.type === "make" && s.stretch) return "Stretch";
  return KIND[s.type];
}

/**
 * The step path (REDESIGN.md 5.1): the job's steps as pixel nodes on a dotted path, like
 * levels on a world map. Done steps carry a tick, the current one is a big lamp node.
 * `tools` sits at the right-hand end (the Hint and Dennis buttons).
 */
export function StepPath({
  steps,
  current,
  progress,
  onSelect,
  tools,
}: {
  steps: Step[];
  current: string | null;
  progress: Record<string, StepProgressRow>;
  onSelect: (id: string) => void;
  tools?: React.ReactNode;
}) {
  const list = useRef<HTMLOListElement>(null);

  // On a phone the path scrolls sideways: keep the current step in view (without scrolling the page).
  useEffect(() => {
    const box = list.current;
    const el = box?.querySelector<HTMLElement>("[aria-current='step']");
    if (!box || !el || box.scrollWidth <= box.clientWidth) return;
    box.scrollLeft = el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2;
  }, [current]);

  return (
    <div className={styles.bar}>
      <ol className={styles.path} ref={list} aria-label="Steps in this job">
        {steps.map((s, i) => {
          const row = progress[s.id];
          const done = row?.status === "passed" || row?.status === "seen-solution";
          const isCurrent = s.id === current;
          const name = `${i + 1}. ${stepKind(s)}${stepKind(s) !== s.title ? `: ${s.title}` : ""}`;
          return (
            <li key={s.id} className={styles.stop}>
              {i > 0 ? <span className={[styles.link, done || isCurrent ? styles.walked : ""].join(" ")} aria-hidden="true" /> : null}
              <button
                className={[styles.node, isCurrent ? styles.current : done ? styles.done : styles.future, s.type === "ship" ? styles.ship : ""].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelect(s.id)}
                data-tip={name}
              >
                <span className={styles.face} aria-hidden="true">
                  {done && !isCurrent ? <PixelIcon name="tick" /> : <span className={styles.num}>{i + 1}</span>}
                </span>
                <span className="visually-hidden">
                  {name}
                  {done ? (row?.status === "seen-solution" ? ", seen the solution" : ", done") : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {tools ? <div className={styles.tools}>{tools}</div> : null}
    </div>
  );
}
