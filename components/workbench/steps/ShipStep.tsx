"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ShipStep, StretchTask } from "@/lib/content/types";
import type { CheckReport, Files, ReviewResult } from "@/lib/python/protocol";
import { getRuntime } from "@/lib/python/runtime";
import type { StepProgressRow } from "@/lib/store/types";
import { updateJob } from "@/lib/store/progress";
import { useSession } from "@/lib/store/session";
import { playSound } from "@/lib/sound";
import { PROFESSOR, castColour } from "@/lib/cast";
import { moodOf } from "@/lib/mood";
import { gestureOf } from "@/lib/pixel/gestures";
import { pickLine } from "@/lib/reactions";
import { download, readme, withWorkshopStub, zip } from "@/lib/export";
import { pickShown, showsInRoom } from "../../art/PixelRoom";
import { Button, LinkButton } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { CodeWorkspace } from "../CodeWorkspace";
import { Instructions } from "../Instructions";
import { AT_SOMEONE, GLUM, SpokenLine, Stage, celebrationFor, othersIn, roomOf, useAsides, useConversation, useStageCast, useVisit, type Mouth, type StagePerson } from "../Scene";
import { useWorkbench } from "../context";
import { isSpoken } from "../labels";
import styles from "./ship.module.css";

function plainText(html: string): string {
  return html
    .replace(/<\/(p|li|h\d)>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * The Ship (REDESIGN-2.md 4.6): the finished program running in a demo frame, the client's
 * reaction, and "Add to my Shelf", which stamps it shipped, with the client celebrating in a way
 * of their own (Neil launches a rocket, Caitlin wins on her controller), different for each
 * project. "Download the project" takes the code home. Before the Build step passes, the client
 * is waiting for it, getting on with something in their room.
 */
export function ShipStepView({ step, row }: { step: ShipStep; row: StepProgressRow }) {
  const { areas, job, progress, jobProgress, shipJob, markPassed, goTo, characters, conceptTitles, landing, guest, store, nextJob, nameOf, actTitle, compact } = useWorkbench();
  const { profile } = useSession();
  const [stretch, setStretch] = useState<StretchTask | null>(null);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [demo, setDemo] = useState<{ text: { kind: string; text: string }[]; done: boolean; failed: boolean } | null>(null);
  const [stamping, setStamping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [waitingLine, setWaitingLine] = useState<string | null>(null);
  const [waitLoaded, setWaitLoaded] = useState(false);
  const [waitSaid, setWaitSaid] = useState(false);
  const [waitMouth, setWaitMouth] = useState<Mouth>(0);
  const visit = useVisit();
  const screen = useRef<HTMLPreElement>(null);
  const done = (id: string) => ["passed", "seen-solution"].includes(progress[id]?.status ?? "");
  const waitingFor = (step.requires ?? (step.shipsFrom ? [step.shipsFrom] : [])).filter((id) => !done(id));
  const ready = waitingFor.length === 0;
  const shipped = jobProgress?.status === "shipped" || jobProgress?.status === "shipped-stretch";
  const stretchDone = new Set(jobProgress?.stretchDone ?? []);
  const from = job.steps.find((s) => s.id === (waitingFor[0] ?? step.shipsFrom));
  const shipFiles = from && "entry" in from ? { files: from.files, entry: from.entry } : { files: ["main.py"], entry: "main.py" };
  const client = job.client;
  const clientName = nameOf(client);
  const paul = nameOf(PROFESSOR);
  const lines = useMemo(() => step.dialogue.filter((l) => isSpoken(l.who)).slice(0, 3), [step.dialogue]);
  const talk = useConversation(lines.length, ready && !step.places);
  // The client says their lines (the first celebrates, as only they would), then gets on with
  // something cheerful while you decide; and when it lands on the Shelf, they celebrate with one
  // of their own moves, a different one for each project.
  const seed = `${job.id}|ship|${visit}`;
  const room = roomOf(client, job.actNumber);
  const onStage = useStageCast(lines, talk, client, { act: room, seed, hello: "celebrate", tags: ["celebrate", "idle"], avoid: GLUM, after: "pleased", on: ready && !step.places });
  const cheer = useMemo(() => celebrationFor(client, `${job.id}|shelf|${visit}`, { act: room }), [client, job.id, visit, room]);
  const [cheering, setCheering] = useState(false);
  useEffect(() => {
    if (!cheering) return;
    // Long enough to see the whole move (a rocket takes three seconds to go up).
    const g = gestureOf(cheer);
    const t = setTimeout(() => setCheering(false), Math.min(6000, Math.max(2600, g.beats * g.ms + 600)));
    return () => clearTimeout(t);
  }, [cheering, cheer]);
  // Waiting: the client says their line about it, then gets on with something in their room.
  const waitLook = useMemo(() => {
    if (!waitingLine) return null;
    const mood = (hidden: string[]) => moodOf(waitingLine, undefined, { who: client, seed: `${job.id}|waiting|${visit}`, avoid: hidden });
    return { face: mood([]).face, gesture: pickShown((hidden) => mood(hidden).gesture, (g) => showsInRoom(room, client, g)) };
  }, [waitingLine, client, job.id, visit, room]);
  const saying = Boolean(waitingLine) && !waitSaid;
  const waitAside = useAsides([{ who: client, free: !ready && (waitLoaded || landing) && !saying, tags: ["wait", "idle", "work"], act: room }], { seed: `${job.id}|waiting|${visit}`, avoid: [waitLook?.gesture, ...AT_SOMEONE] })[client]!;
  // A placement: Paul in the Workshop, pleased with you, now approving, now celebrating.
  const placed = useAsides([{ who: PROFESSOR, free: Boolean(ready && step.places), tags: ["celebrate", "approve"], act: roomOf(PROFESSOR, 1) }], { seed: `${job.id}|placed|${visit}`, avoid: GLUM })[PROFESSOR]!;

  // A placement ships as soon as its tasks pass: there's nothing to put on a Shelf.
  useEffect(() => {
    if (!ready || !step.places) return;
    void (async () => {
      await shipJob();
      if (row.status !== "passed") await markPassed(step.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // While the learner is still building, the client says one line about waiting.
  useEffect(() => {
    if (ready || landing) return;
    void pickLine(store, characters, client, "waiting").then((line) => {
      setWaitingLine(line);
      setWaitLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const addToShelf = async () => {
    setBusy(true);
    const first = await shipJob();
    if (row.status !== "passed") await markPassed(step.id);
    setBusy(false);
    if (first) {
      setStamping(true);
      setCheering(true);
      playSound("stamp", profile.settings.sound);
    }
  };

  // Paul's style notes on what shipped. They never stop a project shipping.
  useEffect(() => {
    if (!ready || !store || !step.shipsFrom || landing) return;
    const fromStep = job.steps.find((s) => s.id === step.shipsFrom);
    if (!fromStep || !("entry" in fromStep)) return;
    let cancelled = false;
    void (async () => {
      const rows = await store.prefixed("code_files", `${job.id}/${fromStep.id}/`);
      const files = Object.fromEntries(rows.filter((r) => r.filename.endsWith(".py")).map((r) => [r.filename, r.content]));
      if (!Object.keys(files).length) return;
      // Python may still be finishing something (the demo, a check): wait a moment and try again.
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        try {
          const result = await getRuntime().review({ files });
          if (!cancelled) setReview(result);
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Reviewed once, when the project is ready to ship.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, store]);

  // The demo: the learner's own program runs once, with the inputs from the first check they
  // could see. Python may be busy with the review, so it waits its turn.
  useEffect(() => {
    if (!ready || !store || !step.shipsFrom || step.places) return;
    const fromStep = job.steps.find((s) => s.id === step.shipsFrom);
    if (!fromStep || !("entry" in fromStep)) return;
    let cancelled = false;
    void (async () => {
      const rows = await store.prefixed("code_files", `${job.id}/${fromStep.id}/`);
      const files = { ...job.data, ...Object.fromEntries(rows.map((r) => [r.filename, r.content])) };
      if (!rows.length) return;
      const inputs = fromStep.visibleTests.find((t) => t.kind === "output" && t.inputs?.length)?.inputs ?? [];
      const text: { kind: string; text: string }[] = [];
      for (let attempt = 0; attempt < 8 && !cancelled; attempt++) {
        try {
          const result = await getRuntime().run(
            { files, entry: fromStep.entry, inputs },
            {
              onOut: (kind, t) => {
                text.push({ kind, text: t });
                if (!cancelled) setDemo({ text: [...text], done: false, failed: false });
              },
            },
          );
          if (!cancelled) setDemo({ text: [...text], done: true, failed: result.status !== "ok" });
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 900));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Runs once, when the project is ready to ship.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, store]);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [demo]);

  const downloadProject = async () => {
    if (!store || !from || !("entry" in from)) return;
    const rows = await store.prefixed("code_files", `${job.id}/${from.id}/`);
    const code: Files = Object.fromEntries(rows.map((r) => [r.filename, r.content]));
    const ask = job.steps.find((s) => s.type === "ask");
    const item = {
      jobId: job.id,
      title: job.title,
      actNumber: job.actNumber,
      actTitle,
      actId: job.act,
      number: job.number,
      client: clientName,
      building: "",
      shelf: step.shelf ?? { object: "", label: job.title },
      shipsFrom: step.shipsFrom,
      files: from.files,
      entry: from.entry,
      spec: ask?.type === "ask" ? plainText(ask.specHtml) : job.summary,
      learned: job.conceptsIntroduced.map((c) => conceptTitles[c] ?? c),
      data: job.data,
      portfolioReadme: job.portfolioReadme,
    };
    const files = withWorkshopStub({ ...job.data, ...code, "README.md": readme(item, jobProgress?.shippedAt ?? Date.now(), profile.displayName) });
    download(`${job.id}.zip`, zip(files), "application/zip");
  };

  if (stretch) {
    return (
      <>
        <Instructions
          step={step}
          title={stretch.title}
          html={stretch.promptHtml}
          footer={
            <Button variant="ghost" icon="caretLeft" onClick={() => setStretch(null)}>
              Back to the ship
            </Button>
          }
        />
        <div className={areas.stage}>
          <CodeWorkspace
            key={stretch.id}
            stepId={`stretch-${stretch.id}`}
            files={shipFiles.files}
            entry={shipFiles.entry}
            starter={{}}
            starterFrom={step.shipsFrom}
            checkKey={stretch.hasTests ? `${job.id}/stretch-${stretch.id}` : null}
            onCheck={(r) => void onStretchCheck(stretch, r)}
          />
        </div>
      </>
    );
  }

  async function onStretchCheck(task: StretchTask, report: CheckReport) {
    const ok = report.status === "ok" && report.results.filter((r) => !r.stretch).every((r) => r.passed);
    if (!ok || !store) return;
    const doneTasks = [...new Set([...(jobProgress?.stretchDone ?? []), task.id])];
    await updateJob(store, job.id, { stretchDone: doneTasks, status: "shipped-stretch" });
  }

  if (!ready) {
    const resting = waitLook?.face ?? "neutral";
    const lead: StagePerson = saying && waitLook ? { who: client, face: waitLook.face, gesture: waitLook.gesture, mouthOpen: waitMouth, speaking: true } : { who: client, face: waitAside.face ?? resting, gesture: waitAside.gesture };
    return (
      <div className={areas.full}>
        <div className={[styles.ship, styles.waiting].join(" ")}>
          <div className={styles.stageWrap}>
            <Stage act={room} lead={lead} name={clientName} label={`${clientName} at their desk, waiting for the finished program`} />
          </div>
          <div className={styles.side}>
            <header className={styles.head}>
              <p className={styles.kicker}>Not shipped yet</p>
              <h1 className={styles.title}>{clientName} is waiting for it</h1>
            </header>
            {waitingLine ? <SpokenLine who={client} name={clientName} text={waitingLine} tail={compact ? "top" : "left"} live onMouth={setWaitMouth} onDone={() => setWaitSaid(true)} className={styles.line} /> : null}
            <p className={styles.lede}>{waitingFor.length > 1 ? `This ships when all its tasks pass. ${waitingFor.length} still to go.` : `It ships when ${from?.title ?? "the Build step"} passes its checks.`}</p>
            {from ? (
              <div className={styles.actions}>
                <Button variant="primary" icon="next" onClick={() => goTo(from.id)}>
                  Go to {from.title}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const stampText = step.places ? "Placed" : shipped ? "Shipped" : null;
  const stamp = stampText ? (
    <p className={[styles.stamp, stamping ? styles.thud : ""].join(" ")} role="status">
      <Icon name="check" size={24} />
      {stampText}
    </p>
  ) : null;
  // The client on their stage: celebrating as it lands on the Shelf, else as useStageCast has them.
  const person = (who: string): StagePerson => (who === client && cheering ? { who, face: gestureOf(cheer).faces?.[0] ?? "laughing", gesture: cheer } : onStage(who));
  const c = castColour(client);

  return (
    <div className={areas.full}>
      <div className={styles.ship}>
        {step.places ? (
          <div className={styles.stageWrap}>
            <Stage act={roomOf(PROFESSOR, 1)} lead={{ who: PROFESSOR, face: placed.face ?? "proud", gesture: placed.gesture }} name={paul} label={`${paul} in the Workshop, pleased with your placement`} />
            {stamp}
          </div>
        ) : (
          <div className={styles.demo}>
            <p className={styles.deviceLabel}>
              {job.title} on {clientName}&apos;s phone
            </p>
            <div className={`code-dark ${styles.device}`} style={{ ["--device" as string]: c.face }}>
              <span className={styles.speaker} aria-hidden="true" />
              <div className={styles.glass}>
                <div className={styles.appBar} aria-hidden="true">
                  <span className={styles.appIcon} />
                  <span className={styles.appName}>{job.title}</span>
                </div>
                <pre ref={screen} className={styles.screen} aria-label={`Your program running: ${job.title}`} tabIndex={0}>
                  {demo
                    ? demo.text.map((p, i) => (
                        <span key={i} className={p.kind === "input" ? styles.typed : p.kind === "err" ? styles.err : undefined}>
                          {p.text}
                        </span>
                      ))
                    : "Starting up."}
                </pre>
              </div>
              <span className={styles.home} aria-hidden="true" />
            </div>
            {demo?.failed ? <p className={styles.small}>It tripped on the demo run. The checks passed, so this is a case they don&apos;t cover: worth a look.</p> : null}
          </div>
        )}
        <div className={styles.side}>
          <header className={styles.head}>
            <p className={styles.kicker}>{step.places ? `Placed past ${step.places.actTitle}` : `For ${clientName}`}</p>
            <h1 className={styles.title}>{step.places ? "You're placed" : shipped ? `${job.title}, shipped` : "Ready to ship"}</h1>
          </header>
          {step.places ? null : (
            <div className={styles.reaction}>
              <div className={styles.reactionStage}>
                <Stage act={room} lead={person(client)} guests={othersIn(lines, client).map(person)} name={clientName} label={`${clientName} at their desk, pleased with it`} />
                {stamp}
              </div>
              {lines.length ? (
                <ol className={styles.lines} aria-label={`What ${clientName} says`}>
                  {lines.slice(0, talk.shown).map((l, i) => {
                    const again = i > 0 && lines[i - 1]!.who === l.who;
                    const live = talk.live(i);
                    return (
                      <li key={i} className={[styles.lineItem, again ? styles.same : ""].join(" ")}>
                        <SpokenLine who={l.who} name={again ? undefined : nameOf(l.who)} text={l.text} tail={again ? "none" : "top"} live={live} onMouth={talk.setMouth} onDone={live ? talk.lineDone : undefined} />
                      </li>
                    );
                  })}
                </ol>
              ) : null}
              <p className="visually-hidden" aria-live="polite">
                {talk.skipped || !lines[talk.at] ? "" : `${nameOf(lines[talk.at]!.who)}: ${lines[talk.at]!.text}`}
              </p>
            </div>
          )}
          {step.places ? (
            <p className={styles.lede}>The next Act is open in the Clocktower. These projects stay open if you want them, and their ideas join your review deck, so Morning Rounds will still check you remember them.</p>
          ) : null}
          <div className={styles.actions}>
            {step.places ? (
              <LinkButton href="/map" variant="primary" icon="map">
                Back to the Clocktower
              </LinkButton>
            ) : !shipped ? (
              <Button variant="primary" icon="shelf" onClick={() => void addToShelf()} disabled={busy}>
                Add to my Shelf
              </Button>
            ) : landing ? (
              <LinkButton href="/signup?keep=1" variant="primary">
                Keep it: make an account
              </LinkButton>
            ) : nextJob ? (
              <LinkButton href={`/job/${nextJob.id}`} variant="primary" icon="next">
                Next project: {nextJob.title}
              </LinkButton>
            ) : (
              <LinkButton href="/map" variant="primary" icon="map">
                Back to the Clocktower
              </LinkButton>
            )}
            {step.places ? null : (
              <Button variant="secondary" icon="download" onClick={() => void downloadProject()}>
                Download the project
              </Button>
            )}
          </div>
          {shipped && !step.places && !landing ? (
            <p className={styles.small}>
              {guest ? (
                <>
                  It&apos;s on this device&apos;s Shelf. <a href="/signup?keep=1">Make an account</a> to keep it everywhere.
                </>
              ) : (
                <>
                  {step.shelf ? `On your Shelf: ${step.shelf.label}. ` : null}
                  <a href="/shelf">Open the Shelf</a>
                </>
              )}
            </p>
          ) : null}
        </div>
      </div>

      {review || step.cards.length || job.stretch.length || step.awards.length ? (
        <div className={styles.more}>
          {step.cards.length ? <p className={styles.small}>New in your review deck: {step.cards.map((c) => conceptTitles[c] ?? c).join(", ")}. They come up from tomorrow.</p> : null}
          {step.awards.length ? <p className={styles.small}>You earned something for your avatar. It&apos;s in Settings.</p> : null}
          {review ? (
            <section className={styles.section} aria-labelledby="review-title">
              <h2 id="review-title" className={styles.sectionTitle}>
                {paul}&apos;s review
              </h2>
              {review.notes.length === 0 ? (
                <p className={styles.small}>{paul} reads it through twice and hands it back. Nothing to say, which is the review.</p>
              ) : (
                <>
                  <ul className={styles.notes}>
                    {review.notes.map((n) => (
                      <li key={n.rule} className={styles.note}>
                        <p className={styles.noteTitle}>
                          {n.title}
                          <span className={styles.where}>
                            {n.file}, line {n.line}
                            {n.count > 1 ? `, and ${n.count - 1} more like it` : ""}
                          </span>
                        </p>
                        <p>{n.message.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}</p>
                      </li>
                    ))}
                  </ul>
                  <p className={styles.small}>Style notes never stop a project shipping. Tidy them now, or carry them into the next one.</p>
                </>
              )}
            </section>
          ) : null}
          {job.stretch.length ? (
            <section className={styles.section} aria-labelledby="stretch-title">
              <h2 id="stretch-title" className={styles.sectionTitle}>
                Stretch, if you want more
              </h2>
              <ul className={styles.notes}>
                {job.stretch.map((t) => (
                  <li key={t.id} className={styles.note}>
                    <p className={styles.noteTitle}>
                      {t.title}
                      {stretchDone.has(t.id) ? (
                        <span className={styles.doneTag}>
                          <Icon name="check" size={16} /> Done
                        </span>
                      ) : null}
                    </p>
                    <div className="prose" dangerouslySetInnerHTML={{ __html: t.promptHtml }} />
                    <div>
                      <Button size="sm" variant="secondary" icon="code" onClick={() => setStretch(t)}>
                        Try it
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
