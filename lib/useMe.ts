"use client";

// What to draw for "you", wherever you appear: the header, the learning screen's header, the
// Drills track, Settings. Playing as one of the class (lib/playas.ts), you look like them, on
// their colour, and their own signature moves come with them (pass `who` to pickGesture). As
// someone of your own, it's the avatar you made. Draw it with both:
//   const me = useMe();
//   <PixelPerson who={me.who} avatar={me.avatar} />
import { useMemo } from "react";
import { readAvatar, type AvatarLook } from "./avatar";
import { castColour } from "./cast";
import { playingAs, speakerOf, type CastId } from "./playas";
import { useSession } from "./store/session";
import type { ProfileRow } from "./store/types";

export interface Me {
  /** The cast id you're playing as, or null for someone of your own. */
  playAs: CastId | null;
  /** For PixelPerson, PixelFigure and pickGesture: the cast id when you're one of the class. */
  who: CastId | undefined;
  /** Your own avatar (lib/avatar.ts): what's drawn when `who` isn't set, and kept while you play as someone. */
  avatar: AvatarLook;
  /** The colour you stand on: your character's, or the one you chose. */
  colour: string;
  /** Your display name. */
  name: string;
}

export function meOf(profile: Pick<ProfileRow, "settings" | "character" | "displayName">): Me {
  const playAs = playingAs(profile.settings?.playAs);
  const avatar = readAvatar(profile.character);
  return { playAs, who: playAs ?? undefined, avatar, colour: playAs ? castColour(playAs).face : avatar.colour, name: profile.displayName };
}

/**
 * Who says a line written for `who` on a page of its own (the 404, the door, the placement test):
 * them, or their stand-in when you're playing as them. Until your profile loads, them.
 */
export function useSpeaker(who: string): string {
  const { profile, ready } = useSession();
  return ready ? speakerOf(who, profile.settings?.playAs) : who;
}

export function useMe(): Me {
  const { profile } = useSession();
  const { settings, character, displayName } = profile;
  return useMemo(() => meOf({ settings, character, displayName }), [settings, character, displayName]);
}
