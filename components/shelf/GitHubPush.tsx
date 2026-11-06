"use client";

// Push to a GitHub repository (Section 8.7): the whole Shelf, or one project. Two ways:
// - on the local version, when the site has a GitHub OAuth app set up and you're signed in, the
//   server pushes for you (app/api/github);
// - everywhere else (GitHub Pages, or no OAuth app), the browser pushes itself with a fine-grained
//   token you make on GitHub and paste once (github.ts), kept in this browser only.
// Downloading the project and uploading it yourself always works, and the dialog offers it too.
import { useEffect, useId, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { STATIC } from "@/lib/static";
import { Button } from "../ui/Button";
import { NEW_TOKEN_URL, PushError, REPO_NAME, forgetToken, loadToken, newRepoUrl, pushFiles, saveToken, whoIs, type SavedToken } from "./github";
import styles from "./Shelf.module.css";

interface Status {
  enabled: boolean;
  connected: boolean;
  login?: string | null;
}

// One request for the page, however many cards ask. GitHub Pages has no server to ask.
let statusRequest: Promise<Status> | null = null;
function githubStatus(): Promise<Status> {
  if (STATIC) return Promise.resolve({ enabled: false, connected: false });
  statusRequest ??= fetch("/api/github")
    .then((r) => (r.ok ? (r.json() as Promise<Status>) : { enabled: false, connected: false }))
    .catch(() => ({ enabled: false, connected: false }));
  return statusRequest;
}

interface Props {
  defaultName: string;
  files: () => Promise<Record<string, string>>;
  size?: "sm" | "md";
  label?: string;
  /** What's being pushed, for the dialog's title: "Bill Splitter", or "your Shelf". */
  what?: string;
  /** The simple way: download it, to upload by hand. */
  onDownload?: () => void;
  /** The download button's words: "Download the project". */
  downloadLabel?: string;
}

export function GitHubPush(props: Props) {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    void githubStatus().then(setStatus);
  }, []);
  if (!status) return null;
  return status.enabled ? <ServerPush {...props} status={status} /> : <BrowserPush {...props} />;
}

/** Through the site's GitHub app, signed in (the local version with GITHUB_CLIENT_ID set). */
function ServerPush({ defaultName, files, size = "md", label, status }: Props & { status: Status }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);

  if (!status.connected) {
    return (
      <Button variant="secondary" size={size} icon="github" aria-label={label} onClick={() => (window.location.href = "/api/github/connect")}>
        Push to GitHub
      </Button>
    );
  }

  const push = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/github/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, files: await files() }) });
      setResult((await res.json()) as { url?: string; error?: string });
    } catch {
      setResult({ error: "Couldn't reach GitHub. Check your connection." });
    } finally {
      setBusy(false);
    }
  };

  return open ? (
    <form
      className={styles.githubForm}
      onSubmit={(e) => {
        e.preventDefault();
        void push();
      }}
    >
      <label className={styles.githubField}>
        <span className="label">New repository on {status.login ? `github.com/${status.login}` : "GitHub"}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} pattern="[A-Za-z0-9._-]+" required spellCheck={false} />
      </label>
      <div className={styles.githubRow}>
        <Button type="submit" variant="primary" size={size} icon="github" disabled={busy}>
          {busy ? "Pushing" : "Push"}
        </Button>
        <Button type="button" variant="ghost" size={size} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {result?.url ? (
        <p role="status" className={styles.githubNote}>
          Pushed. <a href={result.url}>{result.url.replace("https://", "")}</a>
        </p>
      ) : result?.error ? (
        <p role="alert" className={styles.githubError}>
          {result.error}
        </p>
      ) : null}
    </form>
  ) : (
    <Button variant="secondary" size={size} icon="github" aria-label={label} onClick={() => setOpen(true)}>
      Push to GitHub
    </Button>
  );
}

/** From the browser, with a token pasted once. */
function BrowserPush({ defaultName, files, size = "md", label, what = "your projects", onDownload, downloadLabel = "Download the project" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const tokenId = useId();
  const nameId = useId();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<SavedToken | null>(null);
  const [typed, setTyped] = useState("");
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [problem, setProblem] = useState<PushError | null>(null);
  const description = `Programs I wrote in ${BRAND.name}.`;

  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [open]);

  const start = () => {
    setSaved(loadToken());
    setDone(null);
    setProblem(null);
    setOpen(true);
  };

  const keep = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const token = typed.trim();
      const login = await whoIs(token);
      const t = { token, login };
      if (!saveToken(t)) setProblem(new PushError("This browser wouldn't keep the token (it may be a private window). It works for this visit only.", "token"));
      setSaved(t);
      setTyped("");
    } catch (e) {
      setProblem(e instanceof PushError ? e : new PushError("That didn't work. Try again.", "github"));
    } finally {
      setBusy(false);
    }
  };

  const push = async () => {
    if (!saved) return;
    setBusy(true);
    setProblem(null);
    setDone(null);
    try {
      const url = await pushFiles({ token: saved.token, login: saved.login, name: name.trim(), description, message: `From ${BRAND.name}`, files: await files() });
      setDone(url);
    } catch (e) {
      const err = e instanceof PushError ? e : new PushError("That didn't work. Try again.", "github");
      if (err.reason === "token") {
        forgetToken();
        setSaved(null);
      }
      setProblem(err);
    } finally {
      setBusy(false);
    }
  };

  const forget = () => {
    forgetToken();
    setSaved(null);
    setDone(null);
    setProblem(null);
  };

  const repoName = REPO_NAME.test(name.trim()) ? name.trim() : defaultName;

  return (
    <>
      <Button variant="secondary" size={size} icon="github" aria-label={label} onClick={start}>
        Push to GitHub
      </Button>
      {open ? (
        <dialog
          ref={dialog}
          className={styles.githubDialog}
          aria-labelledby={titleId}
          onClose={() => setOpen(false)}
          onClick={(e) => {
            if (e.target === e.currentTarget) dialog.current?.close();
          }}
        >
          <div className={styles.githubBody}>
            <div className={styles.githubHead}>
              <h2 id={titleId} className={styles.githubTitle}>
                Push {what} to GitHub
              </h2>
              <Button variant="ghost" size="sm" icon="close" aria-label="Close" onClick={() => dialog.current?.close()} />
            </div>

            {saved ? (
              <form
                className={styles.githubForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  void push();
                }}
              >
                <p className={styles.quiet}>Pushing as {saved.login}, with the token kept in this browser.</p>
                <label htmlFor={nameId} className="label">
                  Repository on github.com/{saved.login}
                </label>
                <input id={nameId} className={styles.githubInput} value={name} onChange={(e) => setName(e.target.value)} pattern="[A-Za-z0-9._-]+" required spellCheck={false} autoComplete="off" />
                <div className={styles.githubRow}>
                  <Button type="submit" variant="primary" icon="github" disabled={busy}>
                    {busy ? "Pushing" : "Push"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={forget}>
                    Forget the token
                  </Button>
                </div>
              </form>
            ) : (
              <form
                className={styles.githubForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  void keep();
                }}
              >
                <p className={styles.quiet}>Puts your files in a repository on your own GitHub, using a token you make there. The token stays in this browser.</p>
                <ol className={styles.githubSteps}>
                  <li>
                    Make an empty repository for it: <a href={newRepoUrl(repoName, description)} target="_blank" rel="noopener noreferrer">make {repoName} on GitHub</a>. Any name works; use the same one below.
                  </li>
                  <li>
                    <a href={NEW_TOKEN_URL} target="_blank" rel="noopener noreferrer">Make a fine-grained token</a>. Give it a name and an expiry date. Under Repository access, choose Only select repositories and pick that repository. Under Permissions, set Contents to Read and write, and leave everything else as it is.
                  </li>
                  <li>Generate it, copy it, and paste it here.</li>
                </ol>
                <label htmlFor={tokenId} className="label">
                  Your token
                </label>
                <input id={tokenId} className={styles.githubInput} type="password" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} required placeholder="github_pat_..." />
                <div className={styles.githubRow}>
                  <Button type="submit" variant="primary" disabled={busy || !typed.trim()}>
                    {busy ? "Checking it" : "Keep it in this browser"}
                  </Button>
                </div>
                <p className={styles.githubSmall}>It only goes to GitHub, and it isn&apos;t in your save file or any link. To push to more than one repository with the same token, choose All repositories in step 2.</p>
              </form>
            )}

            {done ? (
              <p role="status" className={styles.githubNote}>
                Pushed. <a href={done}>{done.replace("https://", "")}</a>
              </p>
            ) : null}
            {problem ? (
              <div role="alert" className={styles.githubError}>
                <p>{problem.message}</p>
                {problem.makeUrl ? (
                  <p>
                    <a href={problem.makeUrl} target="_blank" rel="noopener noreferrer">
                      Make {repoName} on GitHub
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}

            {onDownload ? (
              <div className={styles.githubAlt}>
                <p className={styles.githubSmall}>Or download it, and upload the files on GitHub yourself.</p>
                <Button variant="secondary" size="sm" icon="download" onClick={onDownload}>
                  {downloadLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </dialog>
      ) : null}
    </>
  );
}
