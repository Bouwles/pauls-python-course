"use client";

import type { Step } from "@/lib/content/types";
import type { TestMeta } from "@/lib/python/protocol";
import { ASSISTANT } from "@/lib/cast";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Coach } from "./Coach";
import { useWorkbench } from "./context";
import styles from "./Instructions.module.css";

export function Prose({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) return null;
  return <div className={["prose", styles.prose, className].filter(Boolean).join(" ")} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * The instructions panel (REDESIGN-2.md 4.3), top to bottom: the step's title, what to do, the
 * coach, Hint and the duck, the step's own controls (answer cards, tasks), then the project spec
 * and the checks you can see, both folded away. No paper, no pin.
 */
export function Instructions({
  step,
  title,
  html,
  children,
  hints,
  duck,
  checks,
  footer,
  spec = true,
  wide = false,
  coachAfter = false,
}: {
  step: Step;
  title?: string;
  /** What to do. The step's own text unless given. */
  html?: string | null;
  children?: React.ReactNode;
  /** The step's hints: shows the Hint button. */
  hints?: React.ReactNode;
  /** The duck's questions: shows "Explain it to the duck". */
  duck?: React.ReactNode;
  checks?: { tests: TestMeta[]; required: number } | null;
  footer?: React.ReactNode;
  spec?: boolean;
  /** No editor beside it: the instructions take the whole width, in a readable column. */
  wide?: boolean;
  /** The coach speaks after the step's own controls (Predict: it reacts to the answer). */
  coachAfter?: boolean;
}) {
  const { areas, compact, panelCollapsed, setPanelCollapsed, hintsOpen, setHintsOpen, duckOpen, setDuckOpen, say, nameOf } = useWorkbench();
  const folded = panelCollapsed && !compact && !wide;

  if (folded) {
    return (
      <aside className={[areas.panel, styles.rail].join(" ")} aria-label="Instructions, folded away">
        <button type="button" className={styles.railButton} onClick={() => setPanelCollapsed(false)} aria-expanded="false" title="Show the instructions">
          <Icon name="sidebar" />
          <span className="visually-hidden">Show the instructions</span>
        </button>
        <p className={styles.railTitle} aria-hidden="true">
          {title ?? step.title}
        </p>
      </aside>
    );
  }

  const openHints = () => {
    const open = !hintsOpen;
    setHintsOpen(open);
    if (open) say(ASSISTANT, "Stuck? Pick how much help you want. Each one gives a little more away.", { kind: "hint", face: "thinking" });
  };

  return (
    <section className={wide ? areas.full : areas.panel} aria-labelledby="step-title">
      <div className={[styles.inner, wide ? styles.wide : ""].join(" ")}>
        <header className={styles.head}>
          <h1 id="step-title" className={styles.title}>
            {title ?? step.title}
          </h1>
          {compact || wide ? null : (
            <button type="button" className={styles.fold} onClick={() => setPanelCollapsed(true)} aria-expanded="true" title="Fold the instructions away">
              <Icon name="sidebar" />
              <span className="visually-hidden">Fold the instructions away</span>
            </button>
          )}
        </header>
        <Prose html={html === undefined ? step.html : html} />
        {coachAfter ? null : (
          <div className={styles.coach}>
            <Coach />
          </div>
        )}
        {hints || duck ? (
          <div className={styles.help}>
            {hints ? (
              <Button variant="secondary" icon="hint" aria-expanded={hintsOpen} onClick={openHints}>
                Hint
              </Button>
            ) : null}
            {duck ? (
              <Button
                variant="ghost"
                icon="duck"
                aria-expanded={duckOpen}
                onClick={() => setDuckOpen(!duckOpen)}
              >
                Explain it to the duck
              </Button>
            ) : null}
          </div>
        ) : null}
        {hints && hintsOpen ? (
          <section className={styles.card} aria-labelledby="hints-title">
            <div className={styles.cardHead}>
              <h2 id="hints-title" className={styles.cardTitle}>
                Hints from {nameOf(ASSISTANT)}
              </h2>
              <button type="button" className={styles.close} onClick={() => setHintsOpen(false)} title="Close the hints">
                <Icon name="close" />
                <span className="visually-hidden">Close the hints</span>
              </button>
            </div>
            {hints}
          </section>
        ) : null}
        {duck && duckOpen ? (
          <section className={styles.card} aria-labelledby="duck-title">
            <div className={styles.cardHead}>
              <h2 id="duck-title" className={styles.cardTitle}>
                <Icon name="duck" />
                Explain it to the duck
              </h2>
              <button type="button" className={styles.close} onClick={() => setDuckOpen(false)} title="Put the duck away">
                <Icon name="close" />
                <span className="visually-hidden">Put the duck away</span>
              </button>
            </div>
            {duck}
          </section>
        ) : null}
        {children ? <div className={styles.work}>{children}</div> : null}
        {coachAfter ? (
          <div className={styles.coach}>
            <Coach />
          </div>
        ) : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
        {spec || checks?.tests.length ? (
          <div className={styles.folds}>
            {spec ? <ProjectSpec /> : null}
            {checks && checks.tests.length ? <VisibleChecks tests={checks.tests} required={checks.required} /> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** The project spec: what the program does and an example run. Folded after the Ask. */
export function ProjectSpec({ open = false }: { open?: boolean }) {
  const { job, goTo, landing } = useWorkbench();
  const ask = job.steps.find((s) => s.type === "ask");
  if (!ask || ask.type !== "ask") return null;
  return (
    <details className={styles.fold2} open={open}>
      <summary className={styles.summary}>
        <Icon name="caretRight" size={16} className={styles.caret} />
        Project spec
      </summary>
      <div className={styles.foldBody}>
        <Prose html={ask.specHtml} className={styles.small} />
        {ask.example ? (
          <>
            <p className="label">Example run</p>
            <pre className={`code-dark ${styles.example}`}>{ask.example}</pre>
          </>
        ) : null}
        {landing ? null : (
          <div>
            <Button size="sm" variant="ghost" icon="reset" onClick={() => goTo(ask.id)}>
              Replay the ask
            </Button>
          </div>
        )}
      </div>
    </details>
  );
}

/** The checks you can see, as compact input and expected pairs, and how many more are hidden. */
export function VisibleChecks({ tests, required }: { tests: TestMeta[]; required: number }) {
  const hidden = Math.max(0, required - tests.filter((t) => !t.stretch).length);
  return (
    <details className={styles.fold2}>
      <summary className={styles.summary}>
        <Icon name="caretRight" size={16} className={styles.caret} />
        Checks you can see
        <span className={styles.count}>{tests.length}</span>
      </summary>
      <div className={styles.foldBody}>
        <ul className={styles.checks}>
          {tests.map((t) => {
            const inputs = t.kind === "output" ? (t.inputs ?? []).join("\n") : t.call ?? "";
            const expect = t.match === "regex" ? null : (t.expect ?? null);
            return (
              <li key={t.name} className={styles.check}>
                <p className={styles.checkName}>
                  {t.name}
                  {t.stretch ? <span className={styles.stretch}> (stretch)</span> : null}
                </p>
                {inputs || expect !== null ? (
                  <dl className={styles.pair}>
                    {inputs ? (
                      <div>
                        <dt>{t.kind === "output" ? "Input" : "Call"}</dt>
                        <dd>
                          <pre>{inputs}</pre>
                        </dd>
                      </div>
                    ) : null}
                    {expect !== null ? (
                      <div>
                        <dt>{t.kind === "output" ? "Expected" : "Gives"}</dt>
                        <dd>
                          <pre>{expect.replace(/\n$/, "") || "(nothing)"}</pre>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </li>
            );
          })}
        </ul>
        {hidden > 0 ? (
          <p className={styles.hidden}>
            Plus {hidden} hidden {hidden === 1 ? "check" : "checks"}
          </p>
        ) : null}
      </div>
    </details>
  );
}
