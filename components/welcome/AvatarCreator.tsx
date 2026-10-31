"use client";

// Avatar creation (REDESIGN-2.md 7.3): a human avatar built from layered parts, in the cast's
// illustrated style once the art exists. Until then the preview is the placeholder (initials on
// the chosen colour) with the chosen parts written out under it, and every choice is saved so
// the illustrated avatar can use it the day it arrives. Used on /welcome and in Settings.
import { useId, useState } from "react";
import { useMedia } from "@/lib/useMedia";
import { ACCESSORIES, AVATAR_COLOURS, BROWS, FACES, HAIR_COLOURS, HAIR_STYLES, SKIN_TONES, TOP_COLOURS, TOPS, type AvatarLook, type AvatarOption } from "@/lib/avatar";
import { Avatar } from "../ui/Avatar";
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

type Tab = "colour" | "face" | "hair" | "clothes" | "extras";
const TABS: { id: Tab; label: string }[] = [
  { id: "colour", label: "Colour" },
  { id: "face", label: "Face" },
  { id: "hair", label: "Hair" },
  { id: "clothes", label: "Clothes" },
  { id: "extras", label: "Extras" },
];

/** One set of choices: real radios under swatches or text options, so arrow keys work. */
function Group({ legend, name, options, value, onChange, swatch = false }: { legend: string; name: string; options: AvatarOption[]; value: string; onChange: (id: string) => void; swatch?: boolean }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        {legend}
        <span className={styles.current}>{labelOf(options, value)}</span>
      </legend>
      <div className={swatch ? styles.swatches : styles.chips}>
        {options.map((o) => (
          <label key={o.id} className={[swatch ? styles.swatch : styles.chip, value === o.id ? styles.on : ""].join(" ")} title={swatch ? o.label : undefined}>
            <input type="radio" className="visually-hidden" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
            {swatch ? (
              <>
                <span className={styles.chipColour} style={{ background: o.hex }} aria-hidden="true" />
                <span className="visually-hidden">{o.label}</span>
              </>
            ) : (
              <span>{o.label}</span>
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

export function AvatarCreator({ look, name, onChange }: { look: AvatarLook; name: string; onChange: (l: AvatarLook) => void }) {
  const id = useId();
  const [tab, setTab] = useState<Tab>("colour");
  const narrow = useMedia("(max-width: 860px)");
  const set = (patch: Partial<AvatarLook>) => onChange({ ...look, ...patch });
  const prefix = `${id}-avatar`;
  const panel = (t: Tab) => ({ role: "tabpanel", id: `${prefix}-${t}-panel`, "aria-labelledby": `${prefix}-${t}`, hidden: tab !== t, className: styles.panel });

  return (
    <div className={styles.creator}>
      <div className={styles.preview}>
        <Avatar name={name || "You"} colour={look.colour} size={narrow ? 88 : 152} />
        <p className={styles.description} aria-live="polite">
          {describeAvatar(look)}
        </p>
        <p className={styles.note}>The illustrated avatar is on its way. Everything you choose here is saved for it; until then, your initials stand in.</p>
      </div>
      <div className={styles.choices}>
        <Tabs items={TABS} value={tab} onChange={(t) => setTab(t as Tab)} label="Your avatar" idPrefix={prefix} className={styles.tabs} />
        <div {...panel("colour")}>
          <Group legend="Colour" name={`${id}-colour`} options={AVATAR_COLOURS} value={look.colour} onChange={(v) => set({ colour: v })} swatch />
          <p className={styles.hint}>Your initials sit on this colour in the header, on the Shelf and on your public page.</p>
        </div>
        <div {...panel("face")}>
          <Group legend="Face shape" name={`${id}-face`} options={FACES} value={look.face} onChange={(v) => set({ face: v })} />
          <Group legend="Skin tone" name={`${id}-skin`} options={SKIN_TONES} value={look.skin} onChange={(v) => set({ skin: v })} swatch />
          <Group legend="Eyebrows" name={`${id}-brows`} options={BROWS} value={look.brows} onChange={(v) => set({ brows: v })} />
          <Group legend="Facial hair" name={`${id}-facial-hair`} options={YES_NO("None", "Facial hair")} value={look.facialHair ? "yes" : "no"} onChange={(v) => set({ facialHair: v === "yes" })} />
        </div>
        <div {...panel("hair")}>
          <Group legend="Hair" name={`${id}-hair`} options={HAIR_STYLES} value={look.hair} onChange={(v) => set({ hair: v })} />
          <Group legend="Hair colour" name={`${id}-hair-colour`} options={HAIR_COLOURS} value={look.hairColour} onChange={(v) => set({ hairColour: v })} swatch />
        </div>
        <div {...panel("clothes")}>
          <Group legend="Top" name={`${id}-top`} options={TOPS} value={look.top} onChange={(v) => set({ top: v })} />
          <Group legend="Top colour" name={`${id}-top-colour`} options={TOP_COLOURS} value={look.topColour} onChange={(v) => set({ topColour: v })} swatch />
        </div>
        <div {...panel("extras")}>
          <Group legend="Glasses" name={`${id}-glasses`} options={YES_NO("None", "Glasses")} value={look.glasses ? "yes" : "no"} onChange={(v) => set({ glasses: v === "yes" })} />
          <Group legend="Accessory" name={`${id}-accessory`} options={ACCESSORIES} value={look.accessory} onChange={(v) => set({ accessory: v })} />
        </div>
      </div>
    </div>
  );
}
