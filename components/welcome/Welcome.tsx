"use client";

// /welcome, for a new learner: their name, their avatar (REDESIGN-2.md 7.3), and whether they've
// written code before, which decides where they start: the first project, or the placement test.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { defaultAvatar, readAvatar, type AvatarLook } from "@/lib/avatar";
import type { ProfileRow } from "@/lib/store/types";
import { Button } from "../ui/Button";
import { AvatarCreator } from "./AvatarCreator";
import styles from "./Welcome.module.css";

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
    const last = profile.lastLocation;
    router.push(last ? `/job/${last.jobId}?step=${last.stepId}` : experience === "lots" ? "/placement" : "/job/shop-sign");
  };

  return (
    <div className={styles.welcome}>
      <header className={styles.head}>
        <h1 className={styles.title}>Before your first project</h1>
        <p className={styles.lede}>Your name, your avatar, and how much code you&apos;ve written. It takes a minute, and you can change all of it later in Settings.</p>
      </header>

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
        <AvatarCreator look={look} name={name} onChange={setLook} />
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
        <Button type="button" variant="primary" className={styles.submit} onClick={() => void start()} disabled={saving || !complete}>
          {saving ? "Saving" : "Save and start"}
        </Button>
        {!user && ready ? <p className={styles.hint}>You&apos;re not logged in, so this is saved on this device only.</p> : null}
      </div>
    </div>
  );
}
