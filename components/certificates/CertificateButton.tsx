"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { useSession } from "@/lib/store/session";
import { isDone } from "@/lib/progress-rules";
import { playingAs } from "@/lib/playas";
import { readAvatar } from "@/lib/avatar";
import { STATIC } from "@/lib/static";
import { encodeCertificate, SHARE_LIMITS } from "@/lib/share-links";
import { Button } from "../ui/Button";
import styles from "./Certificate.module.css";

/** The Act's main projects: numbered, written, and not a placement. The certificate needs every one shipped. */
export const certificateJobs = (act: Pick<ActSummary, "jobs">) => act.jobs.filter((j) => !j.sidequest && !j.placementFor && j.status === "written");

/** "2026-11-06" in the learner's own time zone. */
const dayOf = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * The certificate's link, from this browser's progress: null until every main project in the Act
 * is shipped. It's dated the day the last of them was, so it's the same link whenever it's made.
 */
export function certificateHash(act: Pick<ActSummary, "number" | "jobs">, progress: Record<string, JobProgressRow>, who: { name: string; playAs: string | null; character: unknown }): string | null {
  const main = certificateJobs(act);
  if (!main.length || !main.every((j) => isDone(progress[j.id]))) return null;
  const last = Math.max(0, ...main.map((j) => progress[j.id]?.shippedAt ?? progress[j.id]?.updatedAt ?? 0));
  return encodeCertificate({
    maker: { name: who.name.trim() || "A learner", playAs: playingAs(who.playAs), look: readAvatar(who.character) },
    act: act.number,
    projects: main.length,
    day: dayOf(last > 0 ? last : Date.now()),
  });
}

/**
 * On a finished Act: "Get the certificate". Signed in on the local version, the server issues it
 * (app/api/certificates) with its own verification page. Everywhere else (GitHub Pages, and
 * anyone playing without an account) it's made from this browser's progress and opens at
 * /certificate/#<link>, asking for a name first if there isn't one.
 */
export function CertificateButton({ act, progress }: { act: ActSummary; progress: Record<string, JobProgressRow> }) {
  const { user, profile, updateProfile } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");
  const fieldId = useId();
  const server = Boolean(user) && !STATIC;

  const fromServer = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/certificates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actId: act.id }) });
    const body = (await res.json().catch(() => ({}))) as { certificate?: { id: string }; error?: string };
    if (res.ok && body.certificate) router.push(`/certificates/${body.certificate.id}`);
    else {
      setError(body.error ?? "That didn't work.");
      setBusy(false);
    }
  };

  const inBrowser = async (typed?: string) => {
    const shown = (typed ?? profile.displayName).trim();
    if (!shown) {
      setAsking(true);
      return;
    }
    setBusy(true);
    if (typed) await updateProfile({ displayName: typed.trim() });
    const hash = certificateHash(act, progress, { name: shown, playAs: profile.settings.playAs, character: profile.character });
    if (!hash) {
      setError("Ship every main project in the Act first.");
      setBusy(false);
      return;
    }
    router.push(`/certificate/#${hash}`);
  };

  if (asking)
    return (
      <form
        className={styles.issue}
        onSubmit={(e) => {
          e.preventDefault();
          void inBrowser(name);
        }}
      >
        <label htmlFor={fieldId} className="label">
          Your name, as it goes on the certificate
        </label>
        <input id={fieldId} className={styles.nameField} value={name} onChange={(e) => setName(e.target.value)} maxLength={SHARE_LIMITS.name} autoComplete="name" required />
        <Button type="submit" size="sm" variant="primary" icon="graduation" disabled={busy || !name.trim()}>
          Get the certificate
        </Button>
      </form>
    );

  return (
    <span className={styles.issue}>
      <Button size="sm" variant="primary" icon="graduation" onClick={() => void (server ? fromServer() : inBrowser())} disabled={busy}>
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
