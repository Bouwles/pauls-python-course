"use client";

// /welcome, "Who's playing?" (lib/playas.ts): the first screen for anyone new, guest or signed in.
// The six of the class stand on cards in their own colours, alive: one of them now and then shows
// off a move of their own, and whoever you point at does theirs. Pick one and you're them: you
// look like them, your name is theirs, their projects are your own, and you go straight to the
// Clocktower, with a cheer on the way. "Someone else" is the old welcome: your name, an avatar of
// your own, and whether you've written code before, which decides where you start.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { defaultAvatar, readAvatar, type AvatarLook } from "@/lib/avatar";
import { DEFAULT_SETTINGS, type ProfileRow } from "@/lib/store/types";
import { PROFESSOR, castColour } from "@/lib/cast";
import { prefersReducedMotion } from "@/lib/display";
import { useMedia } from "@/lib/useMedia";
import { moodOf } from "@/lib/mood";
import type { Expression } from "@/lib/pixel/people";
import { gestureOf } from "@/lib/pixel/gestures";
import { pickGesture } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import type { CastId } from "@/lib/playas";
import { PixelPerson } from "../art/PixelPerson";
import { Speech } from "../art/Speech";
import { Button } from "../ui/Button";
import { AvatarCreator } from "./AvatarCreator";
import { HaveASave } from "./HaveASave";
import { PLAYABLE, type Playable } from "./playable";
import styles from "./Welcome.module.css";

export function Welcome() {
  const [own, setOwn] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const switched = useRef(false);
  // Moving between the two, the new heading takes the focus, so a keyboard starts at the top.
  useEffect(() => {
    if (switched.current) heading.current?.focus();
  }, [own]);
  const go = (next: boolean) => {
    switched.current = true;
    setOwn(next);
    window.scrollTo({ top: 0 });
  };
  return own ? <OwnAvatar heading={heading} onBack={() => go(false)} /> : <WhoIsPlaying heading={heading} onSomeoneElse={() => go(true)} />;
}

// ---------------------------------------------------------------- who's playing?

/** One of them shows off now and then, so the room feels lived in; never two at once. */
function useShowingOff(on: boolean, skip: string | null): { id: CastId; move: string } | null {
  const [now, setNow] = useState<{ id: CastId; move: string } | null>(null);
  const skipRef = useRef(skip);
  skipRef.current = skip;
  useEffect(() => {
    if (!on || prefersReducedMotion()) return;
    let t: ReturnType<typeof setTimeout>;
    let last = "";
    const next = (wait: number) => {
      t = setTimeout(() => {
        const choices = PLAYABLE.filter((p) => p.id !== skipRef.current && p.id !== last);
        const p = choices[Math.floor(Math.random() * choices.length)]!;
        last = p.id;
        const move = p.moves[Math.floor(Math.random() * p.moves.length)]!;
        setNow({ id: p.id, move });
        const g = gestureOf(move);
        t = setTimeout(() => {
          setNow(null);
          next(1800 + Math.random() * 2600);
        }, Math.min(6000, Math.max(2600, g.beats * g.ms * 2)));
      }, wait);
    };
    next(1200);
    return () => clearTimeout(t);
  }, [on]);
  return now;
}

function WhoIsPlaying({ heading, onSomeoneElse }: { heading: React.RefObject<HTMLHeadingElement | null>; onSomeoneElse: () => void }) {
  const router = useRouter();
  const { profile, updateProfile, ready } = useSession();
  const [pointed, setPointed] = useState<CastId | null>(null);
  const [visits, setVisits] = useState(0);
  const [picked, setPicked] = useState<Playable | null>(null);
  const phone = useMedia("(max-width: 720px)");
  const visit = useVisit();
  const showing = useShowingOff(!picked, pointed);
  const yourOwn = readAvatar(profile.character);

  const point = (id: CastId | null) => {
    if (id && id !== pointed) setVisits((n) => n + 1);
    setPointed(id);
  };

  const pick = async (p: Playable) => {
    if (picked || !ready) return;
    setPicked(p);
    // You're them now: their name, their look (your own avatar is kept for later), straight in.
    await updateProfile({ settings: { ...DEFAULT_SETTINGS, ...profile.settings, playAs: p.id }, displayName: p.name, character: yourOwn, onboarded: true });
    if (!prefersReducedMotion()) await new Promise((r) => setTimeout(r, 1300));
    router.push("/");
  };

  /** How each of them looks right now: cheering when picked, showing off when pointed at, else at ease. */
  const look = (p: Playable): { face: Expression; pose: string } => {
    if (picked?.id === p.id) {
      const pose = pickGesture({ who: p.id, tags: ["celebrate"], face: "laughing", seed: `welcome-pick|${visit}`, mode: "moment" });
      return { face: gestureOf(pose).faces?.[0] ?? "laughing", pose };
    }
    if (picked) return { face: "pleased", pose: "idle" };
    const move = pointed === p.id ? p.moves[visits % p.moves.length]! : showing?.id === p.id ? showing.move : null;
    return move ? { face: gestureOf(move).faces?.[0] ?? "pleased", pose: move } : { face: "pleased", pose: "idle" };
  };

  return (
    <div className={styles.pick}>
      <header className={styles.head}>
        <h1 ref={heading} tabIndex={-1} className={styles.title}>
          Who&apos;s playing?
        </h1>
      </header>

      <ul className={styles.cast} aria-label="The class">
        {PLAYABLE.map((p) => {
          const m = look(p);
          const c = castColour(p.id);
          return (
            <li key={p.id} className={styles.slot}>
              {/* The card is clickable all over: its button reaches across it. */}
              <div className={styles.card} data-picked={picked?.id === p.id || undefined} data-dim={(picked && picked.id !== p.id) || undefined} onPointerEnter={() => point(p.id)} onPointerLeave={() => point(null)}>
                <span className={styles.tile} style={{ background: c.face }} aria-hidden="true">
                  <PixelPerson who={p.id} crop="bust" scale={phone ? 2 : 3} expression={m.face} pose={m.pose} />
                </span>
                <div className={styles.body}>
                  <h2 className={styles.name}>{p.name}</h2>
                  <p className={styles.about} id={`about-${p.id}`}>
                    {p.role}. {p.about}
                  </p>
                  {p.line ? (
                    <p className={styles.line} id={`line-${p.id}`}>
                      &ldquo;{p.line}&rdquo;
                    </p>
                  ) : null}
                  <button type="button" className={styles.play} aria-describedby={p.line ? `about-${p.id} line-${p.id}` : `about-${p.id}`} disabled={Boolean(picked)} onClick={() => void pick(p)} onFocus={() => point(p.id)} onBlur={() => point(null)}>
                    Play as {p.name}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        <li className={[styles.slot, styles.elseSlot].join(" ")}>
          <div className={[styles.card, styles.elseCard].join(" ")} data-dim={picked ? true : undefined}>
            <span className={[styles.tile, styles.elseTile].join(" ")} aria-hidden="true">
              <PixelPerson avatar={yourOwn} crop="bust" scale={2} expression="pleased" />
            </span>
            <div className={styles.body}>
              <h2 className={styles.name}>Someone else</h2>
              <p className={styles.about} id="about-else">
                Make your own.
              </p>
              <button type="button" className={styles.play} aria-describedby="about-else" disabled={Boolean(picked)} onClick={onSomeoneElse}>
                Play as someone else
              </button>
            </div>
          </div>
        </li>
      </ul>

      {/* Played before somewhere else: bring the save, and skip the choosing. */}
      <HaveASave disabled={Boolean(picked)} />

      <p className="visually-hidden" role="status">
        {picked ? `Playing as ${picked.name}. Off to the Clocktower.` : ""}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- someone else: your own avatar

// Paul says hello, then your name, your avatar (REDESIGN-2.md 7.3), and whether you've written
// code before, which decides where you start: the first project, or the placement test. The new
// avatar waves you off when you save. Paul's gesture and the avatar's goodbye are this visit's.

const HELLO = "Welcome to the Clocktower. Tell me what to call you, then make yourself an avatar. I'll find you a desk.";

const EXPERIENCE: [NonNullable<ProfileRow["experience"]>, string, string][] = [
  ["none", "No, never", "Start at the beginning. The first project takes about twenty minutes."],
  ["some", "A little", "Start at the beginning anyway. The early projects go quickly if you know them."],
  ["lots", "Yes, quite a lot", "Take the placement test next: a few tasks per Act, and the Acts you pass open straight away. Morning Rounds still covers them."],
];

function OwnAvatar({ heading, onBack }: { heading: React.RefObject<HTMLHeadingElement | null>; onBack: () => void }) {
  const router = useRouter();
  const { profile, updateProfile, ready, user } = useSession();
  const [look, setLook] = useState<AvatarLook>(defaultAvatar());
  const [name, setName] = useState("");
  const [experience, setExperience] = useState<ProfileRow["experience"]>(null);
  const [saving, setSaving] = useState(false);
  const loaded = useRef(false);
  const phone = useMedia("(max-width: 720px)");
  const visit = useVisit();
  const bye = pickGesture({ tags: ["bye", "greet"], seed: `welcome-bye|${visit}` });

  useEffect(() => {
    if (!ready || loaded.current) return;
    loaded.current = true;
    setLook(readAvatar(profile.character));
    // A cast member's name isn't yours: start blank if that's what's saved.
    if (profile.displayName && !PLAYABLE.some((p) => p.name === profile.displayName)) setName(profile.displayName);
    if (profile.experience) setExperience(profile.experience);
  }, [ready, profile.character, profile.displayName, profile.experience]);

  const complete = Boolean(name.trim() && experience);
  // Not a <form>: the avatar's tabs are buttons, and inside a form a tab would submit it.
  const start = async () => {
    if (!complete || saving) return;
    setSaving(true);
    await updateProfile({ character: look, displayName: name.trim().slice(0, 40), experience, onboarded: true, settings: { ...DEFAULT_SETTINGS, ...profile.settings, playAs: null } });
    // A wave goodbye from the avatar they've just made, then off to their desk.
    if (!prefersReducedMotion()) await new Promise((r) => setTimeout(r, 1100));
    const last = profile.lastLocation;
    router.push(last ? `/job/${last.jobId}?step=${last.stepId}` : experience === "lots" ? "/placement" : "/job/shop-sign");
  };

  return (
    <div className={styles.welcome}>
      <div>
        <Button variant="ghost" size="sm" icon="caretLeft" onClick={onBack} disabled={saving}>
          Back to the class
        </Button>
      </div>
      <header className={styles.head}>
        <h1 ref={heading} tabIndex={-1} className={styles.title}>
          Before your first project
        </h1>

      </header>

      <Speech
        who={PROFESSOR}
        name="Paul"
        text={HELLO}
        face="pleased"
        gesture={visit ? moodOf(HELLO, { face: "pleased", gesture: "wave" }, { who: PROFESSOR, seed: `welcome|${visit}`, small: phone }).gesture : "wave"}
        size={phone ? 72 : 108}
        className={styles.host}
      />

      <section className={styles.section} aria-labelledby="w-name">
        <h2 id="w-name" className={styles.h2}>
          Your name
        </h2>
        <label className={styles.field}>
          <span className="label">What should we call you?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" required aria-required="true" placeholder="A name, or a nickname" />
        </label>
      </section>

      <section className={styles.section} aria-labelledby="w-avatar">
        <h2 id="w-avatar" className={styles.h2}>
          Your avatar
        </h2>
        <AvatarCreator look={look} name={name} onChange={setLook} waving={saving} />
      </section>

      <section className={styles.section} aria-labelledby="w-experience">
        <fieldset className={styles.experience}>
          <legend id="w-experience" className={styles.h2}>
            Have you written code before?
          </legend>
          <div className={styles.options}>
            {EXPERIENCE.map(([value, label, note]) => (
              <label key={value} className={[styles.option, experience === value ? styles.on : ""].join(" ")}>
                <input type="radio" name="experience" value={value} checked={experience === value} onChange={() => setExperience(value)} className="visually-hidden" />
                <span className={styles.mark} aria-hidden="true" />
                <span className={styles.optionText}>
                  <strong>{label}</strong>
                  <span className={styles.note}>{note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <div className={styles.go}>
        {/* Their avatar, ready by the door: it waves when they save. */}
        <span className={`px-panel ${styles.ready}`} style={{ background: look.colour }} aria-hidden="true">
          <PixelPerson avatar={look} crop="bust" scale={2} expression={saving ? "pleased" : complete ? "pleased" : "neutral"} pose={saving ? bye : "idle"} />
        </span>
        <div className={styles.goText}>
          <Button type="button" variant="primary" className={styles.submit} onClick={() => void start()} disabled={saving || !complete}>
            {saving ? "Saving" : "Save and start"}
          </Button>
          {!user && ready ? <p className={styles.hint}>Saved in this browser.</p> : null}
        </div>
      </div>
    </div>
  );
}
