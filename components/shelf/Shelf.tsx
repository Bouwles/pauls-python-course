"use client";

// The Shelf (REDESIGN-2.md 6, REDESIGN3_PLAN.md): everything the learner has shipped, as a grid
// of project cards. Each card shows what the program really prints: the learner's last run from
// here when there is one (or its chart), otherwise the project's example run. The client it was
// made for stands beside it, pleased with it: whoever got the newest one is still cheering, and
// the others cheer again when you point at their card. How they stand and how they celebrate is
// their own, chosen per card and per visit (lib/pixel/variety.ts), so no two cards are alike. Run
// opens the program in a sheet with its code and a console; Download and Push to GitHub work as
// they always have. Playing as one of the class (lib/playas.ts), the projects you were the client
// of are yours: you stand beside them, and they say "Yours".
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/lib/store/session";
import { getCode } from "@/lib/store/progress";
import type { JobProgressRow } from "@/lib/store/types";
import { isShipped } from "@/lib/progress-rules";
import { download, projectFolder, readme, repoReadme, slug, withWorkshopStub, zip, type ShelfItem } from "@/lib/export";
import type { Files } from "@/lib/python/protocol";
import { castColour, CAST_IDS, PROFESSOR } from "@/lib/cast";
import { isYou, playingAs, speakerOf } from "@/lib/playas";
import { useMedia } from "@/lib/useMedia";
import { moodOf } from "@/lib/mood";
import { pickGesture } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import { PixelPerson } from "../art/PixelPerson";
import { ShelfObject } from "../art/ShelfObject";
import { Speech } from "../art/Speech";
import { Button, LinkButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Editor } from "../workbench/Editor";
import { Console } from "../workbench/Console";
import { useRunner } from "../workbench/useRunner";
import { GitHubPush } from "./GitHubPush";
import styles from "./Shelf.module.css";

export interface ShelfCard {
  item: ShelfItem;
  /** The plain name of the program: "Bill Splitter". */
  name: string;
  clientId: string;
  /** The project's example run, from its brief. */
  example: string | null;
  /** The program draws a chart. */
  draws: boolean;
}

/** The learner's last run of a project from the Shelf, kept on this device for the preview. */
interface SavedRun {
  output: string;
  figure: string | null;
  at: number;
}

const runKey = (jobId: string) => `shelf-run/${jobId}`;
const PREVIEW_LINES = 8;
const EMPTY_LINE = "Nothing on the Shelf yet. Your first project is the sign on my door. It takes about twenty minutes.";
/** The same, from Neil, when you're playing as Paul: it's your door. */
const EMPTY_LINE_YOURS = "Nothing on the Shelf yet. Your first project is the sign on your door. It takes about twenty minutes.";

const longDate = (ms: number | null) => (ms ? new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

export function Shelf({ cards }: { cards: ShelfCard[] }) {
  const { store, profile, ready } = useSession();
  const [progress, setProgress] = useState<Record<string, JobProgressRow> | null>(null);
  const [runs, setRuns] = useState<Record<string, SavedRun>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [pointed, setPointed] = useState<string | null>(null);
  const phone = useMedia("(max-width: 720px)");
  const visit = useVisit();
  const playAs = playingAs(profile.settings.playAs);
  const host = speakerOf(PROFESSOR, playAs);
  const emptyLine = host === PROFESSOR ? EMPTY_LINE : EMPTY_LINE_YOURS;

  useEffect(() => {
    if (!store) return;
    void (async () => {
      const rows = await store.all("job_progress");
      setProgress(Object.fromEntries(rows.map((r) => [r.jobId, r])));
      const saved: Record<string, SavedRun> = {};
      for (const c of cards) {
        const r = await store.kvGet<SavedRun>(runKey(c.item.jobId)).catch(() => undefined);
        if (r) saved[c.item.jobId] = r;
      }
      setRuns(saved);
    })();
  }, [store, cards]);

  const shipped = useMemo(() => (progress ? cards.filter((c) => isShipped(progress[c.item.jobId])) : []), [cards, progress]);

  const codeFor = useCallback(
    async (i: ShelfItem): Promise<Files> => {
      const out: Files = {};
      if (!store || !i.shipsFrom) return out;
      // A terminal (git) step keeps its project inside the step's saved repository.
      const step = await store.get("step_progress", `${i.jobId}/${i.shipsFrom}`);
      const repo = (step?.data.git as { repo?: { files: Files } } | undefined)?.repo;
      if (repo) return { ...repo.files };
      for (const f of i.files) out[f] = (await getCode(store, i.jobId, i.shipsFrom, f))?.content ?? "";
      return out;
    },
    [store],
  );

  const repoFiles = async () => {
    const files: Record<string, string> = {};
    const list: { item: ShelfItem; shippedAt: number | null }[] = [];
    for (const { item: i } of shipped) {
      const code = await codeFor(i);
      const folder = projectFolder(i);
      for (const [f, c] of Object.entries(code)) files[`${folder}/${f}`] = c;
      for (const [f, c] of Object.entries(i.data)) files[`${folder}/${f}`] = c;
      files[`${folder}/README.md`] = readme(i, progress?.[i.jobId]?.shippedAt ?? null, profile.displayName);
      list.push({ item: i, shippedAt: progress?.[i.jobId]?.shippedAt ?? null });
    }
    files["README.md"] = repoReadme(list, profile.displayName);
    files[".gitignore"] = "__pycache__/\n*.pyc\n.venv/\n";
    return withWorkshopStub(files);
  };
  const repoName = `${slug(profile.displayName || "my")}-python-projects`;

  const exportAll = async () => {
    download(`${repoName}.zip`, zip(await repoFiles()), "application/zip");
  };

  /** One project's folder: the code, its data, and a README with the date. */
  const projectFiles = (c: ShelfCard, code: Files) => withWorkshopStub({ ...code, ...c.item.data, "README.md": readme(c.item, progress?.[c.item.jobId]?.shippedAt ?? null, profile.displayName) });

  const downloadOne = async (c: ShelfCard) => {
    const code = await codeFor(c.item);
    const names = Object.keys(code);
    const files = projectFiles(c, code);
    // One file and nothing else it needs: the .py on its own. Anything more is a folder.
    if (names.length === 1 && Object.keys(c.item.data).length === 0 && !files["workshop.py"]) download(`${c.item.jobId}.py`, code[names[0]!]!, "text/x-python");
    else download(`${c.item.jobId}.zip`, zip(files), "application/zip");
  };

  const saveRun = async (jobId: string, run: SavedRun) => {
    setRuns((r) => ({ ...r, [jobId]: run }));
    if (store) await store.kvSet(runKey(jobId), run).catch(() => undefined);
  };

  if (!ready || progress === null) return null;
  const openCard = shipped.find((c) => c.item.jobId === open) ?? null;
  const newest = shipped.reduce<ShelfCard | null>((a, c) => ((progress[c.item.jobId]?.shippedAt ?? 0) > (a ? (progress[a.item.jobId]?.shippedAt ?? 0) : -1) ? c : a), null)?.item.jobId;

  return (
    <div className={styles.shelf}>
      <header className={styles.head}>
        <h1 className={styles.title}>The Shelf</h1>
        <p className={styles.lede}>
          {shipped.length === 0
            ? "Everything you ship lands here, and every one of them still runs."
            : `${shipped.length} ${shipped.length === 1 ? "program" : "programs"} you've made. Every one of them still runs.`}
        </p>
      </header>

      {shipped.length === 0 ? (
        <div className={styles.empty}>
          <Speech
            who={host}
            name={host.charAt(0).toUpperCase() + host.slice(1)}
            text={emptyLine}
            face="pleased"
            gesture={moodOf(emptyLine, { face: "pleased", gesture: "point" }, { who: host, seed: `shelf|${visit}`, small: phone }).gesture}
            size={phone ? 72 : 108}
          />
          <LinkButton href="/job/shop-sign" variant="primary">
            Start the first project
          </LinkButton>
        </div>
      ) : (
        <>
          <section className={`px-panel ${styles.export}`} aria-labelledby="export-title">
            <div className={styles.exportText}>
              <h2 id="export-title" className={styles.exportTitle}>
                Everything, as one repository
              </h2>
              <p className={styles.quiet}>A folder for each Act, your code, and a README for each project saying what it does and what it uses. Unzip it and push it to GitHub as it is.</p>
            </div>
            <div className={styles.exportActions}>
              <Button variant="primary" icon="download" className={styles.big} onClick={() => void exportAll()}>
                Export everything as a repository
              </Button>
              <GitHubPush defaultName={repoName} files={repoFiles} />
            </div>
          </section>

          <ul className={styles.grid} aria-label="Your projects">
            {shipped.map((c) => {
              const row = progress[c.item.jobId]!;
              const person = (CAST_IDS as readonly string[]).includes(c.clientId);
              const cheering = c.item.jobId === newest || c.item.jobId === pointed;
              const point = () => setPointed(c.item.jobId);
              const leave = () => setPointed((p) => (p === c.item.jobId ? null : p));
              return (
                <li key={c.item.jobId} className={`px-panel ${styles.card}`} onMouseEnter={point} onMouseLeave={leave} onFocus={point} onBlur={leave}>
                  <Preview card={c} run={runs[c.item.jobId] ?? null} />
                  <div className={styles.body}>
                    {person ? (
                      <span className={styles.client} style={{ background: castColour(c.clientId).face }} aria-hidden="true">
                        <PixelPerson
                          who={c.clientId}
                          crop="bust"
                          scale={2}
                          expression={c.item.jobId === newest ? "laughing" : "pleased"}
                          pose={
                            cheering
                              ? pickGesture({ who: c.clientId, tags: ["celebrate"], seed: `shelf|${visit}|${c.item.jobId}`, mode: "moment" })
                              : pickGesture({ who: c.clientId, tags: ["idle", "listen", "approve"], seed: `shelf-rest|${visit}|${c.item.jobId}` })
                          }
                        />
                      </span>
                    ) : (
                      <ShelfObject jobId={c.item.jobId} title={c.item.title} client={c.clientId} size={48} />
                    )}
                    <div className={styles.bodyText}>
                      <h2 className={styles.name}>{c.name}</h2>
                      <p className={styles.meta}>{isYou(c.clientId, playAs) ? "Yours." : `For ${c.item.client}.`}</p>
                      <p className={styles.meta}>
                        Shipped {longDate(row.shippedAt)}
                        {row.status === "shipped-stretch" ? ", with a stretch task" : ""}
                      </p>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <Button variant="run" size="sm" onClick={() => setOpen(c.item.jobId)} aria-label={`Run ${c.name}`}>
                      Run
                    </Button>
                    <Button variant="secondary" size="sm" icon="download" onClick={() => void downloadOne(c)} aria-label={`Download ${c.name}`}>
                      Download
                    </Button>
                    <GitHubPush defaultName={c.item.jobId} files={async () => projectFiles(c, await codeFor(c.item))} size="sm" label={`Push ${c.name} to GitHub`} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {openCard ? <RunSheet key={openCard.item.jobId} card={openCard} yours={isYou(openCard.clientId, playAs)} codeFor={codeFor} onRan={(run) => void saveRun(openCard.item.jobId, run)} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}

/** What the program prints, in a dark terminal block, or the chart it drew. */
function Preview({ card, run }: { card: ShelfCard; run: SavedRun | null }) {
  if (run?.figure)
    return (
      <figure className={`px-inset ${styles.chart}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={run.figure.startsWith("data:") ? run.figure : `data:image/png;base64,${run.figure}`} alt={`The chart ${card.name} drew on your last run`} />
      </figure>
    );
  const text = run?.output.trim() ? run.output : card.example;
  if (text) {
    const lines = text.replace(/\s+$/, "").split("\n");
    return (
      <figure className={`code-dark px-inset ${styles.preview}`}>
        <figcaption className={styles.previewLabel}>{run?.output.trim() ? "Your last run" : "Example run"}</figcaption>
        <pre className={styles.previewText}>
          {lines.length > PREVIEW_LINES ? `${lines.slice(0, PREVIEW_LINES - 1).join("\n")}\n...` : lines.join("\n")}
        </pre>
      </figure>
    );
  }
  return (
    <figure className={`code-dark px-inset ${styles.preview} ${styles.previewEmpty}`}>
      <Icon name={card.draws ? "chartBar" : "terminal"} size={24} />
      <figcaption className={styles.previewLabel}>{card.draws ? "Run it to see its chart here" : "Run it to see what it prints"}</figcaption>
    </figure>
  );
}

/** The program open on the bench: its code, read only, and a console. It runs as it opens. */
function RunSheet({ card, yours, codeFor, onRan, onClose }: { card: ShelfCard; yours: boolean; codeFor: (i: ShelfItem) => Promise<Files>; onRan: (r: SavedRun) => void; onClose: () => void }) {
  const runner = useRunner();
  const dialog = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState<Files | null>(null);
  const [file, setFile] = useState(card.item.entry);
  const item = card.item;
  const running = runner.state.phase === "running" || runner.state.phase === "starting";

  const run = useCallback(
    async (files: Files) => {
      const result = await runner.run({ ...item.data, ...files }, item.entry);
      if (result && result.status !== "stopped") onRan({ output: result.output.slice(0, 4000), figure: result.figures?.[0] ?? null, at: Date.now() });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.jobId],
  );

  // Once per opening, even when React runs effects twice in development.
  const opened = useRef(false);
  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
    if (opened.current) return;
    opened.current = true;
    void codeFor(item).then((c) => {
      setCode(c);
      void run(c);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.jobId]);

  const close = () => {
    if (running) runner.stop();
    dialog.current?.close();
  };

  return (
    <dialog ref={dialog} className={`float ${styles.sheet}`} aria-labelledby="sheet-title" onCancel={() => running && runner.stop()} onClose={onClose}>
      <header className={styles.sheetHead}>
        <ShelfObject jobId={item.jobId} title={item.title} client={card.clientId} size={40} />
        <div className={styles.bodyText}>
          <h2 id="sheet-title" className={styles.name}>
            {card.name}
          </h2>
          <p className={styles.meta}>
            {yours ? "Yours" : `For ${item.client}`}. Act {item.actNumber}.
          </p>
        </div>
        <Button variant="ghost" size="sm" icon="close" onClick={close} aria-label="Close" className={styles.close} />
      </header>
      <div className={styles.sheetBody}>
        <div className={styles.codePane}>
          {code && Object.keys(code).length > 1 ? (
            <div className={styles.fileTabs} role="tablist" aria-label="Files">
              {Object.keys(code).map((f) => (
                <button key={f} type="button" role="tab" aria-selected={f === file} onClick={() => setFile(f)}>
                  {f}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.fileName}>{item.entry}</p>
          )}
          <div className={styles.code}>{code ? <Editor docKey={`shelf/${item.jobId}/${file}`} value={code[file] ?? ""} readOnly label={`${card.name}, ${file}`} /> : null}</div>
        </div>
        <div className={styles.consolePane}>
          <Console state={runner.state} source={code?.[item.entry] ?? ""} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
        </div>
      </div>
      <footer className={styles.sheetFoot}>
        {running ? (
          <Button variant="danger" icon="stop" onClick={runner.stop}>
            Stop
          </Button>
        ) : (
          <Button variant="run" onClick={() => code && void run(code)} disabled={!code}>
            Run it again
          </Button>
        )}
        <LinkButton href={`/job/${item.jobId}`} variant="ghost">
          Open the project
        </LinkButton>
      </footer>
    </dialog>
  );
}
