"use client";

import { useLayoutEffect, useState } from "react";

// A seed that differs from visit to visit, so the same screen doesn't show the same gestures
// every time (lib/pixel/variety.ts picks the same gesture for the same seed). Each page load
// starts somewhere new, and each time a component mounts on it, it gets a seed of its own.
// Empty on the server and on the first render, so the page hydrates as it was sent; the seed
// arrives before the first paint.

const LOAD = Math.floor(Math.random() * 1e9).toString(36);
let mounts = 0;

export function useVisit(): string {
  const [seed, setSeed] = useState("");
  useLayoutEffect(() => {
    mounts += 1;
    setSeed(`${LOAD}.${mounts}`);
  }, []);
  return seed;
}
