"use client";

import { useState } from "react";
import { BASE } from "@/lib/static";
import { useSession } from "@/lib/store/session";
import { fitReport, linkUrl } from "@/lib/classes/link";
import { gatherReport, type ProjectFacts } from "@/lib/classes/report";
import { myId } from "@/lib/classes/store";
import type { JoinedClass } from "@/lib/classes/types";
import { Button } from "../ui/Button";
import teach from "../teach/Teach.module.css";
import { LinkBox } from "./LinkBox";
import styles from "./Classes.module.css";

/**
 * "Send Paul my progress": makes a progress link from this browser's work on the class's set
 * projects (how far, hints, time, and the code for each Build step), to copy or share. Made fresh
 * each time, so it always says where things are now.
 */
export function SendProgress({ cls, facts, variant = "primary", withClassName = false, block = false }: { cls: JoinedClass; facts: (jobId: string) => ProjectFacts; variant?: "primary" | "secondary"; withClassName?: boolean; block?: boolean }) {
  const { store, profile, updateProfile } = useSession();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<{ url: string; leftOut: number; at: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const needsName = !profile.displayName.trim();
  const fieldId = `send-name-${cls.id}`;

  const make = async () => {
    if (!store) return;
    setBusy(true);
    setError(null);
    try {
      let me = profile;
      if (needsName) {
        const typed = name.trim();
        await updateProfile({ displayName: typed });
        me = { ...profile, displayName: typed };
      }
      const report = await gatherReport(store, me, cls, myId(), facts);
      const fitted = fitReport(report);
      setMade({ url: linkUrl(window.location.origin, BASE, "report", fitted.hash), leftOut: fitted.leftOut.length, at: Date.now() });
    } catch {
      setError("That didn't work. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const label = withClassName ? `Send ${cls.teacher} my ${cls.name} progress` : `Send ${cls.teacher} my progress`;

  return (
    <div className={styles.desk}>
      {needsName ? (
        <div className={teach.field}>
          <label htmlFor={fieldId} className="label">
            Your name, so {cls.teacher} knows it&apos;s you
          </label>
          <input id={fieldId} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
        </div>
      ) : null}
      <Button variant={variant} icon="envelope" className={[styles.wraps, block ? styles.block : ""].join(" ")} onClick={() => void make()} disabled={!store || busy || (needsName && !name.trim())}>
        {label}
      </Button>
      {error ? (
        <p className={teach.error} role="alert">
          {error}
        </p>
      ) : null}
      {made ? (
        <LinkBox key={made.at} url={made.url} label={`Your progress link for ${cls.teacher}`} shareTitle={`${profile.displayName || name.trim()}'s progress`} shareText={`My progress in ${cls.name}.`}>
          <p className={styles.linkNote}>
            Send it to {cls.teacher} however you like. It holds how far you are with each set project and your code for each Build step
            {made.leftOut ? `, except ${made.leftOut === 1 ? "one project's code, which was" : `${made.leftOut} projects' code, which were`} too long for a link` : ""}.
          </p>
        </LinkBox>
      ) : null}
    </div>
  );
}
