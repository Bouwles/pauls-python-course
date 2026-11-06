"use client";

// After a Ship, for anyone whose work lives only in this browser (GitHub Pages, or a guest on the
// local version): one quiet line, when it's been a while since their last save (lib/save/browser.ts,
// reminderDue). Shown once, then not again until three more Ships or a few days on.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LocalStore } from "@/lib/store/local";
import { checkReminder } from "@/lib/save/browser";
import { Icon } from "../ui/Icon";
import styles from "./YourSave.module.css";

export function SaveReminder({ store, className }: { store: LocalStore | null; className?: string }) {
  const [due, setDue] = useState(false);
  const shown = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    void checkReminder(store).then((r) => {
      if (cancelled) return;
      shown.current = r.shown;
      setDue(r.due);
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  // Noted as shown once it's on screen, so a second look at this Ship doesn't bring it back.
  useEffect(() => {
    if (due) void shown.current?.();
  }, [due]);

  if (!due) return null;
  return (
    <p className={[styles.reminder, className].filter(Boolean).join(" ")}>
      <Icon name="saved" size={20} />
      <span>
        Keep your work safe: <Link href="/settings#s-save">download your save</Link>
      </span>
    </p>
  );
}
