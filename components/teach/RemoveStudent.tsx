"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import styles from "./Teach.module.css";

export function RemoveStudent({ classId, className, studentId, name }: { classId: string; className: string; studentId: string; name: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const res = await fetch(`/api/teach/classes/${classId}/students/${studentId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "That didn't work.");
    router.push(`/teach/${classId}`);
    router.refresh();
  };

  if (!asking)
    return (
      <div className={styles.row}>
        <Button variant="secondary" onClick={() => setAsking(true)}>
          Remove from {className}
        </Button>
      </div>
    );
  return (
    <div className={styles.confirm} role="group" aria-label={`Remove ${name}`}>
      <p className={styles.meta}>
        {name} leaves the class and you stop seeing their work. They keep all of it, and can join again with the code.
      </p>
      <div className={styles.row}>
        <Button variant="danger" onClick={() => void remove()} disabled={busy}>
          Remove {name}
        </Button>
        <Button variant="quiet" onClick={() => setAsking(false)}>
          Keep them
        </Button>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
