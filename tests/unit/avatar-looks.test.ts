import { describe, expect, it } from "vitest";
import { defaultAvatar, readAvatar, type AvatarLook } from "@/lib/avatar";
import { lookWire, readLook } from "@/lib/classes/link";
import { avatarToLook } from "@/lib/pixel/looks";
import { drawPerson } from "@/lib/pixel/people";
import { describeAvatar } from "@/components/welcome/AvatarCreator";

const dressedUp: AvatarLook = {
  ...defaultAvatar(),
  hair: "long-wavy",
  hairEnds: "teal",
  glasses: true,
  glassesStyle: "rect",
  glassesColour: "gold",
  earrings: "gold",
  necklace: "silver",
  top: "varsity",
  topColour: "maroon",
  topColour2: "cream",
  bottoms: "skirt",
  bottomsColour: "black",
  shoes: "red",
  cheeks: "rosy",
  eyes: "green",
  smile: "grin",
  build: "regular",
  facialHair: true,
  facialHairStyle: "moustache",
  headwearColour: "olive",
};

describe("the avatar's newer parts", () => {
  it("a save from before them reads as the defaults", () => {
    const old = { kind: "human", colour: "#1FB5A8", face: "round", skin: "s3", hair: "bob", hairColour: "red", brows: "thick", glasses: true, facialHair: false, top: "jacket", topColour: "teal", accessory: "cap" };
    const look = readAvatar(old);
    expect(look.hair).toBe("bob");
    expect(look.glassesStyle).toBe("round");
    expect(look.bottoms).toBe("jeans");
    expect(avatarToLook(old).glasses).toBe("round");
  });

  it("go into the drawing", () => {
    const p = avatarToLook(dressedUp);
    expect(p.glasses).toBe("rect");
    expect(p.glassesColour).toBe("#C9A043");
    expect(p.ends?.colour).toBe("#1FB5A8");
    expect(p.top).toMatchObject({ kind: "varsity", body: "#7A2E3A", sleeves: "#E9E6DF" });
    expect(p.legs).toMatchObject({ kind: "skirt", trousers: "#1C1C22", shoes: "#C0453A" });
    expect(p.moustache).toBe(true);
    expect(p.stubble).toBe(false);
    expect(p.build).toBe("regular");
    expect(p.fabric).toBe("#5F7A4B");
    expect(() => drawPerson(p)).not.toThrow();
  });

  it("travel in a link, and a link made before them still reads", () => {
    const wire = lookWire(dressedUp);
    expect(readLook(wire)).toEqual(dressedUp);
    const before = (wire as (string | number)[]).slice(0, 11);
    const read = readLook(before)!;
    expect(read.hair).toBe("long-wavy");
    expect(read.bottoms).toBe("jeans");
  });

  it("are said in words", () => {
    expect(describeAvatar(dressedUp)).toContain("dyed teal at the ends");
    expect(describeAvatar(dressedUp)).toContain("gold square glasses");
    expect(describeAvatar(dressedUp)).toContain("maroon varsity jacket with black skirt");
  });
});
