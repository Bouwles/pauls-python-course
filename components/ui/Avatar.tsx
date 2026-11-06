import { PixelPerson } from "../art/PixelPerson";
import styles from "./Avatar.module.css";

// The learner's avatar (REDESIGN-2.md 7.3, REDESIGN3_PLAN.md P1): their pixel self, head and
// shoulders, on the colour they chose, or the cast member they're playing as (`who`, lib/useMe.ts). Without a saved look (old data, or a name alone) it falls
// back to their initials. Shown in the header, on the Shelf and on public pages.
export const AVATAR_COLOURS = ["#FFB627", "#1FB5A8", "#FF7A6B", "#8C6BF2", "#4CC36F", "#3B6FD8", "#F29E6D", "#E86FA8", "#7FA6F0", "#A4ABB8"] as const;

export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Dark or light text, whichever reads on `bg`. */
function inkFor(bg: string): string {
  const n = parseInt(bg.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return lum > 0.3 ? "#14171D" : "#FFFFFF";
}

export function Avatar({ name, colour = AVATAR_COLOURS[0], size = 32, look, who, className }: { name: string | null | undefined; colour?: string; size?: number; look?: unknown; who?: string; className?: string }) {
  const label = name ? `${name}'s avatar` : "Your avatar";
  if (look !== undefined || who) {
    // Whole-number scales only, so every pixel stays crisp; below 36 px the head is drawn at
    // its own size and the tile shows the middle of it.
    const k = Math.max(1, Math.floor((size - 4) / 32));
    return (
      <span className={[styles.avatar, styles.pixel, className].filter(Boolean).join(" ")} style={{ width: size, height: size, background: colour }} role="img" aria-label={label} data-who={who}>
        <PixelPerson who={who} avatar={look} crop="head" scale={k} animate={size >= 48} />
      </span>
    );
  }
  return (
    <span className={[styles.avatar, className].filter(Boolean).join(" ")} style={{ width: size, height: size, background: colour, color: inkFor(colour), fontSize: size >= 48 ? "var(--px-2)" : "var(--px-1)" }} role="img" aria-label={label}>
      <span aria-hidden="true">{initials(name)}</span>
    </span>
  );
}
