"use client";

// Draws a pixel scene: background, animated characters, rain on the window.
// Whole-number scaling only, no smoothing. Still when motion is reduced.
import { useEffect, useRef, useState } from "react";
import { composeLearner, LEARNER_H, LEARNER_W, type LearnerData } from "@/lib/pixel/learner";
import { prefersReducedMotion } from "@/lib/display";
import type { CharacterLook } from "@/lib/store/types";
import { integerScale, loadLearnerData, loadScene, loadSheet, type Sheet } from "./sprites";
import styles from "./SceneCanvas.module.css";

export interface Actor {
  key: string;
  sprite?: string;
  learner?: CharacterLook;
  pose?: "stand" | "sit" | "walk";
  anim: string;
  /** A named mark in the scene, or explicit [x, y]. */
  at: string | [number, number];
  flip?: boolean;
  /** Walk in from here to `at` over `walk` seconds (the Ask: a client comes through the door). */
  from?: string | [number, number];
  walk?: number;
  /** Seconds after the scene starts before the walk begins. */
  delay?: number;
}

export interface Hotspot {
  key: string;
  at: string;
  w: number;
  h: number;
  label: string;
  onClick: () => void;
}

interface Props {
  scene: string;
  hotspots?: Hotspot[];
  actors: Actor[];
  label: string;
  maxScale?: number;
  minScale?: number;
  rain?: boolean;
  className?: string;
}

const TICK_MS = 1000 / 12;

export function SceneCanvas({ scene, actors, label, maxScale = 4, minScale = 1, rain = true, className, hotspots = [] }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(0);
  const [size, setSize] = useState<[number, number] | null>(null);
  const [marks, setMarks] = useState<Record<string, number[]>>({});
  const actorsRef = useRef(actors);
  actorsRef.current = actors;

  // Fit the canvas to its container at a whole-number scale.
  useEffect(() => {
    if (!wrap.current || !size) return;
    const el = wrap.current;
    const fit = () => setScale(Math.max(minScale, integerScale(size[0], el.clientWidth, maxScale)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size, maxScale, minScale]);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let visible = true;
    const reduced = prefersReducedMotion();
    const sheets = new Map<string, Sheet>();
    let learnerData: LearnerData | null = null;
    const learnerCache = new Map<string, HTMLCanvasElement>();

    const learnerFrame = (look: CharacterLook, bodyFrame: string, headFrame: "open" | "blink") => {
      const key = `${look.species}|${look.coat}|${look.jumper}|${look.accessory}|${bodyFrame}|${headFrame}`;
      let c = learnerCache.get(key);
      if (!c && learnerData) {
        c = document.createElement("canvas");
        c.width = LEARNER_W;
        c.height = LEARNER_H;
        const px = composeLearner(learnerData, look, bodyFrame, headFrame);
        c.getContext("2d")!.putImageData(new ImageData(px as unknown as Uint8ClampedArray<ArrayBuffer>, LEARNER_W, LEARNER_H), 0, 0);
        learnerCache.set(key, c);
      }
      return c;
    };

    (async () => {
      const s = await loadScene(scene);
      if (cancelled) return;
      setSize([s.meta.w, s.meta.h]);
      setMarks(s.meta.marks);
      const names = new Set(actorsRef.current.filter((a) => a.sprite).map((a) => a.sprite!));
      // A missing sprite leaves that actor out rather than stopping the whole scene.
      await Promise.all([...names].map((n) => loadSheet(n).then((sh) => sheets.set(n, sh)).catch(() => {})));
      if (actorsRef.current.some((a) => a.learner)) learnerData = await loadLearnerData();
      if (cancelled) return;

      const drops = Array.from({ length: 26 }, (_, i) => ({ x: (i * 37) % 97, y: (i * 53) % 61, speed: 1 + (i % 3) * 0.4 }));
      const start = performance.now();
      let last = -1;

      const draw = (now: number) => {
        raf = requestAnimationFrame(draw);
        if (!visible) return;
        const tick = reduced ? 0 : Math.floor((now - start) / TICK_MS);
        if (tick === last) return;
        last = tick;
        const cv = canvas.current;
        if (!cv) return;
        const dpr = window.devicePixelRatio || 1;
        const sc = Math.max(1, scaleRef.current);
        const unit = Math.max(1, Math.round(sc * dpr));
        const W = s.meta.w;
        const H = s.meta.h;
        if (cv.width !== W * unit || cv.height !== H * unit) {
          cv.width = W * unit;
          cv.height = H * unit;
          cv.style.width = `${(W * unit) / dpr}px`;
          cv.style.height = `${(H * unit) / dpr}px`;
        }
        const ctx = cv.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(unit, 0, 0, unit, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(s.back, 0, 0);

        // Rain on the window panes.
        const r = s.meta.marks.rain;
        if (rain && r) {
          const [rx, ry, rw, rh] = r as [number, number, number, number];
          ctx.save();
          ctx.beginPath();
          ctx.rect(rx, ry, rw, rh);
          ctx.clip();
          ctx.fillStyle = scene.includes("night") ? "#46515c" : "#90b0a2";
          for (const d of drops) {
            const y = ry + ((d.y + tick * d.speed * 2) % (rh + 6)) - 3;
            const x = rx + ((d.x + Math.floor(tick * d.speed * 0.5)) % rw);
            ctx.fillRect(x, Math.floor(y), 1, 2);
          }
          ctx.restore();
        }

        const seconds = (now - start) / 1000;
        for (const a of actorsRef.current) {
          const pos = typeof a.at === "string" ? s.meta.marks[a.at] : a.at;
          if (!pos) continue;
          let [x, y] = pos as [number, number];
          let anim = a.anim;
          const fromPos = a.from ? (typeof a.from === "string" ? s.meta.marks[a.from] : a.from) : null;
          if (fromPos && a.walk && !reduced) {
            const t = Math.max(0, Math.min(1, (seconds - (a.delay ?? 0)) / a.walk));
            if (t < 1) {
              // Whole pixels only, so the walk never lands between pixels.
              x = Math.round(fromPos[0]! + (x - fromPos[0]!) * t);
              y = Math.round(fromPos[1]! + (y - fromPos[1]!) * t);
              anim = t > 0 ? "walk" : "idle";
            }
          }
          ctx.save();
          if (a.learner) {
            const pose = a.pose ?? "stand";
            const seq = pose === "sit" ? ["sit-1", "sit-1", "sit-2", "sit-1", "sit-2", "sit-1"] : pose === "walk" ? ["walk-1", "walk-2", "walk-3", "walk-4"] : ["stand-1", "stand-1", "stand-1", "stand-1", "stand-1", "stand-2"];
            const bodyFrame = reduced ? seq[0]! : seq[Math.floor(seconds * 4) % seq.length]!;
            const blink = !reduced && Math.floor(seconds * 4) % 18 === 17;
            const img = learnerFrame(a.learner, bodyFrame, blink ? "blink" : "open");
            if (img) {
              if (a.flip) {
                ctx.translate(x + LEARNER_W, y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0);
              } else ctx.drawImage(img, x, y);
            }
          } else if (a.sprite) {
            const sh = sheets.get(a.sprite);
            if (sh) {
              const seq = sh.meta.anims[anim] ?? sh.meta.anims[a.anim] ?? sh.meta.anims.idle ?? Object.values(sh.meta.anims)[0] ?? [0];
              const idx = reduced ? seq[0]! : seq[Math.floor(seconds * sh.meta.fps) % seq.length]!;
              if (a.flip) {
                ctx.translate(x + sh.meta.w, y);
                ctx.scale(-1, 1);
                ctx.drawImage(sh.img, idx * sh.meta.w, 0, sh.meta.w, sh.meta.h, 0, 0, sh.meta.w, sh.meta.h);
              } else {
                ctx.drawImage(sh.img, idx * sh.meta.w, 0, sh.meta.w, sh.meta.h, x, y, sh.meta.w, sh.meta.h);
              }
            }
          }
          ctx.restore();
        }
        if (s.front) ctx.drawImage(s.front, 0, 0);
      };
      raf = requestAnimationFrame(draw);
    })().catch(() => {});

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting) && !document.hidden;
    });
    if (wrap.current) io.observe(wrap.current);
    const onVis = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
    // Actors are read through a ref so the loop keeps running; sprites are loaded once per scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, rain, actors.map((a) => a.sprite ?? "learner").join("|")]);

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  return (
    <div ref={wrap} className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={styles.inner} style={size && scale ? { width: size[0] * scale, height: size[1] * scale } : undefined}>
        <canvas ref={canvas} className={`pixel ${styles.canvas}`} role="img" aria-label={label} style={size && scale ? { width: size[0] * scale, height: size[1] * scale } : undefined} />
        {scale
          ? hotspots.map((h) => {
              const m = marks[h.at];
              if (!m) return null;
              return (
                <button
                  key={h.key}
                  className={styles.hotspot}
                  style={{ left: m[0]! * scale, top: m[1]! * scale, width: h.w * scale, height: h.h * scale }}
                  onClick={h.onClick}
                  aria-label={h.label}
                />
              );
            })
          : null}
      </div>
    </div>
  );
}
