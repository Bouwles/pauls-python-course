"use client";

// A portrait: the character's first idle frame, 2x at 64px and 1x when smaller, cropped to the head end.
import { useEffect, useRef } from "react";
import { loadSheet } from "./sprites";

export function Portrait({ sprite, size = 64, label }: { sprite: string; size?: number; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    loadSheet(sprite)
      .then(({ meta, img }) => {
        const cv = ref.current;
        if (!cv || cancelled) return;
        const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
        cv.width = size * dpr;
        cv.height = size * dpr;
        const ctx = cv.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        const frame = meta.anims.idle?.[0] ?? 0;
        // Whole-number scale only: 2x for full portraits, 1x for small ones.
        const k = size >= 64 ? 2 : 1;
        const cropW = Math.min(meta.w, Math.floor(size / k));
        const cropH = Math.min(meta.h, Math.floor(size / k));
        // Characters face right, so the head is at the right-hand end and the top.
        const sx = meta.w - cropW;
        const dx = Math.floor((size - cropW * k) / 2);
        const dy = size - cropH * k;
        ctx.drawImage(img, frame * meta.w + sx, 0, cropW, cropH, dx * dpr, dy * dpr, cropW * k * dpr, cropH * k * dpr);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sprite, size]);
  return <canvas ref={ref} className="pixel" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={{ width: size, height: size, display: "block" }} />;
}
