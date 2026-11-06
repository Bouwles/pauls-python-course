"use client";

// "Share this project" and "Share my Shelf": a link that carries what you've made
// (lib/share-links.ts), to copy or send. Nothing is uploaded anywhere; the link is all there is.
// It asks for a name first if there isn't one, so friends know whose it is.
import { useEffect, useId, useRef, useState } from "react";
import { BASE } from "@/lib/static";
import { BRAND } from "@/lib/brand";
import { readAvatar } from "@/lib/avatar";
import { playingAs } from "@/lib/playas";
import { useSession } from "@/lib/store/session";
import { SHARE_LIMITS, shareUrl, type Maker, type ShareKind } from "@/lib/share-links";
import { Button, type ButtonVariant } from "../ui/Button";
import type { IconName } from "../ui/Icon";
import { LinkBox } from "../classes/LinkBox";
import styles from "./Share.module.css";

export interface MadeLink {
  kind: ShareKind;
  hash: string;
  /** A line about what didn't fit, or anything else worth saying. */
  note?: string | null;
}

export function ShareButton({
  label,
  title,
  holds,
  make,
  ariaLabel,
  size = "md",
  variant = "secondary",
  icon = "rocket",
}: {
  label: string;
  /** The dialog's title: "Share Bill Splitter". */
  title: string;
  /** What the link holds, in a sentence. */
  holds: string;
  make: (maker: Maker) => Promise<MadeLink>;
  ariaLabel?: string;
  size?: "sm" | "md";
  variant?: ButtonVariant;
  icon?: IconName;
}) {
  const { profile, updateProfile } = useSession();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [made, setMade] = useState<{ url: string; note: string | null; at: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const needsName = !profile.displayName.trim();

  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [open]);

  const build = async (who: string) => {
    setBusy(true);
    setError(null);
    try {
      const maker: Maker = { name: who.trim(), playAs: playingAs(profile.settings.playAs), look: readAvatar(profile.character) };
      const link = await make(maker);
      setMade({ url: shareUrl(window.location.origin, BASE, link.kind, link.hash), note: link.note ?? null, at: Date.now() });
    } catch {
      setError("That didn't work. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const start = () => {
    setMade(null);
    setError(null);
    setOpen(true);
    if (!needsName) void build(profile.displayName);
  };

  const close = () => dialog.current?.close();

  return (
    <>
      <Button variant={variant} size={size} icon={icon} onClick={start} aria-label={ariaLabel}>
        {label}
      </Button>
      {open ? (
        <dialog
          ref={dialog}
          className={styles.dialog}
          aria-labelledby={titleId}
          onClose={() => setOpen(false)}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={styles.dialogBody}>
            <div className={styles.dialogHead}>
              <h2 id={titleId} className={styles.dialogTitle}>
                {title}
              </h2>
              <Button variant="ghost" size="sm" icon="close" aria-label="Close" onClick={close} />
            </div>
            <p className={styles.quiet}>{holds}</p>
            {needsName && !made ? (
              <form
                className={styles.row}
                onSubmit={(e) => {
                  e.preventDefault();
                  const typed = name.trim();
                  if (!typed) return;
                  void updateProfile({ displayName: typed }).then(() => build(typed));
                }}
              >
                <label htmlFor={fieldId} className="label">
                  Your name, so they know it&apos;s yours
                </label>
                <input id={fieldId} value={name} onChange={(e) => setName(e.target.value)} maxLength={SHARE_LIMITS.name} autoComplete="name" required />
                <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
                  Make the link
                </Button>
              </form>
            ) : null}
            {busy && !made ? <p className={styles.small}>Making the link.</p> : null}
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
            {made ? (
              <LinkBox key={made.at} url={made.url} label="The link" shareTitle={title.replace(/^Share /, "")} shareText={`${profile.displayName || name.trim()} made this in ${BRAND.name}.`}>
                {made.note ? <p className={styles.small}>{made.note}</p> : null}
                <p className={styles.small}>
                  <a href={made.url} target="_blank" rel="noopener noreferrer">
                    See what they&apos;ll see
                  </a>
                </p>
              </LinkBox>
            ) : null}
          </div>
        </dialog>
      ) : null}
    </>
  );
}
