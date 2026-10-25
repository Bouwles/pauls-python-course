import { forwardRef } from "react";
import { PixelIcon, type IconName } from "./PixelIcon";
import styles from "./Button.module.css";

// Chunky game buttons with a real press (REDESIGN.md 4.1).
//   primary: lamp, for the main action (Check)
//   go:      kelp, for Run only
//   danger:  brick
//   quiet:   night-3, for everything else (Reset, History, Back...)
// "secondary" is kept as another name for quiet.
type Variant = "primary" | "go" | "danger" | "quiet" | "secondary";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  pixelIcon?: IconName;
  /** Kept for callers; keyboard hints live in the Keys sheet and the tooltip, never inside the button. */
  shortcut?: string;
  /** For aria-keyshortcuts, e.g. "Control+Enter Meta+Enter". */
  keys?: string;
  /** Locked is not disabled: a normal quiet button with a padlock, explaining what unlocks it. */
  locked?: string | false;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "quiet", size = "md", icon, pixelIcon, shortcut, keys, locked, className, children, title, disabled, onClick, ...rest },
  ref,
) {
  const v = variant === "secondary" ? "quiet" : variant;
  const tip = locked || [title, shortcut ? `(${shortcut})` : ""].filter(Boolean).join(" ") || undefined;
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
      {locked ? <PixelIcon name="lock" /> : pixelIcon ? <PixelIcon name={pixelIcon} /> : icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
      {locked ? <span className="visually-hidden">(locked: {locked})</span> : null}
    </button>
  );
});

export function LinkButton({ variant = "quiet", size = "md", pixelIcon, className, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: "sm" | "md"; pixelIcon?: IconName }) {
  const v = variant === "secondary" ? "quiet" : variant;
  return (
    <a className={[styles.button, styles[v], styles[size], className].filter(Boolean).join(" ")} {...rest}>
      {pixelIcon ? <PixelIcon name={pixelIcon} /> : null}
      <span>{children}</span>
    </a>
  );
}
