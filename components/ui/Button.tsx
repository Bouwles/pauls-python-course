import { forwardRef } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Button.module.css";

// Buttons (REDESIGN-2.md 3). 40 px tall (44 on phones), 6 px corners, 15 px bold text.
//   primary:   sun, for the one main action in a region (Check, Start)
//   secondary: surface-3, for ordinary actions
//   ghost:     transparent, for tertiary actions (Reset)
//   run:       pass green with a play icon, for Run only
//   danger:    fail red
// Older names still work while screens are rebuilt: "go" is run, "quiet" is secondary.
export type ButtonVariant = "primary" | "secondary" | "ghost" | "run" | "danger" | "go" | "quiet";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "ghost",
  run: "run",
  danger: "danger",
  go: "run",
  quiet: "secondary",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  /** A 20 px icon before the label. */
  icon?: IconName | React.ReactNode;
  /** Older name for `icon`. */
  pixelIcon?: IconName;
  /** Kept for callers; keyboard hints live in the Keys sheet and the tooltip, never inside the button. */
  shortcut?: string;
  /** For aria-keyshortcuts, e.g. "Control+Enter Meta+Enter". */
  keys?: string;
  /** Locked is not disabled: a secondary button with a padlock, and a tooltip saying why. */
  locked?: string | false;
}

function renderIcon(icon: ButtonProps["icon"]) {
  if (!icon) return null;
  if (typeof icon === "string") return <Icon name={icon as IconName} />;
  return (
    <span className={styles.icon} aria-hidden="true">
      {icon}
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, pixelIcon, shortcut, keys, locked, className, children, title, disabled, onClick, ...rest },
  ref,
) {
  const v = locked ? "secondary" : VARIANT[variant];
  const tip = locked || [title, shortcut ? `(${shortcut})` : ""].filter(Boolean).join(" ") || undefined;
  const shown = icon ?? (variant === "run" || variant === "go" ? "run" : pixelIcon);
  return (
    <button
      ref={ref}
      className={[styles.button, styles[v], styles[size], locked ? styles.locked : "", className].filter(Boolean).join(" ")}
      aria-keyshortcuts={keys}
      title={tip}
      aria-disabled={locked ? true : undefined}
      disabled={disabled}
      onClick={locked ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {locked ? <Icon name="lock" /> : renderIcon(shown)}
      {children !== undefined && children !== null && children !== false ? <span>{children}</span> : null}
      {locked ? <span className="visually-hidden">(locked: {locked})</span> : null}
    </button>
  );
});

export function LinkButton({
  variant = "secondary",
  size = "md",
  icon,
  pixelIcon,
  className,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: "sm" | "md"; icon?: IconName | React.ReactNode; pixelIcon?: IconName }) {
  return (
    <a className={[styles.button, styles[VARIANT[variant]], styles[size], className].filter(Boolean).join(" ")} {...rest}>
      {renderIcon(icon ?? pixelIcon)}
      <span>{children}</span>
    </a>
  );
}
