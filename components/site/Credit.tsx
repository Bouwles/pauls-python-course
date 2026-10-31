"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { prefersReducedMotion } from "@/lib/display";
import { PixelHeart } from "./PixelHeart";
import styles from "./Credit.module.css";

/**
 * "Made with [heart] by Paul Nercessian" (REDESIGN-2.md 1): the 8x7 pixel heart at 2x, read as
 * "love". Hovering or tapping it makes it beat once. Shown in the footer and at the foot of Settings.
 */
export function Credit({ className }: { className?: string }) {
  const [beat, setBeat] = useState(false);
  const pulse = () => {
    if (beat || prefersReducedMotion()) return;
    setBeat(true);
    setTimeout(() => setBeat(false), 360);
  };
  const name = BRAND.creditUrl ? <a href={BRAND.creditUrl}>{BRAND.creditName}</a> : BRAND.creditName;
  return (
    <p className={[styles.credit, className].filter(Boolean).join(" ")}>
      Made with{" "}
      <span className={styles.heart} onPointerEnter={pulse} onClick={pulse}>
        <PixelHeart beat={beat} />
      </span>{" "}
      by {name}
    </p>
  );
}
