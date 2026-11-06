"use client";

import { pickGesture } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import { PixelPerson } from "../art/PixelPerson";

// The learner's avatar at the top of their public page, saying hello: a different greeting each
// visit (lib/pixel/variety.ts), from the everyday ones anyone can make.
export function PublicAvatar({ character, name }: { character: unknown; name: string }) {
  const visit = useVisit();
  const hello = pickGesture({ tags: ["greet"], seed: `u|${visit}|${name}`, mode: "talk" });
  return <PixelPerson avatar={character} crop="bust" scale={3} expression="pleased" pose={hello} label={`${name}'s avatar`} />;
}
