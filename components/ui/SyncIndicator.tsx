"use client";

import type { SyncStatus } from "@/lib/store/sync";
import { PixelIcon } from "./PixelIcon";
import styles from "./SyncIndicator.module.css";

// Save status as a pixel icon (REDESIGN.md 4.7): a floppy disk when saved, the spanner
// turning while saving, a cloud with a cross when offline. The words are in the tooltip.
const TEXT: Record<SyncStatus, string> = {
  local: "Saved on this device",
  saved: "Saved",
  saving: "Saving",
  offline: "Offline. Your work saves when you're back.",
  error: "Not saving. Log in again to keep saving.",
};

export function SyncIndicator({ status }: { status: SyncStatus }) {
  return (
    <span className={[styles.sync, styles[status]].join(" ")} title={TEXT[status]} role="status" aria-live="polite">
      {status === "saving" ? (
        <PixelIcon name="loader" animate />
      ) : status === "offline" || status === "error" ? (
        <PixelIcon name="offline" />
      ) : (
        <PixelIcon name="saved" />
      )}
      <span className="visually-hidden">{TEXT[status]}</span>
    </span>
  );
}
