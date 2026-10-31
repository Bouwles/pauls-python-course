import { BRAND } from "@/lib/brand";
import { getJob, getSolution } from "@/lib/content/server";
import type { Step } from "@/lib/content/types";
import { Icon } from "../ui/Icon";
import { Portrait } from "../art/Portrait";
import { SpeechBubble } from "../ui/SpeechBubble";
import { BrowserFrame } from "./BrowserFrame";
import { highlight } from "./highlight";
import styles from "./HeroStill.module.css";

// The hero's picture of the Workbench (REDESIGN-2.md 6): the first project's Build step, just
// passed, drawn from the content: its named steps, the step's title and first lines, the
// reference solution in the editor, what it prints, and the coach's line for a pass. A still,
// so the page stays light; the live one is in "Try it now" further down.

const STEP_NAME: Record<string, string> = { ask: "Ask", predict: "Predict", investigate: "Investigate", worked: "Example", make: "Build", ship: "Ship" };

const plain = (html: string) =>
  html
    .replace(/<pre[\s\S]*?<\/pre>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();

export function HeroStill({ jobId, names }: { jobId: string; names: Record<string, string> }) {
  const job = getJob(jobId);
  const steps: Step[] = job?.steps ?? [];
  const at = Math.max(0, steps.findIndex((s) => s.type === "make"));
  const step = steps[at];
  const name = (s: Step) => STEP_NAME[s.type] ?? s.title;
  const done = steps.slice(0, at);
  const later = steps.slice(at + 1);
  const title = step?.title ?? "Make the sign";
  const firstPara = step ? plain(step.html.split("</p>")[0] ?? "") : "";
  const solution = step ? getSolution(`${jobId}/${step.id}`) : null;
  const entry = step && "entry" in step ? step.entry : "main.py";
  const code = solution?.[entry] ?? (step && "starter" in step ? step.starter[entry] : "") ?? "";
  const tests = step && "visibleTests" in step ? step.visibleTests : [];
  const required = step && "requiredCount" in step ? step.requiredCount : tests.length;
  const output = [...tests].sort((a, b) => (b.expect?.length ?? 0) - (a.expect?.length ?? 0))[0]?.expect ?? "";
  const pass = step && "onPass" in step ? step.onPass : null;
  const coach = pass?.who ?? "paul";
  const lines = highlight(code);
  const describe = `The ${BRAND.name} Workbench on the first project, ${job?.title ?? "Course Sign"}: the ${title} step has passed, with the code in the editor, what it prints underneath, and ${names[coach] ?? "Paul"} saying "${pass?.text ?? "That works."}"`;

  return (
    <BrowserFrame address={`${BRAND.domain}/job/${jobId}`} className={styles.frame}>
      <div className={styles.still} role="img" aria-label={describe}>
        <div className={styles.steps}>
          <span className={`${styles.step} ${styles.doneChip} ${styles.wideOnly}`}>
            <Icon name="check" size={16} />
            {done.length - 2} done
          </span>
          {done.slice(-2).map((s) => (
            <span key={s.id} className={`${styles.step} ${styles.done} ${styles.wideOnly}`}>
              <Icon name="check" size={16} />
              {name(s)}
            </span>
          ))}
          <span className={`${styles.step} ${styles.doneChip} ${styles.narrowOnly}`}>
            <Icon name="check" size={16} />
            {done.length} done
          </span>
          <span className={`${styles.step} ${styles.current}`}>
            <Icon name="check" size={16} />
            {step ? name(step) : "Build"}
          </span>
          {later.map((s) => (
            <span key={s.id} className={styles.step}>
              {name(s)}
            </span>
          ))}
        </div>
        <div className={styles.body}>
          <div className={styles.brief}>
            <div className={styles.title}>{title}</div>
            <p className={styles.text}>{firstPara}</p>
            <div className={styles.coach}>
              <Portrait who={coach} name={names[coach] ?? "Paul"} size={36} />
              <SpeechBubble who={coach} name={names[coach] ?? "Paul"} tail="top" className={styles.bubble}>
                {pass?.text ?? "That works. Now make it so the next person can read it."}
              </SpeechBubble>
            </div>
          </div>
          <div className={styles.work}>
            <div className={styles.toolbar}>
              <span className={styles.file}>{entry}</span>
              <span className={styles.tools}>
                <span className={`${styles.btn} ${styles.run}`}>
                  <Icon name="run" size={16} />
                  Run
                </span>
                <span className={`${styles.btn} ${styles.next}`}>
                  Next step
                  <Icon name="next" size={16} />
                </span>
              </span>
            </div>
            <ol className={styles.code}>
              {lines.map((line, i) => (
                <li key={i}>
                  {line.map((tok, j) =>
                    tok.kind ? (
                      <span key={j} className={styles[tok.kind]}>
                        {tok.text}
                      </span>
                    ) : (
                      tok.text
                    ),
                  )}
                </li>
              ))}
            </ol>
            <div className={styles.console}>
              <div className={styles.tabs}>
                <span className={styles.tabOn}>Output</span>
                <span className={styles.tabPass}>
                  <Icon name="tick" size={16} />
                  Checks {required}/{required}
                </span>
              </div>
              <pre className={styles.out}>{output}</pre>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
