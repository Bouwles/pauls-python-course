"use client";

// Reports a funnel step to our own server (REDESIGN.md 9.3). No third-party trackers, no
// cookies: a random id in this browser's storage ties a visitor's steps together.
import { useEffect } from "react";
import type { FunnelEvent } from "./funnel";

const KEY = "fixwick-visitor";
const SENT = "fixwick-funnel-sent";

function visitor(): string | null {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Sends each step once per browser, which is what the funnel counts. */
export function track(event: FunnelEvent) {
  try {
    const sent = new Set<string>(JSON.parse(localStorage.getItem(SENT) ?? "[]") as string[]);
    if (sent.has(event)) return;
    sent.add(event);
    localStorage.setItem(SENT, JSON.stringify([...sent]));
  } catch {
    // Storage refused: send anyway; the server counts distinct visitors.
  }
  void fetch("/api/funnel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, visitor: visitor() }), keepalive: true }).catch(() => {});
}

/** Drop into a page to record that someone reached it. */
export function Track({ event }: { event: FunnelEvent }) {
  useEffect(() => track(event), [event]);
  return null;
}
