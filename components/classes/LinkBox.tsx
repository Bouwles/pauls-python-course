"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../ui/Button";
import styles from "./Classes.module.css";

/** Copy text to the clipboard. False when the browser won't (an old one, or permission refused). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * A link that's been made: in a box to read or copy by hand, with Copy, and Share where the
 * device can (a phone's share sheet). `copied` says the button that made it has copied it already.
 */
export function LinkBox({ url, label, shareTitle, shareText, copied: already = false, children }: { url: string; label: string; shareTitle: string; shareText: string; copied?: boolean; children?: React.ReactNode }) {
  const id = useId();
  const field = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState(already ? "Copied. Paste it wherever you're sending it." : "");
  const [canShare, setCanShare] = useState(false);

  // Only after hydrating: the server can't know what this device offers.
  useEffect(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), []);

  const copy = async () => {
    if (await copyText(url)) setNote("Copied. Paste it wherever you're sending it.");
    else {
      field.current?.select();
      setNote("This browser wouldn't copy it. The link is selected in the box, so copy it from there.");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url });
      setNote("Shared.");
    } catch (e) {
      // Closing the share sheet isn't a problem.
      if ((e as Error)?.name !== "AbortError") setNote("That didn't share. Copy the link instead.");
    }
  };

  return (
    <div className={styles.linkBox}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input ref={field} id={id} className={styles.linkField} readOnly value={url} onFocus={(e) => e.currentTarget.select()} spellCheck={false} />
      <div className={styles.actions}>
        <Button size="sm" icon="copy" onClick={() => void copy()}>
          Copy the link
        </Button>
        {canShare ? (
          <Button size="sm" icon="rocket" onClick={() => void share()}>
            Share the link
          </Button>
        ) : null}
      </div>
      {children}
      <p className={styles.status} role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
