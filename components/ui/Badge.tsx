import styles from "./Badge.module.css";

// Badges (REDESIGN-2.md 3): 4 px corners, 13 px bold. "Free", "Pro", "Shipped", "In progress".
export type BadgeTone = "neutral" | "free" | "pro" | "shipped" | "progress" | "fail" | "info";

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")}>{children}</span>;
}
