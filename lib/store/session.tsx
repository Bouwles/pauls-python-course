"use client";

// Who is here, and where their work is kept.
// Guests get a local-only store. Signed-in learners get a store that syncs,
// and any guest progress on this device is moved into their account.
// Three backends: the local version's server (/api/auth, /api/sync); GitHub Pages with a Supabase
// project (ACCOUNTS), signed in and synced straight from the browser; GitHub Pages without one,
// where everyone is a guest.
import { BASE, STATIC } from "../static";
import { ACCOUNTS } from "../supabase/project";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LocalStore, databaseExists } from "./local";
import { SyncEngine, type SyncStatus, type SyncTransport } from "./sync";
import { blankProfile, getProfile, updateProfile as saveProfile } from "./progress";
import type { ProfileRow } from "./types";
import { applyDisplaySettings } from "../display";

export interface SessionUser {
  id: string;
  email: string;
}

interface SessionValue {
  ready: boolean;
  /** For a signed-in learner: the server's copy has been pulled at least once on this device. */
  synced: boolean;
  user: SessionUser | null;
  store: LocalStore | null;
  profile: ProfileRow;
  syncStatus: SyncStatus;
  mode: "local" | "supabase";
  oauth: ("google" | "github")[];
  /** GitHub Pages with accounts: the signed-in account's username, once known. */
  username: string | null;
  updateProfile: (patch: Partial<ProfileRow>) => Promise<void>;
  /** Re-check the session (after signing in) and move guest progress across. */
  refresh: () => Promise<SessionUser | null>;
  signOut: () => Promise<void>;
  flush: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/** The sync transport for a signed-in learner: Supabase on GitHub Pages, the server locally. */
async function transportFor(user: SessionUser): Promise<SyncTransport | undefined> {
  if (!ACCOUNTS) return undefined;
  const { supabaseTransport } = await import("../supabase/sync");
  return supabaseTransport(user.id);
}

const SIGNED_IN = "ppc-signed-in";

/**
 * A hint for the first paint only: whether this browser was signed in last time, so the home
 * page can hold off showing the landing page to someone who'll be shown their desk a moment later.
 */
export function wasSignedIn(): boolean {
  try {
    return localStorage.getItem(SIGNED_IN) === "1";
  } catch {
    return false;
  }
}

function rememberSignedIn(on: boolean) {
  try {
    if (on) localStorage.setItem(SIGNED_IN, "1");
    else localStorage.removeItem(SIGNED_IN);
  } catch {
    // Storage refused: the hint just isn't there.
  }
}

/** The first pull on a device decides what the learner sees, so give it a couple of tries. */
async function pullWithRetry(sync: SyncEngine, tries = 3): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    if (await sync.pull()) return true;
    await new Promise((r) => setTimeout(r, 600 * (i + 1)));
  }
  return false;
}

export function SessionProvider({ children, initialUser = null }: { children: React.ReactNode; initialUser?: SessionUser | null }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [store, setStore] = useState<LocalStore | null>(null);
  const [profile, setProfile] = useState<ProfileRow>(blankProfile());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [ready, setReady] = useState(false);
  const [synced, setSynced] = useState(false);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [oauth, setOauth] = useState<("google" | "github")[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const syncRef = useRef<SyncEngine | null>(null);
  const storeRef = useRef<LocalStore | null>(null);

  const attachSeq = useRef(0);

  // Settles once the attach that opened the current store has loaded its profile.
  const loadingRef = useRef<Promise<void> | null>(null);
  const attach = useCallback(async (next: SessionUser | null) => {
    const seq = ++attachSeq.current;
    const scope = next ? next.id : "guest";
    // Same person as before: keep the store (and anything subscribed to it). If the attach that
    // opened it is still loading the profile (React runs the first one twice in development),
    // wait for it: until the profile is in, nothing may decide this is a new player.
    if (storeRef.current && storeRef.current.scope === scope) {
      await loadingRef.current;
      if (next && syncRef.current) {
        if (await pullWithRetry(syncRef.current)) setSynced(true);
        void syncRef.current.flush();
      }
      setReady(true);
      return;
    }
    let loaded = () => {};
    loadingRef.current = new Promise<void>((resolve) => (loaded = resolve));
    syncRef.current?.stop();
    syncRef.current = null;
    const previous = storeRef.current;

    const s = new LocalStore(scope);
    if (next && (await databaseExists("guest"))) {
      const guest = previous?.scope === "guest" ? previous : new LocalStore("guest");
      const moved = await s.absorb(guest);
      await guest.destroy();
      if (moved > 0) await s.queueEverything();
    } else if (previous && previous.scope !== scope) {
      await previous.close();
    }
    if (seq !== attachSeq.current) {
      // A newer attach has taken over.
      await s.close();
      loaded();
      return;
    }
    storeRef.current = s;
    if (next) {
      const sync = new SyncEngine(s, await transportFor(next));
      syncRef.current = sync;
      sync.subscribe(setSyncStatus);
      // On a new device the profile only exists after this pull; until it succeeds,
      // nothing should decide the learner is new (see MapView's welcome redirect).
      setSynced(await pullWithRetry(sync));
      void sync.flush();
    } else {
      setSyncStatus("local");
      setSynced(false);
    }
    setStore(s);
    const p = await getProfile(s);
    setProfile(p);
    applyDisplaySettings(p.settings);
    s.subscribe("profile", () => void getProfile(s).then(setProfile));
    loaded();
    setReady(true);
  }, []);

  // One refresh at a time: logging in asks for one, and Supabase announcing the sign-in asks for
  // another a moment later. Run together, both would set up the account's store and move guest
  // progress into it at once, and trip over each other; one after the other, the second finds the
  // store already set up and only checks for anything new.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const refreshNow = useCallback(async (): Promise<SessionUser | null> => {
    // GitHub Pages with accounts: Supabase, from the browser.
    if (ACCOUNTS) {
      const { supabase } = await import("../supabase/client");
      const { data } = await supabase().auth.getSession();
      const u = data.session?.user;
      const next = u ? { id: u.id, email: u.email ?? "" } : null;
      setMode("supabase");
      // The username first, so pages that show it have it as soon as they draw.
      if (next) {
        const row = await supabase().from("profiles").select("username").eq("id", next.id).maybeSingle();
        setUsername((row.data?.username as string | undefined) ?? null);
      } else setUsername(null);
      setUser(next);
      rememberSignedIn(Boolean(next));
      await attach(next);
      return next;
    }
    // GitHub Pages: no server, so everyone is a guest with their progress in this browser.
    if (STATIC) {
      await attach(null);
      return null;
    }
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const body = (await res.json()) as { user: SessionUser | null; mode: "local" | "supabase"; oauth: ("google" | "github")[] };
    setMode(body.mode);
    setOauth(body.oauth);
    setUser(body.user);
    await attach(body.user);
    return body.user;
  }, [attach]);

  const refresh = useCallback(() => {
    const next = queue.current.then(refreshNow, refreshNow);
    queue.current = next.catch(() => null);
    return next;
  }, [refreshNow]);

  useEffect(() => {
    void refresh();
    // Signing in or out in another tab, or a session that ends, changes who is here.
    let unsubscribe = () => {};
    if (ACCOUNTS) {
      void import("../supabase/client").then(({ supabase }) => {
        const seen = { id: undefined as string | null | undefined };
        const { data } = supabase().auth.onAuthStateChange((_event, session) => {
          const id = session?.user.id ?? null;
          if (seen.id === undefined) {
            seen.id = id;
            return;
          }
          if (id === seen.id) return;
          seen.id = id;
          // Not inside the callback: supabase-js asks that its own calls wait until it returns.
          setTimeout(() => void refresh(), 0);
        });
        unsubscribe = () => data.subscription.unsubscribe();
      });
    }
    return () => {
      unsubscribe();
      syncRef.current?.stop();
    };
  }, [refresh]);

  const updateProfile = useCallback(async (patch: Partial<ProfileRow>) => {
    const s = storeRef.current;
    if (!s) return;
    const next = await saveProfile(s, patch);
    setProfile(next);
    if (patch.settings) applyDisplaySettings(next.settings);
  }, []);

  const flush = useCallback(async () => {
    await syncRef.current?.flush();
  }, []);

  const signOut = useCallback(async () => {
    await syncRef.current?.flush();
    syncRef.current?.stop();
    if (ACCOUNTS) {
      const { supabase } = await import("../supabase/client");
      await supabase().auth.signOut();
      rememberSignedIn(false);
    } else await fetch("/api/auth/logout", { method: "POST" });
    // Don't leave a learner's work on a shared computer.
    if (storeRef.current) await storeRef.current.destroy();
    storeRef.current = null;
    window.location.href = `${BASE}/`;
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ ready, synced, user, store, profile, syncStatus, mode, oauth, username, updateProfile, refresh, signOut, flush }),
    [ready, synced, user, store, profile, syncStatus, mode, oauth, username, updateProfile, refresh, signOut, flush],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession outside SessionProvider");
  return ctx;
}
