"use client";

// One frame of a sprite at a whole-number scale, drawn crisp on a canvas.
import { useEffect, useRef, useState } from "react";
import { loadSheet, type SheetMeta } from "./sprites";

export function SpriteFrame({ sprite, frame, scale = 2, label, className, style }: { sprite: string; frame?: string; scale?: number; label?: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [meta, setMeta] = useState<SheetMeta | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadSheet(sprite)
      .then(({ meta: m, img }) => {
        const cv = ref.current;
        if (!cv || cancelled) return;
        setMeta(m);
        const k = Math.max(1, Math.round(scale));
        const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
        cv.width = m.w * k * dpr;
        cv.height = m.h * k * dpr;
        const ctx = cv.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, cv.width, cv.height);
        const index = frame !== undefined ? (m.frames[frame] ?? m.anims[frame]?.[0] ?? 0) : 0;
        ctx.drawImage(img, index * m.w, 0, m.w, m.h, 0, 0, m.w * k * dpr, m.h * k * dpr);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sprite, frame, scale]);
  const k = Math.max(1, Math.round(scale));
  return (
    <canvas
      ref={ref}
      className={["pixel", className].filter(Boolean).join(" ")}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: meta ? meta.w * k : undefined, height: meta ? meta.h * k : undefined, display: "block", ...style }}
    />
  );
}
