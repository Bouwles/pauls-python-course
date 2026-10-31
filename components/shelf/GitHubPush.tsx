"use client";

// One-click push to a new GitHub repository (Section 8.7): the whole Shelf, or one project.
// Shown only when the site has a GitHub OAuth app set up; the zip export always works.
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import styles from "./Shelf.module.css";

interface Status {
  enabled: boolean;
  connected: boolean;
  login?: string | null;
}

// One request for the page, however many cards ask.
let statusRequest: Promise<Status> | null = null;
function githubStatus(): Promise<Status> {
  statusRequest ??= fetch("/api/github")
    .then((r) => (r.ok ? (r.json() as Promise<Status>) : { enabled: false, connected: false }))
    .catch(() => ({ enabled: false, connected: false }));
  return statusRequest;
}

export function GitHubPush({ defaultName, files, size = "md", label }: { defaultName: string; files: () => Promise<Record<string, string>>; size?: "sm" | "md"; label?: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);

  useEffect(() => {
    void githubStatus().then(setStatus);
  }, []);

  if (!status?.enabled) return null;
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
