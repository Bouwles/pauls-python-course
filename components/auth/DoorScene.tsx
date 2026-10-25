"use client";

import { SceneCanvas } from "../world/SceneCanvas";
import { useNight } from "../world/useNight";
import styles from "./DoorScene.module.css";

/** The workshop with an empty desk, waiting. */
export function DoorScene() {
  const night = useNight();
  return (
    <figure className={styles.figure}>
      <div className={styles.window}>
      <SceneCanvas
        scene={night ? "workshop-night" : "workshop"}
        actors={[
          { key: "moss", sprite: "moss", anim: "radio", at: "moss" },
          { key: "dennis", sprite: "dennis", anim: "idle", at: "dennis" },
        ]}
        label="The workshop. Moss is at his bench with the old radio. The desk by the terminal is empty."
        maxScale={3}
      />
      </div>
      <figcaption className={styles.caption}>The desk by the terminal is yours.</figcaption>
    </figure>
  );
}
