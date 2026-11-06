"use client";

// Settings (REDESIGN-2.md 6, REDESIGN3_PLAN.md): sections with pixel headings, no frames inside
// frames. A list of the sections on the left on wide screens; on a phone the sections simply stack.
// Who you're playing as comes first (lib/playas.ts): one of the class, or someone of your own.
// The learner's pixel avatar heads the avatar section, and waves when they finish changing it;
// playing as one of the class, it's them. Your save (lib/save) comes straight after the account:
// for anyone not logged in, and everyone on GitHub Pages, it's how work moves between browsers.
// The credit line at the foot.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readAvatar, type AvatarLook } from "@/lib/avatar";
import { useSession } from "@/lib/store/session";
import { DEFAULT_SETTINGS, type Settings as SettingsData } from "@/lib/store/types";
import { download, zip } from "@/lib/export";
import { prefersReducedMotion } from "@/lib/display";
import { pickGesture } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import { useMe } from "@/lib/useMe";
import { castColour } from "@/lib/cast";
import type { CastId } from "@/lib/playas";
import { PixelPerson } from "../art/PixelPerson";
import { PLAYABLE, playableOf } from "../welcome/playable";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { AvatarCreator, describeAvatar } from "../welcome/AvatarCreator";
import { Choice, Row, Section } from "./controls";
import { Classes, ConnectedTools, GitHubConnection, PublicProfile, useFlags } from "./Elsewhere";
import { BASE, STATIC } from "@/lib/static";
import { collectSave, deleteBrowserData } from "@/lib/save/browser";
import { exportFiles } from "@/lib/save/export";
import { YourSave } from "./YourSave";
import styles from "./Settings.module.css";

const SECTIONS: [string, string, boolean][] = [
  ["s-account", "Account", false],
  ["s-save", "Your save", false],
  ["s-playas", "Who you're playing as", false],
  ["s-avatar", "Your avatar", false],
  ["s-display", "Display", false],
  ["s-coach", "The coach", false],
  ["s-sound", "Sound", false],
  ["s-goals", "Goals", false],
  ["s-public", "Privacy", true],
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
  // The gesture the new avatar says hello with once it's saved: a different one every time.
  const [hello, setHello] = useState<string | null>(null);
  const hellos = useRef(0);
  const visit = useVisit();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [flags, setFlags] = useFlags(Boolean(user));
  const me = useMe();
  const playing = playableOf(me.playAs);

  /** Play as one of the class, or (null) as yourself. A name that was a cast member's follows the switch. */
  const playAs = async (id: CastId | null) => {
    const p = playableOf(id);
    const castName = !profile.displayName || PLAYABLE.some((c) => c.name === profile.displayName);
    await updateProfile({ settings: { ...s, playAs: id }, character: look, ...(p && castName ? { displayName: p.name } : {}) });
    toast(p ? `You're playing as ${p.name}.` : "You're playing as yourself.");
  };

  useEffect(() => {
    setName(profile.displayName);
    setLook(readAvatar(profile.character));
  }, [profile.displayName, profile.character]);

  // Arriving at a section ("download your save" after a Ship links to #s-save): the page only
  // draws once the session is ready, so the browser's own jump to it has nothing to land on.
  useEffect(() => {
    if (!ready || !window.location.hash) return;
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
  }, [ready]);

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
              <Row label="You're not logged in" hint="Your work is saved in this browser.">
                {STATIC ? null : (
                  <Button variant="secondary" onClick={() => router.push("/login")}>
                    Log in
                  </Button>
                )}
              </Row>
            )}
          </Section>

          <YourSave />

          <Section id="s-playas" title="Who you're playing as">
            <fieldset className={styles.playAs}>
              <legend className="visually-hidden">Who you&apos;re playing as</legend>
              <div className={styles.castGrid}>
                {[...PLAYABLE, null].map((p) => {
                  const id = p?.id ?? null;
                  const on = me.playAs === id;
                  return (
                    <label key={id ?? "own"} className={[styles.castTile, on ? styles.on : ""].join(" ")}>
                      <input type="radio" className="visually-hidden" name="play-as" value={id ?? "own"} checked={on} onChange={() => void playAs(id)} />
                      <span className={styles.castFace} style={{ background: p ? castColour(p.id).face : look.colour }} aria-hidden="true">
                        <PixelPerson who={p?.id} avatar={p ? undefined : look} crop="head" scale={2} animate={false} />
                      </span>
                      <span className={styles.castName}>{p ? p.name : "Your own avatar"}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </Section>

          <Section id="s-avatar" title="Your avatar">
            <div className={styles.you}>
              {/* While the creator is open, its large live avatar stands in for this one. */}
              {creatorOpen ? null : (
                <span className={`px-panel ${styles.youTile}`} style={{ background: me.colour }}>
                  <PixelPerson
                    who={me.who}
                    avatar={look}
                    crop="bust"
                    scale={2}
                    expression={hello ? "pleased" : "neutral"}
                    pose={hello ?? "idle"}
                    label={playing ? `${playing.name}, who you're playing as` : name || profile.displayName ? `${name || profile.displayName}'s avatar` : "Your avatar"}
                  />
                </span>
              )}
              <div className={styles.youText}>
                <p className={styles.youName}>{name || "No name yet"}</p>
                <p className={styles.hint}>{playing ? `You're playing as ${playing.name}.` : describeAvatar(look)}</p>
              </div>
              {playing ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    void playAs(null);
                    setCreatorOpen(true);
                  }}
                  className={styles.youButton}
                >
                  Use your own avatar
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  aria-expanded={creatorOpen}
                  aria-controls="avatar-creator"
                  onClick={() => {
                    if (creatorOpen) {
                      toast("Avatar saved.");
                      // Finished: the new avatar says hello.
                      if (!prefersReducedMotion()) {
                        hellos.current += 1;
                        setHello(pickGesture({ who: me.who, tags: ["greet", "celebrate"], seed: `settings|${visit}|${hellos.current}` }));
                        setTimeout(() => setHello(null), 2400);
                      }
                    }
                    setCreatorOpen((o) => !o);
                  }}
                  className={styles.youButton}
                >
                  {creatorOpen ? "Done" : "Change your avatar"}
                </Button>
              )}
            </div>
            {creatorOpen && !playing ? (
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
            <Row label="Display name" htmlFor="display-name" hint="Shown on your Shelf.">
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
            <Row label={`Code size: ${s.editorFontSize}px`} htmlFor="code-size" wide>
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
            <Choice label="Streaks" value={s.streaks ? "on" : "off"} options={[["off", "Off"], ["on", "Show my streak"]]} onChange={(v) => void set({ streaks: v === "on" })} hint="Missing a day doesn't count against you." />
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

          {user && flags ? <Classes flags={flags} onFlags={setFlags} /> : null}

          <Section id="s-data" title="Your data">
            <Row
              label="Download all my data"
              hint={user ? "Your code as files, and the rest as JSON." : "Your code as files, and the rest as JSON."}
            >
              <Button variant="secondary" icon="download" onClick={() => void exportEverything(store, Boolean(user))}>
                Download all my data
              </Button>
            </Row>
            {user ? <ConnectedTools /> : null}
            {user ? <GitHubConnection /> : null}
            {user ? null : (
              <Row label="Delete my data" hint="Clears everything from this browser. It can't be undone.">
                <DeleteData onDelete={() => deleteBrowserData(store)} />
              </Row>
            )}
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

/** Everything in this browser (and, logged in, the account's copy from /api/export) as a zip. */
async function exportEverything(store: ReturnType<typeof useSession>["store"], signedIn: boolean) {
  if (!store) return;
  const save = await collectSave(store);
  let server: Record<string, unknown> | null = null;
  // GitHub Pages has no server; without an account there's nothing on it to ask for.
  if (signedIn && !STATIC) {
    try {
      const res = await fetch("/api/export");
      if (res.ok) server = (await res.json()) as Record<string, unknown>;
    } catch {
      // Offline: what this browser holds is the next best thing.
    }
  }
  const { name, files } = exportFiles(save, server);
  download(name, zip(files), "application/zip");
}

/** Delete my data, when there's no account: everything in this browser, after asking. */
function DeleteData({ onDelete }: { onDelete: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => dialog.current?.showModal()}>
        Delete my data
      </Button>
      <dialog ref={dialog} className={`float ${styles.dialog}`} aria-labelledby="del-data-title">
        <form
          method="dialog"
          className={styles.dialogBody}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            await onDelete();
            // A fresh start: the course begins again at "Who's playing?".
            window.location.assign(`${BASE}/`);
          }}
        >
          <h2 id="del-data-title" className={styles.dialogTitle}>
            Delete everything in this browser
          </h2>
          <p>Your progress, your code, your review deck and your classes all go, and the course starts again at Who&apos;s playing. It can&apos;t be undone, so download your save first if you might want any of it.</p>
          <div className={styles.buttons}>
            <Button type="submit" variant="danger" disabled={busy}>
              {busy ? "Deleting" : "Delete everything"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()} disabled={busy}>
              Keep it
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
