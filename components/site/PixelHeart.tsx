// The credit heart: the one pixel detail kept from the old look, an 8x7
// heart drawn at 2x. Its alt text is "love". It beats once when hovered or tapped.
const FRAMES: Record<"idle" | "beat", { fill: string; d: string }[]> = {"idle":[{"fill":"#9e3526","d":"M1 0h2v1h-2zM5 0h2v1h-2zM0 1h1v1h-1zM3 1h2v1h-2zM7 1h1v1h-1zM0 2h1v1h-1zM7 2h1v1h-1zM0 3h1v1h-1zM6 3h2v1h-2zM1 4h1v1h-1zM5 4h2v1h-2zM2 5h1v1h-1zM5 5h1v1h-1zM3 6h2v1h-2z"},{"fill":"#fff6d8","d":"M1 1h1v1h-1z"},{"fill":"#f08a5d","d":"M2 1h1v1h-1zM1 2h1v1h-1z"},{"fill":"#e0563f","d":"M5 1h2v1h-2zM2 2h5v1h-5zM1 3h5v1h-5zM2 4h3v1h-3zM3 5h2v1h-2z"}],"beat":[{"fill":"#9e3526","d":"M1 1h2v1h-2zM5 1h2v1h-2zM0 2h1v1h-1zM3 2h2v1h-2zM7 2h1v1h-1zM0 3h1v1h-1zM6 3h2v1h-2zM1 4h1v1h-1zM5 4h2v1h-2zM2 5h1v1h-1zM4 5h2v1h-2zM3 6h2v1h-2z"},{"fill":"#fff6d8","d":"M1 2h1v1h-1z"},{"fill":"#f08a5d","d":"M2 2h1v1h-1zM1 3h1v1h-1z"},{"fill":"#e0563f","d":"M5 2h2v1h-2zM2 3h4v1h-4zM2 4h3v1h-3zM3 5h1v1h-1z"}]};

export function PixelHeart({ beat = false, scale = 2 }: { beat?: boolean; scale?: number }) {
  const parts = FRAMES[beat ? "beat" : "idle"];
  return (
    <svg width={8 * scale} height={7 * scale} viewBox="0 0 8 7" shapeRendering="crispEdges" role="img" aria-label="love" focusable="false" style={{ display: "inline-block", verticalAlign: "-2px" }}>
      {parts.map((p, i) => (
        <path key={i} fill={p.fill} d={p.d} />
      ))}
    </svg>
  );
}
