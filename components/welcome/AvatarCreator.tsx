"use client";

// Avatar creation: the learner builds their pixel self from
// parts, the way you build a character in a game. Their avatar stands large beside the choices,
// alive, and reacts to every change (a new haircut surprises them, a new top makes them proud),
// with a gesture that's different each time (lib/pixel/variety.ts). Under it stands the whole of
// them, head to toe (lib/pixel/figures.ts), trying something new with every change: a stretch, a
// dance, a book. Every part is shown on a little copy of them, so you see a choice before you
// make it. It waves when you're done (`waving`). Used on /welcome and in Settings.
import { useEffect, useId, useRef, useState } from "react";
import { useMedia } from "@/lib/useMedia";
import { prefersReducedMotion } from "@/lib/display";
import type { Expression, Pose } from "@/lib/pixel/people";
import type { FigureTag } from "@/lib/pixel/figures";
import type { GestureTag } from "@/lib/pixel/gestures";
import { pickGesture } from "@/lib/pixel/variety";
import { pickAction } from "@/lib/moments";
import { useVisit } from "@/lib/useVisit";
import { PixelFigure } from "../art/PixelFigure";
import { ACCESSORIES, AVATAR_COLOURS, BROWS, FACES, HAIR_COLOURS, HAIR_STYLES, SKIN_TONES, TOP_COLOURS, TOPS, type AvatarLook, type AvatarOption } from "@/lib/avatar";
import { PixelPerson } from "../art/PixelPerson";
import { Tabs } from "../ui/Tabs";
import styles from "./AvatarCreator.module.css";

const an = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const labelOf = (list: AvatarOption[], id: string) => list.find((o) => o.id === id)?.label ?? id;

const HAIR: Record<string, (c: string) => string> = {
  "short-straight": (c) => `short straight ${c} hair`,
  "short-curly": (c) => `short ${c} curls`,
  buzz: (c) => `${an(c)} ${c} buzz cut`,
  "wavy-medium": (c) => `wavy, medium-length ${c} hair`,
  "long-straight": (c) => `long straight ${c} hair`,
  "long-wavy": (c) => `long wavy ${c} hair`,
  "curly-medium": (c) => `curly, medium-length ${c} hair`,
  afro: (c) => `${an(c)} ${c} afro`,
  braids: (c) => `${c} braids`,
  locs: (c) => `${c} locs`,
  bun: (c) => `${c} hair in a bun`,
  ponytail: (c) => `${c} hair in a ponytail`,
  bob: (c) => `${an(c)} ${c} bob`,
  shaved: () => "a shaved head",
  hijab: () => "a hijab",
  turban: () => "a turban",
  beanie: () => "a beanie",
};
const FACE: Record<string, string> = { oval: "an oval face", round: "a round face", square: "a square face", long: "a long face", heart: "a heart-shaped face" };
const TOP_COLOUR_WORD: Record<string, string> = { sun: "yellow" };
const ACCESSORY: Record<string, string> = { headphones: "headphones", cap: "a cap", scarf: "a scarf" };

/** The chosen parts in plain words: "Long wavy dark brown hair, an oval face, glasses and a teal hoodie." */
export function describeAvatar(look: AvatarLook): string {
  const hairColour = labelOf(HAIR_COLOURS, look.hairColour).toLowerCase();
  const topColour = TOP_COLOUR_WORD[look.topColour] ?? labelOf(TOP_COLOURS, look.topColour).toLowerCase();
  const top = labelOf(TOPS, look.top).toLowerCase();
  const parts = [
    (HAIR[look.hair] ?? ((c: string) => `${c} hair`))(hairColour),
    FACE[look.face] ?? `${an(look.face)} ${look.face} face`,
    `${labelOf(BROWS, look.brows).toLowerCase()} eyebrows`,
    look.glasses ? "glasses" : null,
    look.facialHair ? "facial hair" : null,
    `${an(topColour)} ${topColour} ${top}`,
    ACCESSORY[look.accessory] ?? null,
  ].filter((p): p is string => Boolean(p));
  const text = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0]!;
  return `${cap(text)}.`;
}

type Tab = "face" | "hair" | "clothes" | "extras" | "colour";
const TABS: { id: Tab; label: string }[] = [
  { id: "face", label: "Face" },
  { id: "hair", label: "Hair" },
  { id: "clothes", label: "Clothes" },
  { id: "extras", label: "Extras" },
  { id: "colour", label: "Colour" },
];

/**
 * How the avatar takes a change to each part: a face, what the gesture is for, and what their
 * whole self tries next.
 */
const REACT: Partial<Record<keyof AvatarLook, { face: Expression; tags: GestureTag[]; try: FigureTag[] }>> = {
  colour: { face: "laughing", tags: ["celebrate", "approve"], try: ["celebrate", "greet"] },
  face: { face: "thinking", tags: ["think"], try: ["think", "talk"] },
  skin: { face: "pleased", tags: ["approve", "idle"], try: ["greet", "idle"] },
  brows: { face: "surprised", tags: ["surprise"], try: ["think", "talk"] },
  facialHair: { face: "proud", tags: ["approve", "tease"], try: ["think", "rest"] },
  hair: { face: "surprised", tags: ["surprise", "celebrate"], try: ["celebrate", "rest"] },
  hairColour: { face: "laughing", tags: ["celebrate", "approve"], try: ["celebrate", "hobby"] },
  top: { face: "proud", tags: ["approve", "celebrate"], try: ["celebrate", "greet"] },
  topColour: { face: "pleased", tags: ["approve"], try: ["rest", "idle"] },
  glasses: { face: "pleased", tags: ["explain", "think"], try: ["sit", "work"] },
  accessory: { face: "pleased", tags: ["celebrate", "idle"], try: ["hobby", "celebrate"] },
};

/** What their whole self can try on the spot: anything that doesn't need walking somewhere. */
const ON_THE_SPOT = ["stand", "sit", "type", "read", "wave", "cheer", "dance", "clap", "talk", "point", "think", "shrug", "stretch", "phone", "drink", "drone", "easel", "clipboard", "guitar", "chalkboard"];

/**
 * One set of choices over real radios, so arrow keys work. Parts show on a small copy of the
 * avatar wearing them (`part`); colours are pixel swatches.
 */
function Group({
  legend,
  name,
  options,
  value,
  onChange,
  look,
  part,
  crop = "head",
}: {
  legend: string;
  name: string;
  options: AvatarOption[];
  value: string;
  onChange: (id: string) => void;
  look: AvatarLook;
  /** How this option changes the avatar, to draw it on the tile; colours have none. */
  part?: (id: string) => Partial<AvatarLook>;
  crop?: "head" | "bust";
}) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        {legend}
        <span className={styles.current}>{labelOf(options, value)}</span>
      </legend>
      <div className={part ? styles.parts : styles.swatches}>
        {options.map((o) => (
          <label key={o.id} className={[part ? styles.part : styles.swatch, value === o.id ? styles.on : ""].join(" ")} title={part ? undefined : o.label}>
            <input type="radio" className="visually-hidden" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
            {part ? (
              <>
                <span className={[styles.partTile, crop === "bust" ? styles.partBust : ""].join(" ")} style={{ background: look.colour }} aria-hidden="true">
                  <PixelPerson avatar={{ ...look, ...part(o.id) }} crop={crop} scale={2} animate={false} />
                </span>
                <span className={styles.partName}>{o.label}</span>
              </>
            ) : (
              <>
                <span className={styles.chipColour} style={{ background: o.hex }} aria-hidden="true" />
                <span className="visually-hidden">{o.label}</span>
              </>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const YES_NO = (no: string, yes: string): AvatarOption[] => [
  { id: "no", label: no },
  { id: "yes", label: yes },
];

export function AvatarCreator({ look, name, onChange, waving = false }: { look: AvatarLook; name: string; onChange: (l: AvatarLook) => void; waving?: boolean }) {
  const id = useId();
  const [tab, setTab] = useState<Tab>("face");
  const [reaction, setReaction] = useState<{ face: Expression; pose: Pose } | null>(null);
  const [tries, setTries] = useState<{ action: string; n: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const narrow = useMedia("(max-width: 860px)");
  const visit = useVisit();
  const prefix = `${id}-avatar`;
  const panel = (t: Tab) => ({ role: "tabpanel", id: `${prefix}-${t}-panel`, "aria-labelledby": `${prefix}-${t}`, hidden: tab !== t, className: styles.panel });

  const set = (patch: Partial<AvatarLook>) => {
    onChange({ ...look, ...patch });
    const key = Object.keys(patch)[0] as keyof AvatarLook;
    const r = REACT[key];
    if (!r) return;
    const n = (tries?.n ?? 0) + 1;
    const seed = `avatar|${visit}|${n}|${key}|${String(patch[key])}`;
    setReaction({ face: r.face, pose: pickGesture({ tags: r.tags, face: r.face, seed, avoid: [reaction?.pose] }) });
    setTries({ action: pickAction({ tags: r.try, seed, avoid: [tries?.action], only: ON_THE_SPOT }), n });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setReaction(null), prefersReducedMotion() ? 2400 : 1600);
  };
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const mood = waving ? { face: "pleased" as Expression, pose: "wave" as Pose } : (reaction ?? { face: "neutral" as Expression, pose: "idle" as Pose });
  // Their whole self: says hello to start with (a hello of this visit's), then tries whatever the last change suggested.
  const action = waving ? "wave" : (tries?.action ?? pickAction({ tags: ["greet", "idle"], seed: `avatar|${visit}`, only: ON_THE_SPOT }));

  return (
    <div className={styles.creator}>
      <div className={styles.preview}>
        <div className={`px-panel ${styles.stage}`} style={{ background: look.colour }}>
          <PixelPerson avatar={look} crop="bust" scale={narrow ? 3 : 4} expression={mood.face} pose={mood.pose} label={`Your avatar: ${describeAvatar(look)}`} />
        </div>
        <div className={`px-panel ${styles.whole}`} style={{ background: look.colour }} aria-hidden="true">
          <PixelFigure avatar={look} action={action} scale={2} />
        </div>
        <div className={styles.who}>
          <p className={styles.name}>{name.trim() || "You"}</p>
          <p className={styles.description} aria-live="polite">
            {describeAvatar(look)}
          </p>
        </div>
      </div>
      <div className={styles.choices}>
        <Tabs items={TABS} value={tab} onChange={(t) => setTab(t as Tab)} label="Your avatar" idPrefix={prefix} className={styles.tabs} />
        <div {...panel("face")}>
          <Group legend="Skin tone" name={`${id}-skin`} options={SKIN_TONES} value={look.skin} onChange={(v) => set({ skin: v })} look={look} />
          <Group legend="Face shape" name={`${id}-face`} options={FACES} value={look.face} onChange={(v) => set({ face: v })} look={look} part={(v) => ({ face: v })} />
          <Group legend="Eyebrows" name={`${id}-brows`} options={BROWS} value={look.brows} onChange={(v) => set({ brows: v })} look={look} part={(v) => ({ brows: v })} />
          <Group legend="Facial hair" name={`${id}-facial-hair`} options={YES_NO("None", "Facial hair")} value={look.facialHair ? "yes" : "no"} onChange={(v) => set({ facialHair: v === "yes" })} look={look} part={(v) => ({ facialHair: v === "yes" })} />
        </div>
        <div {...panel("hair")}>
          <Group legend="Hair colour" name={`${id}-hair-colour`} options={HAIR_COLOURS} value={look.hairColour} onChange={(v) => set({ hairColour: v })} look={look} />
          <Group legend="Hair" name={`${id}-hair`} options={HAIR_STYLES} value={look.hair} onChange={(v) => set({ hair: v })} look={look} part={(v) => ({ hair: v })} />
        </div>
        <div {...panel("clothes")}>
          <Group legend="Top colour" name={`${id}-top-colour`} options={TOP_COLOURS} value={look.topColour} onChange={(v) => set({ topColour: v })} look={look} />
          <Group legend="Top" name={`${id}-top`} options={TOPS} value={look.top} onChange={(v) => set({ top: v })} look={look} part={(v) => ({ top: v })} crop="bust" />
        </div>
        <div {...panel("extras")}>
          <Group legend="Glasses" name={`${id}-glasses`} options={YES_NO("None", "Glasses")} value={look.glasses ? "yes" : "no"} onChange={(v) => set({ glasses: v === "yes" })} look={look} part={(v) => ({ glasses: v === "yes" })} />
          <Group legend="Accessory" name={`${id}-accessory`} options={ACCESSORIES} value={look.accessory} onChange={(v) => set({ accessory: v })} look={look} part={(v) => ({ accessory: v })} crop="bust" />
        </div>
        <div {...panel("colour")}>
          <Group legend="Colour" name={`${id}-colour`} options={AVATAR_COLOURS} value={look.colour} onChange={(v) => set({ colour: v })} look={look} />
        </div>
      </div>
    </div>
  );
}
