"use client";

// /welcome, for a new learner: Paul says hello, then their name, their avatar (REDESIGN-2.md 7.3),
// and whether they've written code before, which decides where they start: the first project, or
// the placement test. Their new avatar waves them off when they save. Paul's gesture and the
// avatar's goodbye are this visit's (lib/pixel/variety.ts).
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { defaultAvatar, readAvatar, type AvatarLook } from "@/lib/avatar";
import type { ProfileRow } from "@/lib/store/types";
import { PROFESSOR } from "@/lib/cast";
import { prefersReducedMotion } from "@/lib/display";
import { useMedia } from "@/lib/useMedia";
import { moodOf } from "@/lib/mood";
import { pickGesture } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import { PixelPerson } from "../art/PixelPerson";
import { Speech } from "../art/Speech";
import { Button } from "../ui/Button";
import { AvatarCreator } from "./AvatarCreator";
import styles from "./Welcome.module.css";

const HELLO = "Welcome to the Clocktower. Tell me what to call you, then make yourself an avatar. I'll find you a desk.";

const EXPERIENCE: [NonNullable<ProfileRow["experience"]>, string, string][] = [
  ["none", "No, never", "Start at the beginning. The first project takes about twenty minutes."],
  ["some", "A little", "Start at the beginning anyway. The early projects go quickly if you know them."],
  ["lots", "Yes, quite a lot", "Take the placement test next: a few tasks per Act, and the Acts you pass open straight away. Morning Rounds still covers them."],
];

export function Welcome() {
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
    if (profile.displayName) setName(profile.displayName);
    if (profile.experience) setExperience(profile.experience);
  }, [ready, profile.character, profile.displayName, profile.experience]);

  const complete = Boolean(name.trim() && experience);
  // Not a <form>: the avatar's tabs are buttons, and inside a form a tab would submit it.
  const start = async () => {
    if (!complete || saving) return;
    setSaving(true);
    await updateProfile({ character: look, displayName: name.trim().slice(0, 40), experience, onboarded: true });
    // A wave goodbye from the avatar they've just made, then off to their desk.
    if (!prefersReducedMotion()) await new Promise((r) => setTimeout(r, 1100));
    const last = profile.lastLocation;
    router.push(last ? `/job/${last.jobId}?step=${last.stepId}` : experience === "lots" ? "/placement" : "/job/shop-sign");
  };

  return (
    <div className={styles.welcome}>
      <header className={styles.head}>
        <h1 className={styles.title}>Before your first project</h1>
        <p className={styles.lede}>Your name, your avatar, and how much code you&apos;ve written. It takes a minute, and you can change all of it later in Settings.</p>
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
          <small className={styles.hint}>Shown on your Shelf and, only if you choose, on a public profile.</small>
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
          {!user && ready ? <p className={styles.hint}>You&apos;re not logged in, so this is saved on this device only.</p> : null}
        </div>
      </div>
    </div>
  );
}
