"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadIndex, loadSheet, type SheetMeta } from "../world/sprites";
import styles from "./SpriteReview.module.css";

type Group = "portraits" | "characters" | "heads" | "interface" | "everything";

const GROUPS: Record<Group, (name: string) => boolean> = {
  portraits: (n) => n.startsWith("portrait-"),
  heads: (n) => n.startsWith("head-"),
  characters: (n) => ["moss", "pip", "dennis", "bea", "ferro", "mira", "dev", "kat", "nell", "priya", "wendt", "committee", "reginald", "penhallow", "tom", "gwen", "agnes"].includes(n),
  interface: (n) => n.startsWith("icon-") || n.startsWith("frame-") || ["heart", "mark", "wordmark"].includes(n),
  everything: () => true,
};

/** One frame on a canvas: as drawn, or filled solid to test the silhouette. */
function Frame({ name, index, scale, silhouette }: { name: string; index: number; scale: number; silhouette: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    void loadSheet(name).then(({ meta, img }) => {
      const cv = ref.current;
      if (!cv) return;
      cv.width = meta.w * scale;
      cv.height = meta.h * scale;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, index * meta.w, 0, meta.w, meta.h, 0, 0, meta.w * scale, meta.h * scale);
      if (silhouette) {
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = getComputedStyle(cv).color;
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = "source-over";
      }
    });
  }, [name, index, scale, silhouette]);
  return <canvas ref={ref} className={`pixel ${silhouette ? styles.silhouette : ""}`} />;
}

export function SpriteReview() {
  const [sprites, setSprites] = useState<Record<string, SheetMeta>>({});
  const [group, setGroup] = useState<Group>("portraits");
  const [day, setDay] = useState(false);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    void loadIndex().then((i) => setSprites(i.sprites));
  }, []);
  const names = useMemo(() => Object.keys(sprites).filter(GROUPS[group]).filter((n) => n.includes(filter)).sort(), [sprites, group, filter]);

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <h1 className={styles.title}>Sprite review</h1>
        <div className={styles.tabs} role="radiogroup" aria-label="Group">
          {(Object.keys(GROUPS) as Group[]).map((g) => (
            <button key={g} role="radio" aria-checked={group === g} onClick={() => setGroup(g)}>
              {g}
            </button>
          ))}
        </div>
        <label className={styles.check}>
          <input type="checkbox" checked={day} onChange={(e) => setDay(e.target.checked)} /> Day background
        </label>
        <input className={styles.filter} placeholder="Filter by name" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter sprites by name" />
      </div>
      <p className={styles.note}>
        {names.length} sprites. Each frame at 1x, at 3x, and filled solid: a character should read from the silhouette alone.
      </p>
      {names.map((name) => {
        const meta = sprites[name]!;
        const frames = Object.entries(meta.frames);
        return (
          <section key={name} className={[styles.sprite, day ? styles.day : ""].join(" ")}>
            <h2 className={styles.name}>
              {name} <span>{meta.w}x{meta.h}, {frames.length} frames</span>
            </h2>
            <div className={styles.frames}>
              {frames.map(([frame, index]) => (
                <figure key={frame} className={styles.frame}>
                  <div className={styles.views}>
                    <Frame name={name} index={index} scale={1} silhouette={false} />
                    <Frame name={name} index={index} scale={3} silhouette={false} />
                    <Frame name={name} index={index} scale={1} silhouette />
                  </div>
                  <figcaption>{frame}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
