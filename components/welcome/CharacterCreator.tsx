"use client";

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

export function CharacterCreator({ look, onChange, earned = new Set() }: { look: CharacterLook; onChange: (l: CharacterLook) => void; earned?: Set<string> }) {
  const set = (patch: Partial<CharacterLook>) => onChange({ ...look, ...patch });
  return (
    <div className={styles.creator}>
      <div className={styles.preview}>
        <div className={styles.stage}>
          <LearnerSprite look={look} scale={5} label={describeLook(look)} />
        </div>
        <p className={styles.caption} aria-live="polite">
          {describeLook(look)}
        </p>
      </div>
      <div className={styles.choices}>
        <fieldset className={styles.group}>
          <legend>Species</legend>
          <div className={styles.grid}>
            {SPECIES.map((s) => (
              <label key={s} className={[styles.tile, look.species === s ? styles.on : ""].join(" ")}>
                <input type="radio" name="species" value={s} checked={look.species === s} onChange={() => set({ species: s })} className="visually-hidden" />
                <LearnerSprite look={{ ...look, species: s, accessory: "none" }} scale={1} />
                <span>{SPECIES_NAMES[s]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Coat</legend>
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
        <fieldset className={styles.group}>
          <legend>Jumper</legend>
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
        <fieldset className={styles.group}>
          <legend>Something extra</legend>
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
  );
}
