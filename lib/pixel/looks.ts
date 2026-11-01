// The cast's looks, as the owner picked them in art/pixel-reference/, and the learner's avatar
// choices (lib/avatar.ts) turned into a look the same engine draws (lib/pixel/people.ts).
import { ACCESSORIES, AVATAR_COLOURS, HAIR_COLOURS, SKIN_TONES, TOP_COLOURS, readAvatar, type AvatarLook } from "../avatar";
import { mix, type HairStyle, type PersonLook } from "./people";

export const CAST_LOOKS: Record<string, PersonLook> = {
  // A black cap worn backwards, a little wavy hair under it, light stubble, a navy-and-cream varsity jacket.
  paul: {
    face: "strong",
    skin: "#e2b48c",
    skinShade: "#c9946c",
    lip: "#b0705a",
    iris: "#5a3a24",
    brow: "#2a1a12",
    browShape: "thick",
    mouth: "half",
    hairStyle: "cap-back",
    hair: "#4a2e1e",
    hairShade: "#2e1c12",
    hairLight: "#6e4a32",
    fabric: "#18181b",
    stubble: true,
    build: "regular",
    top: { kind: "varsity", body: "#22304f", sleeves: "#ece3cf", trim: "#ece3cf", shirt: "#f7f6f2" },
  },
  // Short black hair swept up, thick brows, a wide smile, black rectangular glasses, a white shirt.
  neil: {
    face: "standard",
    skin: "#dcae86",
    skinShade: "#c28f68",
    lip: "#a96752",
    iris: "#4a3020",
    brow: "#16110f",
    browShape: "thick",
    mouth: "grin",
    hairStyle: "quiff",
    hair: "#17130f",
    hairShade: "#0c0a08",
    hairLight: "#3d342c",
    glasses: "rect",
    build: "regular",
    top: { kind: "shirt", colour: "#f3f3f1" },
  },
  // Very long straight dark hair, rosy cheeks, gold earrings and necklace, a dark-brown T-shirt.
  aaesha: {
    face: "standard",
    skin: "#ebc3a0",
    skinShade: "#d4a57f",
    lip: "#bd6d64",
    iris: "#3d2518",
    brow: "#1f1512",
    browShape: "defined",
    mouth: "smile",
    hairStyle: "long-framing",
    hair: "#1e1512",
    hairShade: "#100b09",
    hairLight: "#3d2c24",
    blush: "#e59a8c",
    earrings: "#e8b440",
    necklace: "#e8b440",
    top: { kind: "tee", colour: "#4a3226" },
  },
  // Long dark-brown hair turning purple towards the ends, round black glasses, an overshirt.
  caitlin: {
    face: "standard",
    skin: "#a8724e",
    skinShade: "#8d5c3c",
    lip: "#7d4535",
    iris: "#2c1a10",
    brow: "#22160f",
    browShape: "arched",
    mouth: "smile",
    hairStyle: "long-wavy",
    hair: "#3b2618",
    hairShade: "#24170e",
    hairLight: "#5a3d28",
    ends: { colour: "#7a4cc6", shade: "#57339a", light: "#a07ce8", from: 28 },
    glasses: "round",
    top: { kind: "overshirt", outer: "#5f7a6b", inner: "#ece6da" },
  },
  // Long straight glossy black hair behind her shoulders, bold brows, a cream varsity jacket.
  riya: {
    face: "oval",
    skin: "#ddb08a",
    skinShade: "#c4936c",
    lip: "#b0605a",
    iris: "#2e1c12",
    brow: "#0f0b0a",
    browShape: "bold",
    mouth: "smirk",
    hairStyle: "long-behind",
    hair: "#0e0c0e",
    hairShade: "#050405",
    hairLight: "#3a4152",
    top: { kind: "varsity", body: "#efe7d4", sleeves: "#efe7d4", trim: "#22304f" },
  },
  // Tight dark curls, a few on his forehead, clean-shaven, a black jacket over a grey T-shirt.
  yahya: {
    face: "strong",
    skin: "#d8a982",
    skinShade: "#bd8b64",
    lip: "#a0624e",
    iris: "#2a1a11",
    brow: "#141010",
    browShape: "straight",
    mouth: "flat",
    hairStyle: "curls-fringe",
    hair: "#141112",
    hairShade: "#0a0809",
    hairLight: "#3d3537",
    build: "regular",
    top: { kind: "jacket", outer: "#1b1c21", inner: "#94979d" },
  },
};

const HAIR_STYLE: Record<string, HairStyle> = {
  "short-straight": "short-straight",
  "short-curly": "short-curly",
  buzz: "buzz",
  "wavy-medium": "wavy-medium",
  "long-straight": "long-framing",
  "long-wavy": "long-wavy",
  "curly-medium": "curly-medium",
  afro: "afro",
  braids: "braids",
  locs: "locs",
  bun: "bun",
  ponytail: "ponytail",
  bob: "bob",
  shaved: "shaved",
  hijab: "hijab",
  turban: "turban",
  beanie: "beanie",
};

const hexOf = (list: { id: string; hex?: string }[], id: string, fallback: string) => list.find((o) => o.id === id)?.hex ?? fallback;

/** The learner's avatar as a pixel person. Old animal looks read as the default avatar. */
export function avatarToLook(saved: unknown): PersonLook {
  const a: AvatarLook = readAvatar(saved);
  const skin = hexOf(SKIN_TONES, a.skin, "#d49a72");
  const hair = hexOf(HAIR_COLOURS, a.hairColour, "#3b2a20");
  const top = hexOf(TOP_COLOURS, a.topColour, "#22304f");
  const pale = ["blonde", "grey", "dyed-pink"].includes(a.hairColour);
  const fabric = a.hair === "hijab" || a.hair === "turban" || a.hair === "beanie" ? mix(top, "#ffffff", 0.18) : mix(top, "#ffffff", 0.3);
  const face = (["oval", "round", "square", "long", "heart"].includes(a.face) ? a.face : "oval") as PersonLook["face"];
  return {
    face,
    skin,
    skinShade: mix(skin, "#000000", 0.12),
    lip: mix(skin, "#8a3434", 0.35),
    iris: "#3a2418",
    brow: pale ? mix(hair, "#2a1a12", 0.55) : mix(hair, "#000000", 0.3),
    browShape: (["straight", "arched", "thick", "fine"].includes(a.brows) ? a.brows : "straight") as PersonLook["browShape"],
    mouth: "smile",
    hairStyle: HAIR_STYLE[a.hair] ?? "short-straight",
    hair,
    hairShade: mix(hair, "#000000", 0.45),
    hairLight: mix(hair, "#ffffff", 0.25),
    fabric,
    glasses: a.glasses ? "round" : null,
    stubble: a.facialHair,
    accessory: (ACCESSORIES.some((o) => o.id === a.accessory) ? a.accessory : "none") as PersonLook["accessory"],
    top: a.top === "jacket" ? { kind: "jacket", outer: top, inner: "#e9e6df" } : a.top === "shirt" ? { kind: "shirt", colour: top } : a.top === "jumper" ? { kind: "jumper", colour: top } : { kind: "hoodie", colour: top },
  };
}

/** The colour behind a learner's avatar: the one they chose. */
export function avatarBackground(saved: unknown): string {
  const a = readAvatar(saved);
  return AVATAR_COLOURS.find((o) => o.id === a.colour)?.hex ?? AVATAR_COLOURS[0]!.hex!;
}
