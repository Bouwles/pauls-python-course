"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ACCESSORIES, SPECIES } from "@/lib/pixel/learner";
import type { Accessory, CharacterLook, Species } from "@/lib/store/types";
import { LearnerSprite } from "../world/LearnerSprite";
import styles from "./CharacterCreator.module.css";
import palette from "@/palette.json";

const COAT_NAMES: Record<string, string> = { chestnut: "Chestnut", sand: "Sand", cream: "Cream", ash: "Ash", umber: "Umber", soot: "Soot" };
const JUMPER_NAMES: Record<string, string> = { brick: "Brick", ochre: "Ochre", moss: "Moss green", sea: "Sea", navy: "Navy", oat: "Oatmeal", keeper: "Keeper's coat" };
/** Jumpers earned rather than chosen (Section 7.5), and the collectible that unlocks each. */
const EARNED_JUMPERS: Record<string, string> = { keeper: "keeper-coat" };
const ACC_NAMES: Record<Accessory, string> = { none: "Nothing", scarf: "Scarf", beanie: "Beanie", glasses: "Glasses", "flat-cap": "Flat cap", headphones: "Headphones" };
const SPECIES_NAMES: Record<Species, string> = { otter: "Otter", hare: "Hare", badger: "Badger", fox: "Fox", heron: "Heron", mole: "Mole", seal: "Seal", frog: "Frog" };

const colours = palette.colours as Record<string, { hex: string }>;
const swatch = (ramp: string[]) => colours[ramp[1]!]?.hex ?? "#000";

export function describeLook(look: CharacterLook) {
  const acc = look.accessory === "none" ? "" : `, wearing ${ACC_NAMES[look.accessory].toLowerCase()}`;
  const wearing = look.jumper === "keeper" ? "a lighthouse keeper's coat" : `a ${JUMPER_NAMES[look.jumper]?.toLowerCase()} jumper`;
  return `A ${COAT_NAMES[look.coat]?.toLowerCase()} ${SPECIES_NAMES[look.species].toLowerCase()} in ${wearing}${acc}.`;
}

type Tab = "species" | "coat" | "jumper" | "extra";
const TABS: [Tab, string][] = [
  ["species", "Species"],
  ["coat", "Coat"],
  ["jumper", "Jumper"],
  ["extra", "Extras"],
];

/**
 * The character creator: the character on the workshop floor, and pixel folder tabs for each
 * choice (REDESIGN.md 4.2). Each tab holds one set of radio buttons, so choosing still works
 * with arrow keys inside a tab.
 */
export function CharacterCreator({ look, onChange, earned = new Set() }: { look: CharacterLook; onChange: (l: CharacterLook) => void; earned?: Set<string> }) {
  const set = (patch: Partial<CharacterLook>) => onChange({ ...look, ...patch });
  const [tab, setTab] = useState<Tab>("species");
  const id = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ species: null, coat: null, jumper: null, extra: null });
  // One stable look per species tile, so a parent re-rendering doesn't restart every tile's drawing.
  const { coat, jumper } = look;
  const tileLooks = useMemo(() => Object.fromEntries(SPECIES.map((sp) => [sp, { species: sp, coat, jumper, accessory: "none" as const }])) as Record<Species, CharacterLook>, [coat, jumper]);

  // Arrow keys move between tabs, as a tab list should.
  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex(([t]) => t === tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = TABS[(next + TABS.length) % TABS.length]![0];
    setTab(t);
    tabRefs.current[t]?.focus();
  };

  const current: Record<Tab, string> = {
    species: SPECIES_NAMES[look.species],
    coat: COAT_NAMES[look.coat] ?? look.coat,
    jumper: JUMPER_NAMES[look.jumper] ?? look.jumper,
    extra: ACC_NAMES[look.accessory],
  };

  return (
    <div className={styles.root}>
    <div className={styles.creator}>
      <div className={`frame-panel ${styles.preview}`}>
        <div className={styles.stage}>
          <LearnerSprite look={look} scale={5} label={describeLook(look)} />
        </div>
        <p className={styles.caption} aria-live="polite">
          {describeLook(look)}
        </p>
      </div>
      <div className={styles.choices}>
        <div className={styles.tabs} role="tablist" aria-label="Your character" onKeyDown={onTabKey}>
          {TABS.map(([t, label]) => (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[t] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t}`}
              aria-controls={`${id}-panel-${t}`}
              aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1}
              className={styles.tab}
              onClick={() => setTab(t)}
            >
              <span>{label}</span>
              <span className={styles.tabValue}>{current[t]}</span>
            </button>
          ))}
        </div>
        <div className={styles.panel}>
          <div role="tabpanel" id={`${id}-panel-species`} aria-labelledby={`${id}-tab-species`} hidden={tab !== "species"}>
            <fieldset className={styles.group}>
              <legend className="visually-hidden">Species</legend>
              <div className={styles.grid}>
                {SPECIES.map((s) => (
                  <label key={s} className={[styles.tile, look.species === s ? styles.on : ""].join(" ")}>
                    <input type="radio" name="species" value={s} checked={look.species === s} onChange={() => set({ species: s })} className="visually-hidden" />
                    <LearnerSprite look={tileLooks[s]} scale={2} />
                    <span>{SPECIES_NAMES[s]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div role="tabpanel" id={`${id}-panel-coat`} aria-labelledby={`${id}-tab-coat`} hidden={tab !== "coat"}>
            <fieldset className={styles.group}>
              <legend className="visually-hidden">Coat</legend>
              <div className={styles.swatches}>
                {Object.entries(palette.ramps.coat).map(([name, ramp]) => (
                  <label key={name} className={[styles.swatch, look.coat === name ? styles.on : ""].join(" ")} title={COAT_NAMES[name]}>
                    <input type="radio" name="coat" value={name} checked={look.coat === name} onChange={() => set({ coat: name })} className="visually-hidden" />
                    <span className={styles.chip} style={{ background: swatch(ramp) }} aria-hidden="true" />
                    <span className={styles.swatchName}>{COAT_NAMES[name]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div role="tabpanel" id={`${id}-panel-jumper`} aria-labelledby={`${id}-tab-jumper`} hidden={tab !== "jumper"}>
            <fieldset className={styles.group}>
              <legend className="visually-hidden">Jumper</legend>
              <div className={styles.swatches}>
                {Object.entries(palette.ramps.jumper)
                  .filter(([name]) => !EARNED_JUMPERS[name] || earned.has(EARNED_JUMPERS[name]!))
                  .map(([name, ramp]) => (
                    <label key={name} className={[styles.swatch, look.jumper === name ? styles.on : ""].join(" ")} title={JUMPER_NAMES[name]}>
                      <input type="radio" name="jumper" value={name} checked={look.jumper === name} onChange={() => set({ jumper: name })} className="visually-hidden" />
                      <span className={styles.chip} style={{ background: swatch(ramp) }} aria-hidden="true" />
                      <span className={styles.swatchName}>{JUMPER_NAMES[name]}</span>
                    </label>
                  ))}
              </div>
            </fieldset>
          </div>
          <div role="tabpanel" id={`${id}-panel-extra`} aria-labelledby={`${id}-tab-extra`} hidden={tab !== "extra"}>
            <fieldset className={styles.group}>
              <legend className="visually-hidden">Something extra</legend>
              <div className={styles.swatches}>
                {ACCESSORIES.map((a) => (
                  <label key={a} className={[styles.swatch, look.accessory === a ? styles.on : ""].join(" ")}>
                    <input type="radio" name="accessory" value={a} checked={look.accessory === a} onChange={() => set({ accessory: a })} className="visually-hidden" />
                    <span className={styles.swatchName}>{ACC_NAMES[a]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
