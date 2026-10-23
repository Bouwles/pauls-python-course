"use client";

import type { SyncStatus } from "@/lib/store/sync";
import styles from "./SyncIndicator.module.css";

const TEXT: Record<SyncStatus, string> = {
  local: "Saved on this device",
  saved: "Saved",
  saving: "Saving",
  offline: "Offline. Will save when you're back.",
  error: "Not saving. Log in again to keep saving.",
};

export function SyncIndicator({ status }: { status: SyncStatus }) {
  return (
    <span className={[styles.sync, styles[status]].join(" ")} role="status" aria-live="polite">
      {TEXT[status]}
    </span>
  );
}
