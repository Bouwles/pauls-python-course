// The learner's avatar: a human, built from layered parts in the cast's
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
  // Added later; a save from before has none of these and reads them as the defaults.
  /** Eye colour. */
  eyes: string;
  /** The resting mouth: a smile, a grin, a smirk... */
  smile: string;
  /** "rosy" cheeks, or "none". */
  cheeks: string;
  /** With facialHair on: "stubble" or "moustache". */
  facialHairStyle: string;
  /** Long hair dyed another colour towards the ends, or "none". */
  hairEnds: string;
  /** A hat's, scarf's or headscarf's colour, or "match" for a shade of the top. */
  headwearColour: string;
  /** The second colour on a jacket, overshirt or varsity jacket (what's under it, or the sleeves). */
  topColour2: string;
  bottoms: string;
  bottomsColour: string;
  shoes: string;
  build: string;
  glassesStyle: string;
  glassesColour: string;
  earrings: string;
  necklace: string;
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
  { id: "#7FD6B4", label: "Mint", hex: "#7FD6B4" },
  { id: "#B9A3F0", label: "Lilac", hex: "#B9A3F0" },
  { id: "#E8C35A", label: "Mustard", hex: "#E8C35A" },
  { id: "#D9675F", label: "Brick", hex: "#D9675F" },
];

export const FACES: AvatarOption[] = [
  { id: "oval", label: "Oval" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "long", label: "Long" },
  { id: "heart", label: "Heart" },
  { id: "standard", label: "Soft" },
  { id: "strong", label: "Strong jaw" },
];

export const EYE_COLOURS: AvatarOption[] = [
  { id: "dark-brown", label: "Dark brown", hex: "#3A2418" },
  { id: "brown", label: "Brown", hex: "#5A3A24" },
  { id: "hazel", label: "Hazel", hex: "#7A5A2A" },
  { id: "green", label: "Green", hex: "#4A7A4A" },
  { id: "blue", label: "Blue", hex: "#3D6AA8" },
  { id: "grey", label: "Grey", hex: "#6A7480" },
];

export const SMILES: AvatarOption[] = [
  { id: "smile", label: "Smile" },
  { id: "grin", label: "Big grin" },
  { id: "half", label: "Half smile" },
  { id: "smirk", label: "Smirk" },
  { id: "flat", label: "Straight face" },
];

export const CHEEKS: AvatarOption[] = [
  { id: "none", label: "None" },
  { id: "rosy", label: "Rosy cheeks" },
];

export const FACIAL_HAIR: AvatarOption[] = [
  { id: "none", label: "None" },
  { id: "stubble", label: "Stubble" },
  { id: "moustache", label: "Moustache" },
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
  { id: "quiff", label: "Swept up" },
  { id: "curls-fringe", label: "Curls with a fringe" },
  { id: "long-behind", label: "Long, behind the shoulders" },
  { id: "cap-back", label: "Cap on backwards" },
];

/** Hair styles long enough to show dyed ends. */
export const LONG_HAIR = ["long-straight", "long-wavy", "long-behind", "braids", "locs"];
/** Hair styles that are a hat or a headscarf, coloured by headwearColour. */
export const HEADWEAR = ["hijab", "turban", "beanie", "cap-back"];

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
  { id: "light-brown", label: "Light brown", hex: "#8B6446" },
  { id: "platinum", label: "Platinum", hex: "#E3D9C0" },
  { id: "white", label: "White", hex: "#E9E7E2" },
  { id: "dyed-purple", label: "Dyed purple", hex: "#7A4CC6" },
  { id: "dyed-green", label: "Dyed green", hex: "#3FA66B" },
  { id: "dyed-teal", label: "Dyed teal", hex: "#1FB5A8" },
];

export const HAIR_ENDS: AvatarOption[] = [
  { id: "none", label: "None" },
  { id: "purple", label: "Purple", hex: "#7A4CC6" },
  { id: "blue", label: "Blue", hex: "#3B6FD8" },
  { id: "pink", label: "Pink", hex: "#E86FA8" },
  { id: "teal", label: "Teal", hex: "#1FB5A8" },
  { id: "blonde", label: "Blonde", hex: "#D9B26B" },
  { id: "red", label: "Red", hex: "#B5512E" },
];

export const BROWS: AvatarOption[] = [
  { id: "straight", label: "Straight" },
  { id: "arched", label: "Arched" },
  { id: "thick", label: "Thick" },
  { id: "fine", label: "Fine" },
  { id: "defined", label: "Defined" },
  { id: "bold", label: "Bold" },
];

export const TOPS: AvatarOption[] = [
  { id: "hoodie", label: "Hoodie" },
  { id: "jumper", label: "Jumper" },
  { id: "shirt", label: "Shirt" },
  { id: "jacket", label: "Jacket" },
  { id: "tee", label: "T-shirt" },
  { id: "overshirt", label: "Overshirt" },
  { id: "varsity", label: "Varsity jacket" },
];

/** Tops with a second colour: what's under the jacket, or a varsity jacket's sleeves. */
export const TWO_TONE_TOPS = ["jacket", "overshirt", "varsity"];

export const TOP_COLOURS: AvatarOption[] = [
  { id: "navy", label: "Navy", hex: "#22304F" },
  { id: "charcoal", label: "Charcoal", hex: "#33363D" },
  { id: "white", label: "White", hex: "#EDEFF2" },
  { id: "sun", label: "Sun", hex: "#FFB627" },
  { id: "teal", label: "Teal", hex: "#1FB5A8" },
  { id: "coral", label: "Coral", hex: "#FF7A6B" },
  { id: "green", label: "Green", hex: "#4CC36F" },
  { id: "violet", label: "Violet", hex: "#8C6BF2" },
  { id: "black", label: "Black", hex: "#1B1C21" },
  { id: "cream", label: "Cream", hex: "#E9E6DF" },
  { id: "grey", label: "Grey", hex: "#94979D" },
  { id: "maroon", label: "Maroon", hex: "#7A2E3A" },
  { id: "olive", label: "Olive", hex: "#5F7A4B" },
  { id: "sage", label: "Sage", hex: "#5F7A6B" },
  { id: "brown", label: "Brown", hex: "#6A4630" },
  { id: "mustard", label: "Mustard", hex: "#C99A2E" },
  { id: "sky", label: "Sky", hex: "#7FA6F0" },
  { id: "pink", label: "Pink", hex: "#E86FA8" },
  { id: "blue", label: "Blue", hex: "#3B6FD8" },
];

/** A hat's or scarf's colour: a shade of the top, or any top colour. */
export const HEADWEAR_COLOURS: AvatarOption[] = [{ id: "match", label: "A shade of my top" }, ...TOP_COLOURS];

export const BOTTOMS: AvatarOption[] = [
  { id: "jeans", label: "Jeans" },
  { id: "trousers", label: "Trousers" },
  { id: "shorts", label: "Shorts" },
  { id: "skirt", label: "Skirt" },
];

export const BOTTOMS_COLOURS: AvatarOption[] = [
  { id: "denim", label: "Denim", hex: "#4A5F86" },
  { id: "dark-denim", label: "Dark denim", hex: "#2E3A57" },
  { id: "light-denim", label: "Light denim", hex: "#7189B3" },
  { id: "black", label: "Black", hex: "#1C1C22" },
  { id: "charcoal", label: "Charcoal", hex: "#3B3E47" },
  { id: "navy", label: "Navy", hex: "#2C3A5A" },
  { id: "khaki", label: "Khaki", hex: "#B59A6A" },
  { id: "cream", label: "Cream", hex: "#E6DCCB" },
  { id: "brown", label: "Brown", hex: "#5A4030" },
  { id: "olive", label: "Olive", hex: "#55603F" },
  { id: "maroon", label: "Maroon", hex: "#6E2A34" },
];

export const SHOES: AvatarOption[] = [
  { id: "white", label: "White", hex: "#E6E2DA" },
  { id: "black", label: "Black", hex: "#2B2A2E" },
  { id: "cream", label: "Cream", hex: "#E6DCCB" },
  { id: "brown", label: "Brown", hex: "#6A4630" },
  { id: "red", label: "Red", hex: "#C0453A" },
  { id: "blue", label: "Blue", hex: "#3B6FD8" },
  { id: "green", label: "Green", hex: "#4CC36F" },
];

export const BUILDS: AvatarOption[] = [
  { id: "slim", label: "Slim" },
  { id: "regular", label: "Broad" },
];

export const GLASSES: AvatarOption[] = [
  { id: "none", label: "None" },
  { id: "round", label: "Round" },
  { id: "rect", label: "Square" },
];

export const FRAME_COLOURS: AvatarOption[] = [
  { id: "black", label: "Black", hex: "#121214" },
  { id: "tortoiseshell", label: "Tortoiseshell", hex: "#6A4026" },
  { id: "gold", label: "Gold", hex: "#C9A043" },
  { id: "silver", label: "Silver", hex: "#A7ACB4" },
  { id: "red", label: "Red", hex: "#B8433A" },
  { id: "blue", label: "Blue", hex: "#3B6FD8" },
];

export const JEWELLERY: AvatarOption[] = [
  { id: "none", label: "None" },
  { id: "gold", label: "Gold", hex: "#E8B440" },
  { id: "silver", label: "Silver", hex: "#C9CCD2" },
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
    eyes: "dark-brown",
    smile: "smile",
    cheeks: "none",
    facialHairStyle: "stubble",
    hairEnds: "none",
    headwearColour: "match",
    topColour2: "cream",
    bottoms: "jeans",
    bottomsColour: "denim",
    shoes: "white",
    build: "slim",
    glassesStyle: "round",
    glassesColour: "black",
    earrings: "none",
    necklace: "none",
  };
}

/** Reads whatever is saved: a human avatar as it is, anything older as the default. */
export function readAvatar(saved: unknown): AvatarLook {
  if (saved && typeof saved === "object" && (saved as { kind?: unknown }).kind === "human") return { ...defaultAvatar(), ...(saved as Partial<AvatarLook>), kind: "human" };
  return defaultAvatar();
}
