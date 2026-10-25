"use client";

// The learner's character, drawn from layered parts at a whole-number scale.
import { useEffect, useRef } from "react";
import { composeLearner, LEARNER_H, LEARNER_W } from "@/lib/pixel/learner";
import { prefersReducedMotion } from "@/lib/display";
import type { CharacterLook } from "@/lib/store/types";
import { loadLearnerData } from "./sprites";

/** `still` draws one frame and stops: for lists with many characters at once. */
export function LearnerSprite({ look, scale = 4, pose = "stand", label, still = false }: { look: CharacterLook; scale?: number; pose?: "stand" | "sit" | "walk"; label?: string; still?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    void loadLearnerData().then((data) => {
      const cv = ref.current;
      if (!cv || cancelled) return;
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      const unit = scale * dpr;
      cv.width = LEARNER_W * unit;
      cv.height = LEARNER_H * unit;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      const off = document.createElement("canvas");
      off.width = LEARNER_W;
      off.height = LEARNER_H;
      const octx = off.getContext("2d")!;
      const seq = pose === "walk" ? ["walk-1", "walk-2", "walk-3", "walk-4"] : pose === "sit" ? ["sit-1", "sit-2"] : ["stand-1", "stand-1", "stand-1", "stand-1", "stand-1", "stand-2"];
      const reduced = still || prefersReducedMotion();
      const start = performance.now();
      let last = Number.NEGATIVE_INFINITY;
      const draw = (now: number) => {
        const t = Math.floor((now - start) / 250);
        if (t !== last) {
          last = t;
          const blink = !reduced && t % 16 === 15;
          const frame = reduced ? seq[0]! : seq[t % seq.length]!;
          octx.clearRect(0, 0, LEARNER_W, LEARNER_H);
          octx.putImageData(new ImageData(composeLearner(data, look, frame, blink ? "blink" : "open") as unknown as Uint8ClampedArray<ArrayBuffer>, LEARNER_W, LEARNER_H), 0, 0);
          ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.drawImage(off, 0, 0, cv.width, cv.height);
        }
        if (!reduced) raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [look, scale, pose, still]);
  return (
    <canvas
      ref={ref}
      className="pixel"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: LEARNER_W * scale, height: LEARNER_H * scale, display: "block" }}
    />
  );
}

/** The learner's head, 16x16 at a whole-number scale: the account avatar in the HUD. */
export function LearnerHead({ look, scale = 2, label }: { look: CharacterLook; scale?: number; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const k = Math.max(1, Math.round(scale));
  useEffect(() => {
    let cancelled = false;
    void loadLearnerData().then((data) => {
      const cv = ref.current;
      if (!cv || cancelled) return;
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      cv.width = 16 * k * dpr;
      cv.height = 16 * k * dpr;
      const off = document.createElement("canvas");
      off.width = LEARNER_W;
      off.height = LEARNER_H;
      off.getContext("2d")!.putImageData(new ImageData(composeLearner(data, look, "stand-1", "open") as unknown as Uint8ClampedArray<ArrayBuffer>, LEARNER_W, LEARNER_H), 0, 0);
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      // The head layer sits at (8, 0) in the 32x37 composite.
      ctx.drawImage(off, 8, 0, 16, 16, 0, 0, cv.width, cv.height);
    });
    return () => {
      cancelled = true;
    };
  }, [look, k]);
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
