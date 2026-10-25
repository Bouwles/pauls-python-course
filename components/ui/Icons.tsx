// The small status icons used across the app, now pixel icons (REDESIGN.md 3.6).
// Pass is a kelp tick, fail a brick cross, not run a fog dash.
import { PixelIcon } from "./PixelIcon";

const tint = (color: string, el: React.ReactNode) => <span style={{ color, display: "inline-flex", flex: "none" }}>{el}</span>;

export const RunIcon = () => <PixelIcon name="run" />;
export const StopIcon = () => <PixelIcon name="stop" />;
export const CheckIcon = () => <PixelIcon name="check" />;
export const PassIcon = () => tint("var(--go-text)", <PixelIcon name="tick" />);
export const FailIcon = () => tint("var(--danger-text)", <PixelIcon name="cross" />);
export const DotIcon = () => tint("var(--text-2)", <PixelIcon name="dash" />);
