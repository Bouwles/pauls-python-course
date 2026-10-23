"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { getCode } from "@/lib/store/progress";
import type { JobProgressRow } from "@/lib/store/types";
import { isShipped } from "@/lib/progress-rules";
import { download, projectFolder, readme, repoReadme, slug, zip, type ShelfItem } from "@/lib/export";
import type { Files } from "@/lib/python/protocol";
import { Button } from "../ui/Button";
import { RunIcon, StopIcon } from "../ui/Icons";
import { Editor } from "../workbench/Editor";
import { Console } from "../workbench/Console";
import { useRunner } from "../workbench/useRunner";
import { ShelfObject } from "./ShelfObject";
import { GitHubPush } from "./GitHubPush";
import styles from "./Shelf.module.css";

const PER_SHELF = 6;

export function Shelf({ items }: { items: ShelfItem[] }) {
  const { store, profile, ready } = useSession();
  const [progress, setProgress] = useState<Record<string, JobProgressRow>>({});
  const [selected, setSelected] = useState<string | null>(null);

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
      files[`${folder}/README.md`] = readme(i, progress[i.jobId]?.shippedAt ?? null);
      list.push({ item: i, shippedAt: progress[i.jobId]?.shippedAt ?? null });
    }
    files["README.md"] = repoReadme(list, profile.displayName);
    files[".gitignore"] = "__pycache__/\n*.pyc\n.venv/\n";
    return files;
  };
  const repoName = `${slug(profile.displayName || "my")}-python-projects`;

  const exportAll = async () => {
    download(`${repoName}.zip`, zip(await repoFiles()), "application/zip");
  };

  if (!ready) return null;

  const shelves: ShelfItem[][] = [];
  for (let i = 0; i < Math.max(shipped.length, 1); i += PER_SHELF) shelves.push(shipped.slice(i, i + PER_SHELF));

  return (
    <div className={styles.layout}>
      <section className={styles.room} aria-labelledby="shelf-title">
        <div className={styles.head}>
          <h1 id="shelf-title" className={styles.title}>
            The Shelf
          </h1>
          {shipped.length ? (
            <div className={styles.exportRow}>
              <Button variant="secondary" onClick={() => void exportAll()}>
                Export everything as a repository
              </Button>
              <GitHubPush defaultName={repoName} files={repoFiles} />
            </div>
          ) : null}
        </div>
        <p className={styles.lede}>{shipped.length === 0 ? "Nothing on the shelf yet. Bea's till is first." : `The back room of the workshop. ${shipped.length} ${shipped.length === 1 ? "thing" : "things"} you've made, each one still works.`}</p>
        <div className={styles.unit}>
          {shelves.map((row, r) => (
            <ul key={r} className={styles.board} aria-label={`Shelf ${r + 1}`}>
              {row.map((i) => (
                <li key={i.jobId}>
                  <button className={[styles.object, selected === i.jobId ? styles.on : ""].join(" ")} onClick={() => setSelected(i.jobId)} aria-pressed={selected === i.jobId}>
                    <ShelfObject id={i.shelf.object} />
                    <span className={styles.objectLabel}>{i.shelf.label}</span>
                  </button>
                </li>
              ))}
              {row.length === 0 ? (
                <li className={styles.emptySlot}>
                  <Link href="/job/sign-on-the-door">Start with the sign on the door</Link>
                </li>
              ) : null}
            </ul>
          ))}
        </div>
        <p className={styles.note}>The repository export has a folder for each Act, your code, and a README for each project describing the brief and what it uses. Unzip it and push it to GitHub as it is.</p>
      </section>
      <aside className={styles.detail} aria-live="polite">
        {item ? <Detail key={item.jobId} item={item} row={progress[item.jobId]!} codeFor={codeFor} /> : shipped.length ? <p className={styles.note}>Pick something off the shelf to see it, run it again, or download it.</p> : null}
      </aside>
    </div>
  );
}

function Detail({ item, row, codeFor }: { item: ShelfItem; row: JobProgressRow; codeFor: (i: ShelfItem) => Promise<Files> }) {
  const runner = useRunner();
  const [code, setCode] = useState<Files | null>(null);
  const [file, setFile] = useState(item.entry);
  useEffect(() => {
    void codeFor(item).then(setCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.jobId]);
  const running = runner.state.phase === "running" || runner.state.phase === "starting";
  const date = row.shippedAt ? new Date(row.shippedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  const downloadIt = () => {
    if (!code) return;
    const names = Object.keys(code);
    if (names.length === 1 && Object.keys(item.data).length === 0) download(`${item.jobId}.py`, code[names[0]!]!, "text/x-python");
    else download(`${item.jobId}.zip`, zip({ ...Object.fromEntries(Object.entries(code)), ...item.data, "README.md": readme(item, row.shippedAt) }), "application/zip");
  };
  return (
    <div className={styles.detailInner}>
      <p className="label">
        Act {item.actNumber}, job {item.number}
      </p>
      <h2 className={styles.detailTitle}>{item.title}</h2>
      <p className={styles.meta}>
        For {item.client}, {item.building.replace(/^The /, "the ")}. Shipped {date}
        {row.status === "shipped-stretch" ? ", with a stretch task" : ""}.
      </p>
      {code && Object.keys(code).length > 1 ? (
        <div className={styles.fileTabs} role="tablist">
          {Object.keys(code).map((f) => (
            <button key={f} role="tab" aria-selected={f === file} onClick={() => setFile(f)}>
              {f}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.code}>{code ? <Editor docKey={`${item.jobId}/${file}`} value={code[file] ?? ""} readOnly label={`${item.title}, ${file}`} /> : null}</div>
      <div className={styles.actions}>
        {running ? (
          <Button size="sm" variant="danger" icon={<StopIcon />} onClick={runner.stop}>
            Stop
          </Button>
        ) : (
          <Button size="sm" variant="primary" icon={<RunIcon />} onClick={() => code && void runner.run({ ...item.data, ...code }, item.entry)} disabled={!code}>
            Run it again
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={downloadIt} disabled={!code}>
          Download
        </Button>
        <Link href={`/job/${item.jobId}`} className={styles.meta}>
          Open the job
        </Link>
      </div>
      <div className={styles.console}>
        <Console state={runner.state} source={code?.[item.entry] ?? ""} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
      </div>
    </div>
  );
}
