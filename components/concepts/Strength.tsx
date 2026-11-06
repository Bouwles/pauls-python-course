import type { Strength as Level } from "@/lib/review/strength";
import { Badge, type BadgeTone } from "../ui/Badge";

// How well an idea is holding: a small text badge, never a bar or colour alone.
// The review deck's six levels read as three words here.
const WORDS: Record<Level, { text: string; tone: BadgeTone }> = {
  unseen: { text: "Not met yet", tone: "neutral" },
  new: { text: "Getting there", tone: "progress" },
  shaky: { text: "Getting there", tone: "progress" },
  fresh: { text: "Getting there", tone: "progress" },
  steady: { text: "Solid", tone: "shipped" },
  strong: { text: "Solid", tone: "shipped" },
};

export function strengthWords(level: Level): string {
  return WORDS[level].text;
}

export function Strength({ level, className }: { level: Level; className?: string }) {
  const w = WORDS[level];
  return (
    <Badge tone={w.tone} className={className}>
      {w.text}
    </Badge>
  );
}
