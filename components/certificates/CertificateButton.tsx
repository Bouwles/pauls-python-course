"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { Button } from "../ui/Button";
import styles from "./Certificate.module.css";

/** On a finished Act: issue its certificate and go to the verification page. */
export function CertificateButton({ actId }: { actId: string }) {
  const { user } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const get = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/certificates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actId }) });
    const body = (await res.json().catch(() => ({}))) as { certificate?: { id: string }; error?: string };
    if (res.ok && body.certificate) router.push(`/certificates/${body.certificate.id}`);
    else {
      setError(body.error ?? "That didn't work.");
      setBusy(false);
    }
  };
  return (
    <span className={styles.issue}>
      <Button size="sm" variant="primary" icon="graduation" onClick={() => void get()} disabled={busy}>
        Get the certificate
      </Button>
      {error ? (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </span>
  );
}
