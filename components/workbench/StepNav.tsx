"use client";

import type { Job, Step } from "@/lib/content/types";
import type { JobProgressRow, StepProgressRow } from "@/lib/store/types";
import { PassIcon } from "../ui/Icons";
import { duration, jobLabel } from "@/lib/display";
import styles from "./StepNav.module.css";

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

export function StepNav({
  steps,
  current,
  progress,
  onSelect,
  job,
  jobProgress,
}: {
  steps: Step[];
  current: string | null;
  progress: Record<string, StepProgressRow>;
  onSelect: (id: string) => void;
  job: Job;
  jobProgress: JobProgressRow | null;
}) {
  const shipped = jobProgress?.status === "shipped" || jobProgress?.status === "shipped-stretch";
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <p className="label">{jobLabel(job)}</p>
        <h1 className={styles.title}>{job.title}</h1>
        <p className={styles.meta}>
          About {duration(job.estimatedMinutes)}{shipped ? ". Shipped." : "."}
        </p>
      </div>
      <ol className={styles.list}>
        {steps.map((s, i) => {
          const repeated = steps.filter((x) => stepKind(x) === stepKind(s)).length > 1;
          const row = progress[s.id];
          const done = row?.status === "passed" || row?.status === "seen-solution";
          const isCurrent = s.id === current;
          return (
            <li key={s.id}>
              <button className={[styles.item, isCurrent ? styles.current : ""].join(" ")} aria-current={isCurrent ? "step" : undefined} onClick={() => onSelect(s.id)}>
                <span className={styles.num}>{i + 1}</span>
                <span className={styles.name}>
                  <span className={styles.kind}>{stepKind(s)}</span>
                  {repeated ? <span className={styles.sub}>{s.title}</span> : null}
                  {isCurrent ? (
                    <svg className={styles.underline} viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M1 4.2 C 18 2.1, 34 5.3, 52 3.4 S 86 2.6, 99 3.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  ) : null}
                </span>
                <span className={styles.state}>
                  {done ? (
                    <span className={styles.done}>
                      <PassIcon />
                      <span className="visually-hidden">{row?.status === "seen-solution" ? "seen solution" : "done"}</span>
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
