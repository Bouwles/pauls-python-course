// The small status icons used across the app: pass is a green tick,
// fail a red cross, not run a grey dash. Always beside words, never on their own.
import { Icon } from "./Icon";

const tint = (color: string, el: React.ReactNode) => <span style={{ color, display: "inline-flex", flex: "none" }}>{el}</span>;

export const RunIcon = () => <Icon name="run" />;
export const StopIcon = () => <Icon name="stop" />;
export const CheckIcon = () => <Icon name="check" />;
export const PassIcon = () => tint("var(--pass-text)", <Icon name="tick" />);
export const FailIcon = () => tint("var(--fail-text)", <Icon name="cross" />);
export const DotIcon = () => tint("var(--text-2)", <Icon name="dash" />);
