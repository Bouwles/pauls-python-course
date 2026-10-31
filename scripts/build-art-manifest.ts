// Writes art/manifest.json (REDESIGN-2.md 8.4): every image the illustrator delivers, built
// from the cast (lib/cast.ts), the Clocktower's floors (FLOORS), the avatar's options
// (lib/avatar.ts) and Act I's projects (content/acts). Run it when any of those change; the
// status of every image already in the manifest is kept. scripts/check-art.ts then marks
// images final as their files arrive in art/final/.
//   npx tsx scripts/build-art-manifest.ts
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { ACCESSORIES, BROWS, FACES, HAIR_STYLES, TOPS } from "../lib/avatar";
import { CAST_IDS, FLOORS } from "../lib/cast";
import { EXPRESSIONS, KINDS, ROOF_HEIGHT, fileFor, floorKey, type ArtKind, type Manifest, type ManifestEntry } from "../components/art/spec";

const root = process.cwd();
const MANIFEST = path.join(root, "art", "manifest.json");

const name = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

// What each expression looks like (REDESIGN-2.md 8.3), and the moments that belong to one
// person (8.6).
const EXPRESSION_NOTES: Record<string, string> = {
  neutral: "At rest and friendly, looking at the viewer.",
  talking: "Mid-sentence, mouth open, explaining something.",
  pleased: "Happy with what they see on the screen.",
  proud: "Something they made works, and they know it.",
  thinking: "Working something out, eyes up and to the side.",
  confused: "Brows knitted, head tilted: that output makes no sense.",
  worried: "Brows up in the middle, mouth tight: something might be about to break.",
  surprised: "Brows up, eyes wide, mouth open.",
  laughing: "A real laugh, eyes creased.",
  unimpressed: "Flat mouth, one brow lower: not convinced.",
};
const PERSONAL: Record<string, string> = {
  "paul.neutral": "An easy half-smile.",
  "paul.pleased": "A big, open grin.",
  "paul.thinking": "Pushing his backwards cap back, or rubbing the back of his neck.",
  "neil.thinking": "Pushing his black glasses up his nose, the way he does when he's debugging.",
  "neil.neutral": "A wide, friendly smile.",
  "aaesha.neutral": "A warm, closed-mouth smile.",
  "caitlin.neutral": "A calm, slightly knowing closed-mouth smile.",
  "riya.neutral": "A playful closed-mouth smile.",
  "riya.pleased": "Making a finger heart.",
  "yahya.neutral": "Cool and unbothered. His smile is rare and earned.",
  "yahya.proud": "Throwing a peace sign.",
};
const ACTIONS: Record<string, string> = {
  paul: "At a chalkboard, chalk in hand, mid-explanation.",
  neil: "Pointing at a screen, showing you the line that's wrong.",
  aaesha: "Holding a clipboard, checking something off.",
  caitlin: "Holding a game controller, leaning into it.",
  riya: "With an open laptop on one arm, typing with the other hand.",
  yahya: "Holding up a stopwatch, timing you.",
};

const FLOOR_STATES: Record<string, string> = {
  locked: "Dark. The furniture under dust sheets. No people.",
  open: "Lights on, furniture uncovered, ready for work. No people.",
  busy: "Lights on, the residents there and doing something, more props, plants grown.",
};

// Act I's Shelf objects: what to draw for each project (REDESIGN-2.md 8.3).
const SHELF_NOTES: Record<string, string> = {
  "shop-sign": "The small painted sign on the Clocktower's front door, reading \"Paul's Python Course\".",
  "bill-splitter": "A restaurant receipt from the class dinner, with the total split into equal shares in pen.",
  "reading-tracebacks": "A magnifying glass over a printed traceback, the last line circled.",
  "unit-converter": "A running shoe with a tape measure looped through the laces.",
  "password-checker": "A padlock with a paper tag listing numbered rules, most ticked.",
  "times-table-trainer": "A small chalk slate with a times table grid, one answer circled.",
  "number-guessing-game": "A sealed envelope with a big question mark, and a tally of guesses on the back.",
  "to-do-list": "A clipboard with a numbered to-do list, the top items ticked off.",
  "contact-book": "A small address book with letter tabs down the side.",
  "grade-calculator": "A marked test paper with a letter grade circled at the top.",
  "rock-paper-scissors": "A scorecard with a rock, a sheet of paper and a pair of scissors drawn on it, first to three.",
  calculator: "A chunky four-function pocket calculator.",
  "expense-tracker": "A jar of coins labelled \"Trip fund\", with a small notebook of spending beside it.",
};

/** Act I's main projects in order, read from the content (sidequests are left out). */
export function actOneProjects(): { id: string; title: string; client: string; summary: string }[] {
  const acts = path.join(root, "content", "acts");
  for (const dir of fs.readdirSync(acts).sort()) {
    const actFile = path.join(acts, dir, "act.yaml");
    if (!fs.existsSync(actFile)) continue;
    const act = parse(fs.readFileSync(actFile, "utf8")) as { number: number; jobs: string[] };
    if (act.number !== 1) continue;
    const jobs = new Map<string, { id: string; title: string; client: string; summary: string; sidequest?: boolean }>();
    for (const sub of fs.readdirSync(path.join(acts, dir))) {
      const jobFile = path.join(acts, dir, sub, "job.yaml");
      if (!fs.existsSync(jobFile)) continue;
      const job = parse(fs.readFileSync(jobFile, "utf8")) as { id: string; title: string; client: string; summary: string; sidequest?: boolean };
      jobs.set(job.id, job);
    }
    return act.jobs.map((id) => jobs.get(id)).filter((j): j is NonNullable<typeof j> => !!j && !j.sidequest);
  }
  throw new Error("Act I not found in content/acts");
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const TIME_NOTES = { night: "Night version: lit windows against a dark sky.", day: "Day version: daylight through the windows." };

/** One entry, with its fields always in the same order so the file reads well. */
function entry(id: string, kind: ArtKind, rest: Partial<ManifestEntry> & { notes: string }): ManifestEntry {
  const k = KINDS[kind];
  const { notes, size, required, character, ...what } = rest;
  return {
    id,
    file: fileFor(id),
    kind,
    character: character ?? null,
    ...what,
    size: size ?? { width: k.width, height: k.height },
    transparent: k.transparent,
    display: k.display,
    required: required ?? true,
    status: "placeholder",
    notes,
  };
}

export function buildEntries(projects: { id: string; title: string; client: string; summary: string }[]): ManifestEntry[] {
  const out: ManifestEntry[] = [];
  // The cast: ten expressions, a standing pose and an action pose each.
  for (const who of CAST_IDS) {
    for (const expression of EXPRESSIONS) {
      const own = PERSONAL[`${who}.${expression}`];
      out.push(entry(`${who}.portrait.${expression}`, "portrait", { character: who, expression, notes: `${name(who)}, ${expression}. ${EXPRESSION_NOTES[expression]}${own ? ` ${own}` : ""}` }));
    }
    if (who === "paul") out.push(entry("paul.portrait.crown", "portrait", { character: who, expression: "crown", notes: "Paul laughing, in a small gold paper crown (on top of his cap or in place of it): the final scene, when the clock runs again." }));
    out.push(entry(`${who}.body.standing`, "body", { character: who, pose: "standing", notes: `${name(who)}, full body, standing, in their everyday outfit.` }));
    out.push(entry(`${who}.body.action`, "body", { character: who, pose: "action", notes: `${name(who)}, full body. ${ACTIONS[who]}` }));
  }
  out.push(entry("group.workshop", "group", { notes: "The whole class in the Workshop: Paul at the chalkboard, Neil leaning on a desk, Aaesha, Caitlin, Riya and Yahya at their laptops, the duck on Neil's desk. School-uniform outfits are welcome here." }));

  // The Clocktower: the building, then every floor in three states, night (required) and day.
  for (const time of ["night", "day"] as const) {
    const day = time === "day";
    out.push(entry(`clocktower.shell${day ? ".day" : ""}`, "tower", { time, required: !day, notes: `The building around the floors, ${time}: the brick walls, the sky, the street and the roof line, with each floor's band left empty for its layer.` }));
  }
  for (const floor of FLOORS) {
    const key = floorKey(floor.act);
    const roof = floor.act === FLOORS.length;
    for (const state of ["locked", "open", "busy"] as const) {
      for (const time of ["night", "day"] as const) {
        const day = time === "day";
        const id = `clocktower.${key}.${state}${day ? ".day" : ""}`;
        const what = roof && state === "busy" ? "The clock running again at last, string lights on, the whole class there, Paul in his gold paper crown." : FLOOR_STATES[state];
        const clock = roof && state !== "busy" ? " The clock is stuck at 3:14." : "";
        const who = roof ? "Everyone" : floor.residents.map(name).join(" and ");
        out.push(
          entry(id, "floor", {
            character: floor.residents[0] ?? null,
            state,
            time,
            required: !day,
            size: { width: KINDS.floor.width, height: roof ? ROOF_HEIGHT : KINDS.floor.height },
            notes: `${floor.label}: ${floor.room}, Act ${ROMAN[floor.act]}. ${floor.props.charAt(0).toUpperCase()}${floor.props.slice(1)}. ${who} ${!roof && floor.residents.length > 1 ? "are" : "is"} here when it's busy. ${what}${clock} ${TIME_NOTES[time]}`,
          }),
        );
      }
    }
  }

  // The learner's avatar: parts on the same base as the cast, tinted in the app.
  for (const f of FACES) out.push(entry(`avatar.face.${f.id}`, "avatar", { part: "face", option: f.id, notes: `Face shape: ${f.label.toLowerCase()}, with ears and neck. Greyscale, for tinting to the skin tone.` }));
  out.push(entry("avatar.features", "avatar", { part: "features", notes: "Eyes, nose and a friendly closed-mouth smile, in full colour, placed for every face shape." }));
  for (const b of BROWS) out.push(entry(`avatar.brows.${b.id}`, "avatar", { part: "brows", option: b.id, notes: `Eyebrows: ${b.label.toLowerCase()}. Greyscale, tinted to the hair colour.` }));
  const BEHIND = new Set(["long-straight", "long-wavy", "braids", "locs", "afro", "ponytail", "hijab"]);
  for (const h of HAIR_STYLES) {
    const covered = ["hijab", "turban", "beanie"].includes(h.id);
    out.push(entry(`avatar.hair.${h.id}`, "avatar", { part: "hair", option: h.id, notes: `${h.label}. Greyscale, tinted to the ${covered ? "chosen fabric colour" : "hair colour"}.` }));
    if (BEHIND.has(h.id)) out.push(entry(`avatar.hair.${h.id}.back`, "avatar", { part: "hair", option: `${h.id}.back`, required: false, notes: `${h.label}: the part that falls behind the head and shoulders, drawn under the face layer.` }));
  }
  out.push(entry("avatar.facial-hair", "avatar", { part: "facial-hair", notes: "Light stubble and a short beard. Greyscale, tinted to the hair colour." }));
  out.push(entry("avatar.glasses", "avatar", { part: "glasses", notes: "Simple glasses with thin dark frames, in full colour." }));
  for (const t of TOPS) out.push(entry(`avatar.top.${t.id}`, "avatar", { part: "top", option: t.id, notes: `${t.label}, shoulders and chest. Greyscale, tinted to the top colour.` }));
  for (const a of ACCESSORIES.filter((x) => x.id !== "none")) out.push(entry(`avatar.accessory.${a.id}`, "avatar", { part: "accessory", option: a.id, notes: `${a.label}, in full colour.` }));

  // Act I's Shelf objects, and the duck.
  for (const p of projects) out.push(entry(`shelf.${p.id}`, "shelf", { character: p.client, project: p.id, notes: `${p.title}, for ${name(p.client)}. ${SHELF_NOTES[p.id] ?? `An object that stands for it: ${p.summary}`}` }));
  out.push(entry("duck", "duck", { notes: "A yellow rubber duck with a chipped beak, side on, facing right. It lives on Neil's desk and never speaks." }));
  return out;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename;
if (isMain) {
  const before = fs.existsSync(MANIFEST) ? (JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Manifest) : null;
  const status = new Map(before?.entries.map((e) => [e.id, e.status]) ?? []);
  const entries = buildEntries(actOneProjects()).map((e) => ({ ...e, status: status.get(e.id) ?? e.status }));
  const manifest: Manifest = {
    about: "Every image the illustrator delivers (REDESIGN-2.md 8). Written by scripts/build-art-manifest.ts; statuses are kept up to date by scripts/check-art.ts. See art/README.md.",
    naming: "The file name is the id with every \".\" replaced by \"_\", plus \".png\": paul.portrait.pleased is paul_portrait_pleased.png.",
    entries,
  };
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  const gone = [...status.keys()].filter((id) => !entries.some((e) => e.id === id));
  const kinds = new Map<string, number>();
  for (const e of entries) kinds.set(e.kind, (kinds.get(e.kind) ?? 0) + 1);
  console.log(`art/manifest.json: ${entries.length} images (${[...kinds].map(([k, n]) => `${n} ${KINDS[k as ArtKind].label.toLowerCase()}`).join(", ")}).`);
  if (gone.length) console.log(`No longer listed: ${gone.join(", ")}`);
}
