"use client";

import type { SyncStatus } from "@/lib/store/sync";
import { Icon } from "./Icon";
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
        <Icon name="loader" spin />
      ) : status === "offline" || status === "error" ? (
        <Icon name="offline" />
      ) : (
        <Icon name="saved" />
      )}
      <span className="visually-hidden">{TEXT[status]}</span>
    </span>
  );
}
