"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Step } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Icon } from "../ui/Icon";
import { useWorkbench } from "./context";
import { stepLabel } from "./labels";
import styles from "./StepPath.module.css";

function isDone(row: StepProgressRow | undefined) {
  return row?.status === "passed" || row?.status === "seen-solution";
}

/**
 * The step bar (REDESIGN-2.md 4.2, REDESIGN3_PLAN.md P2): the project's steps by name, not number,
 * in the pixel face, joined by a dotted track. Done steps carry a check, the current one is a
 * raised sun plate (green once it passes), the rest wait in a quieter colour.
 * A step can be opened once it has been reached. When the names don't fit, the earlier done
 * steps fold into "3 done", which opens a list of them. On a phone the bar scrolls sideways with
 * the current step in the middle.
 */
export function StepBar({ steps, current, progress, onSelect }: { steps: Step[]; current: string | null; progress: Record<string, StepProgressRow>; onSelect: (id: string) => void }) {
  const { characters, compact } = useWorkbench();
  const bar = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const measure = useRef<HTMLOListElement>(null);
  const [fold, setFold] = useState(0);
  const [open, setOpen] = useState(false);
  const groupButton = useRef<HTMLButtonElement>(null);
  const popover = useRef<HTMLDivElement>(null);

  const at = steps.findIndex((s) => s.id === current);
  let furthest = at;
  steps.forEach((s, i) => {
    if (progress[s.id] && i > furthest) furthest = i;
  });
  // The done steps before the current one, from the start: these are the ones that can fold.
  let foldable = 0;
  while (foldable < at && isDone(progress[steps[foldable]!.id])) foldable++;

  // When the bar scrolls, keep the current step in the middle (without scrolling the page).
  const centre = useCallback(() => {
    const box = list.current;
    const el = box?.querySelector<HTMLElement>("[aria-current='step']");
    if (!box || !el || box.scrollWidth <= box.clientWidth) return;
    const a = box.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    box.scrollLeft += b.left - a.left - box.clientWidth / 2 + b.width / 2;
  }, []);

  // How many to fold: as few as fit. Widths come from an invisible copy of the whole bar.
  const fit = useCallback(() => {
    const box = bar.current;
    const ruler = measure.current;
    if (!box || !ruler) return;
    if (compact) {
      setFold(0);
      return;
    }
    const items = [...ruler.querySelectorAll<HTMLElement>("[data-measure='step']")].map((el) => el.offsetWidth);
    const sep = ruler.querySelector<HTMLElement>("[data-measure='sep']")?.offsetWidth ?? 24;
    const group = ruler.querySelector<HTMLElement>("[data-measure='group']")?.offsetWidth ?? 80;
    const style = getComputedStyle(box);
    const room = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
    const width = (k: number) => {
      const shown = items.slice(k);
      return shown.reduce((a, b) => a + b, 0) + (k > 0 ? group + sep : 0) + sep * Math.max(0, shown.length - 1);
    };
    let k = 0;
    while (k < foldable && width(k) > room) k++;
    setFold(k);
  }, [compact, foldable]);

  useLayoutEffect(() => {
    fit();
  }, [fit, steps, current, progress, characters]);

  useEffect(() => {
    const box = bar.current;
    if (!box) return;
    const ro = new ResizeObserver(() => {
      fit();
      centre();
    });
    ro.observe(box);
    // Fonts arriving change the widths.
    void document.fonts?.ready.then(() => {
      fit();
      centre();
    });
    return () => ro.disconnect();
  }, [fit, centre]);

  useEffect(() => {
    centre();
    const t = setTimeout(centre, 300);
    return () => clearTimeout(t);
  }, [current, fold, compact, centre]);

  // The folded list closes on a click outside it or on Escape.
  useEffect(() => {
    if (!open) return;
    popover.current?.querySelector<HTMLElement>("button")?.focus();
    const onDown = (e: PointerEvent) => {
      if (!popover.current?.contains(e.target as Node) && !groupButton.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        groupButton.current?.focus();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pill = (s: Step, i: number, forMeasure = false) => {
    const row = progress[s.id];
    const done = isDone(row);
    const isCurrent = i === at;
    const reachable = i <= furthest || done;
    const label = stepLabel(s, characters);
    const state = isCurrent ? (done ? styles.passed : styles.current) : done ? styles.done : styles.future;
    const status = done ? (row?.status === "seen-solution" ? ", done (solution seen)" : ", done") : isCurrent ? "" : reachable ? "" : ", not reached yet";
    return (
      <button
        type="button"
        className={[styles.pill, state].join(" ")}
        aria-current={isCurrent && !forMeasure ? "step" : undefined}
        aria-disabled={!reachable || undefined}
        aria-describedby={forMeasure ? undefined : `step-title-${s.id}`}
        title={s.title}
        tabIndex={forMeasure ? -1 : undefined}
        data-measure={forMeasure ? "step" : undefined}
        onClick={() => {
          if (reachable && !forMeasure) onSelect(s.id);
        }}
      >
        {done ? <Icon name="check" size={16} /> : null}
        <span>{label}</span>
        {forMeasure ? null : (
          <>
            <span className="visually-hidden">{status}</span>
            <span id={`step-title-${s.id}`} hidden>
              {s.title}
            </span>
          </>
        )}
      </button>
    );
  };

  const sep = (key: string, forMeasure = false) => (
    <li key={key} className={styles.sep} aria-hidden="true" data-measure={forMeasure ? "sep" : undefined} />
  );

  const folded = steps.slice(0, fold);
  const shown = steps.map((s, i) => [s, i] as const).slice(fold);

  return (
    <nav ref={bar} className={styles.bar} aria-label="Steps in this project">
      <ol ref={list} className={styles.list}>
        {fold > 0 ? (
          <>
            <li className={styles.groupItem}>
              <button ref={groupButton} type="button" className={[styles.pill, styles.done, styles.group].join(" ")} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
                <Icon name="check" size={16} />
                <span>{fold} done</span>
                <Icon name="caretDown" size={16} />
              </button>
            </li>
            {sep("group-sep")}
          </>
        ) : null}
        {shown.map(([s, i], n) => (
          <Fragmentish key={s.id} first={n === 0} sep={sep(`sep-${s.id}`)}>
            <li className={styles.item}>{pill(s, i)}</li>
          </Fragmentish>
        ))}
      </ol>
      {open ? (
        <div ref={popover} className={`float ${styles.popover}`} role="group" aria-label="Done steps">
          <ul>
            {folded.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={styles.popItem}
                  onClick={() => {
                    setOpen(false);
                    onSelect(s.id);
                  }}
                >
                  <Icon name="check" size={16} />
                  <span className={styles.popLabel}>{stepLabel(s, characters)}</span>
                  <span className={styles.popTitle}>{s.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {/* An invisible copy of the whole bar, for measuring. */}
      <ol ref={measure} className={[styles.list, styles.ruler].join(" ")} aria-hidden="true" inert>
        <li>
          <span className={[styles.pill, styles.done, styles.group].join(" ")} data-measure="group">
            <Icon name="check" size={16} />
            <span>{Math.max(fold, foldable, 2)} done</span>
            <Icon name="caretDown" size={16} />
          </span>
        </li>
        {sep("m-sep", true)}
        {steps.map((s, i) => (
          <li key={s.id}>{pill(s, i, true)}</li>
        ))}
      </ol>
    </nav>
  );
}

function Fragmentish({ first, sep, children }: { first: boolean; sep: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      {first ? null : sep}
      {children}
    </>
  );
}
