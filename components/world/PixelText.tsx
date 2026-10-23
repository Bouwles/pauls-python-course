"use client";

// Name tags and signs in the 5x7 pixel font (sprites/src/font.txt).
import { useEffect, useRef } from "react";
import { loadSheet } from "./sprites";

const NAMES: Record<string, string> = { " ": "space", ".": "period", ",": "comma", "'": "apostrophe", "-": "hyphen", ":": "colon", "&": "ampersand", "?": "question" };

export function PixelText({ text, scale = 2, colour = "currentColor" }: { text: string; scale?: number; colour?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    void loadSheet("font").then(({ meta, img }) => {
      const cv = ref.current;
      if (!cv || cancelled) return;
      const chars = text.toUpperCase().split("");
      const w = chars.length * (meta.w + 1) - 1;
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      const unit = scale * dpr;
      cv.width = w * unit;
      cv.height = meta.h * unit;
      cv.style.width = `${w * scale}px`;
      cv.style.height = `${meta.h * scale}px`;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(unit, 0, 0, unit, 0, 0);
      chars.forEach((ch, i) => {
        const idx = meta.frames[NAMES[ch] ?? ch];
        if (idx === undefined) return;
        ctx.drawImage(img, idx * meta.w, 0, meta.w, meta.h, i * (meta.w + 1), 0, meta.w, meta.h);
      });
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = colour === "currentColor" ? getComputedStyle(cv).color : colour;
      ctx.fillRect(0, 0, w, meta.h);
    });
    return () => {
      cancelled = true;
    };
  }, [text, scale, colour]);
  return <canvas ref={ref} className="pixel" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }} />;
}
