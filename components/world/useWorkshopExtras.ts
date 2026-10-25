"use client";

// What has changed in the workshop because of what the learner has done:
// Moss's radio, once tuned (Act VIII), and the brass name plate on the
// learner's desk (earned at the end of Act I). Drawn over the scene as actors.
import { useEffect, useState } from "react";
import { useSession } from "@/lib/store/session";
import type { Actor } from "./SceneCanvas";

export const RADIO_FLAG = "the-radio-speaks";

export function useEarned(): Set<string> {
  const { store, ready } = useSession();
  const [earned, setEarned] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!store || !ready) return;
    const load = () =>
      void Promise.all([store.all("story_flags"), store.all("collectibles")]).then(([flags, items]) => setEarned(new Set([...flags.map((f) => f.key), ...items.map((i) => i.key)])));
    load();
    window.addEventListener("ppc:flags-changed", load);
    return () => window.removeEventListener("ppc:flags-changed", load);
  }, [store, ready]);
  return earned;
}

/** Extra actors for the workshop scene (marks in sprites/scenes/workshop*.json). */
export function workshopExtras(earned: Set<string>, scene = "workshop"): Actor[] {
  const out: Actor[] = [];
  // The 320x180 workshop has its own, bigger radio.
  if (earned.has(RADIO_FLAG)) out.push({ key: "radio", sprite: scene.startsWith("workshop2") ? "w2-radio" : "radio", anim: "playing", at: "radio" });
  if (earned.has("name-plate")) out.push({ key: "plate", sprite: "nameplate", anim: "idle", at: "plate" });
  return out;
}

/** The scene a Job is set in, with the workshop's night version after dark. The redrawn 320x180 workshop wins when it's there. */
export function sceneFor(scene: string | undefined, night: boolean, available?: Set<string>): string {
  if (scene && scene !== "workshop" && (!available || available.has(scene))) return scene;
  const base = available?.has("workshop2") ? "workshop2" : "workshop";
  return night ? `${base}-night` : base;
}

/** Characters who belong in a scene and are drawn there when the Job's dialogue includes them. */
export const SCENE_CAST: Record<string, string[]> = { "lamp-room": ["tom"] };
