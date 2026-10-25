"use client";

import { useEffect, useState } from "react";
import type { Access } from "./server/entitlements";

export interface PlanStatus {
  signedIn: boolean;
  access: Access;
  provider: string;
  onSale: boolean;
}

let cached: Promise<PlanStatus> | null = null;

/** This learner's plan, fetched once per page load (refresh() after a purchase). */
export function usePlan(): { status: PlanStatus | null; refresh: () => void } {
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!cached || n > 0) cached = fetch("/api/billing/status", { cache: "no-store" }).then((r) => r.json() as Promise<PlanStatus>);
    let live = true;
    void cached.then((s) => live && setStatus(s)).catch(() => {});
    return () => {
      live = false;
    };
  }, [n]);
  return { status, refresh: () => setN((x) => x + 1) };
}
