"use client";

// Step 2 of the ppc tool's sign-in: type the code your terminal shows.
import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { Button, LinkButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import styles from "./DeviceApprove.module.css";

export function DeviceApprove({ initialCode }: { initialCode: string }) {
  const { user, ready } = useSession();
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/device/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "That didn't work. Try again.");
        setState("idle");
      } else setState("done");
    } catch {
      setError("Couldn't reach the server. Check your connection.");
      setState("idle");
    }
  };

  const login = `/login?next=${encodeURIComponent(`/device${code ? `?code=${code}` : ""}`)}`;

  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name="terminal" size={24} />
      </span>
      <h1 className={styles.title}>Connect the ppc tool</h1>
      {!ready ? null : !user ? (
        <div className={`px-panel ${styles.card}`}>
          <p>Log in first, then come back to this page to connect the tool.</p>
          <LinkButton href={login} variant="primary">
            Log in
          </LinkButton>
          <p className={styles.hint}>
            No account yet? <Link href="/signup">Sign up</Link>.
          </p>
        </div>
      ) : state === "done" ? (
        <div className={`px-panel ${styles.card}`} role="status">
          <p className={styles.done}>
            <Icon name="tick" />
            <span>Connected. Go back to your terminal; ppc is signed in as you.</span>
          </p>
          <p className={styles.hint}>You can disconnect it at any time in Settings, under Your data.</p>
        </div>
      ) : (
        <form
          className={`px-panel ${styles.card}`}
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <p>Your terminal shows a code of eight letters after you run ppc login. Type it here to let ppc hand work in for you.</p>
          <label className={styles.field}>
            <span className="label">Code</span>
            <input
              className={styles.code}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="BCDF-GHJK"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={9}
              aria-invalid={error ? true : undefined}
            />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <Button variant="primary" type="submit" disabled={state === "busy" || code.replace(/[^A-Z]/gi, "").length !== 8}>
            Connect
          </Button>
          <p className={styles.hint}>Only do this for a code you just saw in your own terminal.</p>
        </form>
      )}
    </div>
  );
}
