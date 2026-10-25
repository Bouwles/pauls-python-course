"use client";

// Pixel icons (REDESIGN.md 3.6), drawn from the sprite grids as SVG so they stay
// crisp at any whole-number scale. Chalk pixels take the current text colour.
import { useEffect, useState } from "react";
import { ICONS } from "@/generated/icons";
import { prefersReducedMotion } from "@/lib/display";

export type IconName =
  | "run" | "check" | "stop" | "hint" | "history" | "reset" | "keys" | "settings" | "shelf" | "map" | "lock"
  | "tick" | "cross" | "dash" | "saved" | "offline" | "loader" | "more" | "next" | "duck" | "heart" | "mark";

export function PixelIcon({ name, scale = 2, frame, animate, label, className }: { name: IconName; scale?: number; frame?: string; animate?: boolean | string[]; label?: string; className?: string }) {
  const icon = ICONS[name];
  const [tick, setTick] = useState(0);
  const sequence = animate === true ? Object.keys(icon?.frames ?? {}) : animate || [];
  useEffect(() => {
    if (sequence.length < 2 || prefersReducedMotion()) return;
    const t = setInterval(() => setTick((n) => n + 1), 180);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence.length]);
  const size = { w: (icon?.w ?? 12) * scale, h: (icon?.h ?? 12) * scale };
  if (!icon) return <span className={className} style={{ display: "inline-block", width: size.w, height: size.h }} aria-hidden="true" />;
  const id = sequence.length > 1 ? sequence[tick % sequence.length]! : (frame ?? Object.keys(icon.frames)[0]!);
  const paths = icon.frames[id] ?? Object.values(icon.frames)[0]!;
  return (
    <svg
      className={className}
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${icon.w} ${icon.h}`}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}
