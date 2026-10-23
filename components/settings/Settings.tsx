"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { DEFAULT_SETTINGS, TABLES, type Settings as SettingsData } from "@/lib/store/types";
import { download, zip } from "@/lib/export";
import { defaultLook } from "@/lib/pixel/learner";
import { Button } from "../ui/Button";
import { CharacterCreator } from "../welcome/CharacterCreator";
import { useEarned } from "../world/useWorkshopExtras";
import { Elsewhere } from "./Elsewhere";
import styles from "./Settings.module.css";

export function Settings() {
  const router = useRouter();
  const { profile, updateProfile, user, store, mode, signOut, ready } = useSession();
  const s = { ...DEFAULT_SETTINGS, ...profile.settings };
  const [name, setName] = useState(profile.displayName);
  const [look, setLook] = useState(profile.character ?? defaultLook());
  const [saved, setSaved] = useState<string | null>(null);
  const earned = useEarned();

  useEffect(() => {
    setName(profile.displayName);
    if (profile.character) setLook(profile.character);
  }, [profile.displayName, profile.character]);

  const set = async (patch: Partial<SettingsData>, note = "Saved.") => {
    await updateProfile({ settings: { ...s, ...patch } });
    setSaved(note);
    setTimeout(() => setSaved(null), 1500);
  };

  if (!ready) return null;

  return (
    <div className={styles.settings}>
      <header>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.saved} role="status" aria-live="polite">
          {saved ?? " "}
        </p>
      </header>

      <section className={styles.section} aria-labelledby="s-you">
        <h2 id="s-you" className={styles.h2}>
          You
        </h2>
        <label className={styles.field}>
          <span>Display name</span>
          <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name !== profile.displayName && void updateProfile({ displayName: name.trim() }).then(() => setSaved("Saved."))} />
        </label>
        <details className={styles.character}>
          <summary>Change your character</summary>
          <CharacterCreator look={look} earned={earned} onChange={(l) => {
            setLook(l);
            void updateProfile({ character: l }).then(() => setSaved("Saved."));
          }} />
        </details>
      </section>

      <section className={styles.section} aria-labelledby="s-look">
        <h2 id="s-look" className={styles.h2}>
          Reading and display
        </h2>
        <Choice label="Theme" value={s.theme} options={[["system", "Follow my device"], ["light", "Day"], ["dark", "Night"]]} onChange={(v) => void set({ theme: v as SettingsData["theme"] })} />
        <Choice label="Lesson text" value={s.prose} options={[["serif", "Book serif"], ["hyperlegible", "Atkinson Hyperlegible, more spacing"]]} onChange={(v) => void set({ prose: v as SettingsData["prose"] })} />
        <Choice label="Motion" value={s.motion} options={[["system", "Follow my device"], ["reduced", "Reduce motion"]]} onChange={(v) => void set({ motion: v as SettingsData["motion"] })} hint="Reduced motion stops the rain, the idle animations and the transitions." />
        <label className={styles.field}>
          <span>Code size: {s.editorFontSize}px</span>
          <input type="range" min={12} max={22} step={1} value={s.editorFontSize} onChange={(e) => void set({ editorFontSize: Number(e.target.value) })} />
        </label>
        <p className={styles.hint}>Indents are always four spaces. Python reads indentation as structure, and one fixed width avoids errors you can&apos;t see.</p>
      </section>

      <section className={styles.section} aria-labelledby="s-talk">
        <h2 id="s-talk" className={styles.h2}>
          Talk and sound
        </h2>
        <Choice label="Dialogue" value={s.dialogue} options={[["full", "Full"], ["less", "Less talk: one line a job"]]} onChange={(v) => void set({ dialogue: v as SettingsData["dialogue"] })} />
        <Choice label="Sound" value={s.sound ? "on" : "off"} options={[["off", "Off"], ["on", "On: the shop bell, a key for Run, a stamp for Ship"]]} onChange={(v) => void set({ sound: v === "on" })} />
      </section>

      <section className={styles.section} aria-labelledby="s-pace">
        <h2 id="s-pace" className={styles.h2}>
          Pace
        </h2>
        <Choice
          label="Daily goal"
          value={String(s.dailyGoalMinutes ?? "none")}
          options={[["none", "None"], ["15", "15 minutes"], ["30", "30 minutes"], ["60", "An hour"], ["90", "An hour and a half"]]}
          onChange={(v) => void set({ dailyGoalMinutes: v === "none" ? null : Number(v) })}
        />
        <Choice label="Streaks" value={s.streaks ? "on" : "off"} options={[["off", "Off"], ["on", "Show my streak"]]} onChange={(v) => void set({ streaks: v === "on" })} hint="Off unless you want it. Missing a day is never held against you." />
        {user ? (
          <Choice
            label="Email"
            value={s.weeklyEmail ? "on" : "off"}
            options={[["off", "Only account emails"], ["on", "A weekly note from Moss"]]}
            onChange={(v) => void set({ weeklyEmail: v === "on" })}
            hint="Three lines on a Monday: what you shipped, what's due for review. Nothing else, and none at all in a quiet week."
          />
        ) : null}
      </section>

      {user ? <Elsewhere /> : null}

      <section className={styles.section} aria-labelledby="s-account">
        <h2 id="s-account" className={styles.h2}>
          Account
        </h2>
        {user ? (
          <>
            <p className={styles.meta}>Logged in as {user.email}.</p>
            <PasswordForm />
            <div className={styles.row}>
              <Button variant="secondary" onClick={() => void exportEverything(store, Boolean(user))}>
                Download all my data
              </Button>
              <Button variant="quiet" onClick={() => void signOut()}>
                Log out
              </Button>
            </div>
            <DeleteAccount expected={profile.displayName || user.email} onDeleted={async () => {
              if (store) await store.destroy();
              router.push("/");
              router.refresh();
            }} />
          </>
        ) : (
          <>
            <p className={styles.meta}>You&apos;re not logged in. Your work is saved on this device only.</p>
            <div className={styles.row}>
              <Button variant="primary" onClick={() => router.push("/signup?keep=1")}>
                Make an account
              </Button>
              <Button variant="secondary" onClick={() => void exportEverything(store, false)}>
                Download my work
              </Button>
            </div>
          </>
        )}
        {mode === "local" && user ? <p className={styles.hint}>Running on the local development backend.</p> : null}
      </section>
    </div>
  );
}

function Choice({ label, value, options, onChange, hint }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void; hint?: string }) {
  return (
    <fieldset className={styles.choice}>
      <legend>{label}</legend>
      <div className={styles.options}>
        {options.map(([v, text]) => (
          <label key={v} className={[styles.option, value === v ? styles.on : ""].join(" ")}>
            <input type="radio" name={label} value={v} checked={value === v} onChange={() => onChange(v)} />
            {text}
          </label>
        ))}
      </div>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </fieldset>
  );
}

function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  if (!open)
    return (
      <Button variant="quiet" size="sm" onClick={() => setOpen(true)}>
        Change password
      </Button>
    );
  return (
    <form
      className={styles.inline}
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current, next }) });
        const body = (await res.json()) as { error?: string };
        setMsg(res.ok ? "Password changed." : (body.error ?? "That didn't work."));
        if (res.ok) {
          setCurrent("");
          setNext("");
        }
      }}
    >
      <label className={styles.field}>
        <span>Current password</span>
        <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span>New password, at least 10 characters</span>
        <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} minLength={10} />
      </label>
      <Button type="submit" size="sm" variant="secondary" disabled={next.length < 10}>
        Change it
      </Button>
      {msg ? <p className={styles.hint} role="status">{msg}</p> : null}
    </form>
  );
}

function DeleteAccount({ expected, onDeleted }: { expected: string; onDeleted: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => dialog.current?.showModal()}>
        Delete my account
      </Button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="del-title">
        <form
          method="dialog"
          className={styles.dialogBody}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const res = await fetch("/api/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: typed }) });
            setBusy(false);
            if (res.ok) {
              dialog.current?.close();
              await onDeleted();
            } else setError(((await res.json()) as { error?: string }).error ?? "That didn't work.");
          }}
        >
          <h2 id="del-title" className={styles.h2}>
            Delete your account
          </h2>
          <p>This removes your account, your code, your Shelf and your review deck from our database. It can&apos;t be undone. Download your data first if you want to keep it.</p>
          <label className={styles.field}>
            <span>
              Type <strong>{expected}</strong> to confirm
            </span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div className={styles.row}>
            <Button type="submit" variant="danger" disabled={typed.trim() !== expected.trim() || busy}>
              Delete everything
            </Button>
            <Button type="button" variant="quiet" onClick={() => dialog.current?.close()}>
              Keep my account
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

async function exportEverything(store: ReturnType<typeof useSession>["store"], signedIn: boolean) {
  const files: Record<string, string> = {};
  let data: Record<string, unknown> = {};
  if (signedIn) {
    const res = await fetch("/api/export");
    if (res.ok) data = (await res.json()) as Record<string, unknown>;
  }
  if (store) {
    const local: Record<string, unknown> = {};
    for (const t of TABLES) local[t] = await store.all(t);
    if (!signedIn) data = { exportedAt: new Date().toISOString(), ...local };
    for (const c of (local.code_files as { jobId: string; stepId: string; filename: string; content: string }[]) ?? []) files[`code/${c.jobId}/${c.stepId}/${c.filename}`] = c.content;
  }
  files["pauls-python-course-data.json"] = JSON.stringify(data, null, 2);
  download("pauls-python-course-export.zip", zip(files), "application/zip");
}
