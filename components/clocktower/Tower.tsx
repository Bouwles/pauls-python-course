"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { drawTowerScene, layerRGBA, roomHeight, ROOM_W, STUCK_CLOCK as STUCK, TOWER, TOWER_W, towerLayout } from "@/lib/pixel/rooms";
import { PixelBricks } from "../art/PixelRoom";
import { LiveRoom } from "./LiveRoom";
import { FLOORS_TOP_DOWN, type FloorState } from "./floors";
import styles from "./Tower.module.css";

// The Clocktower as a pixel building: the night sky and the city behind,
// brick walls, a stone band between floors, the roof with its clock on top, and in every floor
// its room (lib/pixel/rooms.ts) in its state. The floors are passed in as list items, top floor
// first, so the same frame serves the learner's tower and the visitors' overview. Everything is
// drawn at two screen pixels to a room pixel (one on a very narrow screen), so it stays crisp.

/** The clock has said 3:14 for years. Paul keeps promising to fix it. */
export const STUCK_CLOCK = STUCK;

const ACTS = FLOORS_TOP_DOWN.map((f) => f.act);
/** The roof is open to the sky; every other floor is in brick. */
const ROOF = Math.max(...ACTS);
/** The widest the scene gets, in room pixels: the tower and a little city either side. */
const MAX_SCENE = 236;

const TowerScale = createContext<{ k: number; clock: { h: number; m: number } }>({ k: 2, clock: STUCK });

/** The width of an element, kept up to date. Null until it's measured. */
function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number | null] {
  const ref = useRef<T>(null);
  const [w, setW] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export function TowerFrame({ children, label, clock = STUCK_CLOCK, className }: { children: React.ReactNode; label: string; clock?: { h: number; m: number }; className?: string }) {
  const [box, avail] = useWidth<HTMLDivElement>();
  // Two screen pixels to a room pixel wherever the tower fits; the outline takes two each side.
  const k = avail !== null && avail - 4 < TOWER_W * 2 ? 1 : 2;
  const sceneW = avail === null ? TOWER_W : Math.max(TOWER_W, Math.min(MAX_SCENE, Math.floor((avail - 4) / k)));
  const layout = towerLayout(ACTS);
  const x0 = Math.floor((sceneW - TOWER_W) / 2);
  const sky = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = sky.current?.getContext("2d");
    if (!ctx) return;
    const { layer } = drawTowerScene(sceneW, ACTS);
    ctx.putImageData(new ImageData(layerRGBA(layer) as Uint8ClampedArray<ArrayBuffer>, layer.w, layer.h), 0, 0);
  }, [sceneW]);

  return (
    <div ref={box} className={[styles.tower, className].filter(Boolean).join(" ")}>
      <div className={styles.scene} style={{ width: sceneW * k, height: layout.height * k }}>
        <canvas ref={sky} width={sceneW} height={layout.height} className={styles.sky} aria-hidden="true" />
        <TowerScale.Provider value={{ k, clock }}>
          <ol className={styles.floors} aria-label={label} style={{ left: (x0 + TOWER.wall) * k, top: TOWER.top * k, gap: TOWER.slab * k, width: ROOM_W * k }}>
            {children}
          </ol>
        </TowerScale.Provider>
      </div>
    </div>
  );
}

/** A floor's room inside the tower, at the tower's scale, with its name on a sign. Busy rooms are lived in (LiveRoom). */
export function FloorRoom({ act, state, sign }: { act: number; state: FloorState; sign?: React.ReactNode }) {
  const { k, clock } = useContext(TowerScale);
  return (
    <LiveRoom act={act} state={state} scale={k} clock={clock} className={styles.room}>
      {sign}
    </LiveRoom>
  );
}

/**
 * The room's name on a plate at the bottom left of the room, with a lock or a badge beside it.
 * `more` shows on the plate while its floor's button is pointed at or focused ("3 of 10
 * shipped"); the button says it to screen readers itself.
 */
export function Sign({ room, badges, sub, more }: { room: string; badges?: React.ReactNode; sub?: React.ReactNode; more?: string }) {
  return (
    <span className={styles.sign}>
      <span className={styles.signRow}>
        <span className={styles.signName}>{room}</span>
        {badges}
      </span>
      {sub ? <span className={styles.signSub}>{sub}</span> : null}
      {more ? (
        <span className={styles.signMore} aria-hidden="true">
          {more}
        </span>
      ) : null}
    </span>
  );
}

/** The scale that fits a room into a box's height (whole numbers only, at least one). */
function useFitScale(act: number, fallback = 2): [React.RefObject<HTMLSpanElement | null>, number] {
  const ref = useRef<HTMLSpanElement>(null);
  const [k, setK] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      if (h > 0) setK(Math.max(1, Math.floor(h / roomHeight(act))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [act]);
  return [ref, k];
}

/**
 * One floor seen from outside, filling its box: the tower's brick and the room in the middle at
 * the biggest whole-number scale its height allows, the room's name on its sign. With `bare`,
 * there's no sign (the side sheet's banner, under its title).
 */
export function FloorFace({ act, state, room, sub, badges, bare = false, className }: { act: number; state: FloorState; room: string; sub?: React.ReactNode; badges?: React.ReactNode; bare?: boolean; names?: Record<string, string>; className?: string }) {
  const [ref, k] = useFitScale(act);
  return (
    <span ref={ref} className={[styles.face, className].filter(Boolean).join(" ")} data-state={state}>
      {act >= ROOF ? <span className={styles.night} /> : <PixelBricks scale={k} />}
      <LiveRoom act={act} state={state} scale={k} className={styles.faceRoom}>
        {bare ? null : <Sign room={room} badges={badges} sub={sub} />}
      </LiveRoom>
    </span>
  );
}

export { styles as towerStyles };
