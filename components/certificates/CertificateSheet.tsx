"use client";

// The certificate as an SVG, drawn from the shapes in art.ts. On the page it sits in a pixel
// frame; when printing it fills an A4 landscape page on its own.
import type { Shape } from "./art";
import { SHEET } from "./art";

const SERIF = "var(--font-cert-serif), serif";
const FAMILY = {
  title: `var(--font-cert-title), ${SERIF}`,
  script: `var(--font-cert-script), var(--font-cert-script-ext), ${SERIF}`,
  serif: SERIF,
  italic: SERIF,
};

export function CertificateSvg({ shapes, label, className }: { shapes: Shape[]; label: string; className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${SHEET.width} ${SHEET.height}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      {shapes.map((s, i) =>
        s.kind === "rect" ? (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill} />
        ) : s.kind === "path" ? (
          <path key={i} d={s.d} fill={s.fill ?? "none"} stroke={s.stroke} strokeWidth={s.width} strokeLinejoin="round" />
        ) : (
          <text key={i} x={s.x} y={s.y} fontSize={s.size} fill={s.fill} textAnchor={s.anchor} transform={s.turn === undefined ? undefined : `rotate(${s.turn} ${s.x} ${s.y})`} style={{ fontFamily: FAMILY[s.face], fontStyle: s.face === "italic" ? "italic" : "normal", fontWeight: 400 }}>
            {s.text}
          </text>
        ),
      )}
    </svg>
  );
}
