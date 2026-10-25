"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useSession } from "@/lib/store/session";
import { DEFAULT_SETTINGS, TABLES, type Settings as SettingsData } from "@/lib/store/types";
import { download, zip } from "@/lib/export";
import { defaultLook } from "@/lib/pixel/learner";
import { Button } from "../ui/Button";
import { Credit } from "../site/Credit";
import { CharacterCreator, describeLook } from "../welcome/CharacterCreator";
import { LearnerSprite } from "../world/LearnerSprite";
import { useEarned } from "../world/useWorkshopExtras";
import { Choice, Panel } from "./controls";
import { Elsewhere } from "./Elsewhere";
import { Billing } from "./Billing";
import styles from "./Settings.module.css";

export function Settings() {
  const router = useRouter();
  const { profile, updateProfile, user, store, mode, signOut, ready } = useSession();
  const s = { ...DEFAULT_SETTINGS, ...profile.settings };
  const [name, setName] = useState(profile.displayName);
  const [look, setLook] = useState(profile.character ?? defaultLook());
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
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
      <header className={styles.head}>
        <h1 className={styles.title}>Settings</h1>
        {/* A small toast in the corner, so the note shows wherever you are on the page. */}
        <p className={styles.saved} role="status" aria-live="polite">
          {saved ?? ""}
        </p>
      </header>

      <Panel id="s-account" title="Account">
        {user ? (
          <>
            <p className={styles.meta}>Logged in as {user.email}.</p>
            <div className={styles.row}>
              <Button variant="quiet" aria-expanded={passwordOpen} aria-controls="password-form" onClick={() => setPasswordOpen((o) => !o)}>
                Change password
              </Button>
              <Button variant="quiet" onClick={() => void exportEverything(store, Boolean(user))}>
                Download all my data
              </Button>
              <Button variant="quiet" onClick={() => void signOut()}>
                Log out
              </Button>
            </div>
            {passwordOpen ? <PasswordForm onClose={() => setPasswordOpen(false)} /> : null}
            <div className={styles.danger}>
              <DeleteAccount
                expected={profile.displayName || user.email}
                onDeleted={async () => {
                  if (store) await store.destroy();
                  router.push("/");
                  router.refresh();
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p className={styles.meta}>You&apos;re not logged in. Your work is saved on this device only.</p>
            <div className={styles.row}>
              <Button variant="primary" onClick={() => router.push("/signup?keep=1")}>
                Make an account
              </Button>
              <Button variant="quiet" onClick={() => void exportEverything(store, false)}>
                Download my work
              </Button>
            </div>
          </>
        )}
        {mode === "local" && user ? <p className={styles.hint}>Running on the local development backend.</p> : null}
      </Panel>

      <Panel id="s-character" title="Character">
        <div className={styles.you}>
          {!creatorOpen ? (
            <div className={styles.stage}>
              <LearnerSprite look={look} scale={3} label={describeLook(look)} />
            </div>
          ) : null}
          <div className={styles.youFields}>
            <label className={styles.field}>
              <span className={styles.legend}>Display name</span>
              <input
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name.trim() && name !== profile.displayName && void updateProfile({ displayName: name.trim() }).then(() => setSaved("Saved."))}
              />
            </label>
            {!creatorOpen ? <p className={styles.hint}>{describeLook(look)}</p> : null}
            <div className={styles.row}>
              <Button variant="quiet" aria-expanded={creatorOpen} aria-controls="character-creator" onClick={() => setCreatorOpen((o) => !o)}>
                {creatorOpen ? "Done" : "Change your character"}
              </Button>
            </div>
          </div>
        </div>
        {creatorOpen ? (
          <div id="character-creator" className={styles.creator}>
            <CharacterCreator
              look={look}
              earned={earned}
              onChange={(l) => {
                setLook(l);
                void updateProfile({ character: l }).then(() => setSaved("Saved."));
              }}
            />
          </div>
        ) : null}
      </Panel>

      <Panel id="s-display" title="Display">
        <Choice label="Theme" value={s.theme} options={[["dark", "Night"], ["light", "Day"], ["system", "Follow my device"]]} onChange={(v) => void set({ theme: v as SettingsData["theme"] })} />
        <Choice
          label="Lesson text"
          value={s.prose}
          options={[["serif", "Standard"], ["hyperlegible", "More spacing"]]}
          onChange={(v) => void set({ prose: v as SettingsData["prose"] })}
          hint="More spacing adds room between lines, letters and words."
        />
      </Panel>

      <Panel id="s-editor" title="Editor">
        <div className={styles.field}>
          <label className={styles.legend} htmlFor="code-size">
            Code size: {s.editorFontSize}px
          </label>
          <input id="code-size" className={styles.range} type="range" min={12} max={22} step={1} value={s.editorFontSize} onChange={(e) => void set({ editorFontSize: Number(e.target.value) })} />
        </div>
        <pre className={styles.sample} aria-hidden="true">
          <code>print(&quot;Open for repairs&quot;)</code>
        </pre>
        <p className={styles.hint}>Indents are always four spaces. Python reads indentation as structure, and one fixed width avoids errors you can&apos;t see.</p>
      </Panel>

      <Panel id="s-dialogue" title="Dialogue">
        <Choice hideLabel label="Dialogue" value={s.dialogue} options={[["full", "Full"], ["less", "Less talk"]]} onChange={(v) => void set({ dialogue: v as SettingsData["dialogue"] })} hint="Less talk keeps it to one line a job." />
      </Panel>

      <Panel id="s-sound" title="Sound">
        <Choice hideLabel label="Sound" value={s.sound ? "on" : "off"} options={[["off", "Off"], ["on", "On"]]} onChange={(v) => void set({ sound: v === "on" })} hint="The shop bell, a key for Run, a stamp for Ship." />
      </Panel>

      <Panel id="s-motion" title="Motion">
        <Choice hideLabel label="Motion" value={s.motion} options={[["system", "Follow my device"], ["reduced", "Reduce motion"]]} onChange={(v) => void set({ motion: v as SettingsData["motion"] })} hint="Reduced motion stops the rain, the idle animations and the transitions." />
      </Panel>

      <Panel id="s-pace" title="Pace">
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
      </Panel>

      {user ? <Elsewhere /> : null}

      <div id="billing">
        <Panel id="s-billing" title="Billing">
          <Billing />
        </Panel>
      </div>

      <footer className={styles.foot}>
        <Credit />
      </footer>
    </div>
  );
}

function PasswordForm({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      id="password-form"
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
        <span className={styles.legend}>Current password</span>
        <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span className={styles.legend}>New password, at least 10 characters</span>
        <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} minLength={10} />
      </label>
      <div className={styles.row}>
        <Button type="submit" variant="primary" disabled={next.length < 10}>
          Change it
        </Button>
        <Button type="button" variant="quiet" onClick={onClose}>
          Cancel
        </Button>
      </div>
      {msg ? (
        <p className={styles.hint} role="status">
          {msg}
        </p>
      ) : null}
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
      <dialog ref={dialog} className={["frame-panel", styles.dialog].join(" ")} aria-labelledby="del-title">
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
          <p className={styles.body}>This removes your account, your code, your Shelf and your review deck from our database. It can&apos;t be undone. Download your data first if you want to keep it.</p>
          <label className={styles.field}>
            <span className={styles.legend}>
              Type <strong>{expected}</strong> to confirm
            </span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
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
  const slug = BRAND.name.toLowerCase();
  files[`${slug}-data.json`] = JSON.stringify(data, null, 2);
  download(`${slug}-export.zip`, zip(files), "application/zip");
}
