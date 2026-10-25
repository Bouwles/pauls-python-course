"use client";

// Settings: the account's connections beyond this browser: classes, the public profile, the command-line tool.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { DEFAULT_SETTINGS } from "@/lib/store/types";
import { Button } from "../ui/Button";
import { Choice, Panel } from "./controls";
import styles from "./Settings.module.css";
import own from "./Elsewhere.module.css";

interface Token {
  id: string;
  label: string;
  createdAt: number;
  lastUsedAt: number | null;
}

const day = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Command-line tools signed in with a device code (Section 10.5). */
export function ConnectedTools() {
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const load = () =>
    fetch("/api/tokens")
      .then((r) => (r.ok ? r.json() : { tokens: [] }))
      .then((b: { tokens: Token[] }) => setTokens(b.tokens))
      .catch(() => setTokens([]));
  useEffect(() => void load(), []);
  if (tokens === null) return null;
  return (
    <div className={styles.field}>
      <span className={styles.legend}>The command-line tool</span>
      {tokens.length === 0 ? (
        <p className={styles.hint}>Not connected. Take It Home Jobs explain how to set it up.</p>
      ) : (
        <ul className={styles.list}>
          {tokens.map((t) => (
            <li key={t.id}>
              <span>
                Connected {day(t.createdAt)}
                {t.lastUsedAt ? `, last used ${day(t.lastUsedAt)}` : ", not used yet"}.
              </span>
              <Button
                size="sm"
                variant="quiet"
                onClick={() => void fetch(`/api/tokens?id=${t.id}`, { method: "DELETE" }).then(load)}
              >
                Disconnect
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Flags {
  teacher: boolean;
  slug: string | null;
}

interface Membership {
  classId: string;
  name: string;
  joinedAt: number;
}

async function patchProfile(body: { teacher?: boolean; slug?: string | null }): Promise<{ flags?: Flags; error?: string }> {
  const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const out = (await res.json().catch(() => ({}))) as Flags & { error?: string };
  return res.ok ? { flags: out } : { error: out.error ?? "That didn't save." };
}

/** A two-way setting, drawn like the others on the Settings page. */
function Switch({ label, name, on, labels, onChange, hint, hideLabel }: { label: string; name: string; on: boolean; labels: [string, string]; onChange: (on: boolean) => void; hint?: string; hideLabel?: boolean }) {
  return <Choice label={label} name={name} value={on ? "on" : "off"} options={[["off", labels[0]], ["on", labels[1]]]} onChange={(v) => onChange(v === "on")} hint={hint} hideLabel={hideLabel} />;
}

/** Classes this learner is in, joining with a code, and the teaching switch (Section 8.10). */
export function Classes({ flags, onFlags }: { flags: Flags; onFlags: (f: Flags) => void }) {
  const [classes, setClasses] = useState<Membership[] | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch("/api/classes")
      .then((r) => (r.ok ? r.json() : { classes: [] }))
      .then((b: { classes: Membership[] }) => setClasses(b.classes))
      .catch(() => setClasses([]));
  useEffect(() => void load(), []);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNote(null);
    const res = await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const body = (await res.json().catch(() => ({}))) as { class?: Membership; error?: string };
    setBusy(false);
    if (!res.ok || !body.class) return setError(body.error ?? "That didn't work.");
    setCode("");
    setNote(`Joined ${body.class.name}.`);
    void load();
  };

  const leave = async (m: Membership) => {
    const res = await fetch(`/api/classes?id=${m.classId}`, { method: "DELETE" });
    setLeaving(null);
    if (res.ok) setNote(`Left ${m.name}.`);
    void load();
  };

  return (
    <Panel id="s-classes" title="Classes">
      <p className={styles.hint}>If a teacher gave you a class code, join here. Your teacher can see your progress, test results, time and code for as long as you stay in the class.</p>
      <form className={own.joinRow} onSubmit={(e) => void join(e)}>
        <label className={styles.field}>
          <span className={styles.legend}>Class code</span>
          <input
            className={own.code}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={9}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-describedby={error ? "class-code-error" : undefined}
            aria-invalid={error ? true : undefined}
          />
        </label>
        <Button type="submit" variant="quiet" disabled={busy || code.replace(/[\s-]/g, "").length !== 6}>
          Join
        </Button>
      </form>
      {error ? (
        <p id="class-code-error" className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <p className={[styles.hint, own.status].join(" ")} role="status" aria-live="polite">
        {note ?? ""}
      </p>
      {classes && classes.length ? (
        <ul className={styles.list} aria-label="Your classes">
          {classes.map((m) =>
            leaving === m.classId ? (
              <li key={m.classId} className={own.confirm}>
                <span>
                  Leave <strong>{m.name}</strong>? Your teacher stops seeing your work. You can join again with the code.
                </span>
                <span className={own.buttons}>
                  <Button size="sm" variant="danger" onClick={() => void leave(m)}>
                    Leave the class
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => setLeaving(null)}>
                    Stay
                  </Button>
                </span>
              </li>
            ) : (
              <li key={m.classId}>
                <span>
                  In <strong>{m.name}</strong> since {day(m.joinedAt)}.
                </span>
                <Button size="sm" variant="quiet" onClick={() => setLeaving(m.classId)} aria-label={`Leave ${m.name}`}>
                  Leave
                </Button>
              </li>
            ),
          )}
        </ul>
      ) : null}
      <Switch
        label="Teaching"
        name="teaching"
        on={flags.teacher}
        labels={["No", "I teach a class"]}
        onChange={(on) => {
          // Move the switch now; put it back if the server says no.
          onFlags({ ...flags, teacher: on });
          void patchProfile({ teacher: on }).then((r) => onFlags(r.flags ?? { ...flags, teacher: !on }));
        }}
        hint={flags.teacher ? undefined : "Teachers make classes, give out a code, and see the progress and code of each student who joins."}
      />
      {flags.teacher ? (
        <p className={styles.meta}>
          <Link href="/teach">Your classes</Link>: make one, share its code, set Jobs and follow each student.
        </p>
      ) : null}
    </Panel>
  );
}

/** The opt-in page at /u/<address>. */
export function PublicProfile({ flags, onFlags }: { flags: Flags; onFlags: (f: Flags) => void }) {
  const { profile, updateProfile, flush } = useSession();
  const on = Boolean(profile.settings.publicProfile);
  const [slug, setSlug] = useState(flags.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => setSlug(flags.slug ?? ""), [flags.slug]);

  const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 30;
  const changed = slug !== (flags.slug ?? "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNote(null);
    const r = await patchProfile({ slug: slug || null });
    if (r.error) return setError(r.error);
    if (r.flags) onFlags(r.flags);
    setNote(slug ? "Address saved." : "Address removed.");
  };

  const toggle = async (next: boolean) => {
    await updateProfile({ settings: { ...DEFAULT_SETTINGS, ...profile.settings, publicProfile: next } });
    // Send it now, so the page appears (or goes) as soon as the switch changes.
    await flush();
  };

  const url = flags.slug ? `${origin}/u/${flags.slug}` : "";

  return (
    <Panel id="s-public" title="Public profile">
      <p className={styles.hint}>
        A page anyone with the address can open. It shows your display name, your character, and the Jobs you have shipped with their Shelf objects. Nothing else: no code, no times, no email.
      </p>
      <Switch hideLabel label="Public profile" name="public-profile" on={on} labels={["Off", "On"]} onChange={(v) => void toggle(v)} />
      <form className={own.joinRow} onSubmit={(e) => void save(e)}>
        <label className={styles.field}>
          <span className={styles.legend}>Address</span>
          <span className={own.address}>
            <span className={own.prefix} aria-hidden="true">
              /u/
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              maxLength={30}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby="slug-rule"
              aria-invalid={slug && !valid ? true : undefined}
            />
          </span>
        </label>
        <Button type="submit" variant="quiet" disabled={!changed || (slug !== "" && !valid)}>
          {slug === "" && flags.slug ? "Remove address" : "Save address"}
        </Button>
      </form>
      <p id="slug-rule" className={styles.hint}>
        Lower-case words joined by hyphens, 3 to 30 characters.
      </p>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <p className={[styles.hint, own.status].join(" ")} role="status" aria-live="polite">
        {note ?? ""}
      </p>
      {on && url ? (
        <p className={styles.meta}>
          Your page: <a href={url}>{url}</a>
        </p>
      ) : on ? (
        <p className={styles.meta}>Choose an address to publish the page.</p>
      ) : url ? (
        <p className={styles.meta}>Switch it on to publish the page at this address.</p>
      ) : null}
    </Panel>
  );
}

/** GitHub, for pushing the Shelf to a repository (only when the site has a GitHub app). */
function GitHubConnection() {
  const [status, setStatus] = useState<{ enabled: boolean; connected: boolean; login?: string | null } | null>(null);
  const load = () =>
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : { enabled: false, connected: false }))
      .then(setStatus)
      .catch(() => setStatus({ enabled: false, connected: false }));
  useEffect(() => void load(), []);
  if (!status?.enabled) return null;
  return (
    <div className={styles.field}>
      <span className={styles.legend}>GitHub</span>
      {status.connected ? (
        <ul className={styles.list}>
          <li>
            <span>Connected{status.login ? ` as ${status.login}` : ""}, for pushing your Shelf to a repository.</span>
            <Button size="sm" variant="quiet" onClick={() => void fetch("/api/github", { method: "DELETE" }).then(load)}>
              Disconnect
            </Button>
          </li>
        </ul>
      ) : (
        <p className={styles.hint}>Not connected. The Shelf offers it when you want to push your projects to GitHub.</p>
      )}
    </div>
  );
}

export function Elsewhere() {
  const [flags, setFlags] = useState<Flags | null>(null);
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : { teacher: false, slug: null }))
      .then((f: Flags) => setFlags(f))
      .catch(() => setFlags({ teacher: false, slug: null }));
  }, []);
  return (
    <>
      {flags ? <Classes flags={flags} onFlags={setFlags} /> : null}
      {flags ? <PublicProfile flags={flags} onFlags={setFlags} /> : null}
      <Panel id="s-elsewhere" title="Connections">
        <ConnectedTools />
        <GitHubConnection />
      </Panel>
    </>
  );
}
