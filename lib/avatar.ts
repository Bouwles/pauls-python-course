// The learner's avatar (REDESIGN-2.md 7.3): a human, built from layered parts in the cast's
// illustrated style. Until the illustrated parts exist, it's drawn as the learner's initials
// on the colour they chose (components/ui/Avatar.tsx); the parts are saved now so the art can
// use them the day it arrives. Stored in the profile's `character` field, which used to hold
// the animal look; an old animal look reads as the default avatar.

export interface AvatarLook {
  kind: "human";
  /** The placeholder circle's colour, "#RRGGBB". */
  colour: string;
  face: string;
  skin: string;
  hair: string;
  hairColour: string;
  brows: string;
  glasses: boolean;
  facialHair: boolean;
  top: string;
  topColour: string;
  accessory: string;
}

export interface AvatarOption {
  id: string;
  label: string;
  /** A swatch for colour options. */
  hex?: string;
}

export const AVATAR_COLOURS: AvatarOption[] = [
  { id: "#FFB627", label: "Sun", hex: "#FFB627" },
  { id: "#1FB5A8", label: "Teal", hex: "#1FB5A8" },
  { id: "#FF7A6B", label: "Coral", hex: "#FF7A6B" },
  { id: "#8C6BF2", label: "Violet", hex: "#8C6BF2" },
  { id: "#4CC36F", label: "Leaf", hex: "#4CC36F" },
  { id: "#3B6FD8", label: "Blue", hex: "#3B6FD8" },
  { id: "#F29E6D", label: "Apricot", hex: "#F29E6D" },
  { id: "#E86FA8", label: "Rose", hex: "#E86FA8" },
  { id: "#7FA6F0", label: "Sky", hex: "#7FA6F0" },
  { id: "#A4ABB8", label: "Slate", hex: "#A4ABB8" },
];

export const FACES: AvatarOption[] = [
  { id: "oval", label: "Oval" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "long", label: "Long" },
  { id: "heart", label: "Heart" },
];

// A wide, inclusive range of skin tones, light to deep, warm and cool undertones.
export const SKIN_TONES: AvatarOption[] = [
  { id: "s1", label: "Skin tone 1", hex: "#F9DCC4" },
  { id: "s2", label: "Skin tone 2", hex: "#F3CFB3" },
  { id: "s3", label: "Skin tone 3", hex: "#EBC0A0" },
  { id: "s4", label: "Skin tone 4", hex: "#E0AC86" },
  { id: "s5", label: "Skin tone 5", hex: "#D49A72" },
  { id: "s6", label: "Skin tone 6", hex: "#C68863" },
  { id: "s7", label: "Skin tone 7", hex: "#B57552" },
  { id: "s8", label: "Skin tone 8", hex: "#A06446" },
  { id: "s9", label: "Skin tone 9", hex: "#8A5239" },
  { id: "s10", label: "Skin tone 10", hex: "#72412D" },
  { id: "s11", label: "Skin tone 11", hex: "#5C3323" },
  { id: "s12", label: "Skin tone 12", hex: "#46271B" },
  { id: "s13", label: "Skin tone 13", hex: "#E8B98F" },
  { id: "s14", label: "Skin tone 14", hex: "#9C6B4E" },
];

// Including covered options: a hijab, a turban and a beanie.
export const HAIR_STYLES: AvatarOption[] = [
  { id: "short-straight", label: "Short and straight" },
  { id: "short-curly", label: "Short curls" },
  { id: "buzz", label: "Buzz cut" },
  { id: "wavy-medium", label: "Wavy, medium length" },
  { id: "long-straight", label: "Long and straight" },
  { id: "long-wavy", label: "Long and wavy" },
  { id: "curly-medium", label: "Curly, medium length" },
  { id: "afro", label: "Afro" },
  { id: "braids", label: "Braids" },
  { id: "locs", label: "Locs" },
  { id: "bun", label: "Bun" },
  { id: "ponytail", label: "Ponytail" },
  { id: "bob", label: "Bob" },
  { id: "shaved", label: "Shaved" },
  { id: "hijab", label: "Hijab" },
  { id: "turban", label: "Turban" },
  { id: "beanie", label: "Beanie" },
];

export const HAIR_COLOURS: AvatarOption[] = [
  { id: "black", label: "Black", hex: "#1C1A1A" },
  { id: "dark-brown", label: "Dark brown", hex: "#3B2A20" },
  { id: "brown", label: "Brown", hex: "#6A4630" },
  { id: "auburn", label: "Auburn", hex: "#8A3F24" },
  { id: "blonde", label: "Blonde", hex: "#D9B26B" },
  { id: "red", label: "Red", hex: "#B5512E" },
  { id: "grey", label: "Grey", hex: "#A7A9AC" },
  { id: "dyed-blue", label: "Dyed blue", hex: "#3B6FD8" },
  { id: "dyed-pink", label: "Dyed pink", hex: "#E86FA8" },
];

export const BROWS: AvatarOption[] = [
  { id: "straight", label: "Straight" },
  { id: "arched", label: "Arched" },
  { id: "thick", label: "Thick" },
  { id: "fine", label: "Fine" },
];

export const TOPS: AvatarOption[] = [
  { id: "hoodie", label: "Hoodie" },
  { id: "jumper", label: "Jumper" },
  { id: "shirt", label: "Shirt" },
  { id: "jacket", label: "Jacket" },
];

export const TOP_COLOURS: AvatarOption[] = [
  { id: "navy", label: "Navy", hex: "#22304F" },
  { id: "charcoal", label: "Charcoal", hex: "#33363D" },
  { id: "white", label: "White", hex: "#EDEFF2" },
  { id: "sun", label: "Sun", hex: "#FFB627" },
  { id: "teal", label: "Teal", hex: "#1FB5A8" },
  { id: "coral", label: "Coral", hex: "#FF7A6B" },
  { id: "green", label: "Green", hex: "#4CC36F" },
  { id: "violet", label: "Violet", hex: "#8C6BF2" },
];

export const ACCESSORIES: AvatarOption[] = [
  { id: "none", label: "None" },
  { id: "headphones", label: "Headphones" },
  { id: "cap", label: "Cap" },
  { id: "scarf", label: "Scarf" },
];

export function defaultAvatar(): AvatarLook {
  return {
    kind: "human",
    colour: AVATAR_COLOURS[0]!.id,
    face: "oval",
    skin: "s5",
    hair: "short-straight",
    hairColour: "dark-brown",
    brows: "straight",
    glasses: false,
    facialHair: false,
    top: "hoodie",
    topColour: "navy",
    accessory: "none",
  };
}

/** Reads whatever is saved: a human avatar as it is, anything older as the default. */
export function readAvatar(saved: unknown): AvatarLook {
  if (saved && typeof saved === "object" && (saved as { kind?: unknown }).kind === "human") return { ...defaultAvatar(), ...(saved as Partial<AvatarLook>), kind: "human" };
  return defaultAvatar();
}
