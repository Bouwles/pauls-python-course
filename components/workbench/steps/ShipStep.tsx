"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ShipStep, StretchTask } from "@/lib/content/types";
import type { CheckReport, ReviewResult } from "@/lib/python/protocol";
import { getRuntime } from "@/lib/python/runtime";
import type { StepProgressRow } from "@/lib/store/types";
import { updateJob } from "@/lib/store/progress";
import { useSession } from "@/lib/store/session";
import { playSound } from "@/lib/sound";
import { defaultLook } from "@/lib/pixel/learner";
import { Button, LinkButton } from "../../ui/Button";
import { PassIcon } from "../../ui/Icons";
import { SceneCanvas, type Actor } from "../../world/SceneCanvas";
import { useNight } from "../../world/useNight";
import { SpriteFrame } from "../../world/SpriteFrame";
import { prefersReducedMotion } from "@/lib/display";
import { castColour } from "@/lib/cast";
import { usePlan } from "@/lib/usePlan";
import { ProGate } from "../../pricing/ProGate";
import { loadIndex } from "../../world/sprites";
import { CodeWorkspace } from "../CodeWorkspace";
import { sceneFor, useEarned, workshopExtras } from "../../world/useWorkshopExtras";
import { useWorkbench } from "../context";
import { Ticket } from "../Ticket";
import styles from "./steps.module.css";
import cs from "./cutscene.module.css";

// What each client uses the program on, for the demo run (REDESIGN.md 5.2).
const DEVICE: Record<string, string> = {
  moss: "workshop printer",
  bea: "till",
  ferro: "chart table",
  mira: "sorting desk",
  dev: "hire board",
  kat: "hire board",
  nell: "yard ledger",
  priya: "station screen",
  wendt: "observatory terminal",
  committee: "arcade cabinet",
  tom: "lamp-room logbook",
};

const TITLES = new Set(["Captain", "Professor", "Sir", "Old", "The", "Mrs", "Mr", "Ms", "Dr"]);

/** "Bea's till", "Ferro's chart table". */
function deviceName(name: string, id: string) {
  const words = name.split(" ");
  const short = TITLES.has(words[0]!) ? words[words.length - 1]! : words[0]!;
  return `${short}'s ${DEVICE[id] ?? "screen"}`;
}

export function ShipStepView({ step, row }: { step: ShipStep; row: StepProgressRow }) {
  const { areas, job, progress, jobProgress, shipJob, markPassed, goTo, characters, conceptTitles, landing, guest, store, gateActs } = useWorkbench();
  const { status: plan } = usePlan();
  const { profile } = useSession();
  const night = useNight();
  const [stretch, setStretch] = useState<StretchTask | null>(null);
  const [hasClientSprite, setHasClientSprite] = useState(false);
  const [scenes, setScenes] = useState<Set<string> | undefined>(undefined);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [demo, setDemo] = useState<{ text: { kind: string; text: string }[]; done: boolean; failed: boolean } | null>(null);
  const [justShipped, setJustShipped] = useState(false);
  const [fly, setFly] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const screen = useRef<HTMLPreElement>(null);
  const earned = useEarned();
  const done = (id: string) => ["passed", "seen-solution"].includes(progress[id]?.status ?? "");
  const waitingFor = (step.requires ?? (step.shipsFrom ? [step.shipsFrom] : [])).filter((id) => !done(id));
  const ready = waitingFor.length === 0;
  const shipped = jobProgress?.status === "shipped" || jobProgress?.status === "shipped-stretch";
  const stretchDone = new Set(jobProgress?.stretchDone ?? []);
  // Stretch tasks extend the Make step's program, so they get the same files.
  const from = job.steps.find((s) => s.id === (waitingFor[0] ?? step.shipsFrom));
  const shipFiles = from && "entry" in from ? { files: from.files, entry: from.entry } : { files: ["main.py"], entry: "main.py" };

  useEffect(() => {
    if (!ready) return;
    void (async () => {
      const first = !(jobProgress?.status === "shipped" || jobProgress?.status === "shipped-stretch");
      await shipJob();
      if (first) {
        setJustShipped(true);
        playSound("stamp", profile.settings.sound);
      }
      if (row.status !== "passed") await markPassed(step.id);
    })();
    // Shipping happens once, when the step opens and the Make step is done.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Moss's style notes on what shipped (Section 5.1). They never stop a Job shipping.
  useEffect(() => {
    if (!ready || !store || !step.shipsFrom || landing) return;
    const fromStep = job.steps.find((s) => s.id === step.shipsFrom);
    if (!fromStep || !("entry" in fromStep)) return;
    let cancelled = false;
    void (async () => {
      const rows = await store.prefixed("code_files", `${job.id}/${fromStep.id}/`);
      const files = Object.fromEntries(rows.filter((r) => r.filename.endsWith(".py")).map((r) => [r.filename, r.content]));
      if (!Object.keys(files).length) return;
      // Python may still be finishing something (a check, or a run): wait a moment and try again.
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
    // Reviewed once, when the Job ships.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, store]);

  // The demo: the shipped program runs once on the client's device, with the inputs from the
  // first check you could see. Python may be busy with the review, so it waits its turn.
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
    // Runs once, when the job ships.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, store]);

  // When the demo has run, the finished object flies up to the Shelf in the HUD (first time only).
  useEffect(() => {
    if (!demo?.done || !justShipped || !step.shelf || prefersReducedMotion()) return;
    const target = document.getElementById("hud-shelf")?.getBoundingClientRect();
    const from = screen.current?.getBoundingClientRect();
    if (!target || !from) return;
    const x = from.left + from.width / 2 - 24;
    const y = from.top + from.height / 2 - 24;
    setFly({ x, y, dx: target.left + target.width / 2 - 24 - x, dy: target.top + target.height / 2 - 24 - y });
    const t = setTimeout(() => setFly(null), 900);
    return () => clearTimeout(t);
  }, [demo?.done, justShipped, step.shelf]);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [demo]);

  useEffect(() => {
    void loadIndex().then((i) => {
      setHasClientSprite(Boolean(i.sprites[characters[job.client]?.sprite ?? job.client]));
      setScenes(new Set(Object.keys(i.scenes)));
    });
  }, [characters, job.client]);

  const clientName = characters[job.client]?.name ?? job.client;
  const actors: Actor[] = [
    { key: "moss", sprite: "moss", anim: "nod", at: "moss" },
    { key: "learner", learner: profile.character ?? defaultLook(), pose: "sit", anim: "sit", at: "learner" },
    { key: "dennis", sprite: "dennis", anim: "idle", at: "dennis" },
  ];
  if (job.client !== "moss" && hasClientSprite) actors.push({ key: "client", sprite: characters[job.client]!.sprite, anim: "happy", at: "client", flip: true });
  const scene = sceneFor(job.scene, night, scenes ?? new Set());
  if (scene.startsWith("workshop")) actors.push(...workshopExtras(earned, scene));
  const waiting = actors.map((a) => (a.key === "moss" || a.key === "client" ? { ...a, anim: "idle" } : a));

  if (!ready) {
    return (
      <>
        <Ticket>
          <h2 className={styles.heading}>
            <span className={styles.thisStep}>This step:</span> ship it, not yet
          </h2>
          <div className="prose">
            <p>
              {waitingFor.length > 1
                ? `This ships when all its tasks pass. ${waitingFor.length} still to go.`
                : `The job ships when the ${from?.title ?? "Make step"} passes its checks.`}
            </p>
          </div>
          {from ? (
            <div className={styles.next}>
              <Button variant="primary" onClick={() => goTo(from.id)}>
                Go to {from.title}
              </Button>
            </div>
          ) : null}
        </Ticket>
        <div className={areas.stage}>
          <div className={cs.stage}>
            <div className={cs.shipStage}>
              <SceneCanvas scene={scene} actors={waiting} label={`${clientName} is waiting for the finished program.`} maxScale={3} />
            </div>
          </div>
        </div>
      </>
    );
  }

  const onStretchCheck = async (task: StretchTask, report: CheckReport) => {
    const ok = report.status === "ok" && report.results.filter((r) => !r.stretch).every((r) => r.passed);
    if (!ok || !store) return;
    const done = [...new Set([...(jobProgress?.stretchDone ?? []), task.id])];
    await updateJob(store, job.id, { stretchDone: done, status: "shipped-stretch" });
  };

  return (
    <>
      <Ticket stamp={step.places ? "PLACED" : shipped ? (jobProgress?.status === "shipped-stretch" ? "SHIPPED+" : "SHIPPED") : null} thud={justShipped}>
        <h2 className={styles.heading}>
          <span className={styles.thisStep}>This step:</span> {step.places ? "placed" : shipped ? "shipped" : "shipping"}
        </h2>
        <div className="prose">
          {step.places ? (
            <p>
              You&apos;re placed past {step.places.actTitle}. The next Act is open on the map. Its Jobs stay open if you want them, and its ideas join your review deck, so Morning Rounds will still check you remember them.
            </p>
          ) : (
            <p>
              {job.client === "moss" ? "Moss has it now." : `${clientName} has it now.`}
              {step.shelf ? <> It&apos;s on your Shelf: {step.shelf.label.toLowerCase()}.</> : null}
            </p>
          )}
        </div>
        {step.awards.includes("name-plate") ? (
          <p className={styles.cards}>Moss screws a brass plate to the edge of your desk. It has your name on it, spelt right.</p>
        ) : null}
        {step.awards.includes("keeper-coat") ? (
          <p className={styles.cards}>
            Old Tom hands you a lighthouse keeper&apos;s coat, brass buttons and all. It&apos;s yours to wear: <Link href="/settings">Settings</Link>, under your character.
          </p>
        ) : null}
        {step.cards.length ? (
          <p className={styles.cards}>New in your review deck: {step.cards.map((c) => conceptTitles[c] ?? c).join(", ")}. They come up from tomorrow.</p>
        ) : null}
        {review ? (
          <section className={styles.block} style={{ marginTop: 24 }} aria-labelledby="review-title">
            <h3 id="review-title" className={styles.sub}>
              Moss&apos;s review
            </h3>
            {review.notes.length === 0 ? (
              <p className={styles.cards}>Moss reads it through twice and hands it back. Nothing to say, which is the review.</p>
            ) : (
              <>
                <ul className={styles.tasks}>
                  {review.notes.map((n) => (
                    <li key={n.rule} className={styles.task}>
                      <p className={styles.visibleName}>
                        {n.title}{" "}
                        <span className={styles.reviewWhere}>
                          {n.file}, line {n.line}
                          {n.count > 1 ? `, and ${n.count - 1} more like it` : ""}
                        </span>
                      </p>
                      <p>
                        {n.message.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className={styles.nextNote}>Style notes never stop a Job shipping. Tidy them now, or carry them into the next one.</p>
              </>
            )}
          </section>
        ) : null}
        {job.stretch.length ? (
          <section className={styles.block} style={{ marginTop: 24 }} aria-labelledby="stretch-title">
            <h3 id="stretch-title" className={styles.sub}>
              Stretch, if you want more
            </h3>
            <ul className={styles.tasks}>
              {job.stretch.map((t) => (
                <li key={t.id} className={styles.task}>
                  <p className={styles.visibleName}>
                    {t.title} {stretchDone.has(t.id) ? <span className={styles.done}><PassIcon /> Done</span> : null}
                  </p>
                  <div className="prose" dangerouslySetInnerHTML={{ __html: t.promptHtml }} />
                  <div>
                    <Button size="sm" variant={stretch?.id === t.id ? "primary" : "secondary"} onClick={() => setStretch(t)}>
                      {stretch?.id === t.id ? "Working on it" : "Try it"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className={styles.next}>
          {landing || guest ? (
            <LinkButton variant="primary" href="/signup?keep=1">
              Keep this: make an account
            </LinkButton>
          ) : (
            <LinkButton variant="primary" href="/map">
              Back to the map
            </LinkButton>
          )}
          {!landing && !guest && step.shelf ? (
            <Link href="/shelf" className={styles.nextNote}>
              See it on your Shelf
            </Link>
          ) : null}
        </div>
      </Ticket>
      <div className={areas.stage}>
        {stretch ? (
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
        ) : (
          <div className={cs.stage}>
            <div className={cs.shipStage}>
              <SceneCanvas scene={scene} actors={actors} label={`${clientName} with the finished program. Moss nods.`} maxScale={3} />
              {step.places ? null : (
                <div className={cs.device}>
                  <p className={cs.deviceTitle} style={{ background: castColour(job.client).face, color: castColour(job.client).ink }}>
                    {deviceName(clientName, job.client)}
                  </p>
                  <div className="frame-panel">
                    <pre ref={screen} className={cs.screen} aria-label={`Your program running on ${deviceName(clientName, job.client)}`}>
                      {demo
                        ? demo.text.map((p, i) => (
                            <span key={i} className={p.kind === "input" ? cs.typed : undefined}>
                              {p.text}
                            </span>
                          ))
                        : "Starting up."}
                    </pre>
                    {demo?.failed ? <p className={cs.screenNote}>It tripped on the demo run. The checks passed, so this is a case they don&apos;t cover: worth a look.</p> : null}
                  </div>
                </div>
              )}
              {gateActs && plan && !plan.access.pro && !landing ? <ProGate acts={gateActs} /> : null}
            </div>
          </div>
        )}
      </div>
      {fly && step.shelf ? (
        <div className={cs.flyer} style={{ left: fly.x, top: fly.y, ["--dx" as string]: `${fly.dx}px`, ["--dy" as string]: `${fly.dy}px` }} aria-hidden="true">
          <SpriteFrame sprite={`shelf-${step.shelf.object}`} scale={3} />
        </div>
      ) : null}
    </>
  );
}
