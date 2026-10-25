"use client";

// A dialogue portrait (REDESIGN.md 5.1, 6.2): the character's 64x64 `portrait-<id>` sheet at a
// whole-number scale, with talking, blinking and a small idle. Until a character has a portrait
// sheet, their world sprite stands in, drawn at the biggest whole scale that fits.
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/display";
import { loadIndex, loadSheet, type Sheet } from "./sprites";

const PORTRAIT = 64;

function frameOf(sheet: Sheet, names: string[]): number {
  for (const n of names) {
    const f = sheet.meta.frames[n] ?? sheet.meta.anims[n]?.[0];
    if (f !== undefined) return f;
  }
  return 0;
}

export function CharacterPortrait({
  id,
  sprite,
  face = "neutral",
  talking = false,
  scale = 3,
  height,
  label,
}: {
  /** Character id: the sheet is `portrait-<id>`. */
  id: string;
  /** The world sprite to fall back on. */
  sprite?: string;
  face?: string;
  talking?: boolean;
  scale?: number;
  /** Crop to this many CSS pixels tall (the dialogue box can be shorter than the portrait). */
  height?: number;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [sheet, setSheet] = useState<{ sheet: Sheet; portrait: boolean } | null>(null);
  const [tick, setTick] = useState(0);
  const [blink, setBlink] = useState(false);
  const [idle, setIdle] = useState<number | null>(null);
  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  useEffect(() => {
    let cancelled = false;
    void loadIndex().then((idx) => {
      const name = idx.sprites[`portrait-${id}`] ? `portrait-${id}` : sprite && idx.sprites[sprite] ? sprite : idx.sprites[id] ? id : null;
      if (!name) return;
      void loadSheet(name).then((s) => {
        if (!cancelled) setSheet({ sheet: s, portrait: name.startsWith("portrait-") });
      });
    });
    return () => {
      cancelled = true;
    };
  }, [id, sprite]);

  // Mouth moves while the line types out.
  useEffect(() => {
    if (!talking || reduced) return;
    const t = setInterval(() => setTick((n) => n + 1), 160);
    return () => clearInterval(t);
  }, [talking, reduced]);

  // A blink every 3 to 6 seconds, and now and then the character's small idle.
  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    const next = () => {
      timer = setTimeout(
        () => {
          count += 1;
          if (count % 3 === 0) {
            setIdle(0);
            setTimeout(() => setIdle(1), 200);
            setTimeout(() => setIdle(0), 400);
            setTimeout(() => setIdle(1), 600);
            setTimeout(() => setIdle(null), 800);
          } else {
            setBlink(true);
            setTimeout(() => setBlink(false), 140);
          }
          next();
        },
        3000 + Math.random() * 3000,
      );
    };
    next();
    return () => clearTimeout(timer);
  }, [reduced]);

  const k = Math.max(1, Math.round(scale));
  const fullW = sheet ? (sheet.portrait ? PORTRAIT : sheet.sheet.meta.w) * k : PORTRAIT * k;
  const fullH = sheet ? (sheet.portrait ? PORTRAIT : sheet.sheet.meta.h) * k : PORTRAIT * k;
  const shownH = Math.min(fullH, height ?? fullH);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || !sheet) return;
    const { meta, img } = sheet.sheet;
    let index: number;
    if (sheet.portrait) {
      if (talking && !reduced) index = frameOf(sheet.sheet, [tick % 2 ? "talk-2" : "talk-1", face]);
      else if (idle !== null && face === "neutral") index = frameOf(sheet.sheet, [`idle-${idle + 1}`, "neutral"]);
      else if (blink && face === "neutral") index = frameOf(sheet.sheet, ["blink", "neutral"]);
      else index = frameOf(sheet.sheet, [face, "neutral"]);
    } else {
      const anim = talking && !reduced ? meta.anims.talk : meta.anims.idle;
      index = anim?.[talking ? tick % anim.length : 0] ?? 0;
    }
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    cv.width = fullW * dpr;
    cv.height = shownH * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    // Portraits crop from the bottom (head and shoulders stay); world sprites stand on the bottom edge.
    const dy = sheet.portrait ? 0 : shownH - fullH;
    ctx.drawImage(img, index * meta.w, 0, meta.w, meta.h, 0, dy * dpr, meta.w * k * dpr, meta.h * k * dpr);
  }, [sheet, face, talking, tick, blink, idle, k, fullW, fullH, shownH, reduced]);

  return (
    <canvas
      ref={ref}
      className="pixel"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: fullW, height: shownH, display: "block" }}
    />
  );
}

/** A 16x16 head icon (`head-<id>`), at a whole-number scale. Falls back to the top of the portrait. */
export function Head({ id, sprite, scale = 2, label }: { id: string; sprite?: string; scale?: number; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const k = Math.max(1, Math.round(scale));
  useEffect(() => {
    let cancelled = false;
    void loadIndex().then(async (idx) => {
      const cv = ref.current;
      if (!cv) return;
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      cv.width = 16 * k * dpr;
      cv.height = 16 * k * dpr;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      const name = idx.sprites[`head-${id}`] ? `head-${id}` : sprite && idx.sprites[sprite] ? sprite : idx.sprites[id] ? id : null;
      if (!name) return;
      const { meta, img } = await loadSheet(name);
      if (cancelled) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (name.startsWith("head-")) {
        ctx.drawImage(img, 0, 0, 16, 16, 0, 0, 16 * k * dpr, 16 * k * dpr);
      } else {
        // World sprites face right: the head is at the top of the right-hand half.
        const f = meta.anims.idle?.[0] ?? 0;
        const sx = Math.max(0, meta.w - 16 - Math.floor((meta.w - 16) / 4));
        ctx.drawImage(img, f * meta.w + sx, 0, 16, 16, 0, 0, 16 * k * dpr, 16 * k * dpr);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, sprite, k]);
  return (
    <canvas
      ref={ref}
      className="pixel"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: 16 * k, height: 16 * k, display: "block", flex: "none" }}
    />
  );
}
