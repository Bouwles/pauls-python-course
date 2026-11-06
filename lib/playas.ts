// Playing as one of the class (the owner: "make it where you can pick who to play as"). You can be
// Paul, Neil, Aaesha, Caitlin, Riya or Yahya, or someone of your own. You learn exactly the same
// things; what changes is the story around you:
// - your own projects, your old buggy code and your Ships are yours: those lines are said by you,
//   in your picture, as "You";
// - everything else your character would say (a hint, a worked example, a reaction) is said by
//   their stand-in, since you can't give yourself a hint;
// - the others talk to you by your name, so if you're Caitlin, Riya asking "Caitlin, can you look
//   at this?" is asking you.
import type { Job, Line, Step } from "./content/types";

export const CAST_IDS = ["paul", "neil", "aaesha", "caitlin", "riya", "yahya"] as const;
export type CastId = (typeof CAST_IDS)[number];

export const isCast = (id: string | null | undefined): id is CastId => Boolean(id && (CAST_IDS as readonly string[]).includes(id));

/** Who you're playing as, from a saved setting: a cast id, or null for someone of your own. */
export const playingAs = (saved: string | null | undefined): CastId | null => (isCast(saved) ? saved : null);

/**
 * Who speaks for your character when you're them. Paul's teaching goes to Neil (his teaching
 * assistant), Neil's hints to Paul, and the classmates to the one they work most closely with.
 */
export const STAND_IN: Record<CastId, CastId> = {
  paul: "neil",
  neil: "paul",
  aaesha: "caitlin",
  caitlin: "aaesha",
  riya: "caitlin",
  yahya: "neil",
};

/** Where a line is said: "self" is your own moment (your project's brief and Ship, your old code); "other" is anyone helping you. */
export type Voice = "self" | "other";

/**
 * Who says a line written for `who`, when you're playing as `playAs`. Someone else's line is
 * theirs; your character's line is yours in your own moments, and their stand-in's otherwise.
 */
export function speakerOf(who: string, playAs: string | null | undefined, voice: Voice = "other"): string {
  if (!isCast(playAs) || who !== playAs) return who;
  return voice === "self" ? who : STAND_IN[playAs];
}

/** True when this line is yours: shown as "You", in your picture. */
export const isYou = (who: string, playAs: string | null | undefined) => isCast(playAs) && who === playAs;

/** A name to show for a speaker: "You" for yourself. */
export function displayName(who: string, name: string, playAs: string | null | undefined): string {
  return isYou(who, playAs) ? "You" : name;
}

/**
 * Two people standing in for a pair (the Arcade League's hosts): each through speakerOf, and when
 * your stand-in is already one of them, the next classmate along, so nobody appears twice.
 */
export function speakersOf(owners: string[], playAs: string | null | undefined): string[] {
  const out: string[] = [];
  for (const owner of owners) {
    let who = speakerOf(owner, playAs);
    if (out.includes(who) || (who !== owner && owners.includes(who))) who = [...SPARE].find((s) => s !== playAs && !out.includes(s) && !owners.includes(s)) ?? who;
    out.push(who);
  }
  return out;
}
/** Who steps in when the usual stand-in is already there: classmates first. */
const SPARE: CastId[] = ["riya", "caitlin", "aaesha", "yahya", "neil", "paul"];

// ---------------------------------------------------------------- a project, as it reads to you

/** The first person to speak in some lines: on a "fix my version" step, whose version it is. */
const firstSpeaker = (lines: Line[]) => lines.find((l) => l.who !== "narrator" && l.who !== "duck")?.who ?? null;

/**
 * Whose moment a step is. Yours ("self") on the brief and the Ship of a project you're the client
 * of, and on a "fix my version" step whose classmate is you; anyone else's otherwise.
 */
export function voiceFor(step: Step, job: Pick<Job, "client">, playAs: string | null | undefined): Voice {
  if (!isCast(playAs)) return "other";
  if ((step.type === "ask" || step.type === "ship") && job.client === playAs) return "self";
  if (step.type === "pips" && firstSpeaker(step.dialogue) === playAs) return "self";
  return "other";
}

/** Lines as they're said to you: each speaker through speakerOf. */
export function castLines(lines: Line[], playAs: string | null | undefined, voice: Voice = "other"): Line[] {
  if (!isCast(playAs)) return lines;
  return lines.map((l) => {
    const who = speakerOf(l.who, playAs, voice);
    return who === l.who ? l : { ...l, who };
  });
}

const first = (name: string) => name.split(" ")[0] ?? name;
const nameIn = (names: Record<string, string>, id: string) => first(names[id] ?? id.charAt(0).toUpperCase() + id.slice(1));
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A step's title that names you, as it reads to you: "Fix Caitlin's version" is "Fix your old
 * version" when you're Caitlin, and "How Paul would do it" is "How Neil would do it" when you're
 * Paul (Neil gives the worked examples in your place). Every other title is as written.
 */
export function castTitle(title: string, playAs: string | null | undefined, names: Record<string, string>): string {
  if (!isCast(playAs)) return title;
  const me = escape(nameIn(names, playAs));
  return title.replace(new RegExp(`^How ${me} would `), `How ${nameIn(names, STAND_IN[playAs])} would `).replace(new RegExp(`^Fix ${me}'s (version|code)$`), "Fix your old $1");
}

/**
 * A project as it reads to you (the rule in this file's opening comment): every line's speaker
 * through speakerOf, in your own moments or anyone else's, and the titles that name you. The steps
 * themselves, and everything you learn on them, are exactly the same.
 */
export function castJob<J extends Job>(job: J, playAs: string | null | undefined, names: Record<string, string>): J {
  if (!isCast(playAs)) return job;
  const steps = job.steps.map((step): Step => {
    const voice = voiceFor(step, job, playAs);
    const cast = { ...step, title: castTitle(step.title, playAs, names), dialogue: castLines(step.dialogue, playAs, voice) } as Step;
    if ("onPass" in cast && cast.onPass) cast.onPass = castLines([cast.onPass], playAs, voice)[0]!;
    if (cast.type === "pips") cast.dialogueAfter = castLines(cast.dialogueAfter, playAs, voice);
    return cast;
  });
  return { ...job, steps };
}
