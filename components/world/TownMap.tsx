"use client";

// The map of the town, drawn on one canvas. Buildings open as jobs ship;
// locked districts sit under a dither; at night the town uses its night
// frames (darker palette neighbours) and lit windows stay lit.
import { useEffect, useRef, useState } from "react";
import { BUILDINGS, DECOR, DISTRICT_AREAS, MAP_H, MAP_W, type Building } from "@/lib/world/map";
import { prefersReducedMotion } from "@/lib/display";
import { integerScale, loadSheet, type Sheet } from "./sprites";
import { PixelIcon } from "../ui/PixelIcon";
import styles from "./TownMap.module.css";

export interface HiddenDennis {
  id: string;
  x: number;
  y: number;
  /** Turns up once this district (Act) is open; the first four are there from the start. */
  act?: string;
}

/** Twelve Dennises hide around town (Section 6.1). */
export const HIDDEN_DENNISES: HiddenDennis[] = [
  { id: "dennis-lighthouse-rail", x: 362, y: 152 },
  { id: "dennis-bakery-window", x: 165, y: 148 },
  { id: "dennis-ferry-roof", x: 175, y: 187 },
  { id: "dennis-scrap-pile", x: 70, y: 113 },
  { id: "dennis-library-steps", x: 143, y: 112, act: "high-street" },
  { id: "dennis-greengrocer-crates", x: 222, y: 112, act: "high-street" },
  { id: "dennis-crane-bucket", x: 36, y: 150, act: "scrapyard" },
  { id: "dennis-weather-vane", x: 109, y: 24, act: "records-and-weather" },
  { id: "dennis-records-step", x: 88, y: 55, act: "records-and-weather" },
  { id: "dennis-dome", x: 306, y: 24, act: "observatory-lower" },
  { id: "dennis-crab-track", x: 338, y: 108, act: "crab-club" },
  { id: "dennis-jetty-end", x: 325, y: 176, act: "lighthouse" },
];

export const visibleDennis = (d: HiddenDennis, openActs: Set<string>) => !d.act || openActs.has(d.act);

interface Props {
  openBuildings: Set<string>;
  openActs: Set<string>;
  selected: string | null;
  onSelect: (b: Building) => void;
  foundDennises: Set<string>;
  onFindDennis: (id: string) => void;
  night: boolean;
  label: string;
  /** A whole-number zoom (2x, 3x, 4x). Without it the map fits its box. */
  zoom?: number;
  /** Districts that need Pro: drawn with a pixel padlock. */
  lockedActs?: Set<string>;
}

export function TownMap({ openBuildings, openActs, selected, onSelect, foundDennises, onFindDennis, night, label, zoom, lockedActs }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(2);
  const state = useRef({ openBuildings, openActs, selected, foundDennises, night });
  state.current = { openBuildings, openActs, selected, foundDennises, night };

  useEffect(() => {
    if (zoom) {
      setScale(zoom);
      return;
    }
    if (!wrap.current) return;
    const el = wrap.current;
    const fit = () => setScale(Math.max(1, integerScale(MAP_W, el.clientWidth, 3)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoom]);

  // Drag to pan when the map is bigger than its box (keyboard and wheel scroll as usual).
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    const el = wrap.current;
    if (!el || e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = wrap.current;
    if (!el || !drag.current) return;
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const reduced = prefersReducedMotion();
    const names = new Set(["map-terrain", "b-gull", "dennis-mini", ...BUILDINGS.map((b) => b.sprite), ...DECOR.map((d) => d.sprite)]);
    const sheets = new Map<string, Sheet>();
    // A building whose sprite isn't drawn yet is left off rather than stopping the map.
    void Promise.all([...names].map(async (n) => void (await loadSheet(n).then((sh) => sheets.set(n, sh)).catch(() => {})))).then(() => {
      if (cancelled) return;
      const start = performance.now();
      let last = -1;
      // A checkerboard of near-black: on-palette dimming for locked districts and for night.
      const dither = document.createElement("canvas");
      dither.width = 2;
      dither.height = 2;
      const dctx = dither.getContext("2d")!;
      dctx.fillStyle = "#1d2026";
      dctx.fillRect(0, 0, 1, 1);
      dctx.fillRect(1, 1, 1, 1);
      const draw = (now: number) => {
        raf = requestAnimationFrame(draw);
        const tick = reduced ? 0 : Math.floor((now - start) / 125);
        if (tick === last) return;
        last = tick;
        const cv = canvas.current;
        if (!cv) return;
        const dpr = window.devicePixelRatio || 1;
        const unit = Math.max(1, Math.round(scaleRef.current * dpr));
        if (cv.width !== MAP_W * unit) {
          cv.width = MAP_W * unit;
          cv.height = MAP_H * unit;
          cv.style.width = `${(MAP_W * unit) / dpr}px`;
          cv.style.height = `${(MAP_H * unit) / dpr}px`;
        }
        const ctx = cv.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(unit, 0, 0, unit, 0, 0);
        const s = state.current;
        const terrain = sheets.get("map-terrain")!;
        const tIdx = terrain.meta.frames[s.night ? "night" : "base"] ?? 0;
        ctx.drawImage(terrain.img, tIdx * MAP_W, 0, MAP_W, MAP_H, 0, 0, MAP_W, MAP_H);
        const sfx = s.night ? "-night" : "";
        for (const d of DECOR) {
          const sh = sheets.get(d.sprite)!;
          const bob = reduced ? 0 : Math.floor((tick + d.x) / 8) % 2;
          const di = sh.meta.frames[d.frame + sfx] ?? 0;
          ctx.drawImage(sh.img, di * sh.meta.w, 0, sh.meta.w, sh.meta.h, d.x, d.y + bob, sh.meta.w, sh.meta.h);
        }
        for (const b of BUILDINGS) {
          if (b.x < 0) continue;
          const sh = sheets.get(b.sprite);
          if (!sh) continue;
          const open = s.openBuildings.has(b.id);
          const idx = sh.meta.frames[(open ? "open" : "closed") + sfx] ?? 0;
          ctx.drawImage(sh.img, idx * sh.meta.w, 0, sh.meta.w, sh.meta.h, b.x, b.y, sh.meta.w, sh.meta.h);
          // Chimney smoke from open buildings.
          if (open && !reduced && ["workshop", "bakery", "pub"].includes(b.id)) {
            const cx = b.x + (b.id === "bakery" ? 4 : b.id === "pub" ? 21 : 20);
            ctx.fillStyle = s.night ? "#46515c" : "#c5c3b8";
            for (let i = 0; i < 3; i++) {
              const phase = (tick + i * 7) % 21;
              ctx.fillRect(cx + Math.floor(phase / 7) - (i % 2), b.y - 2 - phase / 2, 1, 1);
            }
          }
        }
        // Hidden Dennises, unless found.
        const dennis = sheets.get("dennis-mini")!;
        for (const d of HIDDEN_DENNISES) {
          if (s.foundDennises.has(d.id) || !visibleDennis(d, s.openActs)) continue;
          ctx.drawImage(dennis.img, 0, 0, 6, 5, d.x, d.y, 6, 5);
        }
        // Locked districts sit in shadow.
        const pattern = ctx.createPattern(dither, "repeat")!;
        ctx.fillStyle = pattern;
        for (const [act, rects] of Object.entries(DISTRICT_AREAS)) {
          if (s.openActs.has(act)) continue;
          for (const [x, y, w, h] of rects) ctx.fillRect(x, y, w, h);
        }
        // Gulls over the water.
        const gull = sheets.get("b-gull")!;
        if (!reduced) {
          for (let i = 0; i < 2; i++) {
            const gx = (tick * (1 + i) + i * 160) % (MAP_W + 40) - 20;
            const gy = 196 + i * 14 + Math.round(Math.sin((tick + i * 30) / 9) * 3);
            const f = (gull.meta.anims[s.night ? "fly-night" : "fly"] ?? [0, 1])[Math.floor(tick / 3 + i) % 2]!;
            ctx.drawImage(gull.img, f * gull.meta.w, 0, gull.meta.w, gull.meta.h, gx, gy, gull.meta.w, gull.meta.h);
          }
        }
        // The selected building gets a hairline marker.
        const sel = BUILDINGS.find((b) => b.id === s.selected);
        if (sel && sel.x >= 0 && sheets.has(sel.sprite)) {
          const sh = sheets.get(sel.sprite)!;
          ctx.fillStyle = "#d8b65a";
          ctx.fillRect(sel.x - 1, sel.y + sh.meta.h + 1, sh.meta.w + 2, 1);
        }
      };
      raf = requestAnimationFrame(draw);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrap} className={[styles.wrap, zoom ? styles.zoomed : ""].join(" ")} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className={styles.inner} style={{ width: MAP_W * scale, height: MAP_H * scale }}>
        <canvas ref={canvas} className={`pixel ${styles.canvas}`} role="img" aria-label={label} style={{ width: MAP_W * scale, height: MAP_H * scale }} />
        {BUILDINGS.filter((b) => b.x >= 0).map((b) => (
          <BuildingHotspot key={b.id} b={b} scale={scale} onSelect={onSelect} selected={selected === b.id} locked={!openActs.has(b.act)} />
        ))}
        {lockedActs
          ? Object.entries(DISTRICT_AREAS)
              .filter(([act, rects]) => lockedActs.has(act) && rects.length)
              .map(([act, rects]) => {
                const [x, y, w, h] = rects[0]!;
                return (
                  <span key={act} className={styles.padlock} style={{ left: (x + w / 2) * scale - 16, top: (y + h / 2) * scale - 16 }} aria-hidden="true">
                    <PixelIcon name="lock" />
                  </span>
                );
              })
          : null}
        {HIDDEN_DENNISES.filter((d) => !foundDennises.has(d.id) && visibleDennis(d, openActs)).map((d) => (
          <button
            key={d.id}
            className={styles.dennis}
            // At least 24px to tap (WCAG 2.2 target size), centred on the duck.
            style={{ left: d.x * scale + 3 * scale - Math.max(24, 6 * scale) / 2, top: d.y * scale + 2.5 * scale - Math.max(24, 6 * scale) / 2, width: Math.max(24, 6 * scale), height: Math.max(24, 6 * scale) }}
            onClick={() => onFindDennis(d.id)}
            aria-label="A small yellow duck"
          />
        ))}
      </div>
    </div>
  );
}

const SIZES: Record<string, [number, number]> = {};

function BuildingHotspot({ b, scale, onSelect, selected, locked }: { b: Building; scale: number; onSelect: (b: Building) => void; selected: boolean; locked: boolean }) {
  const [size, setSize] = useState<[number, number]>(SIZES[b.sprite] ?? [24, 20]);
  useEffect(() => {
    void loadSheet(b.sprite)
      .then((s) => {
        SIZES[b.sprite] = [s.meta.w, s.meta.h];
        setSize([s.meta.w, s.meta.h]);
      })
      .catch(() => {});
  }, [b.sprite]);
  return (
    <button
      className={styles.hotspot}
      style={{ left: b.x * scale, top: b.y * scale, width: size[0] * scale, height: size[1] * scale }}
      onClick={() => onSelect(b)}
      aria-pressed={selected}
      aria-label={`${b.name}${locked ? ", not open yet" : ""}`}
    />
  );
}
