"use client";

// The certificate as an SVG, drawn from the shapes in art.ts. On the page it sits in a pixel
// frame; when printing it fills an A4 landscape page on its own.
import type { Shape } from "./art";
import { SHEET } from "./art";

const FAMILY = {
  display: "var(--font-display-ext), var(--font-display)",
  text: "var(--font-text)",
};

export function CertificateSvg({ shapes, label, className }: { shapes: Shape[]; label: string; className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${SHEET.width} ${SHEET.height}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      {shapes.map((s, i) =>
        s.kind === "rect" ? (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill} shapeRendering="crispEdges" />
        ) : s.kind === "pixels" ? (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.scale})`} shapeRendering="crispEdges">
            {s.runs.map((r, j) => (
              <rect key={j} x={r.x} y={r.y} width={r.n} height={1} fill={r.fill} />
            ))}
          </g>
        ) : (
          <text key={i} x={s.x} y={s.y} fontSize={s.size} fontWeight={s.weight} fill={s.fill} textAnchor={s.anchor} style={{ fontFamily: FAMILY[s.face] }}>
            {s.text}
          </text>
        ),
      )}
    </svg>
  );
}
