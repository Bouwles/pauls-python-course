"use client";

// Settings (REDESIGN-2.md 6, REDESIGN3_PLAN.md): sections with pixel headings, no frames inside
// frames. A list of the sections on the left on wide screens; on a phone the sections simply stack.
// The learner's pixel avatar heads the avatar section, and waves when they finish changing it.
// The credit line at the foot.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { readAvatar, type AvatarLook } from "@/lib/avatar";
import { useSession } from "@/lib/store/session";
import { DEFAULT_SETTINGS, TABLES, type Settings as SettingsData } from "@/lib/store/types";
import { download, zip } from "@/lib/export";
import { prefersReducedMotion } from "@/lib/display";
import { PixelPerson } from "../art/PixelPerson";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { Credit } from "../site/Credit";
import { AvatarCreator, describeAvatar } from "../welcome/AvatarCreator";
import { Choice, Row, Section } from "./controls";
import { Classes, ConnectedTools, GitHubConnection, PublicProfile, useFlags } from "./Elsewhere";
import { Billing } from "./Billing";
import styles from "./Settings.module.css";

const SECTIONS: [string, string, boolean][] = [
  ["s-account", "Account", false],
  ["s-avatar", "Your avatar", false],
  ["s-display", "Display", false],
  ["s-coach", "The coach", false],
  ["s-sound", "Sound", false],
  ["s-goals", "Goals", false],
  ["s-public", "Privacy", true],
  ["billing", "Billing", false],
  ["s-classes", "Classes and teaching", true],
  ["s-data", "Your data", false],
];

export function Settings() {
  const router = useRouter();
  const toast = useToast();
  const { profile, updateProfile, user, store, mode, signOut, ready } = useSession();
  const s = { ...DEFAULT_SETTINGS, ...profile.settings };
  const [name, setName] = useState(profile.displayName);
  const [look, setLook] = useState<AvatarLook>(readAvatar(profile.character));
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [waving, setWaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [flags, setFlags] = useFlags(Boolean(user));

  useEffect(() => {
    setName(profile.displayName);
    setLook(readAvatar(profile.character));
  }, [profile.displayName, profile.character]);

  const set = async (patch: Partial<SettingsData>) => {
    await updateProfile({ settings: { ...s, ...patch } });
    toast("Saved.");
  };

  if (!ready) return null;

  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>Settings</h1>
      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Settings sections">
          <ul>
            {SECTIONS.filter(([, , signedIn]) => !signedIn || user).map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sections}>
          <Section id="s-account" title="Account">
            {user ? (
              <>
                <Row label="Email" hint={mode === "local" ? "Running on the local development backend." : undefined}>
                  <span className={styles.value}>{user.email}</span>
                </Row>
                <Row label="Password">
                  <Button variant="secondary" aria-expanded={passwordOpen} aria-controls="password-form" onClick={() => setPasswordOpen((o) => !o)}>
                    Change password
                  </Button>
                </Row>
                {passwordOpen ? <PasswordForm onClose={() => setPasswordOpen(false)} /> : null}
                <Row label="This device" hint="Your work stays saved to your account.">
                  <Button variant="secondary" icon="signOut" onClick={() => void signOut()}>
                    Log out
                  </Button>
                </Row>
              </>
            ) : (
              <Row label="You're not logged in" hint="Your work is saved on this device only. An account keeps it safe and lets you carry on anywhere.">
                <Button variant="primary" onClick={() => router.push("/signup?keep=1")}>
                  Make an account
                </Button>
              </Row>
            )}
          </Section>

          <Section id="s-avatar" title="Your avatar">
            <div className={styles.you}>
              {/* While the creator is open, its large live avatar stands in for this one. */}
              {creatorOpen ? null : (
                <span className={`px-panel ${styles.youTile}`} style={{ background: look.colour }}>
                  <PixelPerson avatar={look} crop="bust" scale={2} expression={waving ? "pleased" : "neutral"} pose={waving ? "wave" : "idle"} label={name || profile.displayName ? `${name || profile.displayName}'s avatar` : "Your avatar"} />
                </span>
              )}
              <div className={styles.youText}>
                <p className={styles.youName}>{name || "No name yet"}</p>
                <p className={styles.hint}>{describeAvatar(look)}</p>
              </div>
              <Button
                variant="secondary"
                aria-expanded={creatorOpen}
                aria-controls="avatar-creator"
                onClick={() => {
                  if (creatorOpen) {
                    toast("Avatar saved.");
                    // Finished: the new avatar says hello.
                    if (!prefersReducedMotion()) {
                      setWaving(true);
                      setTimeout(() => setWaving(false), 2400);
                    }
                  }
                  setCreatorOpen((o) => !o);
                }}
                className={styles.youButton}
              >
                {creatorOpen ? "Done" : "Change your avatar"}
              </Button>
            </div>
            {creatorOpen ? (
              <div id="avatar-creator" className={`px-panel ${styles.creator}`}>
                <AvatarCreator
                  look={look}
                  name={name}
                  onChange={(l) => {
                    setLook(l);
                    void updateProfile({ character: l });
                  }}
                />
              </div>
            ) : null}
            <Row label="Display name" htmlFor="display-name" hint="Shown on your Shelf and, only if you choose, on your public profile.">
              <input
                id="display-name"
                className={styles.text}
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name.trim() && name !== profile.displayName && void updateProfile({ displayName: name.trim() }).then(() => toast("Saved."))}
              />
            </Row>
          </Section>

          <Section id="s-display" title="Display">
            <Choice label="Theme" value={s.theme} options={[["dark", "Dark"], ["light", "Light"], ["system", "Follow my device"]]} onChange={(v) => void set({ theme: v as SettingsData["theme"] })} />
            <Row label={`Code size: ${s.editorFontSize}px`} htmlFor="code-size" hint="Indents are always four spaces. Python reads indentation as structure, and one fixed width avoids errors you can't see." wide>
              <input id="code-size" className={styles.range} type="range" min={12} max={22} step={1} value={s.editorFontSize} onChange={(e) => void set({ editorFontSize: Number(e.target.value) })} />
              <pre className={`code-dark px-inset ${styles.sample}`} aria-hidden="true">
                <code style={{ fontSize: s.editorFontSize }}>
                  <span className={styles.synFn}>print</span>(<span className={styles.synStr}>&quot;Build it ugly first.&quot;</span>)
                </code>
              </pre>
            </Row>
            <Choice label="Easier reading" value={s.prose} options={[["serif", "Standard"], ["hyperlegible", "More spacing"]]} onChange={(v) => void set({ prose: v as SettingsData["prose"] })} hint="More room between lines, letters and words in lesson text." />
            <Choice label="Motion" value={s.motion} options={[["system", "Follow my device"], ["reduced", "Reduce motion"]]} onChange={(v) => void set({ motion: v as SettingsData["motion"] })} hint="Reduce motion stops the animations and transitions." />
          </Section>

          <Section id="s-coach" title="The coach">
            <Choice label="How much the coach says" name="dialogue" value={s.dialogue} options={[["full", "Full"], ["less", "Less talk"]]} onChange={(v) => void set({ dialogue: v as SettingsData["dialogue"] })} hint="With less talk, the coach only speaks for hints and errors." />
          </Section>

          <Section id="s-sound" title="Sound">
            <Choice label="Sound effects" name="sound" value={s.sound ? "on" : "off"} options={[["off", "Off"], ["on", "On"]]} onChange={(v) => void set({ sound: v === "on" })} hint="A soft key for Run and a stamp when you ship." />
          </Section>

          <Section id="s-goals" title="Goals">
            <Choice
              label="Daily goal"
              value={String(s.dailyGoalMinutes ?? "none")}
              options={[["none", "None"], ["15", "15 min"], ["30", "30 min"], ["60", "1 hour"], ["90", "90 min"]]}
              onChange={(v) => void set({ dailyGoalMinutes: v === "none" ? null : Number(v) })}
            />
            <Choice label="Streaks" value={s.streaks ? "on" : "off"} options={[["off", "Off"], ["on", "Show my streak"]]} onChange={(v) => void set({ streaks: v === "on" })} hint="Off unless you want it. Missing a day is never held against you." />
            {user ? (
              <Choice
                label="Email"
                value={s.weeklyEmail ? "on" : "off"}
                options={[["off", "Only account emails"], ["on", "A weekly note"]]}
                onChange={(v) => void set({ weeklyEmail: v === "on" })}
                hint="Three lines on a Monday: what you shipped and what's due for review. Nothing in a quiet week."
              />
            ) : null}
          </Section>

          {user && flags ? <PublicProfile flags={flags} onFlags={setFlags} /> : null}

          <Section id="billing" title="Billing">
            <Billing />
          </Section>

          {user && flags ? <Classes flags={flags} onFlags={setFlags} /> : null}

          <Section id="s-data" title="Your data">
            <Row label={user ? "Download all my data" : "Download my work"} hint="A zip of everything: your code for every step, your progress and your review deck.">
              <Button variant="secondary" icon="download" onClick={() => void exportEverything(store, Boolean(user))}>
                {user ? "Download all my data" : "Download my work"}
              </Button>
            </Row>
            {user ? <ConnectedTools /> : null}
            {user ? <GitHubConnection /> : null}
            {user ? (
              <Row label="Delete my account" hint="Removes your account, your code, your Shelf and your review deck. It can't be undone.">
                <DeleteAccount
                  expected={profile.displayName || user.email}
                  onDeleted={async () => {
                    if (store) await store.destroy();
                    router.push("/");
                    router.refresh();
                  }}
                />
              </Row>
            ) : null}
          </Section>

          <footer className={styles.foot}>
            <Credit />
          </footer>
        </div>
      </div>
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
      className={`px-panel ${styles.inline}`}
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
        <span className="label">Current password</span>
        <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span className="label">New password, at least 10 characters</span>
        <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} minLength={10} />
      </label>
      <div className={styles.buttons}>
        <Button type="submit" variant="primary" disabled={next.length < 10}>
          Change it
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
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
      <dialog ref={dialog} className={`float ${styles.dialog}`} aria-labelledby="del-title">
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
          <h2 id="del-title" className={styles.dialogTitle}>
            Delete your account
          </h2>
          <p>This removes your account, your code, your Shelf and your review deck from our database. It can&apos;t be undone. Download your data first if you want to keep it.</p>
          <label className={styles.field}>
            <span className="label">
              Type <strong className={styles.strong}>{expected}</strong> to confirm
            </span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.buttons}>
            <Button type="submit" variant="danger" disabled={typed.trim() !== expected.trim() || busy}>
              Delete everything
            </Button>
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
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
  const slug = BRAND.shortName.toLowerCase();
  files[`${slug}-data.json`] = JSON.stringify(data, null, 2);
  download(`${slug}-export.zip`, zip(files), "application/zip");
}
