"use client";

// One-click push of the Shelf to a new GitHub repository (Section 8.7). Shown
// only when the site has a GitHub OAuth app set up; the zip export always works.
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import styles from "./Shelf.module.css";

interface Status {
  enabled: boolean;
  connected: boolean;
  login?: string | null;
}

export function GitHubPush({ defaultName, files }: { defaultName: string; files: () => Promise<Record<string, string>> }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);

  useEffect(() => {
    void fetch("/api/github")
      .then((r) => (r.ok ? r.json() : { enabled: false, connected: false }))
      .then(setStatus)
      .catch(() => setStatus({ enabled: false, connected: false }));
  }, []);

  if (!status?.enabled) return null;
  if (!status.connected) {
    return (
      <Button variant="quiet" onClick={() => (window.location.href = "/api/github/connect")}>
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
      setResult({ error: "Couldn't reach the workshop. Check your connection." });
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
      <label>
        <span>New repository on {status.login ? `github.com/${status.login}` : "GitHub"}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} pattern="[A-Za-z0-9._-]+" required spellCheck={false} />
      </label>
      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? "Pushing" : "Push"}
      </Button>
      {result?.url ? (
        <p role="status">
          Pushed. <a href={result.url}>{result.url.replace("https://", "")}</a>
        </p>
      ) : result?.error ? (
        <p role="alert" className={styles.githubError}>
          {result.error}
        </p>
      ) : null}
    </form>
  ) : (
    <Button variant="quiet" onClick={() => setOpen(true)}>
      Push to GitHub
    </Button>
  );
}
