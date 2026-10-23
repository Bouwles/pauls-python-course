"use client";

import { SceneCanvas } from "../world/SceneCanvas";

export function LostPip() {
  return (
    <SceneCanvas
      scene="pier"
      actors={[{ key: "pip", sprite: "pip", anim: "confused", at: "pip" }]}
      label="Pip the pigeon standing at the end of a pier in the drizzle, looking around for the way back."
      maxScale={4}
    />
  );
}
