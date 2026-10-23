"use client";

// Step 2 of the ppc tool's sign-in: type the code your terminal shows.
import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { Button } from "../ui/Button";
import styles from "../settings/Settings.module.css";

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
      setError("Couldn't reach the workshop. Check your connection.");
      setState("idle");
    }
  };

  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>Connect the ppc tool</h1>
      {!ready ? null : !user ? (
        <p>
          Log in first, then come back to this page. <Link href={`/login?next=${encodeURIComponent(`/device${code ? `?code=${code}` : ""}`)}`}>Log in</Link>
        </p>
      ) : state === "done" ? (
        <section className={styles.section}>
          <p>Connected. Go back to your terminal; ppc is signed in as you.</p>
          <p className={styles.hint}>You can disconnect it at any time in Settings, under Your data.</p>
        </section>
      ) : (
        <form
          className={styles.section}
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <p>Your terminal shows a code of eight letters after you run ppc login. Type it here to let ppc hand work in for you.</p>
          <label className={styles.field}>
            <span>Code</span>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BCDF-GHJK" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={9} />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.row}>
            <Button variant="primary" type="submit" disabled={state === "busy" || code.replace(/[^A-Z]/gi, "").length !== 8}>
              Connect
            </Button>
          </div>
          <p className={styles.hint}>Only do this for a code you just saw in your own terminal.</p>
        </form>
      )}
    </div>
  );
}
