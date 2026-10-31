import styles from "./Card.module.css";

// Cards (REDESIGN-2.md 3): surface-2, 8 px corners, 20 to 24 px padding, no border in dark
// mode and a 1 px line border in light mode.
export function Card({ as: As = "div", className, children, ...rest }: { as?: "div" | "section" | "article" | "aside" | "li" } & React.HTMLAttributes<HTMLElement>) {
  return (
    <As className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </As>
  );
}

export const cardClass = styles.card;
