"use client";

import { SceneCanvas } from "../world/SceneCanvas";
import { useNight } from "../world/useNight";

export function HeroScene() {
  const night = useNight();
  return (
    <SceneCanvas
      scene={night ? "workshop-night" : "workshop"}
      actors={[
        { key: "moss", sprite: "moss", anim: "radio", at: "moss" },
        { key: "dennis", sprite: "dennis", anim: "idle", at: "dennis" },
        { key: "pip", sprite: "pip", anim: "idle", at: "pip", flip: true },
      ]}
      label="Moss the tortoise at his workbench, fiddling with an old radio. Pip the pigeon waits by the door. Rain runs down the window."
      maxScale={3}
    />
  );
}
