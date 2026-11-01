"use client";

import { useEffect, useState, type RefObject } from "react";

// Whether an element is on screen, or nearly (`margin` beyond the viewport). Pixel people and rooms
// draw and animate only while they are, so a long page full of them costs little until it's read.
// Where there's no IntersectionObserver, everything counts as on screen.

export function useOnScreen(ref: RefObject<Element | null>, margin = "200px"): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver((entries) => setOn(entries.some((e) => e.isIntersecting)), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return on;
}
