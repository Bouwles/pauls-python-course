"use client";

// Settings: the account's connections beyond this browser: classes and teaching, the public
// profile, the command-line tool and GitHub.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { DEFAULT_SETTINGS } from "@/lib/store/types";
import { Button } from "../ui/Button";
import { Choice, Row, Section } from "./controls";
import styles from "./Settings.module.css";
import own from "./Elsewhere.module.css";

interface Token {
  id: string;
  label: string;
  createdAt: number;
  lastUsedAt: number | null;
}

export interface Flags {
  teacher: boolean;
  slug: string | null;
}

interface Membership {
  classId: string;
  name: string;
  joinedAt: number;
}

const day = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** The account's teacher switch and public address, from the server. */
export function useFlags(enabled: boolean) {
  const [flags, setFlags] = useState<Flags | null>(null);
  useEffect(() => {
    if (!enabled) return;
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : { teacher: false, slug: null }))
      .then((f: Flags) => setFlags(f))
      .catch(() => setFlags({ teacher: false, slug: null }));
  }, [enabled]);
  return [flags, setFlags] as const;
}

async function patchProfile(body: { teacher?: boolean; slug?: string | null }): Promise<{ flags?: Flags; error?: string }> {
  const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const out = (await res.json().catch(() => ({}))) as Flags & { error?: string };
  return res.ok ? { flags: out } : { error: out.error ?? "That didn't save." };
}

/** Command-line tools signed in with a device code. */
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
    <Row label="The command-line tool" hint={tokens.length === 0 ? "Not connected. The Take It Home projects explain how to set it up." : undefined} wide={tokens.length > 0}>
      {tokens.length ? (
        <ul className={styles.list} aria-label="Connected tools">
          {tokens.map((t) => (
            <li key={t.id}>
              <span>
                Connected {day(t.createdAt)}
                {t.lastUsedAt ? `, last used ${day(t.lastUsedAt)}` : ", not used yet"}.
              </span>
              <Button size="sm" variant="secondary" onClick={() => void fetch(`/api/tokens?id=${t.id}`, { method: "DELETE" }).then(load)}>
                Disconnect
              </Button>
            </li>
          ))}
        </ul>
      ) : undefined}
    </Row>
  );
}

/** GitHub, for pushing the Shelf to a repository (only when the site has a GitHub app). */
export function GitHubConnection() {
  const [status, setStatus] = useState<{ enabled: boolean; connected: boolean; login?: string | null } | null>(null);
  const load = () =>
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : { enabled: false, connected: false }))
      .then(setStatus)
      .catch(() => setStatus({ enabled: false, connected: false }));
  useEffect(() => void load(), []);
  if (!status?.enabled) return null;
  return (
    <Row label="GitHub" hint={status.connected ? `Connected${status.login ? ` as ${status.login}` : ""}, for pushing your Shelf to a repository.` : "Not connected. The Shelf offers it when you want to push your projects to GitHub."}>
      {status.connected ? (
        <Button size="sm" variant="secondary" onClick={() => void fetch("/api/github", { method: "DELETE" }).then(load)}>
          Disconnect
        </Button>
      ) : undefined}
    </Row>
  );
}

/** Classes this learner is in, joining with a code, and the teaching switch. */
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
    <Section id="s-classes" title="Classes and teaching" intro="If a teacher gave you a class code, join here. Your teacher can see your progress, test results, time and code for as long as you stay in the class.">
      <Row label="Class code" htmlFor="class-code" wide>
        <form className={own.joinRow} onSubmit={(e) => void join(e)}>
          <input
            id="class-code"
            className={own.code}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={9}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="ABC-DEF"
            aria-describedby={error ? "class-code-error" : undefined}
            aria-invalid={error ? true : undefined}
          />
          <Button type="submit" variant="secondary" disabled={busy || code.replace(/[\s-]/g, "").length !== 6}>
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
      </Row>
      {classes && classes.length ? (
        <Row label="Your classes" wide>
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
                    <Button size="sm" variant="secondary" onClick={() => setLeaving(null)}>
                      Stay
                    </Button>
                  </span>
                </li>
              ) : (
                <li key={m.classId}>
                  <span>
                    In <strong>{m.name}</strong> since {day(m.joinedAt)}.
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => setLeaving(m.classId)} aria-label={`Leave ${m.name}`}>
                    Leave
                  </Button>
                </li>
              ),
            )}
          </ul>
        </Row>
      ) : null}
      <Choice
        label="Teaching"
        name="teaching"
        value={flags.teacher ? "on" : "off"}
        options={[
          ["off", "No"],
          ["on", "I teach a class"],
        ]}
        onChange={(v) => {
          const on = v === "on";
          // Move the switch now; put it back if the server says no.
          onFlags({ ...flags, teacher: on });
          void patchProfile({ teacher: on }).then((r) => onFlags(r.flags ?? { ...flags, teacher: !on }));
        }}
        hint={flags.teacher ? undefined : "Teachers make classes, give out a code, and see the progress and code of each student who joins."}
      />
      {flags.teacher ? (
        <p className={styles.note}>
          <Link href="/teach">Your classes</Link>: make one, share its code, set projects and follow each student.
        </p>
      ) : null}
    </Section>
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
    <Section id="s-public" title="Privacy" intro="A public profile is a page anyone with the address can open. It shows your display name, your avatar, and the projects you've shipped. Nothing else: no code, no times, no email.">
      <Choice
        label="Public profile"
        name="public-profile"
        value={on ? "on" : "off"}
        options={[
          ["off", "Off"],
          ["on", "On"],
        ]}
        onChange={(v) => void toggle(v === "on")}
      />
      <Row label="Address" htmlFor="public-slug" hint="Lower-case words joined by hyphens, 3 to 30 characters." wide>
        <form className={own.joinRow} onSubmit={(e) => void save(e)}>
          <span className={own.address}>
            <span className={own.prefix} aria-hidden="true">
              /u/
            </span>
            <input
              id="public-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              maxLength={30}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={slug && !valid ? true : undefined}
            />
          </span>
          <Button type="submit" variant="secondary" disabled={!changed || (slug !== "" && !valid)}>
            {slug === "" && flags.slug ? "Remove address" : "Save address"}
          </Button>
        </form>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <p className={[styles.hint, own.status].join(" ")} role="status" aria-live="polite">
          {note ?? ""}
        </p>
        {on && url ? (
          <p className={styles.note}>
            Your page: <a href={url}>{url}</a>
          </p>
        ) : on ? (
          <p className={styles.note}>Choose an address to publish the page.</p>
        ) : url ? (
          <p className={styles.note}>Switch it on to publish the page at this address.</p>
        ) : null}
      </Row>
    </Section>
  );
}
