"use client";

import { useEffect, useRef, useState } from "react";
import { loadIndex, loadSheet } from "../world/sprites";

/** A shelf object at 3x. Objects without their own sprite yet sit in a labelled crate. */
export function ShelfObject({ id, scale = 3 }: { id: string; scale?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    void loadIndex().then((i) => setName(i.sprites[`shelf-${id}`] ? `shelf-${id}` : "shelf-crate"));
  }, [id]);
  useEffect(() => {
    if (!name) return;
    void loadSheet(name).then(({ img }) => {
      const cv = ref.current;
      if (!cv) return;
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      cv.width = 16 * scale * dpr;
      cv.height = 16 * scale * dpr;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 16, 16, 0, 0, cv.width, cv.height);
    });
  }, [name, scale]);
  return <canvas ref={ref} className="pixel" aria-hidden="true" style={{ width: 16 * scale, height: 16 * scale, display: "block" }} />;
}
