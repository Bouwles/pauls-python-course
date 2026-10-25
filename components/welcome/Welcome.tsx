"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { defaultLook } from "@/lib/pixel/learner";
import type { CharacterLook, ProfileRow } from "@/lib/store/types";
import { Button } from "../ui/Button";
import { CharacterCreator } from "./CharacterCreator";
import styles from "./Welcome.module.css";

const EXPERIENCE: [NonNullable<ProfileRow["experience"]>, string, string][] = [
  ["none", "No, never", "Start at the beginning. Job 1 takes twenty minutes."],
  ["some", "A little", "Start at the beginning anyway. The early jobs go quickly if you know them."],
  ["lots", "Yes, quite a lot", "Take the placement test next: a few tasks per Act, and the Acts you pass open straight away. Review still covers them."],
];

export function Welcome() {
  const router = useRouter();
  const { profile, updateProfile, ready, user } = useSession();
  const [look, setLook] = useState<CharacterLook>(defaultLook());
  const [name, setName] = useState("");
  const [experience, setExperience] = useState<ProfileRow["experience"]>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (profile.character) setLook(profile.character);
    if (profile.displayName) setName(profile.displayName);
    if (profile.experience) setExperience(profile.experience);
  }, [ready, profile.character, profile.displayName, profile.experience]);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ character: look, displayName: name.trim().slice(0, 40), experience, onboarded: true });
    const last = profile.lastLocation;
    router.push(last ? `/job/${last.jobId}?step=${last.stepId}` : experience === "lots" ? "/placement" : "/job/shop-sign");
  };

  return (
    <form className={styles.welcome} onSubmit={start}>
      <header className={styles.head}>
        <h1 className={styles.title}>Who&apos;s taking the desk?</h1>
        <p className={styles.lede}>Moss doesn&apos;t mind who you are. He minds whether the till balances.</p>
      </header>
      <CharacterCreator look={look} onChange={setLook} />
      <div className={`frame-panel ${styles.rows}`}>
        <label className={styles.field}>
          <span className={styles.labelText}>What should Moss call you?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" required placeholder="A name, or a nickname" />
          <small className={styles.hint}>Shown on your desk and, only if you choose, on a public profile.</small>
        </label>
        <fieldset className={styles.experience}>
          <legend className={styles.labelText}>Have you written code before?</legend>
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
        </fieldset>
      </div>
      <div className={styles.go}>
        <Button type="submit" variant="primary" disabled={saving || !name.trim() || !experience}>
          {saving ? "Opening the workshop" : "Take the desk"}
        </Button>
        {!user && ready ? <p className={styles.hint}>You&apos;re not signed in, so this is saved on this device only.</p> : null}
      </div>
    </form>
  );
}
