"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/lib/store/session";
import { getCode } from "@/lib/store/progress";
import type { JobProgressRow } from "@/lib/store/types";
import { isShipped } from "@/lib/progress-rules";
import { download, projectFolder, readme, repoReadme, slug, withWorkshopStub, zip, type ShelfItem } from "@/lib/export";
import type { Files } from "@/lib/python/protocol";
import { Button, LinkButton } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { Editor } from "../workbench/Editor";
import { Console } from "../workbench/Console";
import { useRunner } from "../workbench/useRunner";
import { ShelfObject } from "./ShelfObject";
import { GitHubPush } from "./GitHubPush";
import styles from "./Shelf.module.css";

/** The narrowest an object's place on a shelf gets, so its paper label stays readable. */
const SLOT = 150;
const MAX_PER_SHELF = 6;

/** How many objects fit on one shelf at the wall's current width. Also used by the public profile. */
export function usePerShelf(ready: boolean) {
  const wall = useRef<HTMLDivElement>(null);
  const [per, setPer] = useState(4);
  useEffect(() => {
    const el = wall.current;
    if (!el) return;
    const fit = (width: number) => setPer(Math.min(MAX_PER_SHELF, Math.max(2, Math.floor(width / SLOT))));
    fit(el.clientWidth);
    const ro = new ResizeObserver(([e]) => e && fit(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);
  return { wall, per };
}

export function Shelf({ items }: { items: ShelfItem[] }) {
  const { store, profile, ready } = useSession();
  const [progress, setProgress] = useState<Record<string, JobProgressRow>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const { wall, per } = usePerShelf(ready);
  const detail = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!store) return;
    void store.all("job_progress").then((rows) => setProgress(Object.fromEntries(rows.map((r) => [r.jobId, r]))));
  }, [store]);

  const shipped = useMemo(() => items.filter((i) => isShipped(progress[i.jobId])), [items, progress]);
  const item = shipped.find((i) => i.jobId === selected) ?? null;

  const codeFor = async (i: ShelfItem): Promise<Files> => {
    const out: Files = {};
    if (!store || !i.shipsFrom) return out;
    // A terminal (git) step keeps its project inside the step's saved repository.
    const step = await store.get("step_progress", `${i.jobId}/${i.shipsFrom}`);
    const repo = (step?.data.git as { repo?: { files: Files } } | undefined)?.repo;
    if (repo) return { ...repo.files };
    for (const f of i.files) out[f] = (await getCode(store, i.jobId, i.shipsFrom, f))?.content ?? "";
    return out;
  };

  const repoFiles = async () => {
    const files: Record<string, string> = {};
    const list: { item: ShelfItem; shippedAt: number | null }[] = [];
    for (const i of shipped) {
      const code = await codeFor(i);
      const folder = projectFolder(i);
      for (const [f, c] of Object.entries(code)) files[`${folder}/${f}`] = c;
      for (const [f, c] of Object.entries(i.data)) files[`${folder}/${f}`] = c;
      files[`${folder}/README.md`] = readme(i, progress[i.jobId]?.shippedAt ?? null, profile.displayName);
      list.push({ item: i, shippedAt: progress[i.jobId]?.shippedAt ?? null });
    }
    files["README.md"] = repoReadme(list, profile.displayName);
    files[".gitignore"] = "__pycache__/\n*.pyc\n.venv/\n";
    return withWorkshopStub(files);
  };
  const repoName = `${slug(profile.displayName || "my")}-python-projects`;

  const exportAll = async () => {
    download(`${repoName}.zip`, zip(await repoFiles()), "application/zip");
  };

  const pick = (id: string) => {
    setSelected(id);
    // On a phone the panel opens under the shelves: bring it into view.
    if (window.matchMedia("(max-width: 1000px)").matches) requestAnimationFrame(() => detail.current?.scrollIntoView({ block: "start" }));
  };

  if (!ready) return null;

  const shelves: ShelfItem[][] = [];
  for (let i = 0; i < Math.max(shipped.length, 1); i += per) shelves.push(shipped.slice(i, i + per));

  return (
    <div className={styles.layout}>
      <section className={styles.room} aria-labelledby="shelf-title">
        <div className={styles.head}>
          <h1 id="shelf-title" className={styles.title}>
            The Shelf
          </h1>
          {shipped.length ? (
            <div className={styles.exportRow}>
              <Button variant="quiet" onClick={() => void exportAll()}>
                Export everything as a repository
              </Button>
              <GitHubPush defaultName={repoName} files={repoFiles} />
            </div>
          ) : null}
        </div>
        <p className={styles.lede}>{shipped.length === 0 ? "Nothing on the shelf yet. Bea's till is first." : `The back room of the workshop. ${shipped.length} ${shipped.length === 1 ? "thing" : "things"} you've made, and each one still works.`}</p>
        <div className={styles.wall} ref={wall}>
          {shelves.map((row, r) => (
            <ul key={r} className={styles.board} style={{ "--per": per } as React.CSSProperties} aria-label={`Shelf ${r + 1}`}>
              {row.map((i) => (
                <li key={i.jobId} className={styles.slot}>
                  <button className={[styles.object, selected === i.jobId ? styles.on : ""].join(" ")} onClick={() => pick(i.jobId)} aria-pressed={selected === i.jobId}>
                    <span className={styles.art}>
                      <ShelfObject id={i.shelf.object} scale={4} />
                    </span>
                    <span className={`frame-paper ${styles.tag}`}>{i.shelf.label}</span>
                  </button>
                </li>
              ))}
              {row.length === 0 ? (
                <li className={styles.emptySlot}>
                  <LinkButton href="/job/shop-sign" variant="primary">
                    Start with the sign on the door
                  </LinkButton>
                </li>
              ) : null}
            </ul>
          ))}
        </div>
        {shipped.length ? <p className={styles.note}>The repository export has a folder for each Act, your code, and a README for each project describing the brief and what it uses. Unzip it and push it to GitHub as it is.</p> : null}
      </section>
      <aside ref={detail} className={styles.side} aria-live="polite" aria-label="On the bench">
        {item ? (
          <Detail key={item.jobId} item={item} row={progress[item.jobId]!} codeFor={codeFor} onClose={() => setSelected(null)} />
        ) : shipped.length ? (
          <div className={`frame-panel ${styles.idle}`}>
            <p className={styles.idleTitle}>On the bench</p>
            <p className={styles.idleText}>Pick something off the shelf to see its code, run it again, or download it.</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function Detail({ item, row, codeFor, onClose }: { item: ShelfItem; row: JobProgressRow; codeFor: (i: ShelfItem) => Promise<Files>; onClose: () => void }) {
  const runner = useRunner();
  const [code, setCode] = useState<Files | null>(null);
  const [file, setFile] = useState(item.entry);
  useEffect(() => {
    void codeFor(item).then(setCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.jobId]);
  const running = runner.state.phase === "running" || runner.state.phase === "starting";
  const date = row.shippedAt ? new Date(row.shippedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  const projectFiles = (c: Files) => withWorkshopStub({ ...Object.fromEntries(Object.entries(c)), ...item.data, "README.md": readme(item, row.shippedAt) });
  const downloadIt = () => {
    if (!code) return;
    const names = Object.keys(code);
    const files = projectFiles(code);
    // One file and nothing else it needs: the .py on its own. Anything more is a folder.
    if (names.length === 1 && Object.keys(item.data).length === 0 && !files["workshop.py"]) download(`${item.jobId}.py`, code[names[0]!]!, "text/x-python");
    else download(`${item.jobId}.zip`, zip(files), "application/zip");
  };
  const pushFiles = async () => projectFiles(code ?? (await codeFor(item)));
  return (
    <article className={`frame-panel ${styles.detail}`} aria-labelledby="detail-title">
      <header className={styles.detailHead}>
        <span className={styles.detailArt}>
          <ShelfObject id={item.shelf.object} scale={3} />
        </span>
        <div className={styles.detailText}>
          <h2 id="detail-title" className={styles.detailTitle}>
            {item.title}
          </h2>
          <p className={styles.meta}>
            Act {item.actNumber}, job {item.number}. For {item.client}, {item.building.replace(/^The /, "the ")}.
          </p>
          <p className={styles.meta}>
            Shipped {date}
            {row.status === "shipped-stretch" ? ", with a stretch task" : ""}.
          </p>
        </div>
        <button type="button" className={styles.close} onClick={onClose} title="Put it back on the shelf">
          <PixelIcon name="cross" />
          <span className="visually-hidden">Put it back on the shelf</span>
        </button>
      </header>
      <div className={styles.codeBlock}>
        {code && Object.keys(code).length > 1 ? (
          <div className={styles.fileTabs} role="tablist" aria-label="Files">
            {Object.keys(code).map((f) => (
              <button key={f} role="tab" aria-selected={f === file} onClick={() => setFile(f)}>
                {f}
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.fileName}>{item.entry}</p>
        )}
        <div className={styles.code}>{code ? <Editor docKey={`${item.jobId}/${file}`} value={code[file] ?? ""} readOnly label={`${item.title}, ${file}`} /> : null}</div>
      </div>
      <div className={styles.actions}>
        {running ? (
          <Button variant="danger" pixelIcon="stop" onClick={runner.stop}>
            Stop
          </Button>
        ) : (
          <Button variant="go" pixelIcon="run" onClick={() => code && void runner.run({ ...item.data, ...code }, item.entry)} disabled={!code}>
            Run it again
          </Button>
        )}
        <Button variant="quiet" onClick={downloadIt} disabled={!code}>
          Download
        </Button>
        <GitHubPush defaultName={item.jobId} files={pushFiles} />
        <LinkButton href={`/job/${item.jobId}`} variant="quiet">
          Open the job
        </LinkButton>
      </div>
      <div className={styles.console}>
        <Console state={runner.state} source={code?.[item.entry] ?? ""} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
      </div>
    </article>
  );
}
