"use client";

import type { ComponentProps } from "react";
import { moodOf } from "@/lib/mood";
import { useVisit } from "@/lib/useVisit";
import { useSpeaker } from "@/lib/useMe";
import { Speech } from "../art/Speech";

// A <Speech> whose gesture is this visit's: the kind the line asks for (a wave is a greeting, a
// point is explaining), in one of the speaker's many ways of doing it (lib/pixel/variety.ts),
// different from one visit to the next. For server pages, which can't choose per visit
// themselves (the 404, sign-up and log-in). `place` keeps one page's choice apart
// from another's. Until the visit's seed arrives (the server's render, and hydrating it), the
// line's own gesture is passed on as it is, so the page hydrates exactly as it was sent. When
// you're playing as the speaker, their stand-in says it (lib/playas.ts).
export function VisitSpeech({ place, ...props }: ComponentProps<typeof Speech> & { place: string }) {
  const visit = useVisit();
  const who = useSpeaker(props.who);
  const name = who === props.who ? props.name : who.charAt(0).toUpperCase() + who.slice(1);
  const small = !props.big && (props.size ?? 96) < 96;
  const gesture = visit ? moodOf(props.text, { face: props.face, gesture: props.gesture }, { who, seed: `${place}|${visit}`, small }).gesture : props.gesture;
  return <Speech {...props} who={who} name={name} gesture={gesture} />;
}
