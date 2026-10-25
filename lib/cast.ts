// Each character's signature colour (REDESIGN.md 6.3), for their name plate in the
// dialogue box. `ink` is the plate's text colour, picked for contrast on that face.
export interface CastColour {
  face: string;
  ink: string;
}

const DARK = "var(--night-0)";
const LIGHT = "var(--chalk)";

const COLOURS: Record<string, CastColour> = {
  moss: { face: "var(--moss-green)", ink: DARK },
  pip: { face: "var(--sea)", ink: DARK },
  bea: { face: "var(--brick)", ink: DARK },
  ferro: { face: "var(--art-navy)", ink: LIGHT },
  mira: { face: "var(--art-mustard)", ink: DARK },
  dev: { face: "var(--art-navy-light)", ink: DARK },
  kat: { face: "var(--art-ochre)", ink: DARK },
  nell: { face: "var(--art-tomato-highlight)", ink: DARK },
  priya: { face: "var(--lamp)", ink: DARK },
  wendt: { face: "var(--plum)", ink: LIGHT },
  committee: { face: "var(--kelp-dark)", ink: LIGHT },
  reginald: { face: "var(--art-tomato-shadow)", ink: LIGHT },
  penhallow: { face: "var(--art-sand)", ink: DARK },
  learner: { face: "var(--sea-dark)", ink: LIGHT },
};

const OTHER: CastColour = { face: "var(--night-4)", ink: LIGHT };

export function castColour(id: string): CastColour {
  return COLOURS[id] ?? OTHER;
}

/** Dennis and the narrator speak without a name plate. */
export function hasNamePlate(id: string): boolean {
  return id !== "dennis" && id !== "narrator";
}
