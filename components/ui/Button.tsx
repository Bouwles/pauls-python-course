import { forwardRef } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "quiet" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  shortcut?: string;
  /** For aria-keyshortcuts, e.g. "Control+Enter Meta+Enter". */
  keys?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, shortcut, keys, className, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={[styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ")} aria-keyshortcuts={keys} {...rest}>
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
      {shortcut ? (
        <kbd className={styles.kbd} aria-hidden="true">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
});

export function LinkButton({ variant = "secondary", size = "md", className, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <a className={[styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ")} {...rest}>
      <span>{children}</span>
    </a>
  );
}
