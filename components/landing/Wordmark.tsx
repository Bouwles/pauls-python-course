"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { loadIndex } from "../world/sprites";
import { SpriteFrame } from "../world/SpriteFrame";

/** The wordmark sprite at a whole-number scale; the name in the pixel face until the sprite exists. */
export function Wordmark({ scale = 4, className }: { scale?: number; className?: string }) {
  const [has, setHas] = useState<boolean | null>(null);
  useEffect(() => {
    void loadIndex().then((i) => setHas(Boolean(i.sprites.wordmark)));
  }, []);
  if (has) return <SpriteFrame sprite="wordmark" scale={scale} label={BRAND.name} className={className} />;
  return (
    <span className={className} style={{ fontFamily: "var(--font-pixel)", fontSize: 18 * Math.max(2, Math.min(4, scale - 1)), lineHeight: 1, color: "var(--lamp)" }}>
      {BRAND.name}
    </span>
  );
}
