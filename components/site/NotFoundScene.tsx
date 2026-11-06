"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { prefersReducedMotion } from "@/lib/display";
import { roomHeight, ROOM_W } from "@/lib/pixel/rooms";
import { oneOf } from "@/lib/moments";
import { useMedia } from "@/lib/useMedia";
import { useVisit } from "@/lib/useVisit";
import { useSpeaker } from "@/lib/useMe";
import { PixelRoom } from "../art/PixelRoom";
import { useLegs, Walker, type Leg } from "../clocktower/LiveRoom";
import styles from "./NotFound.module.css";

// The 404's picture: one of the Clocktower's rooms with the lights on and nobody in (a different
// room each visit), and Neil walking in from the side, head to toe (lib/pixel/figures.ts). He
// stops, looks one way, then the other, and is left thinking it over or shrugging. With reduced
// motion he's simply there, puzzled.

const ROOMS = [1, 2, 3, 4, 5, 6, 7, 8];

export function NotFoundScene({ who: given }: { who: string }) {
  // Whoever says the 404's line walks in: Neil, or Paul when you're playing as Neil.
  const who = useSpeaker(given);
  const visit = useVisit();
  const phone = useMedia("(max-width: 720px)");
  // Nobody in the room until it's known whether he may walk in, so he never appears twice.
  const [motion, setMotion] = useState<"unknown" | "still" | "live">("unknown");
  useLayoutEffect(() => setMotion(prefersReducedMotion() ? "still" : "live"), []);
  const k = phone ? 2 : 3;
  const act = oneOf(ROOMS, `404-room|${visit}`);
  const fromLeft = oneOf([true, false], `404-side|${visit}`);
  const end = oneOf(["think", "shrug"], `404-end|${visit}`);
  const legs = useMemo<Leg[]>(() => {
    const start = fromLeft ? -16 : ROOM_W + 16;
    const stop = fromLeft ? 66 : 94;
    const walk = Math.round((Math.abs(stop - start) / 16) * 880);
    const at = (action: string, facing: Leg["facing"], ms: number): Leg => ({ action, facing, from: stop, to: stop, ms });
    return [
      { action: "walk", facing: fromLeft ? "right" : "left", from: start, to: stop, ms: walk },
      at("stand", "front", 700),
      at("stand", fromLeft ? "right" : "left", 900),
      at("stand", fromLeft ? "left" : "right", 900),
      at(end, "front", 0),
    ];
  }, [fromLeft, end]);
  const now = useLegs(legs, motion === "live");
  return (
    <div className={styles.scene} aria-hidden="true">
      <PixelRoom act={act} state="open" scale={k} className={styles.room}>
        {now && motion !== "unknown" ? <Walker key={now.n} who={who} leg={now.leg} scale={k} roomHeight={roomHeight(act)} /> : null}
      </PixelRoom>
    </div>
  );
}
