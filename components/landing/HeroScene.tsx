"use client";

import { useEffect, useState } from "react";
import { SceneCanvas, type Actor } from "../world/SceneCanvas";
import { loadIndex } from "../world/sprites";

// The harbour at dusk, if it's been drawn; the workshop at night until then.
const PREFERRED = ["harbour-dusk", "harbour", "pier"];

export function HeroScene() {
  const [scene, setScene] = useState<{ name: string; marks: Record<string, number[]> } | null>(null);
  const [sprites, setSprites] = useState<Set<string>>(new Set());
  useEffect(() => {
    void loadIndex().then((i) => {
      const name = PREFERRED.find((s) => i.scenes[s]) ?? "workshop-night";
      setScene({ name, marks: i.scenes[name]?.marks ?? {} });
      setSprites(new Set(Object.keys(i.sprites)));
    });
  }, []);
  if (!scene) return <div style={{ aspectRatio: "16 / 9", width: "100%" }} />;
  const inWorkshop = scene.name.startsWith("workshop");
  const actors: Actor[] = inWorkshop
    ? [
        { key: "moss", sprite: "moss", anim: "radio", at: "moss" },
        { key: "dennis", sprite: "dennis", anim: "idle", at: "dennis" },
        { key: "pip", sprite: "pip", anim: "idle", at: "pip", flip: true },
      ]
    : Object.keys(scene.marks)
        .filter((m) => /^gull-\d+$/.test(m) && sprites.has("b-gull"))
        .map((m) => ({ key: m, sprite: "b-gull", anim: "fly", at: m }));
  return (
    <SceneCanvas
      scene={scene.name}
      actors={actors}
      label={
        inWorkshop
          ? "Moss the tortoise at his workbench, fiddling with an old radio. Pip the pigeon waits by the door. Rain runs down the window."
          : "The harbour at dusk: lamps coming on along the quay, gulls over the water, and the workshop's window lit."
      }
      maxScale={4}
      minScale={1}
    />
  );
}
