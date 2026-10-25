"use client";

import { useEffect, useRef, useState } from "react";
import type { GitStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { checkRepo, exec, newRepo, type RepoState } from "@/lib/gitsim";
import { Button } from "../../ui/Button";
import { PassIcon } from "../../ui/Icons";
import { Editor } from "../Editor";
import { Terminal, type TermLine } from "../Terminal";
import { useWorkbench } from "../context";
import { NextRow, Prose, StepHeading } from "./common";
import { Ticket } from "../Ticket";
import styles from "./steps.module.css";
import g from "./git.module.css";

interface Saved {
  repo: RepoState;
  lines: TermLine[];
}

const MAX_LINES = 400;

export function GitStepView({ step, row }: { step: GitStep; row: StepProgressRow }) {
  const { areas, updateStep, markPassed, logEvent } = useWorkbench();
  const saved = row.data.git as Saved | undefined;
  const [repo, setRepo] = useState<RepoState>(saved?.repo ?? newRepo(step.files));
  const [lines, setLines] = useState<TermLine[]>(saved?.lines ?? [{ kind: "out", text: "The workshop's project folder. Type git help for the commands." }]);
  const files = Object.keys(repo.files).sort();
  const [active, setActive] = useState(files[0] ?? "");
  const [version, setVersion] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = step.tasks.map((t) => t.check.every((c) => checkRepo(repo, c)));
  const firstOpen = done.indexOf(false);

  const persist = (next: Saved, passed: boolean) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const data = { ...row.data, git: next, tasks: Object.fromEntries(step.tasks.map((t, i) => [t.id, t.check.every((c) => checkRepo(next.repo, c)) || done[i]])) };
      if (passed) void markPassed(step.id, { data });
      else void updateStep(step.id, { data });
    }, 400);
  };

  const onCommand = (cmd: string) => {
    if (cmd.trim() === "clear") {
      setLines([]);
      persist({ repo, lines: [] }, false);
      return;
    }
    const r = exec(repo, cmd);
    const add: TermLine[] = [{ kind: "cmd", text: cmd }, ...r.output.map((text) => ({ kind: r.ok ? ("out" as const) : ("err" as const), text }))];
    const nextLines = [...lines, ...add].slice(-MAX_LINES);
    setRepo(r.state);
    setLines(nextLines);
    // A checkout or merge rewrites files: reload the editor.
    if (JSON.stringify(r.state.files) !== JSON.stringify(repo.files)) setVersion((v) => v + 1);
    if (!(active in r.state.files)) setActive(Object.keys(r.state.files).sort()[0] ?? "");
    const all = step.tasks.every((t) => t.check.every((c) => checkRepo(r.state, c)));
    persist({ repo: r.state, lines: nextLines }, all);
    logEvent("git", { cmd: cmd.split(" ").slice(0, 2).join(" "), ok: r.ok });
  };

  const onEdit = (content: string) => {
    if (repo.files[active] === content) return;
    const next = { ...repo, files: { ...repo.files, [active]: content } };
    setRepo(next);
    persist({ repo: next, lines }, false);
  };

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  return (
    <>
      <Ticket>
        <StepHeading step={step} />
        <Prose html={step.html} />
        <ol className={styles.tasks}>
          {step.tasks.map((t, i) => (
            <li key={t.id} className={[styles.task, i === firstOpen ? g.current : ""].join(" ")}>
              <p className={styles.taskPrompt} dangerouslySetInnerHTML={{ __html: t.promptHtml }} />
              {done[i] ? (
                <>
                  <span className={styles.done}>
                    <PassIcon /> Done
                  </span>
                  {t.feedback ? <p className={[styles.feedback, styles.feedbackGood].join(" ")} dangerouslySetInnerHTML={{ __html: t.feedback }} /> : null}
                </>
              ) : null}
            </li>
          ))}
        </ol>
        <NextRow row={row} />
      </Ticket>
      <div className={areas.stage}>
        <div className={g.split}>
          <div className={g.files}>
            <div className={g.tabs} role="tablist" aria-label="Files in the project">
              {files.map((f) => (
                <button key={f} role="tab" aria-selected={f === active} className={g.tab} onClick={() => setActive(f)}>
                  {f}
                </button>
              ))}
              <span className={g.branch}>On branch {repo.initialised ? repo.head : "(no repository yet)"}</span>
            </div>
            <div className={g.editor}>
              {active ? <Editor docKey={`${step.id}/${active}/${version}`} value={repo.files[active] ?? ""} onChange={(v) => onEdit(v)} label={`Edit ${active}`} /> : null}
            </div>
          </div>
          <div className={g.term}>
            <Terminal lines={lines} onCommand={onCommand} />
          </div>
        </div>
        <div className={g.reset}>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => {
              if (!window.confirm("Start this step's repository again from scratch?")) return;
              const fresh = newRepo(step.files);
              setRepo(fresh);
              setLines([]);
              setVersion((v) => v + 1);
              persist({ repo: fresh, lines: [] }, false);
            }}
          >
            Start the folder again
          </Button>
        </div>
      </div>
    </>
  );
}
