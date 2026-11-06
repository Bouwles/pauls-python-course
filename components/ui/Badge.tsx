import styles from "./Badge.module.css";

// Badges: 4 px corners, 13 px bold. "Shipped", "In progress", "Locked".
export type BadgeTone = "neutral" | "shipped" | "progress" | "fail" | "info";

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")}>{children}</span>;
}
