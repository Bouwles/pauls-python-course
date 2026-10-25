"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlan } from "@/lib/usePlan";
import { Button } from "../ui/Button";

/** On a finished Pro Act: issue its certificate and go to the verification page. */
export function CertificateButton({ actId }: { actId: string }) {
  const { status } = usePlan();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!status?.signedIn) return null;
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
    <span>
      <Button size="sm" variant="primary" pixelIcon="tick" onClick={() => void get()} disabled={busy} locked={status.access.pro ? false : "Certificates are part of Pro."}>
        Get the certificate
      </Button>
      {error ? <span role="alert"> {error}</span> : null}
    </span>
  );
}
